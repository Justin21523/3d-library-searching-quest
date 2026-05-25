import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';

export default function Drone() {
  const rigidBodyRef = useRef<any>(null);
  const { camera } = useThree();
  const setGameOver = useGameStore((s) => s.setGameOver);
  const gameOver = useGameStore((s) => s.gameOver);
  const godMode = useGameStore((s) => s.godMode);

  const dronePos = useRef(new THREE.Vector3(5, 2.5, 5));
  const targetPos = useRef(new THREE.Vector3(-5, 2.5, -5));
  const speed = 2.0;

  useFrame((_, delta) => {
    if (gameOver || !rigidBodyRef.current) return;
    // 簡單巡邏來回移動
    const dir = new THREE.Vector3().copy(targetPos.current).sub(dronePos.current);
    if (dir.length() < 0.5) {
      // 切換目標
      targetPos.current.set(
        (Math.random() - 0.5) * 20,
        2.5,
        (Math.random() - 0.5) * 20
      );
    } else {
      dir.normalize().multiplyScalar(speed * delta);
      dronePos.current.add(dir);
    }
    rigidBodyRef.current.setNextKinematicTranslation({
      x: dronePos.current.x,
      y: dronePos.current.y,
      z: dronePos.current.z,
    });

    // 檢測玩家距離
    const playerDist = camera.position.distanceTo(dronePos.current);
    if (playerDist < 2.0 && !godMode) {
      setGameOver(true);
    }
  });

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" position={[5, 2.5, 5]} colliders={false}>
      <CuboidCollider args={[0.4, 0.2, 0.4]} />
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.3, 0.8]} />
        <meshStandardMaterial color="#555" emissive="#111" />
      </mesh>
      {/* 螺旋槳視覺 */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
        <meshStandardMaterial color="#ccc" />
      </mesh>
    </RigidBody>
  );
}