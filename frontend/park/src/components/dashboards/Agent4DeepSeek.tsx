import React, { useState } from 'react';

interface Agent4DeepSeekProps {
  onBackToCampus: () => void;
}

export const Agent4DeepSeek: React.FC<Agent4DeepSeekProps> = ({ onBackToCampus }) => {
  const conversations = [
    {
      id: 'conv-01',
      customer_name: 'Apex Logistics Global',
      contact: 'Sarah Jenkins',
      email: 'ap@apexlogistics.com',
      invoice_id: 'INV-2026-0891',
      balance_due: 4850.00,
      last_message: 'Hi Orbyte team, apologies for the delay. We have scheduled the wire transfer of $4,850.00 for next Tuesday, November 12, 2026.',
      detected_intent: 'Payment Promise',
      promised_date: '2026-11-12',
      stated_weekday: 'Tuesday',
      actual_weekday: 'Thursday',
      date_conflict: true,
      conflict_warning: 'P0 Date-vs-Weekday Conflict: Customer stated "Tuesday", but November 12, 2026 is actually a Thursday! Automated reminder pause halted; routed to human confirmation.',
      dispute_reason: null,
      draft_subject: 'Re: Clarification on Proposed Settlement Date - Invoice INV-2026-0891',
      draft_body: `Dear Sarah Jenkins,\n\nThank you for your update regarding Invoice INV-2026-0891 ($4,850.00 USD).\n\nOur system noticed a date discrepancy in your message: you mentioned next Tuesday, November 12, but November 12, 2026 falls on a Thursday. Could you please clarify if you intend to execute the wire on Tuesday (Nov 10) or Thursday (Nov 12)?\n\nOnce confirmed, we will adjust our accounts receivable schedule accordingly.\n\nWarm regards,\nOrbyte Accounts Operations Team`
    },
    {
      id: 'conv-02',
      customer_name: 'Apex Logistics Global (Clean Promise)',
      contact: 'Sarah Jenkins',
      email: 'ap@apexlogistics.com',
      invoice_id: 'INV-2026-0891',
      balance_due: 4850.00,
      last_message: 'We will wire the full balance of $4,850.00 next Tuesday. Finance approval is completed.',
      detected_intent: 'Payment Promise',
      promised_date: '2026-10-27',
      stated_weekday: 'Tuesday',
      actual_weekday: 'Tuesday',
      date_conflict: false,
      conflict_warning: null,
      dispute_reason: null,
      draft_subject: 'Payment Commitment Confirmed: Invoice INV-2026-0891',
      draft_body: `Dear Sarah Jenkins,\n\nThank you for confirming that payment of $4,850.00 for Invoice INV-2026-0891 will be wired next Tuesday. We have updated our accounts receivable scheduler and temporarily suspended reminder notices until next Tuesday.\n\nOnce transmitted, please reply with the bank wire reference.\n\nWarm regards,\nOrbyte Accounts Operations Team`
    },
    {
      id: 'conv-03',
      customer_name: 'BioTech Solutions Inc.',
      contact: 'Marcus Vance',
      email: 'finance@biotech-solutions.io',
      invoice_id: 'INV-2026-0892',
      balance_due: 12400.00,
      last_message: 'We are disputing this invoice INV-2026-0892. You billed us for 20 additional software consulting hours on Line 3 that were never authorized by our CTO.',
      detected_intent: 'Invoice Billing Dispute',
      promised_date: null,
      stated_weekday: null,
      actual_weekday: null,
      date_conflict: false,
      conflict_warning: null,
      dispute_reason: '20 unauthorized software consulting hours billed on Line 3',
      draft_subject: 'Invoice Review & Immediate Hold: INV-2026-0892',
      draft_body: `Dear Marcus Vance,\n\nThank you for bringing this to our attention regarding Invoice INV-2026-0892. In accordance with our fair billing policy, all routine payment reminders on this account have been immediately PAUSED.\n\nOur billing resolution specialist has been assigned to audit the 20 consulting hours against the signed agreement. We will provide clarification within 24 business hours.\n\nSincerely,\nOrbyte Billing Resolution Team`
    },
    {
      id: 'conv-04',
      customer_name: 'Delta Freight Forwarding',
      contact: 'Thomas Wu',
      email: 'twu@deltafreight.com',
      invoice_id: 'INV-2026-0893',
      balance_due: 7200.00,
      last_message: 'We already transmitted the wire payment of $7,200 yesterday afternoon under bank wire reference TXN-88219.',
      detected_intent: 'Already Paid Claim',
      promised_date: null,
      stated_weekday: null,
      actual_weekday: null,
      date_conflict: false,
      conflict_warning: null,
      dispute_reason: null,
      draft_subject: 'Payment Verification in Progress: Invoice INV-2026-0893',
      draft_body: `Dear Thomas Wu,\n\nThank you for your update regarding Invoice INV-2026-0893. We have noted your wire transfer reference TXN-88219 and our automated bank reconciliation engine (Agent 6) is actively verifying incoming settlement feeds.\n\nAs soon as the deposit clears our accounts, this invoice will be marked as CLOSED and a final payment receipt will be sent to your email.\n\nBest regards,\nOrbyte Accounts Operations`
    }
  ];

  const [selectedConv, setSelectedConv] = useState(conversations[0]);
  const [copySuccess, setCopySuccess] = useState(false);

  const steps = [
    { name: 'Adversarial Defense Scan', detail: 'Scanned message text for prompt injection (passed 100% clean)' },
    { name: 'DeepSeek NLP Fact Extraction', detail: 'Identified customer claims, payment dates, and dispute assertions' },
    { name: 'P0 Date vs Weekday Conflict Guard', detail: selectedConv.date_conflict ? 'CONFLICT DETECTED: Tuesday vs Thursday (Suspended)' : 'Clean: Stated weekday matches calendar date' },
    { name: 'Agent 5 Contextual Drafting', detail: 'Synthesized professional tailored response complying with SME recovery tone' }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedConv.draft_body);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBackToCampus}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ⬅️ Back to 3D Campus
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              💬 Agent 4 & 5: Customer Reply Understanding & Tailored Response Workstation
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              DeepSeek NLU Intent & Fact Extraction, P0 Date Conflict Detection, and Policy-Constrained Drafts
            </p>
          </div>
        </div>
        <div
          style={{
            background: '#f0f9ff',
            color: '#0369a1',
            border: '1px solid #bae6fd',
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          DeepSeek NLU + Date Conflict Guard
        </div>
      </div>

      {/* Main Container */}
      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Step-by-Step Sequence Checklist */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px 24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡ Automated NLU Understanding & Conflict Shield</span>
            <span style={{ fontSize: '11px', background: selectedConv.date_conflict ? '#fef3c7' : '#dcfce7', color: selectedConv.date_conflict ? '#b45309' : '#15803d', padding: '2px 8px', borderRadius: '10px' }}>
              {selectedConv.date_conflict ? '⚠️ P0 Date Conflict Flagged' : '✓ All Policy Gates Passed'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {steps.map((st, i) => (
              <div
                key={i}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i === 2 && selectedConv.date_conflict ? '#f59e0b' : '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>
                  {i === 2 && selectedConv.date_conflict ? '!' : '✓'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{st.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Interface: Conversations List + AI Interpretation & Draft */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
          
          {/* Left Column: Customer Message Threads */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: 'fit-content' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
              Customer Inbound Channels
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedConv(c)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: selectedConv.id === c.id ? '2px solid #0284c7' : '1px solid #e2e8f0',
                    background: selectedConv.id === c.id ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{c.customer_name}</span>
                    {c.date_conflict && (
                      <span style={{ fontSize: '10px', background: '#fee2e2', color: '#b91c1c', fontWeight: 800, padding: '2px 6px', borderRadius: '8px' }}>
                        CONFLICT
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{c.invoice_id} • Balance: ${c.balance_due.toFixed(2)}</div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    "{c.last_message}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: AI Extraction & Response Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* P0 Conflict Banner (if applicable) */}
            {selectedConv.date_conflict && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '28px' }}>⚠️</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#92400e' }}>
                    P0 Business Risk Guard: Payment Date & Weekday Conflict Detected
                  </div>
                  <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>
                    {selectedConv.conflict_warning}
                  </div>
                </div>
              </div>
            )}

            {/* Inbound Customer Message Card */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>Inbound Customer Communication</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {selectedConv.contact} ({selectedConv.email})
                  </h3>
                </div>
                <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                  Target: {selectedConv.invoice_id}
                </span>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #0284c7', fontSize: '14px', color: '#1e293b', lineHeight: '1.6' }}>
                "{selectedConv.last_message}"
              </div>

              {/* Extracted Facts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Classified Intent</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{selectedConv.detected_intent}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Extracted Weekday</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: selectedConv.date_conflict ? '#b91c1c' : '#0f172a', marginTop: '2px' }}>
                    {selectedConv.stated_weekday || 'N/A'}
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Calendar Date</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {selectedConv.promised_date || 'N/A'} {selectedConv.actual_weekday ? `(${selectedConv.actual_weekday})` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Synthesized Response Draft Card (Staff Friendly Email Preview) */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Agent 5 Tailored Dispatch Draft</span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {selectedConv.draft_subject}
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  {copySuccess ? '✓ Copied!' : '📋 Copy Draft'}
                </button>
              </div>

              <div style={{ background: '#fafafa', padding: '18px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px', color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                {selectedConv.draft_body}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Recipient: <strong>{selectedConv.email}</strong> • Balance Referenced: <strong>${selectedConv.balance_due.toFixed(2)} USD</strong>
                </span>
                <span style={{ background: selectedConv.balance_due > 4000 ? '#fef3c7' : '#dcfce7', color: selectedConv.balance_due > 4000 ? '#b45309' : '#15803d', padding: '4px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700 }}>
                  {selectedConv.balance_due > 4000 ? 'Agent 7 Approval Required (> $4,000)' : 'Pre-authorized Policy Draft'}
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
