import { ShieldCheck } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6">

      {/* subtle background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_45%)]"></div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="mb-10 text-center">
          <img
            src="Images/logo.svg"
            alt="Alumni Connect"
            className="mx-auto h-16 w-auto"
          />

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Alumni Connect
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Secure platform connecting students, alumni, and faculty
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Sign in to your account
              </h2>
              <p className="text-sm text-slate-500">
                Use your university credentials
              </p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email address
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">

                <input
                  type="email"
                  placeholder="your-email@university.edu"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between text-sm">
                <label className="font-medium text-slate-700">
                  Password
                </label>

                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </a>
              </div>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">

                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300"/>
                Remember me
              </label>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Need access? Contact your administrator.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Alumni Connect • Authorized platform access only
        </p>

      </div>
    </div>
  )
}