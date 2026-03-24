import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { getUserErrorMessage } from "@/lib/error"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

type AdminUser = {
  id: string
  email: string
  role: "admin" | "faculty" | "student" | "alumni"
  isActive: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [pendingConfirm, setPendingConfirm] = useState<{
    userId: string
    title: string
    message: string
    payload: Partial<Pick<AdminUser, "role" | "isActive">>
    confirmLabel: string
    tone: "danger" | "default"
  } | null>(null)

  async function loadUsers() {
    try {
      const res = await api.get("/users")
      setUsers(res.data.users || [])
    } catch (err: any) {
     setError(getUserErrorMessage(err, "Failed to load users"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function updateUser(id: string, payload: Partial<Pick<AdminUser, "role" | "isActive">>) {
    try {
      setSavingUserId(id)
      setError("")
      await api.patch(`/users/${id}`, payload)
      await loadUsers()
    } catch (err: any) {
      setError(getUserErrorMessage(err, "Failed to update user"))
    } finally {
      setSavingUserId(null)
    }
  }

  async function confirmPendingAction() {
    if (!pendingConfirm) return
    await updateUser(pendingConfirm.userId, pendingConfirm.payload)
    setPendingConfirm(null)
  }

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Admin User Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage role assignments and account activation status.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-800">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
                    value={user.role}
                    disabled={savingUserId === user.id}
                    onChange={(e) =>
                      setPendingConfirm({
                        userId: user.id,
                        title: "Change User Role",
                        message: `Change role for ${user.email} from ${user.role} to ${e.target.value}?`,
                        payload: { role: e.target.value as AdminUser["role"] },
                        confirmLabel: "Change Role",
                        tone: "default"
                      })
                    }
                  >
                    <option value="admin">admin</option>
                    <option value="faculty">faculty</option>
                    <option value="alumni">alumni</option>
                    <option value="student">student</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button
                    disabled={savingUserId === user.id}
                    onClick={() =>
                      setPendingConfirm({
                        userId: user.id,
                        title: user.isActive ? "Deactivate User" : "Activate User",
                        message: user.isActive
                          ? `Deactivate ${user.email}? They will not be able to sign in.`
                          : `Activate ${user.email}? They will be able to sign in again.`,
                        payload: { isActive: !user.isActive },
                        confirmLabel: user.isActive ? "Deactivate" : "Activate",
                        tone: user.isActive ? "danger" : "default"
                      })
                    }
                    className={`rounded-md px-3 py-1 text-xs font-semibold text-white ${
                      user.isActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-500 hover:bg-slate-600"
                    }`}
                  >
                    {user.isActive ? "Active" : "Disabled"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(pendingConfirm)}
        title={pendingConfirm?.title || "Confirm Action"}
        message={pendingConfirm?.message || "Please confirm this action."}
        confirmLabel={pendingConfirm?.confirmLabel || "Confirm"}
        tone={pendingConfirm?.tone || "default"}
        loading={Boolean(pendingConfirm && savingUserId === pendingConfirm.userId)}
        onCancel={() => setPendingConfirm(null)}
        onConfirm={confirmPendingAction}
      />
    </div>
  )
}
