"""
Orbyte Smart Payment Follow-up AI - Data Store
Persists invoices, bank transactions, customer messages, approval queues, and immutable audit logs.
"""
import os
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from backend.models.schemas import (
    ValidatedInvoice, InvoiceLineItem, WorkflowState,
    BankTransaction, AuditLogEntry, ApprovalTask
)

DATA_FILE = os.path.join(os.path.dirname(__file__), "app_data.json")

class Store:
    def __init__(self):
        self.invoices: Dict[str, ValidatedInvoice] = {}
        self.transactions: Dict[str, BankTransaction] = {}
        self.approvals: Dict[str, ApprovalTask] = {}
        self.audit_logs: List[AuditLogEntry] = []
        self.customer_messages: List[Dict] = []
        self.harness_evals: List[Dict] = []
        self._load_or_seed()

    def _load_or_seed(self):
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r", encoding="utf-8") as f:
                    raw = json.load(f)
                    for k, v in raw.get("invoices", {}).items():
                        self.invoices[k] = ValidatedInvoice(**v)
                    for k, v in raw.get("transactions", {}).items():
                        self.transactions[k] = BankTransaction(**v)
                    for k, v in raw.get("approvals", {}).items():
                        self.approvals[k] = ApprovalTask(**v)
                    for a in raw.get("audit_logs", []):
                        self.audit_logs.append(AuditLogEntry(**a))
                    self.customer_messages = raw.get("customer_messages", [])
                    self.harness_evals = raw.get("harness_evals", [])
                    if self.invoices:
                        return
            except Exception as e:
                print(f"Error loading stored data, will seed: {e}")

        self._seed_default_data()
        self.save()

    def _seed_default_data(self):
        # Seed realistic SME sample invoices
        sample_invoices = [
            ValidatedInvoice(
                invoice_id="INV-2026-0891",
                customer_id="CUST-104",
                customer_name="Apex Logistics Corp",
                customer_email="billing@apexlogistics.com",
                customer_phone="+1 (555) 234-5678",
                issue_date="2026-09-10",
                due_date="2026-10-10",
                currency="USD",
                total_amount=4850.00,
                balance_due=4850.00,
                items=[
                    InvoiceLineItem(description="Freight Management & Route Optimization", quantity=1, unit_price=4850.00, total=4850.00)
                ],
                validation_status="VALIDATED",
                confidence_score=0.99,
                source_filename="Apex_Logistics_Oct_Inv.pdf",
                current_state=WorkflowState.FOLLOW_UP_ELIGIBLE,
                notes="12 days overdue; awaiting friendly reminder."
            ),
            ValidatedInvoice(
                invoice_id="INV-2026-0892",
                customer_id="CUST-218",
                customer_name="BioTech Solutions Ltd",
                customer_email="ap@biotechsolutions.org",
                customer_phone="+1 (555) 876-5432",
                issue_date="2026-09-15",
                due_date="2026-10-15",
                currency="USD",
                total_amount=12400.00,
                balance_due=12400.00,
                items=[
                    InvoiceLineItem(description="Lab Automation Hardware Bundle", quantity=2, unit_price=6200.00, total=12400.00)
                ],
                validation_status="VALIDATED",
                confidence_score=0.97,
                source_filename="BioTech_Lab_Oct.pdf",
                current_state=WorkflowState.WAITING_FOR_PAYMENT,
                notes="Promised payment on Oct 25th via email."
            ),
            ValidatedInvoice(
                invoice_id="INV-2026-0893",
                customer_id="CUST-305",
                customer_name="Cascade Digital Media",
                customer_email="finance@cascadedigital.io",
                customer_phone="+1 (555) 901-2345",
                issue_date="2026-08-20",
                due_date="2026-09-20",
                currency="USD",
                total_amount=3200.00,
                balance_due=3200.00,
                items=[
                    InvoiceLineItem(description="Content Studio Retainer (Sept)", quantity=1, unit_price=3200.00, total=3200.00)
                ],
                validation_status="VALIDATED",
                confidence_score=0.95,
                source_filename="Cascade_Sept_Retainer.pdf",
                current_state=WorkflowState.DISPUTED,
                notes="Client disputes hours billed for video editing milestone. Normal collection paused."
            ),
            ValidatedInvoice(
                invoice_id="INV-2026-0894",
                customer_id="CUST-411",
                customer_name="Delta Precision Engineering",
                customer_email="accounting@deltaprecision.net",
                customer_phone="+1 (555) 345-6789",
                issue_date="2026-09-01",
                due_date="2026-10-01",
                currency="USD",
                total_amount=7650.00,
                balance_due=0.00,
                items=[
                    InvoiceLineItem(description="CNC Milling Component Batch A", quantity=100, unit_price=76.50, total=7650.00)
                ],
                validation_status="VALIDATED",
                confidence_score=0.99,
                source_filename="Delta_CNC_Batch.pdf",
                current_state=WorkflowState.CLOSED,
                notes="Fully reconciled and closed against Wire TXN-9981."
            ),
            ValidatedInvoice(
                invoice_id="INV-2026-0895",
                customer_id="CUST-522",
                customer_name="Epsilon Cloud Systems",
                customer_email="accounts@epsiloncloud.com",
                customer_phone="+1 (555) 678-9012",
                issue_date="2026-08-15",
                due_date="2026-09-15",
                currency="USD",
                total_amount=9500.00,
                balance_due=4500.00,
                items=[
                    InvoiceLineItem(description="Kubernetes Enterprise Cluster Setup", quantity=1, unit_price=9500.00, total=9500.00)
                ],
                validation_status="VALIDATED",
                confidence_score=0.98,
                source_filename="Epsilon_K8s_Project.pdf",
                current_state=WorkflowState.ACTION_PENDING_APPROVAL,
                notes="Partial payment of $5,000 received. Pending manager approval for formal 30-day escalation notice."
            )
        ]

        for inv in sample_invoices:
            self.invoices[inv.invoice_id] = inv

        # Seed bank transactions
        sample_txns = [
            BankTransaction(
                transaction_id="TXN-9981",
                date="2026-10-18",
                amount=7650.00,
                currency="USD",
                sender_name="Delta Precision Engineering Inc",
                reference_note="INV-2026-0894 PAYMENT FINAL",
                bank_account="JP Morgan Chase Checking *4412"
            ),
            BankTransaction(
                transaction_id="TXN-9982",
                date="2026-10-21",
                amount=5000.00,
                currency="USD",
                sender_name="Epsilon Cloud Systems LLC",
                reference_note="PARTIAL INV-2026-0895 WIRE",
                bank_account="Silicon Valley Bank *8120"
            ),
            BankTransaction(
                transaction_id="TXN-9983",
                date="2026-10-22",
                amount=4850.00,
                currency="USD",
                sender_name="Apex Logistics Corp",
                reference_note="TRANSFER APEX TRUCKING",
                bank_account="Bank of America *1099"
            )
        ]
        for t in sample_txns:
            self.transactions[t.transaction_id] = t

        # Seed pending approval task
        app_task = ApprovalTask(
            task_id="APP-TASK-101",
            workflow_id="WF-INV-2026-0895",
            invoice_id="INV-2026-0895",
            customer_name="Epsilon Cloud Systems",
            amount=4500.00,
            proposed_action="Send Formal Escalation Notice (37 days overdue balance)",
            draft_message="Dear Accounts Team,\n\nWe acknowledge receipt of your partial payment of $5,000.00. The remaining balance of $4,500.00 on Invoice INV-2026-0895 is now 37 days overdue. Please advise on when the remaining settlement will be transmitted.\n\nSincerely,\nOrbyte Finance",
            recipient="accounts@epsiloncloud.com",
            risk_level="Medium",
            status="PENDING"
        )
        self.approvals[app_task.task_id] = app_task

        # Seed initial audit logs
        self.audit_logs = [
            AuditLogEntry(
                audit_id=f"AUD-{uuid.uuid4().hex[:8]}",
                timestamp=(datetime.now() - timedelta(days=2)).isoformat(),
                workflow_id="WF-INV-2026-0894",
                actor="Agent 6: Reconciliation Engine",
                action="MATCH_CONFIRMED",
                from_state=WorkflowState.RECONCILIATION_PENDING.value,
                to_state=WorkflowState.MATCHED_PAID.value,
                idempotency_key="reconcile_txn_9981_inv_0894",
                decision_summary="Exact reference and amount match on INV-2026-0894 ($7,650.00). Ledger updated via deterministic service.",
                metadata={"matched_tx": "TXN-9981", "confidence": 1.0}
            ),
            AuditLogEntry(
                audit_id=f"AUD-{uuid.uuid4().hex[:8]}",
                timestamp=(datetime.now() - timedelta(days=1)).isoformat(),
                workflow_id="WF-INV-2026-0893",
                actor="Agent 4: DeepSeek Reply Understanding",
                action="DISPUTE_ESCALATED",
                from_state=WorkflowState.MONITORING.value,
                to_state=WorkflowState.DISPUTED.value,
                idempotency_key="reply_cascade_dispute_0893",
                decision_summary="Customer claimed billing discrepancy on video editing milestone hours. Strict safety rule: collection reminders paused automatically.",
                metadata={"dispute_category": "Milestone Hours", "escalation": "Staff Review"}
            ),
            AuditLogEntry(
                audit_id=f"AUD-{uuid.uuid4().hex[:8]}",
                timestamp=datetime.now().isoformat(),
                workflow_id="WF-INV-2026-0895",
                actor="Agent 7: Orchestrator",
                action="WORKFLOW_INTERRUPTED_APPROVAL_REQUIRED",
                from_state=WorkflowState.FOLLOW_UP_ELIGIBLE.value,
                to_state=WorkflowState.ACTION_PENDING_APPROVAL.value,
                idempotency_key="followup_epsilon_approval_0895",
                decision_summary="Follow-up draft requires human sign-off: balance overdue exceeds 30-day policy threshold ($4,500.00 remaining).",
                metadata={"task_id": "APP-TASK-101"}
            )
        ]

        # Seed realistic customer conversation threads for Agent 4 & 5
        self.customer_messages = [
            {
                "conversation_id": "CONV-APEX-01",
                "customer_id": "CUST-104",
                "customer_name": "Apex Logistics Corp",
                "contact_person": "Sarah Jenkins (AP Manager)",
                "contact_email": "billing@apexlogistics.com",
                "contact_phone": "+1 (555) 234-5678",
                "invoice_id": "INV-2026-0891",
                "last_channel": "Email",
                "messages": [
                    {
                        "sender": "Orbyte Accounts",
                        "time": "2026-10-18 09:30",
                        "text": "Dear Apex Team, following up on invoice INV-2026-0891 ($4,850.00) which was due on Oct 10th. Please let us know when payment is expected."
                    },
                    {
                        "sender": "Apex Logistics (Sarah)",
                        "time": "2026-10-22 14:15",
                        "text": "Hi Orbyte team, apologies for the slight delay during our ERP migration. We will process and wire the full amount of $4,850.00 this coming Monday, Oct 27th. Thank you for your patience!"
                    }
                ]
            },
            {
                "conversation_id": "CONV-BIOTECH-02",
                "customer_id": "CUST-218",
                "customer_name": "BioTech Solutions Ltd",
                "contact_person": "Dr. Marcus Vance (Finance Director)",
                "contact_email": "ap@biotechsolutions.org",
                "contact_phone": "+1 (555) 876-5432",
                "invoice_id": "INV-2026-0892",
                "last_channel": "Email",
                "messages": [
                    {
                        "sender": "BioTech Solutions (Marcus)",
                        "time": "2026-10-21 16:40",
                        "text": "We already sent the wire transfer yesterday morning via JPMorgan Chase, reference TXN-9982. Can you please check your incoming statements and confirm receipt?"
                    }
                ]
            },
            {
                "conversation_id": "CONV-CASCADE-03",
                "customer_id": "CUST-305",
                "customer_name": "Cascade Digital Media",
                "contact_person": "Elena Rostova (Operations Lead)",
                "contact_email": "finance@cascadedigital.io",
                "contact_phone": "+1 (555) 901-2345",
                "invoice_id": "INV-2026-0893",
                "last_channel": "WhatsApp",
                "messages": [
                    {
                        "sender": "Cascade Digital (Elena)",
                        "time": "2026-10-20 11:20",
                        "text": "Hi team, we dispute this invoice INV-2026-0893. On line 2 you billed us for 35 hours of video editing, but our signed project scope clearly capped this milestone at 20 hours. We cannot approve payment until a corrected invoice is issued."
                    }
                ]
            },
            {
                "conversation_id": "CONV-EPSILON-04",
                "customer_id": "CUST-522",
                "customer_name": "Epsilon Cloud Systems",
                "contact_person": "David Cho (VP Infrastructure)",
                "contact_email": "accounts@epsiloncloud.com",
                "contact_phone": "+1 (555) 678-9012",
                "invoice_id": "INV-2026-0895",
                "last_channel": "Email",
                "messages": [
                    {
                        "sender": "Epsilon Cloud (David)",
                        "time": "2026-10-21 10:05",
                        "text": "We paid $5,000 yesterday as a partial installment. For the remaining $4,500 balance, could we please request a 14-day extension until our quarterly enterprise budget unlocks in November?"
                    }
                ]
            }
        ]

        # Seed sample Harness² evaluation runs
        self.harness_evals = [
            {
                "run_id": "HARNESS-RUN-042",
                "timestamp": "2026-10-20 14:30:00",
                "target_component": "Agent 3: Laya Confidence Calibrator",
                "dataset_size": 250,
                "accuracy": "97.6%",
                "structured_schema_validity": "100%",
                "latency_avg_ms": 38,
                "cost_per_1k": "$0.0004",
                "recommendation": "Calibrated decision threshold accepted at 0.75 for automated routing without fallback."
            },
            {
                "run_id": "HARNESS-RUN-043",
                "timestamp": "2026-10-22 09:15:00",
                "target_component": "Agent 4: DeepSeek Prompt Injection Guard",
                "dataset_size": 180,
                "accuracy": "99.4%",
                "structured_schema_validity": "99.8%",
                "latency_avg_ms": 110,
                "cost_per_1k": "$0.0012",
                "recommendation": "Adversarial payload filtering validated. Untrusted customer message text cannot alter ledger rules."
            }
        ]

    def save(self):
        try:
            data = {
                "invoices": {k: v.model_dump() for k, v in self.invoices.items()},
                "transactions": {k: v.model_dump() for k, v in self.transactions.items()},
                "approvals": {k: v.model_dump() for k, v in self.approvals.items()},
                "audit_logs": [a.model_dump() for a in self.audit_logs],
                "customer_messages": self.customer_messages,
                "harness_evals": self.harness_evals
            }
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")

    def add_audit(self, workflow_id: str, actor: str, action: str, from_state: str, to_state: str, idempotency_key: str, summary: str, meta: Optional[Dict] = None, model_version: Optional[str] = None):
        entry = AuditLogEntry(
            audit_id=f"AUD-{uuid.uuid4().hex[:8].upper()}",
            timestamp=datetime.now().isoformat(),
            workflow_id=workflow_id,
            actor=actor,
            action=action,
            from_state=from_state,
            to_state=to_state,
            idempotency_key=idempotency_key,
            decision_summary=summary,
            model_version=model_version,
            metadata=meta or {}
        )
        self.audit_logs.insert(0, entry) # latest first
        self.save()
        return entry

store = Store()
