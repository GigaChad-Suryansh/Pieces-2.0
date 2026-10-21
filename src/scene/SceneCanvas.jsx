import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import Car from '../car/Car.jsx'
import { scene } from './state.js'

const _v = new THREE.Vector3()
const isMobileWidth = (w) => w < 820

/** Flies the camera to the current scroll stop, and backs off on tall (phone) screens. */
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
    const aspect = size.width / size.height
    // On a portrait screen the horizontal field of view is narrow, so pull the camera back to keep the car in frame.
    const back = Math.min(2.4, Math.max(1, (1.5 / aspect) ** 0.6))
    const t = scene.target
    const wantX = t[0] + (scene.pos[0] - t[0]) * back + mouse.current.x * 0.6
    const wantY = t[1] + (scene.pos[1] - t[1]) * back - mouse.current.y * 0.35
    const wantZ = t[2] + (scene.pos[2] - t[2]) * back
    camera.position.x += (wantX - camera.position.x) * k
    camera.position.y += (wantY - camera.position.y) * k
    camera.position.z += (wantZ - camera.position.z) * k
    look.current.x += (t[0] - look.current.x) * k
    look.current.y += (t[1] - look.current.y) * k
    look.current.z += (t[2] - look.current.z) * k
    camera.lookAt(look.current)
    const mobile = isMobileWidth(size.width)
    const sx = mobile ? 0 : scene.shift
    const sy = mobile ? scene.shiftY : 0
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

export default function SceneCanvas({ hovered, pinned, onOver, onOut, onPick, onMissed, panelAnchor, panelRef }) {
  return (
    <Canvas
      dpr={[1, window.innerWidth < 820 ? 1.5 : 2]}
      camera={{ position: [5.6, 2.5, 6.0], fov: 32, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y' }}
      onPointerMissed={onMissed}
    >
      <CameraRig />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 3]} intensity={1.2} />
      <Stage />
      <Car hovered={hovered} pinned={pinned} onOver={onOver} onOut={onOut} onPick={onPick} />
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={12} blur={2.6} far={2.5} color="#0b1a15" />
      {panelAnchor && <PanelTracker anchor={panelAnchor} panelRef={panelRef} />}
    </Canvas>
  )
}
