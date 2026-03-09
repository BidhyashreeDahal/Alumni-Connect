import { Link } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Handshake,
  Calendar,
  BarChart3
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"

export default function Sidebar() {
  const { user } = useAuth()

  const role = user?.role

  return (
    <aside className="w-64 bg-white border-r flex flex-col">

      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b font-bold text-lg">
        Alumni Connect
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4 text-sm">

        <Link
          to="/dashboard"
          className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </Link>

        {(role === "student" || role === "faculty" || role === "admin") && (
          <Link
            to="/directory"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
          >
            <Users size={18} />
            Alumni Directory
          </Link>
        )}

        {(role === "student" || role === "alumni") && (
          <Link
            to="/mentorship"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
          >
            <Handshake size={18} />
            Mentorship
          </Link>
        )}

        <Link
          to="/events"
          className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
        >
          <Calendar size={18} />
          Events
        </Link>

        {role === "admin" && (
          <Link
            to="/analytics"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
          >
            <BarChart3 size={18} />
            Analytics
          </Link>
        )}

      </nav>

      {/* Footer */}
      <div className="mt-auto border-t p-4 text-xs text-gray-500">
        Alumni Connect Platform
      </div>

    </aside>
  )
}