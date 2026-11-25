import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  primary:
    'bg-violet text-white hover:bg-violet-glow shadow-[0_0_20px_rgb(124_58_237/0.35)] border-transparent',
  secondary:
    'bg-surface-raised text-ink border-border hover:border-border-strong hover:bg-surface-hover',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-white/5 border-transparent',
  danger: 'bg-rose/15 text-rose border-rose/30 hover:bg-rose/25',
  cyan: 'bg-cyan text-canvas hover:bg-cyan-glow border-transparent glow-cyan',
  magenta: 'bg-magenta text-white hover:bg-magenta-glow border-transparent glow-magenta',
} as const

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-[10px]',
  md: 'h-10 px-4 text-sm rounded-[12px]',
  lg: 'h-11 px-5 text-sm rounded-[12px]',
  icon: 'h-10 w-10 rounded-[12px] p-0',
} as const

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', disabled, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 border font-semibold transition-all duration-200',
        'disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
