import { Routes, Route, Navigate } from "react-router-dom"

import LoginPage from "@/app/login/page"
import DashboardPage from "@/app/dashboard/page"
import DirectoryPage from "@/app/directory/page"
import MentorshipPage from "@/app/mentorship/page"
import EventsPage from "@/app/events/page"
import AnalyticsPage from "@/app/analytics/page"

import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function App() {
  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected App */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout  />}>

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/mentorship" element={<MentorshipPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  )
}