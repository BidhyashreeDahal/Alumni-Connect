import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"

export default function MentorshipPage() {

  const { user } = useAuth()

  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

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

      const baseUrl =
        user?.role === "alumni"
          ? "http://localhost:5000/mentorship/requests"
          : "http://localhost:5000/mentorship/my"

      const res = await fetch(
        `${baseUrl}?page=${page}&limit=5`,
        { credentials: "include" }
      )

      const data = await res.json()

      setRequests(data.requests || [])
      setTotalPages(data.totalPages || 1)

    } catch (err) {

      console.error("Mentorship fetch error:", err)

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    if (!user) return

    if (user.role === "faculty" || user.role === "admin") {
      setLoading(false)
      return
    }

    loadRequests()

  }, [user, page])

  async function acceptRequest(id: string) {

    await fetch(`http://localhost:5000/mentorship/${id}/accept`, {
      method: "PATCH",
      credentials: "include"
    })

    loadRequests()
  }

  async function rejectRequest(id: string) {

    await fetch(`http://localhost:5000/mentorship/${id}/reject`, {
      method: "PATCH",
      credentials: "include"
    })

    loadRequests()
  }

  async function completeMentorship(id: string) {

    await fetch(`http://localhost:5000/mentorship/${id}/complete`, {
      method: "PATCH",
      credentials: "include"
    })

    loadRequests()
  }

  if (loading)
    return <p className="p-8 text-sm text-gray-500">Loading mentorship...</p>

  return (

    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-6">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Mentorship
        </h1>

        <p className="text-sm text-slate-500">
          Track mentorship connections and manage guidance requests.
        </p>

      </div>

      {/* LIST */}

      <div className="space-y-6">

        {requests.map(req => (

          <div
            key={req.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >

            {/* TOP */}

            <div className="flex justify-between items-start">

              <div>

                {user?.role === "alumni" ? (

                  <>
                    <p className="font-semibold text-slate-900">
                      {req.student?.firstName} {req.student?.lastName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {req.student?.program}
                    </p>

                  </>

                ) : (

                  <>
                    <p className="font-semibold text-slate-900">
                      {req.alumni?.firstName} {req.alumni?.lastName}
                    </p>

                    <p className="text-sm text-slate-500">
                      {req.alumni?.company}
                    </p>

                  </>

                )}

              </div>

              {/* DATE */}

              <p className="text-xs text-slate-400">
                {new Date(req.createdAt).toLocaleDateString()}
              </p>

            </div>

            {/* MESSAGE */}

            {req.message && (

              <div className="mt-3 max-w-xl bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-700">

                {req.message}

              </div>

            )}

            {/* FOOTER */}

            <div className="flex justify-between items-center mt-4">

              <span
                className={`text-xs px-2.5 py-1 rounded-full ${statusBadge(req.status)}`}
              >
                {req.status}
              </span>

              <div className="flex gap-2">

                {user?.role === "alumni" && req.status === "pending" && (

                  <>
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Decline
                    </button>
                  </>

                )}

                {user?.role === "student" && req.status === "accepted" && (

                  <button
                    onClick={() => completeMentorship(req.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Complete
                  </button>

                )}

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (

        <div className="flex justify-center gap-3 pt-2">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="border border-slate-300 px-3 py-1 rounded text-sm disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm text-slate-600">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="border border-slate-300 px-3 py-1 rounded text-sm disabled:opacity-40"
          >
            Next
          </button>

        </div>

      )}

    </div>

  )

}