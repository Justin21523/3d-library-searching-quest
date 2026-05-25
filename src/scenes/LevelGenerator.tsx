import { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import BookShelf from './BookShelf';
import Terminal3D from './Terminal3D';
import DataFragment from './DataFragment';
import DocumentPickup from './DocumentPickup';
import BatteryPickup from './BatteryPickup';
import MovingShelf from './MovingShelf';
import Stairs from './Stairs';
import Door from './Door';
import Portal from './Portal';
import { generateMap, type MapData, type StairwellBounds } from '../systems/MapGenerator';

const SHELF_WIDTH = 4.5;
const SHELF_HEIGHT = 3.2;
const SHELF_DEPTH = 1.0;
const SHELF_SPACING = 5.5;

function isInStairwell(x: number, z: number, stairwells: StairwellBounds[], margin = 1): boolean {
  return stairwells.some(
    (s) => x > s.x1 - margin && x < s.x2 + margin && z > s.z1 - margin && z < s.z2 + margin
  );
}

// Generate floor/ceiling as rectangular panels with holes cut out at stairwell positions
function buildFloorPanels(
  mapSize: number,
  holes: StairwellBounds[]
): { cx: number; cz: number; w: number; d: number }[] {
  const half = mapSize / 2;
  const xs = Array.from(new Set([-half, ...holes.flatMap((h) => [h.x1, h.x2]), half])).sort((a, b) => a - b);
  const zs = Array.from(new Set([-half, ...holes.flatMap((h) => [h.z1, h.z2]), half])).sort((a, b) => a - b);

  const panels: { cx: number; cz: number; w: number; d: number }[] = [];

  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < zs.length - 1; j++) {
      const x1 = xs[i], x2 = xs[i + 1];
      const z1 = zs[j], z2 = zs[j + 1];
      const w = x2 - x1, d = z2 - z1;
      if (w <= 0.01 || d <= 0.01) continue;
      const cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
      const inside = holes.some((h) => cx > h.x1 && cx < h.x2 && cz > h.z1 && cz < h.z2);
      if (!inside) panels.push({ cx, cz, w, d });
    }
  }

  return panels;
}

export default function LevelGenerator() {
  const mapData: MapData = useMemo(() => generateMap(42, 80, 6, 5), []);

  const shelves = useMemo(() => {
    const list: { position: [number, number, number]; rotationY: number; seed: number }[] = [];

    mapData.rooms.forEach((room) => {
      const cx = room.x + room.width / 2;
      const cz = room.z + room.depth / 2;
      const baseY = room.y + SHELF_HEIGHT / 2;

      // Fill room with rows of shelves, skip stairwell areas
      const horizontal = room.width >= room.depth;

      if (horizontal) {
        // Rows along Z axis, shelves at fixed X positions
        for (let sx = room.x + 2; sx < room.x + room.width - 2; sx += SHELF_SPACING) {
          for (let sz = room.z + 2; sz < room.z + room.depth - 2; sz += SHELF_SPACING) {
            if (isInStairwell(sx, sz, mapData.stairwells, 2)) continue;
            list.push({ position: [sx, baseY, sz], rotationY: 0, seed: Math.floor(sx * 100 + sz * 7) });
          }
        }
        // Additional wall-aligned shelves
        for (let sz = room.z + 2; sz < room.z + room.depth - 2; sz += SHELF_SPACING) {
          const px = cx;
          if (!isInStairwell(px, sz, mapData.stairwells, 2)) {
            list.push({ position: [px, baseY, sz], rotationY: 0, seed: Math.floor(sz * 200 + cx) });
          }
        }
      } else {
        for (let sz = room.z + 2; sz < room.z + room.depth - 2; sz += SHELF_SPACING) {
          for (let sx = room.x + 2; sx < room.x + room.width - 2; sx += SHELF_SPACING) {
            if (isInStairwell(sx, sz, mapData.stairwells, 2)) continue;
            list.push({ position: [sx, baseY, sz], rotationY: Math.PI / 2, seed: Math.floor(sx * 50 + sz * 130) });
          }
        }
        for (let sx = room.x + 2; sx < room.x + room.width - 2; sx += SHELF_SPACING) {
          const pz = cz;
          if (!isInStairwell(sx, pz, mapData.stairwells, 2)) {
            list.push({ position: [sx, baseY, pz], rotationY: Math.PI / 2, seed: Math.floor(sx * 300 + pz) });
          }
        }
      }
    });
    return list;
  }, [mapData]);

  const fragments = useMemo(() =>
    mapData.rooms.map((room, i) => ({
      id: i + 1,
      position: [
        room.x + room.width / 2,
        room.y + 1.2,
        room.z + room.depth / 2,
      ] as [number, number, number],
    })),
  [mapData]);

  const documents = useMemo(() =>
    mapData.rooms
      .filter((_, i) => i % 3 === 0)
      .map((room, i) => ({
        id: i + 1,
        position: [room.x + 2, room.y + 1.2, room.z + 2] as [number, number, number],
        title: `Archive Note ${i + 1}`,
        content: `Archive section ${i + 1}. The shelves rearrange themselves when no one is looking...`,
      })),
  [mapData]);

  const batteries = useMemo(() =>
    mapData.rooms
      .filter((_, i) => i % 4 === 2)
      .map((room) => [
        room.x + room.width / 2 + 1,
        room.y + 0.5,
        room.z + room.depth / 2 - 1,
      ] as [number, number, number]),
  [mapData]);

  const totalHeight = mapData.floorHeight * mapData.floorCount;
  const half = mapData.mapSize / 2;

  return (
    <>
      {/* 每層地板（含樓梯井開孔） */}
      {Array.from({ length: mapData.floorCount }).map((_, floorIdx) => {
        const y = floorIdx * mapData.floorHeight;
        // Ground floor has no holes; upper floors have stairwell holes
        const holes = floorIdx > 0 ? mapData.stairwells : [];
        const panels = buildFloorPanels(mapData.mapSize, holes);

        return (
          <group key={`floor-${floorIdx}`}>
            {panels.map((p, pi) => (
              <RigidBody key={pi} type="fixed" position={[p.cx, y, p.cz]} colliders={false}>
                <CuboidCollider args={[p.w / 2, 0.1, p.d / 2]} />
                <mesh receiveShadow>
                  <boxGeometry args={[p.w, 0.2, p.d]} />
                  <meshStandardMaterial color="#111" roughness={0.9} />
                </mesh>
              </RigidBody>
            ))}

            {/* 天花板（不含最頂層，含樓梯井開孔） */}
            {floorIdx < mapData.floorCount - 1 && (() => {
              const ceilingY = y + mapData.floorHeight;
              const ceilingPanels = buildFloorPanels(mapData.mapSize, mapData.stairwells);
              return ceilingPanels.map((p, pi) => (
                <mesh key={`ceil-${pi}`} position={[p.cx, ceilingY, p.cz]} receiveShadow>
                  <boxGeometry args={[p.w, 0.1, p.d]} />
                  <meshStandardMaterial color="#0d0d0d" roughness={0.9} />
                </mesh>
              ));
            })()}

            {/* 層樓照明 */}
            <pointLight position={[0, y + 2.5, 0]} intensity={0.4} color="#ffcc88" distance={30} />
            <pointLight position={[-half / 2, y + 2.5, -half / 2]} intensity={0.3} color="#ffcc88" distance={25} />
            <pointLight position={[half / 2, y + 2.5, half / 2]} intensity={0.3} color="#ffcc88" distance={25} />
            <pointLight position={[-half / 2, y + 2.5, half / 2]} intensity={0.25} color="#ccaaff" distance={25} />
            <pointLight position={[half / 2, y + 2.5, -half / 2]} intensity={0.25} color="#ccaaff" distance={25} />
          </group>
        );
      })}

      {/* 外牆（整棟高度） */}
      <Wall position={[0, totalHeight / 2, -half]} size={[mapData.mapSize, totalHeight, 0.5]} />
      <Wall position={[0, totalHeight / 2,  half]} size={[mapData.mapSize, totalHeight, 0.5]} />
      <Wall position={[-half, totalHeight / 2, 0]} size={[0.5, totalHeight, mapData.mapSize]} />
      <Wall position={[ half, totalHeight / 2, 0]} size={[0.5, totalHeight, mapData.mapSize]} />

      {/* 樓梯 */}
      {mapData.stairs.map((stair, i) => (
        <Stairs key={`stair-${i}`} start={stair.start} end={stair.end} direction={stair.direction} width={3.0} />
      ))}

      {/* 書架 */}
      {shelves.map((s, i) => (
        <BookShelf
          key={`shelf-${i}`}
          position={s.position}
          scale={[SHELF_WIDTH, SHELF_HEIGHT, SHELF_DEPTH]}
          rotationY={s.rotationY}
          seed={s.seed}
        />
      ))}

      {/* 終端機 */}
      {mapData.rooms
        .filter((_, idx) => idx % 2 === 0)
        .map((room, i) => (
          <Terminal3D
            key={`term-${i}`}
            position={[room.x + 2, room.y + 0.8, room.z + room.depth - 2]}
          />
        ))}

      {/* 碎片 */}
      {fragments.map((f) => (
        <DataFragment key={`frag-${f.id}`} id={f.id} position={f.position} />
      ))}

      {/* 文件 */}
      {documents.map((d) => (
        <DocumentPickup
          key={`doc-${d.id}`}
          id={d.id}
          position={d.position}
          title={d.title}
          content={d.content}
        />
      ))}

      {/* 電池 */}
      {batteries.map((pos, i) => (
        <BatteryPickup key={`bat-${i}`} position={pos} />
      ))}

      {/* 動態移動書架 */}
      <MovingShelf startPosition={[5, 1.4, 5]} endPosition={[5, 1.4, -2]} trigger={false} />

      {/* 出口大門 */}
      <Door position={[0, 1.4, -(half - 2)]} targetOpenPosition={[3, 1.4, -(half - 2)]} />

      {/* 傳送門 */}
      <Portal position={[half - 5, 1, half - 5]} />
    </>
  );
}

function Wall({ position, size }: {
  position: [number, number, number];
  size: [number, number, number];
}) {
  return (
    <RigidBody type="fixed" position={position} colliders={false}>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.7} />
      </mesh>
    </RigidBody>
  );
}
