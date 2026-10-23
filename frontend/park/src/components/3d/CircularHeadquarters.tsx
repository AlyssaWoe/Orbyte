import React from 'react';
import * as THREE from 'three';
import { GlassFacade } from './GlassFacade';

interface CircularHQProps {
  outerRadius?: number;
  innerRadius?: number;
  height?: number;
  floors?: number;
}

export const CircularHeadquarters: React.FC<CircularHQProps> = ({
  outerRadius = 48,
  innerRadius = 36,
  height = 5.6,
  floors = 4
}) => {
  const floorHeight = height / floors;
  const segments = 96;
  const midRadius = (outerRadius + innerRadius) / 2;

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Outer Glass Facade */}
      <GlassFacade radius={outerRadius} height={height} segments={segments} />

      {/* 2. Inner Courtyard Glass Facade */}
      <GlassFacade radius={innerRadius} height={height} segments={segments} />

      {/* 3. Horizontal White Structural Bands / Floor Slabs & Sun Louvers */}
      {Array.from({ length: floors + 1 }).map((_, floorIdx) => {
        const y = floorIdx * floorHeight;
        const isRoof = floorIdx === floors;

        return (
          <group key={floorIdx} position={[0, y, 0]}>
            {/* Horizontal Ring Slab */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <ringGeometry
                args={[
                  innerRadius - 0.4,
                  outerRadius + 0.8,
                  segments
                ]}
              />
              <meshStandardMaterial
                color={isRoof ? '#e2e8f0' : '#f8fafc'}
                roughness={0.25}
                metalness={0.05}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Edge trim cylinder for outer canopy */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry
                args={[outerRadius + 0.8, outerRadius + 0.8, 0.14, segments, 1, true]}
              />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* Edge trim cylinder for inner canopy */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry
                args={[innerRadius - 0.4, innerRadius - 0.4, 0.14, segments, 1, true]}
              />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* 4. Solar Panels on top of the giant ring */}
      <mesh
        position={[0, height + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <ringGeometry
          args={[innerRadius + 1.5, outerRadius - 1.5, segments]}
        />
        <meshStandardMaterial
          color="#334155"
          roughness={0.35}
          metalness={0.8}
        />
      </mesh>

      {/* 5. Interior Columns visible through glass */}
      {Array.from({ length: 28 }).map((_, colIdx) => {
        const angle = (colIdx / 28) * Math.PI * 2;
        const x = Math.cos(angle) * midRadius;
        const z = Math.sin(angle) * midRadius;
        return (
          <mesh
            key={colIdx}
            position={[x, height / 2, z]}
            castShadow
          >
            <cylinderGeometry args={[0.3, 0.3, height, 12]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
          </mesh>
        );
      })}

      {/* Interior warm lighting */}
      {Array.from({ length: 14 }).map((_, lightIdx) => {
        const angle = (lightIdx / 14) * Math.PI * 2;
        const x = Math.cos(angle) * midRadius;
        const z = Math.sin(angle) * midRadius;
        return (
          <pointLight
            key={lightIdx}
            position={[x, height * 0.6, z]}
            intensity={0.35}
            distance={14}
            color="#fef08a"
          />
        );
      })}

      {/* 6. Steve Jobs Theater style glass pavilion outside the ring (West) */}
      <group position={[-58, 0, -22]}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <cylinderGeometry args={[5.5, 5.5, 3.6, 32]} />
          <meshPhysicalMaterial
            color="#cffafe"
            transparent
            opacity={0.4}
            roughness={0.05}
            transmission={0.85}
          />
        </mesh>
        <mesh position={[0, 3.65, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[6.2, 6.2, 0.25, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <cylinderGeometry args={[6.4, 6.4, 0.16, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};
