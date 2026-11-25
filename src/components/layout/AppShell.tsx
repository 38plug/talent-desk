import { NavLink, useLocation } from 'react-router-dom'
import {
  Briefcase,
  Calendar,
  CalendarDays,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  Shield,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useAuth } from '@/auth/AuthProvider'
import { InterviewReminderWatcher } from '@/components/interviews/InterviewReminderWatcher'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { HeaderClock } from '@/components/layout/HeaderClock'
import { HeaderNotifications } from '@/components/layout/HeaderNotifications'
import { PageTransition } from '@/components/motion/PageTransition'
import { SoundToggle } from '@/components/motion/SoundToggle'
import { Button } from '@/components/ui'
import { canViewAdmin } from '@/lib/api'
import { ADMIN_NAV, APP_NAME, APP_TAGLINE, NAV_ITEMS } from '@/lib/constants'
import { playSfx } from '@/lib/sfx'
import { setPillImmediate, slidePill } from '@/lib/slide-pill'
import { cn, initials } from '@/lib/utils'

const ICONS = {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  CalendarDays,
  Wallet,
  MessageCircle,
  Settings,
  Shield,
} as const

const COLLAPSE_KEY = 'talent-desk.sidebar-collapsed'

export function AppShell() {
  const { profile, user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)
  const [tip, setTip] = useState<{ key: string; top: number; left: number; open: boolean } | null>(
    null,
  )
  const location = useLocation()
  const reduce = useReducedMotion()
  const navRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tipHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const items = [...NAV_ITEMS, ...(canViewAdmin(profile?.role) ? [ADMIN_NAV] : [])]

  const pageTitle =
    items.find((i) =>
      i.to === '/' ? location.pathname === '/' : location.pathname.startsWith(i.to),
    )?.label ?? 'Overview'

  const activeKey =
    items.find((i) =>
      i.to === '/' ? location.pathname === '/' : location.pathname.startsWith(i.to),
    )?.to ?? '/'

  const focusKey = hoveredKey ?? activeKey

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  useLayoutEffect(() => {
    const box = navRef.current
    const pill = pillRef.current
    const el = itemRefs.current.get(focusKey)
    if (!box || !pill || !el) return
    const run = () => {
      if (reduce) setPillImmediate(pill, el, box)
      else slidePill(pill, el, box)
    }
    run()
    const ro = new ResizeObserver(run)
    ro.observe(box)
    return () => ro.disconnect()
  }, [focusKey, collapsed, mobileOpen, reduce, items.length])

  useEffect(() => {
    return () => {
      if (tipTimer.current) clearTimeout(tipTimer.current)
      if (tipHideTimer.current) clearTimeout(tipHideTimer.current)
    }
  }, [])

  function toggleCollapse() {
    playSfx('thud')
    setCollapsed((c) => !c)
    setTip(null)
  }

  function showTip(key: string) {
    if (!collapsed) return
    if (tipTimer.current) clearTimeout(tipTimer.current)
    if (tipHideTimer.current) clearTimeout(tipHideTimer.current)
    tipTimer.current = setTimeout(() => {
      const el = itemRefs.current.get(key)
      if (!el) return
      const rect = el.getBoundingClientRect()
      setTip({ key, top: rect.top + rect.height / 2, left: rect.right + 10, open: false })
      requestAnimationFrame(() => {
        setTip((cur) => (cur?.key === key ? { ...cur, open: true } : cur))
      })
    }, 70)
  }

  function hideTip(key: string) {
    if (tipTimer.current) clearTimeout(tipTimer.current)
    setTip((cur) => (cur?.key === key ? { ...cur, open: false } : cur))
    if (tipHideTimer.current) clearTimeout(tipHideTimer.current)
    tipHideTimer.current = setTimeout(() => {
      setTip((cur) => (cur?.key === key && !cur.open ? null : cur))
    }, 180)
  }

  return (
    <div className="bg-mesh flex min-h-screen">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-canvas-raised/95 backdrop-blur-xl transition-[width,transform] duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:translate-x-0',
          collapsed ? 'w-[4.75rem]' : 'w-[17rem]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div
          className={cn(
            'flex items-center gap-3 border-b border-border py-5',
            collapsed ? 'justify-center px-2' : 'px-5',
          )}
        >
          <BrandLogo size="sm" decorative />
          <div
            className={cn(
              'min-w-0 overflow-hidden transition-all duration-300',
              collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
            )}
          >
            <p className="truncate text-[15px] font-extrabold tracking-tight text-ink">{APP_NAME}</p>
            <p className="truncate text-[10px] text-ink-dim">{APP_TAGLINE}</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-xl p-1.5 text-ink-muted hover:bg-white/5 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          ref={navRef}
          className="relative flex-1 space-y-1 overflow-y-auto overflow-x-visible px-2 py-4"
          onMouseLeave={() => {
            setHoveredKey(null)
            if (tipTimer.current) clearTimeout(tipTimer.current)
            setTip((cur) => (cur ? { ...cur, open: false } : null))
            if (tipHideTimer.current) clearTimeout(tipHideTimer.current)
            tipHideTimer.current = setTimeout(() => setTip(null), 180)
          }}
        >
          <div ref={pillRef} className="nav-pill" aria-hidden />
          {!collapsed ? (
            <p className="floating-label relative z-10 mb-2 px-3 text-[10px] tracking-[0.18em] uppercase">
              Desk
            </p>
          ) : null}
          {items.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS]
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            const isFocused = focusKey === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                ref={(node) => {
                  if (node) itemRefs.current.set(item.to, node)
                  else itemRefs.current.delete(item.to)
                }}
                onClick={() => {
                  playSfx('bass')
                  setMobileOpen(false)
                  setTip(null)
                }}
                onMouseEnter={() => {
                  setHoveredKey(item.to)
                  if (!isActive) playSfx('pop')
                  showTip(item.to)
                }}
                onMouseLeave={() => hideTip(item.to)}
                onFocus={() => {
                  setHoveredKey(item.to)
                  showTip(item.to)
                }}
                onBlur={() => {
                  setHoveredKey((cur) => (cur === item.to ? null : cur))
                  hideTip(item.to)
                }}
                aria-label={collapsed ? item.label : undefined}
                className={cn(
                  'nav-item group relative z-10 flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium',
                  collapsed && 'justify-center px-0',
                  isFocused && isActive
                    ? 'text-canvas'
                    : isFocused
                      ? 'text-ink'
                      : 'text-ink-muted',
                )}
              >
                {!collapsed ? (
                  <span
                    className={cn(
                      'tabular w-5 text-[10px] transition-opacity duration-200',
                      isFocused && isActive ? 'text-canvas/70' : 'text-ink-dim/80',
                      isFocused ? 'opacity-100' : 'opacity-70',
                    )}
                  >
                    {item.index}
                  </span>
                ) : null}
                <Icon
                  className={cn(
                    'nav-item-icon h-4 w-4 shrink-0',
                    isFocused && 'is-focused',
                    isActive && isFocused && 'is-active',
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    'truncate transition-[opacity,transform] duration-300',
                    collapsed ? 'sr-only opacity-0' : 'opacity-100',
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            )
          })}
        </nav>

        <div className={cn('space-y-3 border-t border-border p-3', collapsed && 'px-2')}>
          <button
            type="button"
            className="hidden w-full items-center justify-center gap-2 rounded-[12px] border border-border py-2 text-xs font-semibold text-ink-muted hover:border-lime/40 hover:text-lime lg:flex"
            onClick={toggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            {!collapsed ? <span>Collapse</span> : null}
          </button>
          <div
            className={cn(
              'overflow-hidden rounded-[18px] border border-lime/25 bg-lime/10',
              collapsed && 'hidden',
            )}
          >
            <div className="px-3.5 py-3">
              <p className="text-xs font-semibold text-ink">
                {profile?.fullName || user?.email || 'Operator'}
              </p>
              <p className="truncate text-[11px] capitalize text-ink-dim">{profile?.role ?? 'user'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className={cn('w-full', collapsed ? 'justify-center px-0' : 'justify-start')}
            onClick={() => {
              playSfx('whoosh')
              void signOut()
            }}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed ? 'Sign out' : null}
          </Button>
        </div>
      </aside>

      {collapsed && tip ? (
        <span
          role="tooltip"
          className={cn('nav-tooltip', tip.open && 'is-open')}
          style={{ top: tip.top, left: tip.left }}
        >
          {items.find((i) => i.to === tip.key)?.label}
        </span>
      ) : null}

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/55 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            className="rounded-[12px] border border-border p-2 text-ink-muted hover:bg-white/5 lg:hidden"
            onClick={() => {
              playSfx('thud')
              setMobileOpen(true)
            }}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="floating-label text-[10px] tracking-[0.2em] uppercase">{APP_NAME}</p>
            <h1 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
            <HeaderClock className="mr-1 shrink-0" />
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-dim" />
              <input
                className="h-10 w-60 rounded-full border border-border bg-surface/80 pl-9 pr-3 text-sm text-ink placeholder:text-ink-dim focus:border-lime/50 focus:outline-none focus:ring-2 focus:ring-lime/20"
                placeholder="Search Talent Desk…"
                aria-label="Search"
                onFocus={() => playSfx('pop')}
              />
            </div>
            <HeaderNotifications />
            <SoundToggle />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime/20 text-xs font-bold text-lime ring-1 ring-lime/35">
              {initials(profile?.fullName || user?.email || 'TD')}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <PageTransition />
        </main>
      </div>
      <InterviewReminderWatcher />
    </div>
  )
}
