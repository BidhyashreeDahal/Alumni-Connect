import { useState } from "react"
import { api } from "@/lib/api"

export default function MentorshipRequestModal({
  alumniId,
  alumniName,
  company,
  onClose
}: {
  alumniId: string
  alumniName?: string
  company?: string
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

    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">

        {/* HEADER */}

        <div className="flex justify-between items-start">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Request Mentorship
            </h2>

            <p className="text-sm text-gray-500">
              Send a request to connect with this alumni mentor.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>

        </div>

        {/* MENTOR */}

        <div className="border rounded-lg p-4 bg-slate-50">

          <p className="text-xs text-gray-500 uppercase">
            Mentor
          </p>

          <p className="text-sm font-semibold text-gray-900">
            {alumniName || "Alumni"}
          </p>

          {company && (
            <p className="text-xs text-gray-500">
              {company}
            </p>
          )}

        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">
            {error}
          </div>
        )}

        {/* MESSAGE */}

        <div className="space-y-2">

          <label className="text-sm font-medium text-gray-700">
            Message
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Explain what guidance you're looking for..."
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm h-24 resize-none focus:ring-1 focus:ring-blue-500"
          />

          <p className="text-xs text-gray-400">
            Minimum 20 characters
          </p>

        </div>

        {/* ACTIONS */}

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || message.trim().length < 20}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-40"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>

        </div>

      </div>

    </div>

  )
}