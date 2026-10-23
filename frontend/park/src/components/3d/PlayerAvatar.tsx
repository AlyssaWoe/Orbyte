import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AgentInfo, DEPARTMENTS } from '../../data/api';

interface PlayerAvatarProps {
  onNearAgentChange: (agent: AgentInfo | null) => void;
  onInteractAgent: (agent: AgentInfo) => void;
  resetTrigger: number;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  onNearAgentChange,
  onInteractAgent,
  resetTrigger
}) => {
  const { camera } = useThree();
  const playerGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  // Position and movement state
  const posRef = useRef(new THREE.Vector3(0, 0, 42)); // Start at South entrance plaza facing the Ring
  const velocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationYRef = useRef(Math.PI); // Facing Ring (North)
  const isMovingRef = useRef(false);
  const walkCycleRef = useRef(0);

  // Keyboard input state
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyE') {
        // Check proximity interact
        DEPARTMENTS.forEach((dept) => {
          const agentPos = new THREE.Vector3(...dept.position);
          if (posRef.current.distanceTo(agentPos) < 5.0) {
            onInteractAgent(dept);
          }
        });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onInteractAgent]);

  // Reset position
  useEffect(() => {
    if (resetTrigger > 0 && playerGroupRef.current) {
      posRef.current.set(0, 0, 42);
      rotationYRef.current = Math.PI;
      velocityRef.current.set(0, 0, 0);
      playerGroupRef.current.position.set(0, 0, 42);
      playerGroupRef.current.rotation.y = Math.PI;
    }
  }, [resetTrigger]);

  useFrame((_, delta) => {
    const k = keys.current;
    const forward = k['KeyW'] || k['ArrowUp'] ? 1 : k['KeyS'] || k['ArrowDown'] ? -1 : 0;
    const strafe = k['KeyD'] || k['ArrowRight'] ? 1 : k['KeyA'] || k['ArrowLeft'] ? -1 : 0;
    const isSprint = k['ShiftLeft'] || k['ShiftRight'];

    const speed = isSprint ? 12.0 : 7.0;
    const moveDir = new THREE.Vector3();

    // Camera relative directions
    const camForward = new THREE.Vector3();
    camera.getWorldDirection(camForward);
    camForward.y = 0;
    camForward.normalize();

    const camRight = new THREE.Vector3();
    camRight.crossVectors(camForward, new THREE.Vector3(0, 1, 0)).normalize();

    if (forward !== 0 || strafe !== 0) {
      moveDir.addScaledVector(camForward, forward);
      moveDir.addScaledVector(camRight, strafe);
      if (moveDir.lengthSq() > 0) {
        moveDir.normalize();
        isMovingRef.current = true;
        // Smoothly rotate towards movement vector
        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        // Shortest angle rotation lerp
        let diff = targetRot - rotationYRef.current;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        rotationYRef.current += diff * Math.min(delta * 14, 1.0);
      }
    } else {
      isMovingRef.current = false;
    }

    // Velocity update with acceleration/damping
    velocityRef.current.lerp(moveDir.multiplyScalar(speed), delta * 12);
    posRef.current.addScaledVector(velocityRef.current, delta);

    // Keep within campus bounds (max radius 75)
    if (posRef.current.length() > 74) {
      posRef.current.setLength(74);
    }

    // Apply to mesh
    if (playerGroupRef.current) {
      playerGroupRef.current.position.copy(posRef.current);
      playerGroupRef.current.rotation.y = rotationYRef.current;
    }

    // Walking animation for limbs
    if (isMovingRef.current) {
      walkCycleRef.current += delta * (isSprint ? 16 : 10);
      const angle = Math.sin(walkCycleRef.current) * 0.65;

      if (leftArmRef.current) leftArmRef.current.rotation.x = -angle;
      if (rightArmRef.current) rightArmRef.current.rotation.x = angle;
      if (leftLegRef.current) leftLegRef.current.rotation.x = angle;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -angle;
    } else {
      // Return to idle stance smoothly
      if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.8;
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.8;
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.8;
    }

    // Camera follow player position smoothly
    const cameraTarget = posRef.current.clone().add(new THREE.Vector3(0, 1.4, 0));
    // Smoothly shift camera offset
    const offset = new THREE.Vector3(0, 7.5, 12);
    offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationYRef.current);
    const desiredCamPos = posRef.current.clone().add(offset);
    camera.position.lerp(desiredCamPos, delta * 4.5);
    camera.lookAt(cameraTarget);

    // Proximity check against 7 agents
    let closestAgent: AgentInfo | null = null;
    let minDist = 5.0;

    DEPARTMENTS.forEach((dept) => {
      const agentPos = new THREE.Vector3(...dept.position);
      const d = posRef.current.distanceTo(agentPos);
      if (d < minDist) {
        minDist = d;
        closestAgent = dept;
      }
    });

    onNearAgentChange(closestAgent);
  });

  return (
    <group ref={playerGroupRef} position={[0, 0, 42]}>
      {/* Contact Shadow Disk */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.65, 24]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.3} />
      </mesh>

      {/* Voxel Legs */}
      <group ref={leftLegRef} position={[-0.14, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.7, 0.24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.7} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.14, 0.7, 0]}>
        <mesh position={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.22, 0.7, 0.24]} />
          <meshStandardMaterial color="#0284c7" roughness={0.7} />
        </mesh>
      </group>

      {/* Voxel Torso (Apple White / Green Staff Jacket) */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.54, 0.7, 0.28]} />
        <meshStandardMaterial color="#15803d" roughness={0.4} />
      </mesh>

      {/* Backpack */}
      <mesh position={[0, 1.05, -0.18]} castShadow>
        <boxGeometry args={[0.38, 0.48, 0.16]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Voxel Arms */}
      <group ref={leftArmRef} position={[-0.38, 1.35, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.65, 0.22]} />
          <meshStandardMaterial color="#15803d" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <boxGeometry args={[0.18, 0.16, 0.18]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.6} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.38, 1.35, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.65, 0.22]} />
          <meshStandardMaterial color="#15803d" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <boxGeometry args={[0.18, 0.16, 0.18]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.6} />
        </mesh>
      </group>

      {/* Voxel Head */}
      <group position={[0, 1.65, 0]}>
        <mesh ref={headRef} castShadow>
          <boxGeometry args={[0.48, 0.48, 0.48]} />
          <meshStandardMaterial color="#fed7aa" roughness={0.6} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.12, 0]} castShadow>
          <boxGeometry args={[0.52, 0.32, 0.52]} />
          <meshStandardMaterial color="#1c1917" roughness={0.8} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.11, 0, 0.25]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0.11, 0, 0.25]}>
          <boxGeometry args={[0.08, 0.08, 0.02]} />
          <meshBasicMaterial color="#0284c7" />
        </mesh>
      </group>
    </group>
  );
};
