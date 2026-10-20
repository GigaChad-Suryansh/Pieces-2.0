import { createContext, useContext, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import * as THREE from 'three'
import { simState, useSim } from './store.js'
import { CYLINDERS, GEOM, burn, cyclePhase, pinHeight, rad, valveLift, wrap } from './physics.js'

const PartCtx = createContext(null)
const EMBER = new THREE.Color('#ff7a2f')

/** Hoverable / selectable group. Dimmed parts (during isolation) let events through. */
function EPart({ id, children }) {
  const set = useSim((s) => s.set)
  const dimmed = () => { const s = useSim.getState(); return s.isolate && s.selected && s.selected !== id }
  return (
    <group
      onPointerOver={(e) => {
        if (dimmed()) return
        e.stopPropagation(); set({ hovered: id }); document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        if (useSim.getState().hovered === id) set({ hovered: null })
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        if (dimmed()) return
        e.stopPropagation(); set({ selected: useSim.getState().selected === id ? null : id })
      }}
    >
      <PartCtx.Provider value={id}>{children}</PartCtx.Provider>
    </group>
  )
}

function EMat({ color, base = 1, metalness = 0.65, roughness = 0.35 }) {
  const id = useContext(PartCtx)
  const ref = useRef()
  useFrame((_, dt) => {
    const m = ref.current
    if (!m) return
    const s = useSim.getState()
    const level = s.selected === id ? 2 : s.hovered === id ? 1 : 0
    const dim = s.isolate && s.selected && s.selected !== id
    m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, level === 2 ? 0.45 : level === 1 ? 0.75 : 0, 12, dt)
    m.opacity = THREE.MathUtils.damp(m.opacity, dim ? 0.06 : base, 10, dt)
    m.depthWrite = m.opacity > 0.95
  })
  return (
    <meshStandardMaterial
      ref={ref} color={color} metalness={metalness} roughness={roughness}
      transparent opacity={base} emissive={EMBER} emissiveIntensity={0}
    />
  )
}

const X_AXIS = [0, 0, Math.PI / 2] // rotates a Y-aligned cylinder to lie along X
const UP = new THREE.Vector3(0, 1, 0)
const INTAKE = new THREE.Color('#6fb7ff')
const WARM = new THREE.Color('#ffd27a')
const FIRE = new THREE.Color('#ff4b1f')
const EXH = new THREE.Color('#8a8f96')
const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _q = new THREE.Quaternion()

export default function EngineModel() {
  const r = useRef({
    pist: [], rod: [], gas: [], gasMat: [], iv: [], ev: [], flash: [], flashMat: [],
    gBlock: null, gCrank: null, gPist: null, gHead: null, gCam: null, gValves: null, gPlugs: null, gTurbo: null, gGas: null,
    camRot: null, rotorA: null, rotorB: null, turboAngle: 0,
  })

  useFrame((_, dt) => {
    const k = r.current
    const s = useSim.getState()
    if (s.running) simState.theta = wrap(simState.theta + s.rpm * 6 * s.timeScale * dt, 720)
    const th = simState.theta
    const e = s.explode

    // Exploded view offsets
    k.gBlock.position.y = -0.35 * e
    k.gCrank.position.y = -0.9 * e
    k.gPist.position.y = 0.5 * e
    k.gHead.position.y = 1.0 * e
    k.gValves.position.y = 1.25 * e
    k.gPlugs.position.y = 1.55 * e
    k.gCam.position.y = 1.9 * e
    k.gTurbo.position.z = 1.0 * e
    k.gCrank.rotation.x = rad(th)
    k.camRot.rotation.x = rad(th / 2)

    const hideGas = e > 0.05 || (s.isolate && s.selected)
    k.gGas.visible = !hideGas

    CYLINDERS.forEach((c, i) => {
      const ph = cyclePhase(th, c.phase)
      const py = pinHeight(th, c.throwDeg)
      k.pist[i].position.y = py

      // Connecting rod: pin on the piston to crank pin, in world space (explode offsets included).
      const alpha = rad(th + c.throwDeg)
      _a.set(c.x, py + k.gPist.position.y, 0)
      _b.set(c.x, GEOM.crank * Math.cos(alpha) + k.gCrank.position.y, GEOM.crank * Math.sin(alpha))
      const rod = k.rod[i]
      rod.position.copy(_a).add(_b).multiplyScalar(0.5)
      _b.sub(_a)
      rod.scale.y = _b.length()
      rod.quaternion.copy(_q.setFromUnitVectors(UP, _b.normalize()))

      // Gas in the cylinder between piston crown and chamber roof
      const crown = py + GEOM.crownAbovePin
      const h = Math.max(0.002, GEOM.ceiling - crown)
      const g = k.gas[i]
      g.position.y = crown + h / 2
      g.scale.y = h
      const gm = k.gasMat[i]
      if (ph < 180) { gm.color.copy(INTAKE); gm.opacity = 0.18 }
      else if (ph < 360) { const t = (ph - 180) / 180; gm.color.copy(INTAKE).lerp(WARM, t); gm.opacity = 0.18 + 0.22 * t }
      else if (ph < 540) { const b = s.running ? burn(ph) : 0; gm.color.copy(WARM).lerp(FIRE, b); gm.opacity = 0.3 + 0.4 * b }
      else { gm.color.copy(EXH); gm.opacity = 0.3 }

      k.iv[i].position.y = -valveLift(ph, 'intake') * 0.07
      k.ev[i].position.y = -valveLift(ph, 'exhaust') * 0.07

      const f = s.running ? burn(ph) : 0
      k.flash[i].scale.setScalar(0.001 + f)
      k.flashMat[i].opacity = f
    })

    // Turbo rotors only spin when the turbo is switched on
    if (s.turbo && s.running) k.turboAngle += dt * s.rpm * 6 * s.timeScale * 4 * (0.3 + 0.7 * s.throttle)
    k.rotorA.rotation.x = rad(k.turboAngle)
    k.rotorB.rotation.x = rad(k.turboAngle)
  })

  const set = (name) => (el) => { r.current[name] = el }
  const idx = (name, i) => (el) => { r.current[name][i] = el }

  return (
    <group>
      {/* Block and liners */}
      <group ref={set('gBlock')}>
        <EPart id="block">
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[1.7, 0.9, 0.5]} />
            <EMat color="#7c8794" base={0.16} />
            <Edges color="#7f8d9c" />
          </mesh>
          {CYLINDERS.map((c) => (
            <mesh key={c.n} position={[c.x, 0.3, 0]}>
              <cylinderGeometry args={[GEOM.bore + 0.005, GEOM.bore + 0.005, 0.6, 32, 1, true]} />
              <meshStandardMaterial color="#9aa7b5" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} metalness={0.5} roughness={0.3} />
            </mesh>
          ))}
        </EPart>
      </group>

      {/* Gas / combustion visual (not selectable) */}
      <group ref={set('gGas')}>
        {CYLINDERS.map((c, i) => (
          <mesh key={c.n} ref={idx('gas', i)} position={[c.x, 0.5, 0]}>
            <cylinderGeometry args={[GEOM.bore - 0.01, GEOM.bore - 0.01, 1, 28]} />
            <meshBasicMaterial ref={idx('gasMat', i)} transparent opacity={0.2} depthWrite={false} />
          </mesh>
        ))}
      </group>

      {/* Crankshaft */}
      <group ref={set('gCrank')}>
        <EPart id="crank">
          <mesh rotation={X_AXIS}>
            <cylinderGeometry args={[0.05, 0.05, 1.95, 20]} />
            <EMat color="#b9c1cb" />
          </mesh>
          {CYLINDERS.map((c) => {
            const sign = c.throwDeg === 0 ? 1 : -1
            return (
              <group key={c.n} position={[c.x, 0, 0]}>
                <mesh position={[0, sign * GEOM.crank, 0]} rotation={X_AXIS}>
                  <cylinderGeometry args={[0.045, 0.045, 0.22, 16]} />
                  <EMat color="#d3dae2" />
                </mesh>
                {[-0.1, 0.1].map((dx) => (
                  <group key={dx} position={[dx, 0, 0]}>
                    <mesh position={[0, sign * GEOM.crank * 0.5, 0]}>
                      <boxGeometry args={[0.03, GEOM.crank + 0.1, 0.1]} />
                      <EMat color="#a2acb7" />
                    </mesh>
                    <mesh position={[0, -sign * 0.12, 0]}>
                      <boxGeometry args={[0.03, 0.14, 0.17]} />
                      <EMat color="#8e98a4" />
                    </mesh>
                  </group>
                ))}
              </group>
            )
          })}
        </EPart>
      </group>

      {/* Connecting rods live in world space so they can span exploded parts */}
      <group>
        <EPart id="rods">
          {CYLINDERS.map((c, i) => (
            <mesh key={c.n} ref={idx('rod', i)}>
              <cylinderGeometry args={[0.03, 0.042, 1, 12]} />
              <EMat color="#9aa4b0" />
            </mesh>
          ))}
        </EPart>
      </group>

      {/* Pistons */}
      <group ref={set('gPist')}>
        <EPart id="pistons">
          {CYLINDERS.map((c, i) => (
            <group key={c.n} ref={idx('pist', i)} position={[c.x, 0.5, 0]}>
              <mesh position={[0, -0.01, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.16, 28]} />
                <EMat color="#cfd6de" metalness={0.8} roughness={0.3} />
              </mesh>
              {[0.03, 0.0].map((y) => (
                <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.15, 0.008, 6, 28]} />
                  <EMat color="#6f7a86" />
                </mesh>
              ))}
              <mesh rotation={X_AXIS}>
                <cylinderGeometry args={[0.026, 0.026, 0.26, 12]} />
                <EMat color="#8f99a5" />
              </mesh>
            </group>
          ))}
        </EPart>
      </group>

      {/* Head */}
      <group ref={set('gHead')}>
        <EPart id="head">
          <mesh position={[0, 0.77, 0]}>
            <boxGeometry args={[1.7, 0.3, 0.5]} />
            <EMat color="#6b7683" base={0.2} />
            <Edges color="#7f8d9c" />
          </mesh>
        </EPart>
      </group>

      {/* Valves */}
      <group ref={set('gValves')}>
        <EPart id="valves">
          {CYLINDERS.map((c, i) => (
            <group key={c.n}>
              {[['iv', -0.085, '#9fd0ff'], ['ev', 0.085, '#ffb08a']].map(([name, z, col]) => (
                <group key={name} ref={idx(name, i)} position={[c.x, 0, z]}>
                  <mesh position={[0, 0.66, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.016, 20]} />
                    <EMat color={col} metalness={0.8} roughness={0.3} />
                  </mesh>
                  <mesh position={[0, 0.86, 0]}>
                    <cylinderGeometry args={[0.012, 0.012, 0.4, 8]} />
                    <EMat color="#e6ebf0" metalness={0.9} roughness={0.25} />
                  </mesh>
                </group>
              ))}
            </group>
          ))}
        </EPart>
      </group>

      {/* Spark plugs */}
      <group ref={set('gPlugs')}>
        <EPart id="plugs">
          {CYLINDERS.map((c, i) => (
            <group key={c.n} position={[c.x, 0, 0]}>
              <mesh position={[0, 0.84, 0]}>
                <cylinderGeometry args={[0.024, 0.024, 0.34, 12]} />
                <EMat color="#f2efe7" metalness={0.2} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0.66, 0]} ref={idx('flash', i)}>
                <sphereGeometry args={[0.1, 16, 12]} />
                <meshBasicMaterial ref={idx('flashMat', i)} color="#fff1d0" transparent opacity={0} depthWrite={false} />
              </mesh>
            </group>
          ))}
        </EPart>
      </group>

      {/* Camshaft */}
      <group ref={set('gCam')}>
        <EPart id="cam">
          <group position={[0, 1.08, 0]} ref={set('camRot')}>
            <mesh rotation={X_AXIS}>
              <cylinderGeometry args={[0.035, 0.035, 1.9, 14]} />
              <EMat color="#d8a24a" />
            </mesh>
            {CYLINDERS.map((c) =>
              [-0.085, 0.085].map((dz, j) => (
                <group key={`${c.n}${j}`} position={[c.x, 0, 0]} rotation={[rad(j === 0 ? 20 : 200), 0, 0]}>
                  <mesh position={[0, 0.035, 0]} rotation={X_AXIS}>
                    <cylinderGeometry args={[0.055, 0.055, 0.06, 16]} />
                    <EMat color="#e0b25a" />
                  </mesh>
                </group>
              )),
            )}
          </group>
        </EPart>
      </group>

      {/* Turbocharger */}
      <group ref={set('gTurbo')}>
        <EPart id="turbo">
          <group position={[0, 0.45, 0.82]}>
            <mesh rotation={X_AXIS}>
              <cylinderGeometry args={[0.02, 0.02, 0.6, 10]} />
              <EMat color="#c4c9d0" />
            </mesh>
            {[[-0.24, '#4f8fa3'], [0.24, '#c4584a']].map(([x, col]) => (
              <mesh key={x} position={[x, 0, 0]} rotation={X_AXIS}>
                <cylinderGeometry args={[0.17, 0.17, 0.14, 28]} />
                <EMat color={col} base={0.4} />
              </mesh>
            ))}
            {[['rotorA', -0.24], ['rotorB', 0.24]].map(([name, x]) => (
              <group key={name} position={[x, 0, 0]} ref={set(name)}>
                {Array.from({ length: 8 }, (_, i) => (
                  <mesh key={i} rotation={[(i / 8) * Math.PI * 2, 0, 0]} position={[0, 0, 0]}>
                    <boxGeometry args={[0.1, 0.28, 0.018]} />
                    <EMat color="#e9edf1" />
                  </mesh>
                ))}
              </group>
            ))}
            {[-0.24, 0.24].map((x) => (
              <mesh key={x} position={[x, 0, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.035, 0.035, 0.6, 10]} />
                <EMat color="#8a949f" />
              </mesh>
            ))}
          </group>
        </EPart>
      </group>
    </group>
  )
}
