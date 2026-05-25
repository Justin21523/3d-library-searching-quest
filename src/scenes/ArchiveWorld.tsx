import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Environment } from '@react-three/drei';
import { EffectComposer, Glitch } from '@react-three/postprocessing';
import Player from '../components/Player';
import LevelGenerator from './LevelGenerator';
import Flashlight from './Effects/Flashlight';
import Enemy from './Enemy';
import Drone from './Drone';
import Blocker from './Blocker';
import { useGameStore } from '../store/useGameStore';

export default function ArchiveWorld() {
  const inErrorZone = useGameStore((s) => s.inErrorZone);

  const blockerPath = [
    new THREE.Vector3(4, 0.9, 4),
    new THREE.Vector3(8, 0.9, 8),
    new THREE.Vector3(4, 0.9, 12),
    new THREE.Vector3(0, 0.9, 8),
  ];

  return (
    <Canvas shadows camera={{ fov: 60, near: 0.1, far: 300 }} style={{ width: '100vw', height: '100vh' }}>
      <color attach="background" args={['#0a0a0a']} />
      <fog attach="fog" args={['#0a0a0a', 25, 80]} />
      <Physics>
        <LevelGenerator />
        <Player />
        <Flashlight />
        <Enemy />
        <Drone />
        <Blocker patrolPath={blockerPath} />
        {/* 靜態異常區域：進入後觸發畫面故障特效 */}
        <ErrorZone position={[10, 1, 10]} />
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 3, 0]} intensity={0.3} color="#ffaa00" distance={12} />
      </Physics>
      <EffectComposer>
        <Glitch active={inErrorZone} />
      </EffectComposer>
      <Environment preset="night" />
      <EffectComposer>
        <Glitch
          active={inErrorZone}
          ratio={0.2}
          delay={new THREE.Vector2(0.1, 0.3)}
        />
      </EffectComposer>
    </Canvas>
  );
}

// 進入此範圍會觸發故障特效
function ErrorZone({ position }: { position: [number, number, number] }) {
  const setInErrorZone = useGameStore((s) => s.setInErrorZone);

  useFrame((state) => {
    const dist = state.camera.position.distanceTo(new THREE.Vector3(...position));
    setInErrorZone(dist < 3);
  });

  return null;
}
