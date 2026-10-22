---
name: invoice-ingestion
description: Ingests raw invoices via Docling and validates fields using strict Pydantic schemas.
version: 1.0.0
---

# Invoice Ingestion & Validation Skill

## 1. Purpose & Scope
Extracts invoice fields from uploaded documents, PDFs, images, and raw accounting feeds. Validates data completeness, schema conformance, and checks for duplicate submissions before persisting records.

## 2. Inputs & Output Schema
- **Inputs**: Raw invoice document bytes or text, source filename, optional metadata hints.
- **Output Schema**: `ValidatedInvoice` (Pydantic model) containing `invoice_id`, `customer_id`, `customer_name`, `customer_email`, `issue_date`, `due_date`, `currency`, `total_amount`, `balance_due`, `items`, `validation_status`, `confidence_score`.

## 3. Approved Tools & Data Sources
- Docling document parsing engine.
- Pydantic v2 validation library.
- PostgreSQL database persistence layer.

## 4. Ordered Workflow
1. Detect file format and layout characteristics.
2. Extract text and candidate key-value pairs (Header, Customer, Dates, Amounts).
3. Validate required fields (Invoice ID, Due Date, Total, Customer Contact).
4. Normalise date formats (`YYYY-MM-DD`) and ISO currency codes.
5. Check against existing invoices in database to prevent duplicates.
6. Verify line items total matches overall header amount.
7. Save validated record with state `VALIDATED` or route to `NEEDS_DATA_REVIEW`.

## 5. Evidence & Validation Rules
- Extraction confidence must be $\ge 0.85$.
- Line items sum must balance with the total amount within $\pm 0.05$.

## 6. Forbidden Actions
- **MUST NOT** invent or hallucinate missing invoice IDs, dates, or financial totals.
- **MUST NOT** silently overwrite existing records upon duplicate detection.

## 7. Failure, Retry & Escalation
- Corrupt document $\rightarrow$ flag parsing failure and alert staff.
- Missing required fields $\rightarrow$ route invoice to Exception Review Queue.
- Duplicate detected $\rightarrow$ link intake event to existing invoice without creating duplicate task.
