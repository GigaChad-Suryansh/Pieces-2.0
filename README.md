# Anatomy

Explore a car in 3D, hover a system, and open a dedicated simulator for it.

- `/` the car (the map). Hover or tap a part to get its "Explore" action.
- `/explore/engine` the engine simulator (slider-crank pistons, valve timing, four-stroke cycle, turbo, exploded view, part isolation).
- `/explore/:system` other systems show a preview page until their simulator is built.

## Status
| Phase | Scope | State |
|---|---|---|
| 1 | Homepage car, hover detection, route to engine | done |
| 2 | Engine simulator | done |
| B | Visual polish: halftone footer on the homepage, perspective-tunnel systems page at `/systems` | done |
| 3 | Transmission, brakes, suspension, electrical | planned |
| 4 | EV, cooling, steering | planned |
| 5 | Polish, performance, mobile, deploy | planned |

## Tooling notes
- Tailwind v4 is loaded **without its preflight reset** (`src/tailwind.css`) so the hand-written styles in `src/styles.css` are unchanged. Add `no-underline` to Tailwind-styled links.
- `src/components/ui/*.tsx` are TypeScript; the rest of the app is JS. `npx tsc --noEmit` checks the TS files.
- Footer links are plain anchors (full page load). Host with an SPA fallback so deep links like `/explore/engine` resolve.
- On the homepage the mouse wheel scrolls the page, so camera zoom uses the +/− buttons.

## Known limitation
The car and engine are built procedurally from primitives, not a downloaded GLB. This keeps every part
individually selectable and the repo licence-clean. Swapping in a licensed GLB means mapping its node
names to the ids in `src/data/systems.js`.

## Run
`npm install && npm run dev`, then `npm run build` for production.
