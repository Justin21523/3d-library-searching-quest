import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';

interface DocumentPickupProps {
  id: number;
  position: [number, number, number];
  title: string;
  content: string;
}

export default function DocumentPickup({ id, position, title, content }: DocumentPickupProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [collected, setCollected] = useState(false);
  const addDocument = useGameStore((s) => s.addDocument);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (!collected) {
      const dist = state.camera.position.distanceTo(new THREE.Vector3(...position));
      if (dist < 1.8) {
        setCollected(true);
        addDocument({ id, title, content });
      }
    }
  });

  if (collected) return null;

  return (
    <mesh ref={meshRef} position={position} rotation={[0, Math.PI / 4, 0]}>
      <planeGeometry args={[0.5, 0.7]} />
      <meshBasicMaterial color="#ffebcd" side={THREE.DoubleSide} />
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.4, 0.6]} />
        <meshBasicMaterial color="#eaddcf" />
      </mesh>
    </mesh>
  );
}