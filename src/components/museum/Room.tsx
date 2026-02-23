"use client"

// lightweight — no MeshReflectorMaterial (renders scene 2x)

const ROOM_WIDTH = 12
const ROOM_HEIGHT = 5
const ROOM_DEPTH = 12

const TRACK_OFFSET = 1.2

const TRACK_LIGHTS: Array<{
  position: [number, number, number]
  rotation: [number, number, number]
}> = [
  { position: [0, ROOM_HEIGHT - 0.02, -ROOM_DEPTH / 2 + TRACK_OFFSET], rotation: [0, 0, 0] },
  { position: [0, ROOM_HEIGHT - 0.02, ROOM_DEPTH / 2 - TRACK_OFFSET], rotation: [0, Math.PI, 0] },
  { position: [ROOM_WIDTH / 2 - TRACK_OFFSET, ROOM_HEIGHT - 0.02, 0], rotation: [0, -Math.PI / 2, 0] },
  { position: [-ROOM_WIDTH / 2 + TRACK_OFFSET, ROOM_HEIGHT - 0.02, 0], rotation: [0, Math.PI / 2, 0] },
]

export function Room() {
  return (
    <group>
      {/* Floor — faux-glossy wood (no reflection pass) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#7a6545" roughness={0.55} metalness={0.12} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#f0efe8" roughness={0.95} />
      </mesh>

      {/* Walls */}
      <Wall position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]} rotation={[0, 0, 0]} args={[ROOM_WIDTH, ROOM_HEIGHT]} />
      <Wall position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} rotation={[0, Math.PI, 0]} args={[ROOM_WIDTH, ROOM_HEIGHT]} />
      <Wall position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]} args={[ROOM_DEPTH, ROOM_HEIGHT]} />
      <Wall position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]} args={[ROOM_DEPTH, ROOM_HEIGHT]} />

      <WallTrim />

      {TRACK_LIGHTS.map((light, i) => (
        <TrackLight key={i} position={light.position} rotation={light.rotation} />
      ))}
    </group>
  )
}

function Wall({
  position,
  rotation,
  args,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  args: [number, number]
}) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={args} />
      <meshStandardMaterial
        color="#f5f5f0"
        roughness={0.75}
        metalness={0.0}
        envMapIntensity={0.3}
      />
    </mesh>
  )
}

function TrackLight({
  position,
  rotation,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  const tiltAngle = -0.55

  return (
    <group position={position} rotation={rotation}>
      {/* Ceiling mounting plate */}
      <mesh position={[0, -0.005, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.01, 16]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Stem — straight rod from ceiling */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
        <meshStandardMaterial color="#0d0d0d" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Yoke / U-bracket — the fork that holds the barrel */}
      <group position={[0, -0.16, 0]}>
        {/* Pivot bolt */}
        <mesh>
          <sphereGeometry args={[0.022, 12, 12]} />
          <meshStandardMaterial color="#181818" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Left arm of yoke */}
        <mesh position={[-0.05, -0.01, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.008, 0.06, 0.015]} />
          <meshStandardMaterial color="#111" roughness={0.25} metalness={0.85} />
        </mesh>
        {/* Right arm of yoke */}
        <mesh position={[0.05, -0.01, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.008, 0.06, 0.015]} />
          <meshStandardMaterial color="#111" roughness={0.25} metalness={0.85} />
        </mesh>
      </group>

      {/* Barrel assembly — tilted toward wall */}
      <group position={[0, -0.2, 0]} rotation={[tiltAngle, 0, 0]}>
        {/* Main barrel body */}
        <mesh position={[0, -0.07, 0]}>
          <cylinderGeometry args={[0.045, 0.06, 0.18, 20]} />
          <meshStandardMaterial color="#0d0d0d" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Heat fins — rings around barrel */}
        {[-0.02, 0.01, 0.04].map((yOff, i) => (
          <mesh key={i} position={[0, -0.07 + yOff, 0]}>
            <cylinderGeometry args={[0.063, 0.063, 0.006, 20]} />
            <meshStandardMaterial color="#151515" roughness={0.3} metalness={0.85} />
          </mesh>
        ))}

        {/* Lens ring / bezel at opening */}
        <mesh position={[0, -0.16, 0]}>
          <cylinderGeometry args={[0.058, 0.065, 0.02, 20]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Lens recess — dark inner ring */}
        <mesh position={[0, -0.172, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.035, 0.058, 20]} />
          <meshStandardMaterial color="#050505" roughness={0.1} metalness={0.95} />
        </mesh>

        {/* Glowing lens — emissive for bloom */}
        <mesh position={[0, -0.171, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.035, 20]} />
          <meshStandardMaterial
            color="#fff8e8"
            emissive="#ffcc66"
            emissiveIntensity={8}
            toneMapped={false}
          />
        </mesh>

        {/* Barn door flaps (4 small plates around the opening) */}
        {/* Top flap */}
        <mesh position={[0, -0.165, -0.062]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.1, 0.04, 0.002]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Bottom flap */}
        <mesh position={[0, -0.165, 0.062]} rotation={[0.3, 0, 0]}>
          <boxGeometry args={[0.1, 0.04, 0.002]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Left flap */}
        <mesh position={[-0.062, -0.165, 0]} rotation={[0, 0, -0.3]}>
          <boxGeometry args={[0.002, 0.04, 0.1]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.9} />
        </mesh>
        {/* Right flap */}
        <mesh position={[0.062, -0.165, 0]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.002, 0.04, 0.1]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

function WallTrim() {
  const trimHeight = 0.12
  const trimDepth = 0.04
  const trimColor = "#dddad2"

  return (
    <group>
      <mesh position={[0, trimHeight / 2, -ROOM_DEPTH / 2 + trimDepth / 2]}>
        <boxGeometry args={[ROOM_WIDTH, trimHeight, trimDepth]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, trimHeight / 2, ROOM_DEPTH / 2 - trimDepth / 2]}>
        <boxGeometry args={[ROOM_WIDTH, trimHeight, trimDepth]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>
      <mesh position={[ROOM_WIDTH / 2 - trimDepth / 2, trimHeight / 2, 0]}>
        <boxGeometry args={[trimDepth, trimHeight, ROOM_DEPTH]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>
      <mesh position={[-ROOM_WIDTH / 2 + trimDepth / 2, trimHeight / 2, 0]}>
        <boxGeometry args={[trimDepth, trimHeight, ROOM_DEPTH]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>
    </group>
  )
}

export { ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH }
