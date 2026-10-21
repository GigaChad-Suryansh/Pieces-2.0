import { useEffect } from 'react'
import { TOUR } from '../data/systems.js'

// Palette: cream, royal green, crimson, antique gold.
export const CREAM = '#f3ead7'
export const GREEN = '#14302a'
export const IVORY = '#f7efdd'
export const INK = '#17332a'

// Camera keyframes. shift: fraction of the screen width the car moves right (text sits on the other side).
const KEYS = {
  hero: { pos: [5.6, 2.5, 6.0], target: [0, 0.75, 0], shift: 0.16, shiftY: -0.1, mood: 0 },
  engine: { pos: [4.3, 2.1, 3.1], target: [1.7, 0.85, 0], shift: 0.2, shiftY: 0.2, mood: 1 },
  cooling: { pos: [4.7, 1.5, 2.3], target: [2.2, 0.75, 0], shift: -0.2, shiftY: 0.2, mood: 1 },
  transmission: { pos: [2.9, 1.7, 3.5], target: [0.85, 0.65, 0], shift: 0.2, shiftY: 0.2, mood: 1 },
  steering: { pos: [2.3, 2.3, 3.3], target: [0.8, 0.9, 0.2], shift: -0.2, shiftY: 0.2, mood: 1 },
  brakes: { pos: [3.7, 1.1, 3.3], target: [1.45, 0.4, 0.7], shift: 0.2, shiftY: 0.2, mood: 1 },
  suspension: { pos: [-3.3, 1.5, 3.4], target: [-1.15, 0.6, 0.55], shift: -0.2, shiftY: 0.2, mood: 1 },
  'electric-motor': { pos: [-3.7, 2.1, 3.3], target: [-1.4, 0.5, 0], shift: 0.2, shiftY: 0.2, mood: 1 },
  'electrical-system': { pos: [2.9, 2.5, -3.5], target: [1.2, 0.8, -0.45], shift: -0.2, shiftY: 0.2, mood: 1 },
  finale: { pos: [-5.2, 2.6, 5.4], target: [0, 1.75, 0], shift: 0, shiftY: -0.1, mood: 0 },
}
// Tour stops sit further back and further to the side so the text never covers the car.
for (const id of Object.keys(KEYS)) {
  if (id === 'hero' || id === 'finale') continue
  const k = KEYS[id]
  k.pos = k.pos.map((v, i) => k.target[i] + (v - k.target[i]) * 1.4)
  k.shift = Math.sign(k.shift) * 0.26
}
export const SCENE_IDS = ['hero', ...TOUR, 'finale']

/** Live, interpolated state. Written by useScrollScene every frame, read by the 3D scene. */
export const scene = { ...structuredClone(KEYS.hero), active: 'hero' }

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
export const mix = (a, b, t) => {
  const A = hex(a), B = hex(b)
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`
}
const smooth = (t) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c) }
const lerp = (a, b, t) => a + (b - a) * t

/**
 * Drives the tour from the page scroll position. Each [data-scene] section is a
 * stop; between two stops the camera, colour mood and side shift are blended.
 */
export function useScrollScene(rootRef, onActive) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = [...root.querySelectorAll('[data-scene]')]
    let raf = 0
    let last = ''
    let lastMood = -1
    const tick = () => {
      const mid = window.scrollY + window.innerHeight / 2
      const centers = els.map((el) => {
        const r = el.getBoundingClientRect()
        return r.top + window.scrollY + r.height / 2
      })
      let i = 0
      while (i < centers.length - 1 && centers[i + 1] <= mid) i++
      const j = Math.min(i + 1, centers.length - 1)
      const t = i === j || mid < centers[0] ? 0 : smooth((mid - centers[i]) / (centers[j] - centers[i]))
      const a = KEYS[SCENE_IDS[i]]
      const b = KEYS[SCENE_IDS[j]]
      for (let k = 0; k < 3; k++) {
        scene.pos[k] = lerp(a.pos[k], b.pos[k], t)
        scene.target[k] = lerp(a.target[k], b.target[k], t)
      }
      scene.shift = lerp(a.shift, b.shift, t)
      scene.shiftY = lerp(a.shiftY, b.shiftY, t)
      scene.mood = lerp(a.mood, b.mood, t)
      if (Math.abs(scene.mood - lastMood) > 0.002) {
        const bg = mix(CREAM, GREEN, scene.mood)
        root.style.backgroundColor = bg
        root.style.setProperty('--bg', bg)
        root.style.color = mix(INK, IVORY, scene.mood)
        lastMood = scene.mood
      }
      const id = SCENE_IDS[t < 0.5 ? i : j]
      if (id !== last) { last = id; scene.active = id; onActive(id) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [rootRef, onActive])
}
