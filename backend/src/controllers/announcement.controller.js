import { prisma } from "../db/prisma.js";
import { recordAuditLog } from "../services/auditLog.service.js";

const MANAGER_ROLE_FILTERS = ["all", "student", "alumni"];

async function auditLogSafely(req, payload, failureMessage) {
    try {
        await recordAuditLog(req, payload);
    } catch (error) {
        req.log?.error({ err: error }, failureMessage);
    }
}

function getAnnouncementDelegate() {
    if (!prisma.announcement) {
        throw new Error("Prisma client is missing the announcement model. Run prisma generate.");
    }

    return prisma.announcement;
}

function sanitizeText(value) {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
}

function parseTargetGradYear(value) {
    if (value === undefined || value === null || value === "") return null;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > 2500) return null;
    return parsed;
}

function formatAudienceSummary({ targetRole, targetProgram, targetGradYear }) {
    const parts = [];
    if (targetRole) parts.push(targetRole === "student" ? "Students" : "Alumni");
    if (targetProgram) parts.push(targetProgram);
    if (targetGradYear) parts.push(`Class of ${targetGradYear}`);
    return parts.length > 0 ? parts.join(" • ") : "General announcement";
}

function serializeAnnouncement(announcement, userId) {
    return {
        ...announcement,
        audienceSummary: formatAudienceSummary(announcement),
        createdByMe: announcement.creatorId === userId,
    };
}

function normalizeTargetRole(value) {
    if (value === undefined || value === null || value === "" || value === "all") return null;
    return value;
}

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
        const announcementModel = getAnnouncementDelegate();
        const user = req.user;
        const search = sanitizeText(req.query.search);
        const targetRoleFilter =
            typeof req.query.targetRole === "string" && MANAGER_ROLE_FILTERS.includes(req.query.targetRole)
                ? req.query.targetRole
                : null;
        const mineOnly =
            req.query.mine === "true" && (user?.role === "admin" || user?.role === "faculty");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const isManager = user.role === "admin" || user.role === "faculty";

        if (isManager) {
            const where = {};

            if (targetRoleFilter && targetRoleFilter !== "all") {
                where.targetRole = targetRoleFilter;
            }

            if (search) {
                where.OR = [
                    { title: { contains: search, mode: "insensitive" } },
                    { content: { contains: search, mode: "insensitive" } },
                    { targetProgram: { contains: search, mode: "insensitive" } },
                ];
            }

            if (mineOnly) {
                where.creatorId = user.id;
            }

            const announcements = await announcementModel.findMany({
                where,
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

            return res.json({
                announcements: announcements.map((announcement) =>
                    serializeAnnouncement(announcement, user.id)
                ),
                meta: {
                    total: announcements.length,
                },
            });
        }

        const profile = await getCurrentUserProfile(user);

        const whereAnd = [
            {
                OR: [
                    { targetRole: null },
                    { targetRole: user.role },
                ],
            },
            profile.program
                ? {
                    OR: [
                        { targetProgram: null },
                        { targetProgram: profile.program },
                    ],
                }
                : { targetProgram: null },
            profile.graduationYear !== null && profile.graduationYear !== undefined
                ? {
                    OR: [
                        { targetGradYear: null },
                        { targetGradYear: profile.graduationYear },
                    ],
                }
                : { targetGradYear: null },
        ];

        const where = {
            AND: whereAnd,
        };

        if (search) {
            whereAnd.push({
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { content: { contains: search, mode: "insensitive" } },
                ],
            });
        }

        const announcements = await announcementModel.findMany({
            where,
            orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
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

        return res.json({
            announcements: announcements.map((announcement) =>
                serializeAnnouncement(announcement, user.id)
            ),
            meta: {
                total: announcements.length,
            },
        });
    } catch (error) {
        req.log?.error({ err: error }, "Failed to fetch announcements");
        return res.status(500).json({ message: "Failed to fetch announcements" });
    }
}

/**
 * POST /announcements
 * Admin/faculty only
 */
export async function createAnnouncement(req, res) {
    try {
        const announcementModel = getAnnouncementDelegate();
        const user = req.user;

        if (!user || (user.role !== "admin" && user.role !== "faculty")) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { title, content, targetRole, targetProgram, targetGradYear } = req.body;
        const sanitizedTitle = sanitizeText(title);
        const sanitizedContent = sanitizeText(content);
        const sanitizedProgram = sanitizeText(targetProgram);
        const parsedGradYear = parseTargetGradYear(targetGradYear);

        if (!sanitizedTitle || !sanitizedContent) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        if (targetRole && !MANAGER_ROLE_FILTERS.includes(targetRole)) {
            return res.status(400).json({ message: "Invalid target role" });
        }

        if (targetGradYear !== undefined && targetGradYear !== null && targetGradYear !== "" && parsedGradYear === null) {
            return res.status(400).json({ message: "Invalid graduation year" });
        }

        const announcement = await announcementModel.create({
            data: {
                title: sanitizedTitle,
                content: sanitizedContent,
                creatorId: user.id,
                targetRole: normalizeTargetRole(targetRole),
                targetProgram: sanitizedProgram,
                targetGradYear: parsedGradYear,
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

        await auditLogSafely(req, {
            action: "announcement_created",
            entityType: "announcement",
            entityId: announcement.id,
            summary: `Created announcement '${announcement.title}'`,
            metadata: {
                targetRole: announcement.targetRole,
                targetProgram: announcement.targetProgram,
                targetGradYear: announcement.targetGradYear
            }
        }, "Failed to write announcement_created audit log");

        return res.status(201).json({
            message: "Announcement created successfully",
            announcement: serializeAnnouncement(announcement, user.id),
        });
    } catch (error) {
        req.log?.error({ err: error }, "Failed to create announcement");
        return res.status(500).json({ message: "Failed to create announcement" });
    }
}

/**
 * PUT /announcements/:id
 * Admin/faculty only
 */
export async function updateAnnouncement(req, res) {
    try {
        const announcementModel = getAnnouncementDelegate();
        const user = req.user;

        if (!user || (user.role !== "admin" && user.role !== "faculty")) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { id } = req.params;
        const { title, content, targetRole, targetProgram, targetGradYear } = req.body;
        const sanitizedTitle = sanitizeText(title);
        const sanitizedContent = sanitizeText(content);
        const sanitizedProgram = sanitizeText(targetProgram);
        const parsedGradYear = parseTargetGradYear(targetGradYear);

        const existing = await announcementModel.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        if (!sanitizedTitle || !sanitizedContent) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        if (targetRole && !MANAGER_ROLE_FILTERS.includes(targetRole)) {
            return res.status(400).json({ message: "Invalid target role" });
        }

        if (targetGradYear !== undefined && targetGradYear !== null && targetGradYear !== "" && parsedGradYear === null) {
            return res.status(400).json({ message: "Invalid graduation year" });
        }

        const updated = await announcementModel.update({
            where: { id },
            data: {
                title: sanitizedTitle,
                content: sanitizedContent,
                targetRole: normalizeTargetRole(targetRole),
                targetProgram: sanitizedProgram,
                targetGradYear: parsedGradYear,
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

        await auditLogSafely(req, {
            action: "announcement_updated",
            entityType: "announcement",
            entityId: updated.id,
            summary: `Updated announcement '${updated.title}'`,
            metadata: {
                before: {
                    title: existing.title,
                    targetRole: existing.targetRole,
                    targetProgram: existing.targetProgram,
                    targetGradYear: existing.targetGradYear
                },
                after: {
                    title: updated.title,
                    targetRole: updated.targetRole,
                    targetProgram: updated.targetProgram,
                    targetGradYear: updated.targetGradYear
                }
            }
        }, "Failed to write announcement_updated audit log");

        return res.json({
            message: "Announcement updated successfully",
            announcement: serializeAnnouncement(updated, user.id),
        });
    } catch (error) {
        req.log?.error({ err: error }, "Failed to update announcement");
        if (error?.code === "P2025") {
            return res.status(404).json({ message: "Announcement not found" });
        }
        return res.status(500).json({ message: "Failed to update announcement" });
    }
}

/**
 * DELETE /announcements/:id
 * Admin/faculty only
 */
export async function deleteAnnouncement(req, res) {
    try {
        const announcementModel = getAnnouncementDelegate();
        const user = req.user;

        if (!user || (user.role !== "admin" && user.role !== "faculty")) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const { id } = req.params;

        const existing = await announcementModel.findUnique({
            where: { id },
        });

        if (!existing) {
            return res.status(404).json({ message: "Announcement not found" });
        }

        await announcementModel.delete({
            where: { id },
        });

        await auditLogSafely(req, {
            action: "announcement_deleted",
            entityType: "announcement",
            entityId: existing.id,
            summary: `Deleted announcement '${existing.title}'`,
            metadata: {
                targetRole: existing.targetRole,
                targetProgram: existing.targetProgram,
                targetGradYear: existing.targetGradYear
            }
        }, "Failed to write announcement_deleted audit log");

        return res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
        req.log?.error({ err: error }, "Failed to delete announcement");
        if (error?.code === "P2025") {
            return res.status(404).json({ message: "Announcement not found" });
        }
        return res.status(500).json({ message: "Failed to delete announcement" });
    }
}