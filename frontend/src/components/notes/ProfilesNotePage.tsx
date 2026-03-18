import { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"

export default function ProfileNotesPage() {

  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const searchKey = searchParams.toString()

  const [notes, setNotes] = useState<any[]>([])
  const [content, setContent] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [profileType, setProfileType] = useState<"student" | "alumni" | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  })

  const [page, setPage] = useState(1)
  const limit = 10

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)

  async function resolveProfileType() {
    const queryType = searchParams.get("profileType")
    if (queryType === "student" || queryType === "alumni") {
      setProfileType(queryType)
      return queryType
    }

    if (!id) {
      setProfileType(null)
      return null
    }

    const res = await fetch(`http://localhost:5000/profiles/${id}`, {
      credentials: "include"
    })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data?.message || "Failed to resolve profile type")
    }

    const resolvedType = data?.profileType
    if (resolvedType !== "student" && resolvedType !== "alumni") {
      throw new Error("Profile type could not be determined")
    }

    setProfileType(resolvedType)
    return resolvedType
  }

  async function loadNotes() {
    try {
      setLoading(true)
      setError("")

      const resolvedProfileType = await resolveProfileType()
      if (!id || !resolvedProfileType) {
        setNotes([])
        return
      }

      const res = await fetch(
        `http://localhost:5000/notes/profile/${id}?profileType=${resolvedProfileType}&page=${page}&limit=${limit}`,
        { credentials: "include" }
      )

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load notes")
      }

      setNotes(data.notes || [])
      setPagination(
        data.pagination || {
          total: 0,
          page,
          limit,
          pages: 1
        }
      )
    } catch (err: any) {
      setNotes([])
      setPagination({
        total: 0,
        page,
        limit,
        pages: 1
      })
      setError(err?.message || "Failed to load notes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotes()
  }, [page, id, searchKey])

  useEffect(() => {
    setPage(1)
  }, [id, profileType])

  async function createNote() {

    if (!content.trim() || !profileType) return

    await fetch("http://localhost:5000/notes", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: id,
        profileType,
        content
      })
    })

    setContent("")
    loadNotes()

  }

  function openDeleteModal(noteId: string) {
    setNoteToDelete(noteId)
    setDeleteModalOpen(true)
  }

  async function confirmDelete() {

    if (!noteToDelete) return

    await fetch(`http://localhost:5000/notes/${noteToDelete}`, {
      method: "DELETE",
      credentials: "include"
    })

    setDeleteModalOpen(false)
    setNoteToDelete(null)

    loadNotes()
  }

  async function updateNote(noteId: string) {

    if (!editingContent.trim()) return

    await fetch(`http://localhost:5000/notes/${noteId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: editingContent
      })
    })

    setEditingId(null)
    setEditingContent("")
    loadNotes()

  }

  return (

    <div className="max-w-4xl mx-auto p-8 space-y-8">

      {/* Header */}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
          Notes History
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Internal notes recorded by faculty and administrators.
          </p>
        </div>

        {id && (
          <Link
            to={`/profile/${id}`}
            className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            Back to Profile
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Create Note */}

      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note..."
          className="border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-md text-sm w-full outline-none"
        />

        <button
          onClick={createNote}
          disabled={!profileType}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add Note
        </button>

      </div>

      {/* Notes Timeline */}

      <div className="space-y-6 border-l-2 border-blue-200 pl-6">

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
            Loading note history...
          </div>
        )}

        {!loading && notes.length === 0 && !error && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
            No notes have been recorded for this profile yet.
          </div>
        )}

        {notes.map((note) => (

          <div key={note.id} className="relative">

            <div className="absolute -left-[11px] top-1 w-4 h-4 bg-blue-500 rounded-full" />

            <div className="bg-white border border-slate-200 rounded-lg p-4">

              <div className="flex justify-between items-center mb-2">

                <p className="text-xs text-slate-500">
                  {new Date(note.createdAt).toLocaleDateString()}
                </p>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() => {
                      setEditingId(note.id)
                      setEditingContent(note.content)
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => openDeleteModal(note.id)}
                    className="px-2.5 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition"
                  >
                    Delete
                  </button>

                </div>

              </div>

              {editingId === note.id ? (

                <div className="space-y-3">

                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-md text-sm outline-none"
                  />

                  <div className="flex gap-2">

                    <button
                      onClick={() => updateNote(note.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              ) : (

                <p className="text-sm text-slate-800">
                  {note.content}
                </p>

              )}

            </div>

          </div>

        ))}

      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between border-t pt-4">

        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="text-sm text-slate-500">
          Page <span className="font-medium text-slate-700">{pagination.page}</span>
        </div>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading || pagination.page >= Math.max(1, pagination.pages)}
          className="px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>

      </div>

      {/* Delete Confirmation Modal */}

      {deleteModalOpen && (

        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">

          <div className="bg-white rounded-lg shadow-lg w-[380px] p-6 space-y-4">

            <h2 className="text-lg font-semibold text-slate-900">
              Delete Note
            </h2>

            <p className="text-sm text-slate-600">
             Are you sure you want to delete the note?
            </p>

            <div className="flex justify-end gap-3 pt-2">

              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

}