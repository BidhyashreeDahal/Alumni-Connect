import { useNavigate } from "react-router-dom"
import { Star } from "lucide-react"

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
}

export default function UserCard({ user }: any) {

  const navigate = useNavigate()
  const photoUrl =
    user?.profileId && user?.profileType
      ? `http://localhost:5000/profile-photo/${user.profileType}/${user.profileId}`
      : null

  function handleClick() {
    navigate(`/profile/${user.profileId}`)
  }

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >

      {/* Header */}
      <div className="mb-3 flex items-center gap-3">

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-semibold text-blue-700">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${user.firstName || ""} ${user.lastName || ""}`.trim() || "Profile"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            ) : null}
            <span>{initials(user.firstName, user.lastName)}</span>
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {user.firstName} {user.lastName}
              {user.profileReady && (
                <span
                  title={`Profile Ready (${user.profileCompletion || 90}% complete)`}
                  className="ml-2 inline-flex align-middle"
                >
                  <Star size={14} className="fill-blue-500 text-blue-500" />
                </span>
              )}
            </p>

            <p className="text-xs capitalize text-slate-500">
              {user.profileType}
            </p>
          </div>
        </div>
      </div>

      {/* Job */}
      {user.jobTitle && (
        <p className="mb-1 text-sm text-slate-700">
          {user.jobTitle} @ {user.company}
        </p>
      )}

      {/* Program */}
      <p className="text-sm text-slate-600">
        {user.program || "Program unavailable"}
        {user.graduationYear ? ` • Class of ${user.graduationYear}` : ""}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mt-3">

        {user.skills?.slice(0, 4).map((skill: string) => (
          <span
            key={skill}
            className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
          >
            {skill}
          </span>
        ))}

      </div>

      {/* Account status */}
      {!user.claimed && (
        <p className="mt-3 text-xs text-amber-700">
          Profile not yet activated
        </p>
      )}

    </div>
  )
}