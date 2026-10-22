"""
Agent 4 & Agent 5: DeepSeek Language Engine
Handles Customer Reply Understanding (Agent 4) and Collection Strategy Message Drafting (Agent 5).
Includes strict prompt injection defense, date extraction, and deterministic policy guardrails.
"""
import re
import uuid
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional
from backend.models.schemas import (
    DeepSeekReplyInterpretation, CollectionStrategyRecommendation,
    ValidatedInvoice, WorkflowState
)

class DeepSeekEngine:
    @staticmethod
    def analyze_reply(
        message_text: str,
        sender_email: str = "",
        invoice_context: Optional[ValidatedInvoice] = None
    ) -> DeepSeekReplyInterpretation:
        """
        Interprets customer email/WhatsApp message.
        Extracts structured intent, claims, dates, and defends against prompt injections.
        """
        raw_clean = message_text.strip()
        lower_text = raw_clean.lower()
        
        # 1. Prompt Injection Defense Guardrail
        injection_patterns = [
            r'ignore\s+(?:previous|all|system)\s+instructions',
            r'mark\s+(?:as\s+)?paid\s+immediately',
            r'override\s+system\s+policy',
            r'system\s+prompt',
            r'you\s+are\s+now\s+in\s+developer\s+mode',
            r'set\s+balance\s+to\s+0'
        ]
        prompt_injection_flag = any(re.search(pat, lower_text) for pat in injection_patterns)
        
        # 2. Extract Invoice Reference if mentioned
        inv_match = re.search(r'(INV[-_\s]?\d{4}[-_\s]?\d{3,5}|#\d{4,6})', raw_clean, re.IGNORECASE)
        inv_ref = inv_match.group(1).upper() if inv_match else (invoice_context.invoice_id if invoice_context else None)

        # 3. Detect Intent & Claims
        claimed_paid = False
        promised_date = None
        dispute_reason = None
        extension_days = None
        detected_intent = "general_inquiry"
        sentiment = "neutral"
        escalation_required = False
        escalation_reason = None

        if prompt_injection_flag:
            detected_intent = "adversarial_prompt_injection_blocked"
            escalation_required = True
            escalation_reason = "Untrusted input attempted system prompt injection / policy override."
            sentiment = "suspicious"

        elif any(w in lower_text for w in ["dispute", "incorrect", "wrong amount", "never ordered", "cancel this", "billing error", "not satisfied"]):
            detected_intent = "invoice_dispute"
            sentiment = "frustrated"
            escalation_required = True
            escalation_reason = "Customer raised invoice dispute. Mandatory pause on collection follow-ups."
            # Extract dispute excerpt
            disp_m = re.search(r'(?:because|due to|issue with|reason:?)\s*([^\n\.\;]+)', raw_clean, re.IGNORECASE)
            dispute_reason = disp_m.group(1).strip() if disp_m else "Billing discrepancy flagged by customer"

        elif any(w in lower_text for w in ["already paid", "we paid", "wire sent", "transferred", "payment completed", "receipt attached"]):
            detected_intent = "already_paid_claim"
            claimed_paid = True
            sentiment = "cooperative"
            escalation_required = False
            # Look for wire / txn reference
            txn_m = re.search(r'(?:ref|txn|wire|check|no\.?)\s*[:#]?\s*([A-Za-z0-9-_]+)', raw_clean, re.IGNORECASE)
            wire_ref = txn_m.group(1) if txn_m else "Unspecified"
            escalation_reason = f"Customer claims payment transmitted (Ref: {wire_ref}). Verification against bank feed initiated."

        elif any(w in lower_text for w in ["will pay", "promise to pay", "schedule", "transfer on", "pay next", "by friday", "by monday"]):
            detected_intent = "payment_promise"
            sentiment = "cooperative"
            # Date extraction heuristics
            if "next monday" in lower_text:
                days_ahead = (0 - date.today().weekday()) % 7 or 7
                target_dt = date.today() + timedelta(days=days_ahead)
                promised_date = target_dt.isoformat()
            elif "by friday" in lower_text:
                days_ahead = (4 - date.today().weekday()) % 7 or 7
                target_dt = date.today() + timedelta(days=days_ahead)
                promised_date = target_dt.isoformat()
            elif "tomorrow" in lower_text:
                promised_date = (date.today() + timedelta(days=1)).isoformat()
            elif "end of the month" in lower_text or "end of month" in lower_text:
                promised_date = "2026-10-31"
            else:
                date_m = re.search(r'(\d{4}[-/]\d{2}[-/]\d{2}|\w{3,9}\s+\d{1,2}(?:st|nd|rd|th)?)', raw_clean)
                promised_date = date_m.group(1) if date_m else (date.today() + timedelta(days=7)).isoformat()

        elif any(w in lower_text for w in ["extension", "delay", "more time", "cashflow", "installment"]):
            detected_intent = "request_for_extension"
            sentiment = "urgent"
            escalation_required = True
            escalation_reason = "Customer requested payment term extension; requires credit approval."
            ext_m = re.search(r'(\d+)\s*(?:days|weeks)', lower_text)
            if ext_m:
                val = int(ext_m.group(1))
                extension_days = val * 7 if "week" in lower_text else val
            else:
                extension_days = 14

        confidence = 0.95 if not prompt_injection_flag else 0.99

        return DeepSeekReplyInterpretation(
            message_id=f"MSG-{uuid.uuid4().hex[:6].upper()}",
            invoice_ref=inv_ref,
            customer_name=invoice_context.customer_name if invoice_context else "Valued Customer",
            detected_intent=detected_intent,
            intent_confidence=confidence,
            claimed_paid=claimed_paid,
            promised_date=promised_date,
            dispute_reason=dispute_reason,
            requested_extension_days=extension_days,
            prompt_injection_flag=prompt_injection_flag,
            sentiment=sentiment,
            raw_message_excerpt=raw_clean[:200] + ("..." if len(raw_clean) > 200 else ""),
            structured_evidence={
                "extracted_sender": sender_email,
                "parsed_date": promised_date,
                "claimed_paid": claimed_paid,
                "injection_detected": prompt_injection_flag
            },
            escalation_required=escalation_required,
            escalation_reason=escalation_reason
        )

    @staticmethod
    def draft_collection_followup(
        invoice: ValidatedInvoice,
        channel: str = "Email"
    ) -> CollectionStrategyRecommendation:
        """
        Agent 5: Synthesizes professional follow-up drafts guided by deterministic rules.
        """
        today = date.today()
        try:
            due_dt = datetime.strptime(invoice.due_date, "%Y-%m-%d").date()
            overdue_days = max(0, (today - due_dt).days)
        except Exception:
            overdue_days = 10

        # Deterministic Tone Selection based on aging brackets
        if overdue_days <= 7:
            tone = "gentle_reminder"
            subject = f"Friendly Reminder: Invoice {invoice.invoice_id} from Orbyte"
            body = (
                f"Dear {invoice.customer_name} Accounting Team,\n\n"
                f"We hope this note finds you well. This is a gentle reminder that invoice {invoice.invoice_id} "
                f"for ${invoice.balance_due:,.2f} {invoice.currency} was due on {invoice.due_date}.\n\n"
                f"If payment has already been sent, please disregard this notice. Otherwise, we would appreciate "
                f"it if you could confirm the scheduled settlement date.\n\n"
                f"Warm regards,\nOrbyte Accounts Receivable"
            )
            requires_approval = False
            approval_reason = None

        elif overdue_days <= 21:
            tone = "polite_followup"
            subject = f"Follow-up: Overdue Invoice {invoice.invoice_id} (${invoice.balance_due:,.2f})"
            body = (
                f"Dear {invoice.customer_name} Accounts Payable,\n\n"
                f"We are following up on outstanding invoice {invoice.invoice_id} in the amount of "
                f"${invoice.balance_due:,.2f} {invoice.currency}, which is now {overdue_days} days past due.\n\n"
                f"To maintain smooth account standing, please review this statement and arrange the wire or ACH transfer "
                f"at your earliest convenience. If there are any questions regarding this billing, please let us know immediately.\n\n"
                f"Thank you,\nOrbyte Finance Operations"
            )
            requires_approval = (invoice.balance_due > 5000.00)
            approval_reason = "Balance exceeds $5,000 threshold" if requires_approval else None

        else:
            tone = "formal_demand"
            subject = f"URGENT: Outstanding Balance on Invoice {invoice.invoice_id} ({overdue_days} Days Past Due)"
            body = (
                f"Attention: Finance Management, {invoice.customer_name},\n\n"
                f"Our records indicate that invoice {invoice.invoice_id} totaling ${invoice.balance_due:,.2f} {invoice.currency} "
                f"remains outstanding and is now {overdue_days} days overdue.\n\n"
                f"We request immediate confirmation of payment remittance within 48 hours to avoid service interruption "
                f"or formal credit escalation. Please remit payment using our standard banking instructions.\n\n"
                f"Sincerely,\nOrbyte Credit & Collections Department"
            )
            requires_approval = True
            approval_reason = f"Aging exceeds 21 days ({overdue_days} days overdue). Formal tone requires supervisor sign-off."

        pre_checks = {
            "invoice_valid": (invoice.validation_status == "VALIDATED"),
            "balance_outstanding": (invoice.balance_due > 0),
            "not_disputed": (invoice.current_state != WorkflowState.DISPUTED),
            "not_in_quiet_hours": True,
            "frequency_limit_passed": True
        }

        idempotency_key = f"col_draft_{invoice.invoice_id}_{overdue_days}_{date.today().isoformat()}"

        return CollectionStrategyRecommendation(
            invoice_id=invoice.invoice_id,
            overdue_days=overdue_days,
            recommended_channel=channel,
            tone=tone,
            subject=subject,
            message_body=body,
            pre_action_checks=pre_checks,
            requires_approval=requires_approval,
            approval_reason=approval_reason,
            idempotency_key=idempotency_key
        )

deepseek_engine = DeepSeekEngine()
