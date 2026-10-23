import React from 'react';

interface OverviewDashboardProps {
  onBackToCampus: () => void;
  onOpenAgent: (slug: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onBackToCampus, onOpenAgent }) => {
  const stats = [
    { label: 'Total Outstanding Balance', value: '$28,950.00', sub: 'Across 4 active SME client accounts', color: '#0f172a' },
    { label: 'Overdue Invoices', value: '4 Accounts', sub: 'Require active follow-up & surveillance', color: '#dc2626' },
    { label: 'Reconciled This Month', value: '$6,300.00', sub: 'Deterministic match by Agent 6', color: '#16a34a' },
    { label: 'Pending Human Approvals', value: '2 Actions', sub: 'Held at Agent 7 HITL gate', color: '#d97706' }
  ];

  const agingBuckets = [
    { label: 'Current / Not Due', amount: '$8,900', pct: 31, color: '#3b82f6' },
    { label: '1 - 7 Days Overdue', amount: '$4,500', pct: 16, color: '#eab308' },
    { label: '8 - 21 Days Overdue', amount: '$4,850', pct: 17, color: '#f97316' },
    { label: '> 21 Days Overdue', amount: '$12,400', pct: 43, color: '#ef4444' }
  ];

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
              📊 Executive Accounts Receivable Overview
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Real-Time Portfolio Health, Aging Surveillance & Agent Automation Performance
            </p>
          </div>
        </div>
        <div style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
          Apex Logistics Portfolio
        </div>
      </div>

      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.color, margin: '8px 0 4px' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Aging Distribution & Quick Access */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          
          {/* Aging Distribution Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              📅 Aging Bracket Risk Exposure
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {agingBuckets.map((b, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{b.label}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{b.amount} ({b.pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${b.pct}%`, height: '100%', background: b.color, borderRadius: '5px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7 AI Agents Jump-station */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              🧑‍💼 Production Agent Workstations
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { name: 'Agent 1: Ingestion', slug: 'agent-1', icon: '📥' },
                { name: 'Agent 2: Monitoring', slug: 'agent-2', icon: '⏰' },
                { name: 'Agent 3: Laya Decision', slug: 'agent-3', icon: '🎯' },
                { name: 'Agent 4: DeepSeek NLU', slug: 'agent-4', icon: '💬' },
                { name: 'Agent 5: Strategy', slug: 'agent-5', icon: '✉️' },
                { name: 'Agent 6: Reconciliation', slug: 'agent-6', icon: '🏦' },
                { name: 'Agent 7: Orchestrator', slug: 'agent-7', icon: '🎛️' }
              ].map((ag, i) => (
                <button
                  key={i}
                  onClick={() => onOpenAgent(ag.slug)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1e293b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{ag.icon}</span>
                  <span>{ag.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
