import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const Homepage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-10">
        {/* Left Column */}
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="gur.png"
            alt="Placement"
            className="w-full rounded-lg shadow-lg"
          />
          <h1 className="mt-6 text-2xl font-bold text-gray-800">
            Placement Management System
          </h1>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Top Half - Logins */}
          <div className="grid grid-cols-2 gap-6 h-40">
            <Link
              to={"/login"}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-lg shadow-md hover:bg-blue-100 transition cursor-pointer"
            >
              <img src="student.svg" alt="Student" className="w-12 h-12 mb-2" />
              <h2 className="font-semibold text-blue-600 text-center">
                Student Login
              </h2>
            </Link>
            <Link
              to={"/login"}
              className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg shadow-md hover:bg-green-100 transition cursor-pointer"
            >
              <img src="admin.svg" alt="Admin" className="w-12 h-12 mb-2" />
              <h2 className="font-semibold text-green-600 text-center">
                Admin Login
              </h2>
            </Link>
          </div>

          {/* Bottom Half - Notifications (fixed height) */}
          <div className="p-6 bg-gray-50 rounded-lg shadow-md overflow-y-auto h-72">
            <h3 className="text-lg font-bold mb-3 text-gray-700">
              Notifications
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
              <li>Placement drive scheduled on 15th Sept</li>
              <li>New companies added to the portal</li>
              <li>Deadline for resume submission: 10th Sept</li>
              <li>Placement drive scheduled on 15th Sept</li>
              <li>New companies added to the portal</li>
              <li>Deadline for resume submission: 10th Sept</li>
              <li>Placement drive scheduled on 15th Sept</li>
              <li>New companies added to the portal</li>
              <li>Deadline for resume submission: 10th Sept</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;
