import { useRef } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MovingShelfProps {
  startPosition: [number, number, number];
  endPosition: [number, number, number];
  trigger: boolean;
}

export default function MovingShelf({ startPosition, endPosition, trigger }: MovingShelfProps) {
  const rigidBodyRef = useRef<any>(null);
  const currentPos = useRef(new THREE.Vector3(...startPosition));

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;
    const target = trigger ? new THREE.Vector3(...endPosition) : new THREE.Vector3(...startPosition);
    currentPos.current.lerp(target, delta * 1.5);
    rigidBodyRef.current.setNextKinematicTranslation({
      x: currentPos.current.x,
      y: currentPos.current.y,
      z: currentPos.current.z,
    });
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      position={startPosition}
      colliders={false}
    >
      <CuboidCollider args={[1.1, 1.4, 0.4]} />
      <BookShelfMesh /> {/* 複用書架外觀但無需再包 RigidBody */}
    </RigidBody>
  );
}

// 書架外觀函數組件（不帶物理）
function BookShelfMesh() {
  // 簡化版，直接使用 BookShelf 的視覺部分，但注意 BookShelf 內部有 RigidBody，我們不能重複。
  // 所以我們將 BookShelf 的視覺部分抽出成獨立組件，或在此處手動組合。
  // 為快速實現，我們直接放置一個簡單的帶紋理方塊，或複製 BookShelf 的 group。
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.2, 2.8, 0.8]} />
        <meshStandardMaterial color="#5c3a21" />
      </mesh>
      {/* 這裡可以複製 BookShelf 的內部結構，但為簡化先用普通方塊代替，後續可優化 */}
    </group>
  );
}