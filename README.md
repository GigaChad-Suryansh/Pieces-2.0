# Anatomy

Site live at - https://gigachad-suryansh.github.io/Pieces-2.0/ 

A single scrolling page. Scrolling flies the camera along the car, system by system, while the
background shifts between cream and royal green. Hover (or tap) any part for a quick panel.
"Explore Engine" opens the separate engine simulator: https://gigachad-suryansh.github.io/Pieces/

## Status
| Phase | Scope | State |
|---|---|---|
| 1 | Scroll-driven car tour, hover panels, royal cream/green palette, halftone footer | done |
| 2 | Engine simulator | lives in the separate Pieces site (linked) |
| 3 | Link in further simulators (transmission, brakes, suspension) as they are built | planned |
| 4 | Real GLB car model, mobile polish, performance | planned |

## Known limitation
The car and engine are built procedurally from primitives, not a downloaded GLB. This keeps every part
individually selectable and the repo licence-clean. Swapping in a licensed GLB means mapping its node
names to the ids in `src/data/systems.js`.

## Run
`npm install && npm run dev`, then `npm run build` for production.
