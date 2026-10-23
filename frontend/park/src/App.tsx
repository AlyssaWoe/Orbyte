import React, { useState } from 'react';
import { ParkScene } from './components/3d/ParkScene';
import { TopHud } from './components/ui/TopHud';
import { AgentModal } from './components/ui/AgentModal';
import { NavigationDrawer } from './components/ui/NavigationDrawer';
import { OverviewDashboard } from './components/dashboards/OverviewDashboard';
import { Agent1Ingestion } from './components/dashboards/Agent1Ingestion';
import { Agent2Monitoring } from './components/dashboards/Agent2Monitoring';
import { Agent3Laya } from './components/dashboards/Agent3Laya';
import { Agent4DeepSeek } from './components/dashboards/Agent4DeepSeek';
import { Agent5Strategy } from './components/dashboards/Agent5Strategy';
import { Agent6Reconciliation } from './components/dashboards/Agent6Reconciliation';
import { Agent7Orchestrator } from './components/dashboards/Agent7Orchestrator';
import { AgentInfo } from './data/api';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('campus');
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [resetTrigger, setResetTrigger] = useState<number>(0);

  const handleSelectAgent = (agent: AgentInfo) => {
    setSelectedAgent(agent);
  };

  const handleOpenDashboard = (slug: string) => {
    setSelectedAgent(null);
    setCurrentView(slug);
  };

  const handleResetCamera = () => {
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* 1. Dedicated Staff-Facing Dashboard Overlays */}
      {currentView === 'overview' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto' }}>
          <OverviewDashboard
            onBackToCampus={() => setCurrentView('campus')}
            onOpenAgent={(slug) => setCurrentView(slug)}
          />
        </div>
      )}

      {currentView === 'agent-1' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto' }}>
          <Agent1Ingestion onBackToCampus={() => setCurrentView('campus')} />
        </div>
      )}

      {currentView === 'agent-2' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto' }}>
          <Agent2Monitoring onBackToCampus={() => setCurrentView('campus')} />
        </div>
      )}

      {currentView === 'agent-3' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto' }}>
          <Agent3Laya onBackToCampus={() => setCurrentView('campus')} />
        </div>
      )}

      {currentView === 'agent-4' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto' }}>
          <Agent4DeepSeek onBackToCampus={() => setCurrentView('campus')} />
        </div>
      )}

      {currentView === 'agent-5' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto' }}>
          <Agent5Strategy onBackToCampus={() => setCurrentView('campus')} />
        </div>
      )}

      {currentView === 'agent-6' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto' }}>
          <Agent6Reconciliation onBackToCampus={() => setCurrentView('campus')} />
        </div>
      )}

      {currentView === 'agent-7' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto' }}>
          <Agent7Orchestrator onBackToCampus={() => setCurrentView('campus')} />
        </div>
      )}

      {/* 2. 3D Apple Park Canvas Campus (Homepage & Central Navigation Hub) */}
      <ParkScene
        selectedAgent={selectedAgent}
        onSelectAgent={handleSelectAgent}
        resetTrigger={resetTrigger}
      />

      {/* 3. Ambient Top & Bottom HUD */}
      <TopHud
        onToggleDrawer={() => setDrawerOpen(true)}
        onResetCamera={handleResetCamera}
        onOpenAgent={(slug) => setCurrentView(slug)}
      />

      {/* 4. Click Agent Modal Pop-up */}
      <AgentModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onOpenDashboard={handleOpenDashboard}
      />

      {/* 5. Slide-out Navigation Drawer */}
      <NavigationDrawer
        isOpen={drawerOpen}
        activeView={currentView}
        onClose={() => setDrawerOpen(false)}
        onSelectView={(view) => setCurrentView(view)}
      />
    </div>
  );
};

export default App;
