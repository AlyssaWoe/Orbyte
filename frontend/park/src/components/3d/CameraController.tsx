import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraControllerProps {
  resetTrigger?: number;
}

export const CameraController: React.FC<CameraControllerProps> = ({ resetTrigger = 0 }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Set default initial view: high isometric angle showcasing the Apple Park ring and grounds
  useEffect(() => {
    camera.position.set(0, 38, 54);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Handle reset camera smoothly
  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current) {
      const controls = controlsRef.current;
      controls.reset();
      camera.position.set(0, 38, 54);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }, [resetTrigger, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      minDistance={10}
      maxDistance={135}
      minPolarAngle={Math.PI * 0.05} // High bird's eye
      maxPolarAngle={Math.PI * 0.46} // Prevent dipping beneath ground
      target={[0, 0, 0]}
    />
  );
};
