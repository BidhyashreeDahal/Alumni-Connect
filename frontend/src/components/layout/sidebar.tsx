import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Users,
  Handshake,
  Calendar,
  BarChart3,
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
  const location = useLocation()

  const linkStyle =
    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition"

  const activeStyle = "bg-blue-600 text-white shadow-sm"
  const inactiveStyle = "text-slate-600 hover:bg-slate-100 hover:text-slate-900"

  const navItemsByRole = {
    admin: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Directory", to: "/directory", icon: Users },
      { label: "Import", to: "/bulk-import", icon: Upload },
      { label: "Invites", to: "/invite", icon: Mail },
      { label: "Reminders", to: "/reminders", icon: Bell },
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
      { label: "Announcements", to: "/announcements", icon: Megaphone },
      { label: "Events", to: "/events", icon: Calendar },
      { label: "Admin Management", to: "/adminmanagement", icon: Shield },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
    faculty: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Directory", to: "/directory", icon: Users },
      { label: "Invites", to: "/invite", icon: Mail },
      { label: "Reminders", to: "/reminders", icon: Bell },
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
      { label: "Announcements", to: "/announcements", icon: Megaphone },
      { label: "Events", to: "/events", icon: Calendar },
      { label: "Mentorship Invitations", to: "/mentorship", icon: Handshake },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
    alumni: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "My Profile", to: "/profile", icon: User },
      { label: "Announcements", to: "/announcements", icon: Megaphone },
      { label: "Event Invitations", to: "/events", icon: Calendar },
      { label: "Mentorship Invitations", to: "/mentorship", icon: Handshake },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
    student: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "My Profile", to: "/profile", icon: User },
      { label: "Alumni Directory", to: "/directory?profileType=alumni", icon: Users },
      { label: "Mentorship Requests", to: "/mentorship", icon: Handshake },
      { label: "Event Invitations", to: "/events", icon: Calendar },
      { label: "Announcements", to: "/announcements", icon: Megaphone },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  }

  const navItems = role ? navItemsByRole[role] || [] : []

  function isActivePath(to: string) {
    const [pathname, search = ""] = to.split("?")
    return location.pathname === pathname && location.search === (search ? `?${search}` : "")
  }

  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-slate-200 bg-white/90 backdrop-blur">

      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <img
          src="/Images/alumni-connect-mark.svg"
          alt="Alumni Connect"
          className="h-10 w-auto"
        />
        <div>
          <p className="text-base font-semibold tracking-tight text-slate-900">
            Alumni Connect
          </p>
          <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
            {role || "workspace"}
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActivePath(item.to)

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`${linkStyle} ${active ? activeStyle : inactiveStyle}`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}

      </nav>

      <div className="mt-auto border-t border-slate-200 p-4 text-xs text-slate-500">
        Role: <span className="font-semibold capitalize text-slate-700">{role || "guest"}</span>
      </div>

    </aside>
  )
}