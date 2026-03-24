import React, { useState, useEffect } from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import CompanyTable from "../../components/CompanyTable";
import { Link } from "react-router-dom";
import { HiCollection } from "react-icons/hi";

const Company = () => {
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
        
        {/* --- Updated Header Layout --- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Companies
          </h1>
          
          {/* ---> Wrap both buttons in this flex container <--- */}
          <div className="flex items-center gap-3">
            
            <Link
              to="/admin-dashboard"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md transition hover:bg-blue-600 text-sm font-medium"
            >
              Back to Dashboard
            </Link>

            <Link
              to="/admin/company-type"
              className="flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-purple-500 bg-purple-100 hover:bg-purple-200 transition"
            >
              <HiCollection size={20} />
              Company Types
            </Link>
            
          </div>
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

        <CompanyTable setToastMessage={setToastMessage} />
      </main>
      <Footer />
    </div>
  );
};

export default Company;