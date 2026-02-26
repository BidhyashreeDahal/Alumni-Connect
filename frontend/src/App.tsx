import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

const Dashboard = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-sm text-gray-500">Total Alumni</p>
        <p className="mt-2 text-2xl font-semibold text-emerald-600">0</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-sm text-gray-500">Active Faculty</p>
        <p className="mt-2 text-2xl font-semibold text-blue-600">0</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <p className="text-sm text-gray-500">Recent Updates</p>
        <p className="mt-2 text-2xl font-semibold text-purple-600">0</p>
      </div>
    </div>
  </div>
);

const Directory = () => <div className="text-2xl font-bold">Directory</div>;
const Profile = () => <div className="text-2xl font-bold">My Profile</div>;
const AdminManagement = () => <div className="text-2xl font-bold">Admin Management</div>;
const BulkImport = () => <div className="text-2xl font-bold">Bulk Import</div>;
const Reminders = () => <div className="text-2xl font-bold">Reminders</div>;
const Login = () => <div className="p-6 text-2xl font-bold">Login</div>;

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