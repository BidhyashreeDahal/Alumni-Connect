import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
}

export default function ProfilePage() {

  const { id } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:5000/profiles/${id}`, {
      credentials: "include"
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile)
        setLoading(false)
      })
      .catch(err => {
        console.error("Profile fetch error:", err)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return <p className="p-8 text-gray-500">Loading profile...</p>
  }

  if (!profile) {
    return <p className="p-8 text-gray-500">Profile not found</p>
  }

  return (
    <div className="p-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">

        <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-semibold">
          {initials(profile.firstName, profile.lastName)}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {profile.firstName} {profile.lastName}
          </h1>

          {profile.jobTitle && (
            <p className="text-sm text-gray-600">
              {profile.jobTitle} @ {profile.company}
            </p>
          )}
        </div>

      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 mb-1">
          Education
        </h2>

        <p className="text-gray-800">
          {profile.program} • Class of {profile.graduationYear}
        </p>
      </div>

      {/* Skills */}
      <div className="mb-6">

        <h2 className="text-sm font-medium text-gray-500 mb-2">
          Skills
        </h2>

        <div className="flex flex-wrap gap-2">

          {profile.skills?.map((skill: string) => (
            <span
              key={skill}
              className="text-xs bg-gray-100 px-2 py-1 rounded-md"
            >
              {skill}
            </span>
          ))}

        </div>

      </div>

      {/* Contact */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-1">
          Contact
        </h2>

        <p className="text-sm text-gray-700">
          {profile.personalEmail || profile.schoolEmail || "Email not available"}
        </p>
      </div>

    </div>
  )
}