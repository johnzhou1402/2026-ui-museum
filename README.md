# 2026 UI Museum

A 3D virtual gallery where the art on the walls is iconic software design.

Walk through a museum room with track lighting, dust particles, and bloom — each wall showcases a product that pushed UI forward: Stripe Checkout, Linear, Vercel, Arc Browser.

Built with Next.js, React Three Fiber, and Three.js.

## Features

- **3D gallery room** with hardwood floors, track lighting, and wall trim
- **Spring-physics camera** — drag to look around with critically damped snap-back
- **Per-painting lighting** — RectAreaLights, volumetric light cones, and bloom
- **Floating dust particles** — instanced mesh with noise-driven drift
- **Click-to-inspect** modal for each piece with descriptions

## Stack

- [Next.js 16](https://nextjs.org)
- [React Three Fiber](https://r3f.docs.pmnd.rs)
- [Three.js](https://threejs.org)
- [Tailwind CSS 4](https://tailwindcss.com)
- TypeScript

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Collection

| Wall  | Piece              |
|-------|--------------------|
| North | Stripe Checkout    |
| East  | Linear             |
| South | Vercel Dashboard   |
| West  | Arc Browser        |

Add your own pieces in `src/data/collection.ts`.
