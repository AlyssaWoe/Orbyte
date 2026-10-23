import React from 'react';

export const CurvedPath: React.FC = () => {
  return (
    <group position={[0, 0.02, 0]}>
      {/* 1. Outer Concentric Walkway Ring (Radius ~30m, Width 2.4m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[28.8, 31.2, 64]} />
        <meshStandardMaterial
          color="#f1f5f9" // Off-white clean concrete Apple walkway
          roughness={0.6}
        />
      </mesh>

      {/* 2. Inner Courtyard Walkway Ring (Radius ~15m, Width 2.2m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[14, 16.2, 64]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.6}
        />
      </mesh>

      {/* 3. Radial Walkways Connecting Entrance to Ring Building & Courtyard */}
      {/* South Entrance Path to Outer Ring */}
      <mesh position={[0, 0, 31]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.2, 8]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* South Walk-through tunnel path passing under the ring into courtyard */}
      <mesh position={[0, 0, 22]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.2, 10]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>

      {/* North radial walkway passing under north ring */}
      <mesh position={[0, 0, -22]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.2, 10]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>

      {/* East radial connecting path to R&D building */}
      <mesh position={[32, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 2.8]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* West radial connecting path to Pavilion and Pond */}
      <mesh position={[-32, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 2.8]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* Curved connector to Pond (North-West) */}
      <mesh position={[-24, 0, -20]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]} receiveShadow>
        <planeGeometry args={[2.4, 14]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>

      {/* Curved connector to Southeast Meadow */}
      <mesh position={[24, 0, 22]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]} receiveShadow>
        <planeGeometry args={[2.4, 12]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.6} />
      </mesh>
    </group>
  );
};
