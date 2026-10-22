"""
Agent 3: Laya Decision & Routing Engine
Non-autoregressive candidate scoring and calibrated threshold routing.
Evaluates event context against predefined candidate labels.
Core Rule: Probabilities are scores, not proofs. Low confidence triggers safe fallback.
"""
import re
from typing import List, Dict, Any
from backend.models.schemas import LayaLabel, LayaScoreItem, LayaRoutingResult

class LayaEngine:
    CALIBRATED_THRESHOLD = 0.75

    @classmethod
    def score_event(cls, text: str, context: Dict[str, Any] = None) -> LayaRoutingResult:
        """
        Scores input text across fixed candidate labels using non-autoregressive feature scoring.
        """
        t = text.lower()
        context = context or {}

        # Predefined label candidates
        labels = [
            LayaLabel.PAYMENT_PROMISE.value,
            LayaLabel.ALREADY_PAID_CLAIM.value,
            LayaLabel.INVOICE_DISPUTE.value,
            LayaLabel.REQUEST_FOR_EXTENSION.value,
            LayaLabel.UNCLEAR.value,
            LayaLabel.OTHER.value
        ]

        # Semantic indicator scoring vectors
        scores_map = {l: 0.05 for l in labels}

        # 1. Payment Promise patterns
        if any(w in t for w in ["will pay", "promise to pay", "schedule payment", "transfer by", "pay on monday", "pay next week", "pay tomorrow", "arranging funds"]):
            scores_map[LayaLabel.PAYMENT_PROMISE.value] += 0.85
        if re.search(r'pay\s+(?:on|by|before)\s+(?:\w+\s+\d+|\d+/\d+|next|this)', t):
            scores_map[LayaLabel.PAYMENT_PROMISE.value] += 0.40

        # 2. Already Paid Claim patterns
        if any(w in t for w in ["already paid", "we paid", "transferred yesterday", "wire sent", "check mailed", "payment has been made", "remittance advice attached"]):
            scores_map[LayaLabel.ALREADY_PAID_CLAIM.value] += 0.90
        if any(w in t for w in ["receipt attached", "bank confirmation", "transaction ref", "paid last week"]):
            scores_map[LayaLabel.ALREADY_PAID_CLAIM.value] += 0.50

        # 3. Invoice Dispute patterns
        if any(w in t for w in ["dispute", "incorrect amount", "never received", "wrong quantity", "overcharged", "not what we agreed", "services not rendered", "billing mistake"]):
            scores_map[LayaLabel.INVOICE_DISPUTE.value] += 0.92
        if any(w in t for w in ["unhappy", "defective", "billing error", "do not owe this"]):
            scores_map[LayaLabel.INVOICE_DISPUTE.value] += 0.45

        # 4. Request for Extension patterns
        if any(w in t for w in ["extension", "grant us more time", "cashflow issue", "delayed until", "installment plan", "30 days grace"]):
            scores_map[LayaLabel.REQUEST_FOR_EXTENSION.value] += 0.88

        # 5. Unclear / Ambiguous patterns
        if len(t.strip()) < 10 or t in ["hello", "ok", "thanks", "received", "noted", "call me"]:
            scores_map[LayaLabel.UNCLEAR.value] += 0.80

        # Normalize with softmax-like scaling
        total = sum(scores_map.values())
        calibrated_items = []
        for l in labels:
            prob = round(scores_map[l] / total, 3)
            calibrated_items.append(LayaScoreItem(label=l, score=scores_map[l], calibrated_probability=prob))

        # Sort descending by calibrated probability
        calibrated_items.sort(key=lambda x: x.calibrated_probability, reverse=True)
        top = calibrated_items[0]

        # Determine threshold pass and safe fallback
        passed_calibration = top.calibrated_probability >= cls.CALIBRATED_THRESHOLD and top.label != LayaLabel.UNCLEAR.value

        # Routing decision table
        if not passed_calibration:
            route_target = "Safe Fallback / Human Review"
            reason = f"Confidence ({top.calibrated_probability:.2f}) below threshold ({cls.CALIBRATED_THRESHOLD}) or label is unclear. Safe escalation mandated."
        elif top.label == LayaLabel.PAYMENT_PROMISE.value:
            route_target = "Agent 4: DeepSeek Customer Reply Understanding"
            reason = "High confidence payment promise detected. Routing to Agent 4 to extract target commitment date."
        elif top.label == LayaLabel.ALREADY_PAID_CLAIM.value:
            route_target = "Agent 4 & Agent 6: Verification & Reconciliation"
            reason = "Customer claims prior payment. Routing to Agent 4 for transaction reference extraction and Agent 6 for bank matching."
        elif top.label == LayaLabel.INVOICE_DISPUTE.value:
            route_target = "Agent 4: Dispute Processing & Staff Review Queue"
            reason = "Invoice dispute recognized. Automatic follow-up paused; routed to extract dispute reason for staff review."
        elif top.label == LayaLabel.REQUEST_FOR_EXTENSION.value:
            route_target = "Agent 5: Extension Assessment & Approval Queue"
            reason = "Credit extension requested. Routed to evaluate SME policy eligibility."
        else:
            route_target = "Agent 7: General Workflow Routing"
            reason = "Standard message routed through Orchestrator."

        return LayaRoutingResult(
            chosen_label=top.label,
            confidence=top.calibrated_probability,
            calibrated_threshold=cls.CALIBRATED_THRESHOLD,
            passed_calibration=passed_calibration,
            route_target=route_target,
            routing_reason=reason,
            all_scores=calibrated_items,
            model_version="Laya-NAR-v2.1"
        )

laya_engine = LayaEngine()
