import { useMemo } from 'react'
import * as THREE from 'three'
import { Edges } from '@react-three/drei'
import Mat, { EmphasisContext } from './Mat.jsx'

/**
 * A procedural cutaway car. Every system is its own <Part> group, so pointer
 * events hit real geometry (no hand-placed hit boxes). Body panels have no
 * handlers, so they never block the parts inside them.
 *
 * Axes: +x is the front of the car, +y is up, z is across the car.
 */

function Part({ id, hovered, pinned, onOver, onOut, onPick, children }) {
  const level = pinned === id ? 2 : hovered === id ? 1 : 0
  return (
    <group
      onPointerOver={(e) => { e.stopPropagation(); onOver(id) }}
      onPointerOut={() => onOut(id)}
      onClick={(e) => { e.stopPropagation(); onPick(id) }}
    >
      <EmphasisContext.Provider value={level}>{children}</EmphasisContext.Provider>
    </group>
  )
}

function BodyShell() {
  const geometry = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-2.2, 0.36)
    s.lineTo(-2.2, 0.72)
    s.bezierCurveTo(-2.2, 0.86, -1.9, 0.92, -1.5, 0.95)
    s.bezierCurveTo(-1.05, 1.0, -0.75, 1.46, -0.25, 1.5)
    s.lineTo(0.35, 1.5)
    s.bezierCurveTo(0.8, 1.46, 1.0, 1.0, 1.45, 0.96)
    s.bezierCurveTo(1.95, 0.93, 2.2, 0.88, 2.2, 0.7)
    s.lineTo(2.2, 0.36)
    s.lineTo(-2.2, 0.36)
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 1.1, bevelEnabled: true, bevelSize: 0.14, bevelThickness: 0.14, bevelSegments: 5, curveSegments: 32,
    })
    g.translate(0, 0, -0.55)
    return g
  }, [])
  return (
    <mesh geometry={geometry}>
      <meshPhysicalMaterial color="#b7c4d2" metalness={0.5} roughness={0.18} transparent opacity={0.13} depthWrite={false} side={THREE.DoubleSide} />
      <Edges threshold={28} color="#8fa3b8" />
    </mesh>
  )
}

function Wheel({ x, z }) {
  return (
    <group position={[x, 0.38, z]}>
      <mesh rotation={[0, 0, 0]}>
        <torusGeometry args={[0.31, 0.09, 20, 48]} />
        <meshStandardMaterial color="#1a1f26" roughness={0.9} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.24, 0.015, 8, 48]} />
        <meshStandardMaterial color="#aab4c0" metalness={0.9} roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
          <boxGeometry args={[0.5, 0.025, 0.025]} />
          <meshStandardMaterial color="#aab4c0" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Engine() {
  return (
    <group position={[1.7, 0.8, 0]}>
      <mesh>
        <boxGeometry args={[0.85, 0.5, 0.55]} />
        <Mat color="#7c8794" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.1, 0.5]} />
        <Mat color="#4b5562" metalness={0.5} roughness={0.5} />
      </mesh>
      {[-0.3, -0.1, 0.1, 0.3].map((x) => (
        <mesh key={x} position={[x, 0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
          <Mat color="#c9d1da" metalness={0.8} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[0, 0.1, 0.34]}>
        <boxGeometry args={[0.7, 0.14, 0.12]} />
        <Mat color="#59646f" />
      </mesh>
    </group>
  )
}

function Transmission() {
  return (
    <group position={[0.85, 0.62, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.17, 0.8, 28]} />
        <Mat color="#8b96a3" metalness={0.7} roughness={0.38} />
      </mesh>
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.24, 0.24, 0.12, 28]} />
        <Mat color="#5a6572" />
      </mesh>
      <mesh position={[-0.95, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.1, 12]} />
        <Mat color="#aeb8c4" metalness={0.85} roughness={0.3} />
      </mesh>
    </group>
  )
}

function Brakes() {
  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[1.45, 0.38, 0.69 * side]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.26, 0.26, 0.03, 40]} />
            <Mat color="#9a8f86" metalness={0.8} roughness={0.35} />
          </mesh>
          <mesh position={[0.2, 0.0, 0]}>
            <boxGeometry args={[0.13, 0.12, 0.13]} />
            <Mat color="#d94a3a" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function Suspension() {
  return (
    <>
      {[-1, 1].map((side) => (
        <group key={side} position={[-1.15, 0.62, 0.55 * side]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
            <Mat color="#d7dde4" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh>
            <torusKnotGeometry args={[0.09, 0.012, 160, 8, 6, 1]} />
            <Mat color="#e0a63a" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0.18, -0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.62, 10]} />
            <Mat color="#68747f" />
          </mesh>
        </group>
      ))}
    </>
  )
}

function ElectricMotor() {
  return (
    <group>
      <group position={[-1.45, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 0.5, 32]} />
          <Mat color="#4f8fa3" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.205, 0.205, 0.08, 32]} />
          <Mat color="#c97b3a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>
      <mesh position={[-1.45, 0.78, 0]}>
        <boxGeometry args={[0.28, 0.14, 0.3]} />
        <Mat color="#33414d" />
      </mesh>
      <mesh position={[-0.4, 0.3, 0]}>
        <boxGeometry args={[1.7, 0.1, 0.8]} />
        <Mat color="#3a6c7d" metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

function ElectricalSystem() {
  return (
    <group position={[1.2, 0.8, -0.45]}>
      <mesh>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <Mat color="#2d3b8a" metalness={0.3} roughness={0.6} />
      </mesh>
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.12, 0.05]}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 12]} />
          <Mat color="#d6dbe0" />
        </mesh>
      ))}
    </group>
  )
}

function Cooling() {
  return (
    <group position={[2.2, 0.72, 0]}>
      <mesh>
        <boxGeometry args={[0.08, 0.5, 0.82]} />
        <Mat color="#3b4452" metalness={0.5} roughness={0.55} />
      </mesh>
      {[-0.18, -0.06, 0.06, 0.18].map((y) => (
        <mesh key={y} position={[0.05, y, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.78]} />
          <Mat color="#8fa0b3" />
        </mesh>
      ))}
    </group>
  )
}

function Steering() {
  return (
    <group>
      <group position={[0.45, 1.0, 0.35]} rotation={[0, 0, -0.5]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.17, 0.022, 12, 40]} />
          <Mat color="#2c323a" metalness={0.2} roughness={0.7} />
        </mesh>
      </group>
      <mesh position={[0.68, 0.68, 0.35]} rotation={[0, 0, -0.5 + 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.7, 10]} />
        <Mat color="#a7b1bd" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[1.2, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 1.2, 12]} />
        <Mat color="#b6bfca" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

export default function Car({ hovered, pinned, onOver, onOut, onPick }) {
  const p = { hovered, pinned, onOver, onOut, onPick }
  return (
    <group>
      <BodyShell />
      {[1.45, -1.45].flatMap((x) => [-0.8, 0.8].map((z) => <Wheel key={`${x}${z}`} x={x} z={z} />))}
      <Part id="engine" {...p}><Engine /></Part>
      <Part id="transmission" {...p}><Transmission /></Part>
      <Part id="brakes" {...p}><Brakes /></Part>
      <Part id="suspension" {...p}><Suspension /></Part>
      <Part id="electric-motor" {...p}><ElectricMotor /></Part>
      <Part id="electrical-system" {...p}><ElectricalSystem /></Part>
      <Part id="cooling" {...p}><Cooling /></Part>
      <Part id="steering" {...p}><Steering /></Part>
    </group>
  )
}
