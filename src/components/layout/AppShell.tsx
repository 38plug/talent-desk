import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Briefcase,
  Calendar,
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
import { useState } from 'react'
import { useAuth } from '@/auth/AuthProvider'
import { canViewAdmin } from '@/lib/api'
import { ADMIN_NAV, APP_NAME, APP_TAGLINE, NAV_ITEMS } from '@/lib/constants'
import { cn, initials } from '@/lib/utils'
import { Button } from '@/components/ui'

const ICONS = {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  Wallet,
  Settings,
  Shield,
} as const

export function AppShell() {
  const { profile, user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const items = [
    ...NAV_ITEMS,
    ...(canViewAdmin(profile?.role) ? [ADMIN_NAV] : []),
  ]

  const pageTitle =
    items.find((i) => (i.to === '/' ? location.pathname === '/' : location.pathname.startsWith(i.to)))
      ?.label ?? 'Overview'

  return (
    <div className="bg-mesh flex min-h-screen">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-canvas-raised/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-cyan text-sm font-black text-white glow-violet">
            TD
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-ink">{APP_NAME}</p>
            <p className="text-[10px] text-ink-dim">{APP_TAGLINE}</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-lg p-1 text-ink-muted lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-violet/20 text-ink shadow-[inset_0_0_0_1px_rgb(124_58_237/0.35)] glow-violet'
                      : 'text-ink-muted hover:bg-white/5 hover:text-ink',
                  )
                }
              >
                <span className="tabular w-5 text-[10px] text-ink-dim">{item.index}</span>
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-magenta via-violet to-cyan p-[1px]">
            <div className="rounded-2xl bg-canvas-raised/90 px-3 py-3">
              <p className="text-xs font-semibold text-ink">
                {profile?.fullName || user?.email || 'Operator'}
              </p>
              <p className="truncate text-[11px] text-ink-dim">{profile?.role ?? 'user'}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={() => void signOut()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-canvas/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            className="rounded-xl border border-border p-2 text-ink-muted lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-glow">
              {APP_NAME}
            </p>
            <h1 className="text-lg font-bold text-ink sm:text-xl">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-dim" />
              <input
                className="h-10 w-56 rounded-full border border-border bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-dim focus:border-violet/50 focus:outline-none"
                placeholder="Search desk…"
                aria-label="Search"
              />
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet/25 text-xs font-bold text-violet-glow">
              {initials(profile?.fullName || user?.email || 'TD')}
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
