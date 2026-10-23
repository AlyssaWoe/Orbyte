import React, { useState } from 'react';

interface Agent6ReconciliationProps {
  onBackToCampus: () => void;
}

export const Agent6Reconciliation: React.FC<Agent6ReconciliationProps> = ({ onBackToCampus }) => {
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  const transactions = [
    {
      txn_id: 'TXN-BANK-9981',
      date: '2026-10-22 14:15 UTC',
      sender_entity: 'Omni Retailers International Corp',
      bank_account: 'JPMorgan Chase (Acct: ...8402)',
      amount: 6300.00,
      matched_invoice: 'INV-2026-0890',
      match_confidence: 1.00,
      status: 'RECONCILED_CLOSED',
      method: 'Fedwire Funds Transfer',
      notes: 'Exact 3-way match on invoice ID and balance due. Ledger updated automatically.'
    },
    {
      txn_id: 'TXN-BANK-9982',
      date: '2026-10-21 09:30 UTC',
      sender_entity: 'Apex Logistics Global LLC',
      bank_account: 'Silicon Valley Bank (Acct: ...1932)',
      amount: 2500.00,
      matched_invoice: 'INV-2026-0891',
      match_confidence: 0.95,
      status: 'PARTIAL_PAYMENT_APPLIED',
      method: 'ACH Commercial Credit',
      notes: 'Partial settlement applied against $4,850 balance. Remaining balance: $2,350.'
    },
    {
      txn_id: 'TXN-BANK-9983',
      date: '2026-10-20 16:45 UTC',
      sender_entity: 'Unidentified Wire Remitter (REF: SO-481)',
      bank_account: 'JPMorgan Chase (Acct: ...8402)',
      amount: 1850.00,
      matched_invoice: 'PENDING_INVESTIGATION',
      match_confidence: 0.40,
      status: 'SUSPENSE_HOLD',
      method: 'SWIFT International MT103',
      notes: 'Missing invoice reference in remittance field. Routed to treasury officer for inquiry.'
    }
  ];

  const steps = [
    { name: 'Direct Bank Feed Ingestion', detail: 'Received encrypted settlement statement feeds via Open Banking API' },
    { name: 'Deterministic 3-Way Reconciliation', detail: 'Cross-matched transaction amounts against open receivables without fuzzy hallucinations' },
    { name: 'Immutable Ledger Write', detail: 'Transitioned verified invoices to CLOSED state and recorded audit hash' }
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
              🏦 Agent 6: Payment Reconciliation & Ledger Workstation
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Deterministic Bank Statement Feed Matching, Remittance Audit & Financial Truth
            </p>
          </div>
        </div>
        <div
          style={{
            background: '#fefce8',
            color: '#a16207',
            border: '1px solid #fef08a',
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          Deterministic Reconciliation Engine
        </div>
      </div>

      {/* Main Container */}
      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Step-by-Step Sequence Checklist */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px 24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡ Automated Banking Matching Sequence</span>
            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px' }}>
              Reconciliation Rate: 98.2%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
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

        {/* Payment Records Ledger Table (Clear presentation for staff) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                💳 Incoming Bank Deposit Records & Settlement Ledger
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                All transactions verified deterministically against bank settlement files
              </p>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
              Live Bank Sync: Connected
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 18px' }}>Bank Transaction ID</th>
                <th style={{ padding: '14px 18px' }}>Deposit Timestamp</th>
                <th style={{ padding: '14px 18px' }}>Remitting Entity</th>
                <th style={{ padding: '14px 18px' }}>Matched Invoice</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Credited Amount</th>
                <th style={{ padding: '14px 18px' }}>Reconciliation Status</th>
                <th style={{ padding: '14px 18px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.txn_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                    {tx.txn_id}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>
                    {tx.date}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{tx.sender_entity}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{tx.bank_account}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0284c7' }}>
                    {tx.matched_invoice}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, fontSize: '14px', color: '#15803d' }}>
                    +${tx.amount.toFixed(2)} USD
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {tx.status === 'RECONCILED_CLOSED' ? (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '11px' }}>
                        ✓ Reconciled & Closed
                      </span>
                    ) : tx.status === 'PARTIAL_PAYMENT_APPLIED' ? (
                      <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '11px' }}>
                        🟡 Partial Match Applied
                      </span>
                    ) : (
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '11px' }}>
                        ⚠️ Suspense Hold
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <button
                      onClick={() => setSelectedTransaction(tx)}
                      style={{
                        background: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View Details &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Detail Modal */}
      {selectedTransaction && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Bank Settlement Record Details
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div>
                <strong>Transaction ID:</strong> <span style={{ color: '#0f172a' }}>{selectedTransaction.txn_id}</span>
              </div>
              <div>
                <strong>Remitter Entity:</strong> <span style={{ color: '#0f172a' }}>{selectedTransaction.sender_entity}</span>
              </div>
              <div>
                <strong>Payment Method:</strong> <span style={{ color: '#0f172a' }}>{selectedTransaction.method}</span>
              </div>
              <div>
                <strong>Cleared Amount:</strong> <span style={{ color: '#15803d', fontWeight: 700 }}>${selectedTransaction.amount.toFixed(2)} USD</span>
              </div>
              <div>
                <strong>Reconciliation Notes:</strong>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#334155', marginTop: '4px' }}>
                  {selectedTransaction.notes}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
