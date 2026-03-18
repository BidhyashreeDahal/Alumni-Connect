import { prisma } from "../db/prisma.js";

/**
 * Get current user's program and graduation year
 */
async function getCurrentUserProfile(user) {
    if (!user) return { program: null, graduationYear: null };

    if (user.role === "student") {
        const student = await prisma.studentProfile.findUnique({
            where: { userId: user.id },
            select: { program: true, graduationYear: true },
        });

        return {
            program: student?.program ?? null,
            graduationYear: student?.graduationYear ?? null,
        };
    }

    if (user.role === "alumni") {
        const alumni = await prisma.alumniProfile.findUnique({
            where: { userId: user.id },
            select: { program: true, graduationYear: true },
        });

        return {
            program: alumni?.program ?? null,
            graduationYear: alumni?.graduationYear ?? null,
        };
    }

    return { program: null, graduationYear: null };
}

/**
 * GET /announcements
 * Admin/faculty -> can see all announcements
 * Student/alumni -> only relevant announcements
 */
export async function listAnnouncements(req, res) {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isManager = user.role === "admin" || user.role === "faculty";

        if (isManager) {
            const announcements = await prisma.announcement.findMany({
                orderBy: { createdAt: "desc" },
                include: {
                    creator: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                        },
                    },
                },
            });

            return res.json(announcements);
        }

        const profile = await getCurrentUserProfile(user);

        const announcements = await prisma.announcement.findMany({
            where: {
                AND: [
                    {
                        OR: [
                            { targetRole: null },
                            { targetRole: user.role },
                        ],
                    },
                    {
                        OR: [
                            { targetProgram: null },
                            { targetProgram: profile.program ?? undefined },
                        ],
                    },
                    {
                        OR: [
                            { targetGradYear: null },
                            { targetGradYear: profile.graduationYear ?? undefined },
                        ],
                    },
                ],
            },
            orderBy: { createdAt: "desc" },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        return res.json(announcements);
    } catch (error) {
        console.error("listAnnouncements error:", error);
        return res.status(500).json({ message: "Failed to fetch announcements" });
    }
}

/**
 * POST /announcements
 * Admin/faculty only
 */
export async function createAnnouncement(req, res) {
    try {
        const user = req.user;

        if (!user || (user.role !== "admin" && user.role !== "faculty")) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { title, content, targetRole, targetProgram, targetGradYear } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                creatorId: user.id,
                targetRole: targetRole || null,
                targetProgram: targetProgram?.trim() || null,
                targetGradYear:
                    targetGradYear !== undefined &&
                    targetGradYear !== null &&
                    targetGradYear !== ""
                        ? Number(targetGradYear)
                        : null,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        return res.status(201).json(announcement);
    } catch (error) {
        console.error("createAnnouncement error:", error);
        return res.status(500).json({ message: "Failed to create announcement" });
    }
}

/**
 * PUT /announcements/:id
 * Admin/faculty only
 */
export async function updateAnnouncement(req, res) {
    try {
        const user = req.user;

        if (!user || (user.role !== "admin" && user.role !== "faculty")) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { id } = req.params;
        const { title, content, targetRole, targetProgram, targetGradYear } = req.body;

        const existing = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        if (!title?.trim() || !content?.trim()) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const updated = await prisma.announcement.update({
            where: { id },
            data: {
                title: title.trim(),
                content: content.trim(),
                targetRole: targetRole || null,
                targetProgram: targetProgram?.trim() || null,
                targetGradYear:
                    targetGradYear !== undefined &&
                    targetGradYear !== null &&
                    targetGradYear !== ""
                        ? Number(targetGradYear)
                        : null,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                    },
                },
            },
        });

        return res.json(updated);
    } catch (error) {
        console.error("updateAnnouncement error:", error);
        return res.status(500).json({ message: "Failed to update announcement" });
    }
}

/**
 * DELETE /announcements/:id
 * Admin/faculty only
 */
export async function deleteAnnouncement(req, res) {
    try {
        const user = req.user;

        if (!user || (user.role !== "admin" && user.role !== "faculty")) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { id } = req.params;

        const existing = await prisma.announcement.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        await prisma.announcement.delete({
            where: { id },
        });

        return res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
        console.error("deleteAnnouncement error:", error);
        return res.status(500).json({ message: "Failed to delete announcement" });
    }
}