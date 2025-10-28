import React, { useEffect, useState } from "react";
import api from "../api/axios";
import HeaderDashboard from "../components/HeaderDashboard";
import Footer from "../components/Footer";
import StudentForm from "../components/StudentForm";
import Profile from "../components/Profile";

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  // Separate state for message and type
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success', 'info', 'error'
  const [showToast, setShowToast] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchStudentDetails = async () => {
      // ... (fetching logic remains the same)
      try {
        const res = await api.get(`/student_master/${user.userid}`);
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
  }, [user.userid]); // Dependency array is correct

  // Keep handleEdit the same
  const handleEdit = () => setEditMode(true);

  // Handle successful update
  const handleFormSuccess = (data) => {
    setStudentData(data);
    setEditMode(false);
    setToastMessage("Details updated successfully!");
    setToastType("success"); // Set type to success
    setShowToast(true);

    setTimeout(() => setShowToast(false), 4000);
  };

  // NEW: Handle case where no changes were made
  const handleNoChanges = () => {
    setEditMode(false); // Still exit edit mode
    setToastMessage("No changes were made.");
    setToastType("error"); // Set type to warning/error
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  if (loading) {
    return <div>Loading...</div>; // Keep loading state
  }

  // Determine toast background color based on type
  const getToastBgColor = () => {
    switch (toastType) {
      case "success":
        return "bg-green-500";
      case "info":
        return "bg-blue-500"; // Example info color
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      <HeaderDashboard />

      {/* Toast container - Use dynamic background color */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        {showToast && (
          <div
            className={`${getToastBgColor()} text-white px-6 py-3 rounded-lg shadow-lg animate-slideDown`}
          >
            {toastMessage}
          </div>
        )}
      </div>

      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="mb-6 text-gray-700">
          Welcome,{" "}
          <span className="font-semibold">
            {studentData?.name || user.username}
          </span>
        </p>

        {studentData && !editMode ? (
          <Profile studentData={studentData} onEdit={handleEdit} />
        ) : (
          <StudentForm
            existingData={studentData}
            onSuccess={handleFormSuccess}
            onNoChanges={handleNoChanges}
            onErrorToast={(msg) => {
              setToastMessage(msg);
              setToastType("error");
              setShowToast(true);
              setTimeout(() => setShowToast(false), 4000);
            }}
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
