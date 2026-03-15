import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { api } from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: FormEvent) {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      await api.post("/auth/login", { email, password })
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img
            src="/Images/alumni-connect-brand.svg"
            alt="Alumni Connect"
            className="h-14"
          />
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Sign in to Alumni Connect
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Use your institutional account to access the platform.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@college.edu"
              className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full h-10 rounded-md border border-slate-300 px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={16} />}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-6 flex justify-between text-xs text-slate-500">
          <span>Need access? Contact your administrator.</span>

          <Link
            to="/story"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Story
          </Link>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          Unauthorized access is prohibited. Activity may be monitored.
        </p>

      </div>
    </div>
  )
}