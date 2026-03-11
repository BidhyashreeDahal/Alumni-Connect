import React from "react";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const { user } = useAuth();
  const handleToggle = () => onToggle(!collapsed);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6", roles: ["admin", "faculty", "alumni", "student"] },
    { path: "/directory", label: "Alumni Directory", icon: "M3 7h18M3 12h18M3 17h18", roles: ["admin", "faculty"] },
      { path: "/invite", label: "Invite Alumni/Student",  icon: "M16 14v2a4 4 0 01-8 0v-2M12 12a4 4 0 100-8 4 4 0 000 8z", roles: ["admin", "faculty"] },
    { path: "/profile", label: "My Profile", icon: "M5.121 17.804A4 4 0 017 17h10a4 4 0 011.879.804M15 11a3 3 0 11-6 0 3 3 0 016 0z", roles: ["alumni", "student"] },
    { path: "/import", label: "Bulk Import", icon: "M4 4h16v16H4z", roles: ["admin", "faculty"] },
    { path: "/admin", label: "Admin Management", icon: "M12 6v12m6-6H6", roles: ["admin"] },
    { path: "/reminders", label: "Reminders & Notes", icon: "M12 8v4l3 3", roles: ["admin", "faculty"] },
    { path: "/analytics", label: "Analytics & Reports", icon: "M3 3v18h18M7 13l3-3 3 3 5-5", roles: ["admin", "faculty"] },
    { path: "/announcements", label: "Announcements", icon: "M3 11l18-5v12l-18-5z M11 16v5", roles: ["admin", "faculty", "student", "alumni"] },
    { path: "/events", label: "Events", icon: "M8 7V3m8 4V3M4 11h16M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z", roles: ["admin", "faculty", "student", "alumni"] },
    { path: "/MentorshipInvite", label: "Mentorship Invites", icon: "M16 14v-2a4 4 0 00-3-3.87M8 14v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z", roles: ["alumni"] },
    {
      path: "/MentorshipRequest",
      label: "Mentorship Requests",
      icon: "M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5zm0-2a4 4 0 100-8 4 4 0 000 8z",
      roles: ["student"]
    },
    { path: "/settings", label: "Settings", icon: "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z M19.4 15a1.65 1.65 0 000-6l2.1-1.6-2-3.4-2.5 1a6.5 6.5 0 00-3-1.7L13.5 0h-3L10 3.3a6.5 6.5 0 00-3 1.7l-2.5-1-2 3.4L4.6 9a1.65 1.65 0 000 6l-2.1 1.6 2 3.4 2.5-1a6.5 6.5 0 003 1.7L10.5 24h3l.5-3.3a6.5 6.5 0 003-1.7l2.5 1 2-3.4L19.4 15z", roles: ["admin", "student", "alumni"] },

  ];
  
  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : "sidebar--expanded"}`}>
      {/* Logo (MATCH HEADER HEIGHT + BORDER LINE ALIGNMENT) */}
      <div className="sidebar__logo h-20 border-b border-gray-200">
        <img src="/Images/Logo_Image.jpeg" className="h-8 w-auto" alt="Logo" />
        {!collapsed && (
          <span className="text-xl font-semibold text-gray-800">Alumni Connect</span>
        )}
      </div>

      {/* Toggle Button */}
      <button onClick={handleToggle} className="sidebar__toggle" type="button">
        <svg
          className="h-6 w-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Nav */}
      <nav className="mt-4 space-y-1">
        {visibleNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar__link ${collapsed ? "justify-center" : "gap-3"} ${
                active ? "bg-gray-100 border-r-2 border-emerald-500" : ""
              }`}
            >
              <svg
                className={`h-5 w-5 ${active ? "text-emerald-600" : "text-gray-400"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;