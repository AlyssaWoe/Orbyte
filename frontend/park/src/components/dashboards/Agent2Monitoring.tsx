import React, { useState } from 'react';

interface Agent2MonitoringProps {
  onBackToCampus: () => void;
}

export const Agent2Monitoring: React.FC<Agent2MonitoringProps> = ({ onBackToCampus }) => {
  const [activeTab, setActiveTab] = useState<'overdue' | 'upcoming' | 'paid'>('overdue');
  const [selectedClientDossier, setSelectedClientDossier] = useState<any | null>(null);

  // Sample categorized accounts
  const overdueAccounts = [
    {
      invoice_id: 'INV-2026-0891',
      customer_name: 'Apex Logistics Global',
      contact: 'Sarah Jenkins (ap@apexlogistics.com, +1-555-0192)',
      due_date: '2026-10-15',
      days_overdue: 8,
      total_amount: 4850.00,
      balance_due: 4850.00,
      urgency: 'HIGH',
      status: 'OVERDUE_CRITICAL',
      last_action: 'Customer promised wire transfer on Oct 24th'
    },
    {
      invoice_id: 'INV-2026-0892',
      customer_name: 'BioTech Solutions Inc.',
      contact: 'Marcus Vance (finance@biotech-solutions.io, +1-555-0143)',
      due_date: '2026-10-02',
      days_overdue: 21,
      total_amount: 12400.00,
      balance_due: 12400.00,
      urgency: 'URGENT_ESCALATE',
      status: 'OVERDUE_SEVERE',
      last_action: 'Dispute filed regarding 20 unauthorized software consulting hours'
    },
    {
      invoice_id: 'INV-2026-0895',
      customer_name: 'Epsilon Cloud Systems',
      contact: 'Elena Rostova (accounting@epsiloncloud.com, +1-555-0177)',
      due_date: '2026-10-18',
      days_overdue: 5,
      total_amount: 4500.00,
      balance_due: 4500.00,
      urgency: 'MEDIUM',
      status: 'OVERDUE_MODERATE',
      last_action: 'Polite reminder notice dispatched'
    },
    {
      invoice_id: 'INV-2026-0893',
      customer_name: 'Delta Freight Forwarding',
      contact: 'Thomas Wu (twu@deltafreight.com, +1-555-0165)',
      due_date: '2026-10-20',
      days_overdue: 3,
      total_amount: 7200.00,
      balance_due: 7200.00,
      urgency: 'MEDIUM',
      status: 'OVERDUE_RECENT',
      last_action: 'Awaiting customer response to statement'
    }
  ];

  const upcomingAccounts = [
    {
      invoice_id: 'INV-2026-0894',
      customer_name: 'Gamma Robotics Corp',
      contact: 'Kevin Zhao (kzhao@gammarobotics.com)',
      due_date: '2026-10-28',
      days_overdue: 0,
      total_amount: 8900.00,
      balance_due: 8900.00,
      urgency: 'NORMAL',
      status: 'UPCOMING_DUE_SOON',
      last_action: 'Standard courtesy invoice delivered'
    }
  ];

  const paidAccounts = [
    {
      invoice_id: 'INV-2026-0890',
      customer_name: 'Omni Retailers International',
      contact: 'Rachel Adams (payables@omniretail.com)',
      due_date: '2026-10-10',
      days_overdue: 0,
      total_amount: 6300.00,
      balance_due: 0.00,
      urgency: 'SETTLED',
      status: 'RECONCILED_CLOSED',
      last_action: 'Settlement confirmed via Bank Wire TXN-9981'
    }
  ];

  const steps = [
    { id: 1, name: 'Connect PostgreSQL & Query Active Accounts', detail: 'Evaluated active SME accounts against durable ledger store' },
    { id: 2, name: 'Run Scheduler Deterministic Clock Evaluation', detail: 'Evaluated system UTC clock against agreed contractual settlement dates' },
    { id: 3, name: 'Classify Aging Brackets (Upcoming, 1-7d, 8-21d, >21d)', detail: 'Separated balances into regulatory aging risk tiers' },
    { id: 4, name: 'Enforce Quiet Hours & Dispute Holds Policy', detail: 'Verified recipient business hours (09:00 - 18:00) and paused accounts with active dispute reviews' },
    { id: 5, name: 'Synchronize State Machine Flags', detail: 'Updated FOLLOW_UP_ELIGIBLE transitions and flagged supervisor escalations' }
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
              ⏰ Agent 2: Payment Surveillance & Aging Console
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              PostgreSQL Ledger Surveillance, Deterministic Aging Policy & Customer Follow-up Tracking
            </p>
          </div>
        </div>
        <div
          style={{
            background: '#ecfeff',
            color: '#0e7490',
            border: '1px solid #a5f3fc',
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          PostgreSQL Engine + Time Scheduler
        </div>
      </div>

      {/* Main Container */}
      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Step-by-Step Verified Execution Checklist */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡ Automated Aging Scan Sequence</span>
            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px' }}>
              All 5 Steps Completed
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {steps.map((st) => (
              <div
                key={st.id}
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

        {/* Tab Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('overdue')}
              style={{
                background: activeTab === 'overdue' ? '#fee2e2' : '#ffffff',
                border: `1px solid ${activeTab === 'overdue' ? '#fca5a5' : '#cbd5e1'}`,
                color: activeTab === 'overdue' ? '#b91c1c' : '#475569',
                borderRadius: '10px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🔴 Overdue Accounts ({overdueAccounts.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              style={{
                background: activeTab === 'upcoming' ? '#fef3c7' : '#ffffff',
                border: `1px solid ${activeTab === 'upcoming' ? '#fde68a' : '#cbd5e1'}`,
                color: activeTab === 'upcoming' ? '#b45309' : '#475569',
                borderRadius: '10px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🟡 Upcoming Invoices ({upcomingAccounts.length})
            </button>
            <button
              onClick={() => setActiveTab('paid')}
              style={{
                background: activeTab === 'paid' ? '#dcfce7' : '#ffffff',
                border: `1px solid ${activeTab === 'paid' ? '#86efac' : '#cbd5e1'}`,
                color: activeTab === 'paid' ? '#15803d' : '#475569',
                borderRadius: '10px',
                padding: '8px 16px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              🟢 Reconciled & Closed ({paidAccounts.length})
            </button>
          </div>
        </div>

        {/* Accounts Table & Detail Cards */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 18px' }}>Invoice ID</th>
                <th style={{ padding: '14px 18px' }}>Client Entity & Contact</th>
                <th style={{ padding: '14px 18px' }}>Agreed Due Date</th>
                <th style={{ padding: '14px 18px' }}>Aging Duration</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Outstanding Balance</th>
                <th style={{ padding: '14px 18px' }}>Operational Action</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'overdue' ? overdueAccounts : activeTab === 'upcoming' ? upcomingAccounts : paidAccounts).map((acc) => (
                <tr key={acc.invoice_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                    {acc.invoice_id}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{acc.customer_name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{acc.contact}</div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#334155' }}>
                    {acc.due_date}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {acc.days_overdue > 0 ? (
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '12px' }}>
                        ⚠️ Overdue by {acc.days_overdue} days
                      </span>
                    ) : (
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, fontSize: '12px' }}>
                        On Schedule
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, fontSize: '14px', color: acc.balance_due > 0 ? '#b91c1c' : '#16a34a' }}>
                    ${acc.balance_due.toFixed(2)} USD
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <button
                      onClick={() => setSelectedClientDossier(acc)}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                      }}
                    >
                      View Client Dossier &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Customer Detail Drawer Modal */}
      {selectedClientDossier && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 60,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setSelectedClientDossier(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '460px',
              height: '100%',
              background: '#ffffff',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '28px',
              boxSizing: 'border-box',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                  Client Account Dossier
                </span>
                <h2 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedClientDossier.customer_name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedClientDossier(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  fontSize: '18px',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontWeight: 700, color: '#be123c', marginBottom: '4px' }}>
                  ⚠️ Overdue Alert Notice
                </div>
                <div style={{ color: '#881337' }}>
                  This account has exceeded the contract settlement term by <strong>{selectedClientDossier.days_overdue} days</strong>. Total outstanding balance is <strong>${selectedClientDossier.balance_due.toFixed(2)} USD</strong>.
                </div>
              </div>

              <div>
                <strong style={{ color: '#0f172a' }}>Associated Invoice ID:</strong>
                <div style={{ color: '#475569' }}>{selectedClientDossier.invoice_id}</div>
              </div>

              <div>
                <strong style={{ color: '#0f172a' }}>Direct Contact Information:</strong>
                <div style={{ color: '#475569' }}>{selectedClientDossier.contact}</div>
              </div>

              <div>
                <strong style={{ color: '#0f172a' }}>Agreed Settlement Due Date:</strong>
                <div style={{ color: '#475569' }}>{selectedClientDossier.due_date}</div>
              </div>

              <div>
                <strong style={{ color: '#0f172a' }}>Latest Operational Follow-up Status:</strong>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', marginTop: '4px' }}>
                  {selectedClientDossier.last_action}
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => alert(`Initiated telephone escalation call to: ${selectedClientDossier.contact}`)}
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📞 Direct Call Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
