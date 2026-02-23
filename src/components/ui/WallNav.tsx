"use client"

import { walls, type Wall } from "@/data/collection"

type Props = {
  currentWall: Wall
  wallIndex: number
  onPrev: () => void
  onNext: () => void
  isAnimating: boolean
}

const wallLabels: Record<Wall, string> = {
  north: "N",
  east: "E",
  south: "S",
  west: "W",
}

export function WallNav({ currentWall, wallIndex, onPrev, onNext, isAnimating }: Props) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
      {/* Left arrow */}
      <button
        onClick={onPrev}
        disabled={isAnimating}
        className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-30"
        aria-label="Previous wall"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
          <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Wall indicator dots */}
      <div className="flex items-center gap-3">
        {walls.map((wall, i) => (
          <div key={wall} className="flex flex-col items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === wallIndex
                  ? "bg-white scale-125"
                  : "bg-white/20 hover:bg-white/40"
              }`}
            />
            <span
              className={`text-[10px] font-mono transition-all duration-300 ${
                i === wallIndex ? "text-white/70" : "text-white/20"
              }`}
            >
              {wallLabels[wall]}
            </span>
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={onNext}
        disabled={isAnimating}
        className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-30"
        aria-label="Next wall"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="group-hover:translate-x-0.5 transition-transform">
          <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
