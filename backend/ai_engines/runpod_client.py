"""
RunPod & DeepSeek Cloud AI Endpoint Client
=========================================

Handles remote inference for Agent 4 (semantic reply understanding) and Agent 5 (drafting).
Supports:
1. DeepSeek Official Cloud API (https://api.deepseek.com/chat/completions)
2. RunPod Serverless Workers (https://api.runpod.ai/v2/<endpoint_id>/runsync)
3. RunPod vLLM Pod Proxies (https://<pod_id>-8000.proxy.runpod.net/v1/chat/completions)

Security & Architecture Guarantees:
- Never raise exceptions to callers; return success=False so deterministic fallback triggers.
- API keys are held strictly in environment variables / memory and never committed to Git.
- Model outputs are treated as untrusted draft recommendations; deterministic code establishes financial truth.
"""

import json
import os
import time
from typing import Any, Dict, Optional
from urllib.parse import urlparse
import requests

# Load .env file automatically if present
def _load_env_file():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip().strip("'\"")
                        if k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

_load_env_file()

DEFAULT_MODEL = "deepseek-flash"
DEFAULT_TIMEOUT = float(os.environ.get("RUNPOD_TIMEOUT", "60"))
POLL_INTERVAL = float(os.environ.get("RUNPOD_POLL_INTERVAL", "2.5"))

_MASK_CHARS = "\u2022\u25cf\u00b7*."

def _looks_masked(value: str) -> bool:
    stripped = (value or "").strip()
    return len(stripped) >= 4 and all(ch in _MASK_CHARS for ch in stripped)

class RunPodClient:
    def __init__(self) -> None:
        self.api_key = os.environ.get("RUNPOD_API_KEY", "").strip()
        self.endpoint_url = os.environ.get("RUNPOD_ENDPOINT_URL", "").strip()
        self.model_name = os.environ.get("RUNPOD_MODEL", DEFAULT_MODEL).strip()
        self._last_status: Dict[str, Any] = {}

    def is_configured(self) -> bool:
        return bool(self.endpoint_url and self.api_key)

    def is_openai_or_deepseek(self) -> bool:
        """True if the endpoint URL points to DeepSeek API or standard OpenAI completions."""
        url = (self.endpoint_url or "").lower()
        return "deepseek.com" in url or "chat/completions" in url or url.endswith("/v1")

    @property
    def endpoint_id(self) -> str:
        if not self.endpoint_url:
            return ""
        if self.is_openai_or_deepseek():
            return "deepseek-cloud"
        path = urlparse(self.endpoint_url).path.rstrip("/")
        tail = path.rsplit("/", 1)[-1] if path else ""
        return tail if tail and tail not in ("run", "runsync") else ""

    def api_base(self) -> str:
        raw = (self.endpoint_url or "").strip().rstrip("/")
        if not raw:
            return ""
        if self.is_openai_or_deepseek():
            if not raw.endswith("/chat/completions"):
                return f"{raw.rstrip('/')}/chat/completions" if "/v1" not in raw else f"{raw}/chat/completions"
            return raw
        if not raw.startswith(("http://", "https://")):
            return f"https://api.runpod.ai/v2/{raw}"
        parsed = urlparse(raw)
        head, _, tail = parsed.path.rstrip("/").rpartition("/")
        if tail in ("run", "runsync", "health") or tail.startswith("status"):
            return f"{parsed.scheme}://{parsed.netloc}{head}"
        return f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

    def configuration(self) -> Dict[str, Any]:
        return {
            "configured": self.is_configured(),
            "endpoint_url": self.endpoint_url,
            "endpoint_id": self.endpoint_id,
            "has_api_key": bool(self.api_key),
            "model_name": self.model_name,
            "api_base": self.api_base(),
            "timeout_s": DEFAULT_TIMEOUT,
            "provider": "DeepSeek Official Cloud" if self.is_openai_or_deepseek() else "RunPod Serverless"
        }

    def save_config(self, endpoint_url: str, api_key: str, model_name: str = "") -> Dict[str, Any]:
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
            "model_name": self.model_name
        }

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    # ------------------------------------------------------------- inference
    def submit(self, task: str, payload: Dict[str, Any], timeout: Optional[float] = None) -> Dict[str, Any]:
        """Dispatches either to DeepSeek API or RunPod Serverless based on endpoint URL."""
        if not self.is_configured():
            return {
                "success": False,
                "mode": "local",
                "reason": "not_configured",
                "detail": "Set RUNPOD_ENDPOINT_URL and RUNPOD_API_KEY to activate cloud inference."
            }

        # 1. DeepSeek Official / OpenAI Protocol
        if self.is_openai_or_deepseek():
            return self._call_deepseek_api(task, payload, timeout=timeout or 30.0)

        # 2. RunPod Serverless Protocol
        budget = float(timeout or DEFAULT_TIMEOUT)
        body = {"input": {"task": task, **payload}}
        started = time.time()
        url = f"{self.api_base()}/runsync"

        try:
            resp = requests.post(url, json=body, headers=self._headers(), timeout=budget)
            latency = int((time.time() - started) * 1000)
            if resp.status_code == 200:
                body_json = resp.json()
                output = body_json.get("output", body_json)
                return {
                    "success": True,
                    "mode": "runpod",
                    "task": task,
                    "output": output,
                    "latency_ms": latency
                }
            return {
                "success": False,
                "mode": "local_fallback",
                "reason": f"HTTP_{resp.status_code}",
                "detail": resp.text[:200],
                "latency_ms": latency
            }
        except Exception as exc:
            latency = int((time.time() - started) * 1000)
            return {
                "success": False,
                "mode": "local_fallback",
                "reason": "request_failed",
                "detail": str(exc),
                "latency_ms": latency
            }

    def _call_deepseek_api(self, task: str, payload: Dict[str, Any], timeout: float = 30.0) -> Dict[str, Any]:
        """Calls DeepSeek official API (https://api.deepseek.com/chat/completions)."""
        started = time.time()
        url = self.api_base()
        model = self.model_name
        # DeepSeek API models: deepseek-chat (includes deepseek-flash), deepseek-reasoner
        api_model = "deepseek-chat" if "reasoner" not in model.lower() else "deepseek-reasoner"

        messages = []
        if payload.get("system_prompt"):
            messages.append({"role": "system", "content": payload["system_prompt"]})
        messages.append({"role": "user", "content": payload.get("prompt", "")})

        req_body = {
            "model": api_model,
            "messages": messages,
            "temperature": payload.get("temperature", 0.2),
            "max_tokens": payload.get("max_tokens", 800)
        }

        try:
            resp = requests.post(url, json=req_body, headers=self._headers(), timeout=timeout)
            latency = int((time.time() - started) * 1000)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return {
                    "success": True,
                    "mode": "deepseek_cloud",
                    "task": task,
                    "output": {
                        "text": content,
                        "model": api_model,
                        "engine": "deepseek-flash-api",
                        "usage": data.get("usage")
                    },
                    "latency_ms": latency
                }
            return {
                "success": False,
                "mode": "local_fallback",
                "reason": f"HTTP_{resp.status_code}",
                "detail": resp.text[:200],
                "latency_ms": latency
            }
        except Exception as exc:
            latency = int((time.time() - started) * 1000)
            return {
                "success": False,
                "mode": "local_fallback",
                "reason": "unreachable",
                "detail": str(exc),
                "latency_ms": latency
            }

    # ------------------------------------------------------------- diagnostics
    def test_connection(self) -> Dict[str, Any]:
        """Performs live connectivity verification."""
        if not self.is_configured():
            return {
                "connected": False,
                "status": "NOT_CONFIGURED",
                "message": "Cloud AI endpoint not configured. System is operating on local embedded engines.",
                "latency_ms": 0,
                "endpoint": "",
            }

        started = time.time()
        # If DeepSeek / OpenAI endpoint:
        if self.is_openai_or_deepseek():
            test_res = self._call_deepseek_api("health", {"prompt": "Reply with 'ready'"}, timeout=8.0)
            latency = test_res.get("latency_ms", int((time.time() - started) * 1000))
            if test_res.get("success"):
                return {
                    "connected": True,
                    "status": "ONLINE",
                    "provider": "DeepSeek Cloud API",
                    "model": self.model_name,
                    "message": "DeepSeek API connected and verified (deepseek-flash).",
                    "latency_ms": latency,
                    "endpoint": self.endpoint_url
                }
            return {
                "connected": False,
                "status": test_res.get("reason", "UNREACHABLE"),
                "provider": "DeepSeek Cloud API",
                "message": f"DeepSeek API authentication or network error: {test_res.get('detail')}",
                "latency_ms": latency,
                "endpoint": self.endpoint_url
            }

        # If RunPod Serverless endpoint:
        url = f"{self.api_base()}/health"
        try:
            resp = requests.get(url, headers=self._headers(), timeout=8.0)
            latency = int((time.time() - started) * 1000)
            if resp.status_code in [200, 204]:
                return {
                    "connected": True,
                    "status": "ONLINE",
                    "provider": "RunPod Serverless",
                    "model": self.model_name,
                    "message": "RunPod Serverless endpoint connected.",
                    "latency_ms": latency,
                    "endpoint": self.endpoint_url
                }
            return {
                "connected": False,
                "status": f"HTTP_{resp.status_code}",
                "provider": "RunPod Serverless",
                "message": f"RunPod returned HTTP {resp.status_code}: {resp.text[:120]}",
                "latency_ms": latency,
                "endpoint": self.endpoint_url
            }
        except Exception as exc:
            latency = int((time.time() - started) * 1000)
            return {
                "connected": False,
                "status": "UNREACHABLE",
                "provider": "RunPod Serverless",
                "message": f"Connection failed: {str(exc)}",
                "latency_ms": latency,
                "endpoint": self.endpoint_url
            }

    def run_inference(self, prompt: str, system_prompt: str = "", **overrides: Any) -> Dict[str, Any]:
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
            result["text"] = out.get("text", "") if isinstance(out, dict) else str(out)
            result["engine"] = out.get("engine") if isinstance(out, dict) else "deepseek-api"
            result["usage"] = out.get("usage") if isinstance(out, dict) else None
        return result

    def run_ocr(self, file_bytes: bytes, filename: str, mime_type: str = "", **overrides: Any) -> Dict[str, Any]:
        import base64
        if not isinstance(file_bytes, (bytes, bytearray)) or not file_bytes:
            return {"success": False, "mode": "local", "reason": "no_bytes", "detail": "run_ocr needs non-empty bytes."}
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
        return result

runpod_client = RunPodClient()
