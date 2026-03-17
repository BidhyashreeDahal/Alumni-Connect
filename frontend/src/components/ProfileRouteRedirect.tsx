import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export default function ProfileRouteRedirect() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading profile...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.profileId) {
    return <Navigate to={`/profile/${user.profileId}`} replace />
  }

  if (user.role === "admin" || user.role === "faculty") {
    return <Navigate to="/directory" replace />
  }

  return <Navigate to="/dashboard" replace />
}
