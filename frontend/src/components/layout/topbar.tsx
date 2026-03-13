import { Bell, LogOut, User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

export default function Topbar() {
  const { user } = useAuth()

  async function logout() {
    await api.post("/auth/logout")
    window.location.href = "/login"
  }

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">

      <div className="text-gray-700 font-semibold">
        Alumni Connect
      </div>

      <div className="flex items-center gap-6">

        <Bell size={18} className="text-gray-500" />

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} />
          {user?.email}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm border px-3 py-1 rounded hover:bg-gray-100"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>
    </header>
  )
}