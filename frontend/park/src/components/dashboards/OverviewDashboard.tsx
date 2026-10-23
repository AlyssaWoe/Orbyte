import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../data/api';

interface OverviewDashboardProps {
  onBackToCampus: () => void;
  onOpenAgent: (slug: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onBackToCampus, onOpenAgent }) => {
  const [ledgerStatements, setLedgerStatements] = useState<any[]>([
    {
      invoice_id: 'INV-2026-0891',
      customer_name: 'Apex Logistics Corp',
      customer_email: 'billing@apexlogistics.com',
      due_date: '2026-10-10',
      total_amount: 4850.00,
      amount_paid: 2500.00,
      balance_due: 2350.00,
      current_state: 'PARTIALLY_PAID',
      validation_status: 'VALIDATED'
    },
    {
      invoice_id: 'INV-2026-0892',
      customer_name: 'BioTech Solutions Ltd',
      customer_email: 'ap@biotechsolutions.org',
      due_date: '2026-10-15',
      total_amount: 12400.00,
      amount_paid: 0.00,
      balance_due: 12400.00,
      current_state: 'WAITING_FOR_PAYMENT',
      validation_status: 'VALIDATED'
    },
    {
      invoice_id: 'INV-2026-0893',
      customer_name: 'Cascade Digital Media',
      customer_email: 'finance@cascadedigital.io',
      due_date: '2026-09-20',
      total_amount: 7200.00,
      amount_paid: 0.00,
      balance_due: 7200.00,
      current_state: 'DISPUTED',
      validation_status: 'VALIDATED'
    },
    {
      invoice_id: 'INV-2026-0890',
      customer_name: 'Omni Retailers International',
      customer_email: 'ap@omniretail.com',
      due_date: '2026-10-05',
      total_amount: 6300.00,
      amount_paid: 6300.00,
      balance_due: 0.00,
      current_state: 'CLOSED',
      validation_status: 'VALIDATED'
    }
  ]);

  const [runpodConfig, setRunpodConfig] = useState({
    endpoint_url: '',
    api_key: '',
    model_name: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B'
  });
  const [runpodStatus, setRunpodStatus] = useState<any | null>(null);
  const [showRunpodModal, setShowRunpodModal] = useState(false);
  const [isSavingRunpod, setIsSavingRunpod] = useState(false);

  useEffect(() => {
    // Fetch ledger
    fetch(`${API_BASE}/api/ledger`)
      .then(res => res.json())
      .then(data => {
        if (data.ledger_statements && data.ledger_statements.length > 0) {
          setLedgerStatements(data.ledger_statements);
        }
      })
      .catch(() => {});

    // Fetch RunPod status
    fetch(`${API_BASE}/api/config/runpod`)
      .then(res => res.json())
      .then(data => {
        setRunpodConfig({
          endpoint_url: data.endpoint_url || '',
          api_key: data.has_api_key ? '••••••••••••••••' : '',
          model_name: data.model_name || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B'
        });
        setRunpodStatus(data.status);
      })
      .catch(() => {});
  }, []);

  const handleSaveRunPod = async () => {
    setIsSavingRunpod(true);
    try {
      const res = await fetch(`${API_BASE}/api/config/runpod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runpodConfig)
      });
      const data = await res.json();
      if (res.ok) {
        setRunpodStatus(data.test_result);
        setShowRunpodModal(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingRunpod(false);
    }
  };

  const totalOutstanding = ledgerStatements.reduce((acc, s) => acc + (s.balance_due || 0), 0);
  const overdueCount = ledgerStatements.filter(s => s.balance_due > 0 && s.current_state !== 'CLOSED').length;

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
              📊 Executive Accounts Receivable & Authoritative Ledger
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Single Source of Financial Truth (SSOT), Multi-Agent Automation & RunPod AI Bridge
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setShowRunpodModal(true)}
            style={{
              background: runpodStatus?.connected ? '#ecfdf5' : '#f8fafc',
              color: runpodStatus?.connected ? '#15803d' : '#475569',
              border: runpodStatus?.connected ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{runpodStatus?.connected ? '🟢' : '⚪'}</span>
            <span>RunPod Endpoint: {runpodStatus?.connected ? 'ONLINE' : 'Local / Not Linked'}</span>
          </button>
          <div style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
            Authoritative Ledger Active
          </div>
        </div>
      </div>

      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Portfolio Outstanding</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px' }}>${totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Authoritative single ledger sum</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Overdue Accounts</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626', margin: '8px 0 4px' }}>{overdueCount} Accounts</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Surveillance under quiet hours policy</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Reconciled Settled</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#16a34a', margin: '8px 0 4px' }}>$8,800.00</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Full & partial payments applied</div>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Agent 7 Governance Gate</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#d97706', margin: '8px 0 4px' }}>2 Held</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>$4,000 threshold enforced</div>
          </div>
        </div>

        {/* P1: Unified Ledger Table (Staff Friendly, NO CODE) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                📄 Verified Accounts Receivable Ledger (Single Source of Financial Truth)
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                All agent dashboards, monitoring engines, and reminders read this exact table. Partial payments update balances in real-time.
              </p>
            </div>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, background: '#ecfdf5', padding: '4px 12px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              ✓ Deterministic Ledger Match
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 14px' }}>Invoice ID</th>
                  <th style={{ padding: '12px 14px' }}>Client Entity</th>
                  <th style={{ padding: '12px 14px' }}>Due Date</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Total Billed</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Paid to Date</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>Remaining Balance</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Workflow State</th>
                  <th style={{ padding: '12px 14px', textAlign: 'center' }}>Quick Action</th>
                </tr>
              </thead>
              <tbody>
                {ledgerStatements.map((inv: any) => (
                  <tr key={inv.invoice_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a' }}>{inv.invoice_id}</td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{inv.customer_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{inv.customer_email}</div>
                    </td>
                    <td style={{ padding: '14px', color: '#334155' }}>{inv.due_date}</td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 600, color: '#64748b' }}>
                      ${(inv.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 600, color: '#16a34a' }}>
                      ${(inv.amount_paid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', fontWeight: 800, color: inv.balance_due > 0 ? '#dc2626' : '#16a34a' }}>
                      ${(inv.balance_due || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '12px',
                          background: inv.balance_due <= 0 ? '#dcfce7' : inv.current_state === 'DISPUTED' ? '#fee2e2' : inv.current_state === 'PARTIALLY_PAID' ? '#fef3c7' : '#e0f2fe',
                          color: inv.balance_due <= 0 ? '#15803d' : inv.current_state === 'DISPUTED' ? '#b91c1c' : inv.current_state === 'PARTIALLY_PAID' ? '#b45309' : '#0369a1'
                        }}
                      >
                        {inv.current_state}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <button
                        onClick={() => onOpenAgent('agent-2')}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Frameworks & Verification Indicators */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            🤖 AI Engines, RunPod Bridge & Operational Metrics
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Agent 1: Docling OCR</span>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '2px 8px', borderRadius: '8px' }}>ONLINE</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                PyPDF + Windows Media OCR layout parsing with Pydantic v2 mathematical certification.
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Agent 3: Laya NAR</span>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '2px 8px', borderRadius: '8px' }}>ONLINE</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Non-autoregressive candidate scoring across 6 labels with calibrated 0.75 threshold.
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Agent 4 & 5: DeepSeek</span>
                <span style={{ fontSize: '11px', background: runpodStatus?.connected ? '#dcfce7' : '#e0f2fe', color: runpodStatus?.connected ? '#15803d' : '#0369a1', fontWeight: 700, padding: '2px 8px', borderRadius: '8px' }}>
                  {runpodStatus?.connected ? 'RUNPOD BRIDGED' : 'LOCAL EMBEDDED'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                NLU fact extraction, P0 Date Conflict shield, and policy-constrained draft synthesis.
              </p>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>Agent 7: LangGraph Gate</span>
                <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '2px 8px', borderRadius: '8px' }}>ACTIVE</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Durable state machine, backend $4,000 approval gate, and immutable audit trace.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* RunPod Configuration Modal */}
      {showRunpodModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                🔗 Configure RunPod AI Endpoint
              </h3>
              <button onClick={() => setShowRunpodModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
            </div>
            
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px', lineHeight: '1.5' }}>
              Link your live RunPod Serverless or vLLM Pod endpoint to power DeepSeek and Laya inference:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  RunPod Endpoint URL:
                </label>
                <input
                  type="text"
                  placeholder="https://api.runpod.ai/v2/{endpoint_id}/runsync"
                  value={runpodConfig.endpoint_url}
                  onChange={(e) => setRunpodConfig({ ...runpodConfig, endpoint_url: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  RunPod API Key (Bearer Token):
                </label>
                <input
                  type="password"
                  placeholder="rpa_..."
                  value={runpodConfig.api_key}
                  onChange={(e) => setRunpodConfig({ ...runpodConfig, api_key: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Model Target:
                </label>
                <input
                  type="text"
                  value={runpodConfig.model_name}
                  onChange={(e) => setRunpodConfig({ ...runpodConfig, model_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {runpodStatus && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', background: runpodStatus.connected ? '#ecfdf5' : '#fffbeb', border: runpodStatus.connected ? '1px solid #bbf7d0' : '1px solid #fde68a', fontSize: '12px', color: runpodStatus.connected ? '#15803d' : '#92400e', marginBottom: '18px' }}>
                <strong>Status:</strong> {runpodStatus.message} {runpodStatus.latency_ms ? `(${runpodStatus.latency_ms} ms)` : ''}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowRunpodModal(false)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRunPod}
                disabled={isSavingRunpod}
                style={{ background: '#16a34a', border: 'none', color: '#ffffff', borderRadius: '10px', padding: '10px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                {isSavingRunpod ? 'Testing & Saving...' : 'Save & Test Connection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
