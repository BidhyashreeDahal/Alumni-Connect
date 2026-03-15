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

    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">

        {/* Header */}

        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Request Mentorship
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Send a mentorship request to connect with this alumni.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Message */}

        <div className="space-y-2">

          <label className="text-sm font-medium text-gray-600">
            Message
          </label>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Introduce yourself and explain what guidance you're looking for..."
            className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm h-28 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
          />

          <p className="text-xs text-gray-400">
            Briefly describe your goals or the topics you'd like guidance on.
          </p>

        </div>

        {/* Actions */}

        <div className="flex justify-end gap-3 pt-2">

          <button
            onClick={onClose}
            className="border border-gray-200 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {loading ? "Sending..." : "Send Request"}
          </button>

        </div>

      </div>

    </div>

  )
}