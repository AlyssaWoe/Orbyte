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
  outerRadius = 26,
  innerRadius = 18,
  height = 5.2,
  floors = 4
}) => {
  const floorHeight = height / floors;
  const segments = 64;
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
                  innerRadius - 0.3, // slight overhang inside
                  outerRadius + 0.6, // iconic Apple Park white cantilever canopy outside
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
                args={[outerRadius + 0.6, outerRadius + 0.6, 0.12, segments, 1, true]}
              />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            {/* Edge trim cylinder for inner canopy */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry
                args={[innerRadius - 0.3, innerRadius - 0.3, 0.12, segments, 1, true]}
              />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* 4. Solar Panels & Green Roof on top ring */}
      <mesh
        position={[0, height + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <ringGeometry
          args={[innerRadius + 1.2, outerRadius - 1.2, segments]}
        />
        <meshStandardMaterial
          color="#334155" // Dark sleek solar arrays
          roughness={0.35}
          metalness={0.8}
        />
      </mesh>

      {/* 5. Interior Columns & Floor Decks visible through glass */}
      {Array.from({ length: 16 }).map((_, colIdx) => {
        const angle = (colIdx / 16) * Math.PI * 2;
        const x = Math.cos(angle) * midRadius;
        const z = Math.sin(angle) * midRadius;
        return (
          <mesh
            key={colIdx}
            position={[x, height / 2, z]}
            castShadow
          >
            <cylinderGeometry args={[0.22, 0.22, height, 12]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
          </mesh>
        );
      })}

      {/* Interior warm ambient glow lights for office workstations */}
      {Array.from({ length: 8 }).map((_, lightIdx) => {
        const angle = (lightIdx / 8) * Math.PI * 2;
        const x = Math.cos(angle) * midRadius;
        const z = Math.sin(angle) * midRadius;
        return (
          <pointLight
            key={lightIdx}
            position={[x, height * 0.6, z]}
            intensity={0.25}
            distance={8}
            color="#fef08a"
          />
        );
      })}

      {/* 6. Smaller Ancillary Campus Buildings (e.g. Steve Jobs Theater style glass pavilion & fitness center) */}
      {/* South-West Glass Pavilion */}
      <group position={[-36, 0, -18]}>
        {/* Circular glass cylinder pavilion */}
        <mesh position={[0, 1.6, 0]} castShadow>
          <cylinderGeometry args={[4.5, 4.5, 3.2, 32]} />
          <meshPhysicalMaterial
            color="#cffafe"
            transparent
            opacity={0.4}
            roughness={0.05}
            transmission={0.85}
          />
        </mesh>
        {/* Carbon fiber style flat circular roof */}
        <mesh position={[0, 3.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[5.2, 5.2, 0.2, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.3} />
        </mesh>
        {/* White base ring */}
        <mesh position={[0, 0.08, 0]} receiveShadow>
          <cylinderGeometry args={[5.4, 5.4, 0.16, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
      </group>

      {/* North-East R&D Building */}
      <group position={[38, 0, -14]}>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[9, 3.6, 6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
        {/* Modern ribbon glass strip */}
        <mesh position={[0, 1.8, 3.02]}>
          <planeGeometry args={[8.4, 1.8]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            transparent
            opacity={0.6}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[0, 3.65, 0]}>
          <boxGeometry args={[9.4, 0.2, 6.4]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
};
