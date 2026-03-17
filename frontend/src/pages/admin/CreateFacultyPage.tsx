import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"

export default function CreateFacultyPage() {

  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()
    setError("")
    setLoading(true)

    try {

      await api.post("/users", {
        email,
        password,
        role: "faculty"
      })

      navigate("/adminmanagement")

    } catch (err: any) {

      setError(err.message || "Failed to create faculty")

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="max-w-xl mx-auto p-6 md:p-10 space-y-6">

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Create Faculty Account
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add a faculty administrator to the Alumni Connect platform
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Faculty Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full"
            required
          />

          <input
            type="password"
            placeholder="Temporary Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full"
            required
          />

          <div className="flex gap-3 pt-2">

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              {loading ? "Creating..." : "Create Faculty"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/adminmanagement")}
              className="px-5 py-2 rounded-md text-sm border border-slate-300"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>

  )
}