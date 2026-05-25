import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import { Mesh } from 'three';

interface DataFragmentProps {
  id: number;
  position: [number, number, number];
}

export default function DataFragment({ id, position }: DataFragmentProps) {
  const meshRef = useRef<Mesh>(null);
  const collected = useGameStore((s) => s.fragments.find((f) => f.id === id)?.collected);
  const collectFragment = useGameStore((s) => s.collectFragment);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
    // 檢測玩家距離，自動拾取
    if (collected) return;
    const dist = state.camera.position.distanceTo(
      new THREE.Vector3(...position)
    );
    if (dist < 1.8) {
      collectFragment(id);
    }
  });

  if (collected) return null;

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial
        color="#00ffe0"
        emissive="#00ffe0"
        emissiveIntensity={0.8}
        roughness={0.2}
        metalness={0.5}
      />
    </mesh>
  );
}