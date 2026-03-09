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