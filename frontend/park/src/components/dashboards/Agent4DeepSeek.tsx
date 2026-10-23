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
      last_message: 'Hi Orbyte team, apologies for the delay. We had an internal invoice approval cycle hold. We have scheduled the wire transfer of $4,850.00 for next Tuesday (Oct 24).',
      detected_intent: 'Payment Promise',
      promised_date: '2026-10-24',
      dispute_reason: null,
      draft_subject: 'Re: Payment Confirmation Schedule for Invoice INV-2026-0891',
      draft_body: `Dear Sarah Jenkins,\n\nThank you for confirming that payment of $4,850.00 USD for Invoice INV-2026-0891 has been scheduled for transfer on October 24, 2026.\n\nWe have updated our accounts receivable scheduler accordingly and paused all regular reminder notices until October 24. Once the remittance is dispatched, please reply with the bank wire transaction reference.\n\nWarm regards,\nOrbyte Accounts Operations Team`
    },
    {
      id: 'conv-02',
      customer_name: 'BioTech Solutions Inc.',
      contact: 'Marcus Vance',
      email: 'finance@biotech-solutions.io',
      invoice_id: 'INV-2026-0892',
      balance_due: 12400.00,
      last_message: 'We are disputing this invoice INV-2026-0892. You billed us for 20 additional software consulting hours on Line 3 that were never authorized by our CTO.',
      detected_intent: 'Invoice Billing Dispute',
      promised_date: null,
      dispute_reason: '20 unauthorized software consulting hours billed on Line 3',
      draft_subject: 'Invoice Review & Immediate Hold: INV-2026-0892',
      draft_body: `Dear Marcus Vance,\n\nThank you for bringing this to our attention regarding Invoice INV-2026-0892. In accordance with our fair billing policy, all routine payment reminders on this account have been immediately PAUSED.\n\nOur project delivery manager and senior billing specialist have been assigned to audit the 20 consulting hours against the signed statement of work. We will provide an adjusted invoice or clarification within 24 business hours.\n\nSincerely,\nOrbyte Billing Resolution Team`
    },
    {
      id: 'conv-03',
      customer_name: 'Delta Freight Forwarding',
      contact: 'Thomas Wu',
      email: 'twu@deltafreight.com',
      invoice_id: 'INV-2026-0893',
      balance_due: 7200.00,
      last_message: 'We already transmitted the wire payment of $7,200 yesterday afternoon under bank wire reference TXN-88219.',
      detected_intent: 'Already Paid Claim',
      promised_date: null,
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
    { name: 'Strict Schema Compliance', detail: 'Structured intent data into verified Pydantic model' },
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
              DeepSeek NLU Intent & Fact Extraction + Agent 5 Strategy Response Synthesis
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
          DeepSeek NLU + Policy Engine
        </div>
      </div>

      {/* Main Container */}
      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Step-by-Step Sequence Checklist */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px 24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡ Automated NLU Understanding & Response Sequence</span>
            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px' }}>
              All 4 Verification Gates Passed
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
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '16px' }}>✓</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{st.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{st.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Split: Conversations on Left, Details & Draft on Right */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px' }}>
          
          {/* Left Column: Customer Conversation Threads */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
              👥 Customer Message Threads
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {conversations.map((c) => {
                const isSelected = selectedConv.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConv(c)}
                    style={{
                      background: isSelected ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${isSelected ? '#86efac' : '#e2e8f0'}`,
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{c.customer_name}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: isSelected ? '#15803d' : '#64748b' }}>
                        ${c.balance_due.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 8px' }}>
                      {c.contact} • {c.invoice_id}
                    </div>
                    <div style={{ fontSize: '12px', color: '#334155', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                      "{c.last_message}"
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Transcript, AI Summary & Agent 5 Draft (NO CODE!) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. Customer Message Card */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Latest Received Customer Statement
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Channel: Verified Corporate Email</span>
              </div>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #0284c7', fontSize: '14px', lineHeight: '1.6', color: '#1e293b' }}>
                "{selectedConv.last_message}"
              </div>
            </div>

            {/* 2. Agent 4 AI Summary of What Customer Communicated */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px' }}>🧠</span>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#15803d' }}>
                  Agent 4: AI Summary of Customer Meaning & Fact Extraction
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Detected Intent</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#14532d', marginTop: '2px' }}>{selectedConv.detected_intent}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Promised Date / Ref</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                    {selectedConv.promised_date || 'None'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Dispute Notes</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: selectedConv.dispute_reason ? '#dc2626' : '#64748b', marginTop: '2px' }}>
                    {selectedConv.dispute_reason || 'No disputes filed'}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Agent 5 Synthesized Response Draft for Customer */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>✉️</span>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0369a1' }}>
                    Agent 5: Tailored Follow-up Draft Message Ready for Approval
                  </h3>
                </div>
                <button
                  onClick={handleCopy}
                  style={{
                    background: copySuccess ? '#dcfce7' : '#f1f5f9',
                    color: copySuccess ? '#15803d' : '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {copySuccess ? '✓ Copied to Clipboard!' : '📋 Copy Message'}
                </button>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                  <strong>Subject:</strong> {selectedConv.draft_subject}
                </div>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
                  <strong>To:</strong> {selectedConv.contact} &lt;{selectedConv.email}&gt;
                </div>
                <div style={{ whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.6', color: '#1e293b', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  {selectedConv.draft_body}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => alert(`Submitted response draft to Agent 7 human approval gatekeeper for Invoice: ${selectedConv.invoice_id}`)}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  🛡️ Submit for Human Approval & Dispatch &rarr;
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
