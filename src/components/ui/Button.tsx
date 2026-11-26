import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes } from 'react'
import { useReducedMotion } from 'framer-motion'
import { DESK_GLASS_BUTTON } from '@/hooks/useLiquidGlass'
import { createGlass, type GlassController } from '@/lib/liquid-glass.js'
import { playSfx } from '@/lib/sfx'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-lime text-canvas hover:bg-lime-glow shadow-[0_0_20px_rgb(198_244_50/0.35)] border-transparent',
  secondary:
    'bg-surface-raised text-ink border-border hover:border-border-strong hover:bg-surface-hover',
  /** Liquid glass chrome — refraction in Chromium, frost elsewhere. */
  glass:
    'glass-btn border-white/12 bg-white/[0.07] text-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_8px_24px_rgb(0_0_0/0.35)] hover:border-lime/35 hover:bg-white/[0.11]',
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
      ...props
    },
    ref,
  ) => {
    const localRef = useRef<HTMLButtonElement | null>(null)
    const glassRef = useRef<GlassController | null>(null)
    const reduceMotion = useReducedMotion()
    const liquid = variant === 'glass'

    useEffect(() => {
      const el = localRef.current
      if (!el || !liquid || disabled || reduceMotion) return
      if (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-transparency: reduce)').matches) {
        return
      }
      const glass = createGlass(el, {
        ...DESK_GLASS_BUTTON,
        radius: glassRadius[size],
      })
      glassRef.current = glass
      return () => {
        glass.destroy()
        glassRef.current = null
      }
    }, [liquid, disabled, reduceMotion, size])

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
      />
    )
  },
)
Button.displayName = 'Button'
