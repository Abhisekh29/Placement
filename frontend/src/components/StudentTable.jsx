/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import api from "../api/axios";

// ====================================================================
// COMPONENT 1: The Read-Only View Details Modal
// (Omitted for brevity - No changes applied)
// ====================================================================
const StudentDetailsModal = ({ student, onClose }) => {
  // ... (StudentDetailsModal code remains unchanged)
  if (!student) return null;

  // Utility function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  // The 12 student fields in a matrix layout
  const studentFields = [
    { label: "Roll No", value: student.rollno },
    { label: "Name", value: student.name },
    { label: "Mobile No", value: student.mobile },
    { label: "Email", value: student.email },

    { label: "Date of Birth", value: formatDate(student.dob) },
    { label: "Gender", value: student.gender },
    { label: "Caste", value: student.caste || "N/A" },
    { label: "Address", value: student.address || "N/A" },

    {
      label: "10th Percentage",
      value: student.per_10 ? `${student.per_10}%` : "N/A",
    },
    {
      label: "12th Percentage",
      value: student.per_12 ? `${student.per_12}%` : "N/A",
    },
    { label: "Session", value: student.session_name || "N/A" },
    { label: "Program", value: student.program_name || "N/A" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000] p-4 overflow-y-auto">
      {/* Modal adjustments for Mobile Panel View */}
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 md:p-8 animate-fadeIn relative max-h-[95vh] my-4 overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">
          Details for: {student.name} ({student.rollno})
        </h3>

        {/* The requested 3x4 Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-sm">
          {studentFields.map((field, index) => (
            <div key={index} className="flex flex-col">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                {field.label}
              </p>
              <p className="text-base text-gray-800 break-words">
                {field.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// COMPONENT 2: Simplified Edit Modal for Admin
// (Omitted for brevity - No changes applied)
// ====================================================================
const AdminEditStudentModal = ({
  student,
  onClose,
  onSuccess,
  setToastMessage,
}) => {
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Utility function to format the date to YYYY-MM-DD for the input field.
  const formatDOB = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      // "en-CA" format forces YYYY-MM-DD which is required for HTML date input type
      return isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-CA");
    } catch (e) {
      return "";
    }
  };

  // 1. Initial State for Comparison (The original, unedited data)
  const initialFormData = {
    rollno: student.rollno || "",
    name: student.name || "",
    mobile: student.mobile || "",
    email: student.email || "",
    dob: formatDOB(student.dob),
    gender: student.gender || "",
    caste: student.caste || "",
    address: student.address || "",
    per_10: student.per_10 || 0,
    per_12: student.per_12 || 0,
    // Keep original names to derive IDs later in useEffect
    session_name: student.session_name || "",
    program_name: student.program_name || "",
    session_id: "", // Will be set in useEffect (initial value is empty string)
    program_id: "", // Will be set in useEffect (initial value is empty string)
  };

  const [formData, setFormData] = useState(initialFormData);
  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Helper function to check if any of the data fields have changed
  const hasDataChanged = (currentData) => {
    // Create a copy of the initial state but with the selected IDs synchronized
    const originalStateWithIds = {
      ...initialFormData,
      session_id: sessions.find(
        (s) => s.session_name === initialFormData.session_name
      )?.session_id
        ? String(
            sessions.find(
              (s) => s.session_name === initialFormData.session_name
            )?.session_id
          )
        : "",
      program_id: programs.find(
        (p) => p.program_name === initialFormData.program_name
      )?.program_id
        ? String(
            programs.find(
              (p) => p.program_name === initialFormData.program_name
            )?.program_id
          )
        : "",
    };

    // Keys to compare (all editable fields that go into the API payload)
    const keysToCompare = [
      "rollno",
      "name",
      "mobile",
      "email",
      "dob",
      "gender",
      "caste",
      "address",
      "session_id",
      "program_id",
    ];

    // Check percentages first as they are numbers/floats
    const per_10_changed =
      parseFloat(currentData.per_10 || 0) !==
      parseFloat(originalStateWithIds.per_10 || 0);
    const per_12_changed =
      parseFloat(currentData.per_12 || 0) !==
      parseFloat(originalStateWithIds.per_12 || 0);

    if (per_10_changed || per_12_changed) {
      return true;
    }

    // Compare all other keys
    return keysToCompare.some((key) => {
      // Trim and stringify to handle empty strings/nulls and whitespace differences robustly
      const currentValue = String(currentData[key] || "").trim();
      const originalValue = String(originalStateWithIds[key] || "").trim();
      return currentValue !== originalValue;
    });
  };

  // Fetch dropdown data on mount
  useEffect(() => {
    Promise.all([api.get("/session_master"), api.get("/program_master")])
      .then(([sessionsRes, programsRes]) => {
        setSessions(sessionsRes.data || []);
        setPrograms(programsRes.data || []);
        setLoadingOptions(false);
      })
      .catch((err) => {
        console.error(err);
        setToastMessage({
          type: "error",
          content: "Failed to load academic options.",
        });
        setLoadingOptions(false);
      });
  }, [setToastMessage]);

  // Synchronization Effect for pre-population of IDs (runs after options load)
  useEffect(() => {
    if (!loadingOptions && sessions.length > 0 && programs.length > 0) {
      const matchedSession = sessions.find(
        (s) => s.session_name === student.session_name
      );
      const matchedProgram = programs.find(
        (p) => p.program_name === student.program_name
      );

      // This sets the initial, correct session_id and program_id into formData
      setFormData((prev) => ({
        ...prev,
        session_id: matchedSession ? String(matchedSession.session_id) : "",
        program_id: matchedProgram ? String(matchedProgram.program_id) : "",
      }));
    }
  }, [
    loadingOptions,
    sessions,
    programs,
    student.session_name,
    student.program_name,
    student,
  ]);

  // Universal handler for all inputs and selects (value is a string)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.rollno) {
      setToastMessage({
        type: "error",
        content: "Name and Roll No are required.",
      });
      return;
    }

    // CORE FIX: Perform dirty check. If no changes, stop here.
    if (!hasDataChanged(formData)) {
      setToastMessage({
        type: "info",
        content: "No changes detected. Update cancelled.",
      });
      onClose(); // Close the modal without making an API call
      return;
    }

    // Convert string IDs and percentages back to numbers for the API payload
    const payload = {
      ...formData,
      mod_by: user.userid,
      session_id: formData.session_id ? Number(formData.session_id) : null,
      program_id: formData.program_id ? Number(formData.program_id) : null,
      per_10: parseFloat(formData.per_10 || 0),
      per_12: parseFloat(formData.per_12 || 0),
    };

    try {
      await api.put(`/adminStudents/${student.userid}`, payload);

      // Find the names from the local options list for instant table refresh
      const updatedStudentNames = {
        session_name:
          sessions.find((s) => String(s.session_id) === formData.session_id)
            ?.session_name || student.session_name,
        program_name:
          programs.find((p) => String(p.program_id) === formData.program_id)
            ?.program_name || student.program_name,
      };

      onSuccess({ ...student, ...payload, ...updatedStudentNames });
      onClose(); // Close on success
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update student details.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  // Loading state block
  if (loadingOptions) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000] p-4">
        <div className="bg-white p-6 rounded-xl shadow-2xl">
          Loading Edit Form...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000] p-4 overflow-y-auto">
      {/* Modal adjustments for Mobile Panel View */}
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-6 my-4 animate-fadeIn relative max-h-[95vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6">
          Edit Student Details: {student.name}
        </h3>

        <form onSubmit={handleUpdateSubmit}>
          {/* Ensure form grid is responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Row 1: Core Identification */}
            <div className="col-span-1">
              <label className="block text-sm font-medium">Roll No</label>
              <input
                type="text"
                name="rollno"
                value={formData.rollno}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, ""); // only digits
                  setFormData((prev) => ({ ...prev, rollno: digitsOnly }));
                }}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter Roll No"
                maxLength={12}
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => {
                  const lettersOnly = e.target.value.replace(
                    /[^a-zA-Z\s]/g,
                    ""
                  );
                  setFormData((prev) => ({ ...prev, name: lettersOnly }));
                }}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter Name"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium">Mobile</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, "");
                  if (digitsOnly.length <= 10) {
                    setFormData((prev) => ({ ...prev, mobile: digitsOnly }));
                  }
                }}
                className="w-full p-2 border rounded-lg"
                placeholder="10-digit Mobile Number"
                maxLength={10}
                required
              />
              {formData.mobile.length > 0 && formData.mobile.length !== 10 && (
                <p className="text-red-500 text-xs mt-1">
                  Phone number must be exactly 10 digits.
                </p>
              )}
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Row 2: Academic Setup (Dropdowns) */}
            <div className="col-span-1">
              <label className="block text-sm font-medium">Session</label>
              <select
                name="session_id"
                value={formData.session_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="">Select Session</option>
                {sessions.map((s) => (
                  <option key={s.session_id} value={String(s.session_id)}>
                    {s.session_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Program</label>
              <select
                name="program_id"
                value={formData.program_id}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="">Select Program</option>
                {programs.map((p) => (
                  <option key={p.program_id} value={String(p.program_id)}>
                    {p.program_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">10th %</label>
              <input
                type="number"
                step="0.01"
                name="per_10"
                value={formData.per_10}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">12th %</label>
              <input
                type="number"
                step="0.01"
                name="per_12"
                value={formData.per_12}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            {/* Row 3: Other Details */}
            <div className="col-span-1">
              <label className="block text-sm font-medium">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Caste</label>
              <input
                type="text"
                name="caste"
                value={formData.caste}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">DOB</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Update Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ====================================================================
// StudentTable Component
// ====================================================================

const StudentTable = ({ setToastMessage }) => {
  // ... (state declarations remain unchanged)
  const [showStudentList, setShowStudentList] = useState(false);
  const [students, setStudents] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // ⭐ Search state
  const [searchTerm, setSearchTerm] = useState("");

  // ⭐ State for Export Dropdown (No longer used as requested, but keeping for compatibility)
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user"));

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [yearsRes, programsRes] = await Promise.all([
          api.get("/academic-year"),
          api.get("/program_master"),
        ]);

        setAcademicYears(yearsRes.data || []);
        setPrograms(programsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch dropdown options:", err);
        setToastMessage({
          type: "error",
          content: "Failed to load academic options.",
        });
      }
    };
    fetchOptions();
  }, [setToastMessage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "year") {
      setSelectedYearId(value);
      // Hide list and clear data when year changes
      if (value !== selectedYearId) {
        setShowStudentList(false);
        setStudents([]);
      }
      setSearchTerm(""); // Clear search on year change
    } else if (name === "program") {
      setSelectedProgramId(value);
      // Hide list when program changes if it's currently visible
      if (showStudentList) {
        setShowStudentList(false);
      }
      setSearchTerm(""); // Clear search on program change
    }
  };

  const fetchStudents = async (forceFetch = false) => {
    if (!selectedYearId) {
      setToastMessage({
        content: "Please select an Academic Year first.",
        type: "error",
      });
      setShowStudentList(false);
      return;
    }

    // Only fetch if forced, or if the list is hidden (meaning we want to show it) and there's no data
    if (!forceFetch && !showStudentList && students.length > 0) return;

    setIsLoading(true);
    try {
      const res = await api.get("/adminStudents", {
        params: { yearId: selectedYearId, programId: selectedProgramId },
      });
      setStudents(res.data || []);
      setIsLoading(false);
      setShowStudentList(true);
      setSearchTerm(""); // Clear search term after a fresh fetch
    } catch (err) {
      console.error(err);
      setToastMessage({
        content:
          err.response?.data?.message ||
          "Failed to load student data. Is backend running?",
        type: "error",
      });
      setIsLoading(false);
      setShowStudentList(false);
    }
  };

  const handleToggleClick = () => {
    if (!selectedYearId) {
      setToastMessage({
        content: "Please select an Academic Year first.",
        type: "error",
      });
      return;
    }

    const newState = !showStudentList;
    if (newState) {
      fetchStudents(true);
    } else {
      // Only hide the list, don't clear the students array on toggle off
      setShowStudentList(newState);
      setSearchTerm("");
    }
  };

  const handleViewDetailsClick = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleEditSuccess = (updatedData) => {
    setShowEditModal(false);
    fetchStudents(true);
    setToastMessage({
      type: "success",
      content: `Student details for ${updatedData.name} updated successfully.`,
    });
  };

  const handleDeleteClick = (student) => {
    setActionToConfirm(() => () => deleteStudent(student.userid, student.name));
    setShowConfirmModal(true);
  };

  const deleteStudent = async (userid, studentName) => {
    try {
      await api.delete(`/adminStudents/${userid}`);
      setStudents((prev) => prev.filter((s) => s.userid !== userid));
      setToastMessage({
        type: "success",
        content: `${studentName}'s record has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete student record.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const confirmAction = () => {
    if (typeof actionToConfirm === "function") {
      actionToConfirm();
    }
    setShowConfirmModal(false);
  };

  const isToggleDisabled = isLoading || !selectedYearId;

  // ---------------------------------------------------
  // Real-time Client-Side Search Logic
  // ---------------------------------------------------

  const handleSearchTermChange = (e) => {
    // Update the state on every keystroke for instant filtering
    setSearchTerm(e.target.value);
  };

  const getFilteredStudents = () => {
    if (!searchTerm.trim()) {
      return students;
    }
    const query = searchTerm.toLowerCase().trim();
    // Filters based only on student's name
    return students.filter((student) =>
      (student.name || "").toLowerCase().includes(query)
    );
  };

  const filteredStudents = getFilteredStudents();

  // ---------------------------------------------------

  // ---------------------------------------------------
  // Export to Excel Functionality
  // ---------------------------------------------------
  const exportToExcel = () => {
    if (filteredStudents.length === 0) {
      setToastMessage({ type: "error", content: "No records to export." });
      return;
    }

    // 1. Define CSV headers (DOB ADDED HERE)
    const headers = [
      "Roll No",
      "Name",
      "Mobile No",
      "Email",
      "Date of Birth",
      "Gender",
      "Caste",
      "Address",
      "10th Percentage",
      "12th Percentage",
      "Session",
      "Program",
    ];

    // Helper to format date for CSV (YYYY-MM-DD)
    const formatDateForCsv = (dateString) => {
      if (!dateString) return "N/A";
      try {
        // Ensure date is treated as UTC to prevent timezone skewing the date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "N/A";
        return date.toISOString().split("T")[0];
      } catch (e) {
        return "N/A";
      }
    };

    // 2. Map data to the defined headers
    const dataRows = filteredStudents.map((student) =>
      [
        // Ensure no commas or quotes in data that might break CSV structure
        `"${(student.rollno || "N/A").replace(/"/g, '""')}"`,
        `"${(student.name || "N/A").replace(/"/g, '""')}"`,
        `"${(student.mobile || "N/A").replace(/"/g, '""')}"`,
        `"${(student.email || "N/A").replace(/"/g, '""')}"`,
        `"${formatDateForCsv(student.dob)}"`, // DOB FORMATTED AND ADDED
        `"${(student.gender || "N/A").replace(/"/g, '""')}"`,
        `"${(student.caste || "N/A").replace(/"/g, '""')}"`,
        `"${(student.address || "N/A").replace(/"/g, '""')}"`,
        `"${student.per_10 || "0"}%"`,
        `"${student.per_12 || "0"}%"`,
        `"${(student.session_name || "N/A").replace(/"/g, '""')}"`,
        `"${(student.program_name || "N/A").replace(/"/g, '""')}"`,
      ].join(",")
    ); // Join fields with comma

    // 3. Combine headers and data rows into a single string
    const csvString = [headers.join(","), ...dataRows].join("\n"); // Join rows with newline

    // 4. Create and trigger download using Blob
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const yearName =
      academicYears.find((y) => y.year_id === selectedYearId)?.year_name ||
      "Selected";
    const progName =
      selectedProgramId !== "all"
        ? programs.find((p) => p.program_id === selectedProgramId)?.program_name
        : "All";
    const fileName = `Students_${yearName}_${progName}_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    // Using document.execCommand('copy') equivalent logic for download to prevent external file issues
    try {
      link.click();
    } catch (e) {
      // Fallback for browsers preventing click
      console.error("Manual link click failed:", e);
    }
    document.body.removeChild(link);

    setToastMessage({
      type: "success",
      content: `Exported ${filteredStudents.length} records to ${fileName}.`,
    });
  };

  // ---------------------------------------------------

  return (
    // Container is set to 'relative' for dropdown positioning and uses standard padding.
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md relative pb-2">
      <h2 className="text-2xl font-bold mb-3">Student Details</h2>

      {/* ------------------------------------------------------------- */}
      {/* 🌟 Filter and Action Controls 🌟 */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 mb-3">
        {/* Filters & Toggle Button (Left side) */}
        <div className="flex items-end gap-2 flex-wrap">
          {/* Academic Year Dropdown (Compulsory) - Added flex-shrink-0 for alignment */}
          <div className="flex flex-col w-36 flex-shrink-0">
            <label
              htmlFor="year-select"
              className="block text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              Academic Year (Required)
            </label>
            <select
              id="year-select"
              name="year"
              value={selectedYearId}
              onChange={handleFilterChange}
              // The select is given standard vertical padding (p-1.5)
              className="p-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:border-gray-400 w-full"
              disabled={isLoading}
            >
              <option value="">-- Select Year --</option>
              {academicYears.map((year) => (
                <option key={year.year_id} value={year.year_id}>
                  {year.year_name}
                </option>
              ))}
            </select>
          </div>

          {/* Program Dropdown (Optional) - Added flex-shrink-0 for alignment */}
          <div className="flex flex-col w-36 flex-shrink-0">
            <label
              htmlFor="program-select"
              className="block text-xs font-medium text-gray-700 whitespace-nowrap"
            >
              Program (Optional)
            </label>
            <select
              id="program-select"
              name="program"
              value={selectedProgramId}
              onChange={handleFilterChange}
              // The select is given standard vertical padding (p-1.5)
              className="p-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:border-gray-400 w-full"
              disabled={isLoading}
            >
              <option value="all">-- All Programs --</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program_name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Button - Removed fixed height, letting padding and 'items-end' align it */}
          <button
            onClick={handleToggleClick}
            // Button gets the same vertical padding (py-1.5) as the select inputs (p-1.5) for matching height
            className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm w-auto flex-shrink-0
                            ${
                              isToggleDisabled
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gray-500 hover:bg-gray-600"
                            }`}
            disabled={isToggleDisabled}
          >
            {isLoading
              ? "Loading..."
              : showStudentList
              ? "Hide Records"
              : "Show Records"}
          </button>
        </div>

        {/* Search Bar + Export Button Group (Right side on desktop, conditional on showStudentList) */}
        {showStudentList && (
          <div className="flex items-end gap-2 w-full md:w-auto">
            {/* Search Input: Vertical padding py-1.5 matches button/select inputs */}
            <input
              type="text"
              placeholder="Search by Student Name..."
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="w-full py-1.5 px-2 bg-white border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none flex-grow md:w-60 md:flex-grow-0"
              disabled={!showStudentList || isLoading}
            />

            {/* Export Button: Matches padding/height of toggle button and select inputs */}
            <button
              onClick={exportToExcel}
              className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm w-auto flex-shrink-0 
                                ${
                                  filteredStudents.length === 0
                                    ? "bg-green-300 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
              disabled={filteredStudents.length === 0}
            >
              Export to Excel
            </button>
          </div>
        )}
      </div>

      {/* The Conditional Student List / Loading Indicator */}
      {showStudentList && (
        <div className="mt-3">
          {isLoading ? (
            <p className="text-center text-gray-700 py-4">
              Loading student data...
            </p>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {/* Check if there are filtered students */}
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[1200px]">
                    {/* Headers */}
                    <div className="grid grid-cols-[50px_2fr_1fr_1.5fr_1fr_1fr_1.2fr_1.5fr_1fr] bg-gray-300 p-2 font-semibold text-sm">
                      <div>Sl. no.</div>
                      <div>Name</div>
                      <div>Roll No.</div>
                      <div>Program</div>
                      <div>Mobile No.</div>
                      <div>View More</div>
                      <div>Modified By</div>
                      <div>Last Modified</div>
                      <div className="text-right">Actions</div>
                    </div>

                    {/* 🌟 CHANGE HERE: Replaced max-h-96 with max-h-64 for ~7 visible rows 🌟 */}
                    <div className="max-h-64 overflow-y-auto hide-scrollbar">
                      {filteredStudents.map((student, index) => (
                        <div
                          key={student.userid}
                          className="grid grid-cols-[50px_2fr_1fr_1.5fr_1fr_1fr_1.2fr_1.5fr_1fr] items-center p-2 border-t bg-white text-sm"
                        >
                          {/* Serial Number (Auto-incremented) */}
                          <div>{index + 1}.</div>
                          {/* Name */}
                          <div className="font-semibold break-words">
                            {student.name}
                          </div>
                          {/* Roll No. */}
                          <div>{student.rollno || "N/A"}</div>
                          {/* Program Name */}
                          <div className="break-words">
                            {student.program_name || "N/A"}
                          </div>
                          {/* Mobile No. */}
                          <div>{student.mobile || "N/A"}</div>

                          {/* View More Button */}
                          <div>
                            <button
                              onClick={() => handleViewDetailsClick(student)}
                              className="bg-purple-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-purple-600 transition"
                            >
                              View Details
                            </button>
                          </div>

                          {/* Modified By */}
                          <div className="break-words pr-2">
                            {student.modified_by || "N/A"}
                          </div>

                          {/* Last Modified */}
                          <div className="whitespace-nowrap">
                            {student.mod_time
                              ? new Date(student.mod_time)
                                  .toLocaleString()
                                  .replace(" ", "\u00A0")
                              : "N/A"}
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(student)}
                              className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(student)}
                              className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // This message is for NO RECORDS found and is intentionally outside the wide table container.
                <p className="text-center text-gray-500 p-4 text-sm bg-white w-full">
                  {students.length === 0
                    ? "No Student Records found for the selected filters."
                    : `No student records found matching "${searchTerm}".`}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals (UNCHANGED) */}
      {showDetailsModal && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
      {showEditModal && selectedStudent && (
        <AdminEditStudentModal
          student={selectedStudent}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
          setToastMessage={setToastMessage}
        />
      )}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-[1000]">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              Do you really want to delete this student record? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Style for modal animation (kept here for simplicity) */}
      <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }
                .animate-fadeIn { animation: fadeIn 0.16s ease-out forwards; }

                /* --- Hide scrollbar --- */
                .hide-scrollbar {
                  -ms-overflow-style: none;  /* IE and Edge */
                  scrollbar-width: none;  /* Firefox */
                }
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;  /* Chrome, Safari, and Opera */
            }
            `}</style>
    </div>
  );
};

export default StudentTable;
