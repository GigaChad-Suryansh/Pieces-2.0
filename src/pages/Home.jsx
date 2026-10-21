import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { motion, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import Car from '../car/Car.jsx'
import HalftoneWordmarkFooter from '@/components/ui/halftone-wordmark-footer'
import { ENGINE_SIMULATOR_URL, SYSTEMS, TOUR } from '../data/systems.js'
import { scene, useScrollScene } from '../scene/state.js'

const _v = new THREE.Vector3()

/** Flies the camera to the current scroll stop. */
function CameraRig() {
  const look = useRef(new THREE.Vector3(0, 0.75, 0))
  const mouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const move = (e) => { mouse.current.x = e.clientX / window.innerWidth - 0.5; mouse.current.y = e.clientY / window.innerHeight - 0.5 }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  useFrame(({ camera, size }, dt) => {
    const k = 1 - Math.exp(-4.5 * dt)
    const p = scene.pos
    camera.position.x += (p[0] + mouse.current.x * 0.6 - camera.position.x) * k
    camera.position.y += (p[1] - mouse.current.y * 0.35 - camera.position.y) * k
    camera.position.z += (p[2] - camera.position.z) * k
    look.current.x += (scene.target[0] - look.current.x) * k
    look.current.y += (scene.target[1] - look.current.y) * k
    look.current.z += (scene.target[2] - look.current.z) * k
    camera.lookAt(look.current)
    const mobile = size.width < 820
    const sx = mobile ? 0 : scene.shift
    const sy = mobile ? 0.17 : 0
    if (sx || sy) camera.setViewOffset(size.width, size.height, -sx * size.width, sy * size.height, size.width, size.height)
    else camera.clearViewOffset()
  })
  return null
}

/** Keeps the hover panel pinned to a point on the car, in screen space. */
function PanelTracker({ anchor, panelRef }) {
  useFrame(({ camera, size }) => {
    const el = panelRef.current
    if (!el || !anchor) return
    _v.set(...anchor).project(camera)
    el.style.transform = `translate(${(_v.x * 0.5 + 0.5) * size.width}px, ${(-_v.y * 0.5 + 0.5) * size.height}px)`
  })
  return null
}

function Stage() {
  return (
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={2.4} position={[0, 5, 2]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.5} position={[-5, 1.5, 0]} scale={[6, 3, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.1} position={[5, 1, 3]} scale={[6, 3, 1]} rotation-y={-Math.PI / 2} color="#ffe2c0" />
    </Environment>
  )
}

function Cta({ system, className = '' }) {
  if (system.url) {
    return (
      <a className={`cta ${className}`} href={system.url} target="_blank" rel="noopener noreferrer">
        {system.action} →
      </a>
    )
  }
  return <span className={`cta soon ${className}`}>{system.name} simulator coming soon</span>
}

const reveal = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { amount: 0.35 },
  transition: { duration: 0.7, ease: [0.2, 0.7, 0.1, 1] },
}

export default function Home() {
  const rootRef = useRef()
  const [hovered, setHovered] = useState(null)
  const [tapped, setTapped] = useState(null)
  const [active, setActive] = useState('hero')
  const leaveTimer = useRef()
  const panelRef = useRef()
  const panelHover = useRef(false)

  useScrollScene(rootRef, setActive)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0])
  const heroShift = useTransform(scrollY, [0, 380], [0, -60])

  const over = useCallback((id) => {
    clearTimeout(leaveTimer.current)
    setHovered(id)
    document.body.style.cursor = 'pointer'
  }, [])
  const out = useCallback(() => {
    document.body.style.cursor = ''
    clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => { if (!panelHover.current) setHovered(null) }, 320)
  }, [])
  const pick = useCallback((id) => { setTapped(id); setHovered(id) }, [])
  useEffect(() => () => { clearTimeout(leaveTimer.current); document.body.style.cursor = '' }, [])

  const panelId = hovered ?? tapped
  const panel = panelId ? SYSTEMS[panelId] : null
  const glow = SYSTEMS[active] ? active : null // the tour stop's part glows

  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  return (
    <div className="site" ref={rootRef}>
      <div className="canvas-layer">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [5.6, 2.5, 6.0], fov: 32, near: 0.1, far: 60 }}
          gl={{ antialias: true, alpha: true }}
          style={{ touchAction: 'pan-y' }}
          onPointerMissed={() => setTapped(null)}
        >
          <CameraRig />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 3]} intensity={1.2} />
          <Stage />
          <Car hovered={hovered} pinned={glow} onOver={over} onOut={out} onPick={pick} />
          <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={12} blur={2.6} far={2.5} color="#0b1a15" />
          {panel && <PanelTracker anchor={panel.anchor} panelRef={panelRef} />}
        </Canvas>

        {panel && (
          <div
            className="panel-anchor"
            ref={panelRef}
            onPointerEnter={() => { panelHover.current = true; clearTimeout(leaveTimer.current) }}
            onPointerLeave={() => { panelHover.current = false; out() }}
          >
            <span className="panel-dot" />
            <div className="panel" role="dialog" aria-label={panel.name}>
              <strong>{panel.name}</strong>
              <p>{panel.blurb}</p>
              <Cta system={panel} />
            </div>
          </div>
        )}
      </div>

      <header className="topbar">
        <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Anatomy</a>
        <a className="topnav" href={ENGINE_SIMULATOR_URL} target="_blank" rel="noopener noreferrer">Engine simulator</a>
      </header>

      <nav className="rail" aria-label="Tour">
        {TOUR.map((id) => (
          <button key={id} className={active === id ? 'on' : ''} onClick={() => jump(id)} aria-label={SYSTEMS[id].name}>
            <span>{SYSTEMS[id].name}</span>
          </button>
        ))}
      </nav>

      <main className="story" id="top">
        <section className="screen hero" data-scene>
          <motion.div className="hero-copy" style={{ opacity: heroOpacity, y: heroShift }}>
            <h1>Discover how cars work.</h1>
            <p>Scroll to tour the car part by part, or hover any part to see what it does.</p>
          </motion.div>
          <div className="scroll-cue" aria-hidden="true"><i /></div>
        </section>

        {TOUR.map((id, i) => {
          const s = SYSTEMS[id]
          return (
            <section key={id} id={id} data-scene className={`screen tour ${i % 2 ? 'right' : 'left'}`}>
              <motion.div className="tour-copy" {...reveal}>
                <h2>{s.name}</h2>
                <p className="lead">{s.blurb}</p>
                <dl>
                  {s.parts.map(([name, text]) => (
                    <div key={name}><dt>{name}</dt><dd>{text}</dd></div>
                  ))}
                </dl>
                <Cta system={s} />
              </motion.div>
            </section>
          )
        })}

        <section className="screen finale" id="finale" data-scene>
          <motion.div className="finale-copy" {...reveal}>
            <h2>Start with the engine.</h2>
            <p className="lead">Run it, slow each stroke down, and take it apart in our engine simulator.</p>
            <a className="cta big" href={ENGINE_SIMULATOR_URL} target="_blank" rel="noopener noreferrer">Open the engine simulator →</a>
          </motion.div>
        </section>
      </main>

      <HalftoneWordmarkFooter
        wordmark="anatomy"
        label="Anatomy"
        meta="How cars work, part by part"
        height="min(72svh, 560px)"
        palette={{ background: '#14302a', ink: '#f3ead7', warm: '#d9a441' }}
        fontFamily={'"Fraunces", Georgia, serif'}
        fontWeight={800}
        dotGap={6}
        columns={[
          { title: 'Tour', links: [{ label: 'Engine', href: '#engine' }, { label: 'Brakes', href: '#brakes' }, { label: 'Suspension', href: '#suspension' }] },
          { title: 'Simulators', links: [{ label: 'Engine', href: ENGINE_SIMULATOR_URL }] },
          { title: 'Project', links: [{ label: 'GitHub', href: 'https://github.com/GigaChad-Suryansh/Pieces-2.0' }] },
        ]}
      />
    </div>
  )
}
