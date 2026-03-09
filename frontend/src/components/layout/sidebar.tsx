import { Link } from "react-router-dom"

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen border-r bg-white p-6 flex flex-col">
      <div className="text-xl font-semibold mb-8">
        Alumni Connect
      </div>

      <nav className="flex flex-col gap-4 text-sm">
        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <Link to="/directory" className="hover:text-blue-600">Alumni Directory</Link>
        <Link to="/mentorship" className="hover:text-blue-600">Mentorship</Link>
        <Link to="/events" className="hover:text-blue-600">Events</Link>
        <Link to="/analytics" className="hover:text-blue-600">Analytics</Link>
      </nav>
    </aside>
  )
}