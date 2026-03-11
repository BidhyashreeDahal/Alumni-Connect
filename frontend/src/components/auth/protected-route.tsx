import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth.ts"

export default function ProtectedRoute({
  children,
  roles
}: any) {

  const { user, loading } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!user) return <Navigate to="/login" />

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" />
  }

  return children
}