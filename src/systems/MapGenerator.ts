export interface Room {
  x: number;
  z: number;
  width: number;
  depth: number;
  y: number;
  height: number;
}

export interface Corridor {
  x: number;
  z: number;
  width: number;
  depth: number;
  y: number;
}

export interface StairData {
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  direction: 'x' | 'z';
}

export interface StairwellBounds {
  x1: number; x2: number; z1: number; z2: number;
}

export interface MapData {
  rooms: Room[];
  corridors: Corridor[];
  stairs: StairData[];
  stairwells: StairwellBounds[];
  mapSize: number;
  floorCount: number;
  floorHeight: number;
}

function mulberry32(a: number) {
  return function () {
    a |= 0; a = a + 0x6D2B0795 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// 每段樓梯 20 階，每階高 0.25m，每階深 0.7m → 跨度 14m
const STEP_COUNT = 20;
const STEP_DEPTH = 0.7;
const STAIR_SPAN = STEP_COUNT * STEP_DEPTH; // 14m
const STAIR_WIDTH = 3.0;                    // 走廊寬度
const STAIR_MARGIN = 1.0;                   // 開口邊距

export function generateMap(
  seed: number,
  mapSize: number = 80,
  floorCount: number = 6,
  floorHeight: number = 5
): MapData {
  const rng = mulberry32(seed);
  const rooms: Room[] = [];
  const corridors: Corridor[] = [];
  const stairs: StairData[] = [];
  const half = mapSize / 2;

  // 兩組樓梯固定在南牆附近，左右對稱
  // 樓梯 1：西側，沿 +X 方向上升
  const s1x = -half + 3;
  const s1z = -half + 9;   // 距南牆 9m
  // 樓梯 2：東側，沿 -X 方向（從右向左），起點在東側
  const s2x = half - 3 - STAIR_SPAN;
  const s2z = -half + 9;

  // 樓梯井邊界（含邊距），用於地板開孔
  const stairwells: StairwellBounds[] = [
    {
      x1: s1x - STAIR_MARGIN,
      x2: s1x + STAIR_SPAN + STAIR_MARGIN,
      z1: s1z - STAIR_WIDTH / 2 - STAIR_MARGIN,
      z2: s1z + STAIR_WIDTH / 2 + STAIR_MARGIN,
    },
    {
      x1: s2x - STAIR_MARGIN,
      x2: s2x + STAIR_SPAN + STAIR_MARGIN,
      z1: s2z - STAIR_WIDTH / 2 - STAIR_MARGIN,
      z2: s2z + STAIR_WIDTH / 2 + STAIR_MARGIN,
    },
  ];

  for (let floor = 0; floor < floorCount; floor++) {
    const baseY = floor * floorHeight;
    const { rooms: floorRooms, corridors: floorCorridors } = generateFloor(
      rng, mapSize, baseY, floorHeight
    );
    rooms.push(...floorRooms);
    corridors.push(...floorCorridors);

    if (floor < floorCount - 1) {
      stairs.push(
        {
          start: { x: s1x, y: baseY, z: s1z },
          end:   { x: s1x + STAIR_SPAN, y: baseY + floorHeight, z: s1z },
          direction: 'x',
        },
        {
          start: { x: s2x, y: baseY, z: s2z },
          end:   { x: s2x + STAIR_SPAN, y: baseY + floorHeight, z: s2z },
          direction: 'x',
        }
      );
    }
  }

  return { rooms, corridors, stairs, stairwells, mapSize, floorCount, floorHeight };
}

function generateFloor(
  rng: () => number,
  mapSize: number,
  baseY: number,
  height: number
) {
  const rooms: Room[] = [];
  const corridors: Corridor[] = [];
  const half = mapSize / 2;
  const minRoomSize = 14;
  const maxRoomSize = 26;

  function split(x: number, z: number, w: number, d: number, depth: number) {
    if (depth <= 0 || w < minRoomSize * 2 || d < minRoomSize * 2) {
      const roomW = Math.min(Math.floor(rng() * (maxRoomSize - minRoomSize)) + minRoomSize, w - 2);
      const roomD = Math.min(Math.floor(rng() * (maxRoomSize - minRoomSize)) + minRoomSize, d - 2);
      const maxOffsetX = Math.max(1, w - roomW - 2);
      const maxOffsetZ = Math.max(1, d - roomD - 2);
      const roomX = x + Math.floor(rng() * maxOffsetX) + 1;
      const roomZ = z + Math.floor(rng() * maxOffsetZ) + 1;
      rooms.push({ x: roomX, z: roomZ, width: Math.max(roomW, minRoomSize), depth: Math.max(roomD, minRoomSize), y: baseY, height });
      return;
    }

    const forceHorizontal = w > d * 1.3;
    const forceVertical   = d > w * 1.3;
    const horizontal = forceHorizontal ? true : forceVertical ? false : rng() > 0.5;

    if (horizontal && w >= minRoomSize * 2) {
      const splitPos = Math.floor(w * (0.4 + rng() * 0.2));
      split(x,             z, splitPos,     d, depth - 1);
      split(x + splitPos,  z, w - splitPos, d, depth - 1);
      corridors.push({ x: x + splitPos - 1, z: z + d / 2 - 1, width: 2, depth: 2, y: baseY });
    } else if (d >= minRoomSize * 2) {
      const splitPos = Math.floor(d * (0.4 + rng() * 0.2));
      split(x, z,             w, splitPos,     depth - 1);
      split(x, z + splitPos,  w, d - splitPos, depth - 1);
      corridors.push({ x: x + w / 2 - 1, z: z + splitPos - 1, width: 2, depth: 2, y: baseY });
    } else {
      rooms.push({ x: x + 1, z: z + 1, width: Math.min(w - 2, maxRoomSize), depth: Math.min(d - 2, maxRoomSize), y: baseY, height });
    }
  }

  split(-half, -half, mapSize, mapSize, 5);
  return { rooms, corridors };
}
