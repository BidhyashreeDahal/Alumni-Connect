import { MapPin, Briefcase } from "lucide-react"

export default function UserCard({ user }: any) {

  return (
    <div className="bg-white border rounded-xl p-5 hover:shadow-md transition">

      {/* Name */}
      <h3 className="font-medium text-gray-900 text-lg">
        {user.firstName} {user.lastName}
      </h3>

      {/* Role */}
      <p className="text-sm text-gray-500 mb-2">
        {user.profileType === "alumni" ? "Alumni" : "Student"}
      </p>

      {/* Job */}
      {user.jobTitle && (
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
          <Briefcase size={14}/>
          {user.jobTitle} @ {user.company}
        </div>
      )}

      {/* Program */}
      <p className="text-sm text-gray-600">
        {user.program} • Class of {user.graduationYear}
      </p>

      {/* Skills */}
      <div className="flex flex-wrap gap-2 mt-3">
        {user.skills?.slice(0,3).map((skill: string) => (
          <span
            key={skill}
            className="text-xs bg-gray-100 px-2 py-1 rounded"
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