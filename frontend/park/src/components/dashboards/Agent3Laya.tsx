import React, { useState } from 'react';

interface Agent3LayaProps {
  onBackToCampus: () => void;
}

export const Agent3Laya: React.FC<Agent3LayaProps> = ({ onBackToCampus }) => {
  const [inputText, setInputText] = useState(
    'We received invoice INV-2026-0891 and we promise to wire the full amount next Monday.'
  );

  const [scores, setScores] = useState({
    top_label: 'PAYMENT_PROMISE',
    confidence: 0.924,
    route: 'AUTOMATED_FOLLOWUP_HOLD',
    threshold_met: true,
    distribution: [
      { label: 'Payment Promise', score: 0.924, intent: 'Customer committed future payment date' },
      { label: 'General Inquiry', score: 0.038, intent: 'Routine account query' },
      { label: 'Already Paid Claim', score: 0.021, intent: 'Customer claims transaction sent' },
      { label: 'Invoice Dispute', score: 0.011, intent: 'Customer disputes hours or charges' },
      { label: 'Request Invoice Copy', score: 0.004, intent: 'Missing invoice documentation' },
      { label: 'Ambiguous Fallback', score: 0.002, intent: 'Insufficient semantic confidence' }
    ]
  });

  const testScenarios = [
    {
      label: 'Payment Promise',
      text: 'We received invoice INV-2026-0891 and we promise to wire the full amount next Monday.',
      top: 'PAYMENT_PROMISE',
      conf: 0.924,
      route: 'AUTOMATED_FOLLOWUP_HOLD',
      met: true
    },
    {
      label: 'Already Paid Claim',
      text: 'We already sent the payment wire yesterday with reference TXN-9981.',
      top: 'ALREADY_PAID_CLAIM',
      conf: 0.887,
      route: 'ROUTE_TO_AGENT6_RECONCILIATION',
      met: true
    },
    {
      label: 'Billing Dispute',
      text: 'We dispute this invoice. You billed for 20 extra hours we never authorized.',
      top: 'INVOICE_DISPUTE',
      conf: 0.941,
      route: 'ROUTE_TO_HUMAN_AR_OFFICER',
      met: true
    },
    {
      label: 'Ambiguous Message',
      text: 'hello noted ok',
      top: 'AMBIGUOUS_FALLBACK',
      conf: 0.412,
      route: 'ROUTE_TO_HUMAN_TRIAGE',
      met: false
    }
  ];

  const handleApplyScenario = (sc: any) => {
    setInputText(sc.text);
    setScores({
      top_label: sc.top,
      confidence: sc.conf,
      route: sc.route,
      threshold_met: sc.met,
      distribution: [
        { label: sc.top.replace(/_/g, ' '), score: sc.conf, intent: 'Primary detected event' },
        { label: 'General Inquiry', score: 0.045, intent: 'Routine inquiry' },
        { label: 'Secondary Intent', score: 0.032, intent: 'Secondary semantic match' },
        { label: 'Other', score: 0.015, intent: 'Residual weight' }
      ]
    });
  };

  const steps = [
    { name: 'NAR Embedding Matrix Encoding', detail: 'Tokenized inbound customer text with non-autoregressive encoder in 12ms' },
    { name: 'Calibrated Confidence Evaluation', detail: 'Compared top scoring candidate against SME 0.75 policy cutoff' },
    { name: 'Autonomous Route Determination', detail: 'Assigned verified routing decision without hallucination risks' }
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
              🎯 Agent 3: Laya Decision & Routing Console
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Non-Autoregressive Event Scoring & Calibrated Routing Governance
            </p>
          </div>
        </div>
        <div
          style={{
            background: '#faf5ff',
            color: '#7c3aed',
            border: '1px solid #e9d5ff',
            padding: '6px 14px',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          Laya NAR Engine (Sub-15ms)
        </div>
      </div>

      {/* Main Container */}
      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Step-by-Step Checklist */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚡ Real-Time Scoring Pipeline Steps</span>
            <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px' }}>
              Execution Latency: 14ms
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Left Column: Event Input & Test Scenarios */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              ✉️ Inbound Customer Message Payload
            </h2>
            <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#64748b' }}>
              Select a quick scenario below or enter customer correspondence:
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {testScenarios.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => handleApplyScenario(sc)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1e293b',
                    cursor: 'pointer'
                  }}
                >
                  {sc.label}
                </button>
              ))}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontFamily: 'inherit',
                fontSize: '13px',
                lineHeight: '1.5',
                boxSizing: 'border-box'
              }}
            />

            <div style={{ marginTop: '16px', padding: '14px', borderRadius: '10px', background: '#faf5ff', border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b21a8' }}>
                Operational Threshold Policy
              </div>
              <div style={{ fontSize: '12px', color: '#581c87', marginTop: '2px' }}>
                Classification requires <strong>&ge; 75% confidence</strong> for direct automated pipeline routing. Scores below 75% are immediately placed into Human-in-the-Loop review.
              </div>
            </div>
          </div>

          {/* Right Column: Visual Result Cards & Confidence Bars (NO CODE / NO JSON) */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                  Laya Decision Outcome
                </span>
                <h2 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {scores.top_label.replace(/_/g, ' ')}
                </h2>
              </div>
              <div>
                {scores.threshold_met ? (
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 700 }}>
                    ✓ Confident ({(scores.confidence * 100).toFixed(1)}%)
                  </span>
                ) : (
                  <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '6px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 700 }}>
                    ⚠️ Human Fallback ({(scores.confidence * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>

            {/* Recommended Routing Card */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Recommended Operational Routing
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {scores.route}
              </div>
            </div>

            {/* Visual Probability Distribution Progress Bars */}
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
              Semantic Probability Distribution Across Categories
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scores.distribution.map((cat, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{cat.label}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{(cat.score * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${cat.score * 100}%`,
                        height: '100%',
                        background: i === 0 ? '#7c3aed' : '#cbd5e1',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
