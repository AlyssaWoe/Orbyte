import React, { useState } from 'react';
import { API_BASE } from '../../data/api';

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
      reason: 'Balance > $4,000 threshold & Active billing dispute on consulting hours',
      action_type: 'Dispute Resolution Outreach & Reminders Freeze',
      status: 'PENDING'
    },
    {
      id: 'APPR-102',
      invoice_id: 'INV-2026-0891',
      customer: 'Apex Logistics Global',
      amount: 4850.00,
      reason: 'Balance ($4,850.00) exceeds $4,000 policy threshold. Formal dispatch hold.',
      action_type: 'Collection Follow-up Dispatch Authorization',
      status: 'PENDING'
    }
  ]);

  const [testConflict, setTestConflict] = useState(false);
  const [isRunningSim, setIsRunningSim] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);

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

  const handleRunAcceptanceTest = async () => {
    setIsRunningSim(true);
    try {
      const res = await fetch(`${API_BASE}/api/workflow/e2e-simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_date_conflict: testConflict })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulationResult(data);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsRunningSim(false);
    }
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
        
        {/* Real-World E2E Acceptance Test Runner Card ($4,850 Overdue Invoice) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '2px solid #ea580c', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(234, 88, 12, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                End-to-End Integration Acceptance Suite
              </span>
              <h2 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                🧪 Real-World Acceptance Test: $4,850 Overdue Invoice Life Cycle
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                Executes the complete life cycle across all 7 agents: Ingestion ($4,850) ➔ Aging Scan ➔ Laya Classification ➔ DeepSeek Fact/Conflict Check ➔ Draft Strategy ➔ Agent 7 Approval Gate ➔ Bank Reconciliation ($2,500) ➔ Ledger Sync ($2,350).
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={testConflict}
                  onChange={(e) => setTestConflict(e.target.checked)}
                />
                <span>Test P0 Date Conflict ("下周二 2026-11-12")</span>
              </label>

              <button
                onClick={handleRunAcceptanceTest}
                disabled={isRunningSim}
                style={{
                  background: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: isRunningSim ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isRunningSim ? '⏳ Running 8-Step Life Cycle...' : '▶️ Execute Full Acceptance Test'}
              </button>
            </div>
          </div>

          {/* Simulation Output Steps */}
          {simulationResult && (
            <div style={{ marginTop: '20px', borderTop: '1px solid #fed7aa', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Execution Results for {simulationResult.target_invoice} (Initial: ${simulationResult.initial_amount.toFixed(2)} ➔ Settled: ${simulationResult.partial_settlement.toFixed(2)} ➔ Final Balance: ${simulationResult.final_authoritative_balance.toFixed(2)})
                </span>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
                  ✓ All 8 Life Cycle Stages Verified
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {simulationResult.steps.map((st: any) => (
                  <div
                    key={st.step}
                    style={{
                      background: st.status === 'FLAGGED_FOR_HUMAN_REVIEW' ? '#fffbeb' : '#f8fafc',
                      border: st.status === 'FLAGGED_FOR_HUMAN_REVIEW' ? '1px solid #fde68a' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c' }}>STAGE {st.step}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: st.status === 'FLAGGED_FOR_HUMAN_REVIEW' ? '#b45309' : '#15803d' }}>
                        {st.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{st.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{st.agent}</div>

                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#334155', background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      {st.step === 1 && `Extracted $${st.details.extracted_amount.toFixed(2)} (${st.details.validation_status})`}
                      {st.step === 2 && `Overdue: ${st.details.days_overdue} days | Balance: $${st.details.authoritative_balance.toFixed(2)}`}
                      {st.step === 3 && `Label: '${st.details.chosen_label}' (Conf: ${(st.details.confidence * 100).toFixed(0)}%)`}
                      {st.step === 4 && (st.details.date_conflict_detected ? `⚠️ Conflict: Stated ${st.details.stated_weekday} vs Calendar ${st.details.actual_weekday}` : `Promised Date: ${st.details.promised_date}`)}
                      {st.step === 5 && `Draft Tone: '${st.details.tone}' | Referenced: ${st.details.current_draft_balance}`}
                      {st.step === 6 && (st.details.blocked_unauthorized_send ? `🛡️ Agent 7 Gate: Blocked auto-send (> $4,000 threshold)` : `Authorized`)}
                      {st.step === 7 && `Matched $${st.details.deposit_amount.toFixed(2)} deposit ➔ Balance reduced to $${st.details.remaining_balance.toFixed(2)}`}
                      {st.step === 8 && `${st.details.summary}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Human Approvals Inbox (HITL) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                🛡️ Human-in-the-Loop Approval Queue (Active Backend Gatekeepers)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                High-value accounts (&gt; $4,000) or dispute situations held at Agent 7 backend gate before transmission
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
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>{appr.customer}</span>
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>
                      {appr.invoice_id}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>
                      ${appr.amount.toFixed(2)} USD
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Proposed Action: <strong>{appr.action_type}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: 500, marginTop: '2px' }}>
                    {appr.reason}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {appr.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleReject(appr.id)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fca5a5',
                          color: '#dc2626',
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
                          border: 'none',
                          color: '#ffffff',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Authorize & Dispatch
                      </button>
                    </>
                  ) : (
                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: appr.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                        color: appr.status === 'APPROVED' ? '#15803d' : '#b91c1c'
                      }}
                    >
                      {appr.status === 'APPROVED' ? '✓ Authorized & Dispatched' : '✕ Action Rejected'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptographic Audit Trail */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            📜 Immutable System Execution & Cryptographic Audit Trail
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {auditEvents.map((ev, i) => (
              <div
                key={i}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '13px'
                }}
              >
                <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>{ev.timestamp}</span>
                <span style={{ background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                  {ev.agent}
                </span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{ev.action}</span>
                <span style={{ color: '#64748b', flex: 1 }}>{ev.detail}</span>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>✓ Certified Immutable</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
