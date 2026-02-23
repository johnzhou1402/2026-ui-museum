"use client"

import { useEffect } from "react"
import { type ArtPiece } from "@/data/collection"
import { useTypewriter } from "@/hooks/useTypewriter"

type Props = {
  piece: ArtPiece | null
  onClose: () => void
}

export function PieceModal({ piece, onClose }: Props) {
  useEffect(() => {
    if (!piece) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [piece, onClose])

  const { displayed, done } = useTypewriter(piece?.description ?? "", 30)

  if (!piece) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in" />

      {/* Modal content */}
      <div
        className="relative z-10 w-full max-w-4xl mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 text-sm"
        >
          <span>Close</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-mono">ESC</kbd>
        </button>

        {/* Art display */}
        <div className="rounded-2xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-xl">
          {/* Image area */}
          <div className="relative aspect-video bg-neutral-900 flex items-center justify-center">
            {piece.media.type === "image" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={piece.media.url}
                alt={piece.title}
                className="w-full h-full object-contain"
              />
            )}
            {piece.media.type === "video" && (
              <video
                src={piece.media.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
            {piece.media.type === "iframe" && (
              <iframe
                src={piece.media.url}
                title={piece.title}
                className="w-full h-full"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
          </div>

          {/* Info panel */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white/90 mb-2">{piece.title}</h2>
            {piece.description && (
              <p className="text-sm text-white/50 leading-relaxed mb-4 font-mono">
                {displayed}
                {!done && <span className="inline-block w-[2px] h-[14px] bg-white/50 ml-[1px] align-middle animate-pulse" />}
              </p>
            )}
            <a
              href={piece.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5.5 8.5L8.5 5.5M7 5H8.5V6.5M3.5 8.5V10C3.5 10.2761 3.72386 10.5 4 10.5H10C10.2761 10.5 10.5 10.2761 10.5 10V4C10.5 3.72386 10.2761 3.5 10 3.5H8.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Visit source
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
