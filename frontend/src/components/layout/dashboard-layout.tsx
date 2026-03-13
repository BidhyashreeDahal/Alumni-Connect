import { Outlet } from "react-router-dom"
import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
      <Topbar />
        <Outlet />
      </main>

    </div>
  )
}