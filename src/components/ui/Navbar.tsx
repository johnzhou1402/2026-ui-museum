"use client"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 pointer-events-none">
      <div className="pointer-events-auto">
        <h1 className="text-lg font-semibold tracking-tight text-white/90">
          Digital Museum
        </h1>
        <p className="text-xs text-white/40 tracking-wide uppercase">
          UI/UX Collection
        </p>
      </div>
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5">
        <span className="text-xs text-white/50">Floor 1</span>
        <span className="text-white/20">|</span>
        <span className="text-xs text-white/70">Gallery A</span>
      </div>
    </nav>
  )
}
