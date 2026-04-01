import { Link } from "react-router-dom"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Version v1 - Effective March 2026</p>

        <div className="mt-6 space-y-5 text-sm text-slate-700">
          <section>
            <h2 className="font-semibold text-slate-900">1. Data We Collect</h2>
            <p className="mt-1">We collect profile data, contact data, account metadata, and activity needed to run mentorship, events, and communication features.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">2. Why We Use Data</h2>
            <p className="mt-1">Data is used for directory visibility, account claims, platform operations, moderation, analytics, and security logging.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">3. Role-Based Visibility</h2>
            <p className="mt-1">Some profile fields are visible only to specific roles. Visibility rules are enforced by the platform's access policy.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">4. Cookies and Sessions</h2>
            <p className="mt-1">We use secure authentication cookies and related security controls to keep your session protected.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">5. Retention and Security</h2>
            <p className="mt-1">We keep data as needed for legitimate institutional operations and protect it with technical and administrative safeguards.</p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">6. Your Rights</h2>
            <p className="mt-1">You may request profile corrections through your account and may contact your institution for account or data support.</p>
          </section>
        </div>

        <div className="mt-8">
          <Link to="/claim" className="text-sm font-medium text-blue-600 hover:text-blue-700">Back to Claim</Link>
        </div>
      </div>
    </div>
  )
}
