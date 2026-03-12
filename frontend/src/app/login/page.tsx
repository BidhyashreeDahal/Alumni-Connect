import { useState } from "react"
import { Mail, Lock, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || "Login failed")
      }

      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),_transparent_45%)]"></div>

      <div className="relative w-full max-w-md">

        {/* Logo + Branding */}
        <div className="mb-10 text-center">

          <img
            src="/Images/logo.svg"
            alt="Alumni Connect"
            className="mx-auto h-16 w-auto"
          />

          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Alumni Connect
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Structured mentorship and alumni engagement
          </p>

        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">

          {/* Card Header */}
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
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Email address
              </label>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">

                <Mail className="h-4 w-4 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@university.edu"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  required
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
                  Forgot password
                </a>
              </div>

              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">

                <Lock className="h-4 w-4 text-slate-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  required
                />

              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Footer text */}
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