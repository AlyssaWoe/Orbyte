import React from 'react';

export const ParkGround: React.FC = () => {
  return (
    <group position={[0, -0.05, 0]}>
      {/* 1. Main Base Terrain (Lush Green Campus Lawn) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[170, 170, 48, 48]} />
        <meshStandardMaterial
          color="#38a169" // Crisp vibrant Apple Park green lawn
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>

      {/* 2. Inner Courtyard Raised Mound / Gentle Hill in Center of Ring */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[17.6, 48]} />
        <meshStandardMaterial
          color="#48bb78" // Bright inner meadow green
          roughness={0.82}
        />
      </mesh>

      {/* 3. Entrance Plaza Stone Pavers (Front South Plaza) */}
      <mesh position={[0, 0.02, 36]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[9, 32]} />
        <meshStandardMaterial
          color="#e2e8f0" // Polished architectural limestone plaza
          roughness={0.4}
        />
      </mesh>

      {/* Entrance Welcome Monolith Sign (Like Apple Park Visitor Center sign) */}
      <group position={[0, 0.05, 43]}>
        {/* Stone base */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 0.8, 0.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Glass acrylic panel */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[3.8, 0.9, 0.12]} />
          <meshPhysicalMaterial
            color="#ecfdf5"
            transmission={0.8}
            transparent
            opacity={0.8}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* 4. Peripheral Subtle Green Knoll Berms (Apple Park earthen landscape berms) */}
      <mesh position={[-42, -0.2, 28]} castShadow receiveShadow>
        <sphereGeometry args={[14, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color="#2f855a" roughness={0.9} />
      </mesh>
      <mesh position={[45, -0.2, 24]} castShadow receiveShadow>
        <sphereGeometry args={[12, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color="#2f855a" roughness={0.9} />
      </mesh>
      <mesh position={[-40, -0.2, -35]} castShadow receiveShadow>
        <sphereGeometry args={[16, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color="#276749" roughness={0.9} />
      </mesh>
    </group>
  );
};
