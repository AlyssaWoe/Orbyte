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

  // Set steady, high bird's-eye overview framing the entire giant Apple Park ring
  useEffect(() => {
    camera.position.set(0, 72, 68);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Reset camera smoothly to the steady overview
  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current) {
      const controls = controlsRef.current;
      controls.reset();
      camera.position.set(0, 72, 68);
      controls.target.set(0, 0, 0);
      controls.update();
    }
  }, [resetTrigger, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={20}
      maxDistance={160}
      minPolarAngle={Math.PI * 0.1}
      maxPolarAngle={Math.PI * 0.45}
      target={[0, 0, 0]}
      autoRotate={false}
    />
  );
};
