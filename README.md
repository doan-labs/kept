# Doan · Photographs

A scroll journey through photographs by Linh. An experiment from  
[Doan Labs](https://doan-labs.com).

The mark is the layout. A stack of photographs opens into the mark's own
lattice, each photograph clipped to one of its four shapes, and the whole
thing turns a quarter turn as you scroll. Below that, seven sections carry the
photographs through pinned statements, wipes, a marquee, a full-bleed grow, a
horizontal contact sheet and a closing frame.

## Run

```sh
bun install
bun run dev
```

Wait for the counter to reach 100, tap the featured photograph, scroll.
`Esc` or the × closes the journey and returns to the stack.

```sh
bun run build     # tsc -b, then vite build into dist/
bun run lint      # oxlint
```

## Deploy

Cloudflare Workers serves `dist/` as static assets, no Worker script. The site
answers at `kept.doan-labs.com`. The script is still called `photo-scroll`,
which is the name the Cloudflare dashboard knows it by.

Cloudflare Workers Builds watches the repository and deploys on its own, so a
merge into `main` is the whole release. `.github/workflows/checks.yml` runs the
three checks on every pull request, which is what keeps a broken build off
`main` in the first place.

To ship from your own machine instead:

```sh
bun run deploy    # bun run build, then wrangler deploy
```

## Stack

Vite 8, React 19, TypeScript, StyleX, `motion`, Lenis, oxlint, bun.

## Files

| File | What it does |
| --- | --- |
| `src/App.tsx` | Page shell: Lenis wrapper, fixed header, backdrop mark, title, loader gate |
| `src/Loader.tsx` | Preload counter for the hero photographs, mark quarter turn, tilted exit |
| `src/Gallery.tsx` | Photograph stack, slat reveal, lattice expansion with shape clips |
| `src/Sections.tsx` | The seven scroll sections and the footer |
| `src/DoanMark.tsx` | The mark, transcribed from doan-labs.com |
| `src/data.ts` | The twelve photographs, stack positions, lattice cells |
| `src/tokens.stylex.ts` | Warm monochrome palette and type stack |

Photographs are picsum placeholders until Linh's files land. See `src/data.ts`.

Conventions for working on this repo live in `AGENTS.md`.
