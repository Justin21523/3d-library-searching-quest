import { useRef } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DoorProps {
  position: [number, number, number];
  targetOpenPosition: [number, number, number]; // 打開時的移動目標
}

export default function Door({ position, targetOpenPosition }: DoorProps) {
  const rigidBodyRef = useRef<any>(null);
  const isOpen = useGameStore((s) => s.terminalsRepaired >= 1); // 條件：修復一台終端機
  const currentPos = useRef(new THREE.Vector3(...position));

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;
    const target = isOpen ? new THREE.Vector3(...targetOpenPosition) : new THREE.Vector3(...position);
    currentPos.current.lerp(target, delta * 3); // 平滑移動
    rigidBodyRef.current.setNextKinematicTranslation({
      x: currentPos.current.x,
      y: currentPos.current.y,
      z: currentPos.current.z,
    });
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      position={position}
      colliders={false}
    >
      <CuboidCollider args={[0.5, 1.4, 0.15]} />
      <mesh castShadow>
        <boxGeometry args={[1, 2.8, 0.3]} />
        <meshStandardMaterial color="#5c4033" />
      </mesh>
    </RigidBody>
  );
}