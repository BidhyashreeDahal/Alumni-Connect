import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { mentorshipAPI } from "@/api/client"
import MetricCard from "@/components/ui/MetricCard"
import SectionCard from "@/components/ui/SectionCard"
import ActionButton from "@/components/ui/ActionButton"
import ListRow from "@/components/ui/ListRow"

export default function StudentDashboard() {

  const navigate = useNavigate()

  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function load() {

      try {

        const res = await mentorshipAPI.getMyRequests()

        setRequests(res.requests || [])

      } catch (err) {
        console.error("Student dashboard error:", err)
      } finally {
        setLoading(false)
      }

    }

    load()

  }, [])

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading dashboard...</div>
  }

  return (

    <div className="space-y-8">

      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
          Student Workspace
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Stay on top of mentorship requests, explore alumni, and keep your profile ready for opportunities.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ActionButton label="My Profile" onClick={() => navigate("/profile")} />
          <ActionButton label="Alumni Directory" onClick={() => navigate("/directory?profileType=alumni")} />
          <ActionButton label="Mentorship Requests" onClick={() => navigate("/mentorship")} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <MetricCard
          title="Mentorship Requests"
          value={requests.length}
        />

        <MetricCard
          title="Accepted Mentorships"
          value={requests.filter(r => r.status === "accepted").length}
        />

        <MetricCard
          title="Completed Mentorships"
          value={requests.filter(r => r.status === "completed").length}
        />

      </div>

      {/* Mentorship */}
      <SectionCard
        title="My Mentorship Requests"
        action={() => navigate("/mentorship")}
        actionLabel="View All"
      >

        {requests.slice(0,5).map(req => (

          <ListRow
            key={req.id}
            title={`${req.alumni?.firstName} ${req.alumni?.lastName}`}
            meta={req.status}
          />

        ))}

      </SectionCard>

      {/* Quick actions */}

      <SectionCard title="Quick Actions">

        <div className="flex flex-wrap gap-3">

          <ActionButton
            label="My Profile"
            onClick={() => navigate("/profile")}
          />

          <ActionButton
            label="Alumni Directory"
            onClick={() => navigate("/directory?profileType=alumni")}
          />

          <ActionButton
            label="Mentorship Requests"
            onClick={() => navigate("/mentorship")}
          />

          <ActionButton
            label="Event Invitations"
            onClick={() => navigate("/events")}
          />

          <ActionButton
            label="Announcements"
            onClick={() => navigate("/announcements")}
          />

          <ActionButton
            label="Settings"
            onClick={() => navigate("/settings")}
          />

        </div>

      </SectionCard>

    </div>

  )

}