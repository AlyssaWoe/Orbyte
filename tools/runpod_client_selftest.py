"""
Local harness for backend/ai_engines/runpod_client.py.

runpod_client.py is the half of the bridge most likely to be subtly wrong,
because RunPod's response envelope has states that look like success and are not
(IN_QUEUE, output.available=false, FAILED with an output field). This harness
stubs the HTTP layer and drives every one of those states.

    python tools/runpod_client_selftest.py

A non-zero exit means a caller would misread a RunPod response.
"""

import importlib
import json
import os
import sys
import types

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, REPO_ROOT)

FAILURES = []


def check(label, condition, detail=""):
    if condition:
        print(f"  PASS  {label}")
    else:
        print(f"  FAIL  {label}{f' :: {detail}' if detail else ''}")
        FAILURES.append(label)


class FakeResponse:
    def __init__(self, status_code=200, body=None, text=None):
        self.status_code = status_code
        self._body = body
        self.text = text if text is not None else json.dumps(body or {})

    def json(self):
        if self._body is None:
            raise ValueError("no json")
        return self._body


class Router:
    """Stand-in for requests. Records calls and replays scripted responses."""

    def __init__(self):
        self.routes = {}
        self.calls = []
        # The client legitimately catches requests.exceptions.Timeout, and this
        # stub replaces the whole requests module, so the real exception classes
        # have to be re-exposed here or the client cannot catch anything.
        import requests as _real
        self.exceptions = _real.exceptions

    def add(self, method, contains, responses):
        """responses: a list of FakeResponse or Exception, consumed in order (last repeats)."""
        self.routes[(method, contains)] = list(responses)

    def _handle(self, method, url, **kwargs):
        self.calls.append({"method": method, "url": url, "kwargs": kwargs})
        for (m, needle), queue in self.routes.items():
            if m == method and needle in url:
                item = queue.pop(0) if len(queue) > 1 else queue[0]
                if isinstance(item, Exception):
                    raise item
                return item
        return FakeResponse(404, {"error": "no route scripted"})

    def post(self, url, **kwargs):
        return self._handle("POST", url, **kwargs)

    def get(self, url, **kwargs):
        return self._handle("GET", url, **kwargs)


def fresh_client(router, env):
    """Reload the module with a fresh Router install and the given environment."""
    for key in ("RUNPOD_ENDPOINT_URL", "RUNPOD_API_KEY", "RUNPOD_MODEL", "RUNPOD_ALLOW_CONFIG_FILE"):
        os.environ.pop(key, None)
    os.environ.update(env)

    module = importlib.import_module("backend.ai_engines.runpod_client")
    importlib.reload(module)
    module.requests = router
    return module.RunPodClient()


def main():
    import requests as real_requests

    print("api_base normalisation")
    for pasted, expected in [
        ("https://api.runpod.ai/v2/abc123", "https://api.runpod.ai/v2/abc123"),
        ("https://api.runpod.ai/v2/abc123/", "https://api.runpod.ai/v2/abc123"),
        ("https://api.runpod.ai/v2/abc123/runsync", "https://api.runpod.ai/v2/abc123"),
        ("https://api.runpod.ai/v2/abc123/run", "https://api.runpod.ai/v2/abc123"),
        ("abc123", "https://api.runpod.ai/v2/abc123"),
    ]:
        c = fresh_client(Router(), {"RUNPOD_ENDPOINT_URL": pasted, "RUNPOD_API_KEY": "k"})
        check(f"accepts {pasted!r}", c.api_base() == expected, c.api_base())

    c = fresh_client(Router(), {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/abc123", "RUNPOD_API_KEY": "k"})
    check("endpoint_id is extracted", c.endpoint_id == "abc123", c.endpoint_id)
    check("is_configured true with url+key", c.is_configured() is True)

    # ------------------------------------------------------------- not configured
    print("\nnot configured")
    c = fresh_client(Router(), {})
    r = c.run_inference("hello")
    check("run_inference declines without raising", r["success"] is False)
    check("run_inference says not_configured", r["reason"] == "not_configured", json.dumps(r)[:160])
    r = c.run_ocr(b"x", "a.txt")
    check("run_ocr declines without raising", r["success"] is False)
    t = c.test_connection()
    check("test_connection reports NOT_CONFIGURED", t["status"] == "NOT_CONFIGURED")
    check("test_connection names the missing vars", "RUNPOD_ENDPOINT_URL" in t["message"], t["message"])

    # ---------------------------------------------------------- happy runsync path
    print("\nrunsync -- completed")
    router = Router()
    router.add("POST", "/runsync", [FakeResponse(200, {
        "id": "job-1", "status": "COMPLETED",
        "output": {"available": True, "task": "llm", "text": "Dear Apex Freight,", "model": "m",
                   "engine": "runpod-vllm", "usage": {"prompt_tokens": 12}, "latency_ms": 900},
        "executionTime": 950,
    })])
    c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
    r = c.run_inference("draft", "be polite")
    check("success true", r["success"] is True, json.dumps(r)[:200])
    check("mode is runpod", r["mode"] == "runpod")
    check("text is flattened for callers", r["text"] == "Dear Apex Freight,", repr(r.get("text")))
    check("engine is surfaced", r["engine"] == "runpod-vllm")
    check("usage is surfaced", r["usage"] == {"prompt_tokens": 12})
    check("task is threaded through", r["task"] == "llm")
    posted = [x for x in router.calls if x["method"] == "POST"][0]
    check("posts to /runsync", posted["url"].endswith("/runsync"), posted["url"])
    check("sends the task field", posted["kwargs"]["json"]["input"]["task"] == "llm",
          json.dumps(posted["kwargs"]["json"]))
    check("sends the prompt", posted["kwargs"]["json"]["input"]["prompt"] == "draft")
    check("sends the system prompt", posted["kwargs"]["json"]["input"]["system_prompt"] == "be polite")
    check("authorises with a bearer token",
          posted["kwargs"]["headers"]["Authorization"] == "Bearer k")

    # ------------------------------------------- worker honestly saying no
    print("\nrunsync -- worker reports available=false")
    router = Router()
    router.add("POST", "/runsync", [FakeResponse(200, {
        "id": "job-2", "status": "COMPLETED",
        "output": {"available": False, "task": "llm", "reason": "no CUDA device is visible"},
    })])
    c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
    r = c.run_inference("draft")
    check("available=false is not reported as success", r["success"] is False, json.dumps(r)[:200])
    check("reason comes from the worker", r["reason"] == "unavailable")
    check("worker's explanation survives", "no CUDA device" in str(r.get("detail")), json.dumps(r)[:200])

    # ------------------------------------------------------------------- failures
    print("\nfailure states")
    for status, needle, expect_kind in [
        (401, "auth", "auth"),
        (404, "not_found", "not_found"),
        (429, "rate_limited", "rate_limited"),
        (500, "http", "http"),
    ]:
        router = Router()
        router.add("POST", "/runsync", [FakeResponse(status, {"error": needle})])
        c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
        r = c.run_inference("x")
        check(f"HTTP {status} -> success False", r["success"] is False)
        check(f"HTTP {status} -> reason {expect_kind}", r["reason"] == expect_kind, str(r.get("reason")))

    router = Router()
    router.add("POST", "/runsync", [FakeResponse(200, {"id": "j", "status": "FAILED", "error": "CUDA OOM"})])
    c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
    r = c.run_inference("x")
    check("FAILED with an error is not success", r["success"] is False)
    check("FAILED surfaces the error text", "CUDA OOM" in str(r.get("detail")), json.dumps(r)[:200])

    # Falls back to /run + polling when runsync times out (the cold-start case).
    print("\nrunsync timeout -> /run + poll (cold start)")
    router = Router()
    router.add("POST", "/runsync", [real_requests.exceptions.Timeout("read timed out")])
    router.add("POST", "/run", [FakeResponse(200, {"id": "job-9", "status": "IN_QUEUE"})])
    router.add("GET", "/status/job-9", [
        FakeResponse(200, {"id": "job-9", "status": "IN_PROGRESS"}),
        FakeResponse(200, {"id": "job-9", "status": "COMPLETED",
                           "output": {"available": True, "text": "eventually", "engine": "runpod-vllm"}}),
    ])
    import backend.ai_engines.runpod_client as mod
    mod.POLL_INTERVAL = 0.01
    c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
    mod.POLL_INTERVAL = 0.01
    r = c.run_inference("x", timeout=5)
    check("timeout does not end the job", r["success"] is True, json.dumps(r)[:200])
    check("polled result text survives", r.get("text") == "eventually")
    check("a /run call was made", any("POST" == x["method"] and x["url"].endswith("/run") for x in router.calls))
    check("status was polled", any(x["method"] == "GET" and "/status/" in x["url"] for x in router.calls))

    # IN_QUEUE forever must give up, not hang.
    router = Router()
    router.add("POST", "/runsync", [real_requests.exceptions.Timeout("t")])
    router.add("POST", "/run", [FakeResponse(200, {"id": "job-slow", "status": "IN_QUEUE"})])
    router.add("GET", "/status/job-slow", [FakeResponse(200, {"id": "job-slow", "status": "IN_QUEUE"})])
    c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
    mod.POLL_INTERVAL = 0.01
    r = c.run_inference("x", timeout=1)
    check("a permanently queued job eventually gives up", r["success"] is False, json.dumps(r)[:200])
    check("giving up is reported as a timeout", r["reason"] == "timeout", str(r.get("reason")))

    # ---------------------------------------------------------------- ocr call
    print("\nocr call")
    router = Router()
    router.add("POST", "/runsync", [FakeResponse(200, {
        "id": "job-3", "status": "COMPLETED",
        "output": {"available": True, "task": "ocr", "text": "INV-2026-0042",
                   "engine": "runpod-pypdf", "pages": [{"page": 1, "text": "INV-2026-0042"}],
                   "warnings": ["text layer thin"]},
    })])
    c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
    r = c.run_ocr(b"%PDF-1.4", "inv.pdf", "application/pdf")
    check("ocr success", r["success"] is True, json.dumps(r)[:200])
    check("ocr text flattened", r["text"] == "INV-2026-0042")
    check("ocr pages surfaced", isinstance(r["pages"], list) and r["pages"][0]["page"] == 1)
    check("ocr warnings surfaced", r["warnings"] == ["text layer thin"])
    posted = [x for x in router.calls if x["method"] == "POST"][0]
    check("ocr sends task=ocr", posted["kwargs"]["json"]["input"]["task"] == "ocr")
    check("ocr base64-encodes the file", isinstance(posted["kwargs"]["json"]["input"]["file_b64"], str))
    check("ocr forwards the filename", posted["kwargs"]["json"]["input"]["filename"] == "inv.pdf")
    check("ocr forwards the mime type", posted["kwargs"]["json"]["input"]["mime_type"] == "application/pdf")

    r = c.run_ocr(b"", "empty.pdf")
    check("empty bytes refused before any request", r["success"] is False and r["reason"] == "no_bytes")

    # ----------------------------------------------------------- test_connection
    print("\ntest_connection")
    router = Router()
    router.add("GET", "/health", [FakeResponse(200, {"workers": {"idle": 1, "running": 0}})])
    router.add("POST", "/runsync", [FakeResponse(200, {
        "id": "job-h", "status": "COMPLETED",
        "output": {"available": True, "task": "health", "status": "ready", "worker_version": "1.0.0",
                   "tasks": ["llm", "ocr", "health"], "gpu": {"available": True, "name": "A5000", "memory_gb": 24.0},
                   "llm": {"loaded": True, "backend": "vllm"}, "ocr": {"backends": {"pypdf": True}},
                   "uptime_s": 42},
    })])
    c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
    t = c.test_connection()
    check("connected true", t["connected"] is True, json.dumps(t)[:300])
    check("status ONLINE", t["status"] == "ONLINE")
    check("fleet line reported", "idle=1" in t["fleet"], t.get("fleet"))
    check("worker detail attached", isinstance(t.get("worker"), dict))
    check("worker gpu surfaced", (t["worker"].get("gpu") or {}).get("name") == "A5000")
    check("worker tasks surfaced", set(t["worker"].get("tasks") or []) == {"llm", "ocr", "health"})

    router = Router()
    router.add("GET", "/health", [FakeResponse(503, {"error": "no workers"})])
    c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
    t = c.test_connection()
    check("unreachable endpoint reports not connected", t["connected"] is False)
    check("unreachable endpoint explains itself", "Could not reach" in t["message"], t["message"])

    # ------------------------------------------------------------- secret safety
    print("\nsecret safety")
    router = Router()
    c = fresh_client(router, {"RUNPOD_ENDPOINT_URL": "https://api.runpod.ai/v2/e1", "RUNPOD_API_KEY": "k"})
    res = c.save_config("https://api.runpod.ai/v2/e2", "super-secret-key", "some/model")
    check("save_config applies in memory", c.endpoint_id == "e2", c.endpoint_id)
    check("save_config reports persisted=false", res["persisted"] is False, json.dumps(res)[:200])
    legacy = os.path.join(REPO_ROOT, "backend", "database", "runpod_config.json")
    check("save_config did not write a key to disk", not os.path.exists(legacy), legacy)
    check("save_config tells the operator to use env vars", "environment" in res["note"], res["note"])
    check("configuration() never returns the key itself", "super-secret-key" not in json.dumps(c.configuration()))

    # An api_key in the legacy file is ignored outright.
    print("\nlegacy file")
    os.makedirs(os.path.dirname(legacy), exist_ok=True)
    with open(legacy, "w", encoding="utf-8") as fh:
        json.dump({"endpoint_url": "https://api.runpod.ai/v2/old", "api_key": "leaked-key",
                   "model_name": "from-file"}, fh)
    try:
        c = fresh_client(Router(), {"RUNPOD_ALLOW_CONFIG_FILE": "1"})
        check("legacy model name honoured when opted in", c.model_name == "from-file", c.model_name)
        check("legacy endpoint honoured when opted in", c.endpoint_id == "old", c.endpoint_id)
        check("legacy api_key is ignored", c.api_key == "", repr(c.api_key))
        check("legacy file never produced a client that can auth", c.is_configured() is False)
    finally:
        os.remove(legacy)

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