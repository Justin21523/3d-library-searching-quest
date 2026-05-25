import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { useKeyboard } from '../hooks/useKeyboard';
import { useRapier } from '@react-three/rapier';
import { CharacterController } from '../systems/characterController';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export default function Player() {
  const { camera } = useThree();
  const { world } = useRapier();
  const controlsRef = useRef<any>(null);
  const keys = useKeyboard();
  const controllerRef = useRef<CharacterController | null>(null);

  const walkSpeed = 4;
  const runMultiplier = 1.8;

  useEffect(() => {
    if (!world) return;
    // Spawn 0.5m above floor surface (floor top is at y=0.1) so KCC doesn't start inside collider
    const controller = new CharacterController(world, new THREE.Vector3(0, 0.5, 0));
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [world]);

  useEffect(() => {
    const onClick = () => controlsRef.current?.lock();
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);
  
  const gameOver = useGameStore((s) => s.gameOver);
  // 當 gameOver 變為 true 並重置後，需要移動控制器
  useEffect(() => {
    if (!gameOver) {
      // 遊戲恢復（重置後 gameOver 變 false），重置角色位置
      if (controllerRef.current) {
        // body center = spawn.y + capsuleHeight/2 + capsuleRadius = 0.5 + 0.9 + 0.4 = 1.8
        controllerRef.current.body.setTranslation({ x: 0, y: 1.8, z: 0 }, true);
        controllerRef.current.velocityY = 0;
      }
    }
  }, [gameOver]);
  
  useFrame((_, delta) => {
    if (!controllerRef.current || !controlsRef.current?.isLocked) return;

    const controller = controllerRef.current;

    // Kill-plane: if player fell below the world, snap back to spawn
    const pos = controller.getPosition();
    if (pos.y < -10) {
      controller.body.setTranslation({ x: 0, y: 1.8, z: 0 }, true);
      controller.velocityY = 0;
      return;
    }

    const forward = (keys['KeyW'] ? 1 : 0) - (keys['KeyS'] ? 1 : 0);
    const right = (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0);
    const isRunning = keys['ShiftLeft'] || keys['ShiftRight'];
    const jump = keys['Space'];
    const crouch = keys['ControlLeft'] || keys['ControlRight'];

    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    cameraDir.y = 0;
    cameraDir.normalize();
    
    // 計算相機右向量（直接取自變換矩陣）
    const cameraRight = new THREE.Vector3();
    cameraRight.setFromMatrixColumn(camera.matrix, 0); // 第0列是右向量
    cameraRight.y = 0;
    cameraRight.normalize();
    
    const moveDir = new THREE.Vector3()
      .addScaledVector(cameraDir, forward)
      .addScaledVector(cameraRight, right);

    if (moveDir.length() > 1) moveDir.normalize();

    const speed = walkSpeed * (isRunning ? runMultiplier : 1);
    const desiredVelocity = moveDir.multiplyScalar(speed);
    desiredVelocity.y = 0;

    controller.move(desiredVelocity, !!jump, delta);
    controller.crouch(!!crouch);

    const updatedPos = controller.getPosition();
    camera.position.copy(updatedPos);
    const eyeOffset = controller.isCrouching ? 0.7 : 1.5;
    camera.position.y += eyeOffset;
  });

  return <PointerLockControls ref={controlsRef} />;
}
