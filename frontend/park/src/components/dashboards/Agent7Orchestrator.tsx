import React, { useState } from 'react';

interface Agent7OrchestratorProps {
  onBackToCampus: () => void;
}

export const Agent7Orchestrator: React.FC<Agent7OrchestratorProps> = ({ onBackToCampus }) => {
  const [approvals, setApprovals] = useState([
    {
      id: 'APPR-101',
      invoice_id: 'INV-2026-0892',
      customer: 'BioTech Solutions Inc.',
      amount: 12400.00,
      reason: 'Invoice Balance > $5,000 threshold & Active billing dispute on consulting hours',
      action_type: 'Dispute Resolution Outreach & Reminders Freeze',
      status: 'PENDING'
    },
    {
      id: 'APPR-102',
      invoice_id: 'INV-2026-0891',
      customer: 'Apex Logistics Global',
      amount: 4850.00,
      reason: 'Customer requested 5-day payment postponement to Oct 24',
      action_type: 'Scheduler Grace Period Extension',
      status: 'PENDING'
    }
  ]);

  const auditEvents = [
    { timestamp: '2026-10-23 09:14:22', agent: 'Agent 6', action: 'Ledger Write', detail: 'Reconciled TXN-BANK-9981 with INV-2026-0890 ($6,300.00) -> CLOSED' },
    { timestamp: '2026-10-23 08:30:10', agent: 'Agent 4', action: 'NLU Intent Extract', detail: 'Extracted payment_promise for INV-2026-0891 (committed: 2026-10-24)' },
    { timestamp: '2026-10-23 07:00:00', agent: 'Agent 2', action: 'Daily Clock Scan', detail: 'Evaluated 5 invoices; classified 4 overdue accounts under quiet-hours policy' },
    { timestamp: '2026-10-22 18:22:45', agent: 'Agent 1', action: 'Docling Ingestion', detail: 'Ingested and validated INV-2026-9042 ($3,500.00) with 98.5% confidence' }
  ];

  const handleApprove = (id: string) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
  };

  const handleReject = (id: string) => {
    setApprovals(approvals.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
              🎛️ Agent 7: Workflow Orchestrator & Governance Workstation
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              LangGraph State Machine Governor, Human-in-the-Loop Gatekeeper & Cryptographic Audit
            </p>
          </div>
        </div>
        <div style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
          LangGraph State Machine + HITL
        </div>
      </div>

      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Visual Pipeline Flow */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '22px 28px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
            🔄 End-to-End Receivables State Graph Flow
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
            {[
              { num: '1', title: 'Ingest & Verify', desc: 'Docling OCR' },
              { num: '2', title: 'Ledger Clock', desc: 'Aging Watch' },
              { num: '3', title: 'Laya Route', desc: 'NAR Scoring' },
              { num: '4', title: 'DeepSeek NLP', desc: 'Fact Extract' },
              { num: '5', title: 'Draft Strategy', desc: 'Policy Engine' },
              { num: '6', title: 'Bank Reconcile', desc: 'Feed Match' },
              { num: '7', title: 'HITL Gate', desc: 'Audit Log' }
            ].map((node, i) => (
              <React.Fragment key={i}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', minWidth: '120px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                    {node.num}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{node.title}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{node.desc}</div>
                </div>
                {i < 6 && <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '16px' }}>➔</span>}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Human Approvals Inbox (HITL) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                🛡️ Human-in-the-Loop Approval Queue (Active Gatekeepers)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                High-value accounts or dispute situations held until authorized by human finance lead
              </p>
            </div>
            <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
              {approvals.filter(a => a.status === 'PENDING').length} Approvals Pending
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {approvals.map((appr) => (
              <div
                key={appr.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{appr.customer}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>({appr.invoice_id})</span>
                    <span style={{ fontWeight: 700, color: '#dc2626', fontSize: '13px' }}>${appr.amount.toLocaleString()} USD</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px' }}>
                    <strong>Action:</strong> {appr.action_type}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    <strong>Reason for Hold:</strong> {appr.reason}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {appr.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleReject(appr.id)}
                        style={{
                          background: '#fee2e2',
                          color: '#b91c1c',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(appr.id)}
                        style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                        }}
                      >
                        ✓ Authorize Action
                      </button>
                    </>
                  ) : (
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '12px',
                        background: appr.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                        color: appr.status === 'APPROVED' ? '#15803d' : '#b91c1c'
                      }}
                    >
                      {appr.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptographic Audit Trail */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              📜 Immutable System Audit Trail
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
              Append-only event log recording every state transition across all 7 AI agents
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px' }}>Timestamp (UTC)</th>
                <th style={{ padding: '12px 18px' }}>Responsible Agent</th>
                <th style={{ padding: '12px 18px' }}>Action Type</th>
                <th style={{ padding: '12px 18px' }}>Verified Operational Detail</th>
              </tr>
            </thead>
            <tbody>
              {auditEvents.map((evt, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 18px', color: '#64748b' }}>{evt.timestamp}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: '#0f172a' }}>{evt.agent}</td>
                  <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0284c7' }}>{evt.action}</td>
                  <td style={{ padding: '12px 18px', color: '#334155' }}>{evt.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
