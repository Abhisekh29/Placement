import React, { useState, useEffect } from "react";
import HeaderDashboard from "../../components/HeaderDashboard";
import Footer from "../../components/Footer";
import StudentPlacementReportTable from "../../components/Reports/StudentPlacementReportTable";
import PlacementDriveReportTable from "../../components/Reports/PlacementDriveReportTable";
import SelectedStudentReportTable from "../../components/Reports/SelectedStudentReportTable";
import ExpenditureReportTable from "../../components/Reports/ExpenditureReportTable";
import StudentInternshipReportTable from "../../components/Reports/StudentInternshipReportTable";

const Reports = () => {
  const [toastMessage, setToastMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    if (toastMessage.content) {
      const timer = setTimeout(() => {
        setToastMessage({ type: "", content: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderDashboard />
      <main className="grow p-6">
        <h1 className="text-3xl font-bold mb-6">Reports</h1>

        {toastMessage.content && (
          <div
            className={`fixed top-5 left-1/2 transform -translate-x-1/2 p-4 rounded-lg text-white shadow-lg z-9999 ${
              toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toastMessage.content}
          </div>
        )}

        {/* Report 1: Student Stats */}
        <div className="bg-blue-200 py-4 px-4 rounded-xl shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-3">
            Student Placement Application Stats
          </h2>
          <StudentPlacementReportTable setToastMessage={setToastMessage} />
        </div>

        {/* Report 2: Drive Stats */}
        <div className="bg-purple-200 py-4 px-4 rounded-xl shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-3">
            Placement Drive Stats
          </h2>
          <PlacementDriveReportTable setToastMessage={setToastMessage} />
        </div>
        {/* Report 3: Selected Student stats */}
        <div className="bg-orange-200 py-4 px-4 rounded-xl shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-3">
            Selected Students Stats
          </h2>
          <SelectedStudentReportTable setToastMessage={setToastMessage} />
        </div>
        {/* Report 4: Expenditure stats */}
        <div className="bg-green-200 py-4 px-4 rounded-xl shadow-md mb-6">
          <h2 className="text-2xl font-bold mb-3">
            Expenditure Stats
          </h2>
          <ExpenditureReportTable setToastMessage={setToastMessage} />
        </div>
        {/* Report 1: Student Stats */}
        <div className="bg-red-200 py-4 px-4 rounded-xl shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-3">
            Student Internship Stats
          </h2>
          <StudentInternshipReportTable setToastMessage={setToastMessage} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;