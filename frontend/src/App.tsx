import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/dashboard-layout";
import Login from "./app/login/page";
import Page from "./app/dashboard/page.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
// import Page from "./app/analytics/page.tsx";
import Page from "./app/announcements/page.tsx";
import Settings from "./pages/admin/Settings";
import Page from "./app/events/page.tsx";
import Page from "./app/directory/page.tsx";
import Profile from "./pages/alumni/Profile";
import AdminManagement from "./pages/admin/AdminManagement";
import Page from "./app/bulkImport/page.tsx";
import Page from "./app/reminders/page.tsx";
import Page from "./app/invite/page.tsx";
import MentorshipInvite from "./pages/alumni/MentorshipInvite";
import MentorshipRequest from "./Student/MentorshipRequest";

export default function App() {
    return (
        <Routes>
            {/* public */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* protected */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Page />} />

                    {/* admin + faculty */}
                    <Route element={<RoleGuard allow={["admin", "faculty"]} />}>
                        <Route path="/directory" element={<Page />} />
                        <Route path="/import" element={<Page />} />
                        <Route path="/reminders" element={<Page />} />
                        <Route path="/invite" element={<Page />} />
                        <Route path="/analytics" element={<Page />} />
                    </Route>

                    {/* everyone logged in */}
                    <Route element={<RoleGuard allow={["alumni", "student", "admin", "faculty"]} />}>
                        <Route path="/announcements" element={<Page />} />
                        <Route path="/events" element={<Page />} />
                    </Route>

                    {/* student + admin + alumni */}
                    <Route element={<RoleGuard allow={["student", "admin", "alumni"]} />}>
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* alumni + student */}
                    <Route element={<RoleGuard allow={["alumni", "student"]} />}>
                        <Route path="/profile" element={<Profile />} />
                    </Route>

                    {/* alumni only */}
                    <Route element={<RoleGuard allow={["alumni"]} />}>
                        <Route path="/mentorshipInvite" element={<MentorshipInvite />} />
                    </Route>

                    {/* student only */}
                    <Route element={<RoleGuard allow={["student"]} />}>
                        <Route path="/mentorshipRequest" element={<MentorshipRequest />} />
                    </Route>

                    {/* admin only */}
                    <Route element={<RoleGuard allow={["admin"]} />}>
                        <Route path="/admin" element={<AdminManagement />} />
                    </Route>
                </Route>
            </Route>

            {/* fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}