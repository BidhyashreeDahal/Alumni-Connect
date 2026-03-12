import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

type Props = {
  allow: string[]
}

export default function RoleGuard({ allow }: Props) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}