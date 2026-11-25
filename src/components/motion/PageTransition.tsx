import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'
import { springSoft } from '@/lib/motion'

/**
 * Page enter/exit with opacity + y only.
 * Intentionally avoids CSS `filter` / blur on this wrapper so nested
 * `position: fixed` portals (modals) keep working against the viewport.
 */
export function PageTransition() {
  const location = useLocation()
  const reduce = useReducedMotion()

  if (reduce) return <Outlet />

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: springSoft,
        }}
        exit={{
          opacity: 0,
          y: -8,
          transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
