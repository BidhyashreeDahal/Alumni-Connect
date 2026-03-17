import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { mentorshipAPI } from "@/api/client"
import { useAuth } from "@/context/AuthContext"
import {
  CalendarRange, UserRound, Handshake, Star,
  Sparkles, ArrowRight, Clock, CheckCheck, XCircle, RotateCcw, CircleHelp,
} from "lucide-react"
import { computeProfileCompletion } from "@/utils/profileCompletion"

// ─── Types ────────────────────────────────────────────────────────────────────
type MentorshipRequest = {
  id: string
  status: "pending" | "accepted" | "declined" | "cancelled" | "completed"
  alumni?: { firstName?: string | null; lastName?: string | null } | null
}
type StudentProfile = {
  firstName?: string | null
  lastName?: string | null
  program?: string | null
  graduationYear?: number | null
  skills?: string[] | null
  interests?: string | null
  linkedinUrl?: string | null
  schoolEmail?: string | null
}
type AlumniCandidate = {
  profileId: string
  firstName?: string | null
  lastName?: string | null
  program?: string | null
  graduationYear?: number | null
  jobTitle?: string | null
  company?: string | null
  skills?: string[] | null
  claimed?: boolean
  profileReady?: boolean
  profileCompletion?: number
}
type PopularMentor = {
  id: string
  firstName?: string | null
  lastName?: string | null
  jobTitle?: string | null
  company?: string | null
  engagementCount: number
  profileReady?: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getLogoUrl(name: string) {
  const slug = (name || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  return `https://logo.clearbit.com/${slug}.com`
}

const STATUS_CONFIG: Record<MentorshipRequest["status"], { label: string; color: string; icon: ReactNode }> = {
  pending:   { label: "Pending",   color: "bg-blue-50 text-blue-700 border-blue-200",  icon: <Clock size={11}/> },
  accepted:  { label: "Accepted",  color: "bg-blue-50 text-blue-700 border-blue-200",  icon: <CheckCheck size={11}/> },
  completed: { label: "Completed", color: "bg-blue-50 text-blue-700 border-blue-200",  icon: <CheckCheck size={11}/> },
  declined:  { label: "Declined",  color: "bg-slate-100 text-slate-600 border-slate-200", icon: <XCircle size={11}/> },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500 border-slate-200", icon: <RotateCcw size={11}/> },
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [requests, setRequests]               = useState<MentorshipRequest[]>([])
  const [studentProfile, setStudentProfile]   = useState<StudentProfile | null>(null)
  const [mentorCandidates, setMentorCandidates] = useState<AlumniCandidate[]>([])
  const [popularMentors, setPopularMentors]   = useState<PopularMentor[]>([])
  const [profileReady, setProfileReady]       = useState<{ score: number; ready: boolean } | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState("")

  useEffect(() => {
    async function load() {
      try {
        const [requestsResult, profileResult, directoryResult, popularResult] = await Promise.allSettled([
          mentorshipAPI.getMyRequests(),
          fetch("http://localhost:5000/students/me", { credentials: "include" }).then(r => r.json()),
          fetch("http://localhost:5000/directory?profileType=alumni&page=1&pageSize=30&claimed=claimed", { credentials: "include" }).then(r => r.json()),
          mentorshipAPI.getPopularMentors(),
        ])
        if (requestsResult.status === "fulfilled") setRequests(requestsResult.value.requests || [])
        else throw requestsResult.reason
        if (profileResult.status === "fulfilled" && profileResult.value?.profile) {
          setStudentProfile(profileResult.value.profile)
          setProfileReady(computeProfileCompletion(profileResult.value.profile, "student"))
        }
        if (directoryResult.status === "fulfilled" && Array.isArray(directoryResult.value?.users))
          setMentorCandidates(directoryResult.value.users)
        if (popularResult.status === "fulfilled" && Array.isArray(popularResult.value?.mentors))
          setPopularMentors(popularResult.value.mentors)
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <SkeletonLoader />

  const pendingCount   = requests.filter(r => r.status === "pending").length
  const acceptedCount  = requests.filter(r => r.status === "accepted").length
  const completedCount = requests.filter(r => r.status === "completed").length
  const responseRate   = requests.length
    ? Math.round(((requests.length - pendingCount) / requests.length) * 100) : 0

  const profilePath    = user?.profileId ? `/profile/${user.profileId}` : "/profile"
  const mentorMatches  = getMentorMatches(studentProfile, mentorCandidates).slice(0, 4)
  const suggestedMentors = popularMentors.slice(0, 4)

  const firstName = studentProfile?.firstName || "there"

  return (
    <div className="max-w-7xl space-y-8">

        {/* ── Header ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                <Sparkles size={12}/> Student Workspace
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                Hey, {firstName} 
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                See your mentorship progress and discover alumni you are most likely to learn from.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <NavChip icon={<UserRound size={13}/>}    label="My Profile"  onClick={() => navigate(profilePath)} />
              <NavChip icon={<Handshake size={13}/>}    label="Mentorship"  onClick={() => navigate("/mentorship")} />
              <NavChip icon={<CalendarRange size={13}/>} label="Events"     onClick={() => navigate("/events")} />
              <button
                type="button"
                onClick={() => navigate("/directory?profileType=alumni")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
              >
                Browse Alumni <ArrowRight size={14}/>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            ⚠️ {error}
          </div>
        )}

        {/* ── Profile Readiness Banner ── */}
        {profileReady && !profileReady.ready && (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-800">
                Your profile is {profileReady.score}% complete
              </p>
              <p className="mt-0.5 text-xs text-blue-700">
                Complete your profile to unlock the Blue Star badge and improve your mentor recommendations.
              </p>
              <div className="mt-3 h-2 w-64 max-w-full rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${profileReady.score}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(profilePath)}
              className="shrink-0 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Complete Profile →
            </button>
          </div>
        )}

        {profileReady?.ready && (
          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
            <Star size={18} className="fill-blue-500 text-blue-500 shrink-0" />
            <p className="text-sm font-semibold text-blue-800">
              Blue Star unlocked — your profile is fully ready for mentor matching!
            </p>
          </div>
        )}

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[
            { label: "Pending",    value: pendingCount,   sub: "waiting for alumni reply", color: "text-slate-900", bg: "bg-slate-100" },
            { label: "Accepted",   value: acceptedCount,  sub: "currently active",         color: "text-slate-900", bg: "bg-slate-100" },
            { label: "Completed",  value: completedCount, sub: "mentorships completed",    color: "text-slate-900", bg: "bg-slate-100" },
            { label: "Response Rate", value: `${responseRate}%`, sub: "requests with response", color: "text-slate-900", bg: "bg-blue-50" },
          ].map(({ label, value, sub, color, bg }) => (
            <div
              key={label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <div className={`mb-3 inline-flex rounded-lg px-2.5 py-1.5 text-xs font-semibold ${bg} ${color}`}>
                {label}
              </div>
              <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Mentor Matches + Popular Mentors ── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

          <SectionCard
            title="Recommended Mentors"
            subtitle="Best-fit alumni based on your profile and current activity."
            actionLabel="Browse all"
            onAction={() => navigate("/directory?profileType=alumni")}
          >
            {mentorMatches.length === 0 ? (
              <EmptyState text="Add a few more skills or interests to get stronger mentor recommendations." />
            ) : (
              <div className="space-y-3">
                {mentorMatches.map(match => (
                  <MentorCard
                    key={match.profileId}
                    firstName={match.firstName}
                    lastName={match.lastName}
                    jobTitle={match.jobTitle}
                    company={match.company}
                    profileReady={match.profileReady}
                    badge={<MatchBadge score={match.matchScore} />}
                    strongestReason={match.strongestReason}
                    reasons={match.reasons}
                    ctaLabel="View Profile"
                    onCta={() => navigate(`/profile/${match.profileId}`)}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Popular Mentors"
            subtitle="Alumni students are engaging with most right now."
          >
            {suggestedMentors.length === 0 ? (
              <EmptyState text="Popular mentor trends will appear as more requests come in." />
            ) : (
              <div className="space-y-3">
                {suggestedMentors.map(mentor => (
                  <MentorCard
                    key={mentor.id}
                    firstName={mentor.firstName}
                    lastName={mentor.lastName}
                    jobTitle={mentor.jobTitle}
                    company={mentor.company}
                    profileReady={mentor.profileReady}
                    badge={
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {mentor.engagementCount} requests
                      </span>
                    }
                    ctaLabel="Connect"
                    onCta={() => navigate(`/profile/${mentor.id}`)}
                  />
                ))}
              </div>
            )}
          </SectionCard>

        </div>

        {/* ── My Requests ── */}
        <SectionCard
          title="My Mentorship Requests"
          subtitle="Your recent outreach at a glance."
          actionLabel="View all"
          onAction={() => navigate("/mentorship")}
        >
          {requests.length === 0 ? (
            <EmptyState text="No mentorship requests yet. Start by exploring recommended mentors." />
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {requests.slice(0, 6).map(req => {
                const cfg = STATUS_CONFIG[req.status]
                const name = `${req.alumni?.firstName || ""} ${req.alumni?.lastName || ""}`.trim() || "Alumni Mentor"
                return (
                  <div key={req.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:bg-white transition-colors">
                    <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">{name}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>

    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function NavChip({ label, icon, onClick }: { label: string; icon: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors active:scale-95"
    >
      {icon} {label}
    </button>
  )
}

function SectionCard({
  title, subtitle, children, actionLabel, onAction,
}: {
  title: string; subtitle?: string; children: ReactNode
  actionLabel?: string; onAction?: () => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            {actionLabel} →
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function MentorCard({
  firstName, lastName, jobTitle, company, profileReady, badge, strongestReason, reasons, ctaLabel, onCta,
}: {
  firstName?: string | null; lastName?: string | null
  jobTitle?: string | null; company?: string | null
  profileReady?: boolean; badge: ReactNode
  strongestReason?: string
  reasons?: string[]
  ctaLabel: string; onCta: () => void
}) {
  const [imgErr, setImgErr] = useState(false)
  const name = `${firstName || ""} ${lastName || ""}`.trim() || "Alumni Mentor"
  const role = [jobTitle, company].filter(Boolean).join(" @ ") || "Alumni Mentor"

  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
      {/* Avatar with optional company logo */}
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white shadow-sm">
          {(firstName?.[0] || "?").toUpperCase()}
        </div>
        {company && (
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center overflow-hidden rounded-md border border-white bg-white shadow-sm">
            {!imgErr ? (
              <img src={getLogoUrl(company)} alt={company} className="h-4 w-4 object-contain"
                onError={() => setImgErr(true)} />
            ) : (
              <span className="text-[8px] font-bold text-slate-400">{company[0]}</span>
            )}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 truncate">
              {name}
              {profileReady && <Star size={12} className="fill-blue-500 text-blue-500 shrink-0" />}
            </p>
            <p className="text-xs text-slate-500 truncate">{role}</p>
          </div>
          {badge}
        </div>

        {strongestReason && (
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
              Best reason: {strongestReason}
            </span>
            {!!reasons?.length && (
              <span
                title={reasons.join(" • ")}
                className="inline-flex cursor-help items-center gap-1 text-[11px] font-medium text-slate-500"
              >
                <CircleHelp size={12} />
                Why this match
              </span>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onCta}
          className="self-start rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  )
}

function MatchBadge({ score }: { score: number }) {
  const color = score >= 40
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : "bg-slate-50 text-slate-600 border-slate-200"
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${color}`}>
      {score}% match
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  )
}

function SkeletonLoader() {
  return (
    <div className="max-w-7xl space-y-8 animate-pulse">
      <div className="h-36 rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-slate-100" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-2xl bg-slate-100" />
        <div className="h-80 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-48 rounded-2xl bg-slate-100" />
    </div>
  )
}

// ─── getMentorMatches (unchanged logic) ──────────────────────────────────────
function getMentorMatches(profile: StudentProfile | null, mentors: AlumniCandidate[]) {
  if (!profile || !mentors.length) return []
  const profileSkills = new Set((profile.skills || []).map(s => String(s).trim().toLowerCase()).filter(Boolean))
  const interestTokens = String(profile.interests || "")
    .toLowerCase().split(/[,/]| and |&/g).map(v => v.trim()).filter(Boolean)
  const tags = new Set([...profileSkills, ...interestTokens])

  return mentors.map(mentor => {
    const mentorSkills = (mentor.skills || []).map(s => String(s).trim().toLowerCase()).filter(Boolean)
    const sharedSkills = mentorSkills.filter(s => tags.has(s))
    const sameProgram = Boolean(profile.program && mentor.program && profile.program === mentor.program)
    const score = Math.min(100,
      (sameProgram ? 20 : 0) + Math.min(sharedSkills.length * 18, 54) +
      (mentor.profileReady ? 16 : 0) + (mentor.claimed ? 10 : 0)
    )
    const reasons = []
    if (sharedSkills.length > 0) reasons.push(`${sharedSkills.length} shared skill${sharedSkills.length > 1 ? "s" : ""}`)
    if (sameProgram) reasons.push("same program")
    if (mentor.profileReady) reasons.push("blue star profile")
    if (mentor.company) reasons.push(`works at ${mentor.company}`)
    if (!reasons.length) reasons.push("recommended fit")
    return { ...mentor, matchScore: score, strongestReason: reasons[0], reasons: reasons.slice(0, 2) }
  }).filter(m => m.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore)
}