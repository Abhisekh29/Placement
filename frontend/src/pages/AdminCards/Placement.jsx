import React, { useState, useEffect } from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import PlacementTable from "../../components/PlacementTable";

const Placement = () => {
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
    <div className="h-screen flex flex-col bg-white relative overflow-y-auto no-scrollbar">
      <HeaderDashboard />

      {toastMessage.content && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white z-[9999] ${
            toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toastMessage.content}
        </div>
      )}

      <main className="flex-grow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Placements
          </h1>
        </div>

        {/* --- Replace this placeholder with your admin table component once created --- */}
        <PlacementTable setToastMessage={setToastMessage} />

      </main>
      <Footer />
    </div>
  );
};

export default Placement;