import { motion, useReducedMotion } from 'framer-motion'
import { APP_NAME } from '@/lib/constants'
import { cn } from '@/lib/utils'

const SIZES = {
  sm: 'h-11 w-11',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
} as const

type BrandLogoProps = {
  size?: keyof typeof SIZES
  className?: string
  /** Soft idle pulse when not hovering (auth hero). */
  pulse?: boolean
  decorative?: boolean
}

/**
 * Liquid-glass TD mark — lime glow + depth shadow, hover lift/shine.
 * Asset: `/brand/td-mark-*.png` (source mark from Pedro).
 */
export function BrandLogo({
  size = 'sm',
  className,
  pulse = false,
  decorative = false,
}: BrandLogoProps) {
  const reduce = useReducedMotion()
  const dim = size === 'sm' ? 44 : size === 'md' ? 64 : 80

  return (
    <motion.div
      className={cn(
        'brand-logo relative shrink-0',
        SIZES[size],
        className,
      )}
      whileHover={
        reduce
          ? undefined
          : {
              scale: 1.08,
              rotate: -2,
              transition: { type: 'spring', stiffness: 420, damping: 22, mass: 0.55 },
            }
      }
      animate={
        reduce || !pulse
          ? undefined
          : {
              scale: [1, 1.035, 1],
              filter: [
                'drop-shadow(0 8px 16px rgba(0,0,0,0.55)) drop-shadow(0 0 14px rgba(198,244,50,0.45))',
                'drop-shadow(0 8px 16px rgba(0,0,0,0.55)) drop-shadow(0 0 22px rgba(198,244,50,0.7))',
                'drop-shadow(0 8px 16px rgba(0,0,0,0.55)) drop-shadow(0 0 14px rgba(198,244,50,0.45))',
              ],
            }
      }
      transition={
        pulse && !reduce
          ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
          : undefined
      }
    >
      <img
        src="/brand/td-mark-256.png"
        srcSet="/brand/td-mark-128.png 128w, /brand/td-mark-256.png 256w, /brand/td-mark-512.png 512w"
        sizes={`${dim}px`}
        width={dim}
        height={dim}
        alt={decorative ? '' : `${APP_NAME} logo`}
        aria-hidden={decorative || undefined}
        draggable={false}
        className="brand-logo-img h-full w-full select-none object-contain"
      />
      {!reduce ? <span className="brand-logo-shine" aria-hidden /> : null}
    </motion.div>
  )
}
