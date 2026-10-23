import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { AgentInfo } from '../../data/api';

interface VoxelAgentProps {
  agent: AgentInfo;
  isSelected: boolean;
  onSelect: (agent: AgentInfo) => void;
  showLabels?: boolean;
}

export const VoxelAgent: React.FC<VoxelAgentProps> = ({
  agent,
  isSelected,
  onSelect,
  showLabels = true
}) => {
  const [hovered, setHovered] = useState(false);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const characterGroupRef = useRef<THREE.Group>(null);

  // Character subtle Minecraft idle animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 2 + agent.id;
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(t * 0.7) * 0.15;
      headRef.current.rotation.x = Math.sin(t * 1.1) * 0.05;
    }
    if (leftArmRef.current && rightArmRef.current) {
      // Typing animation on laptop
      leftArmRef.current.rotation.x = -Math.PI / 4 + Math.sin(t * 3.5) * 0.12;
      rightArmRef.current.rotation.x = -Math.PI / 4 + Math.cos(t * 3.5) * 0.12;
    }
    if (characterGroupRef.current && isSelected) {
      // Gentle floating/highlight bounce when selected
      characterGroupRef.current.position.y = 0.05 + Math.sin(t * 4) * 0.04;
    }
  });

  return (
    <group
      position={agent.position}
      rotation={[0, agent.rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(agent);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* 1. Workstation Pod (Modern Apple Park Glass Desk & Dual Curved Monitors) */}
      <group position={[0, 0, 0.95]}>
        {/* Glass desk surface */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.08, 1.0]} />
          <meshPhysicalMaterial
            color="#f8fafc"
            transmission={0.4}
            roughness={0.1}
            metalness={0.1}
          />
        </mesh>
        {/* Sleek aluminum desk legs */}
        <mesh position={[-0.95, 0.375, 0]} castShadow>
          <boxGeometry args={[0.08, 0.75, 0.9]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.95, 0.375, 0]} castShadow>
          <boxGeometry args={[0.08, 0.75, 0.9]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Primary Pro Display / Monitor */}
        <mesh position={[0, 1.15, -0.25]} castShadow>
          <boxGeometry args={[1.2, 0.7, 0.06]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} />
        </mesh>
        {/* Active Monitor Glowing Screen with Department Color */}
        <mesh position={[0, 1.15, -0.21]}>
          <planeGeometry args={[1.14, 0.64]} />
          <meshBasicMaterial color={agent.color} />
        </mesh>
        {/* Monitor Stand */}
        <mesh position={[0, 0.88, -0.25]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} />
        </mesh>

        {/* Workstation Keyboard & Trackpad */}
        <mesh position={[0, 0.8, 0.1]} castShadow>
          <boxGeometry args={[0.55, 0.02, 0.22]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>

        {/* Coffee Mug */}
        <mesh position={[0.65, 0.85, 0.1]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.12, 12]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>

        {/* Modern Ergonomic Office Chair */}
        <group position={[0, 0, 0.75]}>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.65, 0.08, 0.65]} />
            <meshStandardMaterial color="#334155" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.8, 0.3]} castShadow>
            <boxGeometry args={[0.6, 0.65, 0.08]} />
            <meshStandardMaterial color="#1e293b" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.44, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 2. Minecraft Voxel Character Group */}
      <group ref={characterGroupRef} position={[0, 0, 0.35]}>
        {/* Selection / Hover Aura Disk */}
        {(hovered || isSelected) && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.95, 32]} />
            <meshBasicMaterial
              color={isSelected ? '#3b82f6' : agent.color}
              side={THREE.DoubleSide}
              transparent
              opacity={0.85}
            />
          </mesh>
        )}

        {/* Voxel Legs (Left & Right) */}
        <mesh position={[-0.14, 0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.7, 0.24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>
        <mesh position={[0.14, 0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.7, 0.24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Voxel Torso (Department Uniform Shirt / Blazer) */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[0.54, 0.7, 0.28]} />
          <meshStandardMaterial color={agent.color} roughness={0.5} />
        </mesh>

        {/* Badge on Torso */}
        <mesh position={[0.14, 1.2, 0.15]}>
          <boxGeometry args={[0.1, 0.12, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Voxel Arms (with joint group for typing) */}
        <group ref={leftArmRef} position={[-0.38, 1.35, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.2, 0.65, 0.22]} />
            <meshStandardMaterial color={agent.color} roughness={0.5} />
          </mesh>
          {/* Hand block */}
          <mesh position={[0, -0.65, 0]} castShadow>
            <boxGeometry args={[0.18, 0.16, 0.18]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.6} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.38, 1.35, 0]}>
          <mesh position={[0, -0.3, 0]} castShadow>
            <boxGeometry args={[0.2, 0.65, 0.22]} />
            <meshStandardMaterial color={agent.color} roughness={0.5} />
          </mesh>
          {/* Hand block */}
          <mesh position={[0, -0.65, 0]} castShadow>
            <boxGeometry args={[0.18, 0.16, 0.18]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.6} />
          </mesh>
        </group>

        {/* Voxel Head (Minecraft proportions: 0.5 x 0.5 x 0.5 cube) */}
        <group position={[0, 1.65, 0]}>
          <mesh ref={headRef} castShadow>
            <boxGeometry args={[0.48, 0.48, 0.48]} />
            <meshStandardMaterial color="#fed7aa" roughness={0.6} />
          </mesh>
          {/* Pixel Hair Layer */}
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.52, 0.32, 0.52]} />
            <meshStandardMaterial color="#451a03" roughness={0.8} />
          </mesh>
          {/* Pixel Eyes */}
          <mesh position={[-0.11, 0, 0.25]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0.11, 0, 0.25]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>
      </group>

      {/* 3. Floating 3D Billboard Name Label & Status Indicator Pill (ONLY when showLabels is true) */}
      {showLabels && (
        <Html
          position={[0, 2.7, 0]}
          center
          distanceFactor={18}
          zIndexRange={[10, 0]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            transform: 'scale(1)',
            transition: 'all 0.2s ease-out'
          }}
        >
          <div
            style={{
              background: hovered || isSelected ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.95)',
              color: hovered || isSelected ? '#ffffff' : '#0f172a',
              padding: '6px 14px',
              borderRadius: '24px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
              border: `2px solid ${agent.color}`,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: agent.status === 'Active' ? '#22c55e' : '#3b82f6',
                boxShadow: `0 0 8px ${agent.status === 'Active' ? '#22c55e' : '#3b82f6'}`
              }}
            />
            <span style={{ fontWeight: 700 }}>{agent.shortName}</span>
            <span
              style={{
                background: agent.accentColor,
                color: '#0f172a',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '12px',
                fontWeight: 600
              }}
            >
              {agent.status}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
};
