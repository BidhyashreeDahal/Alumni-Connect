import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  GraduationCap,
  Handshake,
  Zap,
  CheckCircle,
  TrendingUp,
  MessageCircle,
  XCircle,
  Lightbulb,
  Award,
} from "lucide-react"

// ─── Problem vs Opportunity ──────────────────────────────────────────────────
const PROBLEM_OPPORTUNITY = [
  {
    label: "Career Outcomes",
    without: "30% graduation-to-job lag",
    with: "Alumni hiring pipeline active within weeks",
    icon: GraduationCap,
  },
  {
    label: "Curriculum Relevance",
    without: "5+ year gap between program and market",
    with: "Real-time alumni feedback drives updates",
    icon: BarChart3,
  },
  {
    label: "Student Support",
    without: "Generic networking; no mentorship structure",
    with: "Structured mentorship matching & accountability",
    icon: Handshake,
  },
  {
    label: "Institutional Visibility",
    without: "Alumni engagement unknown/unmeasured",
    with: "Real-time dashboards show impact & ROI",
    icon: Award,
  },
]

// ─── Core Impact (What Judges Care About) ────────────────────────────────────
const CORE_IMPACT = [
  {
    title: "Measurable Student Success",
    stat: "30%+ Higher Career Placement",
    description: "Students connected to alumni mentors see accelerated job placement through direct hiring pipelines and real-world guidance.",
    icon: TrendingUp,
  },
  {
    title: "Competitive Curriculum",
    stat: "Real-time Market Feedback",
    description: "Alumni input drives curriculum decisions. Schools stay relevant by building skills employers actually demand.",
    icon: Lightbulb,
  },
  {
    title: "Strong Institutional Reputation",
    stat: "Active Alumni Advocates",
    description: "Engaged alumni become your strongest PR. Word-of-mouth from successful graduates attracts better students and partnerships.",
    icon: Award,
  },
]

// ─── Roadmap ────────────────────────────────────────────────────────────────
const ROADMAP = [
  {
    phase: "Phase 1: MVP (Live Now)",
    status: "✓ In Production",
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    features: [
      "4 Role-based dashboards",
      "Alumni profiles & directory",
      "Mentorship workflow",
      "Event management",
      "Analytics dashboard",
      "Invite & claim system",
      "Audit logs",
      "Settings & preferences",
    ],
  },
  {
    phase: "Phase 2: Communication Hub",
    status: "Coming Q3 2026",
    icon: MessageCircle,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    features: [
      "In-platform messaging",
      "Email notifications",
      "Announcement broadcasts",
      "Group discussions",
      "Real-time activity feed",
    ],
  },
  {
    phase: "Phase 3: Advanced Automation",
    status: "Coming Q4 2026",
    icon: Zap,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    features: [
      "Smart mentor matching",
      "Automated scheduling",
      "Workflow automation",
      "Email template builder",
      "Bulk operations",
    ],
  },
  {
    phase: "Phase 4: Intelligence & Scale",
    status: "Coming 2027",
    icon: TrendingUp,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    features: [
      "AI-powered mentor recommendations",
      "Predictive engagement analytics",
      "Custom reporting",
      "API & integrations",
      "Multi-institution support",
    ],
  },
]

// ─── Demo Checklist ─────────────────────────────────────────────────────────
const DEMO_HIGHLIGHTS = [
  {
    role: "Student Discovery",
    action: "Login → Directory → Search alumni → Request mentorship",
  },
  {
    role: "Alumni Engagement",
    action: "Login → See requests → Accept/Reject → Track mentorship",
  },
  {
    role: "Admin Control",
    action: "Login → Analytics → User management → Audit logs",
  },
  {
    role: "Institutional Insight",
    action: "View engagement metrics → Mentorship acceptance rates → Network size",
  },
]


export default function ExpoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
      {/* ─── Navigation ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/50 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl font-bold">Alumni Connect</h1>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 font-medium">
              IT EXPO
            </span>
          </div>
          <Link
            to="/story"
            className="text-slate-300 hover:text-blue-400 transition-colors text-sm font-medium"
          >
            Back to Story
          </Link>
        </div>
      </nav>

      {/* ─── Hero Section (PROBLEM STATEMENT) ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="space-y-8 text-center">
          {/* Problem headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-7xl font-bold leading-tight">
              Your Alumni Network Is Your
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"> Greatest Asset</span>
            </h1>
            <p className="text-2xl text-slate-300 font-light">
              But most institutions can't activate it.
            </p>
          </div>

          {/* The payoff */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 max-w-3xl mx-auto">
            <p className="text-xl text-slate-200 font-semibold mb-2">
              Institutions that activate alumni networks see:
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-green-400">30%+</p>
                <p className="text-sm text-slate-300">Higher Career Placement</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-400">5x</p>
                <p className="text-sm text-slate-300">Engagement & Feedback</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-400">↑ Reputation</p>
                <p className="text-sm text-slate-300">Through Alumni Advocacy</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
          >
            See It in Action (5 min)
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Problem → Opportunity Comparison ──────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-y border-slate-700/50 py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold">Without Activation vs. With Alumni Connect</h2>
            <p className="text-lg text-slate-300">The difference between dormant alumni networks and engines for growth</p>
          </div>

          <div className="grid gap-6">
            {PROBLEM_OPPORTUNITY.map((item, idx) => (
              <div key={idx} className="grid md:grid-cols-2 gap-6">
                {/* Problem */}
                <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div className="flex items-start gap-3 mb-3">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-lg text-slate-200">{item.label}</h3>
                  </div>
                  <p className="text-slate-400">{item.without}</p>
                </div>
                {/* Opportunity */}
                <div className="p-6 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                    <h3 className="font-bold text-lg text-slate-200">With Alumni Connect</h3>
                  </div>
                  <p className="text-slate-400">{item.with}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Core Impact Section ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold">What Judges Need to Know</h2>
          <p className="text-lg text-slate-300">Three core outcomes that drive institutional improvement</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {CORE_IMPACT.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="p-8 rounded-xl bg-gradient-to-br from-slate-800/60 to-slate-900/40 border border-slate-700/60 hover:border-blue-500/50 transition-all group"
              >
                <div className="mb-4">
                  <Icon className="w-8 h-8 text-blue-400 group-hover:text-blue-300" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-300 transition-colors">{item.title}</h3>
                <p className="text-3xl font-bold text-emerald-400 mb-4">{item.stat}</p>
                <p className="text-slate-400">{item.description}</p>
              </div>
            )
          })}
        </div>

        {/* CTA to Demo */}
        <div className="text-center pt-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-green-500/25"
          >
            See It Working Now →
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Roadmap Section ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 border-y border-slate-700/50 py-20">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold">What's Next</h2>
            <p className="text-lg text-slate-300">From live MVP to full-scale institutional engagement platform</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {ROADMAP.map((phase, idx) => {
              const Icon = phase.icon
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border ${phase.border} bg-slate-800/30 hover:border-slate-600/50 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold">{phase.phase}</h3>
                      <p className={`text-xs font-semibold tracking-wide ${phase.color}`}>{phase.status}</p>
                    </div>
                    <Icon className={`w-6 h-6 ${phase.color}`} />
                  </div>
                  <ul className="space-y-2">
                    {phase.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-slate-500 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Demo Highlights ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl font-bold">Quick Demo Tour</h2>
          <p className="text-lg text-slate-300">See exactly how judges can experience the product in 5 minutes</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {DEMO_HIGHLIGHTS.map((demo, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-300">{idx + 1}</span>
                </div>
                <h3 className="font-bold text-lg">{demo.role}</h3>
              </div>
              <p className="text-slate-400 text-sm">{demo.action}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Technical Stack ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 border-y border-slate-700/50 py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Built For Scale</h2>
            <p className="text-slate-300">Modern, production-ready architecture</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/20 text-center">
              <p className="text-xs font-bold text-blue-400 uppercase mb-2">Frontend</p>
              <p className="text-sm text-slate-300">React + TypeScript + Vite</p>
            </div>
            <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/20 text-center">
              <p className="text-xs font-bold text-green-400 uppercase mb-2">Backend</p>
              <p className="text-sm text-slate-300">Node.js + Express</p>
            </div>
            <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/20 text-center">
              <p className="text-xs font-bold text-purple-400 uppercase mb-2">Database</p>
              <p className="text-sm text-slate-300">PostgreSQL + Prisma</p>
            </div>
            <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/20 text-center">
              <p className="text-xs font-bold text-orange-400 uppercase mb-2">Security</p>
              <p className="text-sm text-slate-300">RBAC + Audit Logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="text-4xl font-bold">Ready to See Your Network as a Competitive Advantage?</h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          Alumni Connect is live and production-ready. Watch how top institutions activate their alumni networks to drive measurable improvement across careers, curriculum, and reputation.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
        >
          Live Demo (Judges Start Here)
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 py-8 text-center text-slate-400 text-sm">
        <p>Alumni Connect © 2026 | Transforming Alumni Networks</p>
      </footer>
    </div>
  )
}
