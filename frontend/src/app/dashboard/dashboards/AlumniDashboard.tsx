import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { mentorshipAPI } from "@/api/client"
import MetricCard from "@/components/ui/MetricCard"
import SectionCard from "@/components/ui/SectionCard"
import ActionButton from "@/components/ui/ActionButton"
import ListRow from "@/components/ui/ListRow"

export default function AlumniDashboard() {

  const navigate = useNavigate()

  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function load() {

      try {

        const res = await mentorshipAPI.getIncomingRequests()

        setRequests(res.requests || [])

      } catch (err) {
        console.error(err)
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
          Alumni Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review incoming mentorship requests and support student growth.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <MetricCard
          title="Incoming Requests"
          value={requests.filter(r => r.status === "pending").length}
        />

        <MetricCard
          title="Active Mentorships"
          value={requests.filter(r => r.status === "accepted").length}
        />

        <MetricCard
          title="Completed Mentorships"
          value={requests.filter(r => r.status === "completed").length}
        />

      </div>

      <SectionCard
        title="Mentorship Invitations"
        action={() => navigate("/mentorship")}
        actionLabel="Manage"
      >

        {requests.slice(0,5).map(req => (

          <ListRow
            key={req.id}
            title={`${req.student?.firstName} ${req.student?.lastName}`}
            meta={req.status}
          />

        ))}

      </SectionCard>

      <SectionCard title="Quick Actions">

        <div className="flex flex-wrap gap-3">

          <ActionButton
            label="View Mentorship Requests"
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