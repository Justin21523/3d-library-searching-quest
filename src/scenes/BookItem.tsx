import { useRef } from 'react';
import * as THREE from 'three';

export default function BookItem({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.12, 0.2, 0.05]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
