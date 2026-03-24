import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { mentorshipAPI } from "@/api/client"
import { getUserErrorMessage } from "@/lib/error"

type MentorshipRequest = {
  id: string
  status: "pending" | "accepted" | "scheduled" | "declined" | "cancelled" | "completed"
  message?: string | null
  createdAt: string
  scheduledAt?: string | null
  meetingLink?: string | null
  meetingNotes?: string | null
  confirmedAt?: string | null
  student?: {
    firstName?: string | null
    lastName?: string | null
    program?: string | null
    personalEmail?: string | null
    schoolEmail?: string | null
    linkedinUrl?: string | null
  } | null
  alumni?: {
    firstName?: string | null
    lastName?: string | null
    company?: string | null
    personalEmail?: string | null
    schoolEmail?: string | null
    linkedinUrl?: string | null
    meetingLink?: string | null
    preferredMentorshipChannel?: "email" | "linkedin" | "calendly" | null
  } | null
}

export default function MentorshipPage() {

  const { user } = useAuth()

  const [requests, setRequests] = useState<MentorshipRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")
  const [actionSuccess, setActionSuccess] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [feedbackOpenId, setFeedbackOpenId] = useState<string | null>(null)
  const [feedbackForms, setFeedbackForms] = useState<Record<string, { rating: string; comment: string }>>({})
  const [submittedFeedbackIds, setSubmittedFeedbackIds] = useState<Record<string, true>>({})

  const isAlumni = user?.role === "alumni"
  const isStudent = user?.role === "student"

  function statusBadge(status: string) {

    if (status === "pending")
      return "bg-yellow-100 text-yellow-700"

    if (status === "accepted")
      return "bg-green-100 text-green-700"

    if (status === "scheduled")
      return "bg-indigo-100 text-indigo-700"

    if (status === "declined")
      return "bg-red-100 text-red-700"

    if (status === "completed")
      return "bg-blue-100 text-blue-700"

    return "bg-gray-100 text-gray-600"
  }

  async function loadRequests() {

    try {
      setError("")

      const data = isAlumni
        ? await mentorshipAPI.getIncomingRequests({ page, limit: 5 })
        : await mentorshipAPI.getMyRequests({ page, limit: 5 })

      setRequests(data.requests || [])
      setTotalPages(Math.max(1, data.totalPages || 1))

    } catch (err: any) {
      setError(getUserErrorMessage(err, "Failed to load mentorship requests"))

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
    try {
      setBusyId(id)
      setActionError("")
      setActionSuccess("")
      await mentorshipAPI.accept(id)
      setActionSuccess("Mentorship request accepted")
      loadRequests()
    } catch (err: any) {
      setActionError(getUserErrorMessage(err, "Failed to accept mentorship request"))
    } finally {
      setBusyId(null)
    }
  }

  async function rejectRequest(id: string) {
    try {
      setBusyId(id)
      setActionError("")
      setActionSuccess("")
      await mentorshipAPI.reject(id)
      setActionSuccess("Mentorship request declined")
      loadRequests()
    } catch (err: any) {
      setActionError(getUserErrorMessage(err, "Failed to decline mentorship request"))
    } finally {
      setBusyId(null)
    }
  }

  async function completeMentorship(id: string) {
    try {
      setBusyId(id)
      setActionError("")
      setActionSuccess("")
      await mentorshipAPI.complete(id)
      setActionSuccess("Mentorship marked as completed")
      loadRequests()
    } catch (err: any) {
      setActionError(getUserErrorMessage(err, "Failed to complete mentorship"))
    } finally {
      setBusyId(null)
    }
  }

  function updateFeedbackField(id: string, field: "rating" | "comment", value: string) {
    setFeedbackForms((prev) => ({
      ...prev,
      [id]: {
        rating: prev[id]?.rating || "5",
        comment: prev[id]?.comment || "",
        [field]: value
      }
    }))
  }

  async function submitFeedback(id: string) {
    const form = feedbackForms[id]
    const rating = Number(form?.rating || 0)

    if (!rating || rating < 1 || rating > 5) {
      setActionError("Please provide a rating between 1 and 5")
      return
    }

    try {
      setBusyId(id)
      setActionError("")
      setActionSuccess("")
      await mentorshipAPI.submitFeedback(id, {
        rating,
        comment: form?.comment?.trim() || undefined
      })
      setSubmittedFeedbackIds((prev) => ({ ...prev, [id]: true }))
      setFeedbackOpenId(null)
      setActionSuccess("Feedback submitted successfully")
    } catch (err: any) {
      setActionError(getUserErrorMessage(err, "Failed to submit feedback"))
    } finally {
      setBusyId(null)
    }
  }

  const pageTitle = isAlumni ? "Mentorship Management" : "Mentorship"
  const pageSubtitle = isAlumni
    ? "Review incoming requests, share your preferred contact options, and close completed mentorship connections."
    : "Track requests from acceptance through direct contact and feedback."

  const now = useMemo(() => Date.now(), [requests])

  function isPastScheduledTime(req: MentorshipRequest) {
    return Boolean(req.scheduledAt && new Date(req.scheduledAt).getTime() <= now)
  }

  if (loading)
    return <p className="p-8 text-sm text-gray-500">Loading mentorship...</p>

  return (

    <div className="mx-auto max-w-5xl space-y-6 px-6 pb-6 pt-2 md:px-10 md:pb-10 md:pt-4">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {pageTitle}
        </h1>

        <p className="text-sm text-slate-500">
          {pageSubtitle}
        </p>

      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {actionSuccess}
        </div>
      )}

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

                {isAlumni ? (

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

            {feedbackOpenId === req.id && (
              <div className="mt-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                <select
                  value={feedbackForms[req.id]?.rating || "5"}
                  onChange={(e) => updateFeedbackField(req.id, "rating", e.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Average</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>
                <textarea
                  rows={3}
                  value={feedbackForms[req.id]?.comment || ""}
                  onChange={(e) => updateFeedbackField(req.id, "comment", e.target.value)}
                  placeholder="Optional feedback comment"
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => submitFeedback(req.id)}
                    disabled={busyId === req.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm disabled:opacity-50"
                  >
                    {busyId === req.id ? "Submitting..." : "Submit Feedback"}
                  </button>
                  <button
                    onClick={() => setFeedbackOpenId(null)}
                    className="border border-slate-300 px-3 py-2 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isStudent && ["accepted", "scheduled"].includes(req.status) && req.alumni && (
              <div className="mt-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Contact Mentor</p>
                <p className="mt-1 text-xs text-slate-600">
                  Coordinate directly through the mentor's preferred communication channel.
                </p>
                {req.alumni.preferredMentorshipChannel && (
                  <p className="mt-1 text-xs text-sky-900">
                    Preferred channel: {req.alumni.preferredMentorshipChannel === "calendly"
                      ? "Calendly / Booking Link"
                      : req.alumni.preferredMentorshipChannel === "linkedin"
                      ? "LinkedIn"
                      : "Email"}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {req.alumni.personalEmail && (
                    <a className="rounded border border-sky-300 bg-white px-2.5 py-1 text-xs text-sky-800 hover:bg-sky-100" href={`mailto:${req.alumni.personalEmail}`}>
                      Email: {req.alumni.personalEmail}
                    </a>
                  )}
                  {req.alumni.schoolEmail && (
                    <a className="rounded border border-sky-300 bg-white px-2.5 py-1 text-xs text-sky-800 hover:bg-sky-100" href={`mailto:${req.alumni.schoolEmail}`}>
                      School Email
                    </a>
                  )}
                  {req.alumni.linkedinUrl && (
                    <a className="rounded border border-sky-300 bg-white px-2.5 py-1 text-xs text-sky-800 hover:bg-sky-100" href={req.alumni.linkedinUrl} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {req.alumni.meetingLink && (
                    <a className="rounded border border-sky-300 bg-white px-2.5 py-1 text-xs text-sky-800 hover:bg-sky-100" href={req.alumni.meetingLink} target="_blank" rel="noreferrer">
                      Calendly / Booking Link
                    </a>
                  )}
                </div>
              </div>
            )}

            {isAlumni && ["accepted", "scheduled"].includes(req.status) && req.student && (
              <div className="mt-3 rounded-md border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Student Contact</p>
                <p className="mt-1 text-xs text-slate-600">
                  Coordinate directly through email or LinkedIn and complete the mentorship once your session is done.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {req.student.personalEmail && (
                    <a className="rounded border border-sky-300 bg-white px-2.5 py-1 text-xs text-sky-800 hover:bg-sky-100" href={`mailto:${req.student.personalEmail}`}>
                      Email: {req.student.personalEmail}
                    </a>
                  )}
                  {req.student.schoolEmail && (
                    <a className="rounded border border-sky-300 bg-white px-2.5 py-1 text-xs text-sky-800 hover:bg-sky-100" href={`mailto:${req.student.schoolEmail}`}>
                      School Email
                    </a>
                  )}
                  {req.student.linkedinUrl && (
                    <a className="rounded border border-sky-300 bg-white px-2.5 py-1 text-xs text-sky-800 hover:bg-sky-100" href={req.student.linkedinUrl} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  )}
                </div>
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

                {isAlumni && req.status === "pending" && (

                  <>
                    <button
                      onClick={() => acceptRequest(req.id)}
                      disabled={busyId === req.id}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => rejectRequest(req.id)}
                      disabled={busyId === req.id}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Decline
                    </button>
                  </>

                )}

                {isAlumni && req.status === "accepted" && (

                  <button
                    onClick={() => completeMentorship(req.id)}
                    disabled={busyId === req.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Mark Complete
                  </button>

                )}

                {isStudent && req.status === "accepted" && (
                  <button
                    onClick={() => completeMentorship(req.id)}
                    disabled={busyId === req.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Complete
                  </button>
                )}

                {req.status === "scheduled" && (
                  <button
                    onClick={() => completeMentorship(req.id)}
                    disabled={busyId === req.id}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    {isAlumni ? "Mark Complete" : "Complete"}
                  </button>
                )}

                {req.status === "scheduled" && isPastScheduledTime(req) && !submittedFeedbackIds[req.id] && (
                  <button
                    onClick={() => setFeedbackOpenId(req.id)}
                    className="border border-blue-300 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-50"
                  >
                    Leave Feedback
                  </button>
                )}

              </div>

            </div>

          </div>

        ))}

        {!requests.length && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              {isAlumni ? "No mentorship requests yet" : "No mentorship activity yet"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {isAlumni
                ? "New student requests will appear here once they reach your profile."
                : "Your mentorship requests and updates will appear here once you start reaching out to alumni."}
            </p>
          </div>
        )}

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