import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import MentorshipRequestModal from "@/components/mentorship/MentorshipRequestModal.tsx"

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

                <p className="text-sm text-gray-500 capitalize mt-1">
                  {profileType}
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
                  {profile.program || "Program not added"}
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
                    View LinkedIn Profile
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
                    Request Mentorship
                  </button>
                )}

              {canEdit && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="border border-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition"
                >
                  Edit Profile
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* EDUCATION */}

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

        <h2 className="text-sm font-medium text-gray-500 mb-4">Education</h2>

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
              placeholder="Year"
              className="border px-3 py-2 rounded-md text-sm"
            />

          </div>
        ) : (
          <p className="text-gray-800">
            {profile.program || "Program not added"}
            {profile.graduationYear &&
              ` • Class of ${profile.graduationYear}`}
          </p>
        )}

      </div>

      {/* CAREER */}

      {profileType === "alumni" && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

          <h2 className="text-sm font-medium text-gray-500 mb-4">Career</h2>

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
              {profile.jobTitle || "Job title not added"}
              {profile.company ? ` @ ${profile.company}` : ""}
            </p>
          )}

        </div>
      )}

      {/* INTERESTS */}

      {profileType === "student" && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

          <h2 className="text-sm font-medium text-gray-500 mb-4">Interests</h2>

          {editing ? (
            <textarea
              name="interests"
              value={form.interests || ""}
              onChange={handleChange}
              className="border px-3 py-2 rounded-md text-sm w-full min-h-[120px]"
            />
          ) : (
            <p className="text-sm text-gray-700">
              {profile.interests || "No interests added yet."}
            </p>
          )}

        </div>
      )}

      {/* SKILLS */}

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

        <h2 className="text-sm font-medium text-gray-500 mb-4">Skills</h2>

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
                className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No skills added yet.</p>
        )}

      </div>
      
      {/* PROFESSIONAL LINKS */}

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

            <h2 className="text-sm font-medium text-gray-500 mb-4">
                Professional Links
            </h2>

            {editing ? (
                <div className="space-y-3">

                <input
                    name="linkedinUrl"
                    value={form.linkedinUrl || ""}
                    onChange={handleChange}
                    placeholder="LinkedIn URL"
                    className="border px-3 py-2 rounded-md text-sm w-full"
                />

                {profileType === "alumni" && (
                    <input
                    name="meetingLink"
                    value={form.meetingLink || ""}
                    onChange={handleChange}
                    placeholder="Meeting booking link (Calendly / Google booking page)"
                    className="border px-3 py-2 rounded-md text-sm w-full"
                    />
                )}

                </div>
            ) : (

                <div className="space-y-2 text-sm">

                {profile.linkedinUrl ? (
                    <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                    >
                    LinkedIn Profile
                    </a>
                ) : (
                    <p className="text-gray-500">LinkedIn not added</p>
                )}

                {profileType === "alumni" && profile.meetingLink && (
                    <p className="text-gray-500 text-xs">
                    Meeting booking link configured
                    </p>
                )}

                </div>

            )}

            </div>

      {/* CONTACT */}

      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">

        <h2 className="text-sm font-medium text-gray-500 mb-4">Contact</h2>

        <p className="text-sm text-gray-700">
          {profile.personalEmail || profile.schoolEmail || "Email unavailable"}
        </p>

      </div>

      {editing && (
        <div className="flex gap-3">

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700 transition"
          >
            Save Changes
          </button>

          <button
            onClick={handleCancel}
            className="border border-gray-200 px-5 py-2 rounded-md text-sm hover:bg-gray-50 transition"
          >
            Cancel
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