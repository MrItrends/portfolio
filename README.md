# Portfolio

A curated digital exhibition — selected work and design stories.

Built with **Next.js (App Router) + TypeScript + CSS Modules**. No Tailwind, no UI
libraries. Typographic-first, two colors, strict grid.

## System documents

These govern every design and engineering decision. Read before building a section.

- [`visual_system.md`](./visual_system.md) — visual language, color, typography, grid, motion
- [`Engineering_System.md`](./Engineering_System.md) — build approach, responsiveness, a11y, performance
- [`Case_Study_System.md`](./Case_Study_System.md) — case study narrative framework

## Foundation

- **Color:** `#F1F1F1` background, `#070707` ink — the only two values outside project pages.
- **Type:** PP Mori (Regular 400, Medium/SemiBold 500). Self-hosted — see
  [`public/fonts/README.md`](./public/fonts/README.md) to drop in the font files.
- **Tokens:** colors, type scale, spacing, grid, and motion live in
  [`src/app/globals.css`](./src/app/globals.css).
- **Grid:** 12 columns desktop → 8 tablet (≤1024px) → 4 mobile (≤600px).

## Develop

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
npm run start   # serve the production build
npm run lint
```

## Deploy (Vercel)

Vercel auto-detects Next.js — no extra config needed.

**Option A — GitHub (recommended, automatic deploys + preview URLs):**
push this repo to GitHub, then import it at [vercel.com/new](https://vercel.com/new).
Every push to `master` deploys to production; every branch gets a preview URL.

**Option B — Vercel CLI:**

```bash
vercel login
vercel        # link + deploy a preview
vercel --prod # deploy to production
```
