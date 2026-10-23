import React from 'react';

export const Pond: React.FC = () => {
  return (
    <group position={[-14, 0.03, -14]}>
      {/* 1. Organic Pond inside the Giant Courtyard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.2, 32]} />
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

      {/* Secondary overlapping circle for natural pond shape */}
      <mesh position={[3.2, 0.005, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.8, 28]} />
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
      {Array.from({ length: 20 }).map((_, idx) => {
        const angle = (idx / 20) * Math.PI * 2;
        const radius = 5.2 + (Math.sin(idx * 3) * 0.35);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <mesh
            key={idx}
            position={[x, 0.12, z]}
            scale={[0.35 + (idx % 3) * 0.12, 0.2, 0.3 + (idx % 2) * 0.1]}
            castShadow
          >
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color={idx % 2 === 0 ? '#94a3b8' : '#cbd5e1'} roughness={0.7} />
          </mesh>
        );
      })}

      {/* Small wooden footbridge */}
      <group position={[2.5, 0.18, 4.0]} rotation={[0, -Math.PI / 3, 0]}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.1, 3.4]} />
          <meshStandardMaterial color="#92400e" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
};
