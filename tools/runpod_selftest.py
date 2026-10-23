"""
Local harness for runpod/handler.py.

RunPod ships a CLI that does this (`runpod.serverless.start` with a test input),
but it needs a GPU image and network. This harness stubs the `runpod` module so
the dispatch logic, the failure paths and the payload contract can be exercised
on a laptop with no GPU and no RunPod account.

It asserts, it does not print-and-hope: a non-zero exit means the worker contract
is broken.

    python tools/runpod_selftest.py
"""

import base64
import importlib.util
import json
import os
import sys
import types

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
HANDLER_PATH = os.path.join(REPO_ROOT, "runpod", "handler.py")


def load_handler_module():
    """Import runpod/handler.py with a stubbed `runpod` package."""
    stub = types.ModuleType("runpod")
    stub.serverless = types.SimpleNamespace(start=lambda *_a, **_k: None)
    sys.modules.setdefault("runpod", stub)

    spec = importlib.util.spec_from_file_location("orbyte_runpod_handler", HANDLER_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


FAILURES = []


def check(label, condition, detail=""):
    if condition:
        print(f"  PASS  {label}")
    else:
        print(f"  FAIL  {label}{f' :: {detail}' if detail else ''}")
        FAILURES.append(label)


def main():
    h = load_handler_module()
    print(f"handler loaded from {HANDLER_PATH}")
    print(f"tasks declared: {sorted(h.TASKS)}\n")

    # ---------------------------------------------------------------- dispatch
    print("dispatch")
    r = h.handler({"id": "job-1", "input": {"task": "health"}})
    check("health returns available=True", r.get("available") is True, json.dumps(r)[:200])
    check("health lists all three tasks", set(r.get("tasks", [])) == {"llm", "ocr", "health"})
    check("health echoes the job id", r.get("job_id") == "job-1")
    check("health reports gpu probe", isinstance(r.get("gpu"), dict))
    check("health reports limits", isinstance(r.get("limits"), dict))

    r = h.handler({"input": {}})
    check("default task is llm, not a crash", r.get("task") == "llm", json.dumps(r)[:200])
    check("llm without a GPU is unavailable, not invented",
          r.get("available") is False and "text" not in r, json.dumps(r)[:200])

    r = h.handler({"input": {"task": "nonsense"}})
    check("unknown task is rejected clearly", r.get("available") is False and "unknown task" in str(r.get("reason")))
    check("unknown task lists valid tasks", set(r.get("tasks", [])) == {"llm", "ocr", "health"})

    r = h.handler({"input": "not-an-object"})
    check("non-object input is rejected, not raised", r.get("available") is False and "must be an object" in str(r.get("reason")))

    r = h.handler({})
    check("missing input key is rejected, not raised", r.get("available") is False)

    # ------------------------------------------------------------------- guards
    print("\nguards")
    r = h.handler({"input": {"task": "llm", "prompt": ""}})
    check("empty prompt refused", r.get("available") is False and "empty" in str(r.get("reason")))

    r = h.handler({"input": {"task": "llm", "prompt": "x" * (h.MAX_PROMPT_CHARS + 10)}})
    check("oversized prompt refused", r.get("available") is False and "over the" in str(r.get("reason")))

    r = h.handler({"input": {"task": "ocr"}})
    check("ocr with no file refused", r.get("available") is False and "no file_b64" in str(r.get("reason")))

    r = h.handler({"input": {"task": "ocr", "file_b64": "!!!not base64!!!"}})
    check("invalid base64 refused without raising", r.get("available") is False,
          json.dumps(r)[:200])

    r = h.handler({"input": {"task": "ocr", "file_b64": ""}})
    check("empty base64 refused", r.get("available") is False)

    oversized = base64.b64encode(b"0" * (h.MAX_FILE_BYTES + 512)).decode("ascii")
    r = h.handler({"input": {"task": "ocr", "file_b64": oversized, "filename": "big.pdf"}})
    check("oversized file refused", r.get("available") is False and "over the" in str(r.get("reason")))

    # ---------------------------------------------------------------------- ocr
    print("\nocr")
    text_blob = base64.b64encode(
        b"Invoice INV-2026-0042\nBill To: Apex Freight Sdn Bhd\nDue 2026-10-10\nTotal $4,850.00\n"
    ).decode("ascii")

    r = h.handler({"input": {"task": "ocr", "file_b64": text_blob, "filename": "inv.txt"}})
    check("unknown extension falls through to plaintext", r.get("available") is True, json.dumps(r)[:260])
    check("plaintext extraction returns the text", "INV-2026-0042" in (r.get("text") or ""))
    check("ocr carries the untrusted marker", "untrusted-extract" in str(r.get("trust")))
    check("ocr reports the backend map", isinstance(r.get("backends"), dict))
    check("ocr reports a page list", isinstance(r.get("pages"), list) and len(r["pages"]) == 1)

    r = h.handler({"input": {"task": "ocr", "file_b64": base64.b64encode(b"").decode(), "filename": "empty.txt"}})
    check("zero-byte file refused", r.get("available") is False and "empty" in str(r.get("reason")))

    # A PDF with no text layer and no rasteriser available must degrade, not lie.
    fake_pdf = base64.b64encode(b"%PDF-1.4\n% not a real pdf\n").decode("ascii")
    r = h.handler({"input": {"task": "ocr", "file_b64": fake_pdf, "filename": "scan.pdf"}})
    check("unreadable pdf reports unavailable, not empty success", r.get("available") is False,
          json.dumps(r)[:260])
    check("unreadable pdf explains itself", bool(r.get("reason")), json.dumps(r)[:200])
    check("unreadable pdf keeps warnings", isinstance(r.get("warnings"), list) and len(r["warnings"]) > 0)

    # --------------------------------------------------------------------- llm
    print("\nllm (no GPU attached -- this is the fallback path)")
    r = h.handler({"input": {"task": "llm", "prompt": "Draft a polite reminder for INV-2026-0042."}})
    check("llm degrades to available=False", r.get("available") is False, json.dumps(r)[:260])
    check("llm names the reason", bool(r.get("reason")), json.dumps(r)[:200])
    check("llm tells the caller to use the deterministic engine",
          "deterministic" in str(r.get("note", "")), json.dumps(r)[:260])
    check("llm returns no fabricated text", "text" not in r)

    # ------------------------------------------------------------------ envelope
    print("\nenvelope")
    r = h.handler({"input": {"task": "health"}})
    for key in ("worker", "worker_version", "job_id", "total_ms"):
        check(f"every response carries {key}", key in r)
    try:
        json.dumps(r)
        check("response is JSON-serialisable", True)
    except TypeError as exc:
        check("response is JSON-serialisable", False, str(exc))

    print()
    if FAILURES:
        print(f"{len(FAILURES)} check(s) failed:")
        for f in FAILURES:
            print(f"  - {f}")
        return 1
    print("all checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())