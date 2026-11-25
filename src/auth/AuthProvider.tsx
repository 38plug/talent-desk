import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { fetchProfile } from '@/lib/api'
import { clearDemoUi, isDemoUi } from '@/auth/demoUi'
import { supabase, supabaseConfigured } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

const DEMO_PROFILE: Profile = {
  id: 'demo',
  email: 'demo@talentdesk.local',
  fullName: 'Demo Operator',
  role: 'owner',
  createdAt: new Date().toISOString(),
}

type AuthState = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId)
    setProfile(p)
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!supabaseConfigured) {
        setLoading(false)
        return
      }
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data.session)
        if (data.session?.user) await loadProfile(data.session.user.id)
      } catch {
        // Unreachable Supabase should not blank the auth screens.
        if (mounted) {
          setSession(null)
          setProfile(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next?.user) void loadProfile(next.user.id)
      else setProfile(null)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [loadProfile])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id)
  }, [loadProfile, session?.user])

  const demo = !session && isDemoUi()
  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile: profile ?? (demo ? DEMO_PROFILE : null),
      loading,
      refreshProfile,
      signOut: async () => {
        clearDemoUi()
        await signOut()
      },
    }),
    [session, profile, loading, refreshProfile, signOut, demo],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
