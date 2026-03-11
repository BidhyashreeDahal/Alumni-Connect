<<<<<<< HEAD
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./admin_faculty/Dashboard.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";
import Analytics from "./admin_faculty/Analytics.tsx";
import Announcements from "./admin_faculty/Announcements.tsx";
import Settings from "./pages/admin/Settings.tsx";
import Events from "./admin_faculty/Events.tsx";
import Directory from "./admin_faculty/Directory.tsx";
import Profile from "./pages/alumni/Profile.tsx";
import AdminManagement from "./pages/admin/AdminManagement.tsx";
import BulkImport from "./admin_faculty/BulkImport.tsx";
import Reminders from "./admin_faculty/Reminders.tsx";
import Invite from "./admin_faculty/Invite.tsx";
import MentorshipInvite from "./pages/alumni/MentorshipInvite.tsx";
import MentorshipRequest from "./Student/MentorshipRequest.tsx";


export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Navigate to="/dashboard" replace />} />

                    {/* Everyone logged in */}
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* Admin + Faculty */}
                    <Route element={<RoleGuard allow={["admin", "faculty"]} />}>
                        <Route path="directory" element={<Directory />} />
                        <Route path="import" element={<BulkImport />} />
                        <Route path="reminders" element={<Reminders />} />
                        <Route path="invite" element={<Invite />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="/announcements" element={<Announcements />} />


                    </Route>

                    {/* Admin + faculty + student + alumni */}
                    <Route element={<RoleGuard allow={["alumni", "student", "admin", "faculty"]} />}>
                        <Route path="announcements" element={<Announcements />} />
                        <Route path="events" element={<Events />} />
                    </Route>

                    {/* Student + admin + alumni */}
                    <Route element={<RoleGuard allow={["student", "admin", "alumni"]} />}>
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Alumni + Student */}
                    <Route element={<RoleGuard allow={["alumni", "student"]} />}>
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    {/* Alumni */}
                    <Route element={<RoleGuard allow={["alumni"]} />}>
                        <Route path="mentorshipInvite" element={<MentorshipInvite />} />
                    </Route>

                    {/* Student */}
                    <Route element={<RoleGuard allow={["student"]} />}>
                        <Route path="mentorshipRequest" element={<MentorshipRequest />} />
                    </Route>

                    {/* Admin only */}
                    <Route element={<RoleGuard allow={["admin"]} />}>
                        <Route path="admin" element={<AdminManagement />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
=======
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import LoginPage from "@/app/login/page"
import DashboardPage from "@/app/dashboard/page"
import DirectoryPage from "@/app/directory/page"
import MentorshipPage from "@/app/mentorship/page"
import EventsPage from "@/app/events/page"
import AnalyticsPage from "@/app/analytics/page"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* App Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/mentorship" element={<MentorshipPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
>>>>>>> 84b5800ddbc25cfcd42ccba663dd62402d03f447
