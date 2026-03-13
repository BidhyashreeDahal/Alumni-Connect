import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Lock, Mail } from "lucide-react"
import { api } from "@/lib/api"

export default function LoginPage() {
  const navigate = useNavigate()
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
      navigate("/dashboard", { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-7 text-center">
          <img
            src="/Images/logo.svg"
            alt="Alumni Connect"
            className="mx-auto h-14 w-auto"
          />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
            Alumni Connect
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-100">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-brand-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand-100">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>Need access? Contact administrator.</span>
          <Link
            to="/story"
            className="font-semibold text-brand-700 transition hover:text-brand-800"
          >
            Story
          </Link>
        </div>
      </section>
    </div>
  )
}