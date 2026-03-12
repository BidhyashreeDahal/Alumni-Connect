import { Outlet } from "react-router-dom"
import Sidebar from "@/components/layout/sidebar"

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">

      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>

    </div>
  )
}