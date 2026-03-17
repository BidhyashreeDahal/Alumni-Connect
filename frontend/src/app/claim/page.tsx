import { useMemo, useState } from "react"
import type { FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, AlertCircle, Lock } from "lucide-react"
import { claimAccount } from "@/api/auth.api"

export default function ClaimAccountPage() {

  const [params] = useSearchParams()

  const token = useMemo(() => params.get("token") || "", [params])

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const tokenPreview = token ? `${token.slice(0,6)}...${token.slice(-4)}` : ""

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

      setSuccess("Account activated successfully. Redirecting...")

      setTimeout(() => {
        window.location.href = "/dashboard"
      }, 1200)

    } catch (err: any) {

      setError(err?.response?.data?.message || "Failed to claim account")
      setLoading(false)

    }

  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-6">

      <div className="w-full max-w-md space-y-6">

        {/* HEADER */}

        <div className="text-center space-y-1">

          <h1 className="text-2xl font-semibold text-slate-900">
            Activate Your Account
          </h1>

          <p className="text-sm text-slate-500">
            Set your password to access Alumni Connect.
          </p>

        </div>

        {/* CARD */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-5">

          {/* TOKEN INFO */}

          {token && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-md">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Invite token detected
              <span className="font-medium">{tokenPreview}</span>
            </div>
          )}

          {!token && (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-md">
              <AlertCircle size={16} />
              Claim token missing. Please use the full invite link from your email.
            </div>
          )}

          {/* FORM */}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1">

              <label className="text-xs font-medium text-slate-600">
                New Password
              </label>

              <div className="relative">

                <Lock size={16} className="absolute left-3 top-3 text-slate-400"/>

                <input
                  type="password"
                  placeholder="Enter a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!token || loading}
                  required
                />

              </div>

              <p className="text-xs text-slate-400">
                Minimum 10 characters
              </p>

            </div>


            <div className="space-y-1">

              <label className="text-xs font-medium text-slate-600">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!token || loading}
                required
              />

            </div>


            {/* ERROR */}

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 px-3 py-2 rounded-md">
                <AlertCircle size={16}/>
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md">
                <CheckCircle2 size={16}/>
                {success}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 transition disabled:opacity-60"
            >
              {loading ? "Activating..." : "Activate Account"}
            </button>

          </form>

        </div>


        {/* FOOTER */}

        <div className="text-center">

          <Link
            to="/login"
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Back to Login
          </Link>

        </div>

      </div>

    </div>

  )

}