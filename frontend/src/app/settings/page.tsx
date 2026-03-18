import { useAuth } from "@/context/AuthContext"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Link } from "react-router-dom"
import { ArrowRight, Bell, Eye, LockKeyhole, ShieldCheck, UserCircle2 } from "lucide-react"

const roleCapabilitySummary = {
  admin: "Manage users, platform access, imports, invites, and audit-sensitive workflows.",
  faculty: "Manage invites and support student/alumni engagement with operational visibility.",
  alumni: "Maintain your profile, respond to mentorship requests, and participate in events.",
  student: "Maintain your profile, request mentorship, explore directory, and join events."
} as const

const visibilityOptions = [
  {
    value: "public",
    label: "Public (all signed-in users)"
  },
  {
    value: "students_only",
    label: "Students only"
  },
  {
    value: "hidden",
    label: "Hidden"
  }
]

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
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          <ShieldCheck size={14} />
          Account Controls
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage account security and role-aware preferences with a consistent workspace setup.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-5">
          <div className="flex items-center gap-2 text-slate-900">
            <UserCircle2 size={16} />
            <h2 className="text-base font-semibold">Account Overview</h2>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              Signed in as <span className="font-medium">{user?.email}</span>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              Role: <span className="font-medium capitalize">{user?.role}</span>
            </div>
            {!!user?.profileId && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Link
                  className="inline-flex items-center gap-1 font-medium text-blue-700 hover:text-blue-800"
                  to={`/profile/${user.profileId}`}
                >
                  View linked profile
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-7">
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
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <Bell size={16} />
          <h2 className="text-base font-semibold">Preferences</h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">{roleHelp}</p>

        {settingsLoading ? (
          <p className="mt-4 text-sm text-slate-500">Loading preferences...</p>
        ) : (
          <div className="mt-4 space-y-4">
            {showProfileVisibility && (
              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Eye size={14} className="text-slate-500" />
                  <label className="text-sm font-medium text-slate-800">Profile visibility</label>
                </div>
                <select
                  value={preferences.profileVisibility}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      profileVisibility: e.target.value
                    }))
                  }
                  disabled={!settingsAvailable}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:opacity-60"
                >
                  {visibilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Controls directory visibility and profile discoverability.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {showMentorshipEmails && (
                <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
                  <span className="text-slate-700">Email mentorship updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.emailMentorship}
                    onChange={(e) => handlePreferenceChange("emailMentorship", e.target.checked)}
                    disabled={!settingsAvailable}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                </label>
              )}

              {showEventEmails && (
                <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
                  <span className="text-slate-700">Email event updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.emailEvents}
                    onChange={(e) => handlePreferenceChange("emailEvents", e.target.checked)}
                    disabled={!settingsAvailable}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
                  />
                </label>
              )}

              {showAnnouncementEmails && (
                <label className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm">
                  <span className="text-slate-700">Email announcement updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.emailAnnouncements}
                    onChange={(e) =>
                      handlePreferenceChange("emailAnnouncements", e.target.checked)
                    }
                    disabled={!settingsAvailable}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60"
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
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {settingsSaving ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        )}
      </section>

      <form
        onSubmit={handleChangePassword}
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 text-slate-900">
          <LockKeyhole size={16} />
          <h2 className="text-base font-semibold">Change Password</h2>
        </div>
        <div className="mt-4 space-y-4">
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  )
}
