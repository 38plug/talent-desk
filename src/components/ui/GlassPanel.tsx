import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  DESK_GLASS,
  prefersReducedTransparency,
  useCompactGlassViewport,
} from '@/hooks/useLiquidGlass'
import { createGlass, type CreateGlassOptions, type GlassController } from '@/lib/liquid-glass.js'
import { cn } from '@/lib/utils'

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  /** Override desk liquid-glass optics (desktop backdrop lens only). */
  optics?: CreateGlassOptions
  /** Skip refraction / frost liquid treatment. */
  liquid?: boolean
}

/**
 * Liquid glass panel.
 * - Desktop: `mode: 'backdrop'` lens (Chromium `backdrop-filter: url(#…)`; other engines CSS frost fallback)
 *   so real mesh/orbs show through — not an opaque Pattern C stage copy.
 * - Mobile / narrow touch: polished frost only — no rim ripples on small cards.
 * Keep off `PageTransition`.
 */
export function GlassPanel({
  className,
  children,
  optics,
  liquid = true,
  ...props
}: GlassPanelProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const glassRef = useRef<GlassController | null>(null)
  const reduceMotion = useReducedMotion()
  const compact = useCompactGlassViewport()
  const useRefraction = liquid && !compact && !reduceMotion && !prefersReducedTransparency()

  const refraction = optics?.refraction ?? DESK_GLASS.refraction
  const bezel = optics?.bezel ?? DESK_GLASS.bezel
  const curvature = optics?.curvature ?? DESK_GLASS.curvature
  const chroma = optics?.chroma ?? DESK_GLASS.chroma
  const blur = optics?.blur ?? DESK_GLASS.blur
  const specular = optics?.specular ?? DESK_GLASS.specular
  const specularWidth = optics?.specularWidth ?? DESK_GLASS.specularWidth
  const radius = optics?.radius ?? DESK_GLASS.radius

  useEffect(() => {
    const host = hostRef.current
    if (!host || !useRefraction) return

    const glass = createGlass(host, {
      mode: 'backdrop',
      fit: true,
      clip: true,
      fallback: 'blur(28px) saturate(1.7)',
      radius,
      refraction,
      bezel,
      curvature,
      chroma,
      blur,
      specular,
      specularWidth,
      lightAngle: -125,
    })
    glassRef.current = glass
    glass.flush()

    const ro = new ResizeObserver(() => glass.flush())
    ro.observe(host)

    return () => {
      glass.destroy()
      glassRef.current = null
      ro.disconnect()
    }
  }, [
    useRefraction,
    radius,
    refraction,
    bezel,
    curvature,
    chroma,
    blur,
    specular,
    specularWidth,
  ])

  return (
    <div
      ref={hostRef}
      className={cn(
        'liquid-glass-host relative isolate overflow-hidden',
        liquid && (compact || !useRefraction) && 'liquid-glass-host--frost',
        className,
      )}
      {...props}
    >
      {liquid ? (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]" aria-hidden>
          <div className="td-glass-tint absolute inset-0 rounded-[inherit]" />
          <div className="td-glass-rim absolute inset-0 rounded-[inherit]" />
        </div>
      ) : null}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
