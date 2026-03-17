import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  ShieldCheck,
  Users,
  TriangleAlert,
  CalendarRange,
  GraduationCap,
  Upload,
  Mail,
  ChartNoAxesCombined,
  TrendingUp
} from "lucide-react"
import { analyticsAPI } from "@/api/client"
import SimpleBarChart from "@/components/ui/SimpleBarChart"

export default function AdminDashboard() {

  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        const res = await analyticsAPI.getDashboard()
        setStats(res)
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load analytics")
      }
    }

    load()
  }, [])

  if (!stats) {
    return (
      <div className="p-12 text-sm text-slate-500">
        Loading analytics...
      </div>
    )
  }

  const totals = stats.totals || {}
  const students = totals.students ?? 0
  const alumni = totals.alumni ?? 0
  const totalUsers = students + alumni
  const claimedAlumni = totals.claimedAlumni ?? 0
  const mentorshipRequests = totals.mentorshipRequests ?? 0
  const acceptedMentorships = totals.acceptedMentorships ?? 0
  const events = totals.events ?? 0
  const eventRegistrations = totals.eventRegistrations ?? 0

  const claimRate = alumni ? Math.round((claimedAlumni / alumni) * 100) : 0
  const mentorshipAcceptanceRate = mentorshipRequests
    ? Math.round((acceptedMentorships / mentorshipRequests) * 100)
    : 0
  const avgRegistrationsPerEvent = events ? (eventRegistrations / events).toFixed(1) : "0.0"
  const unclaimedAlumni = Math.max(0, alumni - claimedAlumni)

  const healthLabel =
    claimRate >= 70 && mentorshipAcceptanceRate >= 40 ? "Healthy" :
    claimRate >= 50 ? "Watch" : "Needs Attention"
  const healthTone =
    healthLabel === "Healthy"
      ? "bg-blue-100 text-blue-700"
      : healthLabel === "Watch"
      ? "bg-blue-50 text-blue-700"
      : "bg-slate-100 text-slate-700"

  const topCompanies = (stats.topHiringCompanies || []).slice(0, 6)
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  })

  function initials(value: string) {
    return value
      .split(" ")
      .map((part) => part[0] || "")
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  return (

    <div className="max-w-7xl space-y-8">

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <ShieldCheck size={12} className="text-blue-600" />
              Admin Workspace
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              Admin Operations Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor platform health, adoption risk, and engagement outcomes from a single operational view.
            </p>
            <p className="mt-2 text-xs text-slate-500">Updated {todayLabel}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${healthTone}`}>
              {healthLabel}
            </span>
            <button
              type="button"
              onClick={() => navigate("/analytics")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
            >
              <ChartNoAxesCombined size={16} />
              Open Analytics
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <ActionChip icon={<Users size={13} />} label="Manage Users" onClick={() => navigate("/adminmanagement")} />
          <ActionChip icon={<Mail size={13} />} label="Invites" onClick={() => navigate("/invite")} />
          <ActionChip icon={<Upload size={13} />} label="Bulk Import" onClick={() => navigate("/bulk-import")} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          title="Total Users"
          value={totalUsers}
          subtitle={`${students} students + ${alumni} alumni`}
        />
        <KpiTile
          title="Claimed Alumni"
          value={claimedAlumni}
          subtitle={`${claimRate}% profile claim rate`}
        />
        <KpiTile
          title="Mentorship Requests"
          value={mentorshipRequests}
          subtitle={`${acceptedMentorships} accepted`}
        />
        <KpiTile
          title="Event Registrations"
          value={eventRegistrations}
          subtitle={`Across ${events} events`}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800">Outcome Signals</h2>
        <p className="mt-1 text-xs text-slate-500">
          Program health indicators used for operational decisions and reporting.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <RateTile
            icon={<Users size={14} />}
            label="Claim Rate"
            value={`${claimRate}%`}
            percent={claimRate}
            note={`${unclaimedAlumni} alumni profiles still unclaimed`}
          />
          <RateTile
            icon={<GraduationCap size={14} />}
            label="Mentorship Acceptance"
            value={`${mentorshipAcceptanceRate}%`}
            percent={mentorshipAcceptanceRate}
            note={`${acceptedMentorships} accepted of ${mentorshipRequests} requests`}
          />
          <RateTile
            icon={<CalendarRange size={14} />}
            label="Avg Registrations / Event"
            value={avgRegistrationsPerEvent}
            percent={Math.min(100, Math.round(Number(avgRegistrationsPerEvent) * 8))}
            note={events === 0 ? "No events published yet" : `${events} events measured`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">
            Hiring Companies
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Top employers currently represented in alumni records.
          </p>

          <div className="mt-4 space-y-3">
            {topCompanies.length === 0 && (
              <p className="text-sm text-slate-500">No company data available yet.</p>
            )}

            {topCompanies.map((entry: any, idx: number) => {
              const max = topCompanies[0]?.count || 1
              const width = Math.max(10, Math.round((entry.count / max) * 100))
              return (
                <div
                  key={entry.company}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                        {initials(entry.company || "Company")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{entry.company || "Unknown"}</p>
                        <p className="text-xs text-slate-500">Rank #{idx + 1}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{entry.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-200">
                    <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <SimpleBarChart
          title="Alumni by Graduation Year"
          data={stats.alumniByYear}
          labelKey="graduationYear"
          valueKey="count"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            <TriangleAlert size={14} className="text-blue-600" />
            Action Alerts
          </h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-sm text-slate-700">
                {unclaimedAlumni > 0
                  ? `${unclaimedAlumni} alumni profile(s) are still unclaimed and need follow-up.`
                  : "All alumni profiles are currently claimed."}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-sm text-slate-700">
                {mentorshipRequests === 0
                  ? "No mentorship requests yet; promote mentorship to activate alumni support."
                  : mentorshipAcceptanceRate < 40
                  ? `Mentorship acceptance is ${mentorshipAcceptanceRate}%; response nudges are recommended.`
                  : `Mentorship acceptance is ${mentorshipAcceptanceRate}% and tracking well.`}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-sm text-slate-700">
                {events === 0
                  ? "No events are published; launch one event to generate engagement signals."
                  : `${events} event(s) published with ${avgRegistrationsPerEvent} average registrations per event.`}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Operational Priorities</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Profile Adoption</p>
              <p className="mt-1 text-sm text-slate-700">
                {unclaimedAlumni > 0
                  ? `${unclaimedAlumni} alumni profile(s) are still unclaimed.`
                  : "All alumni profiles are claimed."}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mentorship Pipeline</p>
              <p className="mt-1 text-sm text-slate-700">
                {mentorshipRequests === 0
                  ? "No mentorship requests yet."
                  : `${mentorshipAcceptanceRate}% of requests are accepted.`}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Event Participation</p>
              <p className="mt-1 text-sm text-slate-700">
                {events === 0
                  ? "No events published yet."
                  : `${avgRegistrationsPerEvent} average registrations per event.`}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <TriangleAlert size={13} />
                Admin Watchlist
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Focus on invites, claim rate, and inactive-account review this week.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

function KpiTile({
  title,
  value,
  subtitle
}: {
  title: string
  value: string | number
  subtitle: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
        <TrendingUp size={12} />
        {title}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  )
}

function ActionChip({
  icon,
  label,
  onClick
}: {
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors active:scale-95 hover:bg-slate-50 hover:text-slate-900"
    >
      {icon}
      {label}
    </button>
  )
}

function RateTile({
  icon,
  label,
  value,
  percent,
  note
}: {
  icon: ReactNode
  label: string
  value: string
  percent: number
  note: string
}) {
  const normalized = Math.max(0, Math.min(100, percent))
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200">
        <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${normalized}%` }} />
      </div>
      <p className="mt-2 text-xs text-slate-500">{note}</p>
    </div>
  )
}