import { Bell, LogOut, ShieldCheck, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

export default function Topbar() {
  const { user } = useAuth()
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  })

  async function logout() {
    await api.post("/auth/logout")
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-full w-full max-w-[1400px] items-center justify-between px-6 md:px-8">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Alumni Connect
            </p>
            <p className="text-sm font-semibold text-slate-800">
              Network Operations Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 md:block">
            {today}
          </div>

          <button
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            type="button"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 md:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <User size={14} />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-medium text-slate-700">
                {user?.email}
              </p>
              <div className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                <ShieldCheck size={10} />
                {user?.role}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}