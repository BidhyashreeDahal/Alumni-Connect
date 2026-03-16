import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function CreateProfilePage() {

  const navigate = useNavigate()

  const [type, setType] = useState<"alumni" | "student">("alumni")

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    personalEmail: "",
    schoolEmail: "",
    program: "",
    graduationYear: "",
    company: "",
    jobTitle: ""
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function updateField(key: string, value: string) {
    setForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()
    setError("")
    setLoading(true)

    try {

      let endpoint = ""
      let payload: any = {}

      if (type === "alumni") {

        endpoint = "http://localhost:5000/alumni"

        payload = {
          ...form,
          graduationYear: form.graduationYear
            ? parseInt(form.graduationYear)
            : null
        }

      } else {

        endpoint = "http://localhost:5000/users"

        payload = {
          email: form.personalEmail || form.schoolEmail,
          password: "TempPassword123!",
          role: "student",
          firstName: form.firstName,
          lastName: form.lastName,
          program: form.program,
          graduationYear: form.graduationYear
            ? parseInt(form.graduationYear)
            : null
        }

      }

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message)

      navigate("/directory")

    } catch (err: any) {

      setError(err.message || "Failed to create profile")

    } finally {

      setLoading(false)

    }

  }

  return (

    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Create Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add a new student or alumni profile to the network
        </p>
      </div>

      {/* Card */}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

        {/* Profile Type */}

        <div className="mb-6">

          <label className="text-sm font-medium text-slate-700">
            Profile Type
          </label>

          <div className="flex gap-3 mt-3">

            <button
              type="button"
              onClick={() => setType("alumni")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                type === "alumni"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Alumni
            </button>

            <button
              type="button"
              onClick={() => setType("student")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                type === "student"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Student
            </button>

          </div>

        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Info */}

          <div>

            <h2 className="text-sm font-medium text-slate-500 mb-3">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                placeholder="First Name"
                value={form.firstName}
                onChange={e => updateField("firstName", e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                placeholder="Last Name"
                value={form.lastName}
                onChange={e => updateField("lastName", e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                required
              />

            </div>

          </div>

          {/* Contact */}

          <div>

            <h2 className="text-sm font-medium text-slate-500 mb-3">
              Contact Information
            </h2>

            <div className="space-y-3">

              <input
                placeholder="Personal Email"
                value={form.personalEmail}
                onChange={e => updateField("personalEmail", e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              />

              <input
                placeholder="School Email"
                value={form.schoolEmail}
                onChange={e => updateField("schoolEmail", e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* Academic */}

          <div>

            <h2 className="text-sm font-medium text-slate-500 mb-3">
              Academic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                placeholder="Program"
                value={form.program}
                onChange={e => updateField("program", e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              />

              <input
                placeholder="Graduation Year"
                value={form.graduationYear}
                onChange={e => updateField("graduationYear", e.target.value)}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* Career Section */}

          {type === "alumni" && (

            <div>

              <h2 className="text-sm font-medium text-slate-500 mb-3">
                Professional Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <input
                  placeholder="Company"
                  value={form.company}
                  onChange={e => updateField("company", e.target.value)}
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                />

                <input
                  placeholder="Job Title"
                  value={form.jobTitle}
                  onChange={e => updateField("jobTitle", e.target.value)}
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                />

              </div>

            </div>

          )}

          {/* Buttons */}

          <div className="flex gap-3 pt-4">

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm hover:bg-blue-700 transition"
            >
              {loading ? "Creating..." : "Create Profile"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/directory")}
              className="px-5 py-2 rounded-md text-sm border border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>

  )

}