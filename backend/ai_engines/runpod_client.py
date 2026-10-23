"""
RunPod AI Endpoint Client
Enables linking Orbyte AI engines (DeepSeek, Laya, Docling OCR) to RunPod Serverless or Pod endpoints.
Provides intelligent failover to local high-accuracy deterministic execution when endpoint is offline.
"""
import os
import json
import time
import requests
from typing import Dict, Any, Optional

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "database", "runpod_config.json")

class RunPodClient:
    def __init__(self):
        self.endpoint_url = os.environ.get("RUNPOD_ENDPOINT_URL", "")
        self.api_key = os.environ.get("RUNPOD_API_KEY", "")
        self.model_name = os.environ.get("RUNPOD_MODEL", "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B")
        self.load_config()

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                    self.endpoint_url = cfg.get("endpoint_url", self.endpoint_url)
                    self.api_key = cfg.get("api_key", self.api_key)
                    self.model_name = cfg.get("model_name", self.model_name)
            except Exception as e:
                print(f"Notice: Could not load runpod_config.json: {e}")

    def save_config(self, endpoint_url: str, api_key: str, model_name: str = ""):
        self.endpoint_url = endpoint_url.strip()
        self.api_key = api_key.strip()
        if model_name:
            self.model_name = model_name.strip()
        os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump({
                "endpoint_url": self.endpoint_url,
                "api_key": self.api_key,
                "model_name": self.model_name
            }, f, indent=2)

    def is_configured(self) -> bool:
        return bool(self.endpoint_url and self.endpoint_url.strip())

    def test_connection(self) -> Dict[str, Any]:
        """Tests live ping / inference against the configured RunPod endpoint."""
        if not self.is_configured():
            return {
                "connected": False,
                "status": "NOT_CONFIGURED",
                "message": "RunPod endpoint URL is not configured. System is operating on local embedded AI engines.",
                "latency_ms": 0,
                "endpoint": ""
            }

        start_time = time.time()
        headers = {
            "Content-Type": "application/json"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        test_payload = {
            "input": {
                "prompt": "Orbyte AI Health Check",
                "max_tokens": 10
            }
        }

        try:
            # Handle runsync or health ping
            url = self.endpoint_url
            if "/run" not in url and not url.endswith("/health"):
                target_url = f"{url.rstrip('/')}/health"
            else:
                target_url = url

            resp = requests.post(target_url, json=test_payload, headers=headers, timeout=6.0)
            latency = int((time.time() - start_time) * 1000)

            if resp.status_code in [200, 201, 202]:
                return {
                    "connected": True,
                    "status": "ONLINE",
                    "status_code": resp.status_code,
                    "message": "RunPod endpoint connected and responsive.",
                    "latency_ms": latency,
                    "endpoint": self.endpoint_url,
                    "model": self.model_name
                }
            else:
                return {
                    "connected": False,
                    "status": "HTTP_ERROR",
                    "status_code": resp.status_code,
                    "message": f"RunPod returned HTTP {resp.status_code}: {resp.text[:120]}",
                    "latency_ms": latency,
                    "endpoint": self.endpoint_url
                }
        except requests.exceptions.RequestException as e:
            latency = int((time.time() - start_time) * 1000)
            return {
                "connected": False,
                "status": "UNREACHABLE",
                "message": f"Connection failed ({str(e.__class__.__name__)}): {str(e)[:100]}",
                "latency_ms": latency,
                "endpoint": self.endpoint_url
            }

    def run_inference(self, prompt: str, system_prompt: str = "") -> Dict[str, Any]:
        """Calls RunPod if configured; returns None if offline so caller uses local engine."""
        if not self.is_configured():
            return {"success": False, "mode": "local", "reason": "not_configured"}

        start_time = time.time()
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "input": {
                "prompt": f"{system_prompt}\n\nUser: {prompt}" if system_prompt else prompt,
                "model": self.model_name,
                "temperature": 0.2,
                "max_tokens": 800
            }
        }

        try:
            resp = requests.post(self.endpoint_url, json=payload, headers=headers, timeout=12.0)
            latency = int((time.time() - start_time) * 1000)
            if resp.status_code in [200, 201]:
                res_json = resp.json()
                output = res_json.get("output", res_json)
                return {
                    "success": True,
                    "mode": "runpod",
                    "output": output,
                    "latency_ms": latency
                }
        except Exception as e:
            print(f"RunPod invocation failed, falling back to local engine: {e}")

        return {"success": False, "mode": "local_fallback", "reason": "endpoint_timeout_or_error"}

runpod_client = RunPodClient()
