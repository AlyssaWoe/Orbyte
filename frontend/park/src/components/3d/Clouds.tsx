import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CloudData {
  position: [number, number, number];
  scale: [number, number, number];
  speed: number;
}

const CLOUD_CONFIGS: CloudData[] = [
  { position: [-40, 32, -30], scale: [12, 4, 8], speed: 0.8 },
  { position: [25, 36, -50], scale: [16, 5, 10], speed: 0.6 },
  { position: [50, 30, 20], scale: [14, 4, 9], speed: 0.7 },
  { position: [-20, 38, 45], scale: [18, 5, 11], speed: 0.5 },
  { position: [0, 34, -15], scale: [10, 3.5, 7], speed: 0.9 },
  { position: [-60, 28, 10], scale: [15, 4.5, 9], speed: 0.65 },
];

export const Clouds: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const cfg = CLOUD_CONFIGS[i % CLOUD_CONFIGS.length];
      child.position.x += cfg.speed * delta * 2;
      if (child.position.x > 90) {
        child.position.x = -90;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {CLOUD_CONFIGS.map((c, idx) => (
        <group key={idx} position={c.position}>
          {/* Main cloud body made of overlapping soft white rounded voxels/spheres */}
          <mesh castShadow={false} receiveShadow={false}>
            <sphereGeometry args={[c.scale[1] * 1.4, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              transparent
              opacity={0.92}
            />
          </mesh>
          <mesh position={[c.scale[0] * 0.45, -c.scale[1] * 0.2, 0]}>
            <sphereGeometry args={[c.scale[1] * 1.1, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              transparent
              opacity={0.92}
            />
          </mesh>
          <mesh position={[-c.scale[0] * 0.45, -c.scale[1] * 0.2, 0]}>
            <sphereGeometry args={[c.scale[1] * 1.15, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              transparent
              opacity={0.92}
            />
          </mesh>
          <mesh position={[c.scale[0] * 0.2, c.scale[1] * 0.3, c.scale[2] * 0.2]}>
            <sphereGeometry args={[c.scale[1] * 0.85, 12, 12]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              transparent
              opacity={0.92}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
