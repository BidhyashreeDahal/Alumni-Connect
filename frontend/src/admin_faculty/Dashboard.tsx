import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profilesAPI } from "../services/api.ts";
import { useAuth } from "@/hooks/useAuth";
import "./dashboard.css";

type Role = "admin" | "faculty" | "alumni" | "student";

type Profile = {
  id?: string;
  firstName?: string;
  lastName?: string;
  updatedAt?: string;
  claimed?: boolean; // optional if you have it
  graduationYear?: string | number;
  program?: string;
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = (user?.role as Role) || "student";

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Placeholder data until backend exists
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

  const mentorshipInvites = useMemo(
      () => [
        { id: "m1", title: "Mentorship Invitation from Faculty", status: "Pending" },
        { id: "m2", title: "Mentorship Pairing", status: "Review" },
      ],
      []
  );

  const mentorshipRequests = useMemo(
      () => [
        { id: "r1", title: "Request sent to: Software Developer (Alumni)", status: "Pending" },
        { id: "r2", title: "Request sent to: Data Analyst (Alumni)", status: "Accepted" },
      ],
      []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only staff fetch directory stats (admin/faculty)
        if (user && (role === "admin" || role === "faculty")) {
          const data = await profilesAPI.getAll();
          const list = data?.profiles || [];
          setProfiles(list);
        } else {
          setProfiles([]);
        }
      } catch (e) {
        console.error("Dashboard fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, role]);

  const nameLabel = useMemo(() => {
    const raw = user?.email?.split("@")[0] || "User";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [user]);

  // ====== Staff calculations (Admin/Faculty) ======
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const staffStats = useMemo(() => {
    const totalAlumni = profiles.length;

    const recentUpdates = profiles.filter((p) => {
      if (!p.updatedAt) return false;
      return new Date(p.updatedAt) > sevenDaysAgo;
    }).length;

    // Stale profiles: not updated in 30 days
    const staleProfiles = profiles.filter((p) => {
      if (!p.updatedAt) return true;
      return new Date(p.updatedAt) < thirtyDaysAgo;
    }).length;

    // Claimed vs Unclaimed (if you have p.claimed; if not, it will show 0)
    const claimed = profiles.filter((p) => p.claimed === true).length;
    const unclaimed = profiles.filter((p) => p.claimed === false).length;

    return { totalAlumni, recentUpdates, staleProfiles, claimed, unclaimed };
  }, [profiles]);

  // KPI for Faculty: "Alumni in Program" – without backend, we show total profiles as proxy
  const facultyStats = useMemo(() => {
    const alumniInProgram = profiles.length;
    const pendingInvites = 0; // TODO later from invites endpoint
    const mentorshipActivity = 0; // TODO later from mentorship endpoint
    const recentAlumniUpdates = staffStats.recentUpdates;
    return { alumniInProgram, recentAlumniUpdates, pendingInvites, mentorshipActivity };
  }, [profiles, staffStats.recentUpdates]);

  // Alumni profile completion placeholder
  const profileCompletion = useMemo(() => {
    // Later: compute from user profile fields
    return 72; // %
  }, []);

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

        {/* ===================== ADMIN ===================== */}
        {role === "admin" && (
            <>
              <div className="dash-grid dash-grid-4">
                <StatCard label="Total Alumni" value={staffStats.totalAlumni} tone="green" />
                <StatCard label="Claimed Profiles" value={staffStats.claimed} tone="blue" helper="(if tracked)" />
                <StatCard label="Unclaimed Profiles" value={staffStats.unclaimed} tone="amber" helper="(if tracked)" />
                <StatCard label="Stale Profiles" value={staffStats.staleProfiles} tone="red" helper="> 30 days" />
              </div>

              <div className="dash-grid dash-grid-2">
                <SectionCard title="Recent Profile Updates" subtitle="Last 7 days">
                  <SimpleList
                      items={getRecentProfiles(profiles, 5)}
                      emptyText="No recent updates found."
                      renderItem={(p) => (
                          <ListRow
                              title={`${p.firstName || "Unknown"} ${p.lastName || ""}`.trim()}
                              meta={p.updatedAt ? formatDate(p.updatedAt) : "No date"}
                              onClick={() => navigate("/directory")}
                          />
                      )}
                  />
                </SectionCard>

                <SectionCard title="Attention Needed" subtitle="Stale profiles (older than 30 days)">
                  <div className="dash-callout dash-callout-red">
                    <div>
                      <div className="dash-callout-title">Profiles needing attention</div>
                      <div className="dash-callout-text">
                        {staffStats.staleProfiles} profiles are stale. Consider sending reminders or reviewing data.
                      </div>
                    </div>
                    <button className="dash-btn dash-btn-outline" onClick={() => navigate("/reminders")}>
                      Manage Reminders
                    </button>
                  </div>
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
                      title="Send Invite"
                      desc="Generate or re-issue invite links"
                      onClick={() => navigate("/invites")}
                  />
                  <ActionButton
                      title="Create Announcement"
                      desc="Post an update for all users"
                      onClick={() => navigate("/announcements")}
                  />
                </div>
              </SectionCard>
            </>
        )}

        {/* ===================== FACULTY ===================== */}
        {role === "faculty" && (
            <>
              <div className="dash-grid dash-grid-4">
                <StatCard label="Alumni in Program" value={facultyStats.alumniInProgram} tone="green" />
                <StatCard label="Recent Alumni Updates" value={facultyStats.recentAlumniUpdates} tone="purple" helper="Last 7 days" />
                <StatCard label="Pending Invites" value={facultyStats.pendingInvites} tone="amber" helper="(later)" />
                <StatCard label="Mentorship Activity" value={facultyStats.mentorshipActivity} tone="blue" helper="(later)" />
              </div>

              <div className="dash-grid dash-grid-2">
                <SectionCard title="Recent Alumni Updates" subtitle="Latest profile activity">
                  <SimpleList
                      items={getRecentProfiles(profiles, 6)}
                      emptyText="No updates yet."
                      renderItem={(p) => (
                          <ListRow
                              title={`${p.firstName || "Unknown"} ${p.lastName || ""}`.trim()}
                              meta={p.updatedAt ? formatDate(p.updatedAt) : "No date"}
                              onClick={() => navigate("/directory")}
                          />
                      )}
                  />
                </SectionCard>

                <SectionCard title="Quick Actions" subtitle="Faculty shortcuts">
                  <div className="dash-actions">
                    <ActionButton title="View Directory" desc="Search & filter alumni" onClick={() => navigate("/directory")} />
                    <ActionButton title="Send Reminder" desc="Follow up on stale profiles" onClick={() => navigate("/reminders")} />
                    <ActionButton title="Add Note" desc="Private notes on profiles" onClick={() => navigate("/directory")} />
                  </div>
                </SectionCard>
              </div>
            </>
        )}

        {/* ===================== ALUMNI ===================== */}
        {role === "alumni" && (
            <>
              <div className="dash-grid dash-grid-3">
                <StatCard label="Profile Completion" value={`${profileCompletion}%`} tone="green" helper="Keep it updated" />
                <StatCard label="Event Invitations" value={eventInvites.length} tone="blue" />
                <StatCard label="Mentorship Invitations" value={mentorshipInvites.length} tone="purple" />
              </div>

              <div className="dash-grid dash-grid-2">
                <SectionCard title="Event Invitations" subtitle="Your upcoming invites">
                  <SimpleList
                      items={eventInvites}
                      emptyText="No event invitations right now."
                      renderItem={(e) => (
                          <ListRow title={e.title} meta={e.status} onClick={() => navigate("/events")} />
                      )}
                  />
                </SectionCard>

                <SectionCard title="Mentorship Invitations" subtitle="Requests & opportunities">
                  <SimpleList
                      items={mentorshipInvites}
                      emptyText="No mentorship invitations yet."
                      renderItem={(m) => (
                          <ListRow title={m.title} meta={m.status} onClick={() => navigate("/MentorshipInvite")} />
                      )}
                  />
                </SectionCard>
              </div>

              <SectionCard title="Announcements" subtitle="Latest updates">
                <SimpleList
                    items={announcements}
                    emptyText="No announcements."
                    renderItem={(a) => <ListRow title={a.title} meta={a.date} onClick={() => navigate("/announcements")} />}
                />
              </SectionCard>
            </>
        )}

        {/* ===================== STUDENT ===================== */}
        {role === "student" && (
            <>
              <div className="dash-wrap">
                <div className={`dash-wrap ${user?.role === "student" ? "student-dashboard" : ""}`}>
              <div className="dash-grid dash-grid-3">
              {/*  <StatCard label="Directory Shortcut" value="Browse" tone="blue" helper="Find alumni" />*/}
              {/*  <StatCard label="Mentorship Requests" value={mentorshipRequests.length} tone="purple" />*/}
              {/*  <StatCard label="Event Invitations" value={eventInvites.length} tone="green" />*/}
              {/*</div>*/}

              {/*<div className="dash-grid dash-grid-2">*/}
              {/*  <SectionCard title="Alumni Directory" subtitle="Start exploring">*/}
              {/*    <div className="dash-callout dash-callout-blue">*/}
              {/*      <div>*/}
              {/*        <div className="dash-callout-title">Find alumni by program, job title, skills</div>*/}
              {/*        <div className="dash-callout-text">Use search + filters to discover people to connect with.</div>*/}
              {/*      </div>*/}
              {/*      <button className="dash-btn dash-btn-outline" onClick={() => navigate("/directory")}>*/}
              {/*        Open Directory*/}
              {/*      </button>*/}
              {/*    </div>*/}
              {/*  </SectionCard>*/}

                <SectionCard title="Mentorship Requests" subtitle="Your request status">
                  <SimpleList
                      items={mentorshipRequests}
                      emptyText="No mentorship requests yet."
                      renderItem={(r) => (
                          <ListRow title={r.title} meta={r.status} onClick={() => navigate("/MentorshipRequest")} />
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
                          <ListRow title={e.title} meta={e.status} onClick={() => navigate("/events")} />
                      )}
                  />
                </SectionCard>

                <SectionCard title="Announcements" subtitle="Latest updates">
                  <SimpleList
                      items={announcements}
                      emptyText="No announcements."
                      renderItem={(a) => <ListRow title={a.title} meta={a.date} onClick={() => navigate("/announcements")} />}
                  />
                </SectionCard>
              </div>
              </div>
              </div>
            </>

        )}
      </div>
  );
};

export default Dashboard;

/* ===================== Small UI Components ===================== */

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
                   title,
                   meta,
                   onClick,
                 }: {
  title: string;
  meta?: string;
  onClick?: () => void;
}) {
  return (
      <button className="dash-row" onClick={onClick} type="button">
        <div className="dash-row-title">{title}</div>
        {meta && <div className="dash-row-meta">{meta}</div>}
      </button>
  );
}

/* ===================== Helpers ===================== */

function getRecentProfiles(list: Profile[], take: number) {
  return [...(list || [])]
      .filter((p) => !!p.updatedAt)
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, take);
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}