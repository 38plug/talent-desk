import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/auth/AuthProvider'
import { CloudRealtimeSync } from '@/auth/CloudRealtimeSync'
import { AdminRoute, ProtectedRoute } from '@/auth/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { PageLoader } from '@/components/ui'
import { isCloudSyncEnabled } from '@/lib/supabase'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const CandidatesPage = lazy(() =>
  import('@/pages/CandidatesPage').then((m) => ({ default: m.CandidatesPage })),
)
const OffersPage = lazy(() =>
  import('@/pages/OffersPage').then((m) => ({ default: m.OffersPage })),
)
const InterviewsPage = lazy(() =>
  import('@/pages/InterviewsPage').then((m) => ({ default: m.InterviewsPage })),
)
const InterviewCalendarPage = lazy(() =>
  import('@/pages/InterviewCalendarPage').then((m) => ({ default: m.InterviewCalendarPage })),
)
const EarningsPage = lazy(() =>
  import('@/pages/EarningsPage').then((m) => ({ default: m.EarningsPage })),
)
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      // Cloud: refresh shared desk when returning to the tab
      refetchOnWindowFocus: isCloudSyncEnabled,
    },
  },
})

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CloudRealtimeSync />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route
                  index
                  element={
                    <Lazy>
                      <DashboardPage />
                    </Lazy>
                  }
                />
                <Route
                  path="candidates"
                  element={
                    <Lazy>
                      <CandidatesPage />
                    </Lazy>
                  }
                />
                <Route
                  path="offers"
                  element={
                    <Lazy>
                      <OffersPage />
                    </Lazy>
                  }
                />
                <Route
                  path="interviews"
                  element={
                    <Lazy>
                      <InterviewsPage />
                    </Lazy>
                  }
                />
                <Route
                  path="calendar"
                  element={
                    <Lazy>
                      <InterviewCalendarPage />
                    </Lazy>
                  }
                />
                <Route
                  path="earnings"
                  element={
                    <Lazy>
                      <EarningsPage />
                    </Lazy>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <Lazy>
                      <SettingsPage />
                    </Lazy>
                  }
                />
                <Route element={<AdminRoute />}>
                  <Route
                    path="admin"
                    element={
                      <Lazy>
                        <AdminPage />
                      </Lazy>
                    }
                  />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
