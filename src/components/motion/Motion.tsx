import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeUp, listItem, reducedFade, staggerContainer, staggerFast } from '@/lib/motion'
import { playSfx } from '@/lib/sfx'
import { cn } from '@/lib/utils'

export function MotionStagger({
  children,
  className,
  fast = false,
  ...props
}: HTMLMotionProps<'div'> & { children: ReactNode; fast?: boolean }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : fast ? staggerFast : staggerContainer}
      initial={reduce ? false : 'hidden'}
      animate="show"
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionItem({
  children,
  className,
  asList = false,
  hoverSfx = false,
  ...props
}: HTMLMotionProps<'div'> & {
  children: ReactNode
  asList?: boolean
  hoverSfx?: boolean
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={reduce ? reducedFade : asList ? listItem : fadeUp}
      whileHover={
        reduce
          ? undefined
          : {
              y: -2,
              transition: { type: 'spring', stiffness: 400, damping: 24 },
            }
      }
      onHoverStart={hoverSfx ? () => playSfx('hover') : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionButtonShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={cn('inline-flex w-full', className)}
      whileHover={reduce ? undefined : { scale: 1.015 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
    >
      {children}
    </motion.div>
  )
}
