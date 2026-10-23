import React from 'react';

export const ParkGround: React.FC = () => {
  return (
    <group position={[0, -0.05, 0]}>
      {/* 1. Main Base Terrain (Lush Green Campus Lawn) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[260, 260, 48, 48]} />
        <meshStandardMaterial
          color="#38a169"
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>

      {/* 2. Giant Inner Courtyard Lawn inside the Giant Ring (Radius ~35.5m) */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[35.5, 64]} />
        <meshStandardMaterial
          color="#48bb78"
          roughness={0.82}
        />
      </mesh>

      {/* 3. South Entrance Plaza Stone Pavers (South of giant ring at z = 56m) */}
      <mesh position={[0, 0.02, 56]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[12, 32]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.4}
        />
      </mesh>

      {/* Entrance Welcome Monolith Sign */}
      <group position={[0, 0.05, 64]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.2, 1.0, 0.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[4.8, 1.1, 0.14]} />
          <meshPhysicalMaterial
            color="#ecfdf5"
            transmission={0.8}
            transparent
            opacity={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 4. Peripheral Green Knoll Berms outside the Giant Ring */}
      <mesh position={[-68, -0.2, 38]} castShadow receiveShadow>
        <sphereGeometry args={[18, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color="#2f855a" roughness={0.9} />
      </mesh>
      <mesh position={[70, -0.2, 34]} castShadow receiveShadow>
        <sphereGeometry args={[16, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color="#2f855a" roughness={0.9} />
      </mesh>
      <mesh position={[-65, -0.2, -55]} castShadow receiveShadow>
        <sphereGeometry args={[20, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color="#276749" roughness={0.9} />
      </mesh>
    </group>
  );
};
