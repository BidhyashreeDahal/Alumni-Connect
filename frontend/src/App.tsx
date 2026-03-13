import { Routes, Route, Navigate } from "react-router-dom"

import LoginPage from "@/app/login/page"
import DashboardPage from "@/app/dashboard/page"
import ProfilePage from "./app/profile/page"
import DirectoryPage from "@/app/directory/page"
import MentorshipPage from "@/app/mentorship/page"
import EventsPage from "@/app/events/page"
import AnalyticsPage from "@/app/analytics/page"
import AnnouncementsPage from "@/app/announcements/page"
import InvitePage from "@/app/invite/page"
import BulkImportPage from "@/app/bulkImport/page"
import RemindersPage from "@/app/reminders/page"
import SettingsPage from "@/app/settings/page"
import AdminUsersPage from "@/app/admin/page"
import ClaimAccountPage from "@/app/claim/page"
import StoryPage from "@/app/story/page"

import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/layout/dashboard-layout"
import RoleGuard from "@/components/RoleGuard"

export default function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/" element={<Navigate to="/story" replace />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/claim" element={<ClaimAccountPage />} />

      {/* Protected App */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout  />}>

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/mentorship" element={<MentorshipPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route element={<RoleGuard allow={["admin", "faculty"]} />}>
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/bulk-import" element={<BulkImportPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
          </Route>

          <Route element={<RoleGuard allow={["admin"]} />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/story" replace />} />

    </Routes>
  )
}