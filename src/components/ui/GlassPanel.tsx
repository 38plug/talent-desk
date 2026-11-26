import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { DESK_GLASS, prefersReducedTransparency } from '@/hooks/useLiquidGlass'
import { createGlass, type CreateGlassOptions, type GlassController } from '@/lib/liquid-glass.js'
import { cn } from '@/lib/utils'

export type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  /** Override desk liquid-glass optics. */
  optics?: CreateGlassOptions
  /** Skip refraction (keeps frosted CSS only). */
  liquid?: boolean
}

const BG_KEYS = [
  'backgroundColor',
  'backgroundImage',
  'backgroundSize',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundOrigin',
  'backgroundClip',
] as const

/**
 * Real liquid glass (Pattern C): refracts an aligned copy of `[data-td-glass-stage]`
 * via `filter: url(#…)` — Chrome, Safari/iOS, and Firefox.
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
  const layerRef = useRef<HTMLDivElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const glassRef = useRef<GlassController | null>(null)
  const reduceMotion = useReducedMotion()

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
    const layer = layerRef.current
    const copy = copyRef.current
    if (!host || !layer || !copy || !liquid) return
    if (reduceMotion || prefersReducedTransparency()) return

    const stage =
      (host.closest('[data-td-glass-stage]') as HTMLElement | null) ??
      (document.querySelector('[data-td-glass-stage]') as HTMLElement | null)

    if (stage) {
      const cs = getComputedStyle(stage)
      for (const k of BG_KEYS) copy.style[k] = cs[k]
      copy.classList.remove('td-glass-silk')
    } else {
      for (const k of BG_KEYS) copy.style[k] = ''
      copy.classList.add('td-glass-silk')
    }

    const glass = createGlass(layer, {
      fit: true,
      clip: true,
      radius,
      refraction,
      bezel,
      curvature,
      chroma,
      blur,
      specular,
      specularWidth,
      lightAngle: -120,
    })
    glassRef.current = glass

    let alignKey = ''
    const align = () => {
      if (!stage) {
        copy.style.width = '100%'
        copy.style.height = '100%'
        copy.style.transform = ''
        return
      }
      const sr = stage.getBoundingClientRect()
      const lr = layer.getBoundingClientRect()
      const key = `${sr.width}|${sr.height}|${sr.left - lr.left}|${sr.top - lr.top}`
      if (key === alignKey) return
      alignKey = key
      copy.style.width = `${sr.width}px`
      copy.style.height = `${sr.height}px`
      copy.style.transform = `translate(${sr.left - lr.left}px, ${sr.top - lr.top}px)`
      copy.style.backgroundSize = `${sr.width}px ${sr.height}px`
      copy.style.backgroundPosition = '0 0'
    }

    align()
    glass.flush()

    const ro = new ResizeObserver(() => {
      align()
      glass.flush()
    })
    ro.observe(host)
    if (stage) ro.observe(stage)

    const onScroll = () => align()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onScroll)

    return () => {
      glass.destroy()
      glassRef.current = null
      ro.disconnect()
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onScroll)
    }
  }, [
    liquid,
    reduceMotion,
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
      className={cn('liquid-glass-host relative isolate overflow-hidden', className)}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]" aria-hidden>
        <div ref={layerRef} className="absolute inset-0 overflow-hidden rounded-[inherit]">
          <div ref={copyRef} className="td-glass-copy absolute top-0 left-0" />
        </div>
        <div className="td-glass-tint absolute inset-0 rounded-[inherit]" />
        <div className="td-glass-rim absolute inset-0 rounded-[inherit]" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
