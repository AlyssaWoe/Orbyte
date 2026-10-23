import React, { useState } from 'react';

interface Agent5StrategyProps {
  onBackToCampus: () => void;
}

export const Agent5Strategy: React.FC<Agent5StrategyProps> = ({ onBackToCampus }) => {
  const [selectedTone, setSelectedTone] = useState<'gentle' | 'formal' | 'urgent'>('formal');
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'whatsapp' | 'sms'>('email');

  const draftPreview = {
    subject: 'Statement of Account & Settlement Update: Invoice INV-2026-0891',
    body: `Dear Apex Logistics Finance Team,\n\nWe hope this notice finds you well. Our records indicate that Invoice INV-2026-0891 ($4,850.00 USD) reached its settlement date on October 15, 2026 and is currently 8 days past due.\n\nWe kindly request you confirm the scheduled payment transmission date. If payment has already been initiated, please share the wire confirmation receipt so we may update our ledger immediately.\n\nWarm regards,\nOrbyte Accounts Receivable Operations`
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
              ✉️ Agent 5: Collection Strategy & Follow-up Workstation
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Policy-Guided Multi-Channel Follow-up Drafting & Tone Calibration
            </p>
          </div>
        </div>
        <div style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '16px', fontSize: '12px', fontWeight: 700 }}>
          SME Recovery Policy Engine
        </div>
      </div>

      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Controls */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              🎯 Strategy & Policy Parameters
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Communication Tone Strategy:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedTone('gentle')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${selectedTone === 'gentle' ? '#86efac' : '#cbd5e1'}`,
                    background: selectedTone === 'gentle' ? '#f0fdf4' : '#ffffff',
                    color: selectedTone === 'gentle' ? '#15803d' : '#334155',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🟢 Friendly Courtesy (1-7 Days)
                </button>
                <button
                  onClick={() => setSelectedTone('formal')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${selectedTone === 'formal' ? '#93c5fd' : '#cbd5e1'}`,
                    background: selectedTone === 'formal' ? '#eff6ff' : '#ffffff',
                    color: selectedTone === 'formal' ? '#1d4ed8' : '#334155',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🔵 Formal Business (8-21 Days)
                </button>
                <button
                  onClick={() => setSelectedTone('urgent')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${selectedTone === 'urgent' ? '#fca5a5' : '#cbd5e1'}`,
                    background: selectedTone === 'urgent' ? '#fef2f2' : '#ffffff',
                    color: selectedTone === 'urgent' ? '#b91c1c' : '#334155',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🔴 Urgent Notice (&gt; 21 Days)
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Dispatch Channel:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSelectedChannel('email')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${selectedChannel === 'email' ? '#0f172a' : '#cbd5e1'}`,
                    background: selectedChannel === 'email' ? '#0f172a' : '#ffffff',
                    color: selectedChannel === 'email' ? '#ffffff' : '#334155',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📧 Corporate Email
                </button>
                <button
                  onClick={() => setSelectedChannel('whatsapp')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${selectedChannel === 'whatsapp' ? '#0f172a' : '#cbd5e1'}`,
                    background: selectedChannel === 'whatsapp' ? '#0f172a' : '#ffffff',
                    color: selectedChannel === 'whatsapp' ? '#ffffff' : '#334155',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  💬 WhatsApp Business
                </button>
                <button
                  onClick={() => setSelectedChannel('sms')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${selectedChannel === 'sms' ? '#0f172a' : '#cbd5e1'}`,
                    background: selectedChannel === 'sms' ? '#0f172a' : '#ffffff',
                    color: selectedChannel === 'sms' ? '#ffffff' : '#334155',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  📱 SMS Alert
                </button>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>🛡️ Governance Rule:</div>
              All follow-up communications on balances exceeding <strong>$5,000 USD</strong> require human finance lead review before delivery.
            </div>
          </div>

          {/* Draft Preview (NO CODE!) */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              📋 Synthesized Message Draft
            </h2>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                <strong>Subject:</strong> {draftPreview.subject}
              </div>
              <div style={{ whiteSpace: 'pre-line', fontSize: '14px', lineHeight: '1.6', color: '#1e293b', background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                {draftPreview.body}
              </div>
            </div>

            <button
              onClick={() => alert('Message draft dispatched for human approval')}
              style={{
                width: '100%',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
              }}
            >
              🚀 Submit Follow-up to Dispatch Queue
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
