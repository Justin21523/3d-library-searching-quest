import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider, useRapier } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';
import { createEnemyAI, updateEnemyAI, type EnemyData } from '../systems/enemyAI';
import * as THREE from 'three';

export default function Enemy() {
  const { world } = useRapier();
  const { camera } = useThree();
  const enemyDataRef = useRef<EnemyData>(createEnemyAI());
  const rigidBodyRef = useRef<any>(null);
  const setGameOver = useGameStore((s) => s.setGameOver);
  const setEnemyState = useGameStore((s) => s.setEnemyState);
  const gameOver = useGameStore((s) => s.gameOver);
  const godMode = useGameStore((s) => s.godMode);

  // 同步位置到 store（用於可能的 HUD 或除錯）
  useEffect(() => {
    const interval = setInterval(() => {
      if (enemyDataRef.current) {
        const pos = enemyDataRef.current.position;
        setEnemyState({ position: [pos.x, pos.y, pos.z], state: enemyDataRef.current.state });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [setEnemyState]);
  
  // 重置敵人數據
  useEffect(() => {
  if (!gameOver) {
      enemyDataRef.current = createEnemyAI();
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x: -5, y: 1.5, z: 5 }, true);
      }
  }
  }, [gameOver]);
  
  useFrame((_, delta) => {
    if (gameOver || !world) return;
    const enemy = enemyDataRef.current;
    const playerPos = camera.position.clone();
    // 更新 AI
    updateEnemyAI(enemy, playerPos, world, delta);

    // 更新 rigid body 位置（kinematic）
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setNextKinematicTranslation({
        x: enemy.position.x,
        y: enemy.position.y,
        z: enemy.position.z,
      });
    }

    // 檢查與玩家的距離（死亡判定）
    const dist = enemy.position.distanceTo(playerPos);
    if (dist < 1.2 && enemy.state === 'chase' && !godMode) {
      setGameOver(true);
    }
  });

  // 敵人的簡單造型
  const bodyGeometry = useMemo(() => new THREE.CylinderGeometry(0.4, 0.5, 1.8, 8), []);
  const headGeometry = useMemo(() => new THREE.SphereGeometry(0.35, 16, 16), []);

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      position={[enemyDataRef.current.position.x, enemyDataRef.current.position.y, enemyDataRef.current.position.z]}
      colliders={false}
    >
      <CuboidCollider args={[0.5, 0.9, 0.5]} />
      <group>
        {/* 身體 */}
        <mesh castShadow geometry={bodyGeometry} position={[0, 0.9, 0]}>
          <meshStandardMaterial color="#2a1f1f" roughness={0.6} />
        </mesh>
        {/* 頭部 */}
        <mesh castShadow geometry={headGeometry} position={[0, 2.0, 0]}>
          <meshStandardMaterial color="#c0c0c0" roughness={0.3} emissive="#111" />
        </mesh>
        {/* 眼睛 (兩點紅光) */}
        <mesh position={[0.2, 2.0, 0.3]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
        <mesh position={[-0.2, 2.0, 0.3]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    </RigidBody>
  );
}