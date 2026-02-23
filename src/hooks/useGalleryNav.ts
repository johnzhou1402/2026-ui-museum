"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { walls, type Wall, getPieceForWall, type ArtPiece } from "@/data/collection"

export function useGalleryNav() {
  const [wallIndex, setWallIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null)

  const currentWall: Wall = walls[wallIndex]
  const currentPiece = getPieceForWall(currentWall)

  // Target azimuth angle (horizontal rotation) for the camera
  // North = 0, East = π/2, South = π, West = 3π/2
  const targetAzimuth = useRef(0)

  const goToWall = useCallback(
    (index: number) => {
      if (isAnimating) return
      const wrapped = ((index % walls.length) + walls.length) % walls.length
      setIsAnimating(true)
      setWallIndex(wrapped)

      // Calculate target angle based on wall
      const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
      targetAzimuth.current = angles[wrapped]

      // Animation completes via the Scene component
      setTimeout(() => setIsAnimating(false), 600)
    },
    [isAnimating]
  )

  const nextWall = useCallback(() => {
    goToWall(wallIndex + 1)
  }, [wallIndex, goToWall])

  const prevWall = useCallback(() => {
    goToWall(wallIndex - 1)
  }, [wallIndex, goToWall])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedPiece) {
        if (e.key === "Escape") setSelectedPiece(null)
        return
      }
      if (e.key === "ArrowRight" || e.key === "d") nextWall()
      if (e.key === "ArrowLeft" || e.key === "a") prevWall()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [nextWall, prevWall, selectedPiece])

  return {
    currentWall,
    wallIndex,
    isAnimating,
    nextWall,
    prevWall,
    goToWall,
    targetAzimuth,
    currentPiece,
    selectedPiece,
    setSelectedPiece,
  }
}
