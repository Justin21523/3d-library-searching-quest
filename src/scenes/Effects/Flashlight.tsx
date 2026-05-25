import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpotLight } from 'three';
import { useGameStore } from '../../store/useGameStore';

export default function Flashlight() {
  const lightRef = useRef<SpotLight>(null);
  const isOn = useGameStore((s) => s.isFlashlightOn);
  const consumeBattery = useGameStore((s) => s.consumeBattery);

  useFrame((state, delta) => {
    if (!lightRef.current) return;
    // 位置跟隨相機
    lightRef.current.position.copy(state.camera.position);
    lightRef.current.target.position.copy(
      state.camera.position.clone().add(
        state.camera.getWorldDirection(state.camera.position.clone()).multiplyScalar(10)
      )
    );
    lightRef.current.target.updateMatrixWorld();

    // 消耗電池
    if (isOn) {
      consumeBattery(delta * 5); // 每秒消耗 5%
    }
  });

  return (
    <spotLight
      ref={lightRef}
      angle={0.4}
      penumbra={0.3}
      intensity={isOn ? 30 : 0}
      distance={15}
      color="#ffe8cc"
      castShadow
      shadow-mapSize-width={512}
      shadow-mapSize-height={512}
    />
  );
}