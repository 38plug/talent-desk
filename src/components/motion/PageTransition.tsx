import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'

/** Blur+fade out → fade+unblur+scale in (power4-quality cubic). */
export function PageTransition() {
  const location = useLocation()
  const reduce = useReducedMotion()

  if (reduce) return <Outlet />

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, scale: 0.985, filter: 'blur(8px)' }}
        animate={{
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        }}
        exit={{
          opacity: 0,
          scale: 0.99,
          filter: 'blur(6px)',
          transition: { duration: 0.22, ease: [0.7, 0, 0.84, 0] },
        }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
