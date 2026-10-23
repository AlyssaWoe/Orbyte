import React, { useMemo } from 'react';

interface TreeData {
  position: [number, number, number];
  scale: number;
  foliageColor: string;
  type: 'oak' | 'pine' | 'blossom';
}

export const TreeCluster: React.FC = () => {
  // Generate natural cluster positions around Apple Park perimeter and courtyard
  const trees: TreeData[] = useMemo(() => {
    const list: TreeData[] = [];

    // 1. Inner Courtyard Orchard Trees (Apricot & Olive trees)
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2 + 0.15;
      const radius = 6 + (i % 5) * 1.8;
      // Leave center clearing for Agent 7
      if (radius > 4.5 && radius < 14) {
        list.push({
          position: [
            Math.cos(angle) * radius + (Math.sin(i * 3) * 1.2),
            0,
            Math.sin(angle) * radius + (Math.cos(i * 2) * 1.2)
          ],
          scale: 0.8 + ((i % 4) * 0.12),
          foliageColor: i % 7 === 0 ? '#f472b6' : i % 3 === 0 ? '#15803d' : '#22c55e',
          type: i % 7 === 0 ? 'blossom' : 'oak'
        });
      }
    }

    // 2. Outer Perimeter Clusters (West, North, East, South)
    // Cluster A: West near Pavilion & Pond
    for (let i = 0; i < 22; i++) {
      const angle = Math.PI * 0.75 + (i / 22) * Math.PI * 0.6;
      const radius = 34 + (i % 6) * 3;
      list.push({
        position: [
          Math.cos(angle) * radius + (Math.sin(i * 4) * 2),
          0,
          Math.sin(angle) * radius + (Math.cos(i * 5) * 2)
        ],
        scale: 0.9 + ((i % 5) * 0.15),
        foliageColor: i % 4 === 0 ? '#166534' : i % 3 === 0 ? '#15803d' : '#4ade80',
        type: i % 2 === 0 ? 'pine' : 'oak'
      });
    }

    // Cluster B: North Rolling Berms
    for (let i = 0; i < 26; i++) {
      const angle = -Math.PI * 0.2 + (i / 26) * Math.PI * 0.5;
      const radius = 33 + (i % 7) * 2.5;
      list.push({
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ],
        scale: 0.85 + ((i % 4) * 0.18),
        foliageColor: i % 5 === 0 ? '#fbcfe8' : '#16a34a',
        type: i % 5 === 0 ? 'blossom' : 'oak'
      });
    }

    // Cluster C: Southeast Grove
    for (let i = 0; i < 20; i++) {
      const angle = Math.PI * 0.15 + (i / 20) * Math.PI * 0.45;
      const radius = 35 + (i % 5) * 2.8;
      list.push({
        position: [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ],
        scale: 0.8 + ((i % 3) * 0.2),
        foliageColor: '#22c55e',
        type: 'oak'
      });
    }

    return list;
  }, []);

  return (
    <group>
      {trees.map((t, idx) => (
        <group key={idx} position={t.position} scale={[t.scale, t.scale, t.scale]}>
          {/* Trunk */}
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.32, 2.4, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.9} />
          </mesh>

          {/* Foliage */}
          {t.type === 'pine' ? (
            <group position={[0, 2.2, 0]}>
              <mesh position={[0, 0.4, 0]} castShadow>
                <coneGeometry args={[1.6, 2.2, 8]} />
                <meshStandardMaterial color={t.foliageColor} roughness={0.8} />
              </mesh>
              <mesh position={[0, 1.6, 0]} castShadow>
                <coneGeometry args={[1.2, 1.8, 8]} />
                <meshStandardMaterial color={t.foliageColor} roughness={0.8} />
              </mesh>
            </group>
          ) : (
            <group position={[0, 2.8, 0]}>
              {/* Stylized rounded / voxel-friendly puff foliage */}
              <mesh castShadow>
                <sphereGeometry args={[1.6, 12, 12]} />
                <meshStandardMaterial color={t.foliageColor} roughness={0.82} />
              </mesh>
              <mesh position={[0.5, -0.3, 0.4]} castShadow>
                <sphereGeometry args={[1.1, 10, 10]} />
                <meshStandardMaterial color={t.foliageColor} roughness={0.82} />
              </mesh>
              <mesh position={[-0.5, -0.2, -0.4]} castShadow>
                <sphereGeometry args={[1.2, 10, 10]} />
                <meshStandardMaterial color={t.foliageColor} roughness={0.82} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  );
};
