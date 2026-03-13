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

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Student Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track mentorship progress and discover alumni opportunities.
        </p>
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
            label="Browse Alumni"
            onClick={() => navigate("/directory")}
          />

          <ActionButton
            label="View Mentorship"
            onClick={() => navigate("/mentorship")}
          />

          <ActionButton
            label="Update Profile"
            onClick={() => navigate("/profile")}
          />

        </div>

      </SectionCard>

    </div>

  )

}