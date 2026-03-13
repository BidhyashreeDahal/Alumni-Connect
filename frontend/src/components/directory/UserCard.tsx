import { useNavigate } from "react-router-dom"

function initials(first?: string, last?: string) {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase()
}

export default function UserCard({ user }: any) {

  const navigate = useNavigate()

  function handleClick() {
    navigate(`/profile/${user.profileId}`)
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white border rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition cursor-pointer"
    >

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">

        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
          {initials(user.firstName, user.lastName)}
        </div>

        <div>
          <p className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </p>

          <p className="text-xs text-gray-500 capitalize">
            {user.profileType}
          </p>
        </div>

      </div>

      {/* Job */}
      {user.jobTitle && (
        <p className="text-sm text-gray-700 mb-1">
          {user.jobTitle} @ {user.company}
        </p>
      )}

      {/* Program */}
      <p className="text-sm text-gray-600">
        {user.program} • Class of {user.graduationYear}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mt-3">

        {user.skills?.slice(0, 4).map((skill: string) => (
          <span
            key={skill}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md"
          >
            {skill}
          </span>
        ))}

      </div>

      {/* Account status */}
      {!user.claimed && (
        <p className="text-xs text-gray-400 mt-3">
          Profile not yet activated
        </p>
      )}

    </div>
  )
}