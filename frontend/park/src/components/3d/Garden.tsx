import React from 'react';

export const Garden: React.FC = () => {
  // Flower beds inside inner courtyard and along entrance
  const flowerBeds = [
    { position: [8, 0.05, 8], color: '#f43f5e' },
    { position: [-8, 0.05, 8], color: '#eab308' },
    { position: [8, 0.05, -8], color: '#a855f7' },
    { position: [-8, 0.05, -8], color: '#ec4899' },
    { position: [0, 0.05, 12], color: '#3b82f6' },
    // Entrance flowers
    { position: [4, 0.05, 34], color: '#10b981' },
    { position: [-4, 0.05, 34], color: '#f59e0b' }
  ];

  return (
    <group>
      {flowerBeds.map((bed, idx) => (
        <group key={idx} position={bed.position as [number, number, number]}>
          {/* Manicured round hedge bed */}
          <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[1.8, 2.0, 0.32, 16]} />
            <meshStandardMaterial color="#166534" roughness={0.9} />
          </mesh>

          {/* Individual flowers/blossoms */}
          {Array.from({ length: 9 }).map((_, fIdx) => {
            const angle = (fIdx / 9) * Math.PI * 2;
            const r = 0.9 * ((fIdx % 3) + 1) / 3;
            const fx = Math.cos(angle) * r;
            const fz = Math.sin(angle) * r;
            return (
              <mesh key={fIdx} position={[fx, 0.38, fz]} castShadow>
                <sphereGeometry args={[0.18, 6, 6]} />
                <meshStandardMaterial color={bed.color} roughness={0.4} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};
