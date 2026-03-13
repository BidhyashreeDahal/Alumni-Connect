import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { analyticsAPI } from "@/api/client"
import MetricCard from "@/components/ui/MetricCard"
import SectionCard from "@/components/ui/SectionCard"
import ActionButton from "@/components/ui/ActionButton"


export default function FacultyDashboard() {
  const navigate = useNavigate()

  const [stats, setStats] = useState<any>(null)

  useEffect(() => {

    async function load() {

      const res = await analyticsAPI.getDashboard()

      setStats(res)

    }

    load()

  }, [])

  if (!stats) {
    return <div className="p-8">Loading...</div>
  }

  return (

    <div className="space-y-8">

      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          Faculty Workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Review student-alumni engagement, manage program workflows, and monitor outcomes across your network.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton label="Directory" onClick={() => navigate("/directory")} />
          <ActionButton label="Invites" onClick={() => navigate("/invite")} />
          <ActionButton label="Analytics" onClick={() => navigate("/analytics")} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="Total Alumni"
          value={stats.totals?.alumni}
        />

        <MetricCard
          title="Students"
          value={stats.totals?.students}
        />

        <MetricCard
          title="Mentorship Requests"
          value={stats.totals?.mentorshipRequests}
        />

        <MetricCard
          title="Events"
          value={stats.totals?.events}
        />

      </div>

      <SectionCard title="Role-Based Operations">
        <div className="flex flex-wrap gap-3">
          <ActionButton label="Directory" onClick={() => navigate("/directory")} />
          <ActionButton label="Invites" onClick={() => navigate("/invite")} />
          <ActionButton label="Reminders" onClick={() => navigate("/reminders")} />
          <ActionButton label="Analytics" onClick={() => navigate("/analytics")} />
          <ActionButton label="Announcements" onClick={() => navigate("/announcements")} />
          <ActionButton label="Events" onClick={() => navigate("/events")} />
          <ActionButton label="Mentorship Invitations" onClick={() => navigate("/mentorship")} />
          <ActionButton label="Settings" onClick={() => navigate("/settings")} />
        </div>
      </SectionCard>

    </div>

  )

}