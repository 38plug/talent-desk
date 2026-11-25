/**
 * Reel-matched UI SFX via Web Audio.
 * thud = layout / collapse, bass = primary nav, pop = tabs/focus
 * Muted by default; respects prefers-reduced-motion.
 */

const MUTE_KEY = 'talent-desk.sfx-muted'

export type SfxKind = 'thud' | 'bass' | 'pop' | 'hover' | 'tap' | 'success' | 'whoosh'

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
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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

function noiseBurst(durationMs: number, gainPeak: number, filterFreq: number) {
  const audio = ensureCtx()
  if (!audio || muted || prefersReducedMotion()) return
  const len = Math.floor((audio.sampleRate * durationMs) / 1000)
  const buffer = audio.createBuffer(1, len, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = audio.createBufferSource()
  src.buffer = buffer
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = filterFreq
  const gain = audio.createGain()
  const now = audio.currentTime
  gain.gain.setValueAtTime(gainPeak, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)
  src.connect(filter)
  filter.connect(gain)
  gain.connect(audio.destination)
  src.start(now)
}

function tone(
  frequency: number,
  durationMs: number,
  type: OscillatorType,
  gainPeak: number,
  slideTo?: number,
  filterFreq = 2400,
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
  filter.frequency.value = filterFreq

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.01)
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
    case 'thud':
      // Mechanical layout thud
      noiseBurst(90, 0.12, 180)
      tone(90, 110, 'sine', 0.08, 55, 400)
      break
    case 'bass':
      // Deep bass for primary nav
      tone(70, 140, 'sine', 0.1, 45, 300)
      tone(110, 80, 'triangle', 0.04, 80, 500)
      break
    case 'pop':
      // Light pop for tabs / focus
      tone(880, 40, 'sine', 0.03, 1400)
      noiseBurst(30, 0.025, 4000)
      break
    case 'hover':
      playSfx('pop')
      break
    case 'tap':
      playSfx('pop')
      break
    case 'success':
      tone(520, 80, 'sine', 0.05)
      setTimeout(() => tone(780, 100, 'sine', 0.04), 60)
      break
    case 'whoosh':
      noiseBurst(140, 0.05, 900)
      tone(200, 160, 'sine', 0.03, 480)
      break
  }
}
