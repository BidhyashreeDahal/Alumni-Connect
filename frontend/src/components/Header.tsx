import React from "react";
import { useAuth } from "../context/AuthContext";

const Header: React.FC = () => {
  const { user } = useAuth();

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'faculty':
        return 'Faculty';
      case 'alumni':
        return 'Alumni';
      default:
        return 'User';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-20 px-8 gap-8">
        {/* Search area */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Search students, alumni, companies..."
            className="block w-full h-10 px-3 rounded-lg border border-gray-300 bg-gray-50 text-sm
                       focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 bg-gray-100">
            <img
              src="/Images/User_Profile.jpg"
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-semibold text-gray-800">
              {user?.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-xs text-gray-500">
              {user ? getRoleLabel(user.role) : 'Loading...'}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-4 h-4 text-gray-700"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
