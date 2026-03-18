import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

type Role = "admin" | "faculty" | "student" | "alumni"
type RSVPStatus = "registered" | "cancelled" | "waitlisted"
type AudienceType = "all" | "student" | "alumni"

type RegistrationItem = {
    id: string
    userId: string
    status: RSVPStatus
    user?: {
        email?: string
    }
}

type CurrentUserRegistration = {
    id: string
    userId: string
    status: RSVPStatus
} | null

type EventItem = {
    id: string
    title: string
    description?: string | null
    location?: string | null
    eventDate: string
    createdBy: string
    createdAt: string
    targetAudience: AudienceType
    registeredCount: number
    waitlistedCount: number
    currentUserRegistration: CurrentUserRegistration
    registrations?: RegistrationItem[]
}

export default function EventsPage() {
    const { user } = useAuth()
    const role = user?.role as Role | undefined

    const isStudentOrAlumni = role === "student" || role === "alumni"
    const isAdminOrFaculty = role === "admin" || role === "faculty"

    const title = isStudentOrAlumni ? "Event Invitations" : "Events"
    const subtitle = isStudentOrAlumni
        ? "Review available events and manage your registration."
        : "Create and review events across the platform."

    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState("")

    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        eventDate: "",
        targetAudience: "all" as AudienceType,
    })

    async function fetchEvents() {
        try {
            setLoading(true)
            setMessage("")
            const res = await api.get("/events")
            setEvents(res.data.events || [])
        } catch (error) {
            console.error("Failed to load events", error)
            setMessage("Failed to load events.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    async function handleCreateEvent(e: React.FormEvent) {
        e.preventDefault()

        if (!form.title || !form.eventDate) {
            setMessage("Title and event date are required.")
            return
        }

        try {
            setSubmitting(true)
            setMessage("")

            await api.post("/events", {
                title: form.title,
                description: form.description,
                location: form.location,
                eventDate: form.eventDate,
                targetAudience: form.targetAudience,
            })

            setForm({
                title: "",
                description: "",
                location: "",
                eventDate: "",
                targetAudience: "all",
            })

            setMessage("Event created successfully.")
            await fetchEvents()
        } catch (error) {
            console.error("Failed to create event", error)
            setMessage("Failed to create event.")
        } finally {
            setSubmitting(false)
        }
    }

    async function handleRegister(eventId: string) {
        try {
            setMessage("")
            const res = await api.post(`/events/${eventId}/register`)
            setMessage(res.data.message || "Registered successfully.")
            await fetchEvents()
        } catch (error: any) {
            console.error("Failed to register", error)
            setMessage(error?.response?.data?.message || "Failed to register for event.")
        }
    }

    async function handleCancel(eventId: string) {
        try {
            setMessage("")
            const res = await api.patch(`/events/${eventId}/register/cancel`)
            setMessage(res.data.message || "Registration cancelled.")
            await fetchEvents()
        } catch (error: any) {
            console.error("Failed to cancel registration", error)
            setMessage(error?.response?.data?.message || "Failed to cancel registration.")
        }
    }

    const sortedEvents = useMemo(() => {
        return [...events].sort(
            (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        )
    }, [events])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>

            {message && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                    {message}
                </div>
            )}

            {isAdminOrFaculty && (
                <form
                    onSubmit={handleCreateEvent}
                    className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <h2 className="text-lg font-semibold text-slate-900">Create Event</h2>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Title
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            placeholder="Enter event title"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            rows={3}
                            placeholder="Enter event description"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Location
                        </label>
                        <input
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm({ ...form, location: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                            placeholder="Enter event location"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Event Date
                        </label>
                        <input
                            type="datetime-local"
                            value={form.eventDate}
                            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                            Target Audience
                        </label>
                        <select
                            value={form.targetAudience}
                            onChange={(e) =>
                                setForm({ ...form, targetAudience: e.target.value as AudienceType })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                        >
                            <option value="all">All</option>
                            <option value="student">Students</option>
                            <option value="alumni">Alumni</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {submitting ? "Creating..." : "Create Event"}
                    </button>
                </form>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                        Loading events...
                    </div>
                ) : sortedEvents.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                        No events available yet.
                    </div>
                ) : (
                    sortedEvents.map((event) => {
                        const registrationStatus = event.currentUserRegistration?.status
                        const isRegistered = registrationStatus === "registered"
                        const isCancelled = registrationStatus === "cancelled"
                        const isWaitlisted = registrationStatus === "waitlisted"

                        return (
                            <div
                                key={event.id}
                                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                            >
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-2">
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                {event.title}
                                            </h2>

                                            {event.description && (
                                                <p className="text-sm text-slate-600">{event.description}</p>
                                            )}

                                            <div className="space-y-1 text-sm text-slate-500">
                                                <p>
                                                    <span className="font-medium text-slate-700">Date:</span>{" "}
                                                    {new Date(event.eventDate).toLocaleString()}
                                                </p>

                                                {event.location && (
                                                    <p>
                                                        <span className="font-medium text-slate-700">Location:</span>{" "}
                                                        {event.location}
                                                    </p>
                                                )}

                                                <p>
                                                    <span className="font-medium text-slate-700">Audience:</span>{" "}
                                                    <span className="capitalize">{event.targetAudience}</span>
                                                </p>

                                                <p>
                                                    <span className="font-medium text-slate-700">Registered:</span>{" "}
                                                    {event.registeredCount}
                                                </p>

                                                <p>
                                                    <span className="font-medium text-slate-700">Waitlisted:</span>{" "}
                                                    {event.waitlistedCount}
                                                </p>
                                            </div>

                                            {isStudentOrAlumni && registrationStatus && (
                                                <p className="text-sm">
                                                    <span className="font-medium text-slate-700">Status:</span>{" "}
                                                    <span className="capitalize text-slate-600">
                            {registrationStatus}
                          </span>
                                                </p>
                                            )}
                                        </div>

                                        {isStudentOrAlumni && (
                                            <div className="flex gap-2">
                                                {!isRegistered && !isWaitlisted ? (
                                                    <button
                                                        onClick={() => handleRegister(event.id)}
                                                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                                    >
                                                        {isCancelled ? "Register Again" : "Register"}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleCancel(event.id)}
                                                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                                    >
                                                        Cancel Registration
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {isAdminOrFaculty && event.registrations && event.registrations.length > 0 && (
                                        <div className="rounded-lg border border-slate-200 p-4">
                                            <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                                Registrations
                                            </h3>

                                            <div className="space-y-2">
                                                {event.registrations.map((registration) => (
                                                    <div
                                                        key={registration.id}
                                                        className="rounded-lg border border-slate-100 p-3"
                                                    >
                                                        <div className="text-sm text-slate-600">
                                                            <p>Email: {registration.user?.email || "N/A"}</p>
                                                            <p className="capitalize">Status: {registration.status}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}