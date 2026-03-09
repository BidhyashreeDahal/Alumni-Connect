import { LogOut } from "lucide-react"
import { api } from "@/lib/api"
import { useAuth } from "@/hooks/useAuth"

export default function Topbar() {
  const { user } = useAuth()

  async function logout() {
    await api.post("/auth/logout")
    window.location.href = "/login"
  }

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">

      <div className="font-semibold text-gray-700">
        Alumni Connect
      </div>

      <div className="flex items-center gap-4">

        <span className="text-sm text-gray-600">
          {user?.email}
        </span>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm px-3 py-1 border rounded hover:bg-gray-100"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>

    </header>
  )
}