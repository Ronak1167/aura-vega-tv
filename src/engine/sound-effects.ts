/**
 * Web Audio Synthesizer for 10-Foot TV Remote Navigation
 * 0ms latency synthetic acoustic feedback (D-pad tick, select chime, back thud).
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  public playFocusMove() {
    if (!this.enabled) return
    try {
      this.initContext()
      if (!this.ctx) return

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.05)
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playSelect() {
    if (!this.enabled) return
    try {
      this.initContext()
      if (!this.ctx) return

      const osc1 = this.ctx.createOscillator()
      const osc2 = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc1.type = 'triangle'
      osc2.type = 'sine'

      osc1.frequency.setValueAtTime(587.33, this.ctx.currentTime) // D5
      osc1.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12) // A5

      osc2.frequency.setValueAtTime(1174.66, this.ctx.currentTime) // D6

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(this.ctx.destination)

      osc1.start()
      osc2.start()
      osc1.stop(this.ctx.currentTime + 0.15)
      osc2.stop(this.ctx.currentTime + 0.15)
    } catch {
      // Audio fallback
    }
  }

  public playBack() {
    if (!this.enabled) return
    try {
      this.initContext()
      if (!this.ctx) return

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(320, this.ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.08)

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + 0.1)
    } catch {
      // Audio fallback
    }
  }

  public playSuccessChime() {
    if (!this.enabled) return
    try {
      this.initContext()
      if (!this.ctx) return

      const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        const startTime = this.ctx.currentTime + (idx * 0.06)

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.06, startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2)

        osc.connect(gain)
        gain.connect(this.ctx.destination)

        osc.start(startTime)
        osc.stop(startTime + 0.22)
      })
    } catch {
      // Audio fallback
    }
  }
}

export const soundEffects = new SoundEffectsEngine()
