import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'

/**
 * Page enter/exit without CSS `filter` / heavy transforms that create a
 * containing block and break nested `position: fixed` (modals).
 */
export function PageTransition() {
  const location = useLocation()
  const reduce = useReducedMotion()

  if (reduce) return <Outlet />

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        }}
        exit={{
          opacity: 0,
          y: -6,
          transition: { duration: 0.18, ease: [0.7, 0, 0.84, 0] },
        }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
