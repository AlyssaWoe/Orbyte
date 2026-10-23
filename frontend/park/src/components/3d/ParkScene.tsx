import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { DaylightLighting } from './DaylightLighting';
import { Clouds } from './Clouds';
import { ParkGround } from './ParkGround';
import { CurvedPath } from './CurvedPath';
import { CircularHeadquarters } from './CircularHeadquarters';
import { TreeCluster } from './TreeCluster';
import { Pond } from './Pond';
import { Garden } from './Garden';
import { BenchGroup } from './Bench';
import { VoxelAgent } from './VoxelAgent';
import { CameraController } from './CameraController';
import { AgentInfo, DEPARTMENTS } from '../../data/api';

interface ParkSceneProps {
  selectedAgent: AgentInfo | null;
  onSelectAgent: (agent: AgentInfo) => void;
  resetTrigger: number;
}

export const ParkScene: React.FC<ParkSceneProps> = ({
  selectedAgent,
  onSelectAgent,
  resetTrigger
}) => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <Canvas
        shadows
        camera={{ fov: 45, near: 0.1, far: 500, position: [0, 38, 54] }}
        style={{ background: '#e0f2fe' }} // Clear light-blue sky background
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Daytime sky with soft sun orientation */}
        <Sky
          distance={450000}
          sunPosition={[45, 65, 35]}
          inclination={0.4}
          azimuth={0.25}
          turbidity={4}
          rayleigh={0.8}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />

        {/* Natural daytime lighting */}
        <DaylightLighting />

        {/* Soft puffy moving clouds */}
        <Clouds />

        {/* Apple Park landscape, inner courtyard, berms, and entrance plaza */}
        <ParkGround />

        {/* Curved concentric and radial pedestrian paths */}
        <CurvedPath />

        {/* Iconic Apple Park Ring Headquarters & Pavilions */}
        <CircularHeadquarters outerRadius={26} innerRadius={18} height={5.2} floors={4} />

        {/* Instanced orchards & perimeter tree clusters */}
        <TreeCluster />

        {/* Scenic organic pond & footbridge */}
        <Pond />

        {/* Flower beds & garden landscaping */}
        <Garden />

        {/* Modern campus benches */}
        <BenchGroup />

        {/* 7 Minecraft-style Voxel Department Agents at Workstations */}
        {DEPARTMENTS.map((dept) => (
          <VoxelAgent
            key={dept.id}
            agent={dept}
            isSelected={selectedAgent?.id === dept.id}
            onSelect={onSelectAgent}
          />
        ))}

        {/* Smooth OrbitControls with limits and reset handler */}
        <CameraController resetTrigger={resetTrigger} />
      </Canvas>
    </div>
  );
};
