import type { CreateGlassOptions } from '@/lib/liquid-glass.js'

/** Desk panel optics — content-mode Pattern C (backdrop copy inside GlassPanel). */
export const DESK_GLASS: CreateGlassOptions = {
  fit: true,
  clip: true,
  radius: 20,
  refraction: 30,
  bezel: 0.42,
  curvature: 3.6,
  chroma: 0.18,
  blur: 1.2,
  specular: 0.75,
  specularWidth: 2.2,
  lightAngle: -120,
}

/** Compact chrome (buttons) — stronger rim bend so small capsules read as glass. */
export const DESK_GLASS_BUTTON: CreateGlassOptions = {
  fit: true,
  clip: true,
  radius: 12,
  refraction: 16,
  bezel: 0.7,
  curvature: 3.2,
  chroma: 0.16,
  blur: 1,
  specular: 0.7,
  specularWidth: 1.5,
  lightAngle: -120,
}

export function prefersReducedTransparency(): boolean {
  if (typeof matchMedia !== 'function') return false
  return matchMedia('(prefers-reduced-transparency: reduce)').matches
}
