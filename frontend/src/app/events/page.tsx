import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
    CalendarDays,
    CalendarRange,
    ChartNoAxesCombined,
    MapPin,
    Pencil,
    Search,
    ShieldCheck,
    Trash2,
    Users,
} from "lucide-react";
import { eventsAPI } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { getUserErrorMessage } from "@/lib/error";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Role = "admin" | "faculty" | "student" | "alumni";
type RSVPStatus = "registered" | "cancelled" | "waitlisted";
type AudienceType = "all" | "student" | "alumni";

type RegistrationItem = {
    id: string;
    userId: string;
    status: RSVPStatus;
    createdAt: string;
    updatedAt: string;
    user?: {
        email?: string;
        role?: Role;
    };
};

type CurrentUserRegistration = {
    id: string;
    userId: string;
    status: RSVPStatus;
} | null;

type EventItem = {
    id: string;
    title: string;
    description?: string | null;
    location?: string | null;
    eventDate: string;
    createdBy: string;
    createdAt: string;
    targetAudience: AudienceType;
    isPast: boolean;
    registeredCount: number;
    waitlistedCount: number;
    currentUserRegistration: CurrentUserRegistration;
    creator?: {
        id: string;
        email: string;
        role: Role;
    };
    stats: {
        registeredCount: number;
        waitlistedCount: number;
        cancelledCount: number;
        totalResponses: number;
    };
    registrations?: RegistrationItem[];
};

type FormState = {
    title: string;
    description: string;
    location: string;
    eventDate: string;
    targetAudience: AudienceType;
};

const initialForm: FormState = {
    title: "",
    description: "",
    location: "",
    eventDate: "",
    targetAudience: "all",
};

const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500";

function toDateTimeLocal(value: string) {
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
}

function formatAudienceLabel(value: AudienceType) {
    if (value === "student") return "Students";
    if (value === "alumni") return "Alumni";
    return "All users";
}

function formatStatusLabel(value?: RSVPStatus | null) {
    if (!value) return null;
    if (value === "registered") return "Registered";
    if (value === "waitlisted") return "Waitlisted";
    return "Cancelled";
}

function KpiTile({
    title,
    value,
    subtitle,
    icon,
}: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700">
                {icon}
                {title}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
    );
}

function ActionChip({
    label,
    active = false,
    onClick,
}: {
    label: string;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors active:scale-95 ${
                active
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
            {label}
        </button>
    );
}

function Pill({ children, blue = false }: { children: ReactNode; blue?: boolean }) {
    return (
        <span
            className={
                blue
                    ? "rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700"
                    : "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600"
            }
        >
            {children}
        </span>
    );
}

export default function EventsPage() {
    const { user } = useAuth();
    const role = user?.role as Role | undefined;

    const isStudentOrAlumni = role === "student" || role === "alumni";
    const isAdminOrFaculty = role === "admin" || role === "faculty";

    const [events, setEvents] = useState<EventItem[]>([]);
    const [form, setForm] = useState<FormState>(initialForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [busyEventId, setBusyEventId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [search, setSearch] = useState("");
    const [timeframe, setTimeframe] = useState<"all" | "upcoming" | "past">("all");
    const [audienceFilter, setAudienceFilter] = useState<"all" | AudienceType>("all");
    const [eventIdToDelete, setEventIdToDelete] = useState<string | null>(null);

    function applyRegistrationStatusLocal(eventId: string, nextStatus: RSVPStatus, registrationId?: string) {
        setEvents((prev) =>
            prev.map((event) => {
                if (event.id !== eventId) return event;

                const currentStatus = event.currentUserRegistration?.status ?? null;
                if (currentStatus === nextStatus) return event;

                const registeredCount = Math.max(
                    0,
                    event.stats.registeredCount +
                        (currentStatus === "registered" ? -1 : 0) +
                        (nextStatus === "registered" ? 1 : 0)
                );
                const waitlistedCount = Math.max(
                    0,
                    event.stats.waitlistedCount +
                        (currentStatus === "waitlisted" ? -1 : 0) +
                        (nextStatus === "waitlisted" ? 1 : 0)
                );
                const cancelledCount = Math.max(
                    0,
                    event.stats.cancelledCount +
                        (currentStatus === "cancelled" ? -1 : 0) +
                        (nextStatus === "cancelled" ? 1 : 0)
                );

                return {
                    ...event,
                    registeredCount,
                    waitlistedCount,
                    currentUserRegistration: event.currentUserRegistration
                        ? { ...event.currentUserRegistration, status: nextStatus }
                        : {
                              id: registrationId || `${eventId}-local-registration`,
                              userId: user?.id || "",
                              status: nextStatus,
                          },
                    stats: {
                        ...event.stats,
                        registeredCount,
                        waitlistedCount,
                        cancelledCount,
                    },
                };
            })
        );
    }

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};

            if (search.trim()) params.search = search.trim();
            if (timeframe !== "all") params.timeframe = timeframe;
            if (isAdminOrFaculty && audienceFilter !== "all") params.audience = audienceFilter;

            const response = await eventsAPI.list(params);
            setEvents(response.events || []);
        } catch (error: any) {
            console.error("Failed to load events", error);
            setMessage({
                type: "error",
                text: getUserErrorMessage(error, "Failed to load events."),
            });
        } finally {
            setLoading(false);
        }
    }, [audienceFilter, isAdminOrFaculty, search, timeframe]);

    useEffect(() => {
        void fetchEvents();
    }, [fetchEvents]);

    function resetForm() {
        setForm(initialForm);
        setEditingId(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.title.trim() || !form.eventDate) {
            setMessage({ type: "error", text: "Title and event date are required." });
            return;
        }

        try {
            setSaving(true);
            setMessage(null);

            const payload = {
                title: form.title.trim(),
                description: form.description.trim(),
                location: form.location.trim(),
                eventDate: new Date(form.eventDate).toISOString(),
                targetAudience: form.targetAudience,
            };

            if (editingId) {
                const response = await eventsAPI.update(editingId, payload);
                setMessage({ type: "success", text: response.message || "Event updated successfully." });
            } else {
                const response = await eventsAPI.create(payload);
                setMessage({ type: "success", text: response.message || "Event created successfully." });
            }

            resetForm();
            await fetchEvents();
        } catch (error: any) {
            console.error("Failed to save event", error);
            setMessage({
                type: "error",
                text: getUserErrorMessage(error, "Failed to save event."),
            });
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(event: EventItem) {
        setEditingId(event.id);
        setForm({
            title: event.title,
            description: event.description || "",
            location: event.location || "",
            eventDate: toDateTimeLocal(event.eventDate),
            targetAudience: event.targetAudience,
        });
        setMessage(null);
    }

    async function confirmDeleteEvent() {
        if (!eventIdToDelete) return;
        try {
            setBusyEventId(eventIdToDelete);
            const response = await eventsAPI.remove(eventIdToDelete);
            setMessage({ type: "success", text: response.message || "Event deleted successfully." });
            if (editingId === eventIdToDelete) resetForm();
            await fetchEvents();
        } catch (error: any) {
            console.error("Failed to delete event", error);
            setMessage({
                type: "error",
                text: getUserErrorMessage(error, "Failed to delete event."),
            });
        } finally {
            setEventIdToDelete(null);
            setBusyEventId(null);
        }
    }

    async function handleRegister(eventId: string) {
        try {
            setBusyEventId(eventId);
            const response = await eventsAPI.register(eventId);
            setMessage({ type: "success", text: response.message || "Registered successfully." });
            applyRegistrationStatusLocal(
                eventId,
                response?.registration?.status || "registered",
                response?.registration?.id
            );
            void fetchEvents();
        } catch (error: any) {
            console.error("Failed to register", error);
            setMessage({
                type: "error",
                text: getUserErrorMessage(error, "Failed to register for event."),
            });
        } finally {
            setBusyEventId(null);
        }
    }

    async function handleCancel(eventId: string) {
        try {
            setBusyEventId(eventId);
            const response = await eventsAPI.cancelRegistration(eventId);
            setMessage({ type: "success", text: response.message || "Registration cancelled." });
            applyRegistrationStatusLocal(
                eventId,
                response?.registration?.status || "cancelled",
                response?.registration?.id
            );
            void fetchEvents();
        } catch (error: any) {
            console.error("Failed to cancel registration", error);
            setMessage({
                type: "error",
                text: getUserErrorMessage(error, "Failed to cancel registration."),
            });
        } finally {
            setBusyEventId(null);
        }
    }

    const upcomingEvents = useMemo(() => events.filter((event) => !event.isPast), [events]);
    const pastEvents = useMemo(() => [...events.filter((event) => event.isPast)].reverse(), [events]);
    const totalRegistrations = useMemo(
        () => events.reduce((sum, event) => sum + event.stats.registeredCount, 0),
        [events]
    );

    const todayLabel = new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    function renderEventCard(event: EventItem) {
        const registrationStatus = event.currentUserRegistration?.status;
        const isRegistered = registrationStatus === "registered";
        const isWaitlisted = registrationStatus === "waitlisted";
        const isCancelled = registrationStatus === "cancelled";
        const isBusy = busyEventId === event.id;

        return (
            <article key={event.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Pill blue>{formatAudienceLabel(event.targetAudience)}</Pill>
                            <Pill>{event.isPast ? "Past" : "Upcoming"}</Pill>
                            {registrationStatus ? <Pill>{formatStatusLabel(registrationStatus)}</Pill> : null}
                        </div>
                        <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-900 md:text-lg">{event.title}</h3>
                        {event.description ? (
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{event.description}</p>
                        ) : null}
                        <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <CalendarDays size={15} className="text-slate-500" />
                                <span>{new Date(event.eventDate).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <MapPin size={15} className="text-slate-500" />
                                <span>{event.location || "Location to be confirmed"}</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <Users size={15} className="text-slate-500" />
                                <span>{event.stats.registeredCount} registered</span>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
                                {event.stats.totalResponses} total responses
                            </div>
                        </div>
                        {isAdminOrFaculty && event.creator ? (
                            <p className="mt-3 text-xs text-slate-500">
                                Created by {event.creator.email} ({event.creator.role}) on {new Date(event.createdAt).toLocaleDateString()}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[180px]">
                        {isStudentOrAlumni ? (
                            <>
                                {!event.isPast && !isRegistered && !isWaitlisted ? (
                                    <button type="button" onClick={() => handleRegister(event.id)} disabled={isBusy} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
                                        {isBusy ? "Updating..." : isCancelled ? "Register Again" : "Register"}
                                    </button>
                                ) : null}
                                {!event.isPast && (isRegistered || isWaitlisted) ? (
                                    <button type="button" onClick={() => handleCancel(event.id)} disabled={isBusy} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                                        {isBusy ? "Updating..." : "Cancel Registration"}
                                    </button>
                                ) : null}
                                {event.isPast ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">This event has already taken place.</div>
                                ) : null}
                            </>
                        ) : (
                            <>
                                <button type="button" onClick={() => handleEdit(event)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                    <Pencil size={15} />
                                    Edit
                                </button>
                                                <button type="button" onClick={() => setEventIdToDelete(event.id)} disabled={isBusy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60">
                                    <Trash2 size={15} />
                                    {isBusy ? "Deleting..." : "Delete"}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {isAdminOrFaculty && event.registrations && event.registrations.length > 0 ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-sm font-semibold text-slate-800">Registrations</h4>
                            <p className="text-xs text-slate-500">{event.stats.registeredCount} registered, {event.stats.cancelledCount} cancelled</p>
                        </div>
                        <div className="mt-3 grid gap-2">
                            {event.registrations.map((registration) => (
                                <div key={registration.id} className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                                    <span className="font-medium text-slate-700">{registration.user?.email || "Unknown user"}</span>
                                    <span className="capitalize text-slate-500">{registration.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </article>
        );
    }

    return (
        <div className="max-w-7xl space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                            <ShieldCheck size={12} className="text-blue-600" />
                            {isAdminOrFaculty ? "Operations Workspace" : "Member Workspace"}
                        </div>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                            {isStudentOrAlumni ? "Events" : "Events Management"}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            {isStudentOrAlumni
                                ? "Review upcoming events, confirm attendance, and track opportunities relevant to your activity."
                                : "Manage event publishing, audience targeting, and participation visibility from one operational workspace."}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">Updated {todayLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <ActionChip label={`${events.length} total`} active onClick={() => {}} />
                        <ActionChip label={`${upcomingEvents.length} upcoming`} onClick={() => {}} />
                        <ActionChip label={`${pastEvents.length} archive`} onClick={() => {}} />
                    </div>
                </div>

                {isAdminOrFaculty ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                        <ActionChip label="All Audiences" active={audienceFilter === "all"} onClick={() => setAudienceFilter("all")} />
                        <ActionChip label="Students" active={audienceFilter === "student"} onClick={() => setAudienceFilter("student")} />
                        <ActionChip label="Alumni" active={audienceFilter === "alumni"} onClick={() => setAudienceFilter("alumni")} />
                    </div>
                ) : null}
            </div>

            {message && (
                <div className={`rounded-lg border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiTile title="Upcoming Events" value={upcomingEvents.length} subtitle="Visible in the active event feed" icon={<ChartNoAxesCombined size={12} />} />
                <KpiTile title="Archive" value={pastEvents.length} subtitle="Past events retained for reference" icon={<CalendarRange size={12} />} />
                <KpiTile title="Registrations" value={totalRegistrations} subtitle="Registered participation across listed events" icon={<Users size={12} />} />
                <KpiTile
                    title={isStudentOrAlumni ? "Visible to You" : "Audience Scope"}
                    value={isStudentOrAlumni ? events.length : audienceFilter === "all" ? "All" : formatAudienceLabel(audienceFilter)}
                    subtitle={isStudentOrAlumni ? "Events currently available for your account" : "Current management scope"}
                    icon={<ShieldCheck size={12} />}
                />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800">Filter and Search</h2>
                <p className="mt-1 text-xs text-slate-500">Narrow event visibility by title, timing, location, or audience scope.</p>
                <div className={`mt-5 grid gap-4 ${isAdminOrFaculty ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_180px_180px]" : "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px]"}`}>
                    <label className="relative">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events by title, description, or location" className={`${inputClass} pl-9`} />
                    </label>
                    <select value={timeframe} onChange={(e) => setTimeframe(e.target.value as "all" | "upcoming" | "past")} className={inputClass}>
                        <option value="all">All timeframes</option>
                        <option value="upcoming">Upcoming only</option>
                        <option value="past">Past only</option>
                    </select>
                    {isAdminOrFaculty ? (
                        <select value={audienceFilter} onChange={(e) => setAudienceFilter(e.target.value as "all" | AudienceType)} className={inputClass}>
                            <option value="all">All audiences</option>
                            <option value="student">Students</option>
                            <option value="alumni">Alumni</option>
                        </select>
                    ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">Events are already filtered to your role.</div>
                    )}
                </div>
            </div>

            {isAdminOrFaculty && !editingId ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-800">Create Event</h2>
                    <p className="mt-1 text-xs text-slate-500">Publish event details with clear audience scope, schedule, and participation context.</p>
                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="lg:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                                <input type="text" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Alumni networking evening" className={inputClass} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Date and time</label>
                                <input type="datetime-local" value={form.eventDate} onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))} className={inputClass} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Audience</label>
                                <select value={form.targetAudience} onChange={(e) => setForm((prev) => ({ ...prev, targetAudience: e.target.value as AudienceType }))} className={inputClass}>
                                    <option value="all">All users</option>
                                    <option value="student">Students only</option>
                                    <option value="alumni">Alumni only</option>
                                </select>
                            </div>
                            <div className="lg:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
                                <input type="text" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Innovation Hall or online meeting link" className={inputClass} />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                                <textarea rows={4} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Outline the purpose, key speakers, or expected attendees." className={inputClass} />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60">
                                <CalendarDays size={15} />
                                {saving ? "Creating..." : "Create Event"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            <section className="space-y-6">
                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">No events matched the current filters.</div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">Upcoming events</h2>
                                    <p className="text-sm text-slate-500">Active opportunities and scheduled sessions.</p>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{upcomingEvents.length}</span>
                            </div>
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map(renderEventCard)
                            ) : (
                                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">There are no upcoming events in this view.</div>
                            )}
                        </div>
                        {pastEvents.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">Past events</h2>
                                        <p className="text-sm text-slate-500">Archived for context and record-keeping.</p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{pastEvents.length}</span>
                                </div>
                                {pastEvents.map(renderEventCard)}
                            </div>
                        ) : null}
                    </>
                )}
            </section>

            <ConfirmDialog
                open={Boolean(eventIdToDelete)}
                title="Delete Event"
                message="Delete this event? Existing registrations will also be removed."
                confirmLabel="Delete Event"
                tone="danger"
                loading={Boolean(eventIdToDelete && busyEventId === eventIdToDelete)}
                onCancel={() => setEventIdToDelete(null)}
                onConfirm={confirmDeleteEvent}
            />

            {isAdminOrFaculty && editingId ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
                    <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Edit Event</h2>
                                <p className="mt-1 text-sm text-slate-500">Update event details without scrolling away from your current list.</p>
                            </div>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="lg:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                                    <input type="text" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Alumni networking evening" className={inputClass} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Date and time</label>
                                    <input type="datetime-local" value={form.eventDate} onChange={(e) => setForm((prev) => ({ ...prev, eventDate: e.target.value }))} className={inputClass} />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Audience</label>
                                    <select value={form.targetAudience} onChange={(e) => setForm((prev) => ({ ...prev, targetAudience: e.target.value as AudienceType }))} className={inputClass}>
                                        <option value="all">All users</option>
                                        <option value="student">Students only</option>
                                        <option value="alumni">Alumni only</option>
                                    </select>
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
                                    <input type="text" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Innovation Hall or online meeting link" className={inputClass} />
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                                    <textarea rows={4} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Outline the purpose, key speakers, or expected attendees." className={inputClass} />
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60">
                                    <CalendarDays size={15} />
                                    {saving ? "Updating..." : "Save Changes"}
                                </button>
                                <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
