import { useEffect, useState } from "react"
import { analyticsAPI } from "@/api/client"
import MetricCard from "@/components/ui/MetricCard"


export default function FacultyDashboard() {

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

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Faculty Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor program outcomes, alumni engagement, and mentorship activity.
        </p>
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

    </div>

  )

}