import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { mentorshipAPI } from "@/api/client"
import { useAuth } from "@/context/AuthContext"
import { CalendarRange, GraduationCap, Handshake, Sparkles, Trophy, ArrowRight, UserRound, Clock, CheckCheck, XCircle, RotateCcw } from "lucide-react"
import { computeProfileCompletion } from "@/utils/profileCompletion"

type IncomingRequest = {
  id: string
  status: "pending" | "accepted" | "declined" | "cancelled" | "completed"
  student?: {
    firstName?: string | null
    lastName?: string | null
  } | null
}

type EventItem = {
  id: string
  title: string
  location?: string | null
  eventDate: string
}

const ALUMNI_STATUS_STYLE: Record<
  IncomingRequest["status"],
  { label: string; className: string; icon: ReactNode }
> = {
  pending: {
    label: "Pending",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <Clock size={11} />
  },
  accepted: {
    label: "Accepted",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <CheckCheck size={11} />
  },
  completed: {
    label: "Completed",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <CheckCheck size={11} />
  },
  declined: {
    label: "Declined",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: <XCircle size={11} />
  },
  cancelled: {
    label: "Cancelled",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: <RotateCcw size={11} />
  }
}

export default function AlumniDashboard() {

  const navigate = useNavigate()
  const { user } = useAuth()

  const [requests, setRequests] = useState<IncomingRequest[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [alumniProfile, setAlumniProfile] = useState<any>(null)
  const [profileReady, setProfileReady] = useState<{ score: number; ready: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {

    async function load() {

      try {
        const [requestsResult, profileResult, eventsResult] = await Promise.allSettled([
          mentorshipAPI.getIncomingRequests(),
          fetch("http://localhost:5000/alumni/me", { credentials: "include" }).then((r) => r.json()),
          fetch("http://localhost:5000/events", { credentials: "include" }).then((r) => r.json())
        ])

        if (requestsResult.status === "fulfilled") {
          setRequests(requestsResult.value.requests || [])
        } else {
          throw requestsResult.reason
        }

        if (profileResult.status === "fulfilled" && profileResult.value?.profile) {
          setAlumniProfile(profileResult.value.profile)
          setProfileReady(computeProfileCompletion(profileResult.value.profile, "alumni"))
        }

        if (eventsResult.status === "fulfilled" && Array.isArray(eventsResult.value?.events)) {
          setEvents(eventsResult.value.events)
        }

      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load mentorship requests")
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

  const pendingCount = requests.filter((r) => r.status === "pending").length
  const activeCount = requests.filter((r) => r.status === "accepted").length
  const completedCount = requests.filter((r) => r.status === "completed").length
  const acceptanceRate = requests.length ? Math.round(((activeCount + completedCount) / requests.length) * 100)
    : 0
  const mentorPoints = pendingCount * 2 + activeCount * 10 + completedCount * 20
  const mentorTier =
    completedCount >= 12 ? "Gold Mentor" :
    completedCount >= 6 ? "Silver Mentor" : "Rising Mentor"
  const nextMilestone = completedCount >= 12 ? 0 : completedCount >= 6 ? 12 - completedCount : 6 - completedCount
  const profilePath = user?.profileId ? `/profile/${user.profileId}` : "/profile"
  const firstName = alumniProfile?.firstName || "there"
  const upcomingEvents = events
    .filter((e) => {
      const title = String(e.title || "").trim()
      const dateMs = new Date(e.eventDate).getTime()
      const hasValidDate = Number.isFinite(dateMs)
      const isUpcoming = hasValidDate && dateMs >= Date.now() - 24 * 60 * 60 * 1000
      return title.length > 0 && isUpcoming
    })
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
              <Sparkles size={12} /> Alumni Workspace
            </span>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              Hey, {firstName}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-600">
              Grow your mentorship impact, support students, and stay visible in the alumni network.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <NavChip icon={<UserRound size={13} />} label="My Profile" onClick={() => navigate(profilePath)} />
            <NavChip icon={<CalendarRange size={13} />} label="Events" onClick={() => navigate("/events")} />
            <NavChip icon={<Sparkles size={13} />} label="Settings" onClick={() => navigate("/settings")} />
            <button
              type="button"
              onClick={() => navigate("/mentorship")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
            >
              Mentorship Queue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard title="Incoming Requests" value={pendingCount} subtitle="Awaiting your response" />
        <KpiCard title="Active Mentorships" value={activeCount} subtitle="In progress with students" />
        <KpiCard title="Completed Mentorships" value={completedCount} subtitle="Finished mentorships" />
        <KpiCard title="Acceptance Rate" value={`${acceptanceRate}%`} subtitle="Accepted or completed" />
      </div>

      {profileReady && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Profile Readiness</h3>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              {profileReady.ready
                ? "Blue Star unlocked: your profile is ready and visible for student discovery."
                : `You're at ${profileReady.score}% completion. Add more profile details to unlock your blue star.`}
            </p>
            <button
              type="button"
              onClick={() => navigate(profilePath)}
              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Update Profile
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Mentor Recognition">
          <div className="space-y-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800">
                <Trophy size={15} />
                {mentorTier}
              </p>
              <p className="mt-1 text-xs text-blue-700">
                {nextMilestone > 0
                  ? `${nextMilestone} more completed mentorship${nextMilestone > 1 ? "s" : ""} to reach the next level.`
                  : "You are on the top mentor tier. Keep contributing to stay there."}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Mentor Impact Points</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{mentorPoints}</p>
              <p className="mt-1 text-xs text-slate-500">
                Points are based on pending, accepted, and completed mentorship activity.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/mentorship")}
              className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              Improve My Mentor Score
            </button>
          </div>
        </Panel>

        <Panel title="You're Invited: Upcoming Events">
          {upcomingEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center">
              <p className="text-sm text-slate-500">No upcoming published events available right now.</p>
              <p className="mt-1 text-xs text-slate-400">
                New events will appear here automatically when they are scheduled.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{String(event.title).trim()}</p>
                  <p className="text-xs text-slate-500">
                    {formatEventDate(event.eventDate)}{event.location ? ` • ${event.location}` : ""}
                  </p>
                </div>
              ))}
              <button
                type="button"
                onClick={() => navigate("/events")}
                className="mt-1 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                Open Events
              </button>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel
          title="Latest Mentorship Requests"
          actionLabel="Manage"
          onAction={() => navigate("/mentorship")}
        >
          {requests.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 py-6 text-center">
              <p className="text-sm text-slate-500">No mentorship requests yet.</p>
              <p className="mt-1 text-xs text-slate-400">
                New student requests will appear here when they come in.
              </p>
            </div>
          )}
          <div className="space-y-3">
            {requests.slice(0, 2).map((req) => {
              const style = ALUMNI_STATUS_STYLE[req.status]
              return (
                <div
                  key={req.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">
                      {`${req.student?.firstName || ""} ${req.student?.lastName || ""}`.trim() || "Student request"}
                    </p>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${style.className}`}>
                      {style.icon}
                      {style.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel title="Alumni Action Alerts">
          <div className="space-y-2">
            <AlertLine
              icon={<Handshake size={14} className="text-blue-600" />}
              text={pendingCount > 0
                ? `${pendingCount} mentorship request(s) are awaiting your response. Quick replies improve your mentor ranking.`
                : "No pending mentorship requests at the moment."}
            />
            <AlertLine
              icon={<GraduationCap size={14} className="text-blue-600" />}
              text={activeCount > 0
                ? `${activeCount} active mentorship(s) currently in progress.`
                : "No active mentorships right now."}
            />
            <AlertLine
              icon={<CalendarRange size={14} className="text-blue-600" />}
              text="Accept event invitations to increase visibility with students and faculty."
            />
          </div>
        </Panel>
      </div>
    </div>
  )
}

function NavChip({
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
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors active:scale-95"
    >
      {icon}
      {label}
    </button>
  )
}

function Panel({
  title,
  children,
  actionLabel,
  onAction
}: {
  title: string
  children: ReactNode
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {actionLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function KpiCard({ title, value, subtitle }: { title: string; value: string | number; subtitle: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="inline-flex items-center rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
        {title}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  )
}

function AlertLine({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <p className="inline-flex items-start gap-2">
        <span className="mt-0.5">{icon}</span>
        {text}
      </p>
    </div>
  )
}

function formatEventDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Date TBD"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
}