import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { analyticsAPI } from "@/api/client"
import MetricCard from "@/components/ui/MetricCard"
import InsightList from "@/components/ui/InsightList"
import SimpleBarChart from "@/components/ui/SimpleBarChart"

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
    return (
      <div className="p-10 text-sm text-slate-500">
        Loading dashboard...
      </div>
    )
  }

  return (

    <div className="max-w-7xl space-y-12">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Program Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor student–alumni engagement and track program outcomes.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">

          <button
            onClick={() => navigate("/directory")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Directory
          </button>

          <button
            onClick={() => navigate("/events")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Events
          </button>

          <button
            onClick={() => navigate("/analytics")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Full Analytics
          </button>

        </div>

      </div>


      {/* Core Metrics */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="Students"
          value={stats.totals?.students ?? 0}
        />

        <MetricCard
          title="Alumni"
          value={stats.totals?.alumni ?? 0}
        />

        <MetricCard
          title="Mentorship Requests"
          value={stats.totals?.mentorshipRequests ?? 0}
        />

        <MetricCard
          title="Events"
          value={stats.totals?.events ?? 0}
        />

      </div>


      {/* Alumni Outcomes */}

      <div className="space-y-4">

        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Alumni Outcomes
        </h2>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <InsightList
            title="Top Hiring Companies"
            items={stats.topHiringCompanies}
            labelKey="company"
            valueKey="count"
          />

          <SimpleBarChart
            title="Alumni by Graduation Year"
            data={stats.alumniByYear}
            labelKey="graduationYear"
            valueKey="count"
          />

        </div>

      </div>


      {/* Engagement Metrics */}

      <div className="space-y-4">

        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Engagement
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          <MetricCard
            title="Claimed Alumni Profiles"
            value={stats.totals?.claimedAlumni ?? 0}
          />

          <MetricCard
            title="Accepted Mentorships"
            value={stats.totals?.acceptedMentorships ?? 0}
          />

          <MetricCard
            title="Event Registrations"
            value={stats.totals?.eventRegistrations ?? 0}
          />

        </div>

      </div>

    </div>

  )
}