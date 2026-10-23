import React from 'react';
import * as THREE from 'three';

interface GlassFacadeProps {
  radius: number;
  height: number;
  segments?: number;
}

export const GlassFacade: React.FC<GlassFacadeProps> = ({
  radius,
  height,
  segments = 64
}) => {
  return (
    <mesh position={[0, height / 2, 0]}>
      <cylinderGeometry
        args={[radius, radius, height, segments, 1, true]}
      />
      <meshPhysicalMaterial
        color="#cffafe" // Soft cyan-tinted architectural glass
        transparent
        opacity={0.45}
        roughness={0.05}
        metalness={0.1}
        transmission={0.85}
        ior={1.48}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
