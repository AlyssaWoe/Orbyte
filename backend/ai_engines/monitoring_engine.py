"""
Agent 2: Payment Monitoring Engine
Deterministic Python business rules.
Calculates invoice states, overdue durations, quiet hours, and follow-up eligibility.
Core Safety Rule: Models never decide if an invoice is paid; only verified financial ledger state controls this.
"""
from datetime import datetime, date, time
from typing import Dict, Any, Tuple
from backend.models.schemas import ValidatedInvoice, WorkflowState

class MonitoringEngine:
    @staticmethod
    def evaluate_invoice_status(invoice: ValidatedInvoice) -> Dict[str, Any]:
        """
        Evaluates the current state of an invoice against business policy rules.
        """
        today = date.today()
        
        # Parse due date
        try:
            due_dt = datetime.strptime(invoice.due_date, "%Y-%m-%d").date()
        except Exception:
            # Fallback if formatted differently
            due_dt = today

        days_overdue = (today - due_dt).days
        is_overdue = days_overdue > 0
        
        # 1. Stop condition: Paid
        if invoice.balance_due <= 0.01:
            return {
                "invoice_id": invoice.invoice_id,
                "current_state": WorkflowState.CLOSED.value,
                "days_overdue": 0,
                "is_overdue": False,
                "eligible_for_followup": False,
                "stop_reason": "INVOICE_FULLY_PAID",
                "next_check": "None (Reconciled & Closed)",
                "quiet_hours_active": False,
                "policy_summary": "Balance is zero. Normal collection halted permanently."
            }

        # 2. Stop condition: Dispute under review
        if invoice.current_state == WorkflowState.DISPUTED:
            return {
                "invoice_id": invoice.invoice_id,
                "current_state": WorkflowState.DISPUTED.value,
                "days_overdue": days_overdue,
                "is_overdue": is_overdue,
                "eligible_for_followup": False,
                "stop_reason": "DISPUTE_ACTIVE_HOLD",
                "next_check": "Pending Dispute Staff Resolution",
                "quiet_hours_active": False,
                "policy_summary": "Customer flagged billing dispute. Ordinary collection paused pursuant to SME policy Section 4.2."
            }

        # 3. Stop condition: Customer promised future payment
        if invoice.current_state == WorkflowState.WAITING_FOR_PAYMENT:
            return {
                "invoice_id": invoice.invoice_id,
                "current_state": WorkflowState.WAITING_FOR_PAYMENT.value,
                "days_overdue": days_overdue,
                "is_overdue": is_overdue,
                "eligible_for_followup": False,
                "stop_reason": "PROMISED_PAYMENT_GRACE",
                "next_check": "Check again on promised commitment date",
                "quiet_hours_active": False,
                "policy_summary": "Customer committed to payment date. Reminders temporarily paused pending bank statement intake."
            }

        # 4. Check quiet hours (e.g., 9:00 AM to 6:00 PM business hours)
        now_time = datetime.now().time()
        in_quiet_hours = not (time(9, 0) <= now_time <= time(18, 0))

        # 5. Overdue eligibility
        if is_overdue:
            recommended_state = WorkflowState.FOLLOW_UP_ELIGIBLE
            action_desc = f"{days_overdue} days overdue. Eligible for reminder strategy."
        else:
            recommended_state = WorkflowState.MONITORING
            action_desc = f"Upcoming due date in {abs(days_overdue)} days. Monitoring active."

        return {
            "invoice_id": invoice.invoice_id,
            "current_state": recommended_state.value,
            "days_overdue": max(0, days_overdue),
            "is_overdue": is_overdue,
            "eligible_for_followup": is_overdue and not in_quiet_hours,
            "stop_reason": "QUIET_HOURS" if (is_overdue and in_quiet_hours) else None,
            "next_check": "Tomorrow at 09:00 AM" if in_quiet_hours else "Immediate action recommended",
            "quiet_hours_active": in_quiet_hours,
            "policy_summary": action_desc
        }

monitoring_engine = MonitoringEngine()
