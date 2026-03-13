import { Outlet } from "react-router-dom"
import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Topbar />
        <div className="mx-auto w-full max-w-[1400px] px-6 py-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}