import React from 'react';
import { DEPARTMENTS } from '../../data/api';

interface NavigationDrawerProps {
  isOpen: boolean;
  activeView: string;
  onClose: () => void;
  onSelectView: (view: string) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  activeView,
  onClose,
  onSelectView
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 60,
        display: 'flex'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '360px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '10px 0 40px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🌿</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Orbyte AI Operations
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Apple Park SME Receivables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '18px',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            &times;
          </button>
        </div>

        {/* Drawer Links */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 10px 6px' }}>
            Main Views
          </div>
          <button
            onClick={() => { onSelectView('campus'); onClose(); }}
            style={{
              textAlign: 'left',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeView === 'campus' ? '#f0fdf4' : 'transparent',
              color: activeView === 'campus' ? '#15803d' : '#334155',
              fontWeight: activeView === 'campus' ? 700 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>🏡</span> 3D Apple Park Campus
          </button>
          <button
            onClick={() => { onSelectView('overview'); onClose(); }}
            style={{
              textAlign: 'left',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: activeView === 'overview' ? '#f0fdf4' : 'transparent',
              color: activeView === 'overview' ? '#15803d' : '#334155',
              fontWeight: activeView === 'overview' ? 700 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span>📊</span> Executive Receivables Overview
          </button>

          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '18px 10px 6px' }}>
            7 Production AI Workstations
          </div>
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.id}
              onClick={() => { onSelectView(dept.slug); onClose(); }}
              style={{
                textAlign: 'left',
                padding: '10px 14px',
                borderRadius: '12px',
                border: 'none',
                background: activeView === dept.slug ? '#f0fdf4' : 'transparent',
                color: activeView === dept.slug ? dept.color : '#334155',
                fontWeight: activeView === dept.slug ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: dept.color
                }}
              />
              <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {dept.name}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#94a3b8' }}>
          Autonomous Receivables Operations • v1.0
        </div>
      </div>
    </div>
  );
};
