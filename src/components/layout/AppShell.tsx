import { NavLink, useLocation } from 'react-router-dom'
import {
  Briefcase,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Menu,
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
  Wallet,
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
  const location = useLocation()
  const reduce = useReducedMotion()
  const navRef = useRef<HTMLElement>(null)
  const pillRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())

  const items = [...NAV_ITEMS, ...(canViewAdmin(profile?.role) ? [ADMIN_NAV] : [])]

  const pageTitle =
    items.find((i) =>
      i.to === '/' ? location.pathname === '/' : location.pathname.startsWith(i.to),
    )?.label ?? 'Overview'

  const activeKey =
    items.find((i) =>
      i.to === '/' ? location.pathname === '/' : location.pathname.startsWith(i.to),
    )?.to ?? '/'

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
    const el = itemRefs.current.get(activeKey)
    if (!box || !pill || !el) return
    const run = () => {
      if (reduce) setPillImmediate(pill, el, box)
      else slidePill(pill, el, box)
    }
    run()
    const ro = new ResizeObserver(run)
    ro.observe(box)
    return () => ro.disconnect()
  }, [activeKey, collapsed, mobileOpen, reduce, items.length])

  function toggleCollapse() {
    playSfx('thud')
    setCollapsed((c) => !c)
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-lime text-sm font-black text-canvas glow-lime">
            TD
          </div>
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

        <nav ref={navRef} className="relative flex-1 space-y-1 overflow-y-auto px-2 py-4">
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
                }}
                onMouseEnter={() => playSfx('pop')}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'relative z-10 flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-sm font-medium transition-colors',
                  collapsed && 'justify-center px-0',
                  isActive ? 'text-canvas' : 'text-ink-muted hover:text-ink',
                )}
              >
                {!collapsed ? (
                  <span className="tabular w-5 text-[10px] text-ink-dim/80">{item.index}</span>
                ) : null}
                <Icon className="h-4 w-4 shrink-0" />
                <span
                  className={cn(
                    'truncate transition-opacity duration-300',
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
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-dim" />
              <input
                className="h-10 w-60 rounded-full border border-border bg-surface/80 pl-9 pr-3 text-sm text-ink placeholder:text-ink-dim focus:border-lime/50 focus:outline-none focus:ring-2 focus:ring-lime/20"
                placeholder="Search Talent Desk…"
                aria-label="Search"
                onFocus={() => playSfx('pop')}
              />
            </div>
            <SoundToggle />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime/20 text-xs font-bold text-lime ring-1 ring-lime/35">
              {initials(profile?.fullName || user?.email || 'TD')}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <PageTransition />
        </main>
      </div>
    </div>
  )
}
