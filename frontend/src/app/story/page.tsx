import { Link } from "react-router-dom"
import { ArrowRight, BarChart3, Calendar, Handshake, ShieldCheck, Users } from "lucide-react"

const roleCards = [
  {
    role: "Admin",
    text: "Manage users, roles, invites, reminders, analytics, and system operations.",
    link: "/login?role=admin"
  },
  {
    role: "Faculty",
    text: "Track outcomes, manage invites and notes, and support student-alumni growth.",
    link: "/login?role=faculty"
  },
  {
    role: "Alumni",
    text: "Maintain profile, receive mentorship requests, and engage with events.",
    link: "/login?role=alumni"
  },
  {
    role: "Student",
    text: "Discover alumni, request mentorship, and build career readiness.",
    link: "/login?role=student"
  }
]

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.4),_transparent_35%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_35%)]" />

      <main className="relative mx-auto w-full max-w-6xl px-6 py-14">
        <header className="rounded-2xl border border-blue-400/30 bg-white/5 p-8 backdrop-blur md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
            <ShieldCheck size={14} />
            IT Expo Showcase
          </div>
          <h1 className="mt-6 max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            Alumni Connect
          </h1>
          <p className="mt-4 max-w-3xl text-sm text-blue-100/90 md:text-base">
            A secure, role-based platform that strengthens alumni relations, mentorship pathways,
            and institutional visibility across the student journey.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Launch Live Demo
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/claim"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Claim Account Flow
            </Link>
          </div>
        </header>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roleCards.map((item) => (
            <Link
              key={item.role}
              to={item.link}
              className="group rounded-xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-0.5 hover:border-blue-300/40 hover:bg-white/10"
            >
              <h2 className="text-lg font-semibold text-white">{item.role}</h2>
              <p className="mt-2 text-sm text-slate-300">{item.text}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-blue-200">
                Enter as {item.role}
                <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Core Platform Modules</h3>
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

          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-semibold">Presentation Sequence</h3>
            <ol className="mt-4 space-y-2 text-sm text-slate-200">
              <li>1. Platform problem statement and target stakeholders.</li>
              <li>2. RBAC model and privacy-safe data access.</li>
              <li>3. Admin operations and user lifecycle controls.</li>
              <li>4. Student-to-alumni mentorship flow.</li>
              <li>5. Institutional analytics and growth roadmap.</li>
            </ol>
          </div>
        </section>
      </main>
    </div>
  )
}
