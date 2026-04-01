import { Link } from "react-router-dom"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Terms of Use</h1>
        <p className="mt-2 text-sm text-slate-500">Version v1 - Effective March 2026</p>

        <div className="mt-6 space-y-5 text-sm text-slate-700">
          <section>
            <h2 className="font-semibold text-slate-900">1. Platform Purpose</h2>
            <p className="mt-1">Alumni Connect helps students, alumni, faculty, and admins collaborate through profiles, mentorship, events, and announcements.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">2. Account Responsibility</h2>
            <p className="mt-1">You are responsible for keeping your account credentials secure and for activity under your account.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">3. Acceptable Use</h2>
            <p className="mt-1">Do not use the platform for harassment, impersonation, scraping, spam, or any unlawful activity.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">4. Mentorship Disclaimer</h2>
            <p className="mt-1">Mentorship interactions are facilitated by the platform but outcomes are not guaranteed. Users are responsible for professional communication and conduct.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">5. Enforcement</h2>
            <p className="mt-1">Administrators may restrict or deactivate accounts that violate policy or create risk for the community.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">6. Contact</h2>
            <p className="mt-1">For policy questions, contact your institution's Alumni Connect administrator.</p>
          </section>
        </div>

        <div className="mt-8">
          <Link to="/claim" className="text-sm font-medium text-blue-600 hover:text-blue-700">Back to Claim</Link>
        </div>
      </div>
    </div>
  )
}
