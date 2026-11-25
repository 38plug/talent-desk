import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
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
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.94, filter: 'blur(8px)', y: 12 }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }
            }
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, filter: 'blur(6px)', y: 8 }
            }
            transition={reduce ? { duration: 0.01 } : springSnappy}
            className={cn(
              'relative my-auto flex w-full flex-col rounded-[20px] border border-border bg-surface shadow-2xl',
              'max-h-[min(90vh,calc(100dvh-2rem))]',
              glass &&
                'glass-panel border-lime/20 shadow-[0_0_0_1px_rgb(198_244_50/0.12),0_24px_64px_rgb(0_0_0/0.55)]',
              wide ? 'max-w-2xl' : 'max-w-lg',
              className,
            )}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
              <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
              {children}
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
