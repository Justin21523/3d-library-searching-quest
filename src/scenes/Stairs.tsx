import { RigidBody, CuboidCollider } from '@react-three/rapier';

interface StairsProps {
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  direction: 'x' | 'z';
  width?: number; // walkable width perpendicular to travel direction
}

export default function Stairs({ start, end, direction, width = 3.0 }: StairsProps) {
  const stepCount = 20;
  const totalRise = end.y - start.y;
  const stepHeight = totalRise / stepCount; // e.g. 5 / 20 = 0.25m per step

  const travelSpan = direction === 'x'
    ? end.x - start.x
    : end.z - start.z;
  const stepDepth = travelSpan / stepCount; // horizontal depth of each step

  const steps = [];
  for (let i = 0; i < stepCount; i++) {
    const cx = direction === 'x'
      ? start.x + stepDepth * (i + 0.5)
      : start.x;
    const cz = direction === 'z'
      ? start.z + stepDepth * (i + 0.5)
      : start.z;
    const cy = start.y + stepHeight * (i + 0.5);

    // For direction='x': stepW along X (narrow), stepD along Z (wide)
    const stepW = direction === 'x' ? Math.abs(stepDepth) : width;
    const stepD = direction === 'z' ? Math.abs(stepDepth) : width;

    steps.push(
      <RigidBody key={i} type="fixed" position={[cx, cy, cz]} colliders={false}>
        <CuboidCollider args={[stepW / 2, stepHeight / 2, stepD / 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[stepW, stepHeight, stepD]} />
          <meshStandardMaterial color="#c8941a" roughness={0.6} metalness={0.1} />
        </mesh>
      </RigidBody>
    );
  }

  // Landing platform at the bottom (flush with start.y floor)
  const landingThickness = 0.2;
  const landingLength = 2.5;
  const landingW = direction === 'x' ? landingLength : width;
  const landingD = direction === 'z' ? landingLength : width;
  const landingXOffset = direction === 'x' ? -(landingLength / 2) : 0;
  const landingZOffset = direction === 'z' ? -(landingLength / 2) : 0;

  // Landing platform at the top
  const topLandingXOffset = direction === 'x' ? Math.abs(travelSpan) + landingLength / 2 : 0;
  const topLandingZOffset = direction === 'z' ? Math.abs(travelSpan) + landingLength / 2 : 0;

  // Railings (visual only, thin boxes on each side of staircase)
  const railingHeight = 1.0;
  const railingThickness = 0.1;
  const railingLength = Math.abs(travelSpan);
  const railingCX = direction === 'x' ? start.x + travelSpan / 2 : start.x;
  const railingCZ = direction === 'z' ? start.z + travelSpan / 2 : start.z;
  const railingCY = start.y + totalRise / 2 + railingHeight / 2;
  const railingOffsetPerp = (width / 2) - railingThickness / 2;

  const railingRW = direction === 'x' ? railingLength : railingThickness;
  const railingRD = direction === 'z' ? railingLength : railingThickness;

  // Arrow marker pointing toward staircase (bright beacon)
  const markerY = start.y + 0.3;

  return (
    <>
      {steps}

      {/* Bottom landing */}
      <RigidBody type="fixed"
        position={[start.x + landingXOffset, start.y + landingThickness / 2, start.z + landingZOffset]}
        colliders={false}
      >
        <CuboidCollider args={[landingW / 2, landingThickness / 2, landingD / 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[landingW, landingThickness, landingD]} />
          <meshStandardMaterial color="#a07010" roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Top landing */}
      <RigidBody type="fixed"
        position={[start.x + topLandingXOffset, end.y + landingThickness / 2, start.z + topLandingZOffset]}
        colliders={false}
      >
        <CuboidCollider args={[landingW / 2, landingThickness / 2, landingD / 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[landingW, landingThickness, landingD]} />
          <meshStandardMaterial color="#a07010" roughness={0.7} />
        </mesh>
      </RigidBody>

      {/* Left railing */}
      <mesh position={[
        railingCX + (direction === 'z' ? -railingOffsetPerp : 0),
        railingCY,
        railingCZ + (direction === 'x' ? -railingOffsetPerp : 0),
      ]} castShadow>
        <boxGeometry args={[railingRW, railingHeight, railingRD]} />
        <meshStandardMaterial color="#4a3000" roughness={0.9} />
      </mesh>

      {/* Right railing */}
      <mesh position={[
        railingCX + (direction === 'z' ? railingOffsetPerp : 0),
        railingCY,
        railingCZ + (direction === 'x' ? railingOffsetPerp : 0),
      ]} castShadow>
        <boxGeometry args={[railingRW, railingHeight, railingRD]} />
        <meshStandardMaterial color="#4a3000" roughness={0.9} />
      </mesh>

      {/* Stairwell indicator light at bottom entrance */}
      <pointLight
        position={[start.x + (direction === 'x' ? -1 : 0), start.y + 1.5, start.z + (direction === 'z' ? -1 : 0)]}
        intensity={3}
        distance={6}
        color="#ffaa00"
      />
      {/* Stairwell indicator light at top exit */}
      <pointLight
        position={[end.x + (direction === 'x' ? 1 : 0), end.y + 1.5, end.z + (direction === 'z' ? 1 : 0)]}
        intensity={3}
        distance={6}
        color="#ffaa00"
      />

      {/* Floor marker — glowing strip at base of stairs */}
      <mesh position={[start.x + (direction === 'x' ? -0.5 : 0), markerY, start.z + (direction === 'z' ? -0.5 : 0)]}>
        <boxGeometry args={[direction === 'x' ? 0.5 : width, 0.05, direction === 'z' ? 0.5 : width]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ffaa00" emissiveIntensity={1.5} />
      </mesh>
    </>
  );
}
