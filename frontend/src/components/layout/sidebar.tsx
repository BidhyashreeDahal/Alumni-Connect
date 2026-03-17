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
    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"

  const activeStyle =
    "bg-blue-600 text-white"
  const inactiveStyle =
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900"

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
      { label: "User Management", to: "/adminmanagement", icon: Shield },
      { label: "Settings", to: "/settings", icon: Settings }
    ],

    faculty: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "Directory", to: "/directory", icon: Users },
      { label: "Invites", to: "/invite", icon: Mail },
      { label: "Reminders", to: "/reminders", icon: Bell },
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
      { label: "Announcements", to: "/announcements", icon: Megaphone },
      { label: "Events", to: "/events", icon: Calendar },
      { label: "Settings", to: "/settings", icon: Settings }
    ],

    alumni: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "My Profile", to: "/profile", icon: User },
      { label: "Events", to: "/events", icon: Calendar },
      { label: "Mentorship Invitations", to: "/mentorship", icon: Handshake },
      { label: "Announcements", to: "/announcements", icon: Megaphone },
      { label: "Settings", to: "/settings", icon: Settings }
    ],

    student: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "My Profile", to: "/profile", icon: User },
      { label: "Directory", to: "/directory?profileType=alumni", icon: Users },
      { label: "Mentorship Requests", to: "/mentorship", icon: Handshake },
      { label: "Events", to: "/events", icon: Calendar },
      { label: "Announcements", to: "/announcements", icon: Megaphone },
      { label: "Settings", to: "/settings", icon: Settings }
    ]
  }

  const navItems =
    role && navItemsByRole[role as keyof typeof navItemsByRole]
      ? navItemsByRole[role as keyof typeof navItemsByRole]
      : []

  function isActivePath(to: string) {
    const [pathname, search = ""] = to.split("?")
    return (
      location.pathname === pathname &&
      location.search === (search ? `?${search}` : "")
    )
  }

  function roleLabel(value?: string | null) {
    if (!value) return "Workspace"
    return value.charAt(0).toUpperCase() + value.slice(1)
  }

  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-col border-r border-slate-200 bg-white">

      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <img
          src="/Images/alumni-connect-mark.svg"
          alt="Alumni Connect"
          className="h-9 w-auto"
        />
        <div>
          <p className="text-xl font-semibold tracking-tight text-slate-900">
            Alumni Connect
          </p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            {roleLabel(role)}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <p className="px-3 pb-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Navigation
        </p>

        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActivePath(item.to)

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${linkStyle} ${active ? activeStyle : inactiveStyle}`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${
                    active ? "bg-blue-500/35 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  }`}
                >
                  <Icon size={15} />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Current role</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{roleLabel(role)}</p>
        </div>
      </div>

    </aside>
  )
}