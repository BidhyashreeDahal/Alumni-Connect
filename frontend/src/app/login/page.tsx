import { Mail, Lock, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.10),_transparent_40%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-50/80 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <img
              src="/Images/logo.svg"
              alt="Alumni Connect"
              className="mx-auto h-30 w-auto"
            />

           
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.20)]">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Sign in
                </h2>
                <p className="text-sm text-slate-500">
                  Access your platform workspace
                </p>
              </div>
            </div>

            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="your-email@university.edu"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Sign in
              </button>
            </form>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Access is managed through invite-based onboarding.
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Authorized platform access only
          </p>
        </div>
      </div>
    </div>
  )
}