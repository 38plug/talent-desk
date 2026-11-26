import { useEffect, useRef, type RefObject } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  createGlass,
  type CreateGlassOptions,
  type GlassController,
} from '@/lib/liquid-glass.js'

/** Desk-tuned defaults: rim bend, readable centre, brand frost fallback. */
export const DESK_GLASS: CreateGlassOptions = {
  mode: 'backdrop',
  fit: true,
  radius: 20,
  refraction: 22,
  bezel: 0.34,
  curvature: 4,
  chroma: 0.1,
  blur: 1.2,
  specular: 0.55,
  specularWidth: 1.6,
  lightAngle: -120,
  fallback: 'blur(20px) saturate(1.25)',
}

export const DESK_GLASS_BUTTON: CreateGlassOptions = {
  mode: 'backdrop',
  fit: true,
  radius: 12,
  refraction: 14,
  bezel: 0.75,
  curvature: 3,
  chroma: 0.14,
  blur: 0.8,
  specular: 0.65,
  specularWidth: 1.4,
  fallback: 'blur(16px) saturate(1.4)',
}

function prefersReducedTransparency(): boolean {
  if (typeof matchMedia !== 'function') return false
  return matchMedia('(prefers-reduced-transparency: reduce)').matches
}

/**
 * Attach liquid-glass refraction to an element after mount.
 * Never put this on `PageTransition` — only on leaf panels/buttons.
 */
export function useLiquidGlass<T extends HTMLElement>(
  options: CreateGlassOptions = DESK_GLASS,
  enabled = true,
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const reduceMotion = useReducedMotion()
  const glassRef = useRef<GlassController | null>(null)

  const {
    mode,
    fit,
    clip,
    sync,
    hidden,
    fallback,
    x,
    y,
    width,
    height,
    radius,
    refraction,
    bezel,
    curvature,
    ior,
    invert,
    chroma,
    blur,
    specular,
    specularWidth,
    lightAngle,
    mapScale,
  } = options

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || reduceMotion || prefersReducedTransparency()) return

    const glass = createGlass(el, {
      mode,
      fit,
      clip,
      sync,
      hidden,
      fallback,
      x,
      y,
      width,
      height,
      radius,
      refraction,
      bezel,
      curvature,
      ior,
      invert,
      chroma,
      blur,
      specular,
      specularWidth,
      lightAngle,
      mapScale,
    })
    glassRef.current = glass
    return () => {
      glass.destroy()
      glassRef.current = null
    }
  }, [
    enabled,
    reduceMotion,
    mode,
    fit,
    clip,
    sync,
    hidden,
    fallback,
    x,
    y,
    width,
    height,
    radius,
    refraction,
    bezel,
    curvature,
    ior,
    invert,
    chroma,
    blur,
    specular,
    specularWidth,
    lightAngle,
    mapScale,
  ])

  return ref
}

export function useGlassController(): RefObject<GlassController | null> {
  return useRef<GlassController | null>(null)
}
