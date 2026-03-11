import Sidebar from "./sidebar"
import Topbar from "./topbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">

      <Sidebar />

      <div className="flex flex-col flex-1">

        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>

    </div>
  )
}