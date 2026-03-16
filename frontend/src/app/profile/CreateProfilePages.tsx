import { useState } from "react"
import { useNavigate } from "react-router-dom"

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

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault()

    const res = await fetch("http://localhost:5000/profiles", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.message)
      return
    }

    alert("Profile created")

    navigate("/directory")

  }

  return (

    <div className="max-w-xl mx-auto p-8">

      <h1 className="text-2xl font-semibold mb-6">
        Create Alumni Profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">

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

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Create Profile
        </button>

      </form>

    </div>

  )

}