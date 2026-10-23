import React from 'react';

export const CurvedPath: React.FC = () => {
  return (
    <group position={[0, 0.02, 0]}>
      {/* 1. Outer Concentric Walkway Ring (Radius ~51m, Width 3m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[49.5, 52.5, 96]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.6}
        />
      </mesh>

      {/* 2. Inner Courtyard Walkway Ring Connecting All 7 Agents (Radius ~26m, Width 3.2m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[24.4, 27.6, 96]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.6}
        />
      </mesh>

      {/* Central Plaza Ring around Agent 7 (Radius ~6m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[7.5, 48]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.4}
        />
      </mesh>

      {/* 3. Radial Walkways Connecting Central Agent 7 to Inner Ring and Outer Entrances */}
      {/* South Walkway */}
      <mesh position={[0, 0, 18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.6, 26]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* North Walkway */}
      <mesh position={[0, 0, -18]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.6, 26]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* East Walkway */}
      <mesh position={[18, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 3.6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* West Walkway */}
      <mesh position={[-18, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 3.6]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>
    </group>
  );
};
