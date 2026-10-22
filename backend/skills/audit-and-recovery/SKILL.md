---
name: audit-and-recovery
description: Durable workflow execution, state persistence, HITL interrupts, and immutable audit logs.
version: 1.0.0
---

# Audit, Approval & Recovery Skill

## 1. Purpose & Scope
Coordinates state transitions across all agents using LangGraph-style durable workflow patterns. Manages human-in-the-loop interrupts, persists execution state against service restarts, and records immutable audit logs.

## 2. Inputs & Output Schema
- **Inputs**: Incoming business event, current workflow instance, actor identity.
- **Output Schema**: `AuditEvent` entry, updated `WorkflowState`, and `ApprovalTask` if an interrupt is triggered.

## 3. Approved Tools & Data Sources
- LangGraph state machine coordinator.
- PostgreSQL transaction store.
- Cryptographic hash idempotency generator.

## 4. Ordered Workflow
1. Check event idempotency key to prevent duplicate event execution.
2. Load current persistent workflow state.
3. Validate permissions and business prerequisites.
4. If action requires approval $\rightarrow$ transition to `ACTION_PENDING_APPROVAL`, save checkpoint, and await user action.
5. On resume $\rightarrow$ verify state consistency, execute side effects only once, and log provider response.
6. Record audit entry with actor, timestamp, input reference, decision, model version, and idempotency key.

## 5. Evidence & Validation Rules
- Every state transition must be recorded in the audit trail.
- Side effects must never execute without prior checkpoint persistence.

## 6. Forbidden Actions
- **MUST NOT** bypass access control or approval checkpoints.
- **MUST NOT** repeat completed side effects during workflow retries.

## 7. Failure & Escalation
- Unhandled system exceptions transition workflow to `NEEDS_HUMAN_REVIEW` and alert operations.
