import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function MentorshipPage() {

  const { user } = useAuth()

  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  function statusBadge(status: string) {

    if (status === "pending")
      return "bg-yellow-100 text-yellow-700"

    if (status === "accepted")
      return "bg-green-100 text-green-700"

    if (status === "declined")
      return "bg-red-100 text-red-700"

    if (status === "completed")
      return "bg-blue-100 text-blue-700"

    return "bg-gray-100 text-gray-600"
  }

  async function loadRequests() {

    try {

      const url =
        user?.role === "alumni"
          ? "http://localhost:5000/mentorship/requests"
          : "http://localhost:5000/mentorship/my"

      const res = await fetch(url, {
        credentials: "include"
      })

      const data = await res.json()

      setRequests(data.requests || [])

    } catch (err) {

      console.error("Mentorship fetch error:", err)

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    if (user) {
      loadRequests()
    }

  }, [user])

  async function acceptRequest(id: string) {

    await fetch(`http://localhost:5000/mentorship/${id}/accept`, {
      method: "PATCH",
      credentials: "include"
    })

    await loadRequests()
  }

  async function rejectRequest(id: string) {

    await fetch(`http://localhost:5000/mentorship/${id}/reject`, {
      method: "PATCH",
      credentials: "include"
    })

    await loadRequests()
  }

  async function completeMentorship(id: string) {

    await fetch(`http://localhost:5000/mentorship/${id}/complete`, {
      method: "PATCH",
      credentials: "include"
    })

    await loadRequests()
  }

  if (loading) {
    return <p className="p-8 text-sm text-gray-500">Loading requests...</p>
  }

  return (

    <div className="max-w-4xl mx-auto p-8">

      <h1 className="text-2xl font-semibold mb-6">
        Mentorship
      </h1>

      {requests.length === 0 && (

        <p className="text-sm text-gray-500">
          No mentorship requests yet.
        </p>

      )}

      <div className="space-y-4">

        {requests.map(req => (

          <div
            key={req.id}
            className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex justify-between items-start"
          >

            {/* LEFT SIDE */}
            <div className="space-y-1">

              {user?.role === "alumni" ? (

                <>
                  <p className="font-semibold text-gray-900">
                    {req.student?.firstName} {req.student?.lastName}
                  </p>

                  <p className="text-sm text-gray-500">
                    {req.student?.program}
                  </p>
                </>

              ) : (

                <>
                  <p className="font-semibold text-gray-900">
                    {req.alumni?.firstName} {req.alumni?.lastName}
                  </p>

                  <p className="text-sm text-gray-500">
                    {req.alumni?.company || "Alumni"}
                  </p>
                </>

              )}

              {req.message && (

                <p className="text-sm text-gray-600 mt-2 max-w-lg">
                  {req.message}
                </p>

              )}

              <span
                className={`inline-block text-xs px-2 py-1 rounded mt-2 ${statusBadge(req.status)}`}
              >
                {req.status}
              </span>

              {/* STUDENT CONTACT DETAILS AFTER ACCEPT */}
              {user?.role === "student" && req.status === "accepted" && (

                <div className="mt-3 text-sm space-y-1 text-gray-700">

                  <p className="text-xs text-green-600">
                    Mentorship accepted — you can now contact your mentor.
                  </p>

                  {req.alumni?.personalEmail && (
                    <p>
                      Email:{" "}
                      <a
                        href={`mailto:${req.alumni.personalEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {req.alumni.personalEmail}
                      </a>
                    </p>
                  )}

                  {req.alumni?.linkedinUrl && (
                    <p>
                      LinkedIn:{" "}
                      <a
                        href={req.alumni.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Profile
                      </a>
                    </p>
                  )}

                  {req.alumni?.meetingLink && (
                    <p>
                      Book Meeting:{" "}
                      <a
                        href={req.alumni.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Schedule Meeting
                      </a>
                    </p>
                  )}

                </div>

              )}

            </div>

            {/* RIGHT SIDE ACTIONS */}
            <div className="flex gap-2">

              {user?.role === "alumni" && req.status === "pending" && (

                <>
                  <button
                    onClick={() => acceptRequest(req.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => rejectRequest(req.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                  >
                    Decline
                  </button>
                </>

              )}

              {user?.role === "student" && req.status === "accepted" && (

                <button
                  onClick={() => completeMentorship(req.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                >
                  Mark Completed
                </button>

              )}

            </div>

          </div>

        ))}

      </div>

    </div>

  )

}