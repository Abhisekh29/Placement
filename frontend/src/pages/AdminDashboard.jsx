import React, { useState, useEffect } from "react";
import HeaderDashboard from "../components/HeaderDashboard";
import Footer from "../components/Footer";
import PendingRequest from "../components/PendingRequest";
import AdminCard from "../components/AdminCard";

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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderDashboard />

      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="mb-6 text-gray-700">
          Welcome, <span className="font-semibold">{user.username}</span>
        </p>

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
    </div>
  );
};

export default AdminDashboard;
