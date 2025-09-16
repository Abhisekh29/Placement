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
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderDashboard />
      <main className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="mb-6 text-gray-700">
          Welcome, <span className="font-semibold">{user.username}</span>
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
    </div>
  );
};

export default StudentDashboard;
