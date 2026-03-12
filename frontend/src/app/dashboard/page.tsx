import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth.ts";
import { profilesAPI, analyticsAPI, mentorshipAPI } from "../../api/client.ts";
import "./dashboard.css";

type Role = "admin" | "faculty" | "alumni" | "student";

type Profile = {
    id?: string;
    firstName?: string;
    lastName?: string;
    updatedAt?: string;
    createdAt?: string;
    claimed?: boolean;
    graduationYear?: string | number;
    program?: string;
    company?: string;
    jobTitle?: string;
};

type AnalyticsResponse = {
    totals?: {
        students?: number;
        alumni?: number;
        claimedAlumni?: number;
        mentorshipRequests?: number;
        acceptedMentorships?: number;
        events?: number;
        eventRegistrations?: number;
    };
    topHiringCompanies?: { company: string; count: number }[];
    alumniByYear?: { graduationYear: number; _count: { graduationYear: number } }[];
};

type StudentMentorshipRequest = {
    id: string;
    status?: string;
    message?: string | null;
    alumni?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        jobTitle?: string;
        company?: string;
    };
};

type AlumniMentorshipRequest = {
    id: string;
    status?: string;
    message?: string | null;
    student?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        program?: string;
        graduationYear?: number;
    };
};

const Page: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const role: Role | undefined = user?.role;

    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
    const [studentRequests, setStudentRequests] = useState<StudentMentorshipRequest[]>([]);
    const [alumniRequests, setAlumniRequests] = useState<AlumniMentorshipRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const announcements = useMemo(
        () => [
            { id: "a1", title: "Spring networking event announced", date: "Mar 2026" },
            { id: "a2", title: "New mentorship cycle opens soon", date: "Mar 2026" },
            { id: "a3", title: "Update your profile for better matches", date: "Feb 2026" },
        ],
        []
    );

    const eventInvites = useMemo(
        () => [
            { id: "e1", title: "Career Fair: Alumni & Students", status: "Invited" },
            { id: "e2", title: "Resume Review Workshop", status: "Open" },
        ],
        []
    );

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                if (!user) {
                    setLoading(false);
                    return;
                }

                if (role === "admin" || role === "faculty") {
                    const [profilesRes, analyticsRes] = await Promise.all([
                        profilesAPI.getAll(),
                        analyticsAPI.getDashboard(),
                    ]);

                    setProfiles(profilesRes?.profiles || []);
                    setAnalytics(analyticsRes || null);
                }

                if (role === "student") {
                    const mentorshipRes = await mentorshipAPI.getMyRequests();
                    setStudentRequests(mentorshipRes?.requests || []);
                }

                if (role === "alumni") {
                    const mentorshipRes = await mentorshipAPI.getIncomingRequests();
                    setAlumniRequests(mentorshipRes?.requests || []);
                }
            } catch (error) {
                console.error("Dashboard fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, role]);

    const nameLabel = useMemo(() => {
        const raw = user?.email?.split("@")[0] || "User";
        return raw.charAt(0).toUpperCase() + raw.slice(1);
    }, [user]);

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const localStaffStats = useMemo(() => {
        const totalAlumni = profiles.length;

        const recentUpdates = profiles.filter((p) => {
            const value = p.updatedAt || p.createdAt;
            if (!value) return false;
            return new Date(value) > sevenDaysAgo;
        }).length;

        const staleProfiles = profiles.filter((p) => {
            const value = p.updatedAt || p.createdAt;
            if (!value) return true;
            return new Date(value) < thirtyDaysAgo;
        }).length;

        const claimedProfiles = profiles.filter((p) => p.claimed).length;
        const unclaimedProfiles = totalAlumni - claimedProfiles;

        return {
            totalAlumni,
            recentUpdates,
            staleProfiles,
            claimedProfiles,
            unclaimedProfiles,
        };
    }, [profiles, sevenDaysAgo, thirtyDaysAgo]);

    const staffStats = useMemo(() => {
        const totalAlumni = analytics?.totals?.alumni ?? localStaffStats.totalAlumni;
        const claimedAlumni = analytics?.totals?.claimedAlumni ?? localStaffStats.claimedProfiles;
        const unclaimedAlumni = totalAlumni - claimedAlumni;

        return {
            totalStudents: analytics?.totals?.students ?? 0,
            totalAlumni,
            claimedAlumni,
            unclaimedAlumni,
            mentorshipRequests: analytics?.totals?.mentorshipRequests ?? 0,
            acceptedMentorships: analytics?.totals?.acceptedMentorships ?? 0,
            events: analytics?.totals?.events ?? 0,
            eventRegistrations: analytics?.totals?.eventRegistrations ?? 0,
            recentUpdates: localStaffStats.recentUpdates,
            staleProfiles: localStaffStats.staleProfiles,
        };
    }, [analytics, localStaffStats]);

    const facultyStats = useMemo(() => {
        return {
            alumniInProgram: staffStats.totalAlumni,
            recentAlumniUpdates: staffStats.recentUpdates,
            pendingInvites: staffStats.unclaimedAlumni,
            mentorshipActivity: staffStats.mentorshipRequests,
        };
    }, [staffStats]);

    const profileCompletion = 72;

    const Header = () => (
        <div className="dash-header">
            <div>
                <h1 className="dash-title">Dashboard</h1>
                <p className="dash-subtitle">
                    Welcome back, <span className="dash-strong">{nameLabel}</span>
                </p>
            </div>

            {(role === "alumni" || role === "student") && (
                <button className="dash-btn dash-btn-primary" onClick={() => navigate("/profile")}>
                    Update Profile
                </button>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="dash-wrap">
                <Header />
                <div className="dash-grid dash-grid-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="dash-card dash-skeleton">
                            <div className="dash-skel-line w-40" />
                            <div className="dash-skel-line w-24" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="dash-wrap">
            <Header />

            {role === "admin" && (
                <>
                    <div className="dash-grid dash-grid-4">
                        <StatCard label="Total Alumni" value={staffStats.totalAlumni} tone="green" />
                        <StatCard
                            label="Claimed vs Unclaimed"
                            value={`${staffStats.claimedAlumni} / ${staffStats.unclaimedAlumni}`}
                            tone="blue"
                            helper="Claimed / Unclaimed"
                        />
                        <StatCard label="Recent Profile Updates" value={staffStats.recentUpdates} tone="purple" helper="Last 7 days" />
                        <StatCard label="Stale Profiles" value={staffStats.staleProfiles} tone="red" helper="Attention needed" />
                    </div>

                    <div className="dash-grid dash-grid-2">
                        <SectionCard title="Recent Profile Updates" subtitle="Latest alumni profile activity">
                            <SimpleList
                                items={getRecentProfiles(profiles, 5)}
                                emptyText="No recent updates found."
                                renderItem={(p) => (
                                    <ListRow
                                        keyValue={p.id || `${p.firstName}-${p.lastName}`}
                                        title={`${p.firstName || "Unknown"} ${p.lastName || ""}`.trim()}
                                        meta={p.updatedAt || p.createdAt ? formatDate(p.updatedAt || p.createdAt || "") : "No date"}
                                        onClick={() => navigate("/directory")}
                                    />
                                )}
                            />
                        </SectionCard>

                        <SectionCard title="Stale Profiles / Attention Needed" subtitle="Profiles not updated recently">
                            <SimpleList
                                items={getStaleProfiles(profiles, 5, thirtyDaysAgo)}
                                emptyText="No stale profiles found."
                                renderItem={(p) => (
                                    <ListRow
                                        keyValue={p.id || `${p.firstName}-${p.lastName}`}
                                        title={`${p.firstName || "Unknown"} ${p.lastName || ""}`.trim()}
                                        meta="Needs follow-up"
                                        onClick={() => navigate("/directory")}
                                    />
                                )}
                            />
                        </SectionCard>
                    </div>

                    <SectionCard title="Quick Actions" subtitle="Admin shortcuts">
                        <div className="dash-actions">
                            <ActionButton
                                title="Import CSV"
                                desc="Preview, validate, and import alumni"
                                onClick={() => navigate("/import")}
                            />
                            <ActionButton
                                title="Send Page"
                                desc="Generate or resend invite links"
                                onClick={() => navigate("/invites")}
                            />
                            <ActionButton
                                title="Create Announcement"
                                desc="Publish a new announcement"
                                onClick={() => navigate("/announcements")}
                            />
                        </div>
                    </SectionCard>
                </>
            )}

            {role === "faculty" && (
                <>
                    <div className="dash-grid dash-grid-4">
                        <StatCard label="Alumni in Program" value={facultyStats.alumniInProgram} tone="green" />
                        <StatCard label="Recent Alumni Updates" value={facultyStats.recentAlumniUpdates} tone="purple" helper="Last 7 days" />
                        <StatCard label="Pending Invites" value={facultyStats.pendingInvites} tone="amber" />
                        <StatCard label="Mentorship Activity" value={facultyStats.mentorshipActivity} tone="blue" />
                    </div>

                    <div className="dash-grid dash-grid-2">
                        <SectionCard title="Recent Alumni Updates" subtitle="Latest alumni activity">
                            <SimpleList
                                items={getRecentProfiles(profiles, 6)}
                                emptyText="No updates yet."
                                renderItem={(p) => (
                                    <ListRow
                                        keyValue={p.id || `${p.firstName}-${p.lastName}`}
                                        title={`${p.firstName || "Unknown"} ${p.lastName || ""}`.trim()}
                                        meta={p.updatedAt || p.createdAt ? formatDate(p.updatedAt || p.createdAt || "") : "No date"}
                                        onClick={() => navigate("/directory")}
                                    />
                                )}
                            />
                        </SectionCard>

                        <SectionCard title="Quick Actions" subtitle="Faculty shortcuts">
                            <div className="dash-actions">
                                <ActionButton title="Add Note" desc="Add notes for alumni records" onClick={() => navigate("/directory")} />
                                <ActionButton title="Send Reminder" desc="Send follow-up reminders" onClick={() => navigate("/reminders")} />
                                <ActionButton title="View Page" desc="Browse alumni directory" onClick={() => navigate("/directory")} />
                            </div>
                        </SectionCard>
                    </div>
                </>
            )}

            {role === "alumni" && (
                <>
                    <div className="dash-grid dash-grid-3">
                        <StatCard label="Profile Completion Status" value={`${profileCompletion}%`} tone="green" helper="Keep it updated" />
                        <StatCard label="Event Invitations" value={eventInvites.length} tone="blue" />
                        <StatCard label="Mentorship Invitations" value={alumniRequests.length} tone="purple" />
                    </div>

                    <div className="dash-grid dash-grid-2">
                        <SectionCard title="Mentorship Invitations" subtitle="Students who want to connect">
                            <SimpleList
                                items={alumniRequests}
                                emptyText="No mentorship invitations yet."
                                renderItem={(req) => (
                                    <ListRow
                                        keyValue={req.id}
                                        title={`${req.student?.firstName || "Unknown"} ${req.student?.lastName || ""}`.trim()}
                                        meta={req.status || "Pending"}
                                        onClick={() => navigate("/mentorship")}
                                    />
                                )}
                            />
                        </SectionCard>

                        <SectionCard title="Event Invitations" subtitle="Your upcoming invites">
                            <SimpleList
                                items={eventInvites}
                                emptyText="No event invitations right now."
                                renderItem={(e) => (
                                    <ListRow
                                        keyValue={e.id}
                                        title={e.title}
                                        meta={e.status}
                                        onClick={() => navigate("/events")}
                                    />
                                )}
                            />
                        </SectionCard>
                    </div>

                    <SectionCard title="Page" subtitle="Latest updates">
                        <SimpleList
                            items={announcements}
                            emptyText="No announcements."
                            renderItem={(a) => (
                                <ListRow
                                    keyValue={a.id}
                                    title={a.title}
                                    meta={a.date}
                                    onClick={() => navigate("/announcements")}
                                />
                            )}
                        />
                    </SectionCard>
                </>
            )}

            {role === "student" && (
                <>
                    <div className="dash-grid dash-grid-3">
                        <StatCard label="Mentorship Requests" value={studentRequests.length} tone="purple" />
                        <StatCard label="Event Invitations" value={eventInvites.length} tone="green" />
                        <StatCard label="Page" value={announcements.length} tone="blue" />
                    </div>

                    <div className="dash-grid dash-grid-2">
                        <SectionCard title="Alumni Page Shortcut" subtitle="Explore alumni and career paths">
                            <div className="dash-actions">
                                <ActionButton
                                    title="Open Page"
                                    desc="Browse alumni by program, company, or role"
                                    onClick={() => navigate("/directory")}
                                />
                            </div>
                        </SectionCard>

                        <SectionCard title="Mentorship Requests" subtitle="Your request status">
                            <SimpleList
                                items={studentRequests}
                                emptyText="No mentorship requests yet."
                                renderItem={(req) => (
                                    <ListRow
                                        keyValue={req.id}
                                        title={`${req.alumni?.firstName || "Unknown"} ${req.alumni?.lastName || ""}`.trim()}
                                        meta={req.status || "Pending"}
                                        onClick={() => navigate("/mentorship")}
                                    />
                                )}
                            />
                        </SectionCard>
                    </div>

                    <div className="dash-grid dash-grid-2">
                        <SectionCard title="Event Invitations" subtitle="Upcoming invites">
                            <SimpleList
                                items={eventInvites}
                                emptyText="No event invitations."
                                renderItem={(e) => (
                                    <ListRow
                                        keyValue={e.id}
                                        title={e.title}
                                        meta={e.status}
                                        onClick={() => navigate("/events")}
                                    />
                                )}
                            />
                        </SectionCard>

                        <SectionCard title="Page" subtitle="Latest updates">
                            <SimpleList
                                items={announcements}
                                emptyText="No announcements."
                                renderItem={(a) => (
                                    <ListRow
                                        keyValue={a.id}
                                        title={a.title}
                                        meta={a.date}
                                        onClick={() => navigate("/announcements")}
                                    />
                                )}
                            />
                        </SectionCard>
                    </div>
                </>
            )}
        </div>
    );
};

export default Page;

function StatCard({
                      label,
                      value,
                      helper,
                      tone,
                  }: {
    label: string;
    value: React.ReactNode;
    helper?: string;
    tone: "green" | "blue" | "purple" | "amber" | "red";
}) {
    return (
        <div className={`dash-card dash-stat dash-tone-${tone}`}>
            <div className="dash-stat-label">{label}</div>
            <div className="dash-stat-value">{value}</div>
            {helper && <div className="dash-stat-helper">{helper}</div>}
        </div>
    );
}

function SectionCard({
                         title,
                         subtitle,
                         children,
                     }: {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="dash-card dash-section">
            <div className="dash-section-head">
                <div>
                    <div className="dash-section-title">{title}</div>
                    {subtitle && <div className="dash-section-subtitle">{subtitle}</div>}
                </div>
            </div>
            <div className="dash-section-body">{children}</div>
        </div>
    );
}

function ActionButton({
                          title,
                          desc,
                          onClick,
                      }: {
    title: string;
    desc: string;
    onClick: () => void;
}) {
    return (
        <button className="dash-action" onClick={onClick} type="button">
            <div className="dash-action-title">{title}</div>
            <div className="dash-action-desc">{desc}</div>
        </button>
    );
}

function SimpleList<T>({
                           items,
                           emptyText,
                           renderItem,
                       }: {
    items: T[];
    emptyText: string;
    renderItem: (item: T) => React.ReactNode;
}) {
    if (!items?.length) return <div className="dash-empty">{emptyText}</div>;
    return <div className="dash-list">{items.map(renderItem)}</div>;
}

function ListRow({
                     keyValue,
                     title,
                     meta,
                     onClick,
                 }: {
    keyValue: string;
    title: string;
    meta?: string;
    onClick?: () => void;
}) {
    return (
        <button key={keyValue} className="dash-row" onClick={onClick} type="button">
            <div className="dash-row-title">{title}</div>
            {meta && <div className="dash-row-meta">{meta}</div>}
        </button>
    );
}

function getRecentProfiles(list: Profile[], take: number) {
    return [...(list || [])]
        .filter((p) => !!(p.updatedAt || p.createdAt))
        .sort((a, b) => {
            const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
            const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
            return bDate - aDate;
        })
        .slice(0, take);
}

function getStaleProfiles(list: Profile[], take: number, cutoffDate: Date) {
    return [...(list || [])]
        .filter((p) => {
            const value = p.updatedAt || p.createdAt;
            if (!value) return true;
            return new Date(value) < cutoffDate;
        })
        .slice(0, take);
}

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return iso;
    }
}