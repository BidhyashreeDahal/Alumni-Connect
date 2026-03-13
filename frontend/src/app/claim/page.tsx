import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { claimAccount } from "@/api/auth.api"

export default function ClaimAccountPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = useMemo(() => params.get("token") || "", [params])
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const tokenPreview = token ? `${token.slice(0, 6)}...${token.slice(-4)}` : ""

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!token) {
      setError("Invalid or missing claim token")
      return
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      await claimAccount(token, password)
      setSuccess("Account claimed successfully. Redirecting...")
      setTimeout(() => navigate("/dashboard"), 900)
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to claim account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Claim Your Account</h1>
        <p className="text-sm text-slate-500">
          Set your password to activate your Alumni Connect account.
        </p>
        {token && (
          <p className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Invite token detected: <span className="font-medium">{tokenPreview}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
            disabled={!token || loading}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
            disabled={!token || loading}
          />

          {!token && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
              Claim token is missing. Use the full invitation link from your email.
            </p>
          )}

          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          {success && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Claiming..." : "Claim Account"}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
