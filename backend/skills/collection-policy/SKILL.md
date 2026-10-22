---
name: collection-policy
description: Deterministic policy checks, message synthesis, and human approval queue triggers.
version: 1.0.0
---

# Collection Policy & Follow-up Skill

## 1. Purpose & Scope
Synthesizes professional, tone-regulated follow-up messages according to SME aging brackets. Enforces deterministic pre-action checks and routes high-risk or aged balances to human approval before transmission.

## 2. Inputs & Output Schema
- **Inputs**: Validated invoice, days overdue, contact communication history, dispute flag.
- **Output Schema**: `CollectionStrategyRecommendation` containing `tone`, `recommended_channel`, `subject`, `message_body`, `pre_action_checks`, `requires_approval`, `approval_reason`, `idempotency_key`.

## 3. Approved Tools & Data Sources
- DeepSeek draft generation engine.
- Deterministic policy rules table.
- Controlled messaging dispatcher (Email/WhatsApp).

## 4. Ordered Workflow
1. Verify pre-action checklist (invoice open, not disputed, not in quiet hours, frequency limit).
2. Select tone based on overdue duration:
   - $1-7$ days: Gentle reminder (pre-authorized).
   - $8-21$ days: Polite follow-up (approval required if balance $> \$5,000$).
   - $> 21$ days: Formal demand (mandatory supervisor approval).
3. Draft clear, polite, and factually grounded reminder message.
4. If approval required, pause workflow and push task to Agent 7 Approval Queue.
5. If pre-authorized, dispatch via authorized API and log provider receipt.

## 5. Evidence & Validation Rules
- Draft must include exact invoice ID and current outstanding balance.
- Idempotency key must guard against duplicate message dispatch.

## 6. Forbidden Actions
- **MUST NOT** send threatening, aggressive, or legally inaccurate language.
- **MUST NOT** contact customers during active dispute holds.

## 7. Failure & Escalation
- Failed message delivery triggers safe retry with exponential backoff (max 3 retries).
