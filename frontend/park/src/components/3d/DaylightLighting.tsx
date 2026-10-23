import React from 'react';

export const DaylightLighting: React.FC = () => {
  return (
    <>
      {/* Clear light-blue daytime ambient illumination */}
      <hemisphereLight
        args={['#bae6fd', '#bbf7d0', 0.85]} // Sky light-blue, ground grass-green bounce
      />

      {/* Bright sunlight representing daytime sun */}
      <directionalLight
        position={[45, 65, 35]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={250}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0005}
      />

      {/* Secondary soft fill light for balanced shadow illumination */}
      <directionalLight
        position={[-35, 40, -45]}
        intensity={0.4}
        color="#fef08a" // Subtle warm morning sun fill
      />
    </>
  );
};
