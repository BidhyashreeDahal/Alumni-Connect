import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type PrivateNotesPanelProps = {
  profileId: string
  profileType: "student" | "alumni"
}

export default function PrivateNotesPanel({ profileId, profileType }: PrivateNotesPanelProps) {

  const [notes, setNotes] = useState<any[]>([])
  const [content, setContent] = useState("")

  async function loadNotes() {

    const res = await fetch(
      `http://localhost:5000/notes/profile/${profileId}?profileType=${profileType}&limit=5`,
      { credentials: "include" }
    )

    const data = await res.json()
    setNotes(data.notes || [])

  }

  useEffect(() => {
    loadNotes()
  }, [])

  async function createNote() {

    if (!content.trim()) return

    await fetch("http://localhost:5000/notes", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId,
        profileType,
        content
      })
    })

    setContent("")
    loadNotes()

  }

  return (

    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">

      <h2 className="text-sm font-medium text-gray-500">
        Private Notes
      </h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a note about this profile..."
        className="border px-3 py-2 rounded-md text-sm w-full"
      />

      <button
        onClick={createNote}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
      >
        Add Note
      </button>

      <div className="space-y-3 max-h-60 overflow-y-auto">

        {notes.map((note: any) => (

          <div
            key={note.id}
            className="border rounded-md p-3 text-sm bg-slate-50"
          >

            <p className="text-xs text-gray-500 mb-1">
              {new Date(note.createdAt).toLocaleDateString()}
            </p>

            <p>{note.content}</p>

          </div>

        ))}

      </div>

    <Link
  to={`/profiles/${profileId}/notes`}
  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition"
>
  View note history →
</Link>

    </div>

  )

}