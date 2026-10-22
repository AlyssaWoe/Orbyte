---
name: decision-routing
description: Non-autoregressive scoring of fixed candidate labels with calibrated threshold routing.
version: 1.0.0
---

# Laya Decision & Routing Skill

## 1. Purpose & Scope
Evaluates inbound business communications against fixed categorical labels (`payment_promise`, `already_paid_claim`, `invoice_dispute`, `request_for_extension`, `unclear`, `other`) and routes events to the appropriate workflow branch.

## 2. Inputs & Output Schema
- **Inputs**: Sanitized message text, sender identifier, invoice metadata context.
- **Output Schema**: `LayaRoutingResult` with `chosen_label`, `confidence`, `calibrated_threshold` (0.75), `passed_calibration`, `route_target`, `all_scores`.

## 3. Approved Tools & Data Sources
- Laya Studio NAR inference engine.
- Calibrated probability matrix.

## 4. Ordered Workflow
1. Receive clean message text and candidate label set.
2. Generate non-autoregressive option score distribution across all 6 labels.
3. Apply temperature calibration curve.
4. Compare top candidate confidence against threshold ($0.75$).
5. If confidence $< 0.75$ or label is `unclear`, route immediately to Safe Fallback / Human Review.
6. If calibrated confidence passes, route to matching agent (Agent 4, Agent 5, or Agent 6).

## 5. Evidence & Validation Rules
- Softmax probability sum across candidate labels must equal $1.00 \pm 0.01$.
- Routing justification must accompany every decision.

## 6. Forbidden Actions
- **MUST NOT** treat model probability as empirical proof that a customer's claim is factual.
- **MUST NOT** alter financial ledger entries directly from routing decisions.

## 7. Failure & Escalation
- Any ambiguous or adversarial input triggers immediate transfer to the human review queue.
