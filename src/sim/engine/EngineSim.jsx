import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import EngineModel from './EngineModel.jsx'
import { ENGINE_PARTS, STROKES } from './parts.js'
import { CYLINDERS, cyclePhase, performance, strokeName } from './physics.js'
import { simState, useSim } from './store.js'

const HOME_CAM = [2.6, 1.7, 3.1]
const TARGET = [0, 0.45, 0]

function useLive(ms = 90) {
  const [theta, setTheta] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTheta(simState.theta), ms)
    return () => clearInterval(id)
  }, [ms])
  return theta
}

function Controls() {
  const s = useSim()
  const { torque, power, boostBar } = performance(s.rpm, s.throttle, s.turbo)
  return (
    <section className="card" aria-label="Controls">
      <h2>Controls</h2>
      <div className="row">
        <button className={`btn ${s.running ? 'on' : ''}`} onClick={() => s.set({ running: !s.running })}>
          {s.running ? 'Running' : 'Stopped'}
        </button>
        <button className={`btn ${s.turbo ? 'on' : ''}`} onClick={() => s.set({ turbo: !s.turbo })} aria-pressed={s.turbo}>
          Turbo {s.turbo ? 'on' : 'off'}
        </button>
      </div>
      <label className="slider">
        <span>Engine speed <b>{Math.round(s.rpm)} rpm</b></span>
        <input type="range" min="800" max="6500" step="50" value={s.rpm} onChange={(e) => s.set({ rpm: +e.target.value })} />
      </label>
      <label className="slider">
        <span>Throttle <b>{Math.round(s.throttle * 100)}%</b></span>
        <input type="range" min="0" max="1" step="0.01" value={s.throttle} onChange={(e) => s.set({ throttle: +e.target.value })} />
      </label>
      <label className="slider">
        <span>Playback speed <b>{(s.timeScale * 100).toFixed(0)}%</b></span>
        <input type="range" min="0.01" max="0.3" step="0.01" value={s.timeScale} onChange={(e) => s.set({ timeScale: +e.target.value })} />
      </label>
      <label className="slider">
        <span>Exploded view <b>{Math.round(s.explode * 100)}%</b></span>
        <input type="range" min="0" max="1" step="0.01" value={s.explode} onChange={(e) => s.set({ explode: +e.target.value })} />
      </label>
      <dl className="readout">
        <div><dt>Torque</dt><dd>{torque.toFixed(0)} Nm</dd></div>
        <div><dt>Power</dt><dd>{power.toFixed(0)} kW</dd></div>
        <div><dt>Boost</dt><dd>{boostBar.toFixed(2)} bar</dd></div>
      </dl>
      <p className="note">Playback is slowed so you can follow each stroke. Output is an estimate for a typical 1.6 L four-cylinder.</p>
    </section>
  )
}

function Explorer() {
  const selected = useSim((s) => s.selected)
  const isolate = useSim((s) => s.isolate)
  const search = useSim((s) => s.search)
  const set = useSim((s) => s.set)
  const list = ENGINE_PARTS.filter((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()))
  return (
    <section className="card" aria-label="Components">
      <h2>Components</h2>
      <input
        className="search" type="search" placeholder="Find a part" value={search}
        onChange={(e) => set({ search: e.target.value })} aria-label="Find a part"
      />
      <ul className="parts">
        {list.map((p) => (
          <li key={p.id}>
            <button
              className={selected === p.id ? 'sel' : ''}
              onClick={() => set({ selected: selected === p.id ? null : p.id })}
              onMouseEnter={() => set({ hovered: p.id })}
              onMouseLeave={() => set({ hovered: null })}
            >
              <i style={{ background: p.color }} />{p.name}
            </button>
          </li>
        ))}
        {list.length === 0 && <li className="empty">No part matches. Clear the search to see all parts.</li>}
      </ul>
      <label className="check">
        <input type="checkbox" checked={isolate} onChange={(e) => set({ isolate: e.target.checked })} disabled={!selected} />
        Isolate selected part
      </label>
    </section>
  )
}

function Info() {
  const selected = useSim((s) => s.selected)
  const theta = useLive()
  const part = ENGINE_PARTS.find((p) => p.id === selected)
  return (
    <>
      <section className="card" aria-label="Part information">
        {part ? (
          <>
            <h2>{part.name}</h2>
            <p>{part.role}</p>
            <h3>How it works</h3>
            <p>{part.how}</p>
            <ul className="facts">{part.facts.map((f) => <li key={f}>{f}</li>)}</ul>
          </>
        ) : (
          <>
            <h2>Select a part</h2>
            <p>Click any part in the model or pick one from the list. Selected parts glow, and you can isolate them to see how they move.</p>
          </>
        )}
      </section>
      <section className="card" aria-label="Four-stroke cycle">
        <h2>Four-stroke cycle</h2>
        <ul className="cycle">
          {CYLINDERS.map((c) => {
            const phi = cyclePhase(theta, c.phase)
            const name = strokeName(phi)
            return (
              <li key={c.n} className={`stroke-${name.toLowerCase()}`}>
                <span>Cylinder {c.n}</span>
                <span className="bar"><span style={{ width: `${(phi % 180) / 1.8}%` }} /></span>
                <b>{name}</b>
              </li>
            )
          })}
        </ul>
        <p className="note">{STROKES[strokeName(cyclePhase(theta, 0))]} <em>(cylinder 1)</em></p>
        <p className="note">Crank angle {Math.round(theta)}° of 720°. Firing order 1-3-4-2.</p>
      </section>
    </>
  )
}

export default function EngineSim() {
  const controls = useRef()
  const resetCamera = () => {
    const c = controls.current
    if (!c) return
    c.object.position.set(...HOME_CAM)
    c.target.set(...TARGET)
    c.update()
  }
  useEffect(() => {
    useSim.getState().set({ selected: null, hovered: null, explode: 0, isolate: false })
  }, [])

  return (
    <div className="lab-body">
      <div className="viewport">
        <Canvas dpr={[1, 2]} camera={{ position: HOME_CAM, fov: 34, near: 0.1, far: 50 }} onPointerMissed={() => useSim.getState().set({ selected: null })}>
          <color attach="background" args={['#0d1116']} />
          <ambientLight intensity={0.4} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} />
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={2.4} position={[0, 5, 2]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
            <Lightformer form="rect" intensity={1.4} position={[-5, 1.5, 0]} scale={[6, 3, 1]} rotation-y={Math.PI / 2} />
            <Lightformer form="rect" intensity={1.0} position={[5, 1, 3]} scale={[6, 3, 1]} rotation-y={-Math.PI / 2} color="#ffd9bf" />
          </Environment>
          <EngineModel />
          <ContactShadows position={[0, -0.75, 0]} opacity={0.5} scale={8} blur={2.5} far={2.5} />
          <OrbitControls ref={controls} target={TARGET} enableDamping enablePan minDistance={1.6} maxDistance={9} />
        </Canvas>
        <div className="view-tools">
          <button className="btn" onClick={resetCamera}>Reset camera</button>
        </div>
      </div>
      <aside className="side left"><Controls /><Explorer /></aside>
      <aside className="side right"><Info /></aside>
    </div>
  )
}
