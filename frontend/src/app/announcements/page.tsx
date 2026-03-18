import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

type Role = "admin" | "faculty" | "alumni" | "student";

type Announcement = {
    id: string;
    title: string;
    content: string;
    targetRole?: Role | null;
    targetProgram?: string | null;
    targetGradYear?: number | null;
    createdAt: string;
    updatedAt: string;
    creator: {
        id: string;
        email: string;
        role: Role;
    };
};

type FormState = {
    title: string;
    content: string;
    targetRole: "" | Role;
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

export default function AnnouncementsPage() {
    const { user } = useAuth();
    const role = user?.role as Role | undefined;

    const canManage = role === "admin" || role === "faculty";

    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [form, setForm] = useState<FormState>(initialForm);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function fetchAnnouncements() {
        try {
            setLoading(true);
            setError("");

            const res = await api.get("/announcements");
            setAnnouncements(res.data);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to load announcements");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const pageTitle = useMemo(() => {
        return "Announcements";
    }, []);

    const pageSubtitle = useMemo(() => {
        return canManage
            ? "Create, edit, and delete announcements for specific users by role, program, or graduation year."
            : "View announcements relevant to your role, program, and graduation year.";
    }, [canManage]);

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    function resetForm() {
        setForm(initialForm);
        setEditingId(null);
        setError("");
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                title: form.title.trim(),
                content: form.content.trim(),
                targetRole: form.targetRole || null,
                targetProgram: form.targetProgram.trim() || null,
                targetGradYear: form.targetGradYear ? Number(form.targetGradYear) : null,
            };

            if (editingId) {
                await api.put(`/announcements/${editingId}`, payload);
                await fetchAnnouncements();
                resetForm();
                setSuccess("Announcement updated successfully.");
            } else {
                await api.post("/announcements", payload);
                await fetchAnnouncements();
                resetForm();
                setSuccess("Announcement created successfully.");
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to save announcement");
        } finally {
            setSaving(false);
        }
    }

    function handleEdit(item: Announcement) {
        setEditingId(item.id);
        setForm({
            title: item.title || "",
            content: item.content || "",
            targetRole: item.targetRole || "",
            targetProgram: item.targetProgram || "",
            targetGradYear: item.targetGradYear ? String(item.targetGradYear) : "",
        });
        setError("");
        setSuccess("");
    }

    function handleDelete(id: string) {
        setDeleteId(id);
        setShowDeleteModal(true);
    }

    async function confirmDelete() {
        if (!deleteId) return;

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await api.delete(`/announcements/${deleteId}`);
            await fetchAnnouncements();
            setSuccess("Announcement deleted successfully.");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to delete announcement");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setDeleteId(null);
        }
    }

    function closeDeleteModal() {
        if (deleting) return;
        setShowDeleteModal(false);
        setDeleteId(null);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {pageTitle}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{pageSubtitle}</p>
            </div>

            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            ) : null}

            {success ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {success}
                </div>
            ) : null}

            {canManage ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {editingId ? "Edit Announcement" : "Create Announcement"}
                    </h2>

                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                placeholder="Enter announcement title"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">
                                Content
                            </label>
                            <textarea
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                placeholder="Write announcement content"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Target Role
                                </label>
                                <select
                                    name="targetRole"
                                    value={form.targetRole}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                >
                                    <option value="">All Roles</option>
                                    <option value="student">Student</option>
                                    <option value="alumni">Alumni</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Target Program
                                </label>
                                <input
                                    type="text"
                                    name="targetProgram"
                                    value={form.targetProgram}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                    placeholder="All Programs"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">
                                    Target Graduation Year
                                </label>
                                <input
                                    type="number"
                                    name="targetGradYear"
                                    value={form.targetGradYear}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                                    placeholder="All Years"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                            >
                                {saving
                                    ? editingId
                                        ? "Updating..."
                                        : "Creating..."
                                    : editingId
                                        ? "Update Announcement"
                                        : "Create Announcement"}
                            </button>

                            {editingId ? (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                            ) : null}
                        </div>
                    </form>
                </div>
            ) : null}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                    {canManage ? "All Announcements" : "Relevant Announcements"}
                </h2>

                {loading ? (
                    <p className="mt-4 text-sm text-slate-500">Loading announcements...</p>
                ) : announcements.length === 0 ? (
                    <p className="mt-4 text-sm text-slate-500">No announcements found.</p>
                ) : (
                    <div className="mt-4 space-y-4">
                        {announcements.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-xl border border-slate-200 p-4"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-2">
                                        <h3 className="text-base font-semibold text-slate-900">
                                            {item.title}
                                        </h3>

                                        <p className="whitespace-pre-wrap text-sm text-slate-600">
                                            {item.content}
                                        </p>

                                        <div className="flex flex-wrap gap-2 pt-1">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        Role: {item.targetRole || "All"}
                      </span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        Program: {item.targetProgram || "All"}
                      </span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                        Grad Year: {item.targetGradYear || "All"}
                      </span>
                                        </div>

                                        <p className="text-xs text-slate-500">
                                            Created by {item.creator.email} ({item.creator.role}) •{" "}
                                            {new Date(item.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {canManage ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showDeleteModal ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Delete Announcement
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                            Are you sure you want to delete this announcement? This action
                            cannot be undone.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}