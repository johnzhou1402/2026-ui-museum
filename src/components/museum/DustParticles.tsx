"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH } from "./Room"

const PARTICLE_COUNT = 60

// Simple seeded noise — gives each particle a unique, non-repeating drift
function noise(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}

export function DustParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const particles = useMemo(() => {
    const data = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      data.push({
        x: (Math.random() - 0.5) * ROOM_WIDTH * 0.85,
        y: Math.random() * ROOM_HEIGHT * 0.9 + 0.3,
        z: (Math.random() - 0.5) * ROOM_DEPTH * 0.85,
        vx: 0,
        vy: 0,
        vz: 0,
        // Unique seed per particle for noise sampling
        seed: Math.random() * 1000,
        scale: 0.001 + Math.random() * 0.0015,
      })
    }
    return data
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particles[i]

      // Sample noise at different frequencies for each axis
      // This gives smooth but unpredictable velocity changes
      const nx = noise(t * 0.3 + p.seed, i * 0.1) - 0.5
      const ny = noise(t * 0.2 + p.seed + 100, i * 0.1) - 0.5
      const nz = noise(t * 0.25 + p.seed + 200, i * 0.1) - 0.5

      // Random impulses — nudge velocity toward noise direction
      const jitter = 0.00015
      p.vx += nx * jitter
      p.vy += ny * jitter * 0.5 + 0.000005 // tiny upward bias
      p.vz += nz * jitter

      // Drag — prevents runaway velocity, gives that floaty deceleration
      const drag = 0.985
      p.vx *= drag
      p.vy *= drag
      p.vz *= drag

      // Apply velocity
      p.x += p.vx
      p.y += p.vy
      p.z += p.vz

      // Wrap around room bounds
      const hw = ROOM_WIDTH * 0.42
      const hd = ROOM_DEPTH * 0.42
      if (p.x > hw) p.x = -hw
      if (p.x < -hw) p.x = hw
      if (p.z > hd) p.z = -hd
      if (p.z < -hd) p.z = hd
      if (p.y > ROOM_HEIGHT * 0.9) p.y = 0.3
      if (p.y < 0.3) p.y = ROOM_HEIGHT * 0.9

      dummy.position.set(p.x, p.y, p.z)
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial
        color="#fff8e0"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </instancedMesh>
  )
}
