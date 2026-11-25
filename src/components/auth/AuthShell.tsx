import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { SoundToggle } from '@/components/motion/SoundToggle'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { fadeScale, fadeUp, springSoft, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function AuthShell({
  children,
  accent = 'violet',
}: {
  children: ReactNode
  accent?: 'violet' | 'magenta'
}) {
  const reduce = useReducedMotion()

  return (
    <div className="bg-mesh relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <motion.div
        className={cn(
          'auth-orb -top-24 -left-16 h-80 w-80',
          accent === 'violet' ? 'bg-violet' : 'bg-magenta',
        )}
        animate={reduce ? undefined : { x: [0, 24, 0], y: [0, 16, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="auth-orb -right-20 bottom-0 h-96 w-96 bg-cyan"
        animate={reduce ? undefined : { x: [0, -18, 0], y: [0, -22, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="auth-orb top-1/3 right-1/4 h-44 w-44 bg-magenta"
        animate={reduce ? undefined : { opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Cinematic vignette + scanline atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(0_0_0/0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay [background-image:repeating-linear-gradient(0deg,transparent,transparent_2px,rgb(255_255_255/0.4)_3px)]" />

      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <SoundToggle />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md"
        variants={reduce ? undefined : staggerContainer}
        initial={reduce ? false : 'hidden'}
        animate="show"
      >
        <motion.div className="mb-8 text-center" variants={reduce ? undefined : fadeUp}>
          <motion.div
            className={cn(
              'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[18px] text-xl font-black text-white',
              accent === 'violet'
                ? 'bg-gradient-to-br from-violet via-magenta to-cyan glow-violet'
                : 'bg-gradient-to-br from-magenta via-violet to-cyan glow-magenta',
            )}
            variants={reduce ? undefined : fadeScale}
            whileHover={reduce ? undefined : { scale: 1.06, rotate: -2 }}
            transition={springSoft}
          >
            TD
          </motion.div>
          <h1 className="text-glow-violet text-4xl font-extrabold tracking-tight text-ink">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">{APP_TAGLINE}</p>
        </motion.div>

        <motion.div
          variants={reduce ? undefined : fadeScale}
          className="glass-panel card-glow relative overflow-hidden p-7 shadow-[0_0_80px_rgb(124_58_237/0.22)]"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-cyan/20 blur-3xl" />
          <div className="relative">{children}</div>
        </motion.div>
      </motion.div>
    </div>
  )
}
