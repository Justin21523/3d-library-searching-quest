import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';

export default function Portal({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const terminalsRepaired = useGameStore((s) => s.terminalsRepaired);
  const setVictory = useGameStore((s) => s.setVictory);
  const victory = useGameStore((s) => s.victory);

  const isActive = terminalsRepaired >= 2;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.visible = isActive;
      meshRef.current.rotation.z += 0.03;
    }
    if (isActive && !victory) {
      const dist = state.camera.position.distanceTo(new THREE.Vector3(...position));
      if (dist < 2) {
        setVictory(true);
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[1, 0.1, 16, 32]} />
      <meshBasicMaterial color="#00ffff" />
    </mesh>
  );
}