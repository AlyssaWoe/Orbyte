---
name: payment-reconciliation
description: Strict deterministic matching of bank transactions to open invoices with tolerance checks.
version: 1.0.0
---

# Payment Reconciliation & Exceptions Skill

## 1. Purpose & Scope
Matches confirmed bank deposits and transactions against open accounts receivable. Distinguishes exact full settlements, partial payments, and unmatched exceptions.

## 2. Inputs & Output Schema
- **Inputs**: Verified `BankTransaction` record, list of open `ValidatedInvoice` records.
- **Output Schema**: `ReconciliationResult` with `match_status` (`MATCHED_PAID`, `PARTIALLY_PAID`, `UNMATCHED`, `AMBIGUOUS_REVIEW`), `matched_amount`, `remaining_balance`, `match_evidence`, `requires_human_review`.

## 3. Approved Tools & Data Sources
- Core bank feed transaction logs.
- Deterministic matching engine with $0.05 tolerance limit.
- PostgreSQL accounts receivable ledger.

## 4. Ordered Workflow
1. Parse transaction reference, amount, currency, and sender name.
2. Match Tier 1: Search reference note for explicit invoice ID.
   - If exact amount match $\rightarrow$ mark `MATCHED_PAID`; update balance to 0.00; close invoice.
   - If transaction $<$ balance $\rightarrow$ mark `PARTIALLY_PAID`; reduce balance by transaction amount; retain monitoring.
   - If transaction $>$ balance $\rightarrow$ mark `AMBIGUOUS_REVIEW`; flag overpayment.
3. Match Tier 2: Sender name alias match + exact amount balance.
4. Match Tier 3: If no reliable criteria match $\rightarrow$ mark `UNMATCHED` and escalate to exception queue.

## 5. Evidence & Validation Rules
- Transaction amounts and invoice currency must match identically.
- Reconciled status requires immutable transaction ID reference.

## 6. Forbidden Actions
- **MUST NOT** allow an LLM or probabilistic model to post financial transactions.
- **MUST NOT** close an invoice when a partial payment is received.

## 7. Failure & Escalation
- Conflicting customer name or duplicate deposits trigger mandatory human auditor review.
