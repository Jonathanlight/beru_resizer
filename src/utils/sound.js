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

/**
 * Short electric zap sound for reset action.
 */
export function playResetSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const now = ctx.currentTime

    // Quick descending zap
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(1400, now)
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.15)
    gain.gain.setValueAtTime(0.06, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.2)

    // Static crackle overlay
    const bufferSize = ctx.sampleRate * 0.1
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }
    const noise = ctx.createBufferSource()
    const noiseGain = ctx.createGain()
    noise.buffer = noiseBuffer
    noiseGain.gain.setValueAtTime(0.04, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    noise.connect(noiseGain).connect(ctx.destination)
    noise.start(now)
    noise.stop(now + 0.1)

    setTimeout(() => ctx.close(), 400)
  } catch {
    // Audio not available — fail silently
  }
}
