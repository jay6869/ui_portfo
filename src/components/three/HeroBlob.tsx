import { useEffect, useRef } from 'react'
import {
  IcosahedronGeometry,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { gsap } from '@/engine/gsap'
import { vertexShader, fragmentShader } from './blobShaders'
import s from './HeroBlob.module.css'

/**
 * Slow, soft displaced sphere. Custom shader: simplex-noise displacement, lambert shading in
 * charcoal/bone, clay fresnel rim, screen-space grain. Follows the cursor with inertia.
 * Renders on gsap.ticker (the one loop), pauses off-screen / in background tabs, and disposes
 * every GPU resource on unmount.
 */
export default function HeroBlob() {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const blobHost = el.parentElement

    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      return // stay on the SVG fallback
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)

    const scene = new Scene()
    const camera = new PerspectiveCamera(30, 1, 0.1, 20)
    camera.position.z = 5.2

    const geometry = new IcosahedronGeometry(1, 48)
    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new Vector2(0, 0) },
      uResolution: { value: new Vector2(1, 1) },
      uAmp: { value: 0.13 },
    }
    const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms })
    const mesh = new Mesh(geometry, material)
    scene.add(mesh)

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      uniforms.uResolution.value.set(
        width * renderer.getPixelRatio(),
        height * renderer.getPixelRatio(),
      )
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    // Pointer with inertia (normalised -1..1 over the whole viewport)
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1
      target.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })

    let last = performance.now()
    let visible = true
    const render = () => {
      if (!visible || document.hidden) return
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      uniforms.uTime.value += dt
      const k = 1 - Math.pow(0.04, dt) // frame-rate independent easing
      current.x += (target.x - current.x) * k
      current.y += (target.y - current.y) * k
      uniforms.uPointer.value.set(current.x, current.y)
      mesh.rotation.y = current.x * 0.45 + uniforms.uTime.value * 0.05
      mesh.rotation.x = -current.y * 0.3
      mesh.position.x = current.x * 0.12
      mesh.position.y = current.y * 0.08
      renderer.render(scene, camera)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting
      if (visible) last = performance.now()
    })
    io.observe(el)
    gsap.ticker.add(render)

    // Fade in over the SVG fallback once the first frame is drawn
    requestAnimationFrame(() => blobHost?.setAttribute('data-blob', 'ready'))

    return () => {
      gsap.ticker.remove(render)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      blobHost?.removeAttribute('data-blob')
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={host} className={s.host} />
}
