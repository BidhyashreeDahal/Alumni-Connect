import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
    BellRing,
    ChartNoAxesCombined,
    Filter,
    Megaphone,
    Pencil,
    Search,
    Trash2,
    UserSquare2,
    Users,
} from "lucide-react";
import { announcementsAPI } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { getUserErrorMessage } from "@/lib/error";

type Role = "admin" | "faculty" | "alumni" | "student";

type Announcement = {
    id: string;
    title: string;
    content: string;
    targetRole?: Role | null;
    targetProgram?: string | null;
    targetGradYear?: number | null;
    audienceSummary: string;
    createdByMe: boolean;
    createdAt: string;
    updatedAt: string;
    creatorId: string;
    creator: {
        id: string;
        email: string;
        role: Role;
    };
};

type FormState = {
    title: string;
    content: string;
    targetRole: "" | "student" | "alumni";
    targetProgram: string;
    targetGradYear: string;
};

const initialForm: FormState = {
    title: "",
    content: "",
    targetRole: "",
    targetProgram: "",
    targetGradYear: "",
};

const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500";

function roleLabel(value?: string | null) {
    if (!value) return "All users";
    return value === "student" ? "Students" : value === "alumni" ? "Alumni" : value;
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

function AudiencePill({ children, blue = false }: { children: ReactNode; blue?: boolean }) {
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

export default function AnnouncementsPage() {
    const { user } = useAuth();
    const role = user?.role as Role | undefined;
    const canManage = role === "admin" || role === "faculty";

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [form, setForm] = useState<FormState>(initialForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [search, setSearch] = useState("");
    const [targetRoleFilter, setTargetRoleFilter] = useState<"all" | "student" | "alumni">("all");
    const [mineOnly, setMineOnly] = useState(false);

    const fetchAnnouncements = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (search.trim()) params.search = search.trim();
            if (canManage && targetRoleFilter !== "all") params.targetRole = targetRoleFilter;
            if (canManage && mineOnly) params.mine = "true";

            const response = await announcementsAPI.list(params);
            setAnnouncements(response.announcements || []);
        } catch (error: any) {
            console.error("Failed to load announcements", error);
            setFeedback({
                type: "error",
                text: getUserErrorMessage(error, "Failed to load announcements."),
            });
        } finally {
            setLoading(false);
        }
    }, [canManage, mineOnly, search, targetRoleFilter]);

    useEffect(() => {
        void fetchAnnouncements();
    }, [fetchAnnouncements]);

    function resetForm() {
        setForm(initialForm);
        setEditingId(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.title.trim() || !form.content.trim()) {
            setFeedback({ type: "error", text: "Title and content are required." });
            return;
        }

        const payload = {
            title: form.title.trim(),
            content: form.content.trim(),
            targetRole: form.targetRole || null,
            targetProgram: form.targetProgram.trim() || null,
            targetGradYear: form.targetGradYear ? Number(form.targetGradYear) : null,
        };

        try {
            setSaving(true);
            setFeedback(null);

            if (editingId) {
                const response = await announcementsAPI.update(editingId, payload);
                setFeedback({ type: "success", text: response.message || "Announcement updated successfully." });
            } else {
                const response = await announcementsAPI.create(payload);
                setFeedback({ type: "success", text: response.message || "Announcement created successfully." });
            }

            resetForm();
            await fetchAnnouncements();
        } catch (error: any) {
            console.error("Failed to save announcement", error);
            setFeedback({
                type: "error",
                text: getUserErrorMessage(error, "Failed to save announcement."),
            });
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(item: Announcement) {
        setEditingId(item.id);
        setForm({
            title: item.title,
            content: item.content,
            targetRole: (item.targetRole as "" | "student" | "alumni") || "",
            targetProgram: item.targetProgram || "",
            targetGradYear: item.targetGradYear ? String(item.targetGradYear) : "",
        });
        setFeedback(null);
    }

    async function handleDelete(id: string) {
        const confirmed = window.confirm("Delete this announcement? This action cannot be undone.");
        if (!confirmed) return;

        try {
            setBusyId(id);
            const response = await announcementsAPI.remove(id);
            setFeedback({ type: "success", text: response.message || "Announcement deleted successfully." });
            if (editingId === id) resetForm();
            await fetchAnnouncements();
        } catch (error: any) {
            console.error("Failed to delete announcement", error);
            setFeedback({
                type: "error",
                text: getUserErrorMessage(error, "Failed to delete announcement."),
            });
        } finally {
            setBusyId(null);
        }
    }

    const generalCount = useMemo(
        () => announcements.filter((item) => !item.targetRole && !item.targetProgram && !item.targetGradYear).length,
        [announcements]
    );
    const targetedCount = announcements.length - generalCount;
    const authoredCount = useMemo(
        () => announcements.filter((item) => item.createdByMe).length,
        [announcements]
    );

    const todayLabel = new Date().toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div className="max-w-7xl space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                            <BellRing size={12} className="text-blue-600" />
                            {canManage ? "Admin Workspace" : "Member Workspace"}
                        </div>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                            Announcements
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-600">
                            {canManage
                                ? "Manage institutional updates, audience targeting, and published communication from one operational view."
                                : "Review platform communication relevant to your role, academic context, and current activity."}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">Updated {todayLabel}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <ActionChip label={`${announcements.length} total`} onClick={() => {}} active />
                        <ActionChip label={`${generalCount} general`} onClick={() => {}} />
                        <ActionChip label={`${targetedCount} targeted`} onClick={() => {}} />
                    </div>
                </div>

                {canManage ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                        <ActionChip label="All Roles" active={targetRoleFilter === "all"} onClick={() => setTargetRoleFilter("all")} />
                        <ActionChip label="Students" active={targetRoleFilter === "student"} onClick={() => setTargetRoleFilter("student")} />
                        <ActionChip label="Alumni" active={targetRoleFilter === "alumni"} onClick={() => setTargetRoleFilter("alumni")} />
                        <ActionChip label={mineOnly ? "Showing My Posts" : "Show Only Mine"} active={mineOnly} onClick={() => setMineOnly((prev) => !prev)} />
                    </div>
                ) : null}
            </div>

            {feedback && (
                <div
                    className={`rounded-lg border px-4 py-3 text-sm ${
                        feedback.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                    }`}
                >
                    {feedback.text}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiTile title="Total Notices" value={announcements.length} subtitle="Published and visible in the current view" icon={<ChartNoAxesCombined size={12} />} />
                <KpiTile title="General" value={generalCount} subtitle="Visible broadly across the platform" icon={<Users size={12} />} />
                <KpiTile title="Targeted" value={targetedCount} subtitle="Filtered by role, program, or year" icon={<Filter size={12} />} />
                <KpiTile title={canManage ? "Created By You" : "Feed Status"} value={canManage ? authoredCount : "Matched"} subtitle={canManage ? "Authored notices in this view" : "Aligned to your profile context"} icon={<UserSquare2 size={12} />} />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800">Filter and Search</h2>
                <p className="mt-1 text-xs text-slate-500">
                    Narrow announcement visibility by search terms or audience scope.
                </p>
                <div className={`mt-5 grid gap-4 ${canManage ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_180px_180px]" : "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px]"}`}>
                    <label className="relative">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search titles, message text, or audience details"
                            className={`${inputClass} pl-9`}
                        />
                    </label>
                    {canManage ? (
                        <>
                            <select value={targetRoleFilter} onChange={(e) => setTargetRoleFilter(e.target.value as "all" | "student" | "alumni")} className={inputClass}>
                                <option value="all">All roles</option>
                                <option value="student">Students</option>
                                <option value="alumni">Alumni</option>
                            </select>
                            <button type="button" onClick={() => setMineOnly((prev) => !prev)} className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${mineOnly ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                                {mineOnly ? "Showing my posts" : "Show only mine"}
                            </button>
                        </>
                    ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                            Audience filtering is already applied for your account.
                        </div>
                    )}
                </div>
            </div>

            {canManage ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-800">
                        {editingId ? "Update Announcement" : "Create Announcement"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Publish concise, institutional communication with explicit audience targeting where needed.
                    </p>
                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="lg:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
                                <input type="text" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Career fair registration now open" className={inputClass} />
                            </div>
                            <div className="lg:col-span-2">
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Message</label>
                                <textarea rows={5} value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} placeholder="Write the announcement in a clear, professional tone." className={inputClass} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Target role</label>
                                <select value={form.targetRole} onChange={(e) => setForm((prev) => ({ ...prev, targetRole: e.target.value as FormState["targetRole"] }))} className={inputClass}>
                                    <option value="">All users</option>
                                    <option value="student">Students</option>
                                    <option value="alumni">Alumni</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Target program</label>
                                <input type="text" value={form.targetProgram} onChange={(e) => setForm((prev) => ({ ...prev, targetProgram: e.target.value }))} placeholder="Leave blank for all programs" className={inputClass} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Graduation year</label>
                                <input type="number" value={form.targetGradYear} onChange={(e) => setForm((prev) => ({ ...prev, targetGradYear: e.target.value }))} placeholder="Leave blank for all years" className={inputClass} />
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60">
                                <Megaphone size={15} />
                                {saving ? (editingId ? "Updating..." : "Publishing...") : editingId ? "Update Announcement" : "Publish Announcement"}
                            </button>
                            {editingId ? (
                                <button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                    Cancel editing
                                </button>
                            ) : null}
                        </div>
                    </form>
                </div>
            ) : null}

            <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">{canManage ? "Announcement Feed" : "Relevant Announcements"}</h2>
                        <p className="text-sm text-slate-500">Latest published updates with audience context and publication details.</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{announcements.length}</span>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading announcements...</div>
                ) : announcements.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">No announcements matched the current view.</div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((item) => {
                            const isBusy = busyId === item.id;
                            const wasUpdated = item.updatedAt !== item.createdAt;

                            return (
                                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <AudiencePill blue>{item.audienceSummary}</AudiencePill>
                                                <AudiencePill>{roleLabel(item.targetRole)}</AudiencePill>
                                                {item.createdByMe ? <AudiencePill>Created by you</AudiencePill> : null}
                                            </div>
                                            <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-900 md:text-lg">{item.title}</h3>
                                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.content}</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <AudiencePill>Program: {item.targetProgram || "All programs"}</AudiencePill>
                                                <AudiencePill>Year: {item.targetGradYear ? `Class of ${item.targetGradYear}` : "All years"}</AudiencePill>
                                            </div>
                                            <p className="mt-3 text-xs text-slate-500">
                                                Shared by {item.creator.email} ({item.creator.role}) on {new Date(item.createdAt).toLocaleString()}
                                                {wasUpdated ? ` • Updated ${new Date(item.updatedAt).toLocaleString()}` : ""}
                                            </p>
                                        </div>
                                        {canManage ? (
                                            <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[160px]">
                                                <button type="button" onClick={() => handleEdit(item)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                                    <Pencil size={15} />
                                                    Edit
                                                </button>
                                                <button type="button" onClick={() => handleDelete(item.id)} disabled={isBusy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60">
                                                    <Trash2 size={15} />
                                                    {isBusy ? "Deleting..." : "Delete"}
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
