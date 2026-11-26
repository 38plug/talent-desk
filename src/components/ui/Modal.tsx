import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import {
  DESK_GLASS,
  prefersReducedTransparency,
  useCompactGlassViewport,
} from '@/hooks/useLiquidGlass'
import { createGlass, type GlassController } from '@/lib/liquid-glass.js'
import { springSnappy } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { Button } from './Button'

function lockBodyScroll(lock: boolean) {
  if (typeof document === 'undefined') return
  if (lock) {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.dataset.tdScrollLock = '1'
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
  } else if (document.body.dataset.tdScrollLock === '1') {
    delete document.body.dataset.tdScrollLock
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  wide,
  glass,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  wide?: boolean
  /** Lime/dark glass panel treatment for preview surfaces */
  glass?: boolean
}) {
  const reduce = useReducedMotion()
  const compact = useCompactGlassViewport()
  const panelRef = useRef<HTMLDivElement | null>(null)
  const glassCtrl = useRef<GlassController | null>(null)
  const useRefraction = Boolean(
    glass && !compact && !reduce && !prefersReducedTransparency(),
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    lockBodyScroll(true)
    return () => {
      document.removeEventListener('keydown', onKey)
      lockBodyScroll(false)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open || !useRefraction) return
    const host = panelRef.current
    if (!host) return

    const ctrl = createGlass(host, {
      mode: 'backdrop',
      ...DESK_GLASS,
      refraction: 16,
      bezel: 0.26,
      chroma: 0.05,
      specular: 0.32,
      fallback: 'blur(28px) saturate(1.7)',
    })
    glassCtrl.current = ctrl
    ctrl.flush()
    const ro = new ResizeObserver(() => ctrl.flush())
    ro.observe(host)

    return () => {
      ctrl.destroy()
      glassCtrl.current = null
      ro.disconnect()
    }
  }, [open, useRefraction])

  if (typeof document === 'undefined') return null

  const enterExit = glass
    ? {
        initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 12 },
        animate: reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 },
        exit: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 },
      }
    : {
        initial: reduce
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.94, filter: 'blur(8px)', y: 12 },
        animate: reduce
          ? { opacity: 1 }
          : { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 },
        exit: reduce
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.96, filter: 'blur(6px)', y: 8 },
      }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto overscroll-none bg-black/75 p-4 sm:p-6"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.2 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={enterExit.initial}
            animate={enterExit.animate}
            exit={enterExit.exit}
            transition={reduce ? { duration: 0.01 } : springSnappy}
            className={cn(
              'relative my-auto flex w-full flex-col rounded-[20px] border border-border bg-surface shadow-2xl',
              'max-h-[min(90vh,calc(100dvh-2rem))]',
              glass &&
                cn(
                  'liquid-glass-host isolate overflow-hidden border-lime/25 bg-transparent shadow-[0_0_0_1px_rgb(198_244_50/0.12),0_24px_64px_rgb(0_0_0/0.55)]',
                  (compact || !useRefraction) && 'liquid-glass-host--frost',
                ),
              wide ? 'max-w-2xl' : 'max-w-lg',
              className,
            )}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {glass ? (
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]" aria-hidden>
                <div className="td-glass-tint absolute inset-0 rounded-[inherit]" />
                <div className="td-glass-rim absolute inset-0 rounded-[inherit]" />
              </div>
            ) : null}
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
                <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
                {children}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    lockBodyScroll(true)
    return () => {
      document.removeEventListener('keydown', onKey)
      lockBodyScroll(false)
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="drawer-root"
          className="fixed inset-0 z-[200] flex justify-end"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.18 }}
        >
          <button
            type="button"
            aria-label="Close drawer"
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.aside
            className="relative z-10 flex h-full max-h-[100dvh] w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl"
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 28, filter: 'blur(6px)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: 20, filter: 'blur(4px)' }}
            transition={reduce ? { duration: 0.01 } : springSnappy}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-lg font-bold">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
