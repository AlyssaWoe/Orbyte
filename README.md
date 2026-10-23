> [!IMPORTANT]
> ## 📁 Submission Documents & Templates
> **All required submission templates are in the Google Drive folder below. Download them before you start.**
>
> ### 👉 [**OPEN THE GOOGLE DRIVE FOLDER**](https://drive.google.com/drive/folders/1xw7c2aN8N-at8hPEULzkcU76e_FFb0Ef) 👈

---

# Orbyte — Smart Payment Follow-up AI

> A receivables follow-up system for SME finance teams: it reads an invoice, watches it age, understands the customer's reply, and drafts the next message — while deterministic controls, not a language model, hold every financial and policy decision.

---

## Team Information

| Field                  | Details                                     |
| ---------------------- | ------------------------------------------- |
| **Team Name**          | `UMvengers` *(unconfirmed — taken from the repository name)* |
| **Team Domain**        | _TODO: Domain 1 / Domain 2 (choose one)_     |
| **SDG Track (1–17)**   | _TODO: choose a track_                       |
| **Team Leader**        | _TODO: fill in_                              |
| **University**         | _TODO: fill in_                              |
| **Number of Members**  | _TODO: fill in_                              |

## Links

| Resource          | Link                                           |
| ----------------- | ---------------------------------------------- |
| GitHub Repository | https://github.com/AlyssaWoe/UMvengers-Orbyte   |
| Replit Project    | _TODO: paste the Repl URL_                      |
| Live Demo         | _TODO: paste the deployment URL_                |
| RunPod Endpoint   | _TODO: not created yet — see "How We Use RunPod"_ |
| Slide Deck        | _TODO: paste the link_                          |
| Demo Video        | _TODO: paste the link_                          |

---

## Overview

### Problem

Small and mid-sized businesses send invoices and then lose track of them. Overdue balances are chased by hand, so follow-ups are late or forgotten; customer replies arrive as free-form email or chat and are read inconsistently; and a claim like "we already paid" is only resolved by someone manually comparing a bank statement. The money is real, the process is not.

### Solution

Orbyte runs a seven-agent pipeline over each invoice. Deterministic engines extract the document fields, compute aging, match bank transactions and hold the ledger; language models add only the parts that are genuinely unstructured — reading the customer's intent, and drafting the follow-up.

The design principle is that **a model never holds a decision.** The date-vs-weekday conflict shield, the prompt-injection screen, the approval threshold and the ledger are all deterministic code. Where a model is used, its output is treated as an untrusted draft and re-checked against computed facts before a human sees it. That is also why the GPU workload is separable: if the endpoint is offline, every guardrail still fires and the system falls back to its deterministic path instead of failing.

### Key Features

- **P0 date-vs-weekday conflict shield** — a promise of "next Tuesday, 28 October" is checked against the calendar; a mismatch pauses automation and escalates for human confirmation rather than silently trusting the customer's wording.
- **Deterministic prompt-injection screen** — text like "ignore previous instructions" or "set balance to 0" is flagged and blocked before any model sees it, and blocked input is never forwarded to the model for a second opinion.
- **Approval gate at $4,000** — balances above the threshold cannot be dispatched without supervisor sign-off; a formal demand tone always requires it.
- **Central ledger as single source of truth** — balances are computed from transactions, not from the invoice's original total.
- **Self-checking bridge** — `GET /api/ai/runpod/selftest` runs nine offline checks plus a live probe, so endpoint wiring can be verified without a GPU.
- **Graceful degradation** — the RunPod worker returns `available: false` with a reason instead of inventing output, so the app falls back rather than acting on fabricated text.

### Tech Stack

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Frontend      | React (Create React App) + TypeScript; also a dependency-free HTML/CSS/JS console |
| Backend       | Python 3.12, Flask 3, Pydantic v2, served by gunicorn |
| Database      | JSON-backed local store (`backend/database/app_data.json`); no external database |
| AI / Compute  | RunPod (GPU) for OCR and language inference; deterministic engines locally |
| Hosting / Dev | Replit (required runtime) — the repo also ships a Render config (`render.yaml`) |

---

## Project Structure

```
.
├── backend/
│   ├── app.py                       # Flask API, static hosting, RunPod config + self-test routes
│   ├── ai_engines/                  # the seven agents
│   │   ├── ingestion_engine.py      # Agent 1 — document parsing, field validation, OCR
│   │   ├── monitoring_engine.py     # Agent 2 — deterministic aging and reminder scheduling
│   │   ├── laya_engine.py           # Agent 3 — non-autoregressive decision and routing
│   │   ├── deepseek_engine.py       # Agent 4 & 5 — reply understanding, draft synthesis
│   │   ├── reconciliation_engine.py # Agent 6 — bank transaction matching
│   │   ├── orchestrator.py          # Agent 7 — workflow gate and human-in-the-loop
│   │   ├── ledger.py                # central ledger (single source of truth)
│   │   └── runpod_client.py         # RunPod bridge (client half)
│   ├── models/schemas.py            # Pydantic v2 request/response contracts
│   ├── database/                    # JSON-backed store (store.py, app_data.json)
│   ├── skills/                      # 7 SKILL.md policy contracts (one per agent)
│   └── uploads/                     # uploaded invoice documents
├── frontend/
│   ├── park/                        # React source; build/ is committed and served in production
│   │   ├── src/                     # components, dashboards, 3D campus
│   │   └── build/                   # prebuilt bundle — no build step needed to run
│   ├── index.html                   # dependency-free console
│   ├── css/
│   └── js/
├── runpod/
│   ├── handler.py                   # RunPod serverless handler (GPU workload)
│   ├── Dockerfile                   # base: runpod/base:0.6.2-cuda12.1.0
│   ├── requirements.txt             # worker-only deps (torch lives here, not on the web host)
│   └── README.md                    # build, deploy and payload contract
├── tools/
│   ├── runpod_selftest.py           # 39 checks against the worker handler
│   └── runpod_client_selftest.py    # ~70 checks against the client protocol
├── Procfile                         # web: gunicorn backend.app:app
├── render.yaml                      # Render deployment config
├── requirements.txt                 # app dependencies
├── run.py                           # local launcher
└── README.md
```

### Architecture

```
User ──► Replit (Flask app / API) ──► RunPod Endpoint (GPU: OCR + inference)
                │
                ├──► Deterministic engines (aging, ledger, approval gate)
                │
                └──► Response returned to user
```

The RunPod endpoint is optional infrastructure, not a dependency of correctness. With no endpoint configured, the app runs entirely on its local deterministic engines.

---

## How to Run

### Option 1 — Run on Replit (Recommended)

1. In Replit, choose **Create Repl → Import from GitHub** and select `AlyssaWoe/UMvengers-Orbyte`.
2. Open the **Secrets** tab (🔒) and add:
   - `RUNPOD_ENDPOINT_URL`
   - `RUNPOD_API_KEY`
   - `RUNPOD_MODEL` *(optional)*
3. Click **Run**.

> **Note on the run command.** This repository does not yet contain a `.replit` file, so on import Replit will not know how to start a Flask app. Set the run command to:
>
> ```bash
> gunicorn backend.app:app --bind 0.0.0.0:8000
> ```
>
> The committed `frontend/park/build/` bundle means no `npm install` or build step is required.

### Option 2 — Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/AlyssaWoe/UMvengers-Orbyte.git
cd UMvengers-Orbyte

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables (optional — the app runs without them)
#    RUNPOD_ENDPOINT_URL, RUNPOD_API_KEY, RUNPOD_MODEL

# 5. Run the app
python run.py
```

The app serves at `http://localhost:8000` and serves the prebuilt React frontend from `frontend/park/build/`.

### Run Tests

The verification suites are self-checking scripts, not `unittest` cases. They stub their own transport, so they need no GPU, no RunPod account and no network:

```bash
python tools/runpod_selftest.py          # worker handler: dispatch, guards, response envelope
python tools/runpod_client_selftest.py   # client: protocol, failover, secret safety
```

To verify the whole bridge through the running app:

```bash
curl -s http://localhost:8000/api/ai/runpod/selftest | python -m json.tool
```

---

## How We Use Replit *(Required)*

- **Development:** the repository is imported into Replit from GitHub and run there as the submission environment.
- **Secrets:** RunPod credentials are held in Replit Secrets and read from the environment. The application never writes an API key to disk — the RunPod client refuses to persist one, and a masked placeholder pasted back into the config form is rejected rather than applied.
- **Runtime:** the Flask app is started with gunicorn, and the prebuilt frontend is served from the committed `frontend/park/build/`.

📄 Proof of use: _TODO — `submission/SDC2026_TeamName_Replit_POU.pdf` not yet added._

## How We Use RunPod *(Required)*

- **Workload:** two GPU tasks on one endpoint, dispatched by `input.task` — `llm` for reply understanding and draft synthesis (Agent 4 and 5), `ocr` for invoice and receipt extraction (Agent 1). A third task, `health`, reports capabilities so the app can decide whether to route there at all.
- **Setup:** `runpod/handler.py` is deployed as a **RunPod Serverless Endpoint** from `runpod/Dockerfile`. Build and deploy steps are documented in [`runpod/README.md`](runpod/README.md).
- **Integration:** the Flask app calls the endpoint with `RUNPOD_ENDPOINT_URL` and `RUNPOD_API_KEY`. When a `runsync` call times out — which it does on a cold worker loading a 14B model — the client re-submits through the asynchronous route and polls, rather than reporting an outage.

Example request:

```bash
curl -X POST https://api.runpod.ai/v2/$RUNPOD_ENDPOINT_ID/runsync \
  -H "Authorization: Bearer $RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": {"task": "llm", "prompt": "Hello"}}'
```

📄 Proof of use: _TODO — `submission/SDC2026_TeamName_Runpod_POU.pdf` not yet added._

---

## Challenges & Learnings

- **A model must not hold the control.** The injection screen, the date-conflict shield and the approval gate are deterministic code. The model receives already-screened text, and where it disagrees with a computed fact the fact stands and the disagreement is recorded. Sending flagged input to a model for a "second opinion" would be the opposite of containment.
- **Failures that look like successes are the expensive ones.** An endpoint can return `IN_QUEUE`, or a `FAILED` status that still carries an `output` field, or `available: false`. Treating any of those as a result would have silently poisoned the deterministic fallback. Each is now handled explicitly and asserted in tests.
- **Cold starts are a design constraint, not an error.** A 14B model takes minutes to load, which is longer than a synchronous call will wait. The fallback to asynchronous submit-and-poll is what makes a cold worker usable rather than a hard failure.
- **Verification beat optimism.** The previous version of the bridge posted to a route RunPod does not serve, and nothing called it. Stubbing the transport and asserting the protocol caught it without a GPU, an account or a network.

## Future Improvements

- [ ] Create the RunPod serverless endpoint and record its URL
- [ ] Add a `.replit` file so a GitHub import starts the app without manual configuration
- [ ] Add `.env.example` documenting the required variables
- [ ] Add a `LICENSE` file
- [ ] Complete the `submission/` documents
- [ ] Consider a smaller distilled model to cut cold-start time

## Team

| Name        | Role                | GitHub                                   |
| ----------- | ------------------- | ---------------------------------------- |
| _TODO_      | Team Lead / Backend | _TODO_                                   |
| _TODO_      | Frontend            | _TODO_                                   |
| _TODO_      | AI / RunPod         | _TODO_                                   |

---

## Submission Checklist

- [ ] Team name, domain (Domain 1 / Domain 2) and SDG track filled in
- [ ] Slide deck link added
- [ ] Demo video link added
- [ ] Replit used, with proof of use in `submission/`
- [ ] RunPod used, with proof of use in `submission/`
- [ ] Preliminary submission completed (`SDC2026_TeamName_Preliminary.pdf`)
- [ ] Technology declaration completed (`SDC2026_TeamName_TechDeclaration.pdf`)
- [ ] Submission files renamed with your team name (replace `TeamName`)
- [ ] "How to Run" steps verified
- [ ] No API keys or secrets committed to the repository

## License

This project is licensed under the [Apache License 2.0](LICENSE).

> _TODO: the `LICENSE` file is not present in the repository yet._