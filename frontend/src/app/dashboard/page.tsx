import { useAuth } from "@/context/AuthContext"
import StudentDashboard from "./dashboards/StudentDashboard"
import AlumniDashboard from "./dashboards/AlumniDashboard"
import FacultyDashboard from "./dashboards/FacultyDashboard"
import AdminDashboard from "./dashboards/AdminDashboard"

export default function DashboardPage() {

  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {

    case "student":
      return <StudentDashboard />

    case "alumni":
      return <AlumniDashboard />

    case "faculty":
      return <FacultyDashboard />

    case "admin":
      return <AdminDashboard />

  }

}