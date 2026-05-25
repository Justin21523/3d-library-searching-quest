import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export type EnemyState = 'patrol' | 'chase' | 'search' | 'return';

export interface EnemyData {
  position: THREE.Vector3;
  state: EnemyState;
  patrolPoints: THREE.Vector3[];
  currentPatrolIndex: number;
  chaseSpeed: number;
  patrolSpeed: number;
  detectionRange: number;
  loseSightTime: number;
  lastSeenTime: number;
  searchTimer: number;
}

export function createEnemyAI(): EnemyData {
  return {
    position: new THREE.Vector3(0, 0.9, 0),
    state: 'patrol',
    patrolPoints: [
      new THREE.Vector3(-5, 0.9, -5),
      new THREE.Vector3(5, 0.9, -5),
      new THREE.Vector3(5, 0.9, 5),
      new THREE.Vector3(-5, 0.9, 5),
    ],
    currentPatrolIndex: 0,
    chaseSpeed: 3.5,
    patrolSpeed: 1.5,
    detectionRange: 8,
    loseSightTime: 2.0,
    lastSeenTime: 0,
    searchTimer: 0,
  };
}

export function updateEnemyAI(
  data: EnemyData,
  playerPosition: THREE.Vector3,
  world: RAPIER.World,
  deltaTime: number
): EnemyData {
  const toPlayer = new THREE.Vector3().copy(playerPosition).sub(data.position);
  const distanceToPlayer = toPlayer.length();
  const directionToPlayer = toPlayer.clone().normalize();

  let canSeePlayer = false;
  if (distanceToPlayer < data.detectionRange) {
    const rayOrigin = new RAPIER.Vector3(data.position.x, data.position.y, data.position.z);
    const rayDir = new RAPIER.Vector3(directionToPlayer.x, directionToPlayer.y, directionToPlayer.z);
    const hit = world.castRay(new RAPIER.Ray(rayOrigin, rayDir), distanceToPlayer, true);
    if (hit) {
      canSeePlayer = hit.timeOfImpact >= distanceToPlayer - 0.5;
    } else {
      canSeePlayer = true;
    }
  }

  switch (data.state) {
    case 'patrol': {
      if (canSeePlayer) {
        data.state = 'chase';
        data.lastSeenTime = 0;
      } else {
        const target = data.patrolPoints[data.currentPatrolIndex];
        const dir = new THREE.Vector3().copy(target).sub(data.position);
        if (dir.length() < 0.5) {
          data.currentPatrolIndex = (data.currentPatrolIndex + 1) % data.patrolPoints.length;
        } else {
          dir.normalize().multiplyScalar(data.patrolSpeed * deltaTime);
          data.position.add(dir);
        }
      }
      break;
    }
    case 'chase': {
      if (canSeePlayer) {
        data.lastSeenTime = 0;
        const chaseDir = directionToPlayer.clone().multiplyScalar(data.chaseSpeed * deltaTime);
        data.position.add(chaseDir);
      } else {
        data.lastSeenTime += deltaTime;
        if (data.lastSeenTime > data.loseSightTime) {
          data.state = 'search';
          data.searchTimer = 3.0;
        }
      }
      break;
    }
    case 'search': {
      data.searchTimer -= deltaTime;
      if (data.searchTimer <= 0) {
        data.state = 'return';
      }
      break;
    }
    case 'return': {
      const returnTarget = data.patrolPoints[data.currentPatrolIndex];
      const returnDir = new THREE.Vector3().copy(returnTarget).sub(data.position);
      if (returnDir.length() < 0.5) {
        data.state = 'patrol';
      } else {
        returnDir.normalize().multiplyScalar(data.patrolSpeed * deltaTime);
        data.position.add(returnDir);
      }
      break;
    }
  }

  return data;
}
