import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  BellRing,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  Clock3,
  Sparkles,
} from "lucide-react"
import { remindersAPI } from "@/api/client"
import { useAuth } from "@/context/AuthContext"

// ─── Types ────────────────────────────────────────────────────────────────────
type ReminderItem = {
  id: string
  title: string
  description: string
  category: "attention" | "upcoming" | "suggested" | "update"
  priority: "high" | "medium" | "low"
  actionLabel?: string | null
  actionHref?: string | null
}

type ReminderSection = {
  title: string
  description: string
  items: ReminderItem[]
}

type ReminderResponse = {
  role: "admin" | "faculty" | "alumni" | "student"
  summary: {
    headline: string
    stats: Array<{ label: string; value: string | number }>
  }
  sections: ReminderSection[]
}

// ─── Config ───────────────────────────────────────────────────────────────────
const ROLE_BADGE = {
  admin:   "Admin Workspace",
  faculty: "Faculty Workspace",
  alumni:  "Alumni Workspace",
  student: "Student Workspace",
} as const

const ROLE_DESCRIPTIONS = {
  admin:   "Operational follow-ups, access risks, and upcoming platform activity.",
  faculty: "Member engagement reminders and next-step actions for academic support.",
  alumni:  "Mentorship responsiveness, profile quality, and event participation reminders.",
  student: "Profile progress, mentorship movement, and near-term opportunities.",
} as const

const CATEGORY_ICON = {
  attention: CircleAlert,
  upcoming:  CalendarClock,
  suggested: Sparkles,
  update:    Clock3,
} as const

const CATEGORY_LABEL = {
  attention: "Needs Attention",
  upcoming:  "Coming Up",
  suggested: "Suggested",
  update:    "Recent Update",
} as const

// Color lives only on the icon bubble — cards stay white/slate
const CATEGORY_ICON_STYLE = {
  attention: "text-blue-600 bg-blue-50 border-blue-200",
  upcoming:  "text-slate-600 bg-slate-100 border-slate-200",
  suggested: "text-blue-500 bg-blue-50 border-blue-200",
  update:    "text-slate-400 bg-slate-100 border-slate-200",
} as const

const PRIORITY_STYLE = {
  high:   "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-slate-100 text-slate-700 border-slate-200",
  low:    "bg-slate-100 text-slate-500  border-slate-200",
} as const

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RemindersPage() {
  const { user } = useAuth()
  const [data, setData]       = useState<ReminderResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError("")
        const res = await remindersAPI.getMyReminders()
        setData(res)
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load reminders")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const allItems    = useMemo(() => (data?.sections ?? []).flatMap(s => s.items), [data])
  const highCount   = allItems.filter(i => i.priority === "high").length
  const currentRole = data?.role ?? user?.role ?? "student"

  if (loading) return <RemindersSkeleton />

  if (error) return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
      ⚠️ {error}
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl space-y-5">

      {/* ── Header ── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <BellRing size={12} />
              {ROLE_BADGE[currentRole]}
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Reminders
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              {data?.summary.headline || ROLE_DESCRIPTIONS[currentRole]}
            </p>
          </div>

          {/* Focus Today — subtly reacts to high count */}
          <div className={`shrink-0 rounded-xl border px-4 py-3 text-center
            ${highCount > 0 ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50"}`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Focus Today
            </p>
            <p className={`mt-1 text-2xl font-bold ${highCount > 0 ? "text-blue-700" : "text-slate-900"}`}>
              {highCount}
            </p>
            <p className="text-xs text-slate-500">
              {highCount === 1 ? "high-priority item" : "high-priority items"}
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      {!!data?.summary?.stats?.length && (
        <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {data.summary.stats.map(stat => (
              <div
                key={stat.label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <span className="font-semibold text-slate-900">{stat.value}</span>
                <span className="text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Sections ── */}
      <div className="space-y-4">
        {(data?.sections ?? []).map(section => (
          <section
            key={section.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">{section.title}</h2>
                <p className="mt-0.5 text-xs text-slate-500">{section.description}</p>
              </div>
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
                {section.items.length}
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {section.items.length > 0 ? (
                section.items.map(item => <ReminderCard key={item.id} item={item} />)
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  No items in {section.title.toLowerCase()} right now.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

    </div>
  )
}

// ─── Reminder Card ────────────────────────────────────────────────────────────
function ReminderCard({ item }: { item: ReminderItem }) {
  const Icon      = CATEGORY_ICON[item.category]
  const iconStyle = CATEGORY_ICON_STYLE[item.category]

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">

        {/* Icon bubble — only carrier of category color */}
        <div className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${iconStyle}`}>
          <Icon size={13} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-tight text-slate-900">{item.title}</p>
                <span className="text-xs text-slate-400">{CATEGORY_LABEL[item.category]}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>

            {/* Priority badge */}
            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${PRIORITY_STYLE[item.priority]}`}>
              {item.priority}
            </span>
          </div>

          {item.actionHref && item.actionLabel && (
            <Link
              to={item.actionHref}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              {item.actionLabel}
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function RemindersSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-pulse">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="h-5 w-32 rounded-full bg-slate-100" />
            <div className="h-7 w-48 rounded bg-slate-100" />
            <div className="h-4 w-80 max-w-full rounded bg-slate-100" />
          </div>
          <div className="h-20 w-28 shrink-0 rounded-xl bg-slate-100" />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-slate-100" />
          ))}
        </div>
      </div>

      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-36 rounded bg-slate-100" />
              <div className="h-3 w-56 rounded bg-slate-100" />
            </div>
            <div className="h-6 w-8 rounded-full bg-slate-100" />
          </div>
          <div className="mt-4 space-y-4">
            {[...Array(2)].map((__, j) => (
              <div key={j} className="flex gap-3 border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
                <div className="h-8 w-8 shrink-0 rounded-lg bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                  <div className="h-3 w-20 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}