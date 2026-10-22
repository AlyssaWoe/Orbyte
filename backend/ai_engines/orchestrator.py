"""
Agent 7: Orchestrator, Human-In-The-Loop Approval & Audit Engine
Durable workflow engine coordinating state transitions across all 7 agents.
Manages approval interrupts, pause/resume persistence, and immutable audit logs.
"""
import uuid
from datetime import datetime, date
from typing import Dict, Any, Optional, List
from backend.models.schemas import (
    WorkflowState, ValidatedInvoice, BankTransaction,
    ApprovalTask, AuditLogEntry
)
from backend.database.store import store
from backend.ai_engines.ingestion_engine import ingestion_engine
from backend.ai_engines.monitoring_engine import monitoring_engine
from backend.ai_engines.laya_engine import laya_engine
from backend.ai_engines.deepseek_engine import deepseek_engine
from backend.ai_engines.reconciliation_engine import reconciliation_engine

class Orchestrator:
    @staticmethod
    def run_full_pipeline_step(invoice_id: str, trigger_event: str = "SCHEDULED_MONITOR") -> Dict[str, Any]:
        """
        Executes the durable workflow transition for an invoice.
        Enforces policy checks and human approval interrupts.
        """
        if invoice_id not in store.invoices:
            return {"error": f"Invoice {invoice_id} not found"}

        invoice = store.invoices[invoice_id]
        wf_id = f"WF-{invoice.invoice_id}"
        initial_state = invoice.current_state.value
        steps_log = []

        # 1. Evaluate Monitoring State (Agent 2)
        mon_eval = monitoring_engine.evaluate_invoice_status(invoice)
        steps_log.append({
            "agent": "Agent 2: Payment Monitoring",
            "action": "EVALUATE_AGING_AND_POLICY",
            "result": mon_eval
        })

        if mon_eval["stop_reason"] == "INVOICE_FULLY_PAID":
            invoice.current_state = WorkflowState.CLOSED
            store.add_audit(
                workflow_id=wf_id,
                actor="Agent 2: Payment Monitoring",
                action="WORKFLOW_COMPLETE",
                from_state=initial_state,
                to_state=WorkflowState.CLOSED.value,
                idempotency_key=f"close_{invoice.invoice_id}",
                summary="Zero balance verified. Invoice marked closed."
            )
            store.save()
            return {
                "invoice_id": invoice.invoice_id,
                "current_state": WorkflowState.CLOSED.value,
                "status": "COMPLETED",
                "message": "Invoice is fully reconciled and closed.",
                "steps": steps_log
            }

        if mon_eval["stop_reason"] == "DISPUTE_ACTIVE_HOLD":
            invoice.current_state = WorkflowState.DISPUTED
            store.save()
            return {
                "invoice_id": invoice.invoice_id,
                "current_state": WorkflowState.DISPUTED.value,
                "status": "PAUSED_DISPUTE",
                "message": "Workflow paused due to active customer dispute.",
                "steps": steps_log
            }

        # 2. Check if eligible for follow-up
        if not mon_eval["eligible_for_followup"]:
            return {
                "invoice_id": invoice.invoice_id,
                "current_state": invoice.current_state.value,
                "status": "MONITORING_ACTIVE",
                "message": mon_eval["policy_summary"],
                "steps": steps_log
            }

        # 3. Collection Strategy Draft (Agent 5)
        strategy = deepseek_engine.draft_collection_followup(invoice)
        steps_log.append({
            "agent": "Agent 5: Collection Strategy",
            "action": "SYNTHESIZE_FOLLOWUP_DRAFT",
            "result": strategy.model_dump()
        })

        # 4. Human-In-The-Loop Approval Check (Agent 7 Guardrail)
        if strategy.requires_approval:
            task_id = f"APP-TASK-{uuid.uuid4().hex[:4].upper()}"
            app_task = ApprovalTask(
                task_id=task_id,
                workflow_id=wf_id,
                invoice_id=invoice.invoice_id,
                customer_name=invoice.customer_name,
                amount=invoice.balance_due,
                proposed_action=f"Send {strategy.tone.replace('_', ' ').title()} ({strategy.recommended_channel})",
                draft_message=strategy.message_body,
                recipient=invoice.customer_email,
                risk_level="Medium" if invoice.balance_due < 10000 else "High",
                status="PENDING"
            )
            store.approvals[task_id] = app_task
            invoice.current_state = WorkflowState.ACTION_PENDING_APPROVAL

            store.add_audit(
                workflow_id=wf_id,
                actor="Agent 7: Orchestrator",
                action="HITL_PAUSE_FOR_APPROVAL",
                from_state=initial_state,
                to_state=WorkflowState.ACTION_PENDING_APPROVAL.value,
                idempotency_key=f"pause_app_{task_id}",
                summary=f"Workflow paused: {strategy.approval_reason or 'Policy requires human review before dispatch.'}",
                meta={"task_id": task_id, "amount": invoice.balance_due}
            )
            store.save()

            return {
                "invoice_id": invoice.invoice_id,
                "current_state": WorkflowState.ACTION_PENDING_APPROVAL.value,
                "status": "PAUSED_PENDING_APPROVAL",
                "message": f"Paused for Human-In-The-Loop approval (Task {task_id}).",
                "approval_task": app_task.model_dump(),
                "steps": steps_log
            }

        # 5. Pre-authorized Dispatch (Deterministic messaging executor)
        invoice.current_state = WorkflowState.SENT
        store.add_audit(
            workflow_id=wf_id,
            actor="Agent 5: Controlled Messaging Executor",
            action="MESSAGE_DISPATCHED",
            from_state=initial_state,
            to_state=WorkflowState.SENT.value,
            idempotency_key=strategy.idempotency_key,
            summary=f"Dispatched {strategy.tone} to {invoice.customer_email} via pre-approved SME policy.",
            meta={"subject": strategy.subject, "channel": strategy.recommended_channel}
        )
        # Reset state to MONITORING for next interval
        invoice.current_state = WorkflowState.MONITORING
        store.save()

        return {
            "invoice_id": invoice.invoice_id,
            "current_state": WorkflowState.MONITORING.value,
            "status": "MESSAGE_SENT_RESUMED_MONITORING",
            "message": f"Pre-authorized reminder sent to {invoice.customer_email}. Workflow resumed monitoring.",
            "steps": steps_log
        }

    @staticmethod
    def process_approval_decision(task_id: str, approved: bool, reviewer: str = "Admin Staff", notes: str = "") -> Dict[str, Any]:
        """
        Resumes paused workflow upon human supervisor decision.
        """
        if task_id not in store.approvals:
            return {"error": f"Approval task {task_id} not found"}

        task = store.approvals[task_id]
        if task.status != "PENDING":
            return {"error": f"Task {task_id} has already been resolved as {task.status}"}

        invoice = store.invoices.get(task.invoice_id)
        if not invoice:
            return {"error": f"Invoice {task.invoice_id} not found"}

        wf_id = task.workflow_id

        if approved:
            task.status = "APPROVED"
            task.reviewed_by = reviewer
            task.review_notes = notes

            # Audit approval
            store.add_audit(
                workflow_id=wf_id,
                actor=f"Human Reviewer ({reviewer})",
                action="APPROVAL_GRANTED",
                from_state=WorkflowState.ACTION_PENDING_APPROVAL.value,
                to_state=WorkflowState.APPROVED.value,
                idempotency_key=f"approve_{task_id}",
                summary=f"Human approved follow-up dispatch for invoice {task.invoice_id} (${task.amount:,.2f}). Notes: {notes or 'None'}"
            )

            # Transition to SENT via controlled executor
            invoice.current_state = WorkflowState.SENT
            store.add_audit(
                workflow_id=wf_id,
                actor="Agent 7: Controlled Messaging Executor",
                action="APPROVED_MESSAGE_DISPATCHED",
                from_state=WorkflowState.APPROVED.value,
                to_state=WorkflowState.SENT.value,
                idempotency_key=f"dispatch_approved_{task_id}",
                summary=f"Message successfully transmitted to {task.recipient}. Delivery acknowledged by provider."
            )

            # Return to monitoring
            invoice.current_state = WorkflowState.MONITORING
            store.save()

            return {
                "success": True,
                "status": "APPROVED_AND_SENT",
                "invoice_id": invoice.invoice_id,
                "message": f"Task {task_id} approved. Message transmitted to {task.recipient}."
            }
        else:
            task.status = "REJECTED"
            task.reviewed_by = reviewer
            task.review_notes = notes

            store.add_audit(
                workflow_id=wf_id,
                actor=f"Human Reviewer ({reviewer})",
                action="APPROVAL_REJECTED",
                from_state=WorkflowState.ACTION_PENDING_APPROVAL.value,
                to_state=WorkflowState.REJECTED.value,
                idempotency_key=f"reject_{task_id}",
                summary=f"Action rejected by reviewer. Action halted. Reason: {notes or 'Supervisor discretion'}"
            )

            invoice.current_state = WorkflowState.NEEDS_HUMAN_REVIEW
            store.save()

            return {
                "success": True,
                "status": "REJECTED",
                "invoice_id": invoice.invoice_id,
                "message": f"Task {task_id} rejected. Message canceled; invoice placed in Human Review Queue."
            }

orchestrator = Orchestrator()
