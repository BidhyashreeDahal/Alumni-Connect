import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAnnouncements } from "../Data/mockAnnouncements";
import type { Announcement, UserRole } from "../types/announcements";
import "./Announcements.css";

type CurrentUser = {
    role: UserRole;
    program?: string;
    graduationYear?: number;
};

const currentUser: CurrentUser = {
    role: "admin",
    program: "Computer Programming and Analysis",
    graduationYear: 2026,
};

const Announcements: React.FC = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [programFilter, setProgramFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");

    const canManageAnnouncements =
        currentUser.role === "admin" || currentUser.role === "faculty";

    const isRelevantToUser = (announcement: Announcement, user: CurrentUser) => {
        const { audience } = announcement;

        const roleMatch =
            !audience.roles || audience.roles.length === 0
                ? true
                : audience.roles.includes(user.role);

        const programMatch =
            !audience.programs || audience.programs.length === 0
                ? true
                : user.program
                    ? audience.programs.includes(user.program)
                    : false;

        const graduationYearMatch =
            !audience.graduationYears || audience.graduationYears.length === 0
                ? true
                : user.graduationYear
                    ? audience.graduationYears.includes(user.graduationYear)
                    : false;

        return roleMatch && programMatch && graduationYearMatch;
    };

    const visibleAnnouncements = useMemo(() => {
        let data = [...mockAnnouncements];

        if (!canManageAnnouncements) {
            data = data.filter((item) => isRelevantToUser(item, currentUser));
        }

        if (search.trim()) {
            const value = search.toLowerCase();
            data = data.filter(
                (item) =>
                    item.title.toLowerCase().includes(value) ||
                    item.content.toLowerCase().includes(value) ||
                    item.creatorName.toLowerCase().includes(value)
            );
        }

        if (roleFilter !== "all") {
            data = data.filter((item) =>
                item.audience.roles?.includes(roleFilter as UserRole)
            );
        }

        if (programFilter !== "all") {
            data = data.filter((item) =>
                item.audience.programs?.includes(programFilter)
            );
        }

        if (yearFilter !== "all") {
            data = data.filter((item) =>
                item.audience.graduationYears?.includes(Number(yearFilter))
            );
        }

        return data.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [search, roleFilter, programFilter, yearFilter, canManageAnnouncements]);

    const getAudienceLabel = (announcement: Announcement) => {
        const parts: string[] = [];

        if (announcement.audience.roles?.length) {
            parts.push(`Roles: ${announcement.audience.roles.join(", ")}`);
        }

        if (announcement.audience.programs?.length) {
            parts.push(`Programs: ${announcement.audience.programs.join(", ")}`);
        }

        if (announcement.audience.graduationYears?.length) {
            parts.push(
                `Grad Years: ${announcement.audience.graduationYears.join(", ")}`
            );
        }

        return parts.length ? parts.join(" • ") : "All Users";
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="announcements-page">
            <div className="announcements-header">
                <div>
                    <h1>Announcements</h1>
                    <p>
                        Stay updated with important platform, program, and community news.
                    </p>
                </div>

                {canManageAnnouncements && (
                    <button
                        className="create-announcement-btn"
                        onClick={() => navigate("/announcements/new")}
                    >
                        + Create Announcement
                    </button>
                )}
            </div>

            <div className="announcements-filters">
                <input
                    type="text"
                    placeholder="Search announcements..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="announcement-search"
                />

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="faculty">Faculty</option>
                    <option value="alumni">Alumni</option>
                    <option value="student">Student</option>
                </select>

                <select
                    value={programFilter}
                    onChange={(e) => setProgramFilter(e.target.value)}
                >
                    <option value="all">All Programs</option>
                    <option value="Computer Programming and Analysis">
                        Computer Programming and Analysis
                    </option>
                    <option value="Business">Business</option>
                    <option value="Engineering">Engineering</option>
                </select>

                <select
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                >
                    <option value="all">All Graduation Years</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                </select>
            </div>

            <div className="announcements-list">
                {visibleAnnouncements.length === 0 ? (
                    <div className="empty-state">
                        <h3>No announcements found</h3>
                        <p>Try changing your search or filters.</p>
                    </div>
                ) : (
                    visibleAnnouncements.map((announcement) => (
                        <div key={announcement.id} className="announcement-card">
                            <div className="announcement-card-top">
                                <div>
                                    <h2>{announcement.title}</h2>
                                    <p className="announcement-meta">
                                        Posted by {announcement.creatorName} •{" "}
                                        {formatDate(announcement.createdAt)}
                                    </p>
                                </div>

                                <span className="announcement-status">
                  {announcement.status}
                </span>
                            </div>

                            <p className="announcement-content-preview">
                                {announcement.content.length > 180
                                    ? `${announcement.content.slice(0, 180)}...`
                                    : announcement.content}
                            </p>

                            <div className="announcement-audience">
                                {getAudienceLabel(announcement)}
                            </div>

                            <div className="announcement-actions">
                                <button
                                    className="secondary-btn"
                                    onClick={() =>
                                        navigate(`/announcements/${announcement.id}`)
                                    }
                                >
                                    View
                                </button>

                                {canManageAnnouncements && (
                                    <>
                                        <button
                                            className="secondary-btn"
                                            onClick={() =>
                                                navigate(`/announcements/${announcement.id}/edit`)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="danger-btn"
                                            onClick={() =>
                                                alert(`Delete announcement ${announcement.id}`)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Announcements;