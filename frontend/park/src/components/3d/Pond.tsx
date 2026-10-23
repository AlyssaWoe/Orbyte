import React from 'react';

export const Pond: React.FC = () => {
  return (
    <group position={[-20, 0.03, -16]}>
      {/* 1. Water Surface (Organic Curving Apple Park Pond in Northwest Meadow) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6.8, 32]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.08}
          metalness={0.15}
          transmission={0.65}
          transparent
          opacity={0.88}
          ior={1.33}
        />
      </mesh>

      {/* Secondary overlapping circle for natural organic pond shape */}
      <mesh position={[4, 0.005, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.8, 28]} />
        <meshPhysicalMaterial
          color="#0284c7"
          roughness={0.08}
          metalness={0.15}
          transmission={0.65}
          transparent
          opacity={0.88}
          ior={1.33}
        />
      </mesh>

      {/* 2. Stone Rim / River Rocks around perimeter */}
      {Array.from({ length: 24 }).map((_, idx) => {
        const angle = (idx / 24) * Math.PI * 2;
        const radius = 6.8 + (Math.sin(idx * 3) * 0.4);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh
            key={idx}
            position={[x, 0.12, z]}
            scale={[0.4 + (idx % 3) * 0.15, 0.22, 0.35 + (idx % 2) * 0.12]}
            castShadow
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#94a3b8' : '#cbd5e1'} roughness={0.7} />
          </mesh>
        );
      })}

      {/* Small wooden footbridge over pond edge */}
      <group position={[3.2, 0.2, 5.2]} rotation={[0, -Math.PI / 3, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 0.12, 4.2]} />
          <meshStandardMaterial color="#92400e" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};
