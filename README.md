# Anatomy

Site live at - https://gigachad-suryansh.github.io/Pieces-2.0/ 

Explore a car in 3D, hover a system, and open a dedicated simulator for it.

A single scrolling page. Scrolling flies the camera along the car, system by system, while the
background shifts between cream and royal green. Hover (or tap) any part for a quick panel.
"Explore Engine" opens the separate engine simulator: https://gigachad-suryansh.github.io/Pieces/

## Status
| Phase | Scope | State |
|---|---|---|
| 1 | Homepage car, hover detection, route to engine | done |
| 2 | Engine simulator | done |
| B | Visual polish: halftone footer on the homepage, perspective-tunnel systems page at `/systems` | done |
| 3 | Other simulators (transmission, brakes, suspension...) | planned, linked from the tour when ready |
| 4 | EV, cooling, steering | planned |
| 5 | Polish, performance, mobile, deploy | planned |

## Known limitation
The car and engine are built procedurally from primitives, not a downloaded GLB. This keeps every part
individually selectable and the repo licence-clean. Swapping in a licensed GLB means mapping its node
names to the ids in `src/data/systems.js`.

## Run
`npm install && npm run dev`, then `npm run build` for production.
