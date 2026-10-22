"""
Agent 6: Payment Reconciliation & Exceptions Engine
Deterministic matching of incoming bank transactions to invoices.
Core Safety Rule: Models never post financial ledger updates. Only verified transactions and deterministic code alter financial status.
"""
from typing import Optional, List, Dict, Any
from backend.models.schemas import BankTransaction, ReconciliationResult, ValidatedInvoice, WorkflowState
from backend.database.store import store

class ReconciliationEngine:
    TOLERANCE = 0.05

    @classmethod
    def match_transaction(
        cls,
        transaction: BankTransaction,
        candidate_invoices: Optional[List[ValidatedInvoice]] = None
    ) -> ReconciliationResult:
        """
        Executes strict multi-tier deterministic matching.
        """
        if candidate_invoices is None:
            candidate_invoices = list(store.invoices.values())

        ref_upper = transaction.reference_note.upper()
        evidence = []

        # Tier 1: Exact Invoice ID in reference note
        for inv in candidate_invoices:
            if inv.invoice_id in ref_upper:
                evidence.append(f"Explicit reference match: found '{inv.invoice_id}' in transaction note '{transaction.reference_note}'")
                
                # Check amounts
                diff = inv.balance_due - transaction.amount
                
                # Exact full match
                if abs(diff) <= cls.TOLERANCE:
                    evidence.append(f"Amount balances perfectly: TXN ${transaction.amount:.2f} matches balance ${inv.balance_due:.2f}")
                    return ReconciliationResult(
                        transaction_id=transaction.transaction_id,
                        matched_invoice_id=inv.invoice_id,
                        match_status="MATCHED_PAID",
                        confidence=1.0,
                        matched_amount=transaction.amount,
                        remaining_balance=0.0,
                        match_evidence=evidence,
                        requires_human_review=False,
                        notes=f"Full payment verified and allocated to {inv.invoice_id}."
                    )
                
                # Partial payment
                elif transaction.amount < inv.balance_due:
                    new_bal = inv.balance_due - transaction.amount
                    evidence.append(f"Partial payment: TXN ${transaction.amount:.2f} leaves remaining balance of ${new_bal:.2f}")
                    return ReconciliationResult(
                        transaction_id=transaction.transaction_id,
                        matched_invoice_id=inv.invoice_id,
                        match_status="PARTIALLY_PAID",
                        confidence=0.98,
                        matched_amount=transaction.amount,
                        remaining_balance=round(new_bal, 2),
                        match_evidence=evidence,
                        requires_human_review=False,
                        notes=f"Partial settlement recognized for {inv.invoice_id}. Outstanding balance adjusted."
                    )
                
                # Overpayment
                else:
                    over_amt = transaction.amount - inv.balance_due
                    evidence.append(f"Overpayment detected: TXN exceeds balance by ${over_amt:.2f}")
                    return ReconciliationResult(
                        transaction_id=transaction.transaction_id,
                        matched_invoice_id=inv.invoice_id,
                        match_status="AMBIGUOUS_REVIEW",
                        confidence=0.85,
                        matched_amount=inv.balance_due,
                        remaining_balance=0.0,
                        match_evidence=evidence,
                        requires_human_review=True,
                        notes=f"Overpayment exception on {inv.invoice_id}: credit memo required for ${over_amt:.2f}."
                    )

        # Tier 2: Customer Name Match + Exact Amount
        name_matches = []
        for inv in candidate_invoices:
            if inv.balance_due > 0:
                cust_norm = inv.customer_name.lower().split()[0] # e.g. "apex"
                sender_norm = transaction.sender_name.lower()
                
                if cust_norm in sender_norm:
                    if abs(inv.balance_due - transaction.amount) <= cls.TOLERANCE:
                        name_matches.append(inv)

        if len(name_matches) == 1:
            matched_inv = name_matches[0]
            evidence.append(f"Sender name correlation: '{transaction.sender_name}' corresponds to '{matched_inv.customer_name}'")
            evidence.append(f"Amount exact match: ${transaction.amount:.2f} balances open invoice {matched_inv.invoice_id}")
            return ReconciliationResult(
                transaction_id=transaction.transaction_id,
                matched_invoice_id=matched_inv.invoice_id,
                match_status="MATCHED_PAID",
                confidence=0.95,
                matched_amount=transaction.amount,
                remaining_balance=0.0,
                match_evidence=evidence,
                requires_human_review=False,
                notes=f"Secondary deterministic match confirmed against customer entity {matched_inv.customer_name}."
            )
        elif len(name_matches) > 1:
            evidence.append(f"Multiple open invoices for customer match amount ${transaction.amount:.2f}: {[i.invoice_id for i in name_matches]}")
            return ReconciliationResult(
                transaction_id=transaction.transaction_id,
                matched_invoice_id=None,
                match_status="AMBIGUOUS_REVIEW",
                confidence=0.50,
                matched_amount=0.0,
                remaining_balance=0.0,
                match_evidence=evidence,
                requires_human_review=True,
                notes="Ambiguous allocation: customer has multiple identical open balances. Human review required."
            )

        # Tier 3: Unmatched Transaction
        return ReconciliationResult(
            transaction_id=transaction.transaction_id,
            matched_invoice_id=None,
            match_status="UNMATCHED",
            confidence=0.0,
            matched_amount=0.0,
            remaining_balance=0.0,
            match_evidence=["No matching invoice ID, customer alias, or balance amount found in active ledger."],
            requires_human_review=True,
            notes="Unallocated bank deposit. Routed to Exception Queue for manual remittance advice matching."
        )

reconciliation_engine = ReconciliationEngine()
