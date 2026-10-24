# UMvengers-Orbyte

UMvengers-Orbyte is an AI-powered multi-agent platform that helps SMEs automate payment follow-ups, manage overdue invoices, and improve cash flow through intelligent decision-making and customer communication.

## Team Information

| Field                 | Details           |
| --------------------- | ----------------- |
| **Team Name**         | `UMvengers`       |
| **Team Domain**       | Domain 2          |
| **SDG Track (1–17)**  | 8 and 9           |
| **Team Leader**       | Wong Hanz         |
| **University**        | Universiti Malaya |
| **Number of Members** | 4                 |

## Links

| Resource          | Link                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| GitHub Repository | https://github.com/AlyssaWoe/UMvengers-Orbyte                          |
| Replit Project    | https://replit.com/@leowyh07/UMvengers-Orbyte-Runner                   |
| Live Demo         | https://u-mvengers-orbyte-runner.replit.app                            |
| Slide Deck        | [submission/Orbyte-Slide-Deck.pptx](submission/Orbyte-Slide-Deck.pptx) |
| Demo Video        | _TODO: paste the link_                                                 |

---

## Overview

### Problem

Small and medium-sized enterprises (SMEs) often struggle with late payments, which can create cash-flow problems and make it difficult to pay salaries, suppliers, and operating expenses. Manual invoice tracking and payment reminders take time, while customer replies and payment records may be scattered across different platforms. These challenges reduce efficiency and limit business growth.

### Solution

UMvengers-Orbyte is an AI-powered payment follow-up system that coordinates specialised agents to automate invoice monitoring, customer reply understanding, follow-up recommendations, and payment reconciliation. Laya acts as the decision layer, classifying business events and routing them to the appropriate workflow, while DeepSeek handles language-intensive tasks such as interpreting customer replies and drafting professional reminders. Deterministic business rules, permission checks, human approvals, and audit logs help ensure that financial actions remain controlled, traceable, and reliable.

### Key Features

- AI-Powered Invoice Processing — Extracts and validates invoice information, identifies missing fields, and detects potential duplicates.

- Intelligent Payment Monitoring — Tracks due dates and overdue invoices, schedules reminders, and prevents unnecessary follow-ups when payment is verified.

- Laya Decision Engine — Classifies customer events and routes them to the appropriate agent or human reviewer.

- AI Customer Reply Understanding — Interprets payment promises, payment claims, extension requests, and invoice disputes.

- Automated Follow-up Management — Recommends collection actions, drafts professional reminders, and supports approval-controlled message delivery.

- Payment Reconciliation — Matches payment transactions with invoices and flags partial payments, discrepancies, and unmatched records.

- Human Approval & Audit Trail — Supports review of sensitive or uncertain actions and records workflow decisions and execution results.

- Interactive 3D Agent Dashboard — Provides a Minecraft-inspired, Three.js office interface where users can explore departments and access their respective dashboards.

### Tech Stack

| Layer                    | Technology                                     |
| ------------------------ | ---------------------------------------------- |
| Frontend                 | React, TypeScript, Three.js, React Three Fiber |
| Backend                  | Python, FastAPI (proposed)                     |
| Database                 | PostgreSQL (proposed)                          |
| AI / Decision Layer      | Laya                                           |
| AI / Language Processing | DeepSeek                                       |
| Document Processing      | Docling, Pydantic                              |
| Agent Orchestration      | LangGraph (proposed)                           |
| Development Optimisation | Google Research Harness²                       |
| Hosting / Dev            | Replit                                         |

---

## Project Structure

```
UMvengers-Orbyte/
├── docs/
│   ├── architecture.md
│   ├── project-flow.md
│   ├── screenshots/
│   └── diagrams/
│
├── runpod/
│   ├── handler.py              # RunPod serverless entry point
│   └── README.md
│
├── src/
│   ├── main.py                 # Application entry point
│   ├── config.py               # Environment and application settings
│   ├── utils.py                # Shared utility functions
│   │
│   ├── api/
│   │   └── routes.py           # API endpoints, if using FastAPI
│   │
│   ├── ingestion/
│   │   ├── invoice_parser.py    # Invoice document extraction
│   │   └── validation.py       # Schema and data validation
│   │
│   ├── agents/
│   │   ├── payment_monitor.py  # Due and overdue payment monitoring
│   │   ├── decision_router.py  # Laya decision and event routing
│   │   ├── reply_analyzer.py   # DeepSeek customer-reply analysis
│   │   ├── follow_up.py        # Reminder strategy and message drafting
│   │   ├── reconciliation.py   # Payment matching and exceptions
│   │   └── orchestrator.py     # Workflow coordination
│   │
│   ├── services/
│   │   ├── messaging.py        # Authorised message delivery
│   │   ├── approvals.py        # Human approval workflow
│   │   └── audit.py             # Action and event logging
│   │
│   └── schemas/
│       ├── invoice.py
│       └── payment.py
│
├── skills/
│   ├── invoice-ingestion/
│   │   └── SKILL.md
│   ├── payment-monitoring/
│   │   └── SKILL.md
│   ├── decision-routing/
│   │   └── SKILL.md
│   ├── customer-reply-understanding/
│   │   └── SKILL.md
│   ├── collection-policy/
│   │   └── SKILL.md
│   ├── payment-reconciliation/
│   │   └── SKILL.md
│   └── audit-and-recovery/
│       └── SKILL.md
│
├── tests/
│   ├── test_utils.py
│   ├── test_ingestion.py
│   ├── test_decision_router.py
│   ├── test_follow_up.py
│   └── test_reconciliation.py
│
├── submission/
│   ├── SDC2026_UMvengers_Preliminary.pdf
│   ├── SDC2026_UMvengers_TechDeclaration.pdf
│   ├── SDC2026_UMvengers_Replit_POU.pdf
│   └── Orbyte-Slide-Deck.pptx
│
├── .env.example
├── .gitignore
├── .replit
├── LICENSE
├── requirements.txt
└── README.md
```

### Architecture

```
             User
               │
               ▼
      Orbyte Web Dashboard
               │
               ▼
      Backend / API (Render)
               │
       ┌───────┴────────┐
       ▼                ▼
  AI Services        PostgreSQL
  ├─ Laya            Invoice & Payment
  └─ DeepSeek API    Records
       │                │
       └───────┬────────┘
               ▼
     Workflow Orchestrator
          (LangGraph)
               │
               ▼
    Human Approval if Needed
               │
               ▼
    Follow-up & Status Update
```

---

## How to Run

## Option 1 — Run on Replit (Recommended)

1. Open the Replit Project, or import this repository via Create Repl → Import from GitHub:

```
https://github.com/AlyssaWoe/UMvengers-Orbyte.git
```

2. Open the Secrets tab (🔒) and add the variables listed in .env.example:

- RUNPOD_API_KEY (your DeepSeek API key, or a RunPod key)
- RUNPOD_ENDPOINT_URL (https://api.deepseek.com/chat/completions or your RunPod endpoint URL)
- RUNPOD_MODEL (deepseek-flash)

3. Click Run. The run command is defined in `.replit`, so Replit starts:

```
run = "python run.py"
entrypoint = "run.py"
[env] PORT = "8000"
[[ports]] localPort = 8000  externalPort = 80

```

The app listens on `0.0.0.0:8000`; `.replit` maps that port to the web preview. No manual run configuration is needed.

## Option 2 — Run Locally

```
# 1. Clone the repository
git clone https://github.com/AlyssaWoe/UMvengers-Orbyte.git
cd UMvengers-Orbyte
# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate
# Windows (PowerShell / Command Prompt):
# venv\Scripts\activate
# 3. Install dependencies
pip install -r requirements.txt
# 4. Configure environment variables
cp .env.example .env
# Windows: copy .env.example .env
# Fill in your RUNPOD_API_KEY and RUNPOD_ENDPOINT_URL inside .env
# 5. Run the app
python run.py
# Or directly via module:
python -m backend.app
```

Run Tests & Validation

```
# Run backend and RunPod handler selftests
python tools/runpod_selftest.py
# Health & status check against running server (http://localhost:8000)
curl http://localhost:8000/api/status
curl http://localhost:8000/api/config/runpod
```

---

## How We Use Replit

- **Development:** the repository is imported into Replit from GitHub and run there as the submission environment.
- **Secrets:** when a key is configured, RunPod/DeepSeek credentials are held in Replit Secrets and read from the environment. The application never writes an API key to disk — the RunPod client refuses to persist one, and a masked placeholder pasted back into the config form is rejected rather than applied.
- **Runtime:** the Flask app listens on `0.0.0.0:8000`. Render starts it with gunicorn via the `Procfile`; Replit starts it with `python run.py` as defined in `.replit`. The prebuilt frontend is served from the committed `frontend/park/build/`.

📄 Proof of use: [`submission/SDC2026_UMvengers_Replit_POU.pdf`](submission/SDC2026_UMvengers_Replit_POU.pdf)

## Challenges & Learnings

- **Challenges Faced:** Designing a multi-agent AI workflow was challenging because each agent needed to handle different tasks while keeping the overall process reliable and efficient. We addressed this by dividing Orbyte into smaller components for invoice validation, payment monitoring, customer reply understanding, and follow-up decisions. We also recognised the importance of human approval for uncertain or sensitive cases.

- **What We Learned:** Our team learned how AI APIs, database architecture, workflow orchestration, and cloud deployment can work together to solve real business problems. We also learned that successful AI solutions require more than automation: data accuracy, clear workflows, cost control, and human oversight are essential for building a practical and trustworthy product for SMEs.

## Future Improvements

- **Improved AI Accuracy and Automation** — Enhance Orbyte's AI agents to better understand customer replies, recommend suitable follow-up actions, and automate payment reconciliation while maintaining human oversight for sensitive cases.
- **Real-World Integrations and Scalability** — Integrate email, WhatsApp, and accounting or banking systems to enable smoother payment follow-ups, real-time status updates, and support for more SMEs at an affordable cost.

## Team

| Name          | Role                                | GitHub                                     |
| ------------- | ----------------------------------- | ------------------------------------------ |
| Wong Hanz     | Team Lead / Backend                 | [@wonghanz](https://github.com/wonghanz)   |
| Yeap Yi Theng | Frontend                            | [@yeap01](https://github.com/yeap01)       |
| Woe Xin Yi    | AI / RunPod                         | [@AlyssaWoe](https://github.com/AlyssaWoe) |
| Leow Yi Han   | Database / Integration & Deployment | [@Han-bla](https://github.com/Han-bla)     |

---

## Submission Checklist

- [x] Team name, domain (Domain 1 / Domain 2) and SDG track filled in
- [x] Slide deck link added
- [ ] Demo video link added
- [x] Replit used, with proof of use in `submission/`
- [x] Preliminary submission completed (`submission/SDC2026_UMvengers_Preliminary.pdf`)
- [x] Technology declaration completed (`submission/SDC2026_UMvengers_TechDeclaration.pdf`)
- [x] Submission files renamed with your team name (replace `TeamName`)
- [x] "How to Run" steps verified
- [x] No API keys or secrets committed to the repository

## License

This project is licensed under the [Apache License 2.0](LICENSE).
