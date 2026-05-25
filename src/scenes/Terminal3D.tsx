import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';

export default function Terminal3D({ position }: { position: [number, number, number] }) {
  const setTerminalActive = useGameStore((s) => s.setTerminalActive);
  const terminalsRepaired = useGameStore((s) => s.terminalsRepaired);

  // 我們可以在 App 層級監聽 E 鍵，當 terminalActive 為 true 時啟動小遊戲。
  // 此處僅處理顯示與距離更新。
  useFrame((state) => {
    const dist = state.camera.position.distanceTo(new THREE.Vector3(...position));
    const active = dist < 2.2;
    setTerminalActive(active);
    // 互動提示會在 HUD 顯示
  });

  const screenColor = terminalsRepaired > 0 ? '#33ff88' : '#ff4444';
  
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider args={[1.2, 1.2, 1.2]} position={[0, 0.9, 0]} />
      {/* 桌子 */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 0.1, 1.5]} />
        <meshStandardMaterial color="#4a3a2a" roughness={0.9} />
      </mesh>
      {/* 桌腳 */}
      <mesh position={[-0.9, 0.35, 0.6]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.9, 0.35, 0.6]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.9, 0.35, -0.6]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.9, 0.35, -0.6]} castShadow>
        <boxGeometry args={[0.1, 0.7, 0.1]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* CRT 螢幕 */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[1.2, 0.9, 1]} />
        <meshStandardMaterial color="#c0c0c0" roughness={0.3} />
      </mesh>
      {/* 螢幕玻璃 */}
      <mesh position={[0, 1.35, 0.51]} castShadow>
        <planeGeometry args={[0.9, 0.65]} />
        <meshBasicMaterial color={screenColor} />
      </mesh>
      {/* 螢幕邊框 */}
      <mesh position={[0, 1.3, 0.5]}>
        <boxGeometry args={[1.3, 1.0, 0.05]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* 鍵盤 */}
      <mesh position={[0, 0.8, -0.3]} rotation={[0.1, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.3]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* 簡單按鍵示意 */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[-0.3 + i * 0.06, 0.83, -0.32]}>
          <boxGeometry args={[0.04, 0.01, 0.04]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}

      {/* 主機 (桌下) */}
      <mesh position={[0, 0.2, -0.3]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.8]} />
        <meshStandardMaterial color="#d4d4d4" roughness={0.5} />
      </mesh>
      {/* 電源燈 */}
      <mesh position={[0.15, 0.2, -0.7]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color={terminalsRepaired > 0 ? '#0f0' : '#f00'} />
      </mesh>
    </RigidBody>
  );
}