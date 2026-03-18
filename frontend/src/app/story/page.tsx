import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  GraduationCap,
  Handshake,
  Mail,
  Network,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from "lucide-react"

const roleCards = [
  {
    role: "Admin",
    text: "Manage users, invites, reminders, and operational oversight across the platform.",
    link: "/login?role=admin"
  },
  {
    role: "Faculty",
    text: "Support student and alumni engagement with visibility into profiles, invites, and outcomes.",
    link: "/login?role=faculty"
  },
  {
    role: "Alumni",
    text: "Maintain a professional profile, respond to mentorship requests, and join events.",
    link: "/login?role=alumni"
  },
  {
    role: "Student",
    text: "Discover alumni, request mentorship, and build stronger career connections.",
    link: "/login?role=student"
  }
]

const showcaseCards = [
  {
    title: "4 Role Experiences",
    text: "Admin, faculty, alumni, and students each see a workspace built for their job.",
    icon: ShieldCheck
  },
  {
    title: "Invite to Claim Flow",
    text: "Member onboarding moves from imported profile to invitation and account activation.",
    icon: Mail
  },
  {
    title: "Mentorship + Analytics",
    text: "Operational oversight and student-facing value live inside one connected system.",
    icon: Network
  }
]

const rolePerspectives = [
  {
    role: "Admin",
    text: "Sees adoption risk, invites, reminders, and user controls from one operational view.",
    icon: ShieldCheck
  },
  {
    role: "Faculty",
    text: "Tracks engagement support, profile quality, and network activity with less manual follow-up.",
    icon: Users
  },
  {
    role: "Student",
    text: "Finds alumni, requests mentorship, and gets guided next steps instead of browsing a static list.",
    icon: GraduationCap
  },
  {
    role: "Alumni",
    text: "Presents a stronger professional profile and responds to mentorship requests in a structured way.",
    icon: Handshake
  }
]

const demoSteps = [
  "Start with the problem: alumni records, mentorship, and follow-up are often fragmented.",
  "Open Admin to show invites, user management, reminders, and platform control.",
  "Switch to Faculty to show visibility into profiles, engagement, and support workflows.",
  "Show Student to Alumni mentorship flow and how each role sees a different experience.",
  "Close with dashboards and analytics as the institutional value layer."
]

export default function StoryPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-blue-500/25 blur-3xl animate-pulse" />
        <div className="absolute right-[-4rem] top-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
      </div>

      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.08)_35%,rgba(14,165,233,0.14))]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                <img
                  src="/Images/alumni-connect-brand.svg"
                  alt="Alumni Connect"
                  className="h-10 w-auto rounded-xl bg-white/95 p-2"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                    Alumni Connect
                  </p>
                  <p className="text-sm text-white/80">Expo Story View</p>
                </div>
              </div>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                <ShieldCheck size={14} />
                Expo Story
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-white md:text-5xl">
                From disconnected alumni records to a role-aware institutional network.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200/85 md:text-base">
                This expo story shows how Alumni Connect turns onboarding, mentorship,
                communication, and reporting into one connected platform experience.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Pill text="RBAC by design" />
                <Pill text="Mentorship workflow" />
                <Pill text="Invite and claim onboarding" />
                <Pill text="Institutional analytics" />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                >
                  Open Demo
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/claim"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
                >
                  Claim Invitation
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <ShowcaseMetric label="Roles" value="4" subtext="distinct workspaces" />
                <ShowcaseMetric label="Core Flow" value="Invite" subtext="to claim to engage" />
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/35 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                  Story in One Line
                </p>
                <p className="mt-3 text-lg font-medium leading-8 text-white">
                  Schools gain a cleaner operational system while students and alumni get a more usable network.
                </p>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-5">
                <div className="flex items-center gap-2 text-blue-100">
                  <Star size={15} />
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    Expo Talking Point
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-100/90">
                  Instead of presenting isolated screens, this page frames the product as a complete story:
                  onboarding, engagement, mentorship, reminders, and reporting.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {showcaseCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-100">
                  <Icon size={18} />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-white">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200/80">{card.text}</p>
              </div>
            )
          })}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white p-6 text-slate-900 shadow-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              <Sparkles size={13} />
              Product Story
            </div>
            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              What judges should understand quickly
            </h3>
            <div className="mt-5 space-y-3">
              {rolePerspectives.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.role}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.role}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white">Suggested Expo Flow</h3>
              <ol className="mt-4 space-y-3 text-sm text-slate-200/85">
                {demoSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="leading-6">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-100">
                <Users size={15} />
                <h3 className="text-lg font-semibold text-white">User Perspective</h3>
              </div>
              <div className="mt-4 space-y-3">
                <PerspectiveQuote
                  name="Admin View"
                  text="I can see who still needs access, what needs follow-up, and how adoption is moving."
                />
                <PerspectiveQuote
                  name="Student View"
                  text="I can actually find relevant alumni and request mentorship from one place."
                />
                <PerspectiveQuote
                  name="Alumni View"
                  text="The platform makes it easier to stay visible, respond to students, and stay connected."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roleCards.map((item) => (
            <Link
              key={item.role}
              to={item.link}
              className="group rounded-2xl border border-white/10 bg-white/8 p-5 backdrop-blur-sm hover:border-blue-300/25 hover:bg-white/12"
            >
              <h2 className="text-lg font-semibold text-white">{item.role}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200/80">{item.text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
                Enter {item.role} view
                <ArrowRight size={13} />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                Final Frame
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                One platform, multiple roles, one institutional story.
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-200/80">
                Use this page as the visual opener, then move directly into the live product to show how the story becomes real in each role.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Launch Live Demo
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15"
              >
                View Analytics Story
                <BarChart3 size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function Pill({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-slate-100/90">
      {text}
    </span>
  )
}

function ShowcaseMetric({
  label,
  value,
  subtext
}: {
  label: string
  value: string
  subtext: string
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-white/10 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-300">{subtext}</p>
    </div>
  )
}

function PerspectiveQuote({
  name,
  text
}: {
  name: string
  text: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
        {name}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-200/85">
        "{text}"
      </p>
    </div>
  )
}
