import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import Car from '../car/Car.jsx'
import HalftoneWordmarkFooter from '@/components/ui/halftone-wordmark-footer'
import { SYSTEMS } from '../data/systems.js'

const _v = new THREE.Vector3()

/** Projects a 3D anchor to screen space every frame and moves the DOM panel there. */
function PanelTracker({ anchor, panelRef }) {
  useFrame(({ camera, size }) => {
    const el = panelRef.current
    if (!el || !anchor) return
    _v.set(...anchor).project(camera)
    const x = (_v.x * 0.5 + 0.5) * size.width
    const y = (-_v.y * 0.5 + 0.5) * size.height
    el.style.transform = `translate(${x}px, ${y}px)`
  })
  return null
}

function Stage() {
  return (
    <Environment resolution={256} background={false}>
      <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.4} position={[-5, 1.5, 0]} scale={[6, 3, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.0} position={[5, 1, 3]} scale={[6, 3, 1]} rotation-y={-Math.PI / 2} color="#ffd9bf" />
    </Environment>
  )
}

const BASE = import.meta.env.BASE_URL

export default function Home() {
  const [hovered, setHovered] = useState(null)
  const [pinned, setPinned] = useState(null)
  const leaveTimer = useRef()
  const panelRef = useRef()
  const panelHover = useRef(false)
  const controlsRef = useRef()
  const zoom = (factor) => {
    const c = controlsRef.current
    if (!c) return
    const off = c.object.position.clone().sub(c.target)
    off.setLength(THREE.MathUtils.clamp(off.length() * factor, 4, 11))
    c.object.position.copy(c.target).add(off)
    c.update()
  }
  const resetView = () => {
    const c = controlsRef.current
    if (!c) return
    c.object.position.set(5.2, 2.3, 5.6)
    c.target.set(0, 0.75, 0)
    c.update()
  }

  const over = useCallback((id) => {
    clearTimeout(leaveTimer.current)
    setHovered(id)
    document.body.style.cursor = 'pointer'
  }, [])
  const out = useCallback(() => {
    document.body.style.cursor = ''
    clearTimeout(leaveTimer.current)
    // Short grace period so the cursor can travel from the part onto the panel.
    leaveTimer.current = setTimeout(() => {
      if (!panelHover.current) setHovered(null)
    }, 320)
  }, [])
  const pick = useCallback((id) => { setPinned(id); setHovered(id) }, [])
  useEffect(() => () => { clearTimeout(leaveTimer.current); document.body.style.cursor = '' }, [])

  const activeId = hovered ?? pinned
  const active = activeId ? SYSTEMS[activeId] : null

  return (
    <div className="page">
    <main className="home">
      <header className="topbar">
        <span className="brand">Anatomy</span>
        <nav className="topnav" aria-label="Systems">
          {['engine', 'brakes', 'suspension'].map((id) => (
            <Link key={id} to={`/explore/${id}`}>{SYSTEMS[id].name}</Link>
          ))}
          <Link to="/systems">All systems</Link>
        </nav>
      </header>

      <section className="hero-copy">
        <h1>Discover how cars work.</h1>
        <p className="hint">Hover over a part, or tap it on a touch screen.</p>
      </section>

      <div className="stage">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [5.2, 2.3, 5.6], fov: 32, near: 0.1, far: 60 }}
          onPointerMissed={() => setPinned(null)}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#0d1116']} />
          <fog attach="fog" args={['#0d1116', 9, 22]} />
          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 6, 3]} intensity={1.3} />
          <Stage />
          <Car hovered={hovered} pinned={pinned} onOver={over} onOut={out} onPick={pick} />
          <ContactShadows position={[0, 0, 0]} opacity={0.55} scale={12} blur={2.4} far={2.5} />
          <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            target={[0, 0.75, 0]}
            enablePan={false}
            enableDamping
            minDistance={4}
            maxDistance={11}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
          {active && <PanelTracker anchor={active.anchor} panelRef={panelRef} />}
        </Canvas>

        {active && (
          <div
            className="panel-anchor"
            ref={panelRef}
            onPointerEnter={() => { panelHover.current = true; clearTimeout(leaveTimer.current) }}
            onPointerLeave={() => { panelHover.current = false; out() }}
          >
            <span className="panel-dot" />
            <div className="panel" role="dialog" aria-label={active.name}>
              <strong>{active.name}</strong>
              <p>{active.blurb}</p>
              <Link className="panel-cta" to={`/explore/${active.id}`}>
                {active.action} →
              </Link>
              {active.status !== 'live' && <small>Simulator in development</small>}
            </div>
          </div>
        )}
      </div>

      <div className="view-controls" role="group" aria-label="Camera">
        <button className="btn" onClick={() => zoom(0.8)} aria-label="Zoom in">+</button>
        <button className="btn" onClick={() => zoom(1.25)} aria-label="Zoom out">−</button>
        <button className="btn" onClick={resetView}>Reset</button>
      </div>
    </main>
    <HalftoneWordmarkFooter
      wordmark="anatomy"
      label="Anatomy"
      meta="How cars work, part by part"
      height="min(72svh, 560px)"
      palette={{ background: '#0d1116', ink: '#ece8df', warm: '#ff7a2f' }}
      fontFamily={'"Bricolage Grotesque", "Inter", system-ui, sans-serif'}
      fontWeight={700}
      dotGap={6}
      columns={[
        { title: 'Explore', links: [{ label: 'The car', href: BASE }, { label: 'All systems', href: `${BASE}systems` }] },
        { title: 'Simulators', links: [{ label: 'Engine', href: `${BASE}explore/engine` }, { label: 'Brakes', href: `${BASE}explore/brakes` }, { label: 'Suspension', href: `${BASE}explore/suspension` }] },
        { title: 'Project', links: [{ label: 'GitHub', href: 'https://github.com/GigaChad-Suryansh/Pieces-2.0' }] },
      ]}
    />
    </div>
  )
}
