import React, { useEffect, useState } from "react";
import axios from "axios";
import HeaderDashboard from "../components/HeaderDashboard";
import Footer from "../components/Footer";
import StudentForm from "../components/StudentForm";
import Profile from "../components/Profile";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); 
  const [showToast, setShowToast] = useState(false); // <-- for animation
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/student_master/${user.userid}`
        );
        if (res.data.length > 0) {
          setStudentData(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userid) {
      fetchStudentDetails();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.userid]);

  const handleEdit = () => setEditMode(true);

  const handleFormSuccess = (data) => {
    setStudentData(data);
    setEditMode(false);
    setSuccessMessage("Details updated successfully!");
    setShowToast(true);

    // Hide toast after 4 seconds
    setTimeout(() => setShowToast(false), 4000);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <HeaderDashboard />

      {/* Toast container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        {showToast && (
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slideDown">
            {successMessage}
          </div>
        )}
      </div>

      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="mb-6 text-gray-700">
          Welcome, <span className="font-semibold">
            {studentData?.name || user.username}
          </span>
        </p>

        {studentData && !editMode ? (
          <Profile studentData={studentData} onEdit={handleEdit} />
        ) : (
          <StudentForm
            existingData={studentData}
            onSuccess={handleFormSuccess}
          />
        )}
      </main>
      <Footer />

      {/* Tailwind animation */}
      <style>
        {`
          @keyframes slideDown {
            0% { transform: translateY(-20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default StudentDashboard;
