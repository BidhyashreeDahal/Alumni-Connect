import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Handshake,
  Calendar,
  BarChart3,
  GraduationCap,
  Megaphone,
  User,
  Settings,
  Mail,
  Upload,
  Bell,
  Shield
} from "lucide-react"

import { useAuth } from "@/context/AuthContext"

export default function Sidebar() {
  const { user } = useAuth()
  const role = user?.role

  const linkStyle =
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium"

  const activeStyle = "bg-blue-50 text-blue-600"
  const inactiveStyle = "text-gray-600 hover:bg-gray-100"

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`

  return (
    <aside className="w-64 bg-white border-r flex flex-col">

      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b">
        <GraduationCap className="text-blue-600" size={22} />
        <span className="font-semibold text-lg">
          Alumni Connect
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-4">

        {/* Dashboard */}
        <NavLink to="/dashboard" className={navClass}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* Directory (student, faculty, admin) */}
       {role && (
          <NavLink to="/directory" className={navClass}>
          <Users size={18} />
            Directory
           </NavLink>
          )}

        {/* Mentorship */}
        {(role === "student" || role === "alumni") && (
          <NavLink to="/mentorship" className={navClass}>
            <Handshake size={18} />
            Mentorship
          </NavLink>
        )}

        {/* Events */}
        <NavLink to="/events" className={navClass}>
          <Calendar size={18} />
          Events
        </NavLink>

        {/* Announcements */}
        <NavLink to="/announcements" className={navClass}>
          <Megaphone size={18} />
          Announcements
        </NavLink>

        {/* Faculty + Admin Tools */}
        {(role === "faculty" || role === "admin") && (
          <>
            <NavLink to="/invite" className={navClass}>
              <Mail size={18} />
              Send Invites
            </NavLink>

            <NavLink to="/import" className={navClass}>
              <Upload size={18} />
              Bulk Import
            </NavLink>

            <NavLink to="/reminders" className={navClass}>
              <Bell size={18} />
              Reminders
            </NavLink>
          </>
        )}

        {/* Admin */}
        {role === "admin" && (
          <>
            <NavLink to="/analytics" className={navClass}>
              <BarChart3 size={18} />
              Analytics
            </NavLink>

            <NavLink to="/admin" className={navClass}>
              <Shield size={18} />
              Admin Management
            </NavLink>
          </>
        )}

        {/* Profile */}
        {(role === "student" || role === "alumni") && (
          <NavLink to="/profile" className={navClass}>
            <User size={18} />
            Profile
          </NavLink>
        )}

        {/* Settings */}
        <NavLink to="/settings" className={navClass}>
          <Settings size={18} />
          Settings
        </NavLink>

      </nav>

      <div className="mt-auto border-t p-4 text-xs text-gray-500">
        Alumni Connect Platform
      </div>

    </aside>
  )
}