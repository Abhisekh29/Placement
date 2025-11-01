import React, { useState, useEffect, useRef } from "react";
import HeaderDashboard from "../components/HeaderDashboard";
import Footer from "../components/Footer";
import PendingRequest from "../components/PendingRequest";
import AdminCard from "../components/AdminCard";
import { IoSettingsSharp } from "react-icons/io5";
import ChangePasswordModal from "../components/ChangePasswordModal";

const AdminDashboard = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [toastMessage, setToastMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (toastMessage.content) {
      const timer = setTimeout(() => {
        setToastMessage({ type: "", content: "" });
      }, 4000); // Hide the toast after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // --- Add state for dropdown and modal ---
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // Ref for detecting outside clicks

  // --- Add effect to close dropdown on outside click ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="h-screen flex flex-col bg-white relative overflow-y-auto no-scrollbar">
      <HeaderDashboard />

      <main className="flex-grow p-6">
        <div className="flex justify-between items-center mb-6">
          {/* Left Side: Title + Welcome */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Admin Dashboard
            </h1>
            <p className="font-semibold text-gray-700">
              Welcome,{" "}
              <span className="font-semibold text-purple-600">
                {user.username}
              </span>
            </p>
          </div>

          {/* Right Side: Settings Dropdown */}
          <div className="relative" ref={dropdownRef}>
            {/* Settings Button */}
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="group p-2 rounded-full text-gray-600 hover:text-purple-600 hover:bg-purple-100 transition-colors duration-200"
              title="Settings"
            >
              <IoSettingsSharp
                size={26}
                className="transform transition-transform duration-300 group-hover:rotate-90"
              />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-fadeIn">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors duration-200"
                  >
                    <span>🔒</span>
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {toastMessage.content && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white ${toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
              }`}
          >
            {toastMessage.content}
          </div>
        )}

        <AdminCard />
        <div className="mt-8">
          <PendingRequest setToastMessage={setToastMessage} />
        </div>

      </main>

      <Footer />

      {/* --- Render the Modal (conditionally) --- */}
      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} />}

    </div>
  );
};

export default AdminDashboard;