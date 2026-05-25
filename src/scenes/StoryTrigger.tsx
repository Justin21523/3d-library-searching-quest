import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';
import { useState } from 'react';

interface Props {
  position: THREE.Vector3;
  storyId: string;
  text: string;
}

export default function StoryTrigger({ position, text }: Props) {
  const [triggered, setTriggered] = useState(false);
  const setNarrative = useGameStore((s) => s.setNarrative);

  useFrame((state) => {
    if (triggered) return;
    const dist = state.camera.position.distanceTo(position);
    if (dist < 3) {
      setTriggered(true);
      setNarrative(text);
    }
  });

  return null;
}