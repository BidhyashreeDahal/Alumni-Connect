import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Handshake,
  Calendar,
  BarChart3,
  GraduationCap,
} from "lucide-react"

import { useAuth } from "@/hooks/useAuth"

export default function Sidebar() {
  const { user } = useAuth()
  const role = user?.role

  const linkStyle =
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium"

  const activeStyle = "bg-blue-50 text-blue-600"
  const inactiveStyle = "text-gray-600 hover:bg-gray-100"

  return (
    <aside className="w-64 bg-white border-r flex flex-col">

      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b">
        <GraduationCap className="text-blue-600" size={22} />
        <span className="font-semibold text-lg">
          Alumni Connect
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {(role === "student" || role === "faculty" || role === "admin") && (
          <NavLink
            to="/directory"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            <Users size={18} />
            Alumni Directory
          </NavLink>
        )}

        {(role === "student" || role === "alumni") && (
          <NavLink
            to="/mentorship"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            <Handshake size={18} />
            Mentorship
          </NavLink>
        )}

        <NavLink
          to="/events"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`
          }
        >
          <Calendar size={18} />
          Events
        </NavLink>

        {role === "admin" && (
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            <BarChart3 size={18} />
            Analytics
          </NavLink>
        )}

      </nav>

      <div className="mt-auto border-t p-4 text-xs text-gray-500">
        Alumni Connect Platform
      </div>
    </aside>
  )
}