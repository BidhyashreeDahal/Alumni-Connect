import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Role = "admin" | "faculty" | "alumni" | "student";

export default function RoleGuard({ allow }: { allow: Role[] }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-6">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    if (!allow.includes(user.role)) return <Navigate to="/dashboard" replace />;

    return <Outlet />;
}