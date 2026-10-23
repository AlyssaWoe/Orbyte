import React from 'react';
import { AgentInfo } from '../../data/api';

interface AgentModalProps {
  agent: AgentInfo | null;
  onClose: () => void;
  onOpenDashboard: (slug: string) => void;
}

export const AgentModal: React.FC<AgentModalProps> = ({
  agent,
  onClose,
  onOpenDashboard
}) => {
  if (!agent) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '540px',
          width: '100%',
          overflow: 'hidden',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header with agent department banner */}
        <div
          style={{
            background: `linear-gradient(135deg, ${agent.color} 0%, #0f172a 100%)`,
            padding: '24px',
            color: '#ffffff',
            position: 'relative'
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            &times;
          </button>

          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}
          >
            {agent.department}
          </div>

          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
            {agent.name}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.9 }}>
            {agent.role}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: agent.status === 'Active' ? '#22c55e' : '#3b82f6'
              }}
            />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Operational Status: <strong style={{ color: '#0f172a' }}>{agent.status}</strong>
            </span>
          </div>

          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', margin: '0 0 16px' }}>
            {agent.description}
          </p>

          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Staff Responsibilities & Core Functions
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {agent.responsibilities.map((resp, i) => (
              <div
                key={i}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <span style={{ color: agent.color, fontWeight: 700 }}>✓</span>
                <span>{resp}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onOpenDashboard(agent.slug)}
              style={{
                background: agent.color,
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${agent.color}40`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Open Staff Dashboard &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
