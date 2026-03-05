import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/admin/Dashboard";


const Directory = () => <div className="text-2xl font-bold">Directory</div>;
const Profile = () => <div className="text-2xl font-bold">My Profile</div>;
const AdminManagement = () => <div className="text-2xl font-bold">Admin Management</div>;
const BulkImport = () => <div className="text-2xl font-bold">Bulk Import</div>;
const Reminders = () => <div className="text-2xl font-bold">Reminders</div>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="directory" element={<Directory />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminManagement />} />
        <Route path="import" element={<BulkImport />} />
        <Route path="reminders" element={<Reminders />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}