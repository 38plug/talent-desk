import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes } from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  DESK_GLASS_BUTTON,
  prefersReducedTransparency,
  useCompactGlassViewport,
} from '@/hooks/useLiquidGlass'
import { createGlass, type GlassController } from '@/lib/liquid-glass.js'
import { playSfx } from '@/lib/sfx'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-lime text-canvas hover:bg-lime-glow shadow-[0_0_20px_rgb(198_244_50/0.35)] border-transparent',
  secondary:
    'bg-surface-raised text-ink border-border hover:border-border-strong hover:bg-surface-hover',
  /** Liquid glass chrome — frost on mobile, Pattern C on desktop. */
  glass:
    'liquid-glass-host relative isolate overflow-hidden border-white/12 text-ink shadow-[0_8px_24px_rgb(0_0_0/0.35)] hover:border-lime/35',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-white/5 border-transparent',
  danger: 'bg-rose/15 text-rose border-rose/30 hover:bg-rose/25',
  cyan: 'bg-cyan text-canvas hover:bg-cyan-glow border-transparent glow-cyan',
  magenta: 'bg-magenta text-white hover:bg-magenta-glow border-transparent glow-magenta',
  lime: 'bg-lime text-canvas hover:bg-lime-glow border-transparent glow-lime',
} as const

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-[10px]',
  md: 'h-10 px-4 text-sm rounded-[12px]',
  lg: 'h-11 px-5 text-sm rounded-[12px]',
  icon: 'h-10 w-10 rounded-[12px] p-0',
} as const

const glassRadius: Record<keyof typeof sizes, number> = {
  sm: 10,
  md: 12,
  lg: 12,
  icon: 12,
}

const BG_KEYS = [
  'backgroundColor',
  'backgroundImage',
  'backgroundSize',
  'backgroundPosition',
  'backgroundRepeat',
] as const

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  sfx?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled,
      sfx = true,
      onClick,
      onMouseEnter,
      children,
      ...props
    },
    ref,
  ) => {
    const localRef = useRef<HTMLButtonElement | null>(null)
    const layerRef = useRef<HTMLSpanElement | null>(null)
    const copyRef = useRef<HTMLSpanElement | null>(null)
    const glassRef = useRef<GlassController | null>(null)
    const reduceMotion = useReducedMotion()
    const compact = useCompactGlassViewport()
    const liquid = variant === 'glass'
    const useRefraction = liquid && !compact && !disabled && !reduceMotion && !prefersReducedTransparency()

    useEffect(() => {
      const host = localRef.current
      const layer = layerRef.current
      const copy = copyRef.current
      if (!host || !layer || !copy || !useRefraction) return

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
        ...DESK_GLASS_BUTTON,
        radius: glassRadius[size],
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

      return () => {
        glass.destroy()
        glassRef.current = null
        ro.disconnect()
        window.removeEventListener('scroll', onScroll, true)
      }
    }, [useRefraction, size])

    return (
      <button
        ref={(node) => {
          localRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        type={type}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 border font-semibold transition-all duration-200',
          'disabled:pointer-events-none disabled:opacity-45',
          variants[variant],
          sizes[size],
          liquid && compact && 'liquid-glass-host--frost',
          className,
        )}
        onMouseEnter={(e) => {
          if (sfx && !disabled) playSfx('hover')
          onMouseEnter?.(e)
        }}
        onClick={(e) => {
          if (sfx && !disabled) playSfx('tap')
          onClick?.(e)
        }}
        {...props}
      >
        {liquid ? (
          <>
            {useRefraction ? (
              <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]" aria-hidden>
                <span ref={layerRef} className="absolute inset-0 overflow-hidden rounded-[inherit]">
                  <span ref={copyRef} className="td-glass-copy absolute top-0 left-0" />
                </span>
                <span className="td-glass-tint absolute inset-0 rounded-[inherit]" />
                <span className="td-glass-rim absolute inset-0 rounded-[inherit]" />
              </span>
            ) : (
              <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]" aria-hidden>
                <span className="td-glass-tint absolute inset-0 rounded-[inherit]" />
                <span className="td-glass-rim absolute inset-0 rounded-[inherit]" />
              </span>
            )}
            <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)
Button.displayName = 'Button'
