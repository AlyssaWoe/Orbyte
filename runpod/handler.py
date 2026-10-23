"""
Orbyte RunPod Serverless Worker
===============================

The server-side half of the RunPod bridge. `backend/ai_engines/runpod_client.py`
calls this; nothing else does.

One worker, three tasks, dispatched on `input.task`:

    llm     text generation — Agent 4 reply understanding, Agent 5 drafting
    ocr     document text extraction — Agent 1 invoice/receipt ingestion
    health  capability report, so the app can decide whether to route here

Contract, request:

    {"input": {"task": "llm", "prompt": "...", "system_prompt": "...",
               "temperature": 0.2, "max_tokens": 800}}

    {"input": {"task": "ocr", "file_b64": "...", "filename": "invoice.pdf",
               "mime_type": "application/pdf"}}

Contract, response (RunPod places this under `output`):

    {"text": "...", "model": "...", "engine": "...", "latency_ms": 123, ...}

Three rules this worker obeys, because the rest of Orbyte depends on them:

1.  THIS WORKER IS A COMPUTE DEVICE, NOT A POLICY AUTHORITY.

    Every guardrail in Orbyte — the P0 date-vs-weekday conflict shield, the
    injection screen, the $4,000 approval gate, the central ledger — lives in
    the application. This worker generates text and extracts text. It does not
    adjudicate anything, and it must never be asked to. The application treats
    everything returned here as untrusted draft material and re-checks it
    against deterministic facts before a human sees it.

2.  DEGRADE LOUDLY, NEVER SILENTLY.

    If no GPU is attached, the model is still downloading, or an OCR backend is
    absent, the task returns `available: false` with a reason. It does not
    invent an answer. Orbyte's engines fall back to their deterministic path on
    `available: false`; an invented answer would poison that fallback silently.

3.  NO SECRETS IN, NO SECRETS OUT.

    The worker holds no RunPod credentials and no customer secrets. Prompts
    arrive already screened by the application. Text returned here is logged
    only as a length, never as content.
"""

import base64
import binascii
import io
import os
import time
import traceback
from typing import Any, Dict, List, Optional

import runpod

SERVICE = "orbyte-runpod-worker"
VERSION = "1.0.0"

# The model that `runpod_client.py` defaults to. Overridable per request and by
# env, so a smaller GPU can serve the same worker without a rebuild.
DEFAULT_MODEL = os.environ.get("MODEL_NAME", "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B")

# vLLM is far faster when it is installed and a GPU is present. It is optional:
# the worker runs correctly under plain transformers, just slower.
PREFER_VLLM = os.environ.get("USE_VLLM", "1") not in ("0", "false", "False")

# Hard ceilings. A serverless worker that accepts unbounded input is a worker
# that gets OOM-killed mid-job and bills you for the retry.
MAX_PROMPT_CHARS = int(os.environ.get("MAX_PROMPT_CHARS", "24000"))
MAX_FILE_BYTES = int(os.environ.get("MAX_FILE_BYTES", str(12 * 1024 * 1024)))
MAX_DEFAULT_TOKENS = int(os.environ.get("MAX_DEFAULT_TOKENS", "1024"))

_STARTED_AT = time.time()

# Loaded lazily and cached for the life of the container. Serverless workers are
# reused across jobs, so loading once at first request is the whole point of
# keeping a worker warm.
_llm: Optional[Dict[str, Any]] = None


# ---------------------------------------------------------------------------
# capability probes
# ---------------------------------------------------------------------------

def _torch():
    try:
        import torch  # noqa: F401
        return torch
    except Exception:
        return None


def gpu_report() -> Dict[str, Any]:
    torch = _torch()
    if torch is None:
        return {"available": False, "reason": "torch is not installed"}
    try:
        if not torch.cuda.is_available():
            return {"available": False, "reason": "no CUDA device is visible to this container"}
        idx = torch.cuda.current_device()
        props = torch.cuda.get_device_properties(idx)
        return {
            "available": True,
            "name": props.name,
            "memory_gb": round(props.total_memory / (1024 ** 3), 1),
            "count": torch.cuda.device_count(),
        }
    except Exception as exc:  # a broken driver must not crash the worker
        return {"available": False, "reason": f"CUDA probe failed: {exc}"}


def ocr_backends() -> Dict[str, Any]:
    """Which extraction engines this image actually has. Reported, not assumed."""
    found = {}

    try:
        import pypdf  # noqa: F401
        found["pypdf"] = True
    except Exception:
        found["pypdf"] = False

    try:
        import fitz  # noqa: F401  (PyMuPDF, used to rasterise scanned pages)
        found["pymupdf"] = True
    except Exception:
        found["pymupdf"] = False

    try:
        import pytesseract  # noqa: F401
        found["tesseract"] = True
    except Exception:
        found["tesseract"] = False

    try:
        import docling  # noqa: F401
        found["docling"] = True
    except Exception:
        found["docling"] = False

    return found


# ---------------------------------------------------------------------------
# llm
# ---------------------------------------------------------------------------

def _load_llm(model_name: str) -> Dict[str, Any]:
    """Load once per container. Returns a dict describing what is actually loaded."""
    global _llm
    if _llm is not None and _llm.get("model_name") == model_name:
        return _llm

    gpu = gpu_report()
    record: Dict[str, Any] = {"model_name": model_name, "loaded": False, "backend": None}

    if not gpu.get("available"):
        record["reason"] = gpu.get("reason", "no GPU")
        _llm = record
        return record

    if PREFER_VLLM:
        try:
            from vllm import LLM  # type: ignore

            started = time.time()
            engine = LLM(
                model=model_name,
                trust_remote_code=True,
                dtype="auto",
                # Leave room for the KV cache on a single-card serverless GPU.
                gpu_memory_utilization=float(os.environ.get("GPU_MEMORY_UTILIZATION", "0.90")),
                max_model_len=int(os.environ.get("MAX_MODEL_LEN", "8192")),
            )
            record.update({
                "backend": "vllm", "loaded": True, "engine": engine,
                "load_ms": int((time.time() - started) * 1000),
            })
            _llm = record
            return record
        except Exception as exc:
            # Fall through to transformers rather than failing the job: a slower
            # answer is better than no answer, as long as we say which one it was.
            record["vllm_error"] = str(exc)[:300]

    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer

        started = time.time()
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            trust_remote_code=True,
            torch_dtype="auto",
            device_map="auto",
        )
        model.eval()
        record.update({
            "backend": "transformers", "loaded": True,
            "engine": {"model": model, "tokenizer": tokenizer},
            "load_ms": int((time.time() - started) * 1000),
        })
    except Exception as exc:
        record["reason"] = f"model load failed: {exc}"
        record["trace"] = traceback.format_exc(limit=2)[-500:]

    _llm = record
    return record


def _build_prompt(system_prompt: str, prompt: str) -> str:
    """
    DeepSeek-R1 distills expect their own chat template. Where the tokenizer
    provides one we use it; otherwise we fall back to a plain labelled block,
    which these distills handle correctly.
    """
    parts = []
    if system_prompt:
        parts.append(f"System: {system_prompt}")
    parts.append(f"User: {prompt}")
    parts.append("Assistant:")
    return "\n\n".join(parts)


def task_llm(io_: Dict[str, Any]) -> Dict[str, Any]:
    started = time.time()
    prompt = str(io_.get("prompt") or "").strip()
    system_prompt = str(io_.get("system_prompt") or "").strip()
    model_name = str(io_.get("model") or DEFAULT_MODEL)

    if not prompt:
        return {"available": False, "reason": "prompt is empty", "task": "llm"}

    if len(prompt) > MAX_PROMPT_CHARS:
        return {
            "available": False,
            "reason": f"prompt is {len(prompt)} chars, over the {MAX_PROMPT_CHARS} ceiling",
            "task": "llm",
        }

    temperature = float(io_.get("temperature", 0.2))
    max_tokens = int(io_.get("max_tokens") or MAX_DEFAULT_TOKENS)
    max_tokens = max(1, min(max_tokens, MAX_DEFAULT_TOKENS * 4))

    record = _load_llm(model_name)
    if not record.get("loaded"):
        return {
            "available": False,
            "task": "llm",
            "model": model_name,
            "reason": record.get("reason") or "model not loaded",
            "detail": record.get("vllm_error"),
            "note": "Orbyte will use its deterministic engine for this step.",
        }

    text = ""
    finish_reason = "stop"
    usage: Dict[str, int] = {}

    if record["backend"] == "vllm":
        try:
            from vllm import SamplingParams

            engine = record["engine"]
            # vLLM applies the tokenizer's chat template when given messages.
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            params = SamplingParams(temperature=temperature, max_tokens=max_tokens)
            outs = engine.chat(messages, params)
            text = outs[0].outputs[0].text.strip()
            finish_reason = getattr(outs[0].outputs[0], "finish_reason", "stop") or "stop"
        except Exception as exc:
            return {
                "available": False, "task": "llm", "model": model_name,
                "reason": f"vLLM generation failed: {exc}",
                "note": "Orbyte will use its deterministic engine for this step.",
            }
    else:
        try:
            import torch

            engine = record["engine"]
            model, tokenizer = engine["model"], engine["tokenizer"]
            rendered = _build_prompt(system_prompt, prompt)
            if getattr(tokenizer, "chat_template", None):
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})
                rendered = tokenizer.apply_chat_template(
                    messages, tokenize=False, add_generation_prompt=True
                )
            inputs = tokenizer(rendered, return_tensors="pt").to(model.device)
            usage["prompt_tokens"] = int(inputs["input_ids"].shape[-1])
            with torch.no_grad():
                generated = model.generate(
                    **inputs,
                    max_new_tokens=max_tokens,
                    temperature=max(temperature, 1e-5),
                    do_sample=temperature > 0,
                    pad_token_id=tokenizer.eos_token_id,
                )
            new_tokens = generated[0][inputs["input_ids"].shape[-1]:]
            text = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
            usage["completion_tokens"] = int(new_tokens.shape[-1])
        except Exception as exc:
            return {
                "available": False, "task": "llm", "model": model_name,
                "reason": f"generation failed: {exc}",
                "note": "Orbyte will use its deterministic engine for this step.",
            }

    return {
        "available": True,
        "task": "llm",
        "text": text,
        "model": model_name,
        "engine": f"runpod-{record['backend']}",
        "finish_reason": finish_reason,
        "usage": usage,
        "latency_ms": int((time.time() - started) * 1000),
        # The application must still screen this. Stated in the payload so a
        # caller cannot pretend it was not told.
        "trust": "untrusted-draft — verify against deterministic facts before use",
    }


# ---------------------------------------------------------------------------
# ocr
# ---------------------------------------------------------------------------

def _decode_file(io_: Dict[str, Any]) -> Dict[str, Any]:
    # "key absent" and "key present but blank" are different bugs for the caller,
    # so they get different messages. Collapsing them makes a client that forgot
    # to encode look identical to one that sent a zero-byte file.
    if "file_b64" in io_:
        source, raw_b64 = "file_b64", io_.get("file_b64")
    elif "image_b64" in io_:
        source, raw_b64 = "image_b64", io_.get("image_b64")
    else:
        return {"ok": False, "reason": "no file_b64 or image_b64 supplied"}

    if not isinstance(raw_b64, str):
        return {"ok": False, "reason": f"{source} must be a base64-encoded string"}
    raw_b64 = raw_b64.strip()
    if not raw_b64:
        return {"ok": False, "reason": f"{source} was supplied but is empty"}

    if raw_b64.startswith("data:"):
        # Accept a data URL so a caller can paste one straight from the browser.
        _, _, raw_b64 = raw_b64.partition(",")
    try:
        blob = base64.b64decode(raw_b64, validate=False)
    except (binascii.Error, ValueError) as exc:
        return {"ok": False, "reason": f"{source} is not valid base64: {exc}"}
    if not blob:
        return {"ok": False, "reason": "decoded file is zero bytes"}
    if len(blob) > MAX_FILE_BYTES:
        return {
            "ok": False,
            "reason": f"file is {len(blob)} bytes, over the {MAX_FILE_BYTES} ceiling",
        }
    return {"ok": True, "blob": blob}


def _ocr_pdf(blob: bytes) -> Dict[str, Any]:
    pages: List[Dict[str, Any]] = []
    warnings: List[str] = []
    engine = None

    try:
        import pypdf

        reader = pypdf.PdfReader(io.BytesIO(blob))
        for idx, page in enumerate(reader.pages):
            try:
                text = (page.extract_text() or "").strip()
            except Exception as exc:
                warnings.append(f"page {idx + 1}: pypdf failed ({exc})")
                text = ""
            pages.append({"page": idx + 1, "text": text, "chars": len(text)})
        engine = "runpod-pypdf"
    except Exception as exc:
        warnings.append(f"pypdf could not open the PDF: {exc}")

    # A scanned invoice has no text layer, so pypdf legitimately returns nothing.
    # Rasterise and OCR those pages rather than reporting an empty document.
    if not any(p["text"] for p in pages):
        try:
            import fitz
            import pytesseract
            from PIL import Image

            raster_pages: List[Dict[str, Any]] = []
            with fitz.open(stream=blob, filetype="pdf") as doc:
                for idx, page in enumerate(doc):
                    pix = page.get_pixmap(dpi=int(os.environ.get("OCR_DPI", "200")))
                    img = Image.open(io.BytesIO(pix.tobytes("png")))
                    text = (pytesseract.image_to_string(img) or "").strip()
                    raster_pages.append({"page": idx + 1, "text": text, "chars": len(text)})
            if any(p["text"] for p in raster_pages):
                pages, engine = raster_pages, "runpod-pymupdf+tesseract"
                warnings.append("PDF had no text layer; pages were rasterised and OCR'd.")
            else:
                warnings.append("PDF was rasterised but OCR returned no text.")
        except ImportError as exc:
            warnings.append(
                f"PDF appears to be a scan and the rasterise/OCR path is unavailable ({exc}). "
                "Rebuild the image with pymupdf and tesseract to handle scans."
            )
        except Exception as exc:
            warnings.append(f"rasterise/OCR failed: {exc}")

    return {"pages": pages, "engine": engine, "warnings": warnings}


def _ocr_image(blob: bytes, filename: str) -> Dict[str, Any]:
    warnings: List[str] = []
    try:
        import pytesseract
        from PIL import Image
    except ImportError as exc:
        return {
            "pages": [],
            "engine": None,
            "warnings": [f"image OCR needs pytesseract and pillow, which are not both installed ({exc})."],
        }

    try:
        img = Image.open(io.BytesIO(blob))
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        text = (pytesseract.image_to_string(img) or "").strip()
        return {
            "pages": [{"page": 1, "text": text, "chars": len(text), "width": img.width, "height": img.height}],
            "engine": "runpod-tesseract",
            "warnings": warnings if text else warnings + [f"{filename}: OCR returned no text."],
        }
    except Exception as exc:
        return {"pages": [], "engine": None, "warnings": [f"image OCR failed: {exc}"]}


def task_ocr(io_: Dict[str, Any]) -> Dict[str, Any]:
    started = time.time()
    filename = str(io_.get("filename") or "").strip()
    mime = str(io_.get("mime_type") or "").strip().lower()

    decoded = _decode_file(io_)
    if not decoded.get("ok"):
        return {"available": False, "task": "ocr", "reason": decoded["reason"]}

    blob = decoded["blob"]
    ext = os.path.splitext(filename)[1].lower()

    if ext == ".pdf" or mime == "application/pdf":
        result = _ocr_pdf(blob)
    elif ext in (".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tif", ".tiff") or mime.startswith("image/"):
        result = _ocr_image(blob, filename or "image")
    else:
        # Unknown container: try it as a PDF, then as an image, then as plain text.
        result = {"pages": [], "engine": None, "warnings": [f"unrecognised extension '{ext or mime or 'none'}'; trying text"]}
        try:
            text = blob.decode("utf-8", errors="ignore").strip()
            if text:
                result = {"pages": [{"page": 1, "text": text, "chars": len(text)}], "engine": "runpod-plaintext", "warnings": []}
        except Exception:
            pass

    pages = result.get("pages") or []
    full_text = "\n\n".join(p["text"] for p in pages if p.get("text")).strip()
    backends = ocr_backends()

    available = bool(result.get("engine")) and bool(full_text)
    payload: Dict[str, Any] = {
        "available": available,
        "task": "ocr",
        "text": full_text,
        "pages": pages,
        "page_count": len(pages),
        "chars": len(full_text),
        "engine": result.get("engine"),
        "filename": filename or None,
        "bytes": len(blob),
        "backends": backends,
        "warnings": result.get("warnings") or [],
        "latency_ms": int((time.time() - started) * 1000),
        "trust": "untrusted-extract — validate every field before it reaches the ledger",
    }
    if not available:
        payload["reason"] = (
            "No text could be extracted. "
            + (payload["warnings"][0] if payload["warnings"] else "The document may be empty or corrupt.")
        )
    return payload


# ---------------------------------------------------------------------------
# health
# ---------------------------------------------------------------------------

def task_health(io_: Dict[str, Any]) -> Dict[str, Any]:
    model_name = str(io_.get("model") or DEFAULT_MODEL)
    record = _llm or {}
    return {
        "available": True,
        "task": "health",
        "status": "ready",
        "service": SERVICE,
        "version": VERSION,
        "tasks": ["llm", "ocr", "health"],
        "uptime_s": int(time.time() - _STARTED_AT),
        "gpu": gpu_report(),
        "llm": {
            "model": model_name,
            "loaded": bool(record.get("loaded")),
            "backend": record.get("backend"),
            # Stated plainly: the first llm job pays the load cost. A caller that
            # times out on a cold worker should retry, not fall back forever.
            "note": "The model loads on the first llm job. Cold starts are slow by design.",
        },
        "ocr": {"backends": ocr_backends()},
        "limits": {
            "max_prompt_chars": MAX_PROMPT_CHARS,
            "max_file_bytes": MAX_FILE_BYTES,
            "max_default_tokens": MAX_DEFAULT_TOKENS,
        },
    }


# ---------------------------------------------------------------------------
# entrypoint
# ---------------------------------------------------------------------------

TASKS = {"llm": task_llm, "ocr": task_ocr, "health": task_health}


def handler(event: Dict[str, Any]) -> Dict[str, Any]:
    """
    RunPod entrypoint. Never raises: a stack trace from a serverless worker is
    billed as a failed job with no diagnostics, so every path returns a payload
    the caller can act on.
    """
    started = time.time()
    body = event.get("input") if isinstance(event, dict) else None
    if not isinstance(body, dict):
        return {
            "available": False,
            "reason": "event.input must be an object",
            "received": type(body).__name__,
            "tasks": list(TASKS),
        }

    task = str(body.get("task") or "llm").strip().lower()
    fn = TASKS.get(task)
    if fn is None:
        return {
            "available": False,
            "reason": f"unknown task '{task}'",
            "tasks": list(TASKS),
        }

    try:
        result = fn(body)
    except Exception as exc:
        result = {
            "available": False,
            "task": task,
            "reason": f"{type(exc).__name__}: {exc}",
            "trace": traceback.format_exc(limit=3)[-800:],
        }

    result.setdefault("worker", SERVICE)
    result.setdefault("worker_version", VERSION)
    result["job_id"] = event.get("id") if isinstance(event, dict) else None
    result["total_ms"] = int((time.time() - started) * 1000)
    return result


if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})