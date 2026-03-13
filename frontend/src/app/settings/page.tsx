import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import { api } from "@/lib/api"

export default function SettingsPage() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword.length < 10) {
      setError("New password must be at least 10 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match")
      return
    }

    try {
      setSaving(true)
      const res = await api.patch("/auth/password", {
        currentPassword,
        newPassword
      })

      setSuccess(res.data?.message || "Password updated")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to change password")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Account preferences and password security.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm space-y-2">
        <p>
          Signed in as <span className="font-medium">{user?.email}</span>
        </p>
        <p>
          Role: <span className="font-medium capitalize">{user?.role}</span>
        </p>
      </div>

      <form
        onSubmit={handleChangePassword}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
      >
        <h2 className="text-base font-semibold text-slate-900">Change Password</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Current password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">New password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <p className="text-xs text-slate-500">Minimum 10 characters.</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Confirm new password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>

        {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        {success && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  )
}
