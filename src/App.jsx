import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import { SYSTEMS } from './data/systems.js'
import { useParams } from 'react-router-dom'

const Explore = lazy(() => import('./pages/Explore.jsx'))

function ExploreRoute() {
  const { system } = useParams()
  if (!SYSTEMS[system]) return <Navigate to="/" replace />
  return (
    <Suspense fallback={<div className="loading">Loading simulator…</div>}>
      <Explore system={SYSTEMS[system]} />
    </Suspense>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore/:system" element={<ExploreRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
