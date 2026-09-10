# Doan · Photographs

A single-page scroll journey through photographs by Linh, published by
**Doan** (legally *Doan Labs*). Vite 8, React 19, TypeScript, StyleX,
`motion`, Lenis, oxlint, bun.

**This file is canonical.** `CLAUDE.md` is a symlink to it. Edit `AGENTS.md`
and never replace the symlink with a real file. This file holds rules and
conventions. What a file does and why belongs in that file's header comment.

## Voice and facts

- Never invent facts. Twelve photographs, by Linh, 2026. Nothing else is
  established. No awards, no exhibitions, no camera names, no locations.
- The photographer is `Linh` in copy. `DOAN` is the visible brand in the
  wordmark and the mark. Body copy never says "Doan".
- Captions use the item's index as `N° 07`. Ids in `src/data.ts` are
  working titles, not real captions.
- No em dashes. Use a comma, a full stop, or a middle dot `·`.
- No stock photography. The picsum seeds in `src/data.ts` are placeholders.
  Swap `src` for real files and keep the ids as the captions.

## Design

- Warm monochrome only. Every colour comes from `src/tokens.stylex.ts`,
  lifted from doan-labs.com. Never add a colour.
- Type: Inter for sans, Source Serif 4 for the serif, JetBrains Mono for
  kickers and counters. Loaded from `@fontsource-variable`.
- Square corners everywhere. Hairlines are 1px in `line` or `lineStrong`.
- The mark is `src/DoanMark.tsx`, transcribed from doan-labs.com. Do not
  redraw it. Its four shapes sit one to a cell on a 24×24 grid; the lattice
  geometry in `src/Gallery.tsx` must stay pixel-exact with the backdrop mark,
  including stroke widths. Measure before changing either.
- The gesture vocabulary is the mark's: quarter turns, tilted squares
  righting themselves, dot lattices, hairlines drawing. Prefer those to
  generic effects.

## Motion

- Everything scroll-driven reads Lenis' smoothed value through the shared
  `scrollY` MotionValue, never `window.scrollY`. Sections measure their own
  range once in `useProgress` and map through `useTransform`.
- Every gesture has a reduced-motion branch. `MotionConfig reducedMotion="user"`
  covers motion props; anything hand-rolled checks `useReducedMotion`.
- Chrome clips IntersectionObserver rects by `clip-path`. A clipped element
  starting at zero area never fires its own `whileInView`. Drive it from a
  parent's variants.
- Grid containers pin an item taller than the viewport to the top. Centre
  overflowing things with flex.

## StyleX

- Longhands only for borders. No descendant selectors; the mark's hover lives
  in `src/index.css` for that reason.
- Outlined text uses `WebkitTextStrokeWidth` and `WebkitTextStrokeColor`.

## Checks

```sh
bunx tsc --noEmit -p tsconfig.app.json
bunx oxlint src
bun run build
```

All three must pass before a change is done. Verify motion visually in a
browser, not by reading the code.

## Git

No AI attribution in commits or pull requests. No `Co-Authored-By`,
`Generated with`, or session trailers.
