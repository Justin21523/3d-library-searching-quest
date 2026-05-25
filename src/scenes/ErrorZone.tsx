import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';

export default function ErrorZone({ position, radius = 4 }: { position: THREE.Vector3; radius?: number }) {
  useFrame((state) => {
    const dist = state.camera.position.distanceTo(position);
    useGameStore.getState().setInErrorZone(dist < radius);
  });
  return null;
}