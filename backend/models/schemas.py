"""
Orbyte Smart Payment Follow-up AI - Pydantic Schemas
Strict typed models for all agents, validating states and side effects.
"""
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime, date

class WorkflowState(str, Enum):
    RECEIVED = "RECEIVED"
    VALIDATING = "VALIDATING"
    NEEDS_DATA_REVIEW = "NEEDS_DATA_REVIEW"
    VALIDATED = "VALIDATED"
    MONITORING = "MONITORING"
    FOLLOW_UP_ELIGIBLE = "FOLLOW_UP_ELIGIBLE"
    WAITING_FOR_PAYMENT = "WAITING_FOR_PAYMENT"
    PAYMENT_CLAIMED = "PAYMENT_CLAIMED"
    DISPUTED = "DISPUTED"
    RECONCILIATION_PENDING = "RECONCILIATION_PENDING"
    MATCHED_PAID = "MATCHED_PAID"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    UNMATCHED = "UNMATCHED"
    ACTION_PENDING_APPROVAL = "ACTION_PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SENDING = "SENDING"
    SENT = "SENT"
    SEND_FAILED = "SEND_FAILED"
    RETRY_PENDING = "RETRY_PENDING"
    NEEDS_HUMAN_REVIEW = "NEEDS_HUMAN_REVIEW"
    CLOSED = "CLOSED"

# --- Agent 1: Data Ingestion & Validation Schemas ---
class InvoiceLineItem(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float
    total: float

class ValidatedInvoice(BaseModel):
    invoice_id: str
    customer_id: str
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    issue_date: str
    due_date: str
    currency: str = "USD"
    total_amount: float
    amount_paid: float = 0.0
    balance_due: float
    items: List[InvoiceLineItem] = []
    payment_history: List[Dict[str, Any]] = []
    validation_status: str = "VALIDATED" # VALIDATED, NEEDS_DATA_REVIEW, DUPLICATE
    confidence_score: float = 0.98
    source_filename: str
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    current_state: WorkflowState = WorkflowState.VALIDATED
    notes: Optional[str] = None

class IngestionResult(BaseModel):
    success: bool
    invoice: Optional[ValidatedInvoice] = None
    validation_errors: List[str] = []
    is_duplicate: bool = False
    evidence_extracted: Dict[str, Any] = {}
    ocr_source: Optional[str] = "Docling Layout Engine"

# --- Agent 3: Laya Decision & Routing Schemas ---
class LayaLabel(str, Enum):
    PAYMENT_PROMISE = "payment_promise"
    ALREADY_PAID_CLAIM = "already_paid_claim"
    INVOICE_DISPUTE = "invoice_dispute"
    REQUEST_FOR_EXTENSION = "request_for_extension"
    UNCLEAR = "unclear"
    OTHER = "other"

class LayaScoreItem(BaseModel):
    label: str
    score: float
    calibrated_probability: float

class LayaRoutingResult(BaseModel):
    chosen_label: str
    confidence: float
    calibrated_threshold: float = 0.75
    passed_calibration: bool
    route_target: str # Agent 4, Agent 5, Agent 6, or Safe Fallback / Human Review
    routing_reason: str
    all_scores: List[LayaScoreItem]
    model_version: str = "Laya-NAR-v2.1"

# --- Agent 4: DeepSeek Customer Reply Understanding Schemas ---
class DeepSeekReplyInterpretation(BaseModel):
    message_id: str
    invoice_ref: Optional[str] = None
    customer_name: Optional[str] = None
    detected_intent: str
    intent_confidence: float
    claimed_paid: bool = False
    promised_date: Optional[str] = None
    stated_weekday: Optional[str] = None
    actual_weekday: Optional[str] = None
    date_conflict: bool = False
    date_conflict_details: Optional[Dict[str, Any]] = None
    dispute_reason: Optional[str] = None
    requested_extension_days: Optional[int] = None
    prompt_injection_flag: bool = False
    sentiment: str = "neutral" # neutral, cooperative, frustrated, urgent
    raw_message_excerpt: str
    structured_evidence: Dict[str, Any] = {}
    escalation_required: bool = False
    escalation_reason: Optional[str] = None

    # --- RunPod enrichment (optional) ---------------------------------------
    # Every field above this line is computed deterministically and is
    # authoritative. These fields are additive only: the RunPod model may add
    # narrative and may propose an intent, but it can never clear a date
    # conflict, un-flag an injection, or lower an escalation. Where the model
    # contradicts a deterministic fact the fact stands, and the disagreement is
    # recorded in model_disagreements so a reviewer sees it rather than losing it.
    model_engine: Optional[str] = None
    model_summary: Optional[str] = None
    model_suggested_intent: Optional[str] = None
    model_disagreements: List[str] = []
    model_latency_ms: Optional[int] = None

# --- Agent 5: Collection Strategy & Follow-up Schemas ---
class CollectionStrategyRecommendation(BaseModel):
    invoice_id: str
    overdue_days: int
    recommended_channel: str = "Email" # Email, WhatsApp, Portal
    tone: str = "polite_reminder" # gentle, polite_reminder, firm_followup, formal_demand
    subject: str
    message_body: str
    pre_action_checks: Dict[str, bool] = {
        "invoice_valid": True,
        "balance_outstanding": True,
        "not_disputed": True,
        "not_in_quiet_hours": True,
        "frequency_limit_passed": True
    }
    requires_approval: bool = True # True if >14 days overdue or high risk
    approval_reason: Optional[str] = None
    idempotency_key: str

# --- Agent 6: Payment Reconciliation & Exceptions Schemas ---
class BankTransaction(BaseModel):
    transaction_id: str
    date: str
    amount: float
    currency: str
    sender_name: str
    reference_note: str
    bank_account: str

class ReconciliationResult(BaseModel):
    transaction_id: str
    matched_invoice_id: Optional[str] = None
    match_status: str # MATCHED_PAID, PARTIALLY_PAID, UNMATCHED, AMBIGUOUS_REVIEW
    confidence: float
    matched_amount: float
    remaining_balance: float
    match_evidence: List[str] = []
    requires_human_review: bool = False
    notes: str

# --- Agent 7 & Audit Trail Schemas ---
class AuditLogEntry(BaseModel):
    audit_id: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    workflow_id: str
    actor: str # e.g. "Agent 1: Ingestion", "Agent 7: Orchestrator", "Staff: Alyssa"
    action: str
    from_state: str
    to_state: str
    idempotency_key: str
    decision_summary: str
    model_version: Optional[str] = None
    provider_result: Optional[str] = None
    metadata: Dict[str, Any] = {}

class ApprovalTask(BaseModel):
    task_id: str
    workflow_id: str
    invoice_id: str
    customer_name: str
    amount: float
    proposed_action: str
    draft_message: str
    recipient: str
    risk_level: str # Low, Medium, High
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    status: str = "PENDING" # PENDING, APPROVED, REJECTED
    reviewed_by: Optional[str] = None
    review_notes: Optional[str] = None
