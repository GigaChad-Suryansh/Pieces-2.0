import { create } from 'zustand'

/** UI-driven simulator state. The fast-changing crank angle lives in `simState`, not here. */
export const useSim = create((set) => ({
  rpm: 1500,
  throttle: 0.3,
  running: true,
  timeScale: 0.05,   // slow motion so valves and pistons are watchable
  turbo: false,
  explode: 0,
  isolate: false,
  selected: null,
  hovered: null,
  search: '',
  set: (patch) => set(patch),
}))

export const simState = { theta: 0 } // crank angle, 0..720 degrees
