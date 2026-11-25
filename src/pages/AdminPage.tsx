import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
  Modal,
  PageLoader,
  Select,
} from '@/components/ui'
import {
  adminDeleteAccount,
  adminResetLink,
  adminSetPassword,
  adminUpdateRole,
  fetchAdminStats,
} from '@/lib/api'
import { useAuth } from '@/auth/AuthProvider'
import { ADMIN_MANAGE_ROLES, MAX_ACCOUNTS, OWNER_EMAIL, ROLES, type Role } from '@/lib/constants'

export function AdminPage() {
  const { profile } = useAuth()
  const qc = useQueryClient()
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  })

  const canManage = !!profile?.role && ADMIN_MANAGE_ROLES.includes(profile.role)
  const [pwdModal, setPwdModal] = useState<{ id: string; email: string } | null>(null)
  const [password, setPassword] = useState('')
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => adminUpdateRole(id, role),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-stats'] }),
    onError: (e: Error) => setActionError(e.message),
  })

  const delMut = useMutation({
    mutationFn: adminDeleteAccount,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin-stats'] }),
    onError: (e: Error) => setActionError(e.message),
  })

  const pwdMut = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => adminSetPassword(id, password),
    onSuccess: () => {
      setPwdModal(null)
      setPassword('')
    },
    onError: (e: Error) => setActionError(e.message),
  })

  if (isLoading) return <PageLoader />
  if (isError || !data) {
    return (
      <EmptyState
        title="Admin stats unavailable"
        description={
          error instanceof Error
            ? error.message
            : 'Could not load local admin stats.'
        }
        action={
          <Button variant="secondary" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="!p-4">
          <p className="text-xs text-ink-muted">Seats used</p>
          <p className="text-2xl font-bold tabular">
            {data.seatsUsed}/{data.seatsMax || MAX_ACCOUNTS}
          </p>
          <p className="text-xs text-ink-dim">Owner excluded from cap</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-ink-muted">Accounts</p>
          <p className="text-2xl font-bold tabular">{data.accounts}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-ink-muted">Pipeline rows</p>
          <p className="text-2xl font-bold tabular">
            {data.candidates}c · {data.offers}o · {data.interviews}i
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-ink-muted">Estimated (aggregate)</p>
          <p className="text-2xl font-bold tabular">${data.estimated}</p>
          <p className="text-xs text-ink-dim">No per-account income exposed</p>
        </Card>
      </div>

      {actionError ? (
        <div className="rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-sm text-rose">
          {actionError}
          <p className="mt-1 text-xs text-ink-muted">
            Admin actions update accounts stored in this browser.
          </p>
        </div>
      ) : null}

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <CardTitle>Accounts</CardTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/[0.02] text-xs uppercase tracking-wide text-ink-dim">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Counts</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.perAccount.map((a) => {
                const isOwner = a.role === 'owner' || a.email === OWNER_EMAIL
                const isSelf = a.id === profile?.id
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{a.fullName || a.email}</p>
                      <p className="text-xs text-ink-dim">{a.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {canManage && !isOwner && !isSelf ? (
                        <Select
                          className="w-36"
                          value={a.role}
                          onChange={(e) =>
                            roleMut.mutate({ id: a.id, role: e.target.value as Role })
                          }
                        >
                          {ROLES.filter((r) => r !== 'owner').map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Badge tone={isOwner ? 'magenta' : 'violet'}>{a.role}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {a.candidates}c / {a.offers}o / {a.interviews}i / {a.earnings}e
                    </td>
                    <td className="px-4 py-3">
                      {canManage && !isOwner && !isSelf ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setActionError(null)
                              setResetLink(null)
                              setPwdModal({ id: a.id, email: a.email })
                            }}
                          >
                            Password
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              if (confirm(`Delete ${a.email}?`)) delMut.mutate(a.id)
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-dim">Protected</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin notes</CardTitle>
        </CardHeader>
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">
          <li>Owner cannot be demoted or deleted.</li>
          <li>Admins may only manage user/moderator targets.</li>
          <li>Income stays private per account on this device; stats show aggregates only.</li>
          <li>Reset generates a temporary password (no email) — copy it immediately.</li>
        </ul>
      </Card>

      <Modal
        open={!!pwdModal}
        onClose={() => setPwdModal(null)}
        title={`Password · ${pwdModal?.email ?? ''}`}
      >
        <div className="space-y-3">
          <div>
            <Label>Set new password</Label>
            <Input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!password || pwdMut.isPending}
              onClick={() => pwdModal && pwdMut.mutate({ id: pwdModal.id, password })}
            >
              Set password
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                if (!pwdModal) return
                try {
                  const link = await adminResetLink(pwdModal.id)
                  setResetLink(link)
                } catch (e) {
                  setActionError(e instanceof Error ? e.message : 'Reset failed')
                }
              }}
            >
              Generate reset link
            </Button>
          </div>
          {resetLink ? (
            <p className="break-all rounded-xl border border-border bg-canvas-raised p-3 text-xs text-cyan">
              {resetLink}
            </p>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
