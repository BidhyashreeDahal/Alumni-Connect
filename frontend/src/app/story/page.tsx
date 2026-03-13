import { Link } from "react-router-dom"
import { ArrowRight, BarChart3, Calendar, Handshake, ShieldCheck, Users } from "lucide-react"

const roleCards = [
  {
    role: "Admin",
    text: "Manage users, roles, invites, reminders, and platform operations.",
    link: "/login?role=admin"
  },
  {
    role: "Faculty",
    text: "Review outcomes, manage profiles and invites, and support mentorship.",
    link: "/login?role=faculty"
  },
  {
    role: "Alumni",
    text: "Maintain profile, respond to mentorship requests, and join events.",
    link: "/login?role=alumni"
  },
  {
    role: "Student",
    text: "Browse alumni, request mentorship, and track career growth.",
    link: "/login?role=student"
  }
]

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.42),_transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(96,165,250,0.18),_transparent_35%)]" />

      <main className="relative mx-auto w-full max-w-6xl px-6 py-14">
        <header className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 shadow-2xl">
          <div className="grid gap-8 p-8 md:p-10 lg:grid-cols-[1.15fr_0.95fr] lg:items-center">
            <div>
              <img
                src="/Images/alumni-connect-brand.svg"
                alt="Alumni Connect"
                className="h-16 w-auto rounded-xl bg-white/95 p-3 shadow-sm"
              />
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                <ShieldCheck size={14} />
                IT Expo Presentation
              </div>
              <h1 className="mt-6 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
                Alumni engagement, mentorship, and institutional operations in one platform.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                Alumni Connect gives institutions one place to manage alumni records, mentorship workflows, role-based access, and operational tasks.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Launch Demo
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/claim"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Claim Invitation
                </Link>
              </div>
            </div>

            <div className="grid gap-4 lg:pl-6">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">What It Solves</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Fragmented alumni records, manual invite workflows, limited mentorship visibility, and inconsistent role access.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Who Uses It</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Admin, Faculty, Alumni, and Students, each with role-specific access and workflows.
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roleCards.map((item) => (
            <Link
              key={item.role}
              to={item.link}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-300/30 hover:bg-white/10"
            >
              <h2 className="text-lg font-semibold text-white">{item.role}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
                Sign in as {item.role}
                <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Core Modules</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200">
              <p className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <Users size={14} /> Directory
              </p>
              <p className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <Handshake size={14} /> Mentorship
              </p>
              <p className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <Calendar size={14} /> Events
              </p>
              <p className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <BarChart3 size={14} /> Analytics
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-lg font-semibold text-white">Suggested Demo Order</h3>
            <ol className="mt-4 space-y-2 text-sm text-slate-200">
              <li>1. Login and role-based access overview.</li>
              <li>2. Admin user and invite management.</li>
              <li>3. Faculty directory and profile operations.</li>
              <li>4. Student-to-alumni mentorship workflow.</li>
              <li>5. Dashboard and analytics highlights.</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  )
}
