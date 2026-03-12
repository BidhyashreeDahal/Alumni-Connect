import type { Announcement } from "../types/announcements";

export const mockAnnouncements: Announcement[] = [
    {
        id: "1",
        title: "Welcome to Alumni Connect",
        content: "This is the first announcement.",
        creatorName: "Admin",
        creatorRole: "admin",
        createdAt: "2026-03-09T10:00:00Z",
        status: "published",
        audience: {
            roles: ["admin", "faculty", "alumni", "student"],
        },
    },
];