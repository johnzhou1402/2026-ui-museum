"use client"

import { useRef, useEffect, useMemo, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing"
import * as THREE from "three"
import { Room, ROOM_DEPTH, ROOM_WIDTH, ROOM_HEIGHT } from "./Room"
import { ArtFrame, FRAME_WIDTH, FRAME_HEIGHT } from "./ArtFrame"
import { DustParticles } from "./DustParticles"
import { collection, type ArtPiece } from "@/data/collection"

type SceneContentProps = {
  wallIndex: number
  onPieceClick: (piece: ArtPiece) => void
  modalOpen: boolean
}

// ── RectAreaLight ──────────────────────────────────────────────────────

function PaintingLight({
  position,
  lookAt: lookAtPos,
  width,
  height,
  intensity,
  color,
}: {
  position: [number, number, number]
  lookAt: [number, number, number]
  width: number
  height: number
  intensity: number
  color: string
}) {
  const lightRef = useRef<THREE.RectAreaLight>(null)

  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.lookAt(...lookAtPos)
    }
  }, [lookAtPos])

  return (
    <rectAreaLight
      ref={lightRef}
      position={position}
      width={width}
      height={height}
      intensity={intensity}
      color={color}
    />
  )
}

// ── Light cone — gradient-faded cone mesh, no view-dependent shader ────

const coneVertexShader = /* glsl */ `
  varying float vFade;
  void main() {
    // uv.y = 0 at bottom (painting), 1 at top (fixture)
    vFade = uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const coneFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;
  void main() {
    // Bright near fixture (top), fades to transparent at painting (bottom)
    float alpha = uOpacity * vFade * vFade;
    // Soft fade at both ends so edges never hard-cut
    alpha *= smoothstep(1.0, 0.85, vFade); // top fade
    alpha *= smoothstep(0.0, 0.15, vFade);  // bottom fade
    gl_FragColor = vec4(uColor, alpha);
  }
`

function LightCone({
  from,
  target,
}: {
  from: [number, number, number]
  target: [number, number, number]
}) {
  const { position, quaternion, height } = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...target)
    const dir = new THREE.Vector3().subVectors(end, start)
    const h = dir.length()
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

    const orientation = new THREE.Quaternion()
    orientation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize())

    return { position: mid, quaternion: orientation, height: h }
  }, [from, target])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: coneVertexShader,
        fragmentShader: coneFragmentShader,
        uniforms: {
          uColor: { value: new THREE.Color("#fff5e0") },
          uOpacity: { value: 0.1 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    []
  )

  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <cylinderGeometry args={[0.06, 1.4, height, 32, 1, true]} />
    </mesh>
  )
}

// ── Camera controller — critically damped spring ───────────────────────

const MAX_DRAG_OFFSET = 0.35
const RESISTANCE_EXP = 3
const MAX_VERTICAL_OFFSET = 0.15

const EYE_HEIGHT = ROOM_HEIGHT / 2 + 0.2

// Overdamped spring — no overshoot, no flicker
const SPRING_STIFFNESS = 80
const SPRING_DAMPING = 24 // > 2*sqrt(stiffness) = overdamped

function CameraController({ wallIndex }: { wallIndex: number }) {
  const { camera, gl } = useThree()

  const wallAngles = useMemo(() => [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2], [])

  const baseAngle = useRef(0)
  const targetBaseAngle = useRef(0)

  // Spring state: position + velocity for each axis
  const dragX = useRef(0)
  const dragY = useRef(0)
  const velX = useRef(0)
  const velY = useRef(0)

  // Raw drag accumulator (before spring)
  const rawDragX = useRef(0)
  const rawDragY = useRef(0)

  const isDragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  // Wall transition
  useEffect(() => {
    const newTarget = wallAngles[wallIndex]
    const current = baseAngle.current
    const normalizedCurrent = ((current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)

    let diff = newTarget - normalizedCurrent
    if (diff > Math.PI) diff -= 2 * Math.PI
    if (diff < -Math.PI) diff += 2 * Math.PI

    targetBaseAngle.current = current + diff
    // Reset drag offsets on wall change for clean transition
    rawDragX.current = 0
    rawDragY.current = 0
  }, [wallIndex, wallAngles])

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      isDragging.current = true
      lastPointer.current = { x: e.clientX, y: e.clientY }
      gl.domElement.style.cursor = "grabbing"
    },
    [gl]
  )

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging.current) return

    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    lastPointer.current = { x: e.clientX, y: e.clientY }

    const rawDeltaX = -dx * 0.003
    const rawDeltaY = -dy * 0.002

    // Exponential resistance
    const currentOffsetRatio = Math.abs(rawDragX.current) / MAX_DRAG_OFFSET
    const resistanceX = Math.pow(1 - Math.min(currentOffsetRatio, 0.99), RESISTANCE_EXP)
    rawDragX.current += rawDeltaX * resistanceX

    const currentVerticalRatio = Math.abs(rawDragY.current) / MAX_VERTICAL_OFFSET
    const resistanceY = Math.pow(1 - Math.min(currentVerticalRatio, 0.99), RESISTANCE_EXP)
    rawDragY.current += rawDeltaY * resistanceY

    // Hard clamp
    rawDragX.current = Math.max(-MAX_DRAG_OFFSET, Math.min(MAX_DRAG_OFFSET, rawDragX.current))
    rawDragY.current = Math.max(-MAX_VERTICAL_OFFSET, Math.min(MAX_VERTICAL_OFFSET, rawDragY.current))
  }, [])

  const onPointerUp = useCallback(() => {
    isDragging.current = false
    gl.domElement.style.cursor = "grab"
    // Spring target becomes 0 (release snaps back)
    rawDragX.current = 0
    rawDragY.current = 0
  }, [gl])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.style.cursor = "grab"
    canvas.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
  }, [gl, onPointerDown, onPointerMove, onPointerUp])

  useFrame((_, delta) => {
    // Clamp delta to avoid instability on tab-switch
    const dt = Math.min(delta, 0.05)

    // Smooth base angle toward target wall (frame-rate independent)
    const baseDiff = targetBaseAngle.current - baseAngle.current
    if (Math.abs(baseDiff) > 0.0001) {
      const t = 1 - Math.pow(0.001, dt) // smooth ~6x/sec at 60fps
      baseAngle.current += baseDiff * t
    } else {
      baseAngle.current = targetBaseAngle.current
    }

    // Critically damped spring for drag offsets
    // target = rawDragX when dragging, 0 when released
    const targetX = isDragging.current ? rawDragX.current : 0
    const targetY = isDragging.current ? rawDragY.current : 0

    // Spring force: F = -k(x - target) - c * v
    const forceX = -SPRING_STIFFNESS * (dragX.current - targetX) - SPRING_DAMPING * velX.current
    const forceY = -SPRING_STIFFNESS * (dragY.current - targetY) - SPRING_DAMPING * velY.current

    velX.current += forceX * dt
    velY.current += forceY * dt
    dragX.current += velX.current * dt
    dragY.current += velY.current * dt

    // Snap to rest when close + slow
    if (!isDragging.current && Math.abs(dragX.current) < 0.0001 && Math.abs(velX.current) < 0.001) {
      dragX.current = 0
      velX.current = 0
    }
    if (!isDragging.current && Math.abs(dragY.current) < 0.0001 && Math.abs(velY.current) < 0.001) {
      dragY.current = 0
      velY.current = 0
    }

    const totalAzimuth = baseAngle.current + dragX.current
    const verticalOffset = dragY.current

    camera.position.set(0, EYE_HEIGHT, 0)

    const radius = 5
    const lookX = Math.sin(totalAzimuth) * radius * Math.cos(verticalOffset)
    const lookY = EYE_HEIGHT + Math.sin(verticalOffset) * radius
    const lookZ = -Math.cos(totalAzimuth) * radius * Math.cos(verticalOffset)

    camera.lookAt(lookX, lookY, lookZ)
  })

  return null
}

// ── Postprocessing ─────────────────────────────────────────────────────

function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.35}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.5}
        mipmapBlur
      />
      <Vignette eskil={false} offset={0.25} darkness={0.5} />
    </EffectComposer>
  )
}

// ── Constants ──────────────────────────────────────────────────────────

const PAINTING_Y = ROOM_HEIGHT / 2 + 0.2
const LIGHT_OFFSET = 0.8
const TRACK_OFFSET = 1.2
const FIXTURE_Y = ROOM_HEIGHT - 0.02 - 0.36

// ── Scene content ──────────────────────────────────────────────────────

function SceneContent({ wallIndex, onPieceClick, modalOpen }: SceneContentProps) {
  const lightW = FRAME_WIDTH + 0.5
  const lightH = FRAME_HEIGHT + 0.5
  const lightIntensity = 8
  const lightColor = "#fff5e0"

  return (
    <>
      <CameraController wallIndex={wallIndex} />

      {/* Ambient — very low for dramatic lighting contrast */}
      <ambientLight intensity={0.15} />

      {/* Subtle warm overhead fill */}
      <pointLight position={[0, 4.5, 0]} intensity={3} distance={14} color="#fff5e6" />

      {/* RectAreaLights — rectangular projection on walls */}
      <PaintingLight
        position={[0, PAINTING_Y + 0.8, -ROOM_DEPTH / 2 + LIGHT_OFFSET]}
        lookAt={[0, PAINTING_Y, -ROOM_DEPTH / 2]}
        width={lightW}
        height={lightH}
        intensity={lightIntensity}
        color={lightColor}
      />
      <PaintingLight
        position={[0, PAINTING_Y + 0.8, ROOM_DEPTH / 2 - LIGHT_OFFSET]}
        lookAt={[0, PAINTING_Y, ROOM_DEPTH / 2]}
        width={lightW}
        height={lightH}
        intensity={lightIntensity}
        color={lightColor}
      />
      <PaintingLight
        position={[ROOM_WIDTH / 2 - LIGHT_OFFSET, PAINTING_Y + 0.8, 0]}
        lookAt={[ROOM_WIDTH / 2, PAINTING_Y, 0]}
        width={lightW}
        height={lightH}
        intensity={lightIntensity}
        color={lightColor}
      />
      <PaintingLight
        position={[-ROOM_WIDTH / 2 + LIGHT_OFFSET, PAINTING_Y + 0.8, 0]}
        lookAt={[-ROOM_WIDTH / 2, PAINTING_Y, 0]}
        width={lightW}
        height={lightH}
        intensity={lightIntensity}
        color={lightColor}
      />

      {/* Light cones */}
      <LightCone
        from={[0, FIXTURE_Y, -ROOM_DEPTH / 2 + TRACK_OFFSET]}
        target={[0, PAINTING_Y, -ROOM_DEPTH / 2 + 0.1]}
      />
      <LightCone
        from={[0, FIXTURE_Y, ROOM_DEPTH / 2 - TRACK_OFFSET]}
        target={[0, PAINTING_Y, ROOM_DEPTH / 2 - 0.1]}
      />
      <LightCone
        from={[ROOM_WIDTH / 2 - TRACK_OFFSET, FIXTURE_Y, 0]}
        target={[ROOM_WIDTH / 2 - 0.1, PAINTING_Y, 0]}
      />
      <LightCone
        from={[-ROOM_WIDTH / 2 + TRACK_OFFSET, FIXTURE_Y, 0]}
        target={[-ROOM_WIDTH / 2 + 0.1, PAINTING_Y, 0]}
      />

      {/* Floating dust motes */}
      <DustParticles />

      <Room />

      {collection.map((piece) => (
        <ArtFrame key={piece.id} piece={piece} onClick={() => onPieceClick(piece)} hideHtml={modalOpen} />
      ))}

      {/* Postprocessing */}
      <Effects />
    </>
  )
}

type MuseumSceneProps = {
  wallIndex: number
  onPieceClick: (piece: ArtPiece) => void
  modalOpen: boolean
}

export function MuseumScene({ wallIndex, onPieceClick, modalOpen }: MuseumSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, EYE_HEIGHT, 0], fov: 60, near: 0.1, far: 100 }}
      shadows
      dpr={[1, 1.5]}
      style={{ position: "absolute", inset: 0 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor("#0a0a0a")
        gl.shadowMap.enabled = true
        gl.shadowMap.type = THREE.PCFSoftShadowMap
      }}
    >
      <SceneContent wallIndex={wallIndex} onPieceClick={onPieceClick} modalOpen={modalOpen} />
    </Canvas>
  )
}
