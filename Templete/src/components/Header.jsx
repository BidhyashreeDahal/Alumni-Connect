import React, { useState } from "react";

const Header = ({ role, onToggleSidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    if (onToggleSidebar) onToggleSidebar(newState);
  };

  return (
    <header className="sticky top-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-3 z-50">
      <div className="flex items-center justify-between h">


         {/* Search engine */}
        <div className="relative w-64">
  
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
        </svg>

        <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 
                    bg-gray-50 focus:bg-white
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 
                    transition"
        />

        </div>

         {/* Greeting */}
        <div className="flex items-center gap-4">

          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            Hello, {role}
          </h1>
        </div>




        {/* Right: Profile */}
        <div className="flex items-center gap-3">
          <img
            src="public/Images/User_Profile.jpg"
            alt="Profile"
            className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
