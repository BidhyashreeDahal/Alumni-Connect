import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { analyticsAPI } from "@/api/client"
import MetricCard from "@/components/ui/MetricCard"
import SectionCard from "@/components/ui/SectionCard"
import ActionButton from "@/components/ui/ActionButton"

export default function AdminDashboard() {

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

      <h1 className="text-2xl font-semibold">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <MetricCard
          title="Students"
          value={stats.totals?.students}
        />

        <MetricCard
          title="Alumni"
          value={stats.totals?.alumni}
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

      <SectionCard title="Admin Tools">

        <div className="flex gap-4">

          <ActionButton
            label="Import Alumni CSV"
            onClick={() => navigate("/import")}
          />

          <ActionButton
            label="Send Invites"
            onClick={() => navigate("/invites")}
          />

          <ActionButton
            label="Manage Announcements"
            onClick={() => navigate("/announcements")}
          />

        </div>

      </SectionCard>

    </div>

  )

}