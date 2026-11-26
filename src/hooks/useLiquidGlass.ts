import type { CreateGlassOptions } from '@/lib/liquid-glass.js'

/**
 * Desk panel optics (Pattern C). Tuned to liquidglass.dev “glass card over photo”:
 * soft rim bend, tiny chroma fringe, restrained specular — no oily rainbow glare.
 */
export const DESK_GLASS: CreateGlassOptions = {
  fit: true,
  clip: true,
  radius: 20,
  refraction: 22,
  bezel: 0.32,
  curvature: 4,
  chroma: 0.08,
  blur: 2,
  specular: 0.42,
  specularWidth: 1.15,
  lightAngle: -125,
}

/** Compact chrome — gentle rim only so small capsules stay clean. */
export const DESK_GLASS_BUTTON: CreateGlassOptions = {
  fit: true,
  clip: true,
  radius: 12,
  refraction: 12,
  bezel: 0.55,
  curvature: 3.5,
  chroma: 0.06,
  blur: 1.5,
  specular: 0.4,
  specularWidth: 1.1,
  lightAngle: -125,
}

export function prefersReducedTransparency(): boolean {
  if (typeof matchMedia !== 'function') return false
  return matchMedia('(prefers-reduced-transparency: reduce)').matches
}
