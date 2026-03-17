import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  BarChart3,
  TrendingUp,
  Handshake,
  CalendarRange,
  Users,
  Sparkles,
  Building2,
} from "lucide-react"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
} from "recharts"
import { analyticsAPI } from "@/api/client"

// ─── Types ────────────────────────────────────────────────────────────────────
type DashboardResponse = {
  totals?: {
    students?: number
    alumni?: number
    claimedAlumni?: number
    mentorshipRequests?: number
    acceptedMentorships?: number
    events?: number
    eventRegistrations?: number
  }
  topHiringCompanies?: Array<{ company: string; count: number }>
  alumniByYear?: Array<{ graduationYear: number; count: number }>
}

// ─── Clearbit logo helper ─────────────────────────────────────────────────────
function getLogoUrl(name: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "")
  return `https://logo.clearbit.com/${slug}.com`
}

// ─── Custom Pie Tooltip ───────────────────────────────────────────────────────
const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      <span className="font-semibold text-slate-700">{payload[0].name}:</span>{" "}
      <span className="text-slate-900">{payload[0].value}</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await analyticsAPI.getDashboard()
        setStats(data)
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load analytics")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <SkeletonLoader />

  if (error) return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
      ⚠️ {error}
    </div>
  )

  const t = stats?.totals ?? {}
  const alumni               = t.alumni ?? 0
  const claimedAlumni        = t.claimedAlumni ?? 0
  const mentorshipRequests   = t.mentorshipRequests ?? 0
  const acceptedMentorships  = t.acceptedMentorships ?? 0
  const events               = t.events ?? 0
  const eventRegistrations   = t.eventRegistrations ?? 0
  const unclaimed            = Math.max(0, alumni - claimedAlumni)

  const claimRate                = alumni ? Math.round((claimedAlumni / alumni) * 100) : 0
  const mentorshipAcceptanceRate = mentorshipRequests ? Math.round((acceptedMentorships / mentorshipRequests) * 100) : 0
  const avgRegistrationsPerEvent = events ? (eventRegistrations / events).toFixed(1) : "0.0"
  const placementSignal          = alumni && stats?.topHiringCompanies?.length
    ? Math.round(((stats.topHiringCompanies.reduce((s, c) => s + c.count, 0)) / alumni) * 100)
    : 0

  const adoptionPie  = [{ name: "Claimed", value: claimedAlumni }, { name: "Unclaimed", value: unclaimed }]
  const topCompanies = (stats?.topHiringCompanies ?? []).slice(0, 7)
  const byYear       = stats?.alumniByYear ?? []
  const maxHiring    = topCompanies[0]?.count || 1

  const insights = [
    claimRate >= 60
      ? `Strong alumni adoption — ${claimRate}% of profiles claimed and ready for outreach.`
      : `Alumni claim rate is ${claimRate}%. A targeted re-engagement campaign could improve this.`,
    mentorshipRequests === 0
      ? "No mentorship activity yet. Launching a campaign can strengthen student-support outcomes."
      : mentorshipAcceptanceRate >= 40
      ? `${mentorshipAcceptanceRate}% mentorship acceptance reflects strong alumni participation.`
      : `${mentorshipAcceptanceRate}% mentorship acceptance — room to improve alumni response rates.`,
    topCompanies.length > 0
      ? `${topCompanies[0].company} is the top visible employer destination in alumni records.`
      : "Employer outcomes still forming. Encourage profile completion to improve reporting.",
  ]

  return (
    <div className="space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <BarChart3 size={12} /> Program Outcomes
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              School Impact Analytics
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-slate-500">
              Alumni achievement signals and program-strength evidence for marketing and stakeholder reporting.
            </p>
          </div>

          {/* Placement signal pill */}
          <div className="shrink-0 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 px-5 py-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">Placement Signal</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">{placementSignal}%</p>
            <p className="mt-0.5 text-[11px] text-slate-500">top-employer concentration</p>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { icon: <Users size={15}/>,         label: "Active Alumni",           value: alumni,                      sub: `${claimedAlumni} profiles claimed` },
            { icon: <TrendingUp size={15}/>,     label: "Claim Rate",              value: `${claimRate}%`,             sub: `${unclaimed} unclaimed` },
            { icon: <Handshake size={15}/>,      label: "Mentorship Acceptance",   value: `${mentorshipAcceptanceRate}%`, sub: `${acceptedMentorships} of ${mentorshipRequests}` },
            { icon: <CalendarRange size={15}/>,  label: "Avg Registrations/Event", value: avgRegistrationsPerEvent,   sub: `across ${events} events` },
          ].map(({ icon, label, value, sub }) => (
            <StatCard key={label} icon={icon} label={label} value={value} sub={sub} />
          ))}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Donut */}
          <ChartCard
            title="Alumni Adoption"
            subtitle="Claimed vs unclaimed profiles available for outreach."
          >
            <div className="flex items-center gap-6">
              <div className="h-56 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={adoptionPie} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3} strokeWidth={0}>
                      <Cell fill="#2563eb" />
                      <Cell fill="#e2e8f0" />
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 text-sm">
                <LegendItem color="bg-blue-600"   label="Claimed"   value={claimedAlumni} />
                <LegendItem color="bg-slate-200"  label="Unclaimed" value={unclaimed} />
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-xl font-bold text-slate-900">{alumni}</p>
                </div>
              </div>
            </div>
          </ChartCard>

          {/* Bar chart */}
          <ChartCard
            title="Alumni by Graduation Year"
            subtitle="Cohort size distribution for campaign targeting."
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byYear} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="graduationYear" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 12 }}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

        </div>

        {/* ── Top Hiring Companies ── */}
        <ChartCard
          title="Top Hiring Companies"
          subtitle="Employer outcomes for school marketing and stakeholder reports."
          icon={<Building2 size={15} />}
        >
          {topCompanies.length === 0 ? (
            <p className="py-4 text-sm text-slate-400">No hiring data available yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {topCompanies.map((entry, idx) => (
                <CompanyRow
                  key={entry.company}
                  company={entry.company}
                  count={entry.count}
                  rank={idx + 1}
                  max={maxHiring}
                />
              ))}
            </div>
          )}
        </ChartCard>

        {/* ── Narrative Insights ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles size={15} className="text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Narrative Insights</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {insights.map((text, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
              >
                <div className="mb-2 h-1 w-8 rounded-full bg-blue-500 opacity-60" />
                {text}
              </div>
            ))}
          </div>
        </div>

    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub,
}: {
  icon: ReactNode; label: string; value: string | number; sub: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
        {icon} {label}
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  )
}

function ChartCard({
  title, subtitle, children, icon,
}: {
  title: string; subtitle?: string; children: ReactNode; icon?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          {icon} {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-sm text-slate-600">{label}</span>
      <span className="ml-auto font-semibold text-slate-800">{value}</span>
    </div>
  )
}

function CompanyRow({ company, count, rank, max }: { company: string; count: number; rank: number; max: number }) {
  const [imgErr, setImgErr] = useState(false)
  const pct = Math.max(8, Math.round((count / max) * 100))

  return (
    <div className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50 transition-colors">
      <span className="w-4 text-center text-xs font-semibold text-slate-400">{rank}</span>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {!imgErr ? (
          <img src={getLogoUrl(company)} alt={company} className="h-6 w-6 object-contain"
            onError={() => setImgErr(true)} />
        ) : (
          <span className="text-[10px] font-bold text-slate-500">{company.slice(0, 2).toUpperCase()}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-slate-800 truncate max-w-[140px]">{company}</span>
          <span className="tabular-nums font-semibold text-slate-600 text-xs">{count}</span>
        </div>
        <div className="h-1 w-full rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-36 rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-2xl bg-slate-100" />
        <div className="h-80 rounded-2xl bg-slate-100" />
      </div>
    </div>
  )
}