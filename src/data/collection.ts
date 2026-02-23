export type ArtPiece = {
  id: string
  title: string
  source: string
  description: string
  media: { type: "image" | "video" | "iframe"; url: string }
  wall: "north" | "south" | "east" | "west"
}

export const collection: ArtPiece[] = [
  {
    id: "stripe-checkout",
    title: "Stripe Checkout Flow",
    source: "https://stripe.com",
    description:
      "Stripe's checkout is a masterclass in reducing friction. The single-page flow with inline validation, smart defaults, and that satisfying animation on submit — every detail serves conversion.",
    media: { type: "image", url: "/art/stripe-checkout.svg" },
    wall: "north",
  },
  {
    id: "linear-app",
    title: "Linear Issue Tracker",
    source: "https://linear.app",
    description:
      "Linear proved that enterprise software doesn't have to feel heavy. Keyboard-first navigation, sub-100ms interactions, and a design language that makes project management feel like a craft.",
    media: { type: "image", url: "/art/linear-app.svg" },
    wall: "east",
  },
  {
    id: "vercel-dashboard",
    title: "Vercel Dashboard",
    source: "https://vercel.com",
    description:
      "The Vercel dashboard turns deployment complexity into visual clarity. Real-time build logs, branch previews at a glance, and a dark theme that makes monitoring feel cinematic.",
    media: { type: "image", url: "/art/vercel-dashboard.svg" },
    wall: "south",
  },
  {
    id: "arc-browser",
    title: "Arc Browser",
    source: "https://arc.net",
    description:
      "Arc reimagined what a browser could be. The collapsible sidebar, spaces for context-switching, and command bar — it treats tabs as a design problem, not just a list.",
    media: { type: "image", url: "/art/arc-browser.svg" },
    wall: "west",
  },
]

export const walls = ["north", "east", "south", "west"] as const
export type Wall = (typeof walls)[number]

export function getWallRotation(wall: Wall): number {
  const map: Record<Wall, number> = {
    north: 0,
    east: Math.PI / 2,
    south: Math.PI,
    west: (3 * Math.PI) / 2,
  }
  return map[wall]
}

export function getPieceForWall(wall: Wall): ArtPiece | undefined {
  return collection.find((p) => p.wall === wall)
}
