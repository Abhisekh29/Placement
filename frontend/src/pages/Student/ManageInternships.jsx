import React, { useState, useEffect } from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import StudentInternshipTable from "../../components/StudentInternshipTable"; // Import the new student component
import { Link } from "react-router-dom";

const ManageInternships = () => {
  const [toastMessage, setToastMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (toastMessage.content) {
      const timer = setTimeout(() => {
        setToastMessage({ type: "", content: "" });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderDashboard />
      <main className="flex-grow p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Manage Internships</h1>
            <Link 
                to="/student-dashboard" 
                className="bg-blue-500 text-white px-2 py-1.5 rounded-lg shadow-xl transition hover:bg-blue-600 text-sm font-medium"
            >
                Back to Dashboard
            </Link>
        </div>

        {toastMessage.content && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-lg z-[9999] ${
              toastMessage.type === "success" ? "bg-green-500" : (toastMessage.type === "warning" ? "bg-blue-500" : "bg-red-500")
            }`}
          >
            {toastMessage.content}
          </div>
        )}

        {/* Use the new student-specific table */}
        <StudentInternshipTable setToastMessage={setToastMessage} />
      </main>
      <Footer />
    </div>
  );
};

export default ManageInternships;