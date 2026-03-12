export type UserRole = "admin" | "faculty" | "alumni" | "student";

export type AnnouncementAudience = {
    roles?: UserRole[];
    programs?: string[];
    graduationYears?: number[];
};

export type AnnouncementStatus = "published" | "draft";

export interface Announcement {
    id: string;
    title: string;
    content: string;
    creatorName: string;
    creatorRole: UserRole;
    createdAt: string;
    updatedAt?: string;
    status: AnnouncementStatus;
    audience: AnnouncementAudience;
}