import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { SYSTEMS } from '../data/systems.js'

const EngineSim = lazy(() => import('../sim/engine/EngineSim.jsx'))

// Add a simulator here as it is built. Anything not listed gets the preview page.
const SIMULATORS = { engine: EngineSim }

function LabHeader({ system }) {
  return (
    <header className="lab-header">
      <Link className="back" to="/">← Back to car</Link>
      <h1>{system.name}</h1>
      <nav className="related" aria-label="Related systems">
        {system.related.map((id) => (
          <Link key={id} to={`/explore/${id}`}>{SYSTEMS[id].name}</Link>
        ))}
      </nav>
    </header>
  )
}

function Preview({ system }) {
  return (
    <div className="preview">
      <p className="lead">{system.blurb}</p>
      <h2>What the simulator will cover</h2>
      <ul className="facts">
        {system.parts.map(([name, text]) => (
          <li key={name}><b>{name}.</b> {text}</li>
        ))}
      </ul>
      <p className="note">This simulator is not built yet. The engine simulator is the first one available.</p>
      <Link className="panel-cta" to="/explore/engine">Open the engine simulator</Link>
    </div>
  )
}

export default function Explore({ system }) {
  const Sim = SIMULATORS[system.id]
  return (
    <div className="lab">
      <LabHeader system={system} />
      {Sim ? (
        <Suspense fallback={<div className="loading">Loading simulator…</div>}>
          <Sim />
        </Suspense>
      ) : (
        <Preview system={system} />
      )}
    </div>
  )
}
