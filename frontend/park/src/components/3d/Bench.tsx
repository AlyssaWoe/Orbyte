import React from 'react';

interface BenchProps {
  position: [number, number, number];
  rotationY?: number;
}

const SingleBench: React.FC<BenchProps> = ({ position, rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Wood slats seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.8, 0.08, 0.5]} />
        <meshStandardMaterial color="#a16207" roughness={0.6} />
      </mesh>
      {/* Backrest */}
      <mesh position={[0, 0.72, -0.22]} castShadow>
        <boxGeometry args={[1.8, 0.35, 0.06]} />
        <meshStandardMaterial color="#a16207" roughness={0.6} />
      </mesh>
      {/* Modern aluminum legs */}
      <mesh position={[-0.75, 0.22, 0]} castShadow>
        <boxGeometry args={[0.08, 0.44, 0.45]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.75, 0.22, 0]} castShadow>
        <boxGeometry args={[0.08, 0.44, 0.45]} />
        <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
};

export const BenchGroup: React.FC = () => {
  const benches: BenchProps[] = [
    // Courtyard benches
    { position: [10, 0, 0], rotationY: -Math.PI / 2 },
    { position: [-10, 0, 0], rotationY: Math.PI / 2 },
    { position: [0, 0, 10], rotationY: 0 },
    { position: [0, 0, -10], rotationY: Math.PI },
    // Near Pond
    { position: [-15, 0, -12], rotationY: Math.PI / 4 },
    { position: [-13, 0, -18], rotationY: -Math.PI / 3 },
    // South Entrance Plaza
    { position: [5, 0, 36], rotationY: -Math.PI / 2 },
    { position: [-5, 0, 36], rotationY: Math.PI / 2 }
  ];

  return (
    <group>
      {benches.map((b, idx) => (
        <SingleBench key={idx} position={b.position} rotationY={b.rotationY} />
      ))}
    </group>
  );
};
