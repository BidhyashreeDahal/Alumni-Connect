import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { usersAPI } from "@/api/client"
import { getUserErrorMessage } from "@/lib/error"
import ConfirmDialog from "@/components/ui/ConfirmDialog"

type User = {
  id: string
  email: string
  role: "admin" | "faculty" | "student" | "alumni"
  isActive: boolean
  createdAt: string
}

export default function AdminManagementPage() {

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingUserId, setSavingUserId] = useState<string | null>(null)
  const [pendingConfirm, setPendingConfirm] = useState<{
    userId: string
    title: string
    message: string
    payload: Partial<Pick<User, "role" | "isActive">>
    confirmLabel: string
    tone: "danger" | "default"
  } | null>(null)

  const [page, setPage] = useState(1)
  const pageSize = 10
  const [totalPages, setTotalPages] = useState(1)

  async function loadUsers() {

    try {
      setLoading(true)
      setError("")
      const data = await usersAPI.list({ page, pageSize })

      setUsers(data.users || [])
      setTotalPages(data.meta?.totalPages || 1)

    } catch (err: any) {
      setError(getUserErrorMessage(err, "Failed to load users"))
      console.error("Failed to load users", err)

    } finally {

      setLoading(false)

    }

  }

  async function updateUser(userId: string, payload: Partial<Pick<User, "role" | "isActive">>) {
    try {
      setSavingUserId(userId)
      setError("")
      await usersAPI.update(userId, payload)
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

  useEffect(() => {
    loadUsers()
  }, [page])

  if (loading) {
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading users...
      </div>
    )
  }

  return (

    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Admin Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage platform accounts and permissions
          </p>
        </div>

        <Link
          to="/admin/create-faculty"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition"
        >
          + Create Faculty
        </Link>

      </div>

      {/* Table */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {error && (
          <div className="border-b border-rose-100 bg-rose-50 px-6 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <table className="w-full text-sm">

          <thead className="bg-slate-50 text-slate-600">

            <tr className="text-left">

              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Created</th>
              <th className="px-6 py-3">Actions</th>

            </tr>

          </thead>

          <tbody>

            {users.map(user => (

              <tr key={user.id} className="border-t">

                <td className="px-6 py-4 text-slate-700">
                  {user.email}
                </td>

                <td className="px-6 py-4">

                  <select
                    value={user.role}
                    onChange={(e) =>
                      setPendingConfirm({
                        userId: user.id,
                        title: "Change User Role",
                        message: `Change role for ${user.email} from ${user.role} to ${e.target.value}?`,
                        payload: { role: e.target.value as User["role"] },
                        confirmLabel: "Change Role",
                        tone: "default"
                      })
                    }
                    disabled={savingUserId === user.id}
                    className="border border-slate-300 rounded-md px-2 py-1 text-sm"
                  >

                    <option value="admin">Admin</option>
                    <option value="faculty">Faculty</option>
                    <option value="student">Student</option>
                    <option value="alumni">Alumni</option>

                  </select>

                </td>

                <td className="px-6 py-4">

                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.isActive ? "Active" : "Disabled"}
                  </span>

                </td>

                <td className="px-6 py-4 text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">

                  <button
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
                    disabled={savingUserId === user.id}
                    className="text-blue-600 hover:underline"
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Pagination */}

      {totalPages > 1 && (

        <div className="flex items-center justify-between pt-4">

          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next
          </button>

        </div>

      )}

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