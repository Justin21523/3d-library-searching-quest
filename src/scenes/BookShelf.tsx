import { useMemo } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import BookItem from './BookItem';

interface BookShelfProps {
  position: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  rotationY?: number;
  seed?: number;
}

function mulberry32(a: number) {
  return function () {
    a |= 0; a = a + 0x6D2B0795 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export default function BookShelf({ position, scale = [4.5, 3.0, 1.0], color = '#5c3a21', rotationY = 0, seed = 0 }: BookShelfProps) {
  const shelfThickness = 0.08;
  const sideWidth = 0.1;
  const shelfCount = 4;
  const innerHeight = scale[1] - shelfThickness * 2;
  const shelfSpacing = innerHeight / (shelfCount + 1);

  const books = useMemo(() => {
    const list: { pos: [number, number, number]; col: string }[] = [];
    const rng = mulberry32(seed);
    const innerWidth = scale[0] - sideWidth * 2;
    const innerHeightLocal = scale[1] - shelfThickness * 2;
    const spacing = innerHeightLocal / (shelfCount + 1);
    const colors = ['#8b0000', '#2e4a2e', '#3b3b6b', '#7a5c3a', '#b8860b'];
    for (let row = 0; row < shelfCount; row++) {
      const y = -scale[1] / 2 + shelfThickness + (row + 0.5) * spacing;
      const bookCount = Math.floor(rng() * 8) + 4;
      for (let b = 0; b < bookCount; b++) {
        const x = -innerWidth / 2 + (b / (bookCount - 1)) * innerWidth;
        const zOffset = (rng() - 0.5) * (scale[2] * 0.4);
        list.push({
          pos: [x, y, zOffset],
          col: colors[Math.floor(rng() * colors.length)],
        });
      }
    }
    return list;
  }, [scale, seed]);

  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotationY, 0]} colliders={false}>
      <CuboidCollider args={[scale[0] / 2, scale[1] / 2, scale[2] / 2]} />
      <group>
        {/* 底板 */}
        <mesh position={[0, -scale[1] / 2 + shelfThickness / 2, 0]}>
          <boxGeometry args={[scale[0], shelfThickness, scale[2]]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        {/* 頂板 */}
        <mesh position={[0, scale[1] / 2 - shelfThickness / 2, 0]}>
          <boxGeometry args={[scale[0], shelfThickness, scale[2]]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        {/* 左側板 */}
        <mesh position={[-scale[0] / 2 + sideWidth / 2, 0, 0]}>
          <boxGeometry args={[sideWidth, scale[1] - shelfThickness * 2, scale[2]]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        {/* 右側板 */}
        <mesh position={[scale[0] / 2 - sideWidth / 2, 0, 0]}>
          <boxGeometry args={[sideWidth, scale[1] - shelfThickness * 2, scale[2]]} />
          <meshStandardMaterial color={color} roughness={0.8} />
        </mesh>
        {/* 隔板 */}
        {Array.from({ length: shelfCount }).map((_, i) => {
          const y = -scale[1] / 2 + shelfThickness + (i + 1) * shelfSpacing;
          return (
            <mesh key={i} position={[0, y, 0]}>
              <boxGeometry args={[scale[0] - sideWidth * 2, shelfThickness * 0.6, scale[2]]} />
              <meshStandardMaterial color={color} roughness={0.7} />
            </mesh>
          );
        })}
        {/* 書本 */}
        {books.map((b, i) => (
          <BookItem key={i} position={b.pos} color={b.col} />
        ))}
      </group>
    </RigidBody>
  );
}
