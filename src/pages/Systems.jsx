import { Link } from 'react-router-dom'
import { BatteryCharging, Cog, Compass, Disc3, Settings2, ArrowUpDown, Thermometer, Zap } from 'lucide-react'
import PerspectiveTunnelHero from '@/components/ui/perspective-tunnel-hero'
import { SYSTEM_LIST } from '../data/systems.js'

const ICONS = {
  engine: Cog,
  transmission: Settings2,
  brakes: Disc3,
  suspension: ArrowUpDown,
  'electric-motor': Zap,
  'electrical-system': BatteryCharging,
  cooling: Thermometer,
  steering: Compass,
}
const HUES = { engine: 22, transmission: 215, brakes: 8, suspension: 42, 'electric-motor': 185, 'electrical-system': 235, cooling: 170, steering: 280 }

const items = SYSTEM_LIST.map((s) => {
  const Icon = ICONS[s.id]
  return {
    id: s.id,
    title: s.name,
    caption: s.status === 'live' ? s.blurb : `${s.blurb} (simulator in development)`,
    to: `/explore/${s.id}`,
    hue: HUES[s.id],
    icon: <Icon strokeWidth={1.5} aria-hidden="true" />,
  }
})

export default function Systems() {
  return (
    <main className="systems-page">
      <Link className="back systems-back" to="/">← Back to car</Link>
      <PerspectiveTunnelHero items={items} title={<>INTO THE<br />MACHINE.</>} kicker="Every system in the car" />
    </main>
  )
}
