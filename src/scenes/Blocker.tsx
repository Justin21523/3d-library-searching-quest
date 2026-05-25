import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';

export default function Blocker({ patrolPath }: { patrolPath: THREE.Vector3[] }) {
  const rigidBodyRef = useRef<any>(null);
  const { camera } = useThree();
  const gameOver = useGameStore((s) => s.gameOver);
  const currentTarget = useRef(0);
  const position = useRef(new THREE.Vector3(0, 0.9, 0));
  const speed = 1.2;

  useEffect(() => {
    if (patrolPath.length > 0) {
      position.current.copy(patrolPath[0]);
    }
  }, [patrolPath]);

  useFrame((_, delta) => {
    if (gameOver || patrolPath.length === 0 || !rigidBodyRef.current) return;
    const target = patrolPath[currentTarget.current];
    const dir = new THREE.Vector3().copy(target).sub(position.current);
    if (dir.length() < 0.5) {
      currentTarget.current = (currentTarget.current + 1) % patrolPath.length;
    } else {
      dir.normalize().multiplyScalar(speed * delta);
      position.current.add(dir);
    }
    rigidBodyRef.current.setNextKinematicTranslation({
      x: position.current.x,
      y: position.current.y,
      z: position.current.z,
    });

    // 接觸玩家
    const dist = camera.position.distanceTo(position.current);
    if (dist < 1.5) {
      // 癱瘓手電筒 2 秒
      useGameStore.getState().consumeBattery(10);
      // 可添加閃光效果
    }
  });

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicPosition" position={[0, 0.9, 0]} colliders={false}>
      <CuboidCollider args={[0.8, 1.0, 0.8]} />
      <mesh castShadow>
        <boxGeometry args={[1.6, 2.0, 1.6]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.4} />
      </mesh>
      {/* 紅光指示燈 */}
      <mesh position={[0, 1.2, 0.9]}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </RigidBody>
  );
}