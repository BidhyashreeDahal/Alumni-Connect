import { Routes, Route, Navigate } from "react-router-dom"

import LoginPage from "@/app/login/page"
import StoryPage from "./app/story/page"
import DashboardPage from "@/app/dashboard/page"
import { ProfilePage } from "@/app/profile/page"
import DirectoryPage from "@/app/directory/page"
import MentorshipPage from "@/app/mentorship/page"
import EventsPage from "@/app/events/page"
import AnalyticsPage from "@/app/analytics/page"
import AnnouncementsPage from "@/app/announcements/page"
import RemindersPage from "@/app/reminders/page"
import SettingsPage from "@/app/settings/page"
import ProtectedRoute from "@/components/ProtectedRoute"
import ProfileRouteRedirect from "@/components/ProfileRouteRedirect"
import DashboardLayout from "@/components/layout/dashboard-layout"
import ProfileNotesPage from "@/components/notes/ProfilesNotePage"
import ClaimAccountPage from "@/app/claim/page"
import InvitesPage from "@/app/invite/page"
import CreateProfilePage from "@/pages/admin/CreateProfilePage"
import CreateFacultyPage from "@/pages/admin/CreateFacultyPage"
import AdminManagementPage from "@/app/adminmanagement/page"
import BulkImportPage from "@/app/bulk-import/page"

export default function App() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/claim" element={<ClaimAccountPage />} />

            {/* Protected App */}
            <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/directory" element={<DirectoryPage />} />
                    <Route path="/profile" element={<ProfileRouteRedirect />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                    <Route path="/mentorship" element={<MentorshipPage />} />
                    <Route path="/events" element={<EventsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/announcements" element={<AnnouncementsPage />} />
                    <Route path="/reminders" element={<RemindersPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/invite" element={<InvitesPage />} />
                    <Route path="/profiles/create" element={<CreateProfilePage />} />
                    <Route path="/adminmanagement" element={<AdminManagementPage />} />
                    <Route path="/admin/create-faculty" element={<CreateFacultyPage />} />
                    <Route path="/admin/users" element={<Navigate to="/adminmanagement" replace />} />
                    <Route path="/bulk-import" element={<BulkImportPage />} />
                    <Route path="/profiles/:id/notes" element={<ProfileNotesPage />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    )
}