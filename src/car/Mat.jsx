import { createContext, useContext, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Level of emphasis for the part currently being drawn: 0 idle, 1 hovered, 2 selected.
export const EmphasisContext = createContext(0)

const EMBER = new THREE.Color('#ffa63d')

/** Physical material that glows when its parent Part is hovered or selected. */
export default function Mat({ color = '#9aa7b5', metalness = 0.6, roughness = 0.35, opacity = 1, ...rest }) {
  const level = useContext(EmphasisContext)
  const ref = useRef()
  useFrame((_, dt) => {
    const m = ref.current
    if (!m) return
    const target = level === 2 ? 0.22 : level === 1 ? 0.5 : 0
    m.emissiveIntensity = THREE.MathUtils.damp(m.emissiveIntensity, target, 12, dt)
  })
  return (
    <meshStandardMaterial
      ref={ref}
      color={color}
      metalness={metalness}
      roughness={roughness}
      transparent={opacity < 1}
      opacity={opacity}
      emissive={EMBER}
      emissiveIntensity={0}
      {...rest}
    />
  )
}
