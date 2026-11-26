import { useEffect, useState } from 'react'
import type { CreateGlassOptions } from '@/lib/liquid-glass.js'

/**
 * Desktop Pattern C optics — soft rim bend, tiny chroma, restrained specular.
 * (liquidglass.dev “glass card over photo” band)
 */
export const DESK_GLASS: CreateGlassOptions = {
  fit: true,
  clip: true,
  radius: 20,
  refraction: 18,
  bezel: 0.28,
  curvature: 4,
  chroma: 0.06,
  blur: 2.2,
  specular: 0.35,
  specularWidth: 1.05,
  lightAngle: -125,
}

/** Compact chrome — gentle rim only. */
export const DESK_GLASS_BUTTON: CreateGlassOptions = {
  fit: true,
  clip: true,
  radius: 12,
  refraction: 10,
  bezel: 0.45,
  curvature: 3.5,
  chroma: 0.04,
  blur: 1.5,
  specular: 0.32,
  specularWidth: 1,
  lightAngle: -125,
}

export function prefersReducedTransparency(): boolean {
  if (typeof matchMedia !== 'function') return false
  return matchMedia('(prefers-reduced-transparency: reduce)').matches
}

/**
 * Phones / narrow touch viewports: skip feDisplacementMap.
 * Small cards make rim bend read as vertical ripples; frost is the clean mobile look.
 */
export function isCompactGlassViewport(): boolean {
  if (typeof matchMedia !== 'function') return false
  return (
    matchMedia('(max-width: 767px)').matches ||
    matchMedia('(max-width: 900px) and (pointer: coarse)').matches
  )
}

export function useCompactGlassViewport(): boolean {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mqNarrow = matchMedia('(max-width: 767px)')
    const mqTouch = matchMedia('(max-width: 900px) and (pointer: coarse)')
    const sync = () => setCompact(mqNarrow.matches || mqTouch.matches)
    sync()
    mqNarrow.addEventListener('change', sync)
    mqTouch.addEventListener('change', sync)
    return () => {
      mqNarrow.removeEventListener('change', sync)
      mqTouch.removeEventListener('change', sync)
    }
  }, [])

  return compact
}
