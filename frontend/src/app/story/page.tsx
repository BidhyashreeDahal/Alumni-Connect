import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  GraduationCap,
  Handshake,
  Network,
  ShieldCheck,
  Star,
  Users,
  CircleDot,
} from "lucide-react"

// ─── Data ─────────────────────────────────────────────────────────────────────
const ROLE_CARDS = [
  {
    role: "Admin",
    text: "Keeps access, onboarding, invites, reminders, and operational follow-up under control.",
    link: "/login?role=admin",
    icon: ShieldCheck,
    color: "from-violet-500/20 to-violet-500/5",
    border: "hover:border-violet-400/40",
    accent: "text-violet-300",
  },
  {
    role: "Faculty",
    text: "Supports engagement with clearer visibility into profiles, participation, and member follow-up.",
    link: "/login?role=faculty",
    icon: Users,
    color: "from-blue-500/20 to-blue-500/5",
    border: "hover:border-blue-400/40",
    accent: "text-blue-300",
  },
  {
    role: "Alumni",
    text: "Maintains a credible professional presence and responds to students through a structured network.",
    link: "/login?role=alumni",
    icon: Handshake,
    color: "from-emerald-500/20 to-emerald-500/5",
    border: "hover:border-emerald-400/40",
    accent: "text-emerald-300",
  },
  {
    role: "Student",
    text: "Finds relevant alumni, requests mentorship, and takes action on real career connections.",
    link: "/login?role=student",
    icon: GraduationCap,
    color: "from-amber-500/20 to-amber-500/5",
    border: "hover:border-amber-400/40",
    accent: "text-amber-300",
  },
]

const PROBLEMS = [
  { stat: "Scattered", label: "Alumni records across disconnected files" },
  { stat: "Manual", label: "Mentorship coordination and follow-up" },
  { stat: "Limited", label: "Visibility into engagement and adoption" },
  { stat: "Disconnected", label: "Onboarding across multiple tools" },
]

const HERO_SIGNALS = [
  {
    value: "4",
    label: "Distinct role workspaces",
    icon: ShieldCheck,
  },
  {
    value: "1",
    label: "Connected institutional platform",
    icon: Network,
  },
  {
    value: "RBAC",
    label: "Across every user journey",
    icon: Star,
  },
]

const ROLE_PERSPECTIVES = [
  {
    role: "Admin",
    quote: "I can see who still needs access, what needs follow-up, and where the platform needs attention.",
    icon: ShieldCheck,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    role: "Faculty",
    quote: "I can support engagement and review profiles without chasing spreadsheets or relying on manual follow-up.",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    role: "Student",
    quote: "I can actually find the right alumni and request mentorship instead of just browsing a static list.",
    icon: GraduationCap,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    role: "Alumni",
    quote: "The platform gives me a simple way to stay visible, respond to students, and stay connected to my institution.",
    icon: Handshake,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
]

const DEMO_STEPS = [
  {
    label: "The Problem",
    text: "Alumni records, mentorship, and follow-up often live across spreadsheets, emails, and disconnected processes.",
  },
  {
    label: "Admin View",
    text: "Show how invites, user management, reminders, and access can be handled from one operational view.",
  },
  {
    label: "Faculty View",
    text: "Show how faculty can support engagement with better visibility into profiles and participation.",
  },
  {
    label: "Student → Alumni",
    text: "Walk through the mentorship flow from discovery to request, response, and follow-through.",
  },
  {
    label: "Analytics Layer",
    text: "Close with dashboards and analytics to show the institutional value beyond individual user actions.",
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StoryPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Sora:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%       { transform: translateY(-10px) rotate(1deg); }
          66%       { transform: translateY(-5px) rotate(-0.5deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes shimmer-line {
          0%   { width: 0%; opacity: 0; }
          20%  { opacity: 1; }
          100% { width: 100%; opacity: 1; }
        }
        @keyframes count-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .fade-up-1 { animation: fadeUp 0.6s ease both 0.05s; }
        .fade-up-2 { animation: fadeUp 0.6s ease both 0.15s; }
        .fade-up-3 { animation: fadeUp 0.6s ease both 0.25s; }
        .fade-up-4 { animation: fadeUp 0.6s ease both 0.35s; }
        .fade-up-5 { animation: fadeUp 0.6s ease both 0.45s; }
        .fade-up-6 { animation: fadeUp 0.6s ease both 0.55s; }
        .fade-in   { animation: fadeIn 1s ease both 0.1s; }

        .float-1 { animation: float 7s ease-in-out infinite 0s; }
        .float-2 { animation: float 9s ease-in-out infinite 1.5s; }
        .float-3 { animation: float 8s ease-in-out infinite 3s; }

        .blob { animation: pulse-slow 6s ease-in-out infinite; }
        .blob-2 { animation: pulse-slow 8s ease-in-out infinite 2s; }
        .blob-3 { animation: pulse-slow 7s ease-in-out infinite 4s; }

        .role-card:hover .role-arrow { transform: translateX(4px); }
        .role-arrow { transition: transform 0.2s ease; }

        .serif { font-family: 'Instrument Serif', serif; }
        .sans  { font-family: 'Sora', sans-serif; }

        .noise-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          border-radius: inherit;
        }

        .timeline-line {
          animation: shimmer-line 1.2s ease both;
        }
      `}</style>

      <div
        className="relative min-h-screen overflow-hidden sans"
        style={{ background: "linear-gradient(170deg, #060910 0%, #0a1020 50%, #060c18 100%)" }}
      >

        {/* ── Background atmosphere ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="blob absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)" }} />
          <div className="blob-2 absolute -right-20 top-32 h-[400px] w-[400px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)" }} />
          <div className="blob-3 absolute bottom-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)" }} />
          {/* Grid */}
          <svg className="absolute inset-0 h-full w-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.8"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#g)" />
          </svg>
        </div>

        <main className="relative mx-auto max-w-6xl px-6 py-16 space-y-24">

          {/* ── HERO ── */}
          <section className="space-y-10">

            {/* Badge */}
            <div className="fade-up-1 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-300">
                <CircleDot size={10} className="fill-blue-400 text-blue-400" />
                Expo Story — Alumni Connect
              </div>
            </div>

            {/* Headline */}
            <div className="fade-up-2 max-w-4xl space-y-5">
              <h1 className="serif text-5xl font-normal leading-[1.1] text-white md:text-6xl lg:text-7xl">
                From disconnected records<br/>
                to a <em className="text-blue-400">role-aware</em> institutional<br/>
                network.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-400 md:text-lg">
                Alumni Connect gives institutions one place to onboard members, support mentorship,
                coordinate events, and understand engagement through role-aware workspaces.
              </p>
            </div>

            {/* Pills */}
            <div className="fade-up-3 flex flex-wrap gap-2">
              {["Role-based workspaces", "Invite and claim onboarding", "Mentorship workflow", "Institutional analytics", "Operational reminders"].map(p => (
                <span key={p} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-300">
                  {p}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="fade-up-4 flex flex-wrap gap-3">
              <Link to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-95 transition-all"
              >
                Open Live Demo <ArrowRight size={15} />
              </Link>
              <Link to="/claim"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                Claim Invitation
              </Link>
            </div>

            {/* Floating stat cards */}
            <div className="fade-up-5 flex flex-wrap gap-4 pt-2">
              {HERO_SIGNALS.map(({ value, label, icon: Icon }) => (
                <div key={label}
                  className="float-1 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{value}</p>
                      <p className="text-xs text-slate-400">{label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── THE PROBLEM ── */}
          <section className="fade-in space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-400">The Problem</span>
              <div className="h-px flex-1 bg-gradient-to-r from-rose-500/30 to-transparent" />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {PROBLEMS.map(({ stat, label }, i) => (
                <div key={stat}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 hover:border-rose-500/20 hover:bg-rose-500/[0.04] transition-all"
                  style={{ animation: `fadeUp 0.5s ease both ${i * 80}ms` }}
                >
                  <p className="serif text-3xl font-normal text-rose-400 md:text-4xl">{stat}</p>
                  <p className="mt-2 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8">
              <p className="serif text-2xl font-normal leading-relaxed text-white md:text-3xl">
                Schools often have alumni data — but{" "}
                <span className="italic text-slate-400">not always a usable alumni network.</span>{" "}
                Onboarding is inconsistent, mentorship is still handled manually, follow-up is easy to lose,
                and visibility into engagement is{" "}
                <span className="text-rose-400">nearly zero.</span>
              </p>
            </div>
          </section>

          {/* ── THE SOLUTION — Role cards ── */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">The System</span>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {ROLE_CARDS.map((card, i) => {
                const Icon = card.icon
                return (
                <Link
                  key={card.role}
                  to={card.link}
                  className={`role-card group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b ${card.color} p-6 ${card.border} transition-all duration-300 hover:scale-[1.02]`}
                  style={{ animation: `fadeUp 0.5s ease both ${i * 70}ms` }}
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                    <Icon size={20} className={card.accent} />
                  </div>
                  <h2 className={`text-xl font-semibold text-white`}>{card.role}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300/80">{card.text}</p>
                  <div className={`mt-5 inline-flex items-center gap-1.5 text-xs font-semibold ${card.accent}`}>
                    Enter {card.role} view
                    <ArrowRight size={13} className="role-arrow" />
                  </div>
                </Link>
              )})}
            </div>
          </section>

          {/* ── PERSPECTIVES + DEMO FLOW ── */}
          <section className="grid gap-8 xl:grid-cols-2">

            {/* Perspectives */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Role Perspective</span>
                <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
              </div>

              <div className="space-y-3">
                {ROLE_PERSPECTIVES.map((p, i) => {
                  const Icon = p.icon
                  return (
                    <div key={p.role}
                      className={`rounded-2xl border p-5 ${p.bg} transition-all hover:scale-[1.01]`}
                      style={{ animation: `fadeUp 0.5s ease both ${i * 80}ms` }}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10`}>
                          <Icon size={14} className={p.color} />
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${p.color}`}>{p.role}</span>
                      </div>
                      <p className="text-sm leading-7 text-slate-200/90 text-[15px]">
                        {p.quote}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Demo Flow */}
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-violet-400">Expo Walkthrough</span>
                <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 space-y-1">
                {DEMO_STEPS.map((step, i) => (
                  <div key={step.label}
                    className="group flex gap-4 rounded-xl p-4 hover:bg-white/[0.04] transition-colors"
                    style={{ animation: `fadeUp 0.5s ease both ${i * 80 + 100}ms` }}
                  >
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/80 text-xs font-bold text-white shadow-lg shadow-violet-600/20">
                        {i + 1}
                      </div>
                      {i < DEMO_STEPS.length - 1 && (
                        <div className="mt-1 w-px flex-1 bg-gradient-to-b from-violet-500/30 to-transparent min-h-[20px]" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-semibold text-white">{step.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="relative overflow-hidden rounded-3xl border border-white/10 p-10 md:p-14 noise-bg"
            style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(6,9,16,0.8) 50%, rgba(139,92,246,0.10) 100%)" }}
          >
            {/* Decorative glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full"
                style={{ background: "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)" }} />
            </div>

            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-300">
                  <Star size={11} className="fill-blue-400 text-blue-400" /> Final Frame
                </div>
                <h2 className="serif text-3xl font-normal text-white md:text-4xl">
                  Records become relationships.<br/>
                  <em className="text-blue-400">Operations become engagement.</em>
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Start here, then move into the live product to show how Alumni Connect supports institutions, students, and alumni through one connected system.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row md:flex-col xl:flex-row">
                <Link to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 active:scale-95 transition-all whitespace-nowrap"
                >
                  Launch Live Demo <ArrowRight size={15} />
                </Link>
                <Link to="/analytics"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-all whitespace-nowrap"
                >
                  Analytics Story <BarChart3 size={15} />
                </Link>
              </div>
            </div>
          </section>

          {/* Footer note */}
          <p className="text-center text-xs text-slate-600 pb-4">
            Alumni Connect · Built for educational institutions · Structured alumni engagement, mentorship, and visibility
          </p>

        </main>
      </div>
    </>
  )
}