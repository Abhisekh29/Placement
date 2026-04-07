import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";

const PlacementTable = ({ setToastMessage }) => {
  const [placements, setPlacements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [selectedPlacement, setSelectedPlacement] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [formData, setFormData] = useState({
    is_selected: "Pending",
    role: "",
    place: "",
    ctc: "",
    offerletter_file_name: null,
  });

  // Fetch all placements
  const fetchPlacements = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/admin/placements");
      setPlacements(res.data || []);
    } catch (err) {
      console.error("Failed to fetch placements:", err);
      setToastMessage({ type: "error", content: "Failed to load placement records." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter & Pagination Logic
  const filteredPlacements = useMemo(() => {
    return placements.filter((p) => {
      const searchStr = searchQuery.toLowerCase();
      const matchesSearch =
        (p.name && p.name.toLowerCase().includes(searchStr)) ||
        (p.drive_name && p.drive_name.toLowerCase().includes(searchStr)) ||
        (p.company_name && p.company_name.toLowerCase().includes(searchStr)) ||
        (p.program_name && p.program_name.toLowerCase().includes(searchStr));
      
      const matchesStatus = statusFilter === "All" || p.is_selected === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [placements, searchQuery, statusFilter]);

  const totalPlacements = filteredPlacements.length;
  const totalPages = limit === "all" ? 1 : Math.ceil(totalPlacements / limit);
  const serialNoOffset = limit === "all" || currentPage === 1 ? 0 : (currentPage - 1) * limit;

  const paginatedPlacements = useMemo(() => {
    if (limit === "all") return filteredPlacements;
    const startIndex = (currentPage - 1) * limit;
    return filteredPlacements.slice(startIndex, startIndex + limit);
  }, [filteredPlacements, currentPage, limit]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, limit]);

  const handlePaginationFilterChange = (e) => {
    const val = e.target.value;
    setLimit(val === "all" ? "all" : Number(val));
  };

  // Click Handlers
  const handleViewDetailsClick = (placement) => {
    setSelectedPlacement(placement);
    setShowDetailsModal(true);
  };

  const handleEditClick = (placement) => {
    setSelectedPlacement(placement);
    setFormData({
      is_selected: placement.is_selected || "Pending",
      role: placement.role || "",
      place: placement.place || "",
      ctc: placement.ctc || "",
      offerletter_file_name: null,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (placement) => {
    setActionToConfirm(() => () => deletePlacement(placement.user_id, placement.drive_id));
    setShowConfirmModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "offerletter_file_name") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlacement) return;

    // Validation for "Yes" Status
    if (formData.is_selected === "Yes") {
      const missingFields = [];
      if (!formData.role?.trim()) missingFields.push("Role");
      if (!formData.place?.trim()) missingFields.push("Place");
      if (!formData.ctc) missingFields.push("CTC");
      if (!formData.offerletter_file_name && !selectedPlacement.offerletter_file_name) {
        missingFields.push("Offer Letter");
      }

      if (missingFields.length > 0) {
        setToastMessage({
          type: "error",
          content: `${missingFields.join(", ")} required for Selected status.`,
        });
        return;
      }
    }

    // Build FormData
    const data = new FormData();
    data.append("is_selected", formData.is_selected);
    data.append("role", formData.role);
    data.append("place", formData.place);
    data.append("ctc", formData.ctc);
    if (formData.offerletter_file_name) {
      data.append("offerletter_file_name", formData.offerletter_file_name);
    }

    try {
      await api.put(`/admin/placements/${selectedPlacement.user_id}/${selectedPlacement.drive_id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setToastMessage({ type: "success", content: "Placement updated successfully!" });
      setShowEditModal(false);
      fetchPlacements();
    } catch (err) {
      setToastMessage({ type: "error", content: err.response?.data?.message || "Failed to update placement." });
    }
  };

  const deletePlacement = async (userId, driveId) => {
    try {
      await api.delete(`/admin/placements/${userId}/${driveId}`);
      setToastMessage({ type: "success", content: "Placement record deleted successfully." });
      setShowConfirmModal(false);
      fetchPlacements();
    } catch (err) {
      setToastMessage({ type: "error", content: err.response?.data?.message || "Failed to delete placement." });
      setShowConfirmModal(false);
    }
  };

  const confirmAction = () => {
    if (typeof actionToConfirm === "function") {
      actionToConfirm();
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (paginatedPlacements.length === 0) {
      setToastMessage({ type: "error", content: "No records to export." });
      return;
    }

    const headers = [
      "Student Name", "Company", "Drive Name", "Session", "Program", "Status", "Modified By", "Last Modified"
    ];

    const dataRows = paginatedPlacements.map((p) =>
      [
        `"${(p.name || "N/A").replace(/"/g, '""')}"`,
        `"${(p.company_name || "N/A").replace(/"/g, '""')}"`,
        `"${(p.drive_name || "N/A").replace(/"/g, '""')}"`,
        `"${(p.session_name || "N/A").replace(/"/g, '""')}"`,
        `"${(p.program_name || "N/A").replace(/"/g, '""')}"`,
        `"${p.is_selected}"`,
        `"${(p.modified_by || "N/A").replace(/"/g, '""')}"`,
        `"${new Date(p.mod_time).toLocaleString()}"`,
      ].join(",")
    );

    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = `Placements_Page${currentPage}_${new Date().toISOString().split("T")[0]}.csv`;

    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage({ type: "success", content: `Exported ${paginatedPlacements.length} records.` });
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Yes": return <span className="font-semibold text-green-600">Selected</span>;
      case "Pending": return <span className="font-semibold text-orange-500">Pending</span>;
      default: return <span className="font-semibold text-red-600">Not Selected</span>;
    }
  };

  // --- GRID LAYOUT CONSTANT ---
  const gridLayout = "grid-cols-[0.5fr_1.5fr_1.5fr_1.5fr_1fr_1.2fr_0.8fr_0.8fr_1fr]";

  return (
    <div className="bg-blue-200 py-2 px-4 rounded-xl shadow-md">
      
      {/* Search Bar & Export */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-2xl font-bold">Student Placements</h2>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search name, drive, company.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 h-8 p-2 bg-white border rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-3 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200"
          >
            <option value="All">All Statuses</option>
            <option value="Yes">Selected</option>
            <option value="Pending">Pending</option>
            <option value="No">Not Selected</option>
          </select>
          <button
            onClick={exportToExcel}
            className={`px-3 h-8 rounded-lg text-white text-xs transition shadow-sm w-auto flex-shrink-0 
              ${paginatedPlacements.length === 0 ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
            disabled={paginatedPlacements.length === 0}
          >
            Export Page
          </button>
        </div>
      </div>

      {/* Pagination Controls */}
      {!isLoading && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-2 text-sm">
          <div className="flex items-center gap-2">
            <label htmlFor="limit-select" className="text-gray-700">Records per page:</label>
            <select id="limit-select" value={limit} onChange={handlePaginationFilterChange} className="p-1 border rounded-lg text-xs bg-white focus:outline-none">
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="all">All</option>
            </select>
            {limit !== "all" && (
              <span className="text-gray-600">
                Showing {Math.min(serialNoOffset + 1, totalPlacements)} - {Math.min(serialNoOffset + paginatedPlacements.length, totalPlacements)} of {totalPlacements}
              </span>
            )}
          </div>
          {limit !== "all" && (
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <span className="font-semibold">Page {currentPage} of {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}

      {/* Table Layout */}
      <div className="max-h-[60vh] border rounded-lg overflow-x-auto no-scrollbar">
        <div className="min-w-[1500px]">
          
          {/* Header */}
          <div className={`grid ${gridLayout} bg-gray-300 p-2 font-semibold text-sm`}>
            <div className="pl-1">Sl. No.</div>
            <div>Student Name</div>
            <div className="pr-2">Company</div>
            <div>Drive Name</div>
            <div className="text-center">Session</div>
            <div className="text-center">Program</div>
            <div className="text-center">Status</div>
            <div className="text-center">Details</div>
            <div className="text-right pr-2">Actions</div>
          </div>
          
          {/* Body */}
          <div className="overflow-y-auto no-scrollbar">
            {isLoading ? (
              <p className="text-center text-gray-700 p-4">Loading data...</p>
            ) : paginatedPlacements.length > 0 ? (
              paginatedPlacements.map((placement, index) => (
                <div
                  key={`${placement.user_id}-${placement.drive_id}`}
                  className={`grid ${gridLayout} items-center p-2 border-t bg-white hover:bg-gray-50 transition text-sm`}
                >
                  <div className="pl-1 text-gray-500">{serialNoOffset + index + 1}.</div>
                  <div className="font-semibold text-gray-800 break-words pr-2">{placement.name}</div>
                  <div className="text-gray-700 break-words pr-2">{placement.company_name}</div>
                  <div className="text-gray-800 break-words pr-2">{placement.drive_name}</div>
                  <div className="text-center text-gray-600">{placement.session_name || "N/A"}</div>
                  <div className="text-center text-gray-600">{placement.program_name || "N/A"}</div>
                  <div className="text-center">{getStatusText(placement.is_selected)}</div>
                  <div className="text-center">
                    <button
                      onClick={() => handleViewDetailsClick(placement)}
                      className="text-blue-500 hover:underline text-xs"
                    >
                      View
                    </button>
                  </div>
                  <div className="flex justify-end gap-2 pr-2">
                    <button
                      onClick={() => handleEditClick(placement)}
                      className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs hover:bg-blue-600 transition shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(placement)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md text-xs hover:bg-red-600 transition shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 p-4 text-sm">
                No placement records found matching your filters.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPlacement && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[1000] p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
              Details for: {selectedPlacement.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-500">Modified By</p>
                <p className="text-base text-gray-800">
                  {selectedPlacement.modified_by || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Last Modified</p>
                <p className="text-base text-gray-800">
                  {selectedPlacement.mod_time ? new Date(selectedPlacement.mod_time).toLocaleString() : "N/A"}
                </p>
              </div>
              {selectedPlacement.offerletter_file_name && (
                <div className="md:col-span-2 mt-2 pt-4 border-t">
                  <a 
                    href={`http://localhost:8000/uploads/offer_letters/${selectedPlacement.offerletter_file_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    📄 View Offer Letter
                  </a>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedPlacement && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 animate-fadeIn relative">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Edit Placement Status</h3>
            <form onSubmit={handleUpdateSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selection Status</label>
                  <select name="is_selected" value={formData.is_selected} onChange={handleFormChange} className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                    <option value="Pending">Pending</option>
                    <option value="Yes">Selected</option>
                    <option value="No">Not Selected</option>
                  </select>
                </div>
                {formData.is_selected === "Yes" && (
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <input type="text" name="role" value={formData.role} onChange={handleFormChange} placeholder="e.g., Software Engineer" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Place</label>
                      <input type="text" name="place" value={formData.place} onChange={handleFormChange} placeholder="e.g., Bangalore" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CTC (in LPA)</label>
                      <input type="number" step="0.01" name="ctc" value={formData.ctc} onChange={handleFormChange} placeholder="e.g., 12.5" className="w-full p-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Offer Letter (PDF, JPG, PNG)</label>
                      <input
                        type="file"
                        name="offerletter_file_name"
                        onChange={handleFormChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                      {selectedPlacement.offerletter_file_name && (
                        <p className="text-xs text-gray-500 mt-2">
                          Current Offer Letter:{" "}
                          <a
                            href={`http://localhost:8000/uploads/offer_letters/${selectedPlacement.offerletter_file_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition font-medium shadow-md">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 animate-fadeIn">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Are you sure?</h3>
            <p className="text-gray-600 mb-6">Do you really want to delete this placement record? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={confirmAction} className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default PlacementTable;