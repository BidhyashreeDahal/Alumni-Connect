import { useState } from "react";

function Sidebar({ onToggle }) {
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
         setCollapsed(!collapsed);
         onToggle(!collapsed);
  }

  return (
    <aside
      className={`h-screen border-r border-gray-200 shadow-sm bg-white transition-all duration-300
      ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
        <img src="public/Images/logo-pic.png" className="h-8 w-auto" alt="Logo" />
        {!collapsed && (
          <span className="text-xl font-semibold text-gray-800">
            Alumni Connect
          </span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick = {handleToggle}
        className="p-3 hover:bg-gray-100 w-full text-left"
      >
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

      {/* Navigation */}
      <nav className="mt-4 space-y-1">
        {/* Dashboard */}
        <a
          href="#"
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition
          ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
          </svg>
          {!collapsed && <span>Dashboard</span>}
        </a>

        {/* My Profile */}
        <a
          href="#"
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition
          ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M5.121 17.804A4 4 0 017 17h10a4 4 0 011.879.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {!collapsed && <span>My Profile</span>}
        </a>

        {/* Alumni Directory */}
        <a
          href="#"
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition
          ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M3 7h18M3 12h18M3 17h18" />
          </svg>
          {!collapsed && <span>Alumni Directory</span>}
        </a>

        {/* Admin Management */}
        <a
          href="#"
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition
          ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6v12m6-6H6" />
          </svg>
          {!collapsed && <span>Admin Management</span>}
        </a>

        {/* Bulk Import */}
        <a
          href="#"
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition
          ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4h16v16H4z" />
          </svg>
          {!collapsed && <span>Bulk Import</span>}
        </a>

        {/* Reminder */}
        <a
          href="#"
          className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition
          ${collapsed ? "justify-center" : "gap-3"}`}
        >
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 8v4l3 3" />
          </svg>
          {!collapsed && <span>Reminder</span>}
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;
