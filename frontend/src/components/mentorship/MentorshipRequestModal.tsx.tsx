import { useState } from "react"
import { api } from "@/lib/api"

export default function MentorshipRequestModal({
  alumniId,
  onClose
}: {
  alumniId: string
  onClose: () => void
}) {

  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {

    setLoading(true)
    setError("")

    try {

      await api.post("/mentorship/request", {
        alumniId,
        message
      })

      onClose()

    } catch (err: any) {

      const msg =
        err?.response?.data?.message ||
        "Failed to send mentorship request"

      setError(msg)

    } finally {

      setLoading(false)

    }
  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-xl shadow-lg w-[420px] p-6 space-y-4">

        <h2 className="text-lg font-semibold">
          Request Mentorship
        </h2>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
            {error}
          </div>
        )}

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Introduce yourself and explain what you want guidance on..."
          className="w-full border rounded-md p-2 text-sm h-28"
        />

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-md text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>

        </div>

      </div>

    </div>
  )
}