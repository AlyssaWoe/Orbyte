# Orbyte RunPod Serverless Worker

The server-side half of Orbyte's RunPod bridge. `backend/ai_engines/runpod_client.py`
calls this; nothing else does.

This directory is **not** part of the Flask app and must not be installed into it.
It builds into a GPU image that runs on RunPod. The app stays on Render or
localhost and reaches the worker over HTTPS.

```
runpod/
  handler.py          one worker, three tasks, dispatched on input.task
  Dockerfile          build recipe (base: runpod/base:0.6.2-cuda12.1.0)
  requirements.txt    worker-only deps (torch lives here, not on the web dyno)
  .dockerignore
```

## Three rules this worker obeys

The rest of Orbyte depends on these, so they are stated before anything else.

1. **This worker is a compute device, not a policy authority.** Every guardrail —
   the P0 date-vs-weekday conflict shield, the injection screen, the $4,000
   approval gate, the central ledger — lives in the application. The worker
   generates text and extracts text. It adjudicates nothing. The application
   treats everything returned here as untrusted draft material and re-checks it
   against deterministic facts before a human sees it.
2. **Degrade loudly, never silently.** No GPU, model still downloading, OCR
   backend absent: the task returns `available: false` with a reason. It does not
   invent an answer, because an invented answer would poison the caller's
   deterministic fallback without anyone noticing.
3. **No secrets in, no secrets out.** The worker holds no RunPod credentials and
   no customer secrets. Prompts arrive already screened by the application.

## Tasks

One worker serves both jobs, so a single endpoint is enough.

| `input.task` | Used by | Purpose |
|---|---|---|
| `llm` | Agent 4 (reply understanding), Agent 5 (drafting) | Text generation |
| `ocr` | Agent 1 (invoice / receipt ingestion) | Document text extraction |
| `health` | Diagnostics and the self-test route | Capability report |

### Request contract

`llm`:

```json
{
  "input": {
    "task": "llm",
    "prompt": "user prompt",
    "system_prompt": "optional system prompt",
    "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
    "temperature": 0.2,
    "max_tokens": 800
  }
}
```

`ocr`:

```json
{
  "input": {
    "task": "ocr",
    "file_b64": "<base64, or a data: URL>",
    "filename": "invoice.pdf",
    "mime_type": "application/pdf"
  }
}
```

`filename` and `mime_type` both drive routing: a `.pdf` or `application/pdf` goes
to the PDF path, an image extension or `image/*` goes to the image path, and
anything unrecognised is tried as plain text.

### Response contract

RunPod places the handler's return value under `output`.

`llm`, success:

```json
{
  "available": true,
  "task": "llm",
  "text": "...",
  "model": "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B",
  "engine": "runpod-vllm",
  "finish_reason": "stop",
  "usage": {"prompt_tokens": 120, "completion_tokens": 64},
  "latency_ms": 812,
  "trust": "untrusted-draft — verify against deterministic facts before use"
}
```

`ocr`, success:

```json
{
  "available": true,
  "task": "ocr",
  "text": "full document text",
  "pages": [{"page": 1, "text": "...", "chars": 812}],
  "page_count": 1,
  "chars": 812,
  "engine": "runpod-pypdf",
  "backends": {"pypdf": true, "pymupdf": true, "tesseract": true, "docling": false},
  "warnings": [],
  "latency_ms": 240,
  "trust": "untrusted-extract — validate every field before it reaches the ledger"
}
```

Any task, when it cannot do the job:

```json
{
  "available": false,
  "task": "llm",
  "reason": "no CUDA device is visible to this container",
  "note": "Orbyte will use its deterministic engine for this step."
}
```

The client maps `available: false` to `reason: "unavailable"`, which makes the
engines **fall back** rather than retry. That distinction is the whole point of
rule 2. Every response also carries `worker`, `worker_version`, `job_id` and
`total_ms`.

## Build and push

Build from the repo root, with `runpod/` as the context — `.dockerignore` paths
are relative to the context, so `docker build .` from elsewhere will not apply
them.

```bash
cd <repo root>

# Any registry works. Docker Hub shown.
docker build -t <dockerhub-user>/orbyte-runpod:1.0.0 runpod/

docker login
docker push <dockerhub-user>/orbyte-runpod:1.0.0
```

Tag a new version for every change; RunPod caches layers per tag, so reusing a
tag can serve a stale worker.

## Create the endpoint

1. RunPod console, **Serverless → New Endpoint**.
2. Container image: `<dockerhub-user>/orbyte-runpod:1.0.0`.
3. Pick a **GPU** with at least 24 GB for a 14B model. A smaller GPU serves the
   same image — set `MODEL_NAME` to a smaller model instead of rebuilding.
4. Set **Container Disk** to ~30 GB (weights are cached here) and attach a
   **Network Volume** if you want that cache to survive worker recycling.
5. Recommended: **Min Workers 1, Max Workers 1, Idle Timeout 5s** while testing.
   Min 0 saves money but makes the first request pay a cold start.
6. Copy the **Endpoint ID** from the endpoint page.

## Point Orbyte at it

Set these in the app's environment — on Render these are secret env vars, locally
a gitignored `.env`. The client never writes a key to disk.

The dashboard's "Configure RunPod AI Endpoint" modal applies config to the running
process only. It prefills the key field with a mask, and a masked value is
ignored rather than applied, so opening the modal and saving does not clobber a
working key with bullets. `POST /api/config/runpod` answers with
`applied.persisted: false` and `applied.api_key_updated` to say exactly what
happened.

| Variable | Required | Default | Meaning |
|---|---|---|---|
| `RUNPOD_ENDPOINT_URL` | yes | — | Endpoint id (`abc123`), the console URL, or a `/run` URL — all three are accepted and normalised |
| `RUNPOD_API_KEY` | yes | — | RunPod API key |
| `RUNPOD_MODEL` | no | `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B` | Model the worker loads |
| `RUNPOD_TIMEOUT` | no | `180` | Per-job budget, seconds. A cold 14B load needs minutes |
| `RUNPOD_POLL_INTERVAL` | no | `2.5` | Poll cadence after a `runsync` timeout |
| `RUNPOD_OCR_FIRST` | no | `0` | `1` tries the worker before local extraction instead of after |
| `RUNPOD_ALLOW_CONFIG_FILE` | no | `0` | `1` reads model/URL from the legacy JSON file. An API key in that file is ignored outright |

Worker-side env vars (set on the RunPod endpoint, not the app):

| Variable | Default | Meaning |
|---|---|---|
| `MODEL_NAME` | `deepseek-ai/DeepSeek-R1-Distill-Qwen-14B` | Model to load |
| `USE_VLLM` | `0` in the image | `1` uses vLLM when importable, else plain transformers |
| `GPU_MEMORY_UTILIZATION` | `0.90` | vLLM KV-cache share |
| `MAX_MODEL_LEN` | `8192` | vLLM context ceiling |
| `MAX_PROMPT_CHARS` | `24000` | Reject over-long prompts instead of OOM-killing |
| `MAX_FILE_BYTES` | `12582912` (12 MiB) | Reject over-large uploads |
| `MAX_DEFAULT_TOKENS` | `1024` | Generation ceiling when a request omits `max_tokens` |
| `OCR_DPI` | `200` | Rasterisation DPI for scanned PDFs |

## Why the image ships without vLLM

`Dockerfile` sets `USE_VLLM=0` and `requirements.txt` leaves `vllm` commented out.
vLLM is much faster but pins its own torch and CUDA build; if that does not match
the base image, the build succeeds and then fails at import. The image therefore
defaults to plain `transformers`, which always installs and always runs — just
slower. The worker falls through to it automatically when vLLM fails to import,
and reports which backend answered in `engine`. Enable vLLM only when you have
matched the versions:

```
# requirements.txt: uncomment vllm>=0.6.0
# Dockerfile:      USE_VLLM=1
```

## Cold start

A worker with min 0 scales to zero. The first `llm` job loads the model, which
takes minutes. The client does not treat that as an outage: when `runsync` times
out it re-submits through `/run` and polls `/status/<job_id>` until the job
finishes or the budget expires. `health` reports the model as unloaded until then,
and says so in `llm.note`.

`ocr` has no model to load and answers immediately.

## Verify the bridge

```bash
curl -s http://localhost:8000/api/ai/runpod/selftest | python -m json.tool
```

Runs nine offline checks with no endpoint configured and no network — key
handling, URL normalisation, masked-key refusal, injection screening, the P0
date-conflict shield, model-JSON extraction, and the OCR fallback — then a live
probe when an endpoint is set. It never writes a secret or returns one.

```bash
curl -s http://localhost:8000/api/ai/diagnostics | python -m json.tool
```

`runpod.status` there is the same live probe; `runpod_bridged` is whether the
endpoint is configured.

## Local checks

Both suites stub their transport, so they run with no GPU, no RunPod account and
no network:

```bash
python tools/runpod_selftest.py          # handler: dispatch, guards, envelope
python tools/runpod_client_selftest.py   # client: protocol, failover, secret safety
```