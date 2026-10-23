import React from 'react';

interface TopHudProps {
  onToggleDrawer: () => void;
  onResetCamera: () => void;
  onOpenAgent: (slug: string) => void;
}

export const TopHud: React.FC<TopHudProps> = ({
  onToggleDrawer,
  onResetCamera,
  onOpenAgent
}) => {
  return (
    <>
      {/* Top Bar Floating HUD */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 20
        }}
      >
        {/* Left: Hamburger Button & Campus Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', pointerEvents: 'auto' }}>
          <button
            onClick={onToggleDrawer}
            title="Open Operations Menu"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ width: '20px', height: '2px', background: '#0f172a', borderRadius: '1px' }} />
            <span style={{ width: '20px', height: '2px', background: '#0f172a', borderRadius: '1px' }} />
            <span style={{ width: '20px', height: '2px', background: '#0f172a', borderRadius: '1px' }} />
          </button>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              padding: '8px 18px',
              borderRadius: '30px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#22c55e',
                boxShadow: '0 0 8px #22c55e'
              }}
            />
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
              Orbyte AI • Apple Park Campus
            </span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span style={{ fontSize: '13px', color: '#475569' }}>Apex Logistics Operations</span>
          </div>
        </div>

        {/* Right: Quick Alert Pills */}
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto' }}>
          <button
            onClick={() => onOpenAgent('agent-2')}
            style={{
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              padding: '8px 16px',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⚠️</span> 4 Overdue Invoices
          </button>

          <button
            onClick={() => onOpenAgent('agent-1')}
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '8px 16px',
              borderRadius: '24px',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 4px 12px rgba(21, 128, 61, 0.08)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>📄</span> Upload Bill
          </button>
        </div>
      </div>

      {/* Bottom Floating Interaction HUD */}
      <div
        style={{
          position: 'absolute',
          bottom: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
          borderRadius: '30px',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '13px',
          color: '#334155',
          zIndex: 20
        }}
      >
        <span>
          🖱️ <strong>Navigation:</strong> Drag to rotate • Scroll to zoom • Right-click to pan
        </span>
        <span style={{ color: '#cbd5e1' }}>•</span>
        <span>
          🧑‍💼 <strong>Select Agent:</strong> Click any voxel character to open staff workstation
        </span>
        <button
          onClick={onResetCamera}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '16px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#1e293b',
            cursor: 'pointer'
          }}
        >
          🔄 Reset Camera
        </button>
      </div>
    </>
  );
};
