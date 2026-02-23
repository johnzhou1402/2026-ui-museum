"use client"

import { useState } from "react"
import { Html } from "@react-three/drei"
import { type ArtPiece } from "@/data/collection"
import { ROOM_WIDTH, ROOM_DEPTH, ROOM_HEIGHT } from "./Room"

type Props = {
  piece: ArtPiece
  onClick: () => void
}

export const FRAME_WIDTH = 4
export const FRAME_HEIGHT = 2.8
const FRAME_DEPTH = 0.08
const BORDER = 0.12

function getWallPosition(wall: ArtPiece["wall"]): [number, number, number] {
  const y = ROOM_HEIGHT / 2 + 0.2
  const offset = 0.05
  switch (wall) {
    case "north":
      return [0, y, -ROOM_DEPTH / 2 + offset]
    case "south":
      return [0, y, ROOM_DEPTH / 2 - offset]
    case "east":
      return [ROOM_WIDTH / 2 - offset, y, 0]
    case "west":
      return [-ROOM_WIDTH / 2 + offset, y, 0]
  }
}

function getWallRotation(wall: ArtPiece["wall"]): [number, number, number] {
  switch (wall) {
    case "north":
      return [0, 0, 0]
    case "south":
      return [0, Math.PI, 0]
    case "east":
      return [0, -Math.PI / 2, 0]
    case "west":
      return [0, Math.PI / 2, 0]
  }
}

export function ArtFrame({ piece, onClick }: Props) {
  const [hovered, setHovered] = useState(false)

  const position = getWallPosition(piece.wall)
  const rotation = getWallRotation(piece.wall)

  return (
    <group position={position} rotation={rotation}>
      {/* Frame — single box, no overlapping layers */}
      <mesh castShadow>
        <boxGeometry args={[FRAME_WIDTH + BORDER * 2, FRAME_HEIGHT + BORDER * 2, FRAME_DEPTH]} />
        <meshStandardMaterial color={hovered ? "#1a1a1a" : "#2a2a2a"} roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Mat — inset into frame, pushed forward enough to clear */}
      <mesh position={[0, 0, FRAME_DEPTH / 2 - 0.005]}>
        <planeGeometry args={[FRAME_WIDTH + 0.06, FRAME_HEIGHT + 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>

      {/* Art — HTML overlay only, no mesh underneath */}
      <Html
        position={[0, 0, FRAME_DEPTH / 2 + 0.005]}
        transform
        distanceFactor={4.5}
        style={{
          width: "400px",
          height: "280px",
          overflow: "hidden",
          borderRadius: "2px",
          cursor: "pointer",
        }}
      >
        <div
          style={{ width: "100%", height: "100%", position: "relative" }}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          onMouseEnter={() => {
            setHovered(true)
            document.body.style.cursor = "pointer"
          }}
          onMouseLeave={() => {
            setHovered(false)
            document.body.style.cursor = "grab"
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={piece.media.url}
            alt={piece.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            draggable={false}
          />
          {hovered && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 500,
                  padding: "6px 16px",
                  background: "rgba(0,0,0,0.5)",
                  borderRadius: "20px",
                  backdropFilter: "blur(4px)",
                }}
              >
                View
              </span>
            </div>
          )}
        </div>
      </Html>

      {/* Label plate */}
      <mesh position={[0, -(FRAME_HEIGHT / 2 + BORDER + 0.2), FRAME_DEPTH / 2]}>
        <planeGeometry args={[1.8, 0.2]} />
        <meshStandardMaterial color="#f8f8f4" roughness={0.8} />
      </mesh>
    </group>
  )
}
