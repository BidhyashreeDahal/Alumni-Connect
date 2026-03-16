import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import MentorshipRequestModal from "@/components/mentorship/MentorshipRequestModal.tsx"
import PrivateNotesPanel from "@/components/notes/PrivateNotesPanel"
import { invitesAPI } from "@/api/client"

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

  /* ---------------- FORM HANDLERS ---------------- */

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
        .filter(Boolean)
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
        form.graduationYear === "" ? null : Number(form.graduationYear)
    }

    try {

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

    } catch (err) {
      console.error("Profile update error:", err)
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

  /* ---------------- PAGE ---------------- */

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
                  {profileType === "alumni"
                    ? "Alumni Profile"
                    : "Student Profile"}
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

      {/* PRIVATE NOTES */}

      {canViewNotes && (
        <PrivateNotesPanel
          profileId={id as string}
          profileType={profileType as "student" | "alumni"}
        />
      )}

      {/* SAVE BUTTONS */}

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