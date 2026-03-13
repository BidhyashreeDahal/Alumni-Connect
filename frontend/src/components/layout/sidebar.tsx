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
    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"

  const activeStyle = "bg-blue-600 text-white shadow-sm"
  const inactiveStyle = "text-slate-600 hover:bg-slate-100 hover:text-slate-900"

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-slate-200 bg-white/90 backdrop-blur">

      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <GraduationCap size={19} />
        </div>
        <span className="text-lg font-semibold tracking-tight text-slate-900">
          Alumni Connect
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Core
        </p>

        {/* Dashboard */}
        <NavLink to="/dashboard" className={navClass}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* Directory */}
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
            <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Operations
            </p>
            <NavLink to="/invite" className={navClass}>
              <Mail size={18} />
              Send Invites
            </NavLink>

            <NavLink to="/bulk-import" className={navClass}>
              <Upload size={18} />
              Bulk Import
            </NavLink>

            <NavLink to="/reminders" className={navClass}>
              <Bell size={18} />
              Reminders
            </NavLink>
          </>
        )}

        {/* Analytics */}
        {(role === "admin" || role === "faculty") && (
          <>
            <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Insights
            </p>
            <NavLink to="/analytics" className={navClass}>
              <BarChart3 size={18} />
              Analytics
            </NavLink>
          </>
        )}

        {/* Admin */}
        {role === "admin" && (
          <>
            <NavLink to="/admin/users" className={navClass}>
              <Shield size={18} />
              Admin Management
            </NavLink>
          </>
        )}

        {/* Profile */}
        {(role === "student" || role === "alumni") && (
          <>
          <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Account
          </p>
          <NavLink to="/profile" className={navClass}>
            <User size={18} />
            Profile
          </NavLink>
          </>
        )}

        {/* Settings */}
        <NavLink to="/settings" className={navClass}>
          <Settings size={18} />
          Settings
        </NavLink>

      </nav>

      <div className="mt-auto border-t border-slate-200 p-4 text-xs text-slate-500">
        Role: <span className="font-semibold capitalize text-slate-700">{role || "guest"}</span>
      </div>

    </aside>
  )
}