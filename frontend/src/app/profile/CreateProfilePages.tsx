import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL } from "@/lib/http"

export default function CreateProfilePage() {

  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    schoolEmail: "",
    personalEmail: "",
    program: "",
    graduationYear: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()
    setError("")

    try {
      setLoading(true)
      const res = await fetch(`${API_BASE_URL}/profiles`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          typeof data?.message === "string" && data.message.trim()
            ? data.message
            : "Failed to create profile"
        )
      }

      navigate("/directory")
    } catch (err: any) {
      setError(err?.message || "Failed to create profile")
    } finally {
      setLoading(false)
    }

  }

  return (

    <div className="max-w-xl mx-auto p-8">

      <h1 className="text-2xl font-semibold mb-6">
        Create Alumni Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <input
          placeholder="First name"
          onChange={(e)=>setForm({...form, firstName:e.target.value})}
          className="border px-3 py-2 w-full rounded"
        />

        <input
          placeholder="Last name"
          onChange={(e)=>setForm({...form, lastName:e.target.value})}
          className="border px-3 py-2 w-full rounded"
        />

        <input
          placeholder="School email"
          onChange={(e)=>setForm({...form, schoolEmail:e.target.value})}
          className="border px-3 py-2 w-full rounded"
        />

        <input
          placeholder="Program"
          onChange={(e)=>setForm({...form, program:e.target.value})}
          className="border px-3 py-2 w-full rounded"
        />

        <input
          placeholder="Graduation year"
          onChange={(e)=>setForm({...form, graduationYear:e.target.value})}
          className="border px-3 py-2 w-full rounded"
        />

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Profile"}
        </button>

      </form>

    </div>

  )

}