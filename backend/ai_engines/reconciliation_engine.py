"""
Agent 6: Payment Reconciliation & Exceptions Engine
Deterministic matching of incoming bank transactions to invoices.
Core Safety Rule: Models never post financial ledger updates. Only verified transactions and deterministic code alter financial status.
"""
from typing import Optional, List, Dict, Any
from backend.models.schemas import BankTransaction, ReconciliationResult, ValidatedInvoice, WorkflowState
from backend.database.store import store
from backend.ai_engines.ledger import central_ledger

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
        Synchronizes directly with CentralLedger for partial or full payments.
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
                    evidence.append(f"Amount balances perfectly: TXN ${transaction.amount:,.2f} matches balance ${inv.balance_due:,.2f}")
                    # Apply ledger settlement
                    central_ledger.apply_partial_or_full_settlement(
                        invoice_id=inv.invoice_id,
                        transaction_id=transaction.transaction_id,
                        amount=transaction.amount,
                        date_str=transaction.date,
                        reference_memo=transaction.reference_note,
                        payer_entity=transaction.sender_name
                    )
                    return ReconciliationResult(
                        transaction_id=transaction.transaction_id,
                        matched_invoice_id=inv.invoice_id,
                        match_status="MATCHED_PAID",
                        confidence=1.0,
                        matched_amount=transaction.amount,
                        remaining_balance=0.0,
                        match_evidence=evidence,
                        requires_human_review=False,
                        notes=f"Full payment verified and allocated to {inv.invoice_id}. Ledger closed."
                    )
                
                # Partial payment
                elif transaction.amount < inv.balance_due:
                    new_bal = round(inv.balance_due - transaction.amount, 2)
                    evidence.append(f"Partial payment verified: TXN ${transaction.amount:,.2f} applied. Authoritative remaining balance: ${new_bal:,.2f}")
                    # Synchronize central authoritative ledger
                    central_ledger.apply_partial_or_full_settlement(
                        invoice_id=inv.invoice_id,
                        transaction_id=transaction.transaction_id,
                        amount=transaction.amount,
                        date_str=transaction.date,
                        reference_memo=transaction.reference_note,
                        payer_entity=transaction.sender_name
                    )
                    return ReconciliationResult(
                        transaction_id=transaction.transaction_id,
                        matched_invoice_id=inv.invoice_id,
                        match_status="PARTIALLY_PAID",
                        confidence=0.99,
                        matched_amount=transaction.amount,
                        remaining_balance=new_bal,
                        match_evidence=evidence,
                        requires_human_review=False,
                        notes=f"Partial settlement of ${transaction.amount:,.2f} recognized for {inv.invoice_id}. Ledger updated (Remaining: ${new_bal:,.2f})."
                    )
                
                # Overpayment exception
                else:
                    over_amt = round(transaction.amount - inv.balance_due, 2)
                    evidence.append(f"Overpayment exception: TXN ${transaction.amount:,.2f} exceeds balance by ${over_amt:,.2f}")
                    return ReconciliationResult(
                        transaction_id=transaction.transaction_id,
                        matched_invoice_id=inv.invoice_id,
                        match_status="AMBIGUOUS_REVIEW",
                        confidence=0.85,
                        matched_amount=inv.balance_due,
                        remaining_balance=0.0,
                        match_evidence=evidence,
                        requires_human_review=True,
                        notes=f"Overpayment exception on {inv.invoice_id}: credit memo required for ${over_amt:,.2f}."
                    )

        # Tier 2: Customer Name Match + Amount Match
        name_matches = []
        for inv in candidate_invoices:
            if inv.balance_due > 0.01:
                cust_norm = inv.customer_name.lower().split()[0]
                sender_norm = transaction.sender_name.lower()
                
                if cust_norm in sender_norm:
                    if abs(inv.balance_due - transaction.amount) <= cls.TOLERANCE:
                        name_matches.append((inv, "full"))
                    elif transaction.amount < inv.balance_due:
                        name_matches.append((inv, "partial"))

        if len(name_matches) == 1:
            matched_inv, pmt_type = name_matches[0]
            evidence.append(f"Sender name correlation: '{transaction.sender_name}' corresponds to '{matched_inv.customer_name}'")
            
            if pmt_type == "full":
                central_ledger.apply_partial_or_full_settlement(
                    invoice_id=matched_inv.invoice_id,
                    transaction_id=transaction.transaction_id,
                    amount=transaction.amount,
                    date_str=transaction.date,
                    reference_memo=transaction.reference_note,
                    payer_entity=transaction.sender_name
                )
                return ReconciliationResult(
                    transaction_id=transaction.transaction_id,
                    matched_invoice_id=matched_inv.invoice_id,
                    match_status="MATCHED_PAID",
                    confidence=0.95,
                    matched_amount=transaction.amount,
                    remaining_balance=0.0,
                    match_evidence=evidence,
                    requires_human_review=False,
                    notes=f"Matched by entity name and settled in full."
                )
            else:
                new_bal = round(matched_inv.balance_due - transaction.amount, 2)
                central_ledger.apply_partial_or_full_settlement(
                    invoice_id=matched_inv.invoice_id,
                    transaction_id=transaction.transaction_id,
                    amount=transaction.amount,
                    date_str=transaction.date,
                    reference_memo=transaction.reference_note,
                    payer_entity=transaction.sender_name
                )
                return ReconciliationResult(
                    transaction_id=transaction.transaction_id,
                    matched_invoice_id=matched_inv.invoice_id,
                    match_status="PARTIALLY_PAID",
                    confidence=0.92,
                    matched_amount=transaction.amount,
                    remaining_balance=new_bal,
                    match_evidence=evidence,
                    requires_human_review=False,
                    notes=f"Partial settlement recognized by entity name match."
                )

        # Tier 3: Unmatched Transaction -> Exception Review Queue
        evidence.append("No unambiguous invoice reference or payer matching found in active receivables ledger.")
        return ReconciliationResult(
            transaction_id=transaction.transaction_id,
            matched_invoice_id=None,
            match_status="UNMATCHED",
            confidence=0.0,
            matched_amount=0.0,
            remaining_balance=transaction.amount,
            match_evidence=evidence,
            requires_human_review=True,
            notes="Unmatched incoming transaction routed to Human Exceptions Investigation Queue."
        )

reconciliation_engine = ReconciliationEngine()
