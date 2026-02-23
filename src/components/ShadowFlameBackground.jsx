import React, { useRef, useEffect, useCallback } from 'react'

/**
 * ShadowFlameBackground
 *
 * Full-screen animated background using Canvas API.
 * Three layered systems rendered on a single canvas:
 *   1. Shadow flames — slow-rising, undulating violet/cyan wisps
 *   2. Smoke — large blurred shapes drifting upward
 *   3. Particles — tiny luminous dots with vertical drift
 *
 * Performance:
 *   - Single canvas, single rAF loop
 *   - GPU-composited via will-change + translateZ
 *   - Auto-pauses when `paused` prop is true (during heavy batch)
 *   - All objects pooled, zero allocation in render loop
 */

// --- Configuration ---
const CONFIG = {
  // Flames
  flameCount: 18,
  flameMinHeight: 60,
  flameMaxHeight: 200,
  flameMinWidth: 30,
  flameMaxWidth: 90,
  flameSpeed: 0.15,        // vertical rise px/frame
  flameWobble: 0.003,      // oscillation frequency
  flameWobbleAmp: 12,      // oscillation amplitude px

  // Smoke
  smokeCount: 6,
  smokeMinRadius: 80,
  smokeMaxRadius: 200,
  smokeSpeed: 0.08,
  smokeOpacity: 0.04,

  // Particles
  particleCount: 40,
  particleMinSize: 1,
  particleMaxSize: 2.5,
  particleSpeed: 0.2,
  particleDrift: 0.3,

  // Colors
  violetR: 124, violetG: 58, violetB: 237,
  cyanR: 34, cyanG: 211, cyanB: 238,
}

// --- Object factories ---
function createFlame(w, h) {
  return {
    x: Math.random() * w,
    y: h + Math.random() * 100,
    baseX: 0, // set after x
    width: CONFIG.flameMinWidth + Math.random() * (CONFIG.flameMaxWidth - CONFIG.flameMinWidth),
    height: CONFIG.flameMinHeight + Math.random() * (CONFIG.flameMaxHeight - CONFIG.flameMinHeight),
    speed: CONFIG.flameSpeed + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
    wobbleFreq: CONFIG.flameWobble + Math.random() * 0.002,
    opacity: 0.02 + Math.random() * 0.04,
    isCyan: Math.random() < 0.2, // 20% chance of cyan tint
    layer: Math.floor(Math.random() * 3), // 0=back, 1=mid, 2=front
  }
}

function createSmoke(w, h) {
  return {
    x: Math.random() * w,
    y: h * 0.6 + Math.random() * h * 0.5,
    radius: CONFIG.smokeMinRadius + Math.random() * (CONFIG.smokeMaxRadius - CONFIG.smokeMinRadius),
    speed: CONFIG.smokeSpeed + Math.random() * 0.04,
    opacity: CONFIG.smokeOpacity * (0.5 + Math.random() * 0.5),
    drift: (Math.random() - 0.5) * 0.2,
  }
}

function createParticle(w, h) {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: CONFIG.particleMinSize + Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize),
    speed: CONFIG.particleSpeed + Math.random() * 0.15,
    drift: (Math.random() - 0.5) * CONFIG.particleDrift,
    opacity: Math.random(),
    opacitySpeed: 0.005 + Math.random() * 0.01,
    opacityDir: 1,
    isCyan: Math.random() < 0.3,
  }
}

// --- Reset object when it leaves viewport ---
function resetFlame(f, w, h) {
  f.x = Math.random() * w
  f.baseX = f.x
  f.y = h + 20 + Math.random() * 60
  f.phase = Math.random() * Math.PI * 2
  f.opacity = 0.02 + Math.random() * 0.04
}

function resetSmoke(s, w, h) {
  s.x = Math.random() * w
  s.y = h + s.radius
  s.drift = (Math.random() - 0.5) * 0.2
}

function resetParticle(p, w, h) {
  p.x = Math.random() * w
  p.y = h + 5
  p.opacity = 0
  p.opacityDir = 1
}

export default function ShadowFlameBackground({ paused = false, pulseActive = false }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    flames: [],
    smokes: [],
    particles: [],
    animId: null,
    pulse: 0,        // 0 = no pulse, decays to 0
    pulseTarget: 0,
  })

  // Initialize objects
  const initObjects = useCallback((w, h) => {
    const s = stateRef.current
    s.flames = Array.from({ length: CONFIG.flameCount }, () => {
      const f = createFlame(w, h)
      f.baseX = f.x
      // Spread initial positions across viewport height
      f.y = Math.random() * (h + 200)
      return f
    })
    // Sort by layer for proper depth ordering
    s.flames.sort((a, b) => a.layer - b.layer)

    s.smokes = Array.from({ length: CONFIG.smokeCount }, () => {
      const sm = createSmoke(w, h)
      sm.y = Math.random() * h
      return sm
    })
    s.particles = Array.from({ length: CONFIG.particleCount }, () => createParticle(w, h))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const state = stateRef.current

    let w = window.innerWidth
    let h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap at 2x for performance

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    initObjects(w, h)
    window.addEventListener('resize', resize)

    let lastTime = 0

    const render = (time) => {
      state.animId = requestAnimationFrame(render)

      // Throttle to ~30fps when paused to save resources
      if (paused) {
        if (time - lastTime < 33) return
      }
      lastTime = time

      // Pulse decay
      if (state.pulse > 0) {
        state.pulse *= 0.97
        if (state.pulse < 0.005) state.pulse = 0
      }

      ctx.clearRect(0, 0, w, h)

      // --- 1. Smoke layer (behind everything) ---
      for (const s of state.smokes) {
        s.y -= s.speed
        s.x += s.drift

        if (s.y + s.radius < -50) resetSmoke(s, w, h)

        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius)
        grad.addColorStop(0, `rgba(${CONFIG.violetR}, ${CONFIG.violetG}, ${CONFIG.violetB}, ${s.opacity})`)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        ctx.beginPath()
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()
      }

      // --- 2. Flames ---
      for (const f of state.flames) {
        f.y -= f.speed * (paused ? 0.3 : 1)
        f.phase += f.wobbleFreq
        f.x = f.baseX + Math.sin(f.phase) * CONFIG.flameWobbleAmp

        // Fade out as flame rises
        const lifeRatio = f.y / h
        const fadeOpacity = f.opacity * Math.max(0, lifeRatio)

        if (f.y + f.height < -50) resetFlame(f, w, h)

        const r = f.isCyan ? CONFIG.cyanR : CONFIG.violetR
        const g = f.isCyan ? CONFIG.cyanG : CONFIG.violetG
        const b = f.isCyan ? CONFIG.cyanB : CONFIG.violetB

        // Flame gradient — bottom bright, top transparent
        const grad = ctx.createLinearGradient(f.x, f.y, f.x, f.y - f.height)
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${fadeOpacity})`)
        grad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${fadeOpacity * 0.5})`)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')

        // Draw flame as elongated ellipse
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.scale(1, f.height / f.width)
        ctx.beginPath()
        ctx.arc(0, 0, f.width * 0.5, 0, Math.PI * 2)
        ctx.restore()

        ctx.fillStyle = grad
        ctx.fill()

        // Layer-based blur simulation — back layers get larger, more transparent
        if (f.layer === 0) {
          const glowGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.width * 1.5)
          glowGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${fadeOpacity * 0.3})`)
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
          ctx.beginPath()
          ctx.arc(f.x, f.y, f.width * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = glowGrad
          ctx.fill()
        }
      }

      // --- 3. Particles ---
      for (const p of state.particles) {
        p.y -= p.speed * (paused ? 0.2 : 1)
        p.x += p.drift

        // Opacity fluctuation
        p.opacity += p.opacitySpeed * p.opacityDir
        if (p.opacity >= 1) { p.opacity = 1; p.opacityDir = -1 }
        if (p.opacity <= 0) { p.opacity = 0; p.opacityDir = 1 }

        if (p.y < -10) resetParticle(p, w, h)

        const r = p.isCyan ? CONFIG.cyanR : CONFIG.violetR
        const g = p.isCyan ? CONFIG.cyanG : CONFIG.violetG
        const b = p.isCyan ? CONFIG.cyanB : CONFIG.violetB

        // Particle dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.7})`
        ctx.fill()

        // Glow halo
        const haloGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        haloGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.25})`)
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fillStyle = haloGrad
        ctx.fill()
      }

      // --- 4. Energy pulse overlay ---
      if (state.pulse > 0) {
        const pulseGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6)
        pulseGrad.addColorStop(0, `rgba(${CONFIG.violetR}, ${CONFIG.violetG}, ${CONFIG.violetB}, ${state.pulse * 0.12})`)
        pulseGrad.addColorStop(0.5, `rgba(${CONFIG.cyanR}, ${CONFIG.cyanG}, ${CONFIG.cyanB}, ${state.pulse * 0.04})`)
        pulseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = pulseGrad
        ctx.fillRect(0, 0, w, h)
      }
    }

    state.animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(state.animId)
      window.removeEventListener('resize', resize)
    }
  }, [paused, initObjects])

  // Trigger pulse when pulseActive changes to true
  useEffect(() => {
    if (pulseActive) {
      stateRef.current.pulse = 1
    }
  }, [pulseActive])

  return (
    <>
      {/* Radial gradient base — CSS layer behind canvas */}
      <div
        className="fixed inset-0 -z-20"
        style={{
          background: 'radial-gradient(circle at center, #1a0f2e 0%, #0f0f13 40%, #000000 100%)',
        }}
      />

      {/* Canvas animation layer */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
    </>
  )
}
