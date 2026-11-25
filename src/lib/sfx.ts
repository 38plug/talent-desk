/**
 * Soft UI sound effects via Web Audio (no asset files).
 * Muted by default — unmute after a user gesture via SoundToggle.
 */

const MUTE_KEY = 'talent-desk.sfx-muted'

type SfxKind = 'hover' | 'tap' | 'success' | 'whoosh'

let ctx: AudioContext | null = null
let muted = true

function readMuted(): boolean {
  try {
    const v = localStorage.getItem(MUTE_KEY)
    if (v === null) return true
    return v === '1'
  } catch {
    return true
  }
}

muted = typeof window !== 'undefined' ? readMuted() : true

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

export function isSfxMuted(): boolean {
  return muted
}

export function setSfxMuted(next: boolean) {
  muted = next
  try {
    localStorage.setItem(MUTE_KEY, next ? '1' : '0')
  } catch {
    /* ignore */
  }
  if (!next) ensureCtx()
}

export function toggleSfxMuted(): boolean {
  setSfxMuted(!muted)
  return muted
}

function tone(
  frequency: number,
  durationMs: number,
  type: OscillatorType,
  gainPeak: number,
  slideTo?: number,
) {
  const audio = ensureCtx()
  if (!audio || muted || prefersReducedMotion()) return

  const now = audio.currentTime
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  const filter = audio.createBiquadFilter()

  osc.type = type
  osc.frequency.setValueAtTime(frequency, now)
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), now + durationMs / 1000)
  }

  filter.type = 'lowpass'
  filter.frequency.value = 2400

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(audio.destination)

  osc.start(now)
  osc.stop(now + durationMs / 1000 + 0.02)
}

export function playSfx(kind: SfxKind) {
  if (muted || prefersReducedMotion()) return
  switch (kind) {
    case 'hover':
      tone(620, 45, 'sine', 0.018)
      break
    case 'tap':
      tone(380, 70, 'triangle', 0.04, 220)
      break
    case 'success':
      tone(520, 90, 'sine', 0.045)
      setTimeout(() => tone(780, 120, 'sine', 0.035), 70)
      break
    case 'whoosh':
      tone(180, 160, 'sine', 0.025, 420)
      break
  }
}
