"use client"

import { type ArtPiece } from "@/data/collection"

type Props = {
  piece: ArtPiece | undefined
}

export function ArtInfo({ piece }: Props) {
  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4 transition-all duration-500 ${
        piece ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {piece && (
        <div className="rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-5">
          <h2 className="text-base font-semibold text-white/90 mb-1">
            {piece.title}
          </h2>
          <p className="text-sm text-white/50 leading-relaxed mb-3 line-clamp-2">
            {piece.description}
          </p>
          <div className="flex items-center justify-between">
            <a
              href={piece.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white/60 transition-colors underline underline-offset-2"
            >
              {piece.source}
            </a>
            <span className="text-[10px] text-white/20 uppercase tracking-widest">
              Click to expand
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
