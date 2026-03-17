import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Star } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import MentorshipRequestModal from "@/components/mentorship/MentorshipRequestModal.tsx"
import PrivateNotesPanel from "@/components/notes/PrivateNotesPanel"
import { invitesAPI } from "@/api/client"
import { computeProfileCompletion } from "@/utils/profileCompletion"

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
}

function withProtocol(url?: string | null) {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return `https://${url}`
}

export default function ProfilePage() {

  const { id } = useParams()
  const { user } = useAuth()

  const [profile, setProfile] = useState<any>(null)
  const [profileType, setProfileType] = useState("")
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saveError, setSaveError] = useState("")
  const [saveSuccess, setSaveSuccess] = useState("")
  const [saving, setSaving] = useState(false)

  const [showMentorshipModal, setShowMentorshipModal] = useState(false)
  const [photoVersion, setPhotoVersion] = useState(Date.now())
  const [photoMissing, setPhotoMissing] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [showPrivateNotes, setShowPrivateNotes] = useState(false)
  const apiBase = "http://localhost:5000"

  const canViewNotes =
    (user?.role === "admin" || user?.role === "faculty") && id

  const canEdit =
    profile &&
    user?.id === profile.userId &&
    (user?.role === "student" || user?.role === "alumni")

  const photoUrl =
    profile?.id && profileType
      ? `${apiBase}/profile-photo/${profileType}/${profile.id}?v=${photoVersion}`
      : null

  useEffect(() => {
    setPhotoMissing(false)
  }, [profile?.id, profileType, photoVersion])

  useEffect(() => {
    setShowPrivateNotes(false)
  }, [id, profileType])

  /* ---------------- INVITE STATE ---------------- */

  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")

  /* ---------------- LOAD PROFILE ---------------- */

  useEffect(() => {

    async function loadProfile() {

      try {

        let url = ""

        if (id) url = `http://localhost:5000/profiles/${id}`
        else if (user?.role === "student") url = "http://localhost:5000/students/me"
        else if (user?.role === "alumni") url = "http://localhost:5000/alumni/me"

        const res = await fetch(url, { credentials: "include" })
        const data = await res.json()

        if (!res.ok) throw new Error(data.message || "Failed to fetch profile")

        setProfile(data.profile)
        setForm(data.profile)

        if (id) setProfileType(data.profileType || user?.role || "")
        else setProfileType(user?.role || "")

      } catch (err) {
        console.error("Profile fetch error:", err)
      } finally {
        setLoading(false)
      }

    }

    if (user) loadProfile()

  }, [id, user])

  function handleCancel() {
    setForm(profile)
    setEditing(false)
    setSaveError("")
    setSaveSuccess("")
  }

  function updateField(name: string, value: string) {
    setForm((prev: any) => ({
      ...prev,
      [name]: value
    }))
  }

  function updateSkills(value: string) {
    setForm((prev: any) => ({
      ...prev,
      skills: value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }))
  }

  async function handleSave() {

    const endpoint =
      profileType === "alumni"
        ? "http://localhost:5000/alumni/me"
        : "http://localhost:5000/students/me"

    const payload = {
      ...form,
      graduationYear:
        form.graduationYear === "" ? null : Number(form.graduationYear)
    }

    try {
      setSaving(true)
      setSaveError("")
      setSaveSuccess("")

      const res = await fetch(endpoint, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setProfile(data.profile)
      setForm(data.profile)
      setEditing(false)
      setSaveSuccess("Profile updated successfully")

    } catch (err: any) {
      setSaveError(err?.message || "Failed to update profile")
      console.error("Profile update error:", err)
    } finally {
      setSaving(false)
    }

  }

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setPhotoUploading(true)
      setPhotoError("")

      const body = new FormData()
      body.append("photo", file)

      const res = await fetch(`${apiBase}/profile-photo/me`, {
        method: "POST",
        credentials: "include",
        body
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to upload photo")

      setPhotoVersion(Date.now())
      setPhotoMissing(false)
    } catch (err: any) {
      setPhotoError(err?.message || "Photo upload failed")
    } finally {
      setPhotoUploading(false)
      e.target.value = ""
    }
  }

  /* ---------------- INVITE FUNCTION ---------------- */

  async function sendInvite() {

    if (!id || !profileType) return

    try {

      setInviteLoading(true)
      setInviteMessage("")
      setInviteLink("")

      const data = await invitesAPI.create({
        profileId: id,
        type: profileType as "alumni" | "student"
      })

      setInviteLink(data.inviteLink)
      setInviteMessage("Invite link generated")

    } catch (err: any) {

      setInviteMessage(err?.response?.data?.message || err.message || "Failed to create invite")

    } finally {

      setInviteLoading(false)

    }

  }

  /* ---------------- LOADING STATES ---------------- */

  if (loading)
    return <p className="p-8 text-sm text-gray-500">Loading profile...</p>

  if (!profile)
    return <p className="p-8 text-sm text-gray-500">Profile not found</p>

  const completion = computeProfileCompletion(profile, profileType === "alumni" ? "alumni" : "student")

  /* ---------------- PAGE ---------------- */

  return (

    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">

      {/* HEADER */}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-400" />

        <div className="px-6 pb-6">

          <div className="flex flex-col md:flex-row md:justify-between gap-8">

            <div className="flex items-start gap-4">

              <div className="-mt-12 w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-sm overflow-hidden">
                {photoUrl && !photoMissing ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                      setPhotoMissing(true)
                    }}
                  />
                ) : null}
                {(!photoUrl || photoMissing) && (
                  <span className="text-blue-600 text-2xl font-semibold">
                    {initials(profile.firstName, profile.lastName)}
                  </span>
                )}
              </div>

              <div className="pt-2">

                <h1 className="text-2xl font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>

                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {profileType === "alumni"
                    ? "Alumni Profile"
                    : "Student Profile"}
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    <Star size={12} className={completion.ready ? "fill-blue-500 text-blue-500" : "text-blue-500"} />
                    {completion.ready ? "Profile Ready" : `${completion.score}% Complete`}
                  </span>
                </p>

                {profileType === "alumni" && profile.jobTitle && (
                  <p className="text-sm text-gray-700 mt-2">
                    {profile.jobTitle}
                    {profile.company && (
                      <span className="text-gray-500">
                        {" "}@ {profile.company}
                      </span>
                    )}
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  {profile.program || "Program information has not been provided"}
                  {profile.graduationYear &&
                    ` • Class of ${profile.graduationYear}`}
                </p>

              </div>

            </div>

            {/* ACTION BUTTONS */}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

              {user?.role === "student" &&
                profileType === "alumni" &&
                id && (
                  <button
                    onClick={() => setShowMentorshipModal(true)}
                    className="bg-white text-blue-600 border border-blue-200 px-4 py-2 rounded-md text-sm hover:bg-blue-50 transition"
                  >
                    Request Mentorship Session
                  </button>
                )}

              {(user?.role === "admin" || user?.role === "faculty") &&
                id &&
                !profile.userId && (
                  <button
                    onClick={sendInvite}
                    className="border border-blue-200 text-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-50 transition"
                  >
                    {inviteLoading ? "Sending..." : "Send Invite"}
                  </button>
                )}

              {canViewNotes && (
                <button
                  onClick={() => setShowPrivateNotes((prev) => !prev)}
                  className="border border-slate-300 px-4 py-2 rounded-md text-sm hover:bg-slate-50 transition"
                >
                  {showPrivateNotes ? "Hide Private Notes" : "Private Notes"}
                </button>
              )}

              {canEdit && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="border border-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition"
                >
                  Edit Profile Details
                </button>
              )}

              {canEdit && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFile}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-slate-300 px-4 py-2 rounded-md text-sm hover:bg-slate-50 transition"
                  >
                    {photoUploading ? "Uploading..." : "Upload Photo"}
                  </button>
                </>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* INVITE LINK DISPLAY */}

      {inviteLink && (

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">

          <p className="text-blue-700 font-medium">
            Invite Created
          </p>

          <p className="text-slate-600 mt-1">
            Copy and send this link to the user:
          </p>

          <div className="mt-2 flex items-center gap-2">

            <input
              value={inviteLink}
              readOnly
              className="flex-1 border px-2 py-1 rounded text-xs"
            />

            <button
              onClick={() => navigator.clipboard.writeText(inviteLink)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              Copy
            </button>

          </div>

        </div>

      )}

      {inviteMessage && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {inviteMessage}
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {saveSuccess}
        </div>
      )}

      {photoError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {photoError}
        </div>
      )}

      {canViewNotes && showPrivateNotes && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <PrivateNotesPanel
            profileId={id as string}
            profileType={profileType as "student" | "alumni"}
          />
        </div>
      )}

      {editing && (

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Edit Profile Details</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm text-slate-600">First name</label>
              <input
                value={form.firstName || ""}
                onChange={(e) => updateField("firstName", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-600">Last name</label>
              <input
                value={form.lastName || ""}
                onChange={(e) => updateField("lastName", e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            {profileType === "student" && (
              <>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Program</label>
                  <input
                    value={form.program || ""}
                    onChange={(e) => updateField("program", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Graduation year</label>
                  <input
                    type="number"
                    value={form.graduationYear ?? ""}
                    onChange={(e) => updateField("graduationYear", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}

            {profileType === "alumni" && (
              <>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Personal email</label>
                  <input
                    type="email"
                    value={form.personalEmail || ""}
                    onChange={(e) => updateField("personalEmail", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Job title</label>
                  <input
                    value={form.jobTitle || ""}
                    onChange={(e) => updateField("jobTitle", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">Company</label>
                  <input
                    value={form.company || ""}
                    onChange={(e) => updateField("company", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-600">LinkedIn URL</label>
                  <input
                    value={form.linkedinUrl || ""}
                    onChange={(e) => updateField("linkedinUrl", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm text-slate-600">Meeting link</label>
                  <input
                    value={form.meetingLink || ""}
                    onChange={(e) => updateField("meetingLink", e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm text-slate-600">Skills (comma separated)</label>
              <input
                value={Array.isArray(form.skills) ? form.skills.join(", ") : ""}
                onChange={(e) => updateSkills(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            {profileType === "student" && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm text-slate-600">Interests</label>
                <textarea
                  value={form.interests || ""}
                  onChange={(e) => updateField("interests", e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            )}
          </div>

          {saveError && (
            <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{saveError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>

            <button
              onClick={handleCancel}
              className="border border-gray-200 px-5 py-2 rounded-md text-sm hover:bg-gray-50 transition"
            >
              Discard Changes
            </button>
          </div>
        </div>

      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">About</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
            <p className="mt-1 text-sm font-medium capitalize text-slate-900">{profileType || "—"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Program</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{profile.program || "—"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Graduation Year</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{profile.graduationYear || "—"}</p>
          </div>
          {profileType === "alumni" ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Current Role</p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {profile.jobTitle || "—"}{profile.company ? ` @ ${profile.company}` : ""}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Interests</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{profile.interests || "—"}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Contact & Links</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">School Email</p>
            {profile.schoolEmail ? (
              <a href={`mailto:${profile.schoolEmail}`} className="mt-1 inline-block text-blue-700 hover:underline">
                {profile.schoolEmail}
              </a>
            ) : (
              <p className="mt-1 text-slate-500">Hidden / Not set</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Personal Email</p>
            {profile.personalEmail ? (
              <a href={`mailto:${profile.personalEmail}`} className="mt-1 inline-block text-blue-700 hover:underline">
                {profile.personalEmail}
              </a>
            ) : (
              <p className="mt-1 text-slate-500">Hidden / Not set</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 px-4 py-3 md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-500">LinkedIn</p>
            {profile.linkedinUrl ? (
              <a
                href={withProtocol(profile.linkedinUrl)}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block break-all text-blue-700 hover:underline"
              >
                {profile.linkedinUrl}
              </a>
            ) : (
              <p className="mt-1 text-slate-500">—</p>
            )}
          </div>
          {profileType === "alumni" && (
            <div className="rounded-lg border border-slate-200 px-4 py-3 md:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Meeting Link</p>
              {profile.meetingLink ? (
                <a
                  href={withProtocol(profile.meetingLink)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block break-all text-blue-700 hover:underline"
                >
                  {profile.meetingLink}
                </a>
              ) : (
                <p className="mt-1 text-slate-500">—</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(profile.skills || []).length > 0 ? (
            (profile.skills || []).map((skill: string) => (
              <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">No skills added</span>
          )}
        </div>
        {profileType === "alumni" && (
          <p className="mt-4 text-sm text-slate-600">
            <span className="text-slate-500">Company:</span> {profile.company || "—"}
          </p>
        )}
        {profileType === "alumni" && (
          <p className="mt-1 text-sm text-slate-600">
            <span className="text-slate-500">Job Title:</span> {profile.jobTitle || "—"}
          </p>
        )}
        {profileType === "student" && (
          <p className="mt-4 text-sm text-slate-600">
            <span className="text-slate-500">Interests:</span> {profile.interests || "—"}
          </p>
        )}
      </div>

      {/* MENTORSHIP MODAL */}

      {showMentorshipModal && id && (
        <MentorshipRequestModal
          alumniId={id}
          onClose={() => setShowMentorshipModal(false)}
        />
      )}

    </div>

  )

}