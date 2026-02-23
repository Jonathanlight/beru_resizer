/**
 * Synthesize a short futuristic completion sound using Web Audio API.
 * No external audio file needed.
 */
export function playCompleteSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Layered synth: ascending tone + shimmer
    const now = ctx.currentTime

    // Primary tone — ascending sweep
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(600, now)
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.15)
    gain1.gain.setValueAtTime(0.08, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4)
    osc1.connect(gain1).connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.4)

    // Shimmer overlay
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1800, now + 0.05)
    osc2.frequency.exponentialRampToValueAtTime(2400, now + 0.2)
    gain2.gain.setValueAtTime(0.03, now + 0.05)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
    osc2.connect(gain2).connect(ctx.destination)
    osc2.start(now + 0.05)
    osc2.stop(now + 0.35)

    // Cleanup
    setTimeout(() => ctx.close(), 600)
  } catch {
    // Audio not available — fail silently
  }
}
