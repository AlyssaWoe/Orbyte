"""
Centralized Accounts Receivable Ledger Service
Single Source of Truth (SSOT) for all financial balances and invoice settlement states.
Enforces the core financial safety rule: AI models recommend; only the deterministic ledger controls financial truth.
"""
import uuid
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from backend.models.schemas import ValidatedInvoice, WorkflowState, BankTransaction
from backend.database.store import store

class CentralLedger:
    @staticmethod
    def get_invoice_balance(invoice_id: str) -> Optional[Dict[str, Any]]:
        """Reads the authoritative balance for an account/invoice."""
        inv = store.invoices.get(invoice_id)
        if not inv:
            return None
        return {
            "invoice_id": inv.invoice_id,
            "customer_name": inv.customer_name,
            "currency": inv.currency,
            "total_amount": round(inv.total_amount, 2),
            "amount_paid": round(getattr(inv, "amount_paid", 0.0), 2),
            "balance_due": round(inv.balance_due, 2),
            "current_state": inv.current_state.value,
            "payment_history": getattr(inv, "payment_history", []),
            "last_synced_at": datetime.now().isoformat()
        }

    @staticmethod
    def apply_partial_or_full_settlement(
        invoice_id: str,
        transaction_id: str,
        amount: float,
        date_str: str = "",
        reference_memo: str = "",
        payer_entity: str = ""
    ) -> Dict[str, Any]:
        """
        Atomically applies a verified bank payment to the invoice ledger.
        Synchronizes balance_due, amount_paid, and state across Agent 2 and Agent 6.
        """
        inv = store.invoices.get(invoice_id)
        if not inv:
            return {"success": False, "error": f"Invoice {invoice_id} not found in authoritative ledger"}

        old_balance = inv.balance_due
        old_state = inv.current_state.value
        settlement_date = date_str or date.today().isoformat()

        # Deterministic financial math
        new_paid = round(getattr(inv, "amount_paid", 0.0) + amount, 2)
        new_balance = round(max(0.0, inv.total_amount - new_paid), 2)
        
        inv.amount_paid = new_paid
        inv.balance_due = new_balance

        payment_entry = {
            "payment_id": f"PMT-{uuid.uuid4().hex[:6].upper()}",
            "transaction_id": transaction_id,
            "amount": amount,
            "date": settlement_date,
            "reference_memo": reference_memo,
            "payer_entity": payer_entity,
            "previous_balance": old_balance,
            "remaining_balance": new_balance,
            "timestamp": datetime.now().isoformat()
        }
        if not hasattr(inv, "payment_history") or inv.payment_history is None:
            inv.payment_history = []
        inv.payment_history.append(payment_entry)

        # Transition state
        if new_balance <= 0.01:
            inv.current_state = WorkflowState.CLOSED
            new_state = WorkflowState.CLOSED.value
            action_name = "RECONCILIATION_FULL_PAYMENT"
            summary = f"Full payment of ${amount:,.2f} verified. Invoice {invoice_id} settled and closed."
        else:
            inv.current_state = WorkflowState.PARTIALLY_PAID
            new_state = WorkflowState.PARTIALLY_PAID.value
            action_name = "RECONCILIATION_PARTIAL_PAYMENT"
            summary = f"Partial payment of ${amount:,.2f} applied. Authoritative balance updated from ${old_balance:,.2f} to ${new_balance:,.2f}."

        wf_id = f"WF-{inv.invoice_id}"
        store.add_audit(
            workflow_id=wf_id,
            actor="Agent 6 / Authoritative Ledger",
            action=action_name,
            from_state=old_state,
            to_state=new_state,
            idempotency_key=f"ledger_pmt_{transaction_id}_{invoice_id}",
            summary=summary,
            meta={
                "transaction_id": transaction_id,
                "amount_settled": amount,
                "previous_balance": old_balance,
                "authoritative_balance": new_balance
            }
        )
        store.save()

        return {
            "success": True,
            "invoice_id": invoice_id,
            "previous_balance": old_balance,
            "amount_settled": amount,
            "remaining_balance": new_balance,
            "amount_paid": new_paid,
            "current_state": new_state,
            "payment_entry": payment_entry
        }

    @staticmethod
    def get_full_ledger_statement() -> List[Dict[str, Any]]:
        """Returns authoritative snapshot for all accounts to ensure zero UI discrepancy."""
        statements = []
        for inv in store.invoices.values():
            statements.append({
                "invoice_id": inv.invoice_id,
                "customer_name": inv.customer_name,
                "customer_email": inv.customer_email,
                "issue_date": inv.issue_date,
                "due_date": inv.due_date,
                "currency": inv.currency,
                "total_amount": round(inv.total_amount, 2),
                "amount_paid": round(getattr(inv, "amount_paid", 0.0), 2),
                "balance_due": round(inv.balance_due, 2),
                "current_state": inv.current_state.value,
                "validation_status": inv.validation_status,
                "payment_count": len(getattr(inv, "payment_history", [])),
                "payments": getattr(inv, "payment_history", [])
            })
        return statements

central_ledger = CentralLedger()
