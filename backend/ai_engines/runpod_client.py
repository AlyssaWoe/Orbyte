"""
RunPod AI Endpoint Client
=========================

The client half of the RunPod bridge. It talks to the serverless worker in
`runpod/handler.py`.

What this replaces
------------------
The previous version POSTed an inference payload at `<endpoint>/health`, which is
not something a RunPod serverless endpoint accepts, and no engine ever called it,
so the bridge was inert. This version speaks the protocol RunPod actually serves
and is called by Agent 1 (OCR) and Agent 4 (semantic enrichment).

Protocol
--------
RunPod serverless exposes three routes per endpoint:

    POST /v2/<endpoint_id>/runsync   submit and block — used for short jobs
    POST /v2/<endpoint_id>/run       submit and return a job id
    GET  /v2/<endpoint_id>/status/<job_id>   poll a queued job
    GET  /v2/<endpoint_id>/health    worker fleet health

`runsync` covers most jobs but times out on a long generation, so a timeout here
falls back to `run` + polling rather than reporting failure. That matters at cold
start: a 14B model loading takes minutes, and the previous code turned that into
a hard error.

Design rules
------------
1.  Never raise into a caller. Every failure returns `success: False` with a
    reason, so the engines fall through to their deterministic path. A model
    outage must not take down payment follow-up.
2.  Never log or persist the API key outside the environment. `save_config()`
    refuses to write a key to a file that git can see.
3.  Never treat worker output as verified. Everything returned is a draft.
"""

import json
import os
import time
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import requests

# Kept for backwards compatibility with anything importing the old constant, but
# this path is inside the repo, so `save_config` will not write a key here.
_LEGACY_CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "database", "runpod_config.json")

DEFAULT_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B"
# A cold 14B worker can spend minutes loading weights before it answers.
DEFAULT_TIMEOUT = float(os.environ.get("RUNPOD_TIMEOUT", "180"))
POLL_INTERVAL = float(os.environ.get("RUNPOD_POLL_INTERVAL", "2.5"))

# Characters a UI uses to mask a stored key. The config modal prefills the field
# with a placeholder rather than the real key, so a "save" that leaves the field
# untouched would otherwise replace a working key with bullets. Written as
# escapes rather than literals so this file stays ASCII (see the worker's cp1252
# constraint) and cannot be mangled by an editor re-encoding it.
_MASK_CHARS = "\u2022\u25cf\u00b7*."


def _looks_masked(value: str) -> bool:
    """True when `value` is a UI placeholder rather than a real credential."""
    stripped = (value or "").strip()
    return len(stripped) >= 4 and all(ch in _MASK_CHARS for ch in stripped)


class RunPodClient:
    def __init__(self) -> None:
        # The API key lives in the environment and nowhere else. On Render it is a
        # secret env var; locally it comes from a gitignored .env.
        self.api_key = os.environ.get("RUNPOD_API_KEY", "").strip()
        self.endpoint_url = os.environ.get("RUNPOD_ENDPOINT_URL", "").strip()
        self.model_name = os.environ.get("RUNPOD_MODEL", DEFAULT_MODEL).strip()
        self.allow_config_file = os.environ.get("RUNPOD_ALLOW_CONFIG_FILE", "0") == "1"
        self._last_status: Dict[str, Any] = {}
        self.load_config()
        if self.endpoint_url and not self.api_key:
            print("Notice: RUNPOD_ENDPOINT_URL is set but RUNPOD_API_KEY is missing; endpoint calls will fail auth.")

    # ------------------------------------------------------------------ config

    @property
    def endpoint_id(self) -> str:
        """RunPod endpoint ids are the last path segment of the endpoint URL."""
        if not self.endpoint_url:
            return ""
        path = urlparse(self.endpoint_url).path.rstrip("/")
        tail = path.rsplit("/", 1)[-1] if path else ""
        return tail if tail and tail not in ("run", "runsync") else ""

    def api_base(self) -> str:
        """
        Normalise whatever the operator pasted into a usable API base.

        They may have pasted the console URL, the /run URL, or the bare id. All
        three appear in RunPod's own docs, so all three are accepted.
        """
        raw = (self.endpoint_url or "").strip().rstrip("/")
        if not raw:
            return ""
        if not raw.startswith(("http://", "https://")):
            return f"https://api.runpod.ai/v2/{raw}"
        parsed = urlparse(raw)
        head, _, tail = parsed.path.rstrip("/").rpartition("/")
        if tail in ("run", "runsync", "health") or tail.startswith("status"):
            return f"{parsed.scheme}://{parsed.netloc}{head}"
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

    def is_configured(self) -> bool:
        return bool(self.endpoint_url and self.api_key)

    def configuration(self) -> Dict[str, Any]:
        return {
            "configured": self.is_configured(),
            "endpoint_url": self.endpoint_url,
            "endpoint_id": self.endpoint_id,
            "has_api_key": bool(self.api_key),
            "model_name": self.model_name,
            "api_base": self.api_base(),
            "timeout_s": DEFAULT_TIMEOUT,
        }

    def load_config(self) -> None:
        """
        Optionally read model/URL from the legacy JSON file.

        Only honoured when RUNPOD_ALLOW_CONFIG_FILE=1, and an API key in that file
        is ignored outright — the file sits in a tracked directory, so a key there
        is a key in git history.
        """
        if not self.allow_config_file or not os.path.exists(_LEGACY_CONFIG_FILE):
            return
        try:
            with open(_LEGACY_CONFIG_FILE, "r", encoding="utf-8") as fh:
                cfg = json.load(fh)
            self.endpoint_url = self.endpoint_url or str(cfg.get("endpoint_url", "")).strip()
            self.model_name = str(cfg.get("model_name", "")).strip() or self.model_name
            if cfg.get("api_key") and not self.api_key:
                print("Notice: an api_key in runpod_config.json was ignored; set RUNPOD_API_KEY instead.")
        except Exception as exc:
            print(f"Notice: runpod_config.json could not be read: {exc}")

    def save_config(self, endpoint_url: str, api_key: str, model_name: str = "") -> Dict[str, Any]:
        """
        Apply endpoint config for this process only.

        The old version wrote the key to backend/database/runpod_config.json,
        which is a tracked directory — saving a key there meant committing it.
        The key is now held in memory for the life of the process and reported
        back as `persisted: false` so the operator knows to set the env var.

        A masked placeholder is ignored rather than applied. The config modal
        prefills the key field with bullets, so honouring that value would
        replace a working key with a string of dots and lock the endpoint out
        until the process restarted.
        """
        self.endpoint_url = (endpoint_url or "").strip()
        key_updated = False
        if api_key and not _looks_masked(api_key):
            self.api_key = api_key.strip()
            key_updated = True
        if model_name:
            self.model_name = model_name.strip()
        return {
            "applied": True,
            "persisted": False,
            "endpoint_url": self.endpoint_url,
            "endpoint_id": self.endpoint_id,
            "has_api_key": bool(self.api_key),
            "api_key_updated": key_updated,
            "model_name": self.model_name,
            "note": (
                "Applied to this process. It is not written to disk: set "
                "RUNPOD_ENDPOINT_URL and RUNPOD_API_KEY in the environment so it "
                "survives a restart and never lands in git."
            ),
        }

    # ------------------------------------------------------------------- http

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _post(self, path: str, payload: Dict[str, Any], timeout: float) -> Dict[str, Any]:
        url = f"{self.api_base()}/{path.lstrip('/')}"
        try:
            resp = requests.post(url, json=payload, headers=self._headers(), timeout=timeout)
        except requests.exceptions.Timeout:
            return {"ok": False, "kind": "timeout", "message": f"no response within {timeout}s", "url": url}
        except requests.exceptions.RequestException as exc:
            return {"ok": False, "kind": "unreachable", "message": f"{type(exc).__name__}: {exc}", "url": url}

        if resp.status_code in (401, 403):
            return {"ok": False, "kind": "auth", "status": resp.status_code, "message": "RunPod rejected the API key.", "url": url}
        if resp.status_code == 404:
            return {"ok": False, "kind": "not_found", "status": 404, "message": "Endpoint id not found. Check RUNPOD_ENDPOINT_URL.", "url": url}
        if resp.status_code == 429:
            return {"ok": False, "kind": "rate_limited", "status": 429, "message": "RunPod rate limit reached.", "url": url}
        if resp.status_code >= 400:
            return {"ok": False, "kind": "http", "status": resp.status_code, "message": resp.text[:300], "url": url}

        try:
            return {"ok": True, "json": resp.json()}
        except ValueError:
            return {"ok": False, "kind": "bad_json", "status": resp.status_code, "message": resp.text[:300], "url": url}

    def _get(self, path: str, timeout: float) -> Dict[str, Any]:
        url = f"{self.api_base()}/{path.lstrip('/')}"
        try:
            resp = requests.get(url, headers=self._headers(), timeout=timeout)
            if resp.status_code >= 400:
                return {"ok": False, "kind": "http", "status": resp.status_code, "message": resp.text[:300], "url": url}
            return {"ok": True, "json": resp.json()}
        except Exception as exc:
            return {"ok": False, "kind": "unreachable", "message": f"{type(exc).__name__}: {exc}", "url": url}

    # ------------------------------------------------------------- job submit

    def _unwrap(self, body: Dict[str, Any]) -> Dict[str, Any]:
        """
        Pull the worker's payload out of the RunPod envelope.

        RunPod wraps the handler's return value as {"output": ...}. A failed job
        puts a message in "error" instead, and a job that is still running has no
        output at all — reporting those as success would be a lie.
        """
        status = str(body.get("status", "")).upper()
        if status in ("FAILED", "CANCELLED", "TIMED_OUT"):
            return {"ok": False, "kind": "job_failed", "status": status,
                    "message": str(body.get("error") or body.get("output") or status)[:300]}
        if status in ("IN_QUEUE", "IN_PROGRESS", "RUNNING"):
            return {"ok": False, "kind": "pending", "status": status, "job_id": body.get("id")}
        if "output" not in body:
            return {"ok": False, "kind": "no_output", "status": status or "UNKNOWN",
                    "message": "RunPod returned no output field.", "raw": json.dumps(body)[:300]}
        output = body["output"]
        if isinstance(output, dict) and output.get("available") is False:
            # The worker answered honestly that it could not do the job. Surface
            # that as a distinct kind so callers fall back rather than retry.
            return {"ok": False, "kind": "unavailable", "status": status or "COMPLETED",
                    "message": str(output.get("reason") or "worker reported unavailable"), "output": output}
        return {"ok": True, "status": status or "COMPLETED", "output": output, "job_id": body.get("id"),
                "execution_ms": body.get("executionTime")}

    def _poll(self, job_id: str, deadline: float) -> Dict[str, Any]:
        while time.time() < deadline:
            time.sleep(POLL_INTERVAL)
            got = self._get(f"status/{job_id}", timeout=20.0)
            if not got["ok"]:
                return got
            body = got["json"]
            status = str(body.get("status", "")).upper()
            if status in ("COMPLETED", "FAILED", "CANCELLED", "TIMED_OUT"):
                return self._unwrap(body)
        return {"ok": False, "kind": "timeout", "job_id": job_id,
                "message": f"job {job_id} was still queued after {int(DEFAULT_TIMEOUT)}s"}

    def submit(self, task: str, payload: Dict[str, Any], timeout: Optional[float] = None) -> Dict[str, Any]:
        """
        Run one job. `runsync` first; on timeout, fall back to `run` + polling so a
        cold model load is not mistaken for an outage.
        """
        if not self.is_configured():
            return {"success": False, "mode": "local", "reason": "not_configured",
                    "detail": "Set RUNPOD_ENDPOINT_URL and RUNPOD_API_KEY to enable the endpoint."}

        budget = float(timeout or DEFAULT_TIMEOUT)
        body = {"input": {"task": task, **payload}}
        started = time.time()

        posted = self._post("runsync", body, timeout=budget)
        if posted["ok"]:
            result = self._unwrap(posted["json"])
        elif posted["kind"] == "timeout":
            # runsync gave up, but the job may still be running. Re-submit through
            # the async route and poll it out.
            queued = self._post("run", body, timeout=30.0)
            if not queued["ok"]:
                return {"success": False, "mode": "local_fallback", "reason": queued["kind"],
                        "detail": queued["message"], "latency_ms": int((time.time() - started) * 1000)}
            job_id = str(queued["json"].get("id", ""))
            if not job_id:
                return {"success": False, "mode": "local_fallback", "reason": "no_job_id",
                        "detail": "RunPod accepted the job but returned no id."}
            result = self._poll(job_id, deadline=time.time() + budget)
        else:
            return {"success": False, "mode": "local_fallback", "reason": posted["kind"],
                    "detail": posted["message"], "latency_ms": int((time.time() - started) * 1000)}

        latency = int((time.time() - started) * 1000)
        self._last_status = result
        if not result["ok"]:
            return {"success": False, "mode": "local_fallback", "reason": result.get("kind"),
                    "detail": result.get("message"), "latency_ms": latency}
        return {
            "success": True,
            "mode": "runpod",
            "task": task,
            "output": result["output"],
            "job_id": result.get("job_id"),
            "latency_ms": latency,
        }

    # ------------------------------------------------------------- public api

    def test_connection(self) -> Dict[str, Any]:
        """
        Probe the endpoint by asking the worker for its capabilities.

        Uses the /health route (worker-fleet status, no job is run) and then a
        `health` job so the answer describes the *worker*, not just the fleet.
        """
        if not self.is_configured():
            missing = []
            if not self.endpoint_url:
                missing.append("RUNPOD_ENDPOINT_URL")
            if not self.api_key:
                missing.append("RUNPOD_API_KEY")
            return {
                "connected": False,
                "status": "NOT_CONFIGURED",
                "message": f"Not configured ({', '.join(missing)} missing). Orbyte is running entirely on its local deterministic engines.",
                "latency_ms": 0,
                "endpoint": "",
            }

        started = time.time()
        fleet = self._get("health", timeout=8.0)
        fleet_ms = int((time.time() - started) * 1000)

        if not fleet["ok"]:
            return {
                "connected": False,
                "status": fleet["kind"].upper(),
                "message": f"Could not reach the endpoint: {fleet.get('message')}",
                "latency_ms": fleet_ms,
                "endpoint": self.endpoint_url,
            }

        body = fleet["json"]
        workers = body.get("workers") or {}
        if isinstance(workers, dict):
            fleet_line = ", ".join(f"{k}={v}" for k, v in workers.items()) or "no workers reported"
        else:
            fleet_line = str(workers)

        job = self.submit("health", {"model": self.model_name}, timeout=30.0)
        out = job.get("output") or {}
        return {
            "connected": bool(job.get("success")),
            "status": "ONLINE" if job.get("success") else str(job.get("reason", "ERROR")).upper(),
            "message": (
                "Endpoint reachable and the worker answered." if job.get("success")
                else f"Endpoint reachable but the worker did not answer: {job.get('detail') or job.get('reason')}"
            ),
            "latency_ms": fleet_ms,
            "worker_latency_ms": job.get("latency_ms"),
            "endpoint": self.endpoint_url,
            "endpoint_id": self.endpoint_id,
            "model": self.model_name,
            "fleet": fleet_line,
            "worker": {
                "status": out.get("status"),
                "version": out.get("worker_version"),
                "tasks": out.get("tasks"),
                "gpu": out.get("gpu"),
                "llm_loaded": (out.get("llm") or {}).get("loaded"),
                "llm_backend": (out.get("llm") or {}).get("backend"),
                "ocr_backends": (out.get("ocr") or {}).get("backends"),
                "uptime_s": out.get("uptime_s"),
            } if out else None,
        }

    def run_inference(self, prompt: str, system_prompt: str = "", **overrides: Any) -> Dict[str, Any]:
        """
        Text generation. Returns `success: False` when offline so the caller uses
        its deterministic engine; never raises.
        """
        payload = {
            "prompt": prompt,
            "system_prompt": system_prompt,
            "model": overrides.pop("model", self.model_name),
            "temperature": overrides.pop("temperature", 0.2),
            "max_tokens": overrides.pop("max_tokens", 800),
        }
        timeout = overrides.pop("timeout", None)
        payload.update(overrides)
        result = self.submit("llm", payload, timeout=timeout)
        if result.get("success"):
            out = result["output"]
            # Flatten the common case so callers can treat it as a string, while
            # keeping the envelope for callers that want usage and engine detail.
            result["text"] = out.get("text", "") if isinstance(out, dict) else str(out)
            result["engine"] = out.get("engine") if isinstance(out, dict) else None
            result["usage"] = out.get("usage") if isinstance(out, dict) else None
        return result

    def run_ocr(self, file_bytes: bytes, filename: str, mime_type: str = "", **overrides: Any) -> Dict[str, Any]:
        """
        Document extraction. Returns `success: False` when the endpoint cannot
        extract text, so Agent 1 falls back to its local pypdf / Windows OCR path.
        """
        import base64

        if not isinstance(file_bytes, (bytes, bytearray)) or not file_bytes:
            return {"success": False, "mode": "local", "reason": "no_bytes",
                    "detail": "run_ocr needs non-empty bytes."}
        payload = {
            "file_b64": base64.b64encode(bytes(file_bytes)).decode("ascii"),
            "filename": filename,
            "mime_type": mime_type,
        }
        timeout = overrides.pop("timeout", None)
        payload.update(overrides)
        result = self.submit("ocr", payload, timeout=timeout)
        if result.get("success"):
            out = result["output"]
            result["text"] = out.get("text", "") if isinstance(out, dict) else ""
            result["engine"] = out.get("engine") if isinstance(out, dict) else None
            result["pages"] = out.get("pages") if isinstance(out, dict) else None
            result["warnings"] = (out.get("warnings") or []) if isinstance(out, dict) else []
        return result

    def last_status(self) -> Dict[str, Any]:
        return dict(self._last_status)


runpod_client = RunPodClient()