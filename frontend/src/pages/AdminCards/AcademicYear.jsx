import React, { useState, useEffect } from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import AcademicYearTable from "../../components/AcademicYearTable";
import { Link } from "react-router-dom";

const AcademicYear = () => {
  const [toastMessage, setToastMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (toastMessage.content) {
      const timer = setTimeout(() => {
        setToastMessage({ type: "", content: "" });
      }, 4000); // Hide the toast after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderDashboard />
      <main className="flex-grow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
             Manage Academic Years
          </h1>
          <Link
            to="/admin-dashboard"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md transition hover:bg-blue-600 text-sm font-medium"
          >
            Back to Dashboard
          </Link>
        </div>

        {toastMessage.content && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-lg z-[9999] ${
              toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toastMessage.content}
          </div>
        )}

        <AcademicYearTable setToastMessage={setToastMessage} />
      </main>
      <Footer />
    </div>
  );
};

export default AcademicYear;
