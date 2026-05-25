import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';

export default function BatteryPickup({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);
  const rechargeBattery = useGameStore((s) => s.rechargeBattery);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
    }
    if (!collected) {
      const dist = state.camera.position.distanceTo(new THREE.Vector3(...position));
      if (dist < 1.5) {
        setCollected(true);
        rechargeBattery(30); // 回復 30% 電力
      }
    }
  });

  if (collected) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.3, 0.5, 0.3]} />
      <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={0.5} />
    </mesh>
  );
}