import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import MentorshipRequestModal from "@/components/mentorship/MentorshipRequestModal.tsx"
import PrivateNotesPanel from "@/components/notes/PrivateNotesPanel"

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
}

export default function ProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()

  const [profile, setProfile] = useState<any>(null)
  const [profileType, setProfileType] = useState("")
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [showMentorshipModal, setShowMentorshipModal] = useState(false)

  const canViewNotes =
    (user?.role === "admin" || user?.role === "faculty") && id

  const canEdit =
    profile &&
    user?.id === profile.userId &&
    (user?.role === "student" || user?.role === "alumni")

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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSkillsChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      skills: e.target.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  function handleCancel() {
    setForm(profile)
    setEditing(false)
  }

  async function handleSave() {
    const endpoint =
      profileType === "alumni"
        ? "http://localhost:5000/alumni/me"
        : "http://localhost:5000/students/me"

    const payload = {
      ...form,
      graduationYear:
        form.graduationYear === "" ? null : Number(form.graduationYear),
    }

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      setProfile(data.profile)
      setForm(data.profile)
      setEditing(false)
    } catch (err) {
      console.error("Profile update error:", err)
    }
  }

  if (loading)
    return <p className="p-8 text-sm text-gray-500">Loading profile...</p>

  if (!profile)
    return <p className="p-8 text-sm text-gray-500">Profile not found</p>

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">

      {/* HEADER */}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

        <div className="h-24 bg-gradient-to-r from-blue-500 to-blue-400" />

        <div className="px-6 pb-6">

          <div className="flex flex-col md:flex-row md:justify-between gap-8">

            <div className="flex items-start gap-4">

              <div className="-mt-12 w-24 h-24 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center shadow-sm">

                <span className="text-blue-600 text-2xl font-semibold">
                  {initials(profile.firstName, profile.lastName)}
                </span>

              </div>

              <div className="pt-2">

                <h1 className="text-2xl font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>

                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {profileType === "alumni" ? "Alumni Profile" : "Student Profile"}
                </p>

                {profileType === "alumni" && profile.jobTitle && (
                  <p className="text-sm text-gray-700 mt-2">
                    {profile.jobTitle}
                    {profile.company && (
                      <span className="text-gray-500"> @ {profile.company}</span>
                    )}
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  {profile.program || "Program information has not been provided"}
                  {profile.graduationYear &&
                    ` • Class of ${profile.graduationYear}`}
                </p>

                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 mt-2 inline-block hover:underline"
                  >
                    View LinkedIn
                  </a>
                )}

              </div>

            </div>

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

              {canEdit && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="border border-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition"
                >
                  Edit Profile Details
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* EDUCATION */}

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

        <h2 className="text-sm font-medium text-gray-500 mb-4">
          Academic Background
        </h2>

        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-3">

            <input
              name="program"
              value={form.program || ""}
              onChange={handleChange}
              placeholder="Program"
              className="border px-3 py-2 rounded-md text-sm"
            />

            <input
              name="graduationYear"
              value={form.graduationYear || ""}
              onChange={handleChange}
              placeholder="Graduation Year"
              className="border px-3 py-2 rounded-md text-sm"
            />

          </div>
        ) : (
          <p className="text-gray-800">
            {profile.program || "Program information has not been provided"}
            {profile.graduationYear &&
              ` • Class of ${profile.graduationYear}`}
          </p>
        )}

      </div>

      {/* CAREER */}

      {profileType === "alumni" && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

          <h2 className="text-sm font-medium text-gray-500 mb-4">
            Professional Experience
          </h2>

          {editing ? (
            <div className="space-y-3">

              <input
                name="jobTitle"
                value={form.jobTitle || ""}
                onChange={handleChange}
                placeholder="Job Title"
                className="border px-3 py-2 rounded-md text-sm w-full"
              />

              <input
                name="company"
                value={form.company || ""}
                onChange={handleChange}
                placeholder="Company"
                className="border px-3 py-2 rounded-md text-sm w-full"
              />

            </div>
          ) : (
            <p className="text-gray-800">
              {profile.jobTitle || "No professional experience listed"}
              {profile.company ? ` @ ${profile.company}` : ""}
            </p>
          )}

        </div>
      )}

      {/* SKILLS */}

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

        <h2 className="text-sm font-medium text-gray-500 mb-4">
          Technical Skills
        </h2>

        {editing ? (
          <input
            value={form.skills?.join(", ") || ""}
            onChange={handleSkillsChange}
            placeholder="React, Node, MongoDB"
            className="border px-3 py-2 rounded-md text-sm w-full"
          />
        ) : profile.skills?.length ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string) => (
              <span
                key={skill}
                className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No skills have been added to this profile.
          </p>
        )}

      </div>

      {/* CONTACT */}

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

        <h2 className="text-sm font-medium text-gray-500 mb-4">
          Contact Information
        </h2>

        <p className="text-sm text-gray-700">
          Email: {profile.personalEmail || profile.schoolEmail || "Not available"}
        </p>

      </div>

      {/* PRIVATE NOTES */}

      {canViewNotes && (
        <PrivateNotesPanel
          profileId={id as string}
          profileType={profileType as "student" | "alumni"}
        />
      )}

      {editing && (
        <div className="flex gap-3 pt-2">

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700 transition"
          >
            Save Profile
          </button>

          <button
            onClick={handleCancel}
            className="border border-gray-200 px-5 py-2 rounded-md text-sm hover:bg-gray-50 transition"
          >
            Discard Changes
          </button>

        </div>
      )}

      {showMentorshipModal && id && (
        <MentorshipRequestModal
          alumniId={id}
          onClose={() => setShowMentorshipModal(false)}
        />
      )}

    </div>
  )
}