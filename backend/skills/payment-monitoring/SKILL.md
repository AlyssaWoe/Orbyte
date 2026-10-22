---
name: payment-monitoring
description: Tracks invoice lifecycle, calculates aging brackets, and enforces quiet hours & stop conditions.
version: 1.0.0
---

# Payment Monitoring Skill

## 1. Purpose & Scope
Monitors invoice balances and aging schedules. Evaluates eligibility for reminder follow-ups using purely deterministic rules. Enforces quiet hours, dispute holds, and payment-promise grace windows.

## 2. Inputs & Output Schema
- **Inputs**: Current validated invoice record, system clock / timezone, active policy parameters.
- **Output Schema**: `MonitoringEvaluation` containing `days_overdue`, `is_overdue`, `eligible_for_followup`, `stop_reason`, `next_check`, `policy_summary`.

## 3. Approved Tools & Data Sources
- PostgreSQL invoice state store.
- Deterministic Python date calculation engine.
- Cron / background scheduler.

## 4. Ordered Workflow
1. Fetch latest verified invoice state from persistent storage.
2. Calculate days between current date and `due_date`.
3. Check stop conditions:
   - Balance $\le 0.00 \rightarrow$ stop reminders, invoice is closed.
   - Status is `DISPUTED` $\rightarrow$ halt normal collection pending human dispute review.
   - Status is `WAITING_FOR_PAYMENT` $\rightarrow$ pause reminders until promised date.
4. Check quiet hours: block communication outside 09:00 - 18:00 local recipient time.
5. If overdue and all stop conditions clear, mark state as `FOLLOW_UP_ELIGIBLE`.

## 5. Evidence & Validation Rules
- All temporal comparisons must use UTC-normalized dates.
- Verification must check current live database record, never stale cache.

## 6. Forbidden Actions
- **MUST NOT** use an LLM or statistical model to decide if an invoice was paid.
- **MUST NOT** trigger follow-up alerts during quiet hours or active dispute holds.

## 7. Failure & Escalation
- If database record is locked or unreachable, retry with exponential backoff.
- Invoices past 60 days overdue trigger mandatory supervisory review.
