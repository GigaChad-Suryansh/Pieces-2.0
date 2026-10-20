// Engine kinematics and a simple performance model. Pure functions, no rendering.
// Units are scene units (1 unit ≈ 0.25 m for visuals); angles in degrees unless named rad.

export const GEOM = {
  crank: 0.12,      // crank throw radius (half the stroke)
  rod: 0.42,        // connecting-rod length, centre to centre
  crownAbovePin: 0.07,
  ceiling: 0.66,    // combustion chamber roof height above the crank axis
  bore: 0.165,
}

// Inline four, flat-plane crank, firing order 1-3-4-2.
// `throwDeg`: crank-pin angle relative to cylinder 1. `phase`: where the cylinder
// sits in the 720° four-stroke cycle when the crank angle is 0.
export const CYLINDERS = [
  { n: 1, x: -0.675, throwDeg: 0, phase: 0 },
  { n: 2, x: -0.225, throwDeg: 180, phase: 540 },
  { n: 3, x: 0.225, throwDeg: 180, phase: 180 },
  { n: 4, x: 0.675, throwDeg: 0, phase: 360 },
]

export const rad = (d) => (d * Math.PI) / 180
export const wrap = (v, m) => ((v % m) + m) % m

/** Slider-crank: piston pin height above the crank axis. 0° = top dead centre. */
export function pinHeight(crankDeg, throwDeg = 0) {
  const a = rad(crankDeg + throwDeg)
  const { crank: r, rod: l } = GEOM
  return r * Math.cos(a) + Math.sqrt(l * l - (r * Math.sin(a)) ** 2)
}

/** Position within the 720° cycle for one cylinder. */
export const cyclePhase = (crankDeg, phase) => wrap(crankDeg - phase, 720)

export function strokeName(phi) {
  if (phi < 180) return 'Intake'
  if (phi < 360) return 'Compression'
  if (phi < 540) return 'Power'
  return 'Exhaust'
}

/** Valve lift 0..1. Each valve is open about 200° of the 720° cycle. */
export function valveLift(phi, which) {
  const start = which === 'intake' ? -10 : 530
  const d = wrap(phi - start, 720)
  return d < 200 ? Math.sin((Math.PI * d) / 200) ** 2 : 0
}

/** Brightness of combustion, 0..1, starting just before TDC of the power stroke. */
export function burn(phi) {
  if (phi < 355 || phi > 450) return 0
  return Math.max(0, 1 - Math.max(0, phi - 360) / 90)
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/**
 * Estimated output for a typical 1.6 L petrol four. Illustrative, not a
 * dyno measurement: a torque curve peaking mid-range, scaled by throttle,
 * plus extra torque from a turbocharger once it is spooled.
 */
export function performance(rpm, throttle, turbo) {
  const full = Math.max(70, 150 * (1 - ((rpm - 4200) / 5200) ** 2))
  let torque = full * (0.1 + 0.9 * throttle)
  const boost = turbo ? 0.4 * smoothstep(1800, 3200, rpm) * throttle : 0
  torque *= 1 + boost
  const power = (torque * rpm) / 9549.3
  return { torque, power, boostBar: boost * 1.2 }
}
