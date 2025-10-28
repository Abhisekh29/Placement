import React, { useState, useEffect } from "react";
import api from "../api/axios";

const initialForm = {
  company_name: "",
  hr_name: "",
  company_mobile: "",
  company_email: "",
  type_id: "",
  company_description: "",
};

export default function CompanyTable({ setToastMessage }) {
  const [companies, setCompanies] = useState([]);
  const [companyTypes, setCompanyTypes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState("");
  const user = JSON.parse(sessionStorage.getItem("user"));

  const fetchCompanyTypes = async () => {
    try {
      const res = await api.get("/companyType");
      setCompanyTypes(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/adminCompany");
      setCompanies(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanyTypes().then(fetchCompanies);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddClick = () => {
    setFormData({ ...initialForm, company_mobile: "" });
    setShowAddModal(true);
  };

  const handleEditClick = (company) => {
    const matchedType = companyTypes.find(
      (t) =>
        Number(t.type_id) === Number(company.type_id) ||
        t.type_name === company.type_name
    );
    const typeIdStr = matchedType
      ? String(matchedType.type_id)
      : company.type_id
        ? String(company.type_id)
        : "";

    setEditingCompany(company);
    setFormData({
      company_name: company.company_name || "",
      hr_name: company.hr_name || "",
      company_mobile: company.company_mobile || "",
      company_email: company.company_email || "",
      type_id: typeIdStr,
      company_description: company.company_description || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (company) => {
    setShowEditModal(false);
    setActionToConfirm(
      () => () => deleteCompany(company.company_id, company.company_name)
    );
    setShowConfirmModal(true);
  };

  const validateAndSubmit = (e, handler) => {
    e.preventDefault();
    const phonePattern = /^\+\d{1,4}\d{6,14}$/;
    if (
      formData.company_mobile &&
      !phonePattern.test(formData.company_mobile)
    ) {
      setToastMessage({
        type: "error",
        content: "Invalid phone format. Use +<country_code><number>.",
      });
      return;
    }
    handler(e);
  };

  const handleAddCompany = async () => {
    // Frontend validation for required fields
    if (!formData.company_name.trim() || !formData.type_id) {
      setToastMessage({
        type: "error",
        content: "Company Name and Type are required.",
      });
      return;
    }

    // Optional: Frontend phone number validation
    const phonePattern = /^\+\d{1,4}\d{6,14}$/;
    if (
      formData.company_mobile &&
      !phonePattern.test(formData.company_mobile)
    ) {
      setToastMessage({
        type: "error",
        content: "Invalid phone format. Use +<country_code><number> (e.g., +919876543210).",
      });
      return;
    }

    try {
      // Send the request to the backend
      await api.post("/adminCompany", {
        ...formData,
        type_id: Number(formData.type_id),
        mod_by: user.userid,
      });

      // On Success
      setShowAddModal(false);
      setFormData(initialForm);
      fetchCompanies(); // Refresh the list of companies
      setToastMessage({
        type: "success",
        content: "New company added successfully.",
      });

    } catch (err) {
      // --- This is the crucial error handling part ---
      let errorMessage = "Failed to add company."; // A default error message

      if (err.response) {
        // If the server responded with an error
        if (err.response.status === 409 && err.response.data?.message) {
          // This handles the "duplicate entry" error from the backend
          errorMessage = err.response.data.message;
        } else if (err.response.data?.message) {
          // This handles any other structured error message from the backend
          errorMessage = err.response.data.message;
        } else if (err.response.status === 500){
            errorMessage = "An internal server error occurred. Please try again later.";
        }
      } else {
        // This handles network errors where the server couldn't be reached
        errorMessage = err.message || "Network error or request failed.";
      }
      
      // Finally, display the determined error message in the toast
      setToastMessage({ type: "error", content: errorMessage });
    }
};
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!editingCompany) return;

    const originalTypeId =
      editingCompany.type_id ??
      companyTypes.find((t) => t.type_name === editingCompany.type_name)
        ?.type_id;

    const noChanges =
      formData.company_name.trim() === (editingCompany.company_name || "") &&
      formData.hr_name.trim() === (editingCompany.hr_name || "") &&
      formData.company_mobile.trim() ===
      (editingCompany.company_mobile || "") &&
      formData.company_email.trim() === (editingCompany.company_email || "") &&
      Number(formData.type_id) === Number(originalTypeId) &&
      formData.company_description.trim() ===
      (editingCompany.company_description || "");

    if (noChanges) {
      setToastMessage({ type: "error", content: "No changes were made." });
      setShowEditModal(false);
      return;
    }

    setShowEditModal(false);
    setActionToConfirm(() => () => updateCompany());
    setShowConfirmModal(true);
  };

  const updateCompany = async () => {
    try {
      await api.put(`/adminCompany/${editingCompany.company_id}`, {
        ...formData,
        type_id: Number(formData.type_id),
        mod_by: user.userid,
      });
      fetchCompanies();
      setEditingCompany(null);
      setFormData(initialForm);
      setToastMessage({
        type: "success",
        content: "Company updated successfully.",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update company.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const deleteCompany = async (companyId, companyName) => {
    try {
      await api.delete(`/adminCompany/${companyId}`);
      setCompanies((prev) => prev.filter((c) => c.company_id !== companyId));
      setToastMessage({
        type: "success",
        content: `"${companyName}" has been deleted.`,
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete company.";
      setToastMessage({ type: "error", content: errorMessage });
    }
  };

  const confirmAction = () => {
    if (actionToConfirm) actionToConfirm();
    setShowConfirmModal(false);
  };

  return (
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-3">Companies</h2>
      <div className="border rounded-lg overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="grid grid-cols-8 bg-gray-300 p-2 font-semibold text-sm">
            <div className="col-span-1">Company Name</div>
            <div>HR Name</div>
            <div>Contact</div>
            <div>Type</div>
            <div>Description</div>
            <div>Modified By</div>
            <div>Last Modified</div>
            <div className="text-right">Actions</div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {companies.length > 0 ? (
              companies.map((company) => (
                <div
                  key={company.company_id}
                  className="grid grid-cols-8 items-center p-2 border-t bg-white text-sm"
                >
                  <div className="font-semibold col-span-1">
                    {company.company_name}
                  </div>
                  <div>{company.hr_name || "N/A"}</div>
                  <div>
                    <p>{company.company_mobile}</p>
                    <p className="text-xs text-gray-600">
                      {company.company_email}
                    </p>
                  </div>
                  <div>{company.type_name}</div>

                  {/* Description with click */}
                  <div
                    className="break-words pr-6 cursor-pointer hover:underline"
                    title="Click to view full description"
                    onClick={() => {
                      setSelectedDescription(
                        company.company_description || "—"
                      );
                      setShowDescriptionModal(true);
                    }}
                  >
                    {company.company_description
                      ? company.company_description.slice(0, 50) +
                      (company.company_description.length > 50 ? "..." : "")
                      : "—"}
                  </div>

                  <div className="break-words pr-6">
                    {company.modified_by || "N/A"}
                  </div>
                  <div>
                    {company.mod_time
                      ? new Date(company.mod_time).toLocaleString()
                      : "N/A"}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(company)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-blue-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(company)}
                      className="bg-red-500 text-white px-2 py-0.5 rounded-md text-xs hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-2 text-sm">
                No companies found.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-right">
        <button
          onClick={handleAddClick}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition"
        >
          ➕ Add New Company
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Add New Company
            </h3>
            <form onSubmit={(e) => validateAndSubmit(e, handleAddCompany)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  name="hr_name"
                  value={formData.hr_name}
                  onChange={handleInputChange}
                  placeholder="HR Name"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="tel"
                  name="company_mobile"
                  value={formData.company_mobile}
                  onChange={handleInputChange}
                  placeholder="+919876543210"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Company Type</option>
                  {companyTypes.map((type) => (
                    <option key={type.type_id} value={String(type.type_id)}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
                <textarea
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleInputChange}
                  placeholder="Company Description"
                  rows="3"
                  className="w-full md:col-span-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData(initialForm);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
                >
                  Add Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Edit Company
            </h3>
            <form onSubmit={(e) => validateAndSubmit(e, handleUpdateSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  name="hr_name"
                  value={formData.hr_name}
                  onChange={handleInputChange}
                  placeholder="HR Name"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="tel"
                  name="company_mobile"
                  value={formData.company_mobile}
                  onChange={handleInputChange}
                  placeholder="+911234567890"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="email"
                  name="company_email"
                  value={formData.company_email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <select
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Company Type</option>
                  {companyTypes.map((type) => (
                    <option key={type.type_id} value={String(type.type_id)}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
                <textarea
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleInputChange}
                  placeholder="Company Description"
                  rows="3"
                  className="w-full md:col-span-2 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCompany(null);
                    setFormData(initialForm);
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
                >
                  Update Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              Do you really want to proceed with this action? This cannot be
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
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-brightness-75 z-50 p-4">
          <div className="bg-white w-full max-w-lg md:max-w-4xl lg:max-w-5xl rounded-xl shadow-2xl p-6 animate-fadeIn relative max-h-[90vh] flex flex-col">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Company Description
            </h3>
            <div className="text-gray-700 whitespace-pre-wrap break-words overflow-y-auto flex-1">
              {selectedDescription}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }`}
      </style>
    </div>
  );
}
