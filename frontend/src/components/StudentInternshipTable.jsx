import React, { useState, useEffect } from "react";
import api from "../api/axios";

const initialFormState = {
  company_id: "",
  semester: "",
  certificate: null,
};

const StudentInternshipTable = ({ setToastMessage, isFrozen }) => {
  const [internships, setInternships] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);

  const [formData, setFormData] = useState(initialFormState);

  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user"));

  // Fetch this student's internships
  const fetchInternships = async () => {
    try {
      // 🌟 Point to the new student-specific API
      const res = await api.get("/student-internships");
      setInternships(res.data);
    } catch (err) {
      console.error("Failed to fetch internships:", err);
      setToastMessage({
        type: "error",
        content: "Failed to load internship data.",
      });
    }
  };

  // Fetch companies for dropdowns
  const fetchCompanies = async () => {
    try {
      // Students still need to see all companies to add one
      const res = await api.get("/company");
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  useEffect(() => {
    fetchInternships();
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "certificate") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddClick = () => {
    setFormData(initialFormState);
    setShowAddModal(true);
  };

  const handleEditClick = (internship) => {
    setEditingInternship(internship);
    setFormData({
      company_id: internship.company_id,
      semester: internship.semester,
      certificate: null, // Reset file input
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (internship) => {
    setActionToConfirm(
      () => () =>
        deleteInternship(internship.internship_id, internship.company_name)
    );
    setShowConfirmModal(true);
  };

  // ADD SUBMIT
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company_id || !formData.semester || !formData.certificate) {
      setToastMessage({
        type: "error",
        content: "Company, Semester, and Certificate are all required.",
      });
      return;
    }

    const data = new FormData();
    data.append("company_id", formData.company_id);
    data.append("semester", formData.semester);
    data.append("certificate", formData.certificate);
    data.append("mod_by", user.userid);

    try {
      // Point to the new student-specific API
      await api.post("/student-internships", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowAddModal(false);
      fetchInternships(); // Refresh list
      setToastMessage({
        type: "success",
        content: "Internship added successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add internship.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  // UPDATE SUBMIT (Confirmation)
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const noChanges =
      Number(formData.company_id) === editingInternship.company_id &&
      Number(formData.semester) === editingInternship.semester &&
      !formData.certificate;

    if (noChanges) {
      setToastMessage({ type: "info", content: "No changes were made." });
      setShowEditModal(false);
      return;
    }
    setShowEditModal(false);
    setActionToConfirm(() => () => updateInternship());
    setShowConfirmModal(true);
  };

  // UPDATE ACTION
  const updateInternship = async () => {
    const data = new FormData();
    data.append("company_id", formData.company_id);
    data.append("semester", formData.semester);
    if (formData.certificate) {
      data.append("certificate", formData.certificate);
    }
    data.append("mod_by", user.userid);

    try {
      // 🌟 Point to the new student-specific API
      await api.put(
        `/student-internships/${editingInternship.internship_id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      fetchInternships(); // Refresh list
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

  // DELETE ACTION
  const deleteInternship = async (internshipId, companyName) => {
    try {
      // 🌟 Point to the new student-specific API
      await api.delete(`/student-internships/${internshipId}`);
      setInternships((prev) =>
        prev.filter((i) => i.internship_id !== internshipId)
      );
      setToastMessage({
        type: "success",
        content: `Internship at "${companyName}" has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete internship.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  // CONFIRM MODAL ACTION
  const confirmAction = () => {
    if (typeof actionToConfirm === "function") {
      actionToConfirm();
    }
    setShowConfirmModal(false);
  };

  return (
    <div className="bg-blue-200 py-4 px-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-3">My Internships</h2>

      <div className="border rounded-lg overflow-x-auto no-scrollbar">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[0.5fr_1fr_1fr_1fr_1.5fr_1fr_1fr] bg-gray-300 p-2 font-semibold text-sm">
            <div>Sl.No.</div>
            <div>Company</div>
            <div className="text-center">Semester</div>
            <div className="text-center">Certificate</div>
            <div className="text-center">Modified By</div>
            <div className="text-center">Last Modified</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="max-h-96 overflow-y-auto no-scrollbar">
            {internships.length > 0 ? (
              internships.map((internship, index) => (
                <div
                  key={internship.internship_id}
                  className="grid grid-cols-[0.5fr_1fr_1fr_1fr_1.5fr_1fr_1fr] items-center p-2 border-t bg-white text-sm"
                >
                  <div className="pl-3">{index + 1}.</div>
                  <div className="font-semibold">{internship.company_name}</div>
                  <div className="text-center">{internship.semester}</div>
                  <div className="text-center">
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
                  <div className="break-words text-center">
                    {internship.modified_by || "N/A"}
                  </div>
                  <div className="text-center">
                    {new Date(internship.mod_time).toLocaleString()}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(internship)}
                      disabled={isFrozen}
                      title={isFrozen ? "Profile is frozen" : "Edit Internship"}
                      className={`px-2 py-0.5 rounded-md text-xs text-white ${
                        isFrozen
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(internship)}
                      disabled={isFrozen}
                      title={isFrozen ? "Profile is frozen" : "Delete Internship"}
                      className={`px-2 py-0.5 rounded-md text-xs text-white ${
                        isFrozen
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-4">
                You have not added any internship records yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          disabled={isFrozen}
          title={
            isFrozen
              ? "Your profile is frozen and you cannot add internships."
              : "Add New Internship"
          }
          className={`px-4 py-2 rounded-lg shadow text-white ${
            isFrozen
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-500 hover:bg-purple-600"
          }`}
        >
          ➕ Add New Internship
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Add New Internship
            </h3>
            <form onSubmit={handleAddSubmit}>
              <div className="space-y-4">
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg"
                  required
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
                  min={1}
                  max={8}
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  placeholder="Semester (e.g., 5)"
                  className="w-full p-3 border rounded-lg"
                  required
                />
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Certificate (PDF, JPG, PNG)
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Edit Internship
            </h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="grid gap-4">
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
                    Upload New Certificate (Optional)
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              Do you really want to perform this action?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default StudentInternshipTable;
