import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { BarChart3, CalendarRange, GraduationCap, Users, Handshake, TrendingUp } from "lucide-react"
import { analyticsAPI } from "@/api/client"
import SimpleBarChart from "@/components/ui/SimpleBarChart"

export default function FacultyDashboard() {

  const navigate = useNavigate()

  const [stats, setStats] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {

    async function load() {
      try {
        const res = await analyticsAPI.getDashboard()
        setStats(res)
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load dashboard analytics")
      }
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

  const totals = stats.totals || {}
  const students = totals.students ?? 0
  const alumni = totals.alumni ?? 0
  const claimedAlumni = totals.claimedAlumni ?? 0
  const mentorshipRequests = totals.mentorshipRequests ?? 0
  const acceptedMentorships = totals.acceptedMentorships ?? 0
  const events = totals.events ?? 0
  const eventRegistrations = totals.eventRegistrations ?? 0
  const unclaimedAlumni = Math.max(0, alumni - claimedAlumni)
  const claimRate = alumni ? Math.round((claimedAlumni / alumni) * 100) : 0
  const mentorshipAcceptanceRate = mentorshipRequests
    ? Math.round((acceptedMentorships / mentorshipRequests) * 100)
    : 0
  const registrationsPerEvent = events ? (eventRegistrations / events).toFixed(1) : "0.0"
  const topCompanies = (stats.topHiringCompanies || []).slice(0, 6)
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  })

  const healthLabel =
    claimRate >= 70 && mentorshipAcceptanceRate >= 40 ? "Healthy" :
    claimRate >= 50 ? "Watch" : "Needs Attention"
  const healthTone =
    healthLabel === "Healthy"
      ? "bg-blue-100 text-blue-700"
      : healthLabel === "Watch"
      ? "bg-blue-50 text-blue-700"
      : "bg-slate-100 text-slate-700"

  return (
    <div className="max-w-7xl space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <GraduationCap size={14} className="text-blue-600" />
              Faculty Workspace
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Faculty Outcomes Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Monitor student progression, alumni outcomes, and engagement quality across the program.
            </p>
            <p className="mt-2 text-xs text-slate-500">Updated {todayLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${healthTone}`}>
              {healthLabel}
            </span>
            <button
              onClick={() => navigate("/analytics")}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              type="button"
            >
              <BarChart3 size={16} />
              Open Full Analytics
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <ActionChip label="Directory" onClick={() => navigate("/directory")} />
          <ActionChip label="Events" onClick={() => navigate("/events")} />
          <ActionChip label="Announcements" onClick={() => navigate("/announcements")} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FacultyKpiCard title="Students" value={students} subtitle="Current student records" />
        <FacultyKpiCard title="Alumni" value={alumni} subtitle="Tracked alumni profiles" />
        <FacultyKpiCard title="Mentorship Requests" value={mentorshipRequests} subtitle="Student mentorship demand" />
        <FacultyKpiCard title="Published Events" value={events} subtitle="Active program events" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Program Health Signals</h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SignalCard
            icon={<Users size={14} />}
            label="Alumni Claim Rate"
            value={`${claimRate}%`}
            note={`${unclaimedAlumni} profile(s) still unclaimed`}
            percent={claimRate}
          />
          <SignalCard
            icon={<Handshake size={14} />}
            label="Mentorship Acceptance"
            value={`${mentorshipAcceptanceRate}%`}
              note={`${acceptedMentorships} accepted or completed of ${mentorshipRequests} requests`}
            percent={mentorshipAcceptanceRate}
          />
          <SignalCard
            icon={<CalendarRange size={14} />}
            label="Registrations / Event"
            value={registrationsPerEvent}
            note={events === 0 ? "No events published yet" : `${eventRegistrations} total registrations`}
            percent={Math.min(100, Math.round(Number(registrationsPerEvent) * 8))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Hiring Companies</h2>
          <p className="mt-1 text-xs text-slate-500">Top employers currently represented in alumni records.</p>
          <div className="mt-4 space-y-3">
            {topCompanies.length === 0 && (
              <p className="text-sm text-slate-500">No company outcome data available yet.</p>
            )}
            {topCompanies.map((entry: any, idx: number) => {
              const max = topCompanies[0]?.count || 1
              const width = Math.max(10, Math.round((entry.count / max) * 100))
              return (
                <div key={`${entry.company}-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-800">{entry.company || "Unknown"}</p>
                    <p className="text-sm font-semibold text-slate-700">{entry.count}</p>
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
        <Panel
          title="Faculty Action Alerts"
          rows={[
            unclaimedAlumni > 0
              ? `${unclaimedAlumni} alumni profile(s) are pending claim and require follow-up.`
              : "All alumni profiles are currently claimed.",
            mentorshipRequests === 0
              ? "No mentorship requests yet. Promote mentorship pathways for students."
              : `Mentorship acceptance is ${mentorshipAcceptanceRate}% (accepted/completed).`,
            events === 0
              ? "No events published. Consider scheduling an engagement event this month."
              : `${events} event(s) published with ${registrationsPerEvent} average registrations per event.`
          ]}
        />
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
                  : `${mentorshipAcceptanceRate}% of requests are accepted or completed.`}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Event Participation</p>
              <p className="mt-1 text-sm text-slate-700">
                {events === 0
                  ? "No events published yet."
                  : `${registrationsPerEvent} average registrations per event.`}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Faculty Watchlist</p>
              <p className="mt-1 text-sm text-slate-700">
                Focus on claims, mentorship response, and event participation this week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      {label}
    </button>
  )
}

function FacultyKpiCard({
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
      <p className="inline-flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
        <TrendingUp size={12} />
        {title}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  )
}

function SignalCard({
  icon,
  label,
  value,
  note,
  percent
}: {
  icon: ReactNode
  label: string
  value: string | number
  note: string
  percent: number
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

function Panel({
  title,
  rows,
  icon
}: {
  title: string
  rows: string[]
  icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
        {icon}
        {title}
      </h3>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {row}
          </div>
        ))}
      </div>
    </div>
  )
}