import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { debounce } from "lodash";

const initialFormState = {
  user_id: "",
  company_id: "",
  semester: "",
  certificate: null,
};

const InternshipTable = ({ setToastMessage }) => {
  const [internships, setInternships] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [searchedStudents, setSearchedStudents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState(initialFormState);
  const [filters, setFilters] = useState({
    deptId: "",
    progId: "",
    searchTerm: "",
  });

  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));

  // Fetch internships
  const fetchInternships = async () => {
    try {
      const res = await api.get("/internships");
      setInternships(res.data);
    } catch (err) {
      console.error("Failed to fetch internships:", err);
    }
  };

  // Fetch initial modal data
  const fetchInitialData = async () => {
    try {
      const [studentsRes, companiesRes, deptsRes] = await Promise.all([
        api.get("/student_master/list/all"),
        api.get("/adminCompany"),
        api.get("/filters/departments"),
      ]);
      setAllStudents(studentsRes.data);
      setCompanies(companiesRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error("Failed to fetch initial data for modals:", err);
    }
  };

  useEffect(() => {
    fetchInternships();
    fetchInitialData();
  }, []);

  // Fetch programs when department changes
  useEffect(() => {
    const fetchPrograms = async () => {
      if (filters.deptId) {
        try {
          const res = await api.get(`/filters/programs/${filters.deptId}`);
          setPrograms(res.data);
        } catch (err) {
          setPrograms([]);
          console.error("Failed to fetch programs:", err);
        }
      } else {
        setPrograms([]);
      }
    };
    fetchPrograms();
    setFilters((prev) => ({ ...prev, progId: "", searchTerm: "" }));
    setSearchedStudents([]);
  }, [filters.deptId]);

  // Debounced student search
  useEffect(() => {
    const handler = debounce(async (progId, searchTerm) => {
      if (!progId || !searchTerm.trim()) {
        setSearchedStudents([]);
        return;
      }
      try {
        const res = await api.get("/filters/students/search", {
          params: { progId: Number(progId), searchTerm: searchTerm.trim() },
        });
        setSearchedStudents(res.data);
      } catch (err) {
        console.error("Failed to search students:", err);
      }
    }, 400);

    handler(filters.progId, filters.searchTerm);
    return () => handler.cancel();
  }, [filters.progId, filters.searchTerm]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "certificate") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData(initialFormState);
    setFilters({ deptId: "", progId: "", searchTerm: "" });
    setSearchedStudents([]);
    setShowAddModal(true);
  };

  const handleEditClick = (internship) => {
    setEditingInternship(internship);
    setFormData({
      user_id: internship.user_id,
      company_id: internship.company_id,
      semester: internship.semester,
      certificate: null,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (internship) => {
    setActionToConfirm(
      () => () =>
        deleteInternship(internship.internship_id, internship.student_name)
    );
    setShowConfirmModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id || !formData.company_id || !formData.semester) {
      setToastMessage({
        type: "error",
        content: "Student, Company, Semester and Certificate are required.",
      });
      return;
    }
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    data.append("mod_by", user.userid);

    try {
      await api.post("/internships", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowAddModal(false);
      fetchInternships();
      setToastMessage({
        type: "success",
        content: "Internship added successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add internship. All fields are required.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const confirmAction = () => {
    if (typeof actionToConfirm === "function") {
      actionToConfirm();
    }
    setShowConfirmModal(false);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const noChanges =
      Number(formData.user_id) === editingInternship.user_id &&
      Number(formData.company_id) === editingInternship.company_id &&
      Number(formData.semester) === editingInternship.semester &&
      !formData.certificate;

    if (noChanges) {
      setToastMessage({ type: "error", content: "No changes were made." });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);
    setActionToConfirm(() => () => updateInternship());
    setShowConfirmModal(true);
  };

  const updateInternship = async () => {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== "certificate" || formData.certificate) {
        data.append(key, formData[key]);
      }
    });
    data.append("mod_by", user.userid);

    try {
      await api.put(`/internships/${editingInternship.internship_id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchInternships();
      setToastMessage({
        type: "success",
        content: "Internship updated successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update internship.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const deleteInternship = async (internshipId, studentName) => {
    try {
      await api.delete(`/internships/${internshipId}`);
      setInternships((prev) =>
        prev.filter((i) => i.internship_id !== internshipId)
      );
      setToastMessage({
        type: "success",
        content: `Internship for "${studentName}" has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete internship.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  return (
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Student Internships</h2>

        {/* Search Box */}
        <input
          type="text"
          placeholder="Search for student, company, semester..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-72 h-8 p-2 bg-blue-50 border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-7 bg-gray-300 p-2 font-semibold text-sm">
            <div>Student Name</div>
            <div>Company</div>
            <div>Semester</div>
            <div>Certificate</div>
            <div>Modified By</div>
            <div>Last Modified</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {/* Filtered Results */}
            {(() => {
              // 🔎 Filtered internships with logging
              const filteredInternships = internships.filter((internship) => {
                if (!searchQuery.trim()) return true;

                const q = searchQuery.toLowerCase().trim();
                const student = (internship.student_name || "")
                  .toLowerCase()
                  .trim();
                const company = (internship.company_name || "")
                  .toLowerCase()
                  .trim();
                const semester = String(internship.semester || "").trim();

                // console.log("Filtering:", {
                //   searchQuery: q,
                //   student,
                //   company,
                //   semester,
                //   studentMatch: student.includes(q),
                //   companyMatch: company.includes(q),
                //   semesterMatch: semester.includes(q),
                // });

                return (
                  student.includes(q) ||
                  company.includes(q) ||
                  semester.includes(q)
                );
              });

              if (filteredInternships.length === 0) {
                return (
                  <div className="text-center text-gray-600 py-4 font-medium">
                    ❌ No records found matching "{searchQuery}"
                  </div>
                );
              }

              return filteredInternships.map((internship) => (
                <div
                  key={internship.internship_id}
                  className="grid grid-cols-7 items-center p-2 border-t bg-white text-sm"
                >
                  <div className="font-semibold">{internship.student_name}</div>
                  <div>{internship.company_name}</div>
                  <div>{internship.semester}</div>
                  <div>
                    {internship.certificate ? (
                      <a
                        href={`http://localhost:8000/uploads/certificates/${internship.certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                  <div className="break-words pr-6">
                    {internship.modified_by || "N/A"}
                  </div>
                  <div>{new Date(internship.mod_time).toLocaleString()}</div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(internship)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(internship)}
                      className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600"
        >
          ➕ Add New Internship
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Add New Internship
            </h3>
            <form onSubmit={handleAddSubmit}>
              <div className="space-y-4">
                {/* Department + Program */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    name="deptId"
                    value={filters.deptId}
                    onChange={handleFilterChange}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">1. Select Department</option>
                    {departments.map((d) => (
                      <option key={d.department_id} value={d.department_id}>
                        {d.department_name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="progId"
                    value={filters.progId}
                    onChange={handleFilterChange}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">2. Select Program</option>
                    {programs.map((p) => (
                      <option key={p.program_id} value={p.program_id}>
                        {p.program_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 🔄 Unified Search + Select */}
                <div className="relative">
                  <input
                    type="text"
                    name="searchTerm"
                    placeholder="Search student by name or roll no..."
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    className="w-full p-3 border rounded-lg"
                    disabled={!filters.progId}
                  />
                  {searchedStudents.length > 0 && filters.searchTerm && (
                    <ul className="absolute z-10 bg-white border rounded-lg mt-1 w-full max-h-48 overflow-y-auto shadow-md">
                      {searchedStudents.map((s) => (
                        <li
                          key={s.userid}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              user_id: s.userid,
                            }));
                            setFilters((prev) => ({
                              ...prev,
                              searchTerm: `${s.name} (${s.rollno})`,
                            }));
                            setSearchedStudents([]); // close dropdown
                          }}
                          className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                            formData.user_id === s.userid ? "bg-gray-200" : ""
                          }`}
                        >
                          {s.name} ({s.rollno})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Company */}
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                  required
                >
                  <option value="">3. Select Company</option>
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>

                {/* Semester */}
                <input
                  type="number"
                  min={1}
                  max={8}
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  placeholder="Semester"
                  className="w-full p-3 border rounded-lg"
                  required
                />

                {/* Certificate */}
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {showAddModal
                    ? "Certificate (PDF, JPG, JPEG, PNG)"
                    : "Upload New Certificate (Optional)"}
                </label>
                <input
                  type="file"
                  name="certificate"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleInputChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>

              <div className="flex justify-end mt-6 gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Edit Internship
            </h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="grid gap-4">
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Student</option>
                  {allStudents.map((s) => (
                    <option key={s.userid} value={s.userid}>
                      {s.name} ({s.rollno})
                    </option>
                  ))}
                </select>
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Company</option>
                  {companies.map((c) => (
                    <option key={c.company_id} value={c.company_id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  placeholder="Semester"
                  className="w-full p-3 border rounded-lg"
                />
                <div>
                  <label className="block text-sm font-medium">
                    Certificate (Optional)
                  </label>
                  <input
                    type="file"
                    name="certificate"
                    onChange={handleInputChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {editingInternship && editingInternship.certificate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Current Certificate:{" "}
                      <a
                        href={`http://localhost:8000/uploads/certificates/${editingInternship.certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline ml-1"
                      >
                        View
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white"
                >
                  Update Internship
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Action
            </h3>
            <p className="mb-6">
              Are you sure you want to perform this action?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipTable;
