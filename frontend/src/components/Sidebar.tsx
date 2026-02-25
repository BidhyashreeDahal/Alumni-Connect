import React from "react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const handleToggle = () => onToggle(!collapsed);

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : "sidebar--expanded"}`}>
      {/* Logo (MATCH HEADER HEIGHT + BORDER LINE ALIGNMENT) */}
      <div className="sidebar__logo h-20 border-b border-gray-200">
        <img src="/Images/logo-pic.png" className="h-8 w-auto" alt="Logo" />
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
        <a href="#" className={`sidebar__link ${collapsed ? "justify-center" : "gap-3"}`}>
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
          </svg>
          {!collapsed && <span>Dashboard</span>}
        </a>

        <a href="#" className={`sidebar__link ${collapsed ? "justify-center" : "gap-3"}`}>
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A4 4 0 017 17h10a4 4 0 011.879.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!collapsed && <span>My Profile</span>}
        </a>

        <a href="#" className={`sidebar__link ${collapsed ? "justify-center" : "gap-3"}`}>
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          {!collapsed && <span>Alumni Directory</span>}
        </a>

        <a href="#" className={`sidebar__link ${collapsed ? "justify-center" : "gap-3"}`}>
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
          </svg>
          {!collapsed && <span>Admin Management</span>}
        </a>

        <a href="#" className={`sidebar__link ${collapsed ? "justify-center" : "gap-3"}`}>
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
          </svg>
          {!collapsed && <span>Bulk Import</span>}
        </a>

        <a href="#" className={`sidebar__link ${collapsed ? "justify-center" : "gap-3"}`}>
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
          </svg>
          {!collapsed && <span>Reminder</span>}
        </a>
      </nav>
    </aside>
  );
};

export default Sidebar;