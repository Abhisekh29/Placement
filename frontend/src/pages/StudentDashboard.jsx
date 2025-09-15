/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import HeaderDashboard from "../components/HeaderDashboard";
import Footer from "../components/Footer";
import StudentForm from "../components/StudentForm";

const StudentDashboard = () => {
  const [hasDetails, setHasDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const checkStudentDetails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/student_master/${user.userid}`
        );
        if (res.data.length > 0) {
          setHasDetails(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.userid) {
      checkStudentDetails();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderDashboard />
      <main className="flex-grow">
        {hasDetails ? (
          <div className="text-center">
            <p className="text-lg text-gray-800">
              Your details have been submitted.
            </p>
          </div>
        ) : (
          <StudentForm />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default StudentDashboard;