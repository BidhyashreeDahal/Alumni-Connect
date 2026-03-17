import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Link } from "react-router-dom"

const roleCapabilitySummary = {
  admin: "Manage users, platform access, imports, invites, and audit-sensitive workflows.",
  faculty: "Manage invites and support student/alumni engagement with operational visibility.",
  alumni: "Maintain your profile, respond to mentorship requests, and participate in events.",
  student: "Maintain your profile, request mentorship, explore directory, and join events."
} as const

const rolePreferenceHelp = {
  admin:
    "Admins receive operational communications only. Mentorship notifications are not used for admin accounts.",
  faculty:
    "Faculty receive platform communications only. Mentorship notifications are not used for faculty accounts.",
  alumni:
    "Control profile discoverability and choose which updates you receive by email.",
  student:
    "Control basic profile discoverability and choose event/announcement email updates."
} as const

const roleQuickLinks = {
  admin: [
    { label: "User Management", to: "/adminmanagement" },
    { label: "Invites", to: "/invite" },
    { label: "Bulk Import", to: "/bulk-import" }
  ],
  faculty: [
    { label: "Invites", to: "/invite" },
    { label: "Directory", to: "/directory" },
    { label: "Analytics", to: "/analytics" }
  ],
  alumni: [
    { label: "My Profile", to: "/profile" },
    { label: "Mentorship", to: "/mentorship" },
    { label: "Events", to: "/events" }
  ],
  student: [
    { label: "My Profile", to: "/profile" },
    { label: "Mentorship", to: "/mentorship" },
    { label: "Directory", to: "/directory?profileType=alumni" }
  ]
} as const

export default function SettingsPage() {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [settingsLoading, setSettingsLoading] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsError, setSettingsError] = useState("")
  const [settingsSuccess, setSettingsSuccess] = useState("")
  const [settingsAvailable, setSettingsAvailable] = useState(true)
  const role = user?.role
  const quickLinks = role ? roleQuickLinks[role] : []
  const roleSummary = role ? roleCapabilitySummary[role] : ""
  const roleHelp = role ? rolePreferenceHelp[role] : ""
  const showProfileVisibility = role === "alumni" || role === "student"
  const showMentorshipEmails = role === "alumni"
  const showEventEmails = !!role
  const showAnnouncementEmails = !!role
  const [preferences, setPreferences] = useState({
    profileVisibility: "students_only",
    emailMentorship: true,
    emailEvents: true,
    emailAnnouncements: true
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        setSettingsLoading(true)
        setSettingsError("")
        const res = await api.get("/settings/me")
        if (res?.data?.settings) {
          setPreferences((prev) => ({ ...prev, ...res.data.settings }))
        }
        setSettingsAvailable(true)
      } catch (err: any) {
        const status = err?.response?.status
        if (status === 503 || status === 404) {
          setSettingsAvailable(false)
          setSettingsError(
            "Settings preferences API is not ready yet. Apply schema migration and regenerate Prisma client."
          )
        } else {
          setSettingsError(err?.response?.data?.message || "Failed to load preferences")
        }
      } finally {
        setSettingsLoading(false)
      }
    }

    if (user) {
      loadSettings()
    }
  }, [user])

  function handlePreferenceChange(
    key: "emailMentorship" | "emailEvents" | "emailAnnouncements",
    value: boolean
  ) {
    setPreferences((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  async function savePreferences() {
    try {
      setSettingsSaving(true)
      setSettingsError("")
      setSettingsSuccess("")
      const payload: Record<string, any> = {}

      if (showProfileVisibility) payload.profileVisibility = preferences.profileVisibility
      if (showMentorshipEmails) payload.emailMentorship = preferences.emailMentorship
      if (showEventEmails) payload.emailEvents = preferences.emailEvents
      if (showAnnouncementEmails) payload.emailAnnouncements = preferences.emailAnnouncements

      const res = await api.patch("/settings/me", payload)
      setPreferences((prev) => ({ ...prev, ...(res?.data?.settings || {}) }))
      setSettingsSuccess("Preferences updated")
      setSettingsAvailable(true)
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 503 || status === 404) {
        setSettingsAvailable(false)
      }
      setSettingsError(err?.response?.data?.message || "Failed to update preferences")
    } finally {
      setSettingsSaving(false)
    }
  }

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
          Role-aware account controls and password security.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm space-y-2">
        <p>
          Signed in as <span className="font-medium">{user?.email}</span>
        </p>
        <p>
          Role: <span className="font-medium capitalize">{user?.role}</span>
        </p>
        {!!user?.profileId && (
          <p>
            Linked profile:{" "}
            <Link
              className="font-medium text-brand-700 hover:text-brand-800"
              to={`/profile/${user.profileId}`}
            >
              View profile
            </Link>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Role Access Summary</h2>
        <p className="mt-2 text-sm text-slate-600">{roleSummary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-slate-900">Preferences</h2>
        <p className="text-sm text-slate-600">{roleHelp}</p>

        {settingsLoading ? (
          <p className="text-sm text-slate-500">Loading preferences...</p>
        ) : (
          <>
            {showProfileVisibility && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Profile visibility</label>
                <select
                  value={preferences.profileVisibility}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      profileVisibility: e.target.value
                    }))
                  }
                  disabled={!settingsAvailable}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:opacity-60"
                >
                  <option value="public">Public (all signed-in users)</option>
                  <option value="students_only">Students only</option>
                  <option value="hidden">Hidden</option>
                </select>
                <p className="text-xs text-slate-500">
                  Controls directory visibility and profile discoverability.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {showMentorshipEmails && (
                <label className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <span>Email mentorship updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.emailMentorship}
                    onChange={(e) => handlePreferenceChange("emailMentorship", e.target.checked)}
                    disabled={!settingsAvailable}
                  />
                </label>
              )}

              {showEventEmails && (
                <label className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <span>Email event updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.emailEvents}
                    onChange={(e) => handlePreferenceChange("emailEvents", e.target.checked)}
                    disabled={!settingsAvailable}
                  />
                </label>
              )}

              {showAnnouncementEmails && (
                <label className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <span>Email announcement updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.emailAnnouncements}
                    onChange={(e) =>
                      handlePreferenceChange("emailAnnouncements", e.target.checked)
                    }
                    disabled={!settingsAvailable}
                  />
                </label>
              )}
            </div>

            {settingsError && (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {settingsError}
              </p>
            )}
            {settingsSuccess && (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {settingsSuccess}
              </p>
            )}

            <button
              type="button"
              onClick={savePreferences}
              disabled={!settingsAvailable || settingsSaving}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {settingsSaving ? "Saving..." : "Save Preferences"}
            </button>
          </>
        )}
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
