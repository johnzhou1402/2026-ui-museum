"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { useGalleryNav } from "@/hooks/useGalleryNav"
import { Navbar } from "@/components/ui/Navbar"
import { WallNav } from "@/components/ui/WallNav"
import { ArtInfo } from "@/components/ui/ArtInfo"
import { PieceModal } from "@/components/ui/PieceModal"

const MuseumScene = dynamic(
  () => import("@/components/museum/Scene").then((m) => m.MuseumScene),
  { ssr: false }
)

export default function Home() {
  const {
    currentWall,
    wallIndex,
    isAnimating,
    nextWall,
    prevWall,
    currentPiece,
    selectedPiece,
    setSelectedPiece,
  } = useGalleryNav()

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D Scene */}
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              <p className="text-sm text-white/40">Loading gallery...</p>
            </div>
          </div>
        }
      >
        <MuseumScene wallIndex={wallIndex} onPieceClick={setSelectedPiece} />
      </Suspense>

      {/* UI Overlays */}
      <Navbar />
      <ArtInfo piece={currentPiece} />
      <WallNav
        currentWall={currentWall}
        wallIndex={wallIndex}
        onPrev={prevWall}
        onNext={nextWall}
        isAnimating={isAnimating}
      />
      <PieceModal piece={selectedPiece} onClose={() => setSelectedPiece(null)} />

      {/* Drag hint — fades out after first interaction */}
      <DragHint />
    </div>
  )
}

function DragHint() {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none animate-fade-out-delayed">
      <div className="flex flex-col items-center gap-2 text-white/30">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M8 16H24M24 16L18 10M24 16L18 22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-xs tracking-wider uppercase">Drag to look around</span>
      </div>
    </div>
  )
}
