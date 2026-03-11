import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "faculty":
        return "Faculty";
      case "alumni":
        return "Alumni";
      case "student":
        return "Student";
      default:
        return "User";
    }
  };

  const username = user?.email?.split("@")[0] || "User";

  return (
      <>
        <header className="app-header">
          <div className="header-left">
            <div className="search-box">
            <span className="search-icon">
              <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="search-svg"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                />
              </svg>
            </span>

              <input
                  type="text"
                  placeholder="Search students, alumni, companies..."
                  className="search-input"
              />
            </div>
          </div>

          <div className="header-right">
            <button type="button" className="notification-btn" aria-label="Notifications">
              <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="header-icon"
              >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17H19l-1.405-1.405A2.032 2.032 0 0 1 17 14.158V11a5 5 0 1 0-10 0v3.159c0 .538-.214 1.055-.595 1.436L5 17h4.143m5.714 0a3 3 0 1 1-5.714 0m5.714 0H9.143"
                />
              </svg>
            </button>

            <div className="profile-container">
              <button
                  type="button"
                  className="profile-button"
                  onClick={() => setShowDropdown((prev) => !prev)}
              >
                <img
                    src="/Images/User_Profile.jpg"
                    alt="Profile"
                    className="profile-avatar"
                />

                <div className="profile-info">
                  <span className="profile-name">{username}</span>
                  <span className="profile-role">
        {user ? getRoleLabel(user.role) : "Loading..."}
      </span>
                </div>

                <span className={`dropdown-arrow ${showDropdown ? "open" : ""}`}>
      <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="arrow-icon"
      >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
        />
      </svg>
    </span>
              </button>

              {showDropdown && (
                  <div className="profile-dropdown">
                    {(user?.role === "student" || user?.role === "alumni") && (
                        <button
                            className="dropdown-item"
                            onClick={() => {
                              setShowDropdown(false);
                              navigate("/profile");
                            }}
                        >
                          My Profile
                        </button>
                    )}

                    <button
                        className="dropdown-item logout"
                        onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </div>
              )}
            </div>
          </div>
        </header>

        {showDropdown && (
            <div
                className="header-overlay"
                onClick={() => setShowDropdown(false)}
            />
        )}
      </>
  );
};

export default Header;