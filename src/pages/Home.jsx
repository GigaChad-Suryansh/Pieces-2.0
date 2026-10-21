import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import HalftoneWordmarkFooter from '@/components/ui/halftone-wordmark-footer'
import { ENGINE_SIMULATOR_URL, SYSTEMS, TOUR } from '../data/systems.js'
import { scene, useScrollScene } from '../scene/state.js'

const SceneCanvas = lazy(() => import('../scene/SceneCanvas.jsx'))

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
        <Suspense fallback={null}>
          <SceneCanvas
            hovered={hovered}
            pinned={glow}
            onOver={over}
            onOut={out}
            onPick={pick}
            onMissed={() => setTapped(null)}
            panelAnchor={panel?.anchor}
            panelRef={panelRef}
          />
        </Suspense>

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
