import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { debounce } from "lodash";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

// --- Simple Description Modal ---
const DescriptionModal = ({ content, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-1100 p-4">
    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl p-6 animate-fadeIn relative max-h-[85vh] flex flex-col">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4 shrink-0">
        Drive Description
      </h3>
      <div className="text-gray-700 whitespace-pre-wrap wrap-break-word overflow-y-auto no-scrollbar flex-1 min-h-0">
        {content || "No description provided."}
      </div>
      <div className="flex justify-end mt-4 shrink-0">
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

const PlacementDriveReportTable = ({ setToastMessage }) => {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // --- New filter for Active/Non-Active ---
  const [isActiveFilter, setIsActiveFilter] = useState("all"); // 'all', '1', '0'

  // --- State for column filters ---
  const [filters, setFilters] = useState({
    drive_name: "",
    company_name: "",
    ctc: "",
    count_apply: "",
    count_selected: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // --- Description Modal State ---
  const [showDescModal, setShowDescModal] = useState(false);
  const [selectedDesc, setSelectedDesc] = useState("");

  // --- Pagination State ---
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Academic Years
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const res = await api.get("/academic-year");
        setAcademicYears(res.data);
      } catch (err) {
        console.error("Failed to fetch academic years:", err);
        setToastMessage({
          type: "error",
          content: "Failed to load academic years.",
        });
      }
    };
    fetchAcademicYears();
  }, [setToastMessage]);

  // Debounce filter inputs
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1);
    }, 100);
    handler();
    return () => handler.cancel();
  }, [filters]);

  // Main data fetch function
  const fetchData = useCallback(async () => {
    if (!showTable || !selectedYearId) {
      setData([]);
      return;
    }
    setIsLoading(true);
    try {
      const params = {
        yearId: selectedYearId,
        isActive: isActiveFilter,
        driveName: debouncedFilters.drive_name,
        companyName: debouncedFilters.company_name,
        ctc: debouncedFilters.ctc,
        countApply: debouncedFilters.count_apply,
        countSelected: debouncedFilters.count_selected,
      };
      const res = await api.get("/reports/placement-drive-stats", { params });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch report data:", err);
      setToastMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to load report data.",
      });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    showTable,
    selectedYearId,
    isActiveFilter,
    debouncedFilters,
    setToastMessage,
  ]);

  // Fetch data when relevant state changes
  useEffect(() => {
    if (showTable && selectedYearId) {
      fetchData();
    } else {
      setData([]);
    }
  }, [fetchData, showTable, selectedYearId, isActiveFilter]);

  // --- Pagination Logic ---
  const paginatedData = useMemo(() => {
    if (rowsPerPage === "all") return data;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + parseInt(rowsPerPage, 10);
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, rowsPerPage]);

  const totalPages =
    rowsPerPage === "all" ? 1 : Math.ceil(data.length / rowsPerPage);
  const serialNoOffset =
    rowsPerPage === "all" || currentPage === 1
      ? 0
      : (currentPage - 1) * rowsPerPage;

  // --- Helpers ---
  const formatCTC = (ctc) => {
    const val = parseFloat(ctc);
    // Uses the Rupee symbol (₹) directly
    return isNaN(val) ? "N/A" : `₹${val.toFixed(2)} LPA`;
  };

  const handleDescriptionClick = (desc) => {
    setSelectedDesc(desc);
    setShowDescModal(true);
  };

  // --- Event Handlers ---
  const handleYearChange = (e) => {
    setSelectedYearId(e.target.value);
    if (!e.target.value) setShowTable(false);
    setData([]);
    setCurrentPage(1);
    setRowsPerPage(10);
    setFilters({
      drive_name: "",
      company_name: "",
      ctc: "",
      count_apply: "",
      count_selected: "",
    });
    setIsActiveFilter("all");
  };

  const handleToggleTableClick = () => {
    if (!showTable && !selectedYearId) {
      setToastMessage({
        type: "error",
        content: "Please select an Academic Year first.",
      });
      return;
    }
    setShowTable(!showTable);
    setCurrentPage(1);
    if (!showTable) setData([]); // Clear when hiding
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(e.target.value);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // --- Export to Excel (UPDATED to export only current page) ---
  const handleExportExcel = useCallback(() => {
    // Use paginatedData instead of data to export only what's visible
    const dataToExport = paginatedData;

    if (dataToExport.length === 0) {
      setToastMessage({ type: "error", content: "No data to export." });
      return;
    }
    setIsExporting(true);

    const headers = [
      "Sl. No.",
      "Drive Name",
      "Company Name",
      "CTC (LPA)",
      "Status",
      "Description",
      "Count Apply",
      "Count Selected",
    ];

    const dataRows = dataToExport.map((item, index) =>
      [
        // Calculate correct serial number based on current page
        `"${serialNoOffset + index + 1}"`,
        `"${(item.drive_name || "N/A").replace(/"/g, '""')}"`,
        `"${(item.company_name || "N/A").replace(/"/g, '""')}"`,
        `"${item.ctc || 0}"`,
        `"${item.is_active === "1" ? "Active" : "Closed"}"`,
        `"${(item.description || "N/A").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        `"${item.count_apply || 0}"`,
        `"${item.count_selected || 0}"`,
      ].join(",")
    );

    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const yearName =
      academicYears.find(
        (y) => y.year_id.toString() === selectedYearId.toString()
      )?.year_name || "Report";

    link.setAttribute("href", url);
    // Added page number to filename for clarity
    link.setAttribute(
      "download",
      `Drive_Stats_${yearName}_Page${currentPage}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsExporting(false);
    setToastMessage({
      type: "success",
      content: `Exported ${dataToExport.length} records from page ${currentPage}.`,
    });
  }, [
    paginatedData, // Changed dependency from data to paginatedData
    academicYears,
    selectedYearId,
    setToastMessage,
    currentPage, // Added currentPage as dependency
    serialNoOffset, // Added serialNoOffset as dependency
  ]);

  return (
    <div>
      {/* --- Top Controls Row --- */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2 no-scrollbar">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label
            htmlFor="year-select-report"
            className="text-sm font-medium text-gray-700 whitespace-nowrap"
          >
            Academic Year :
          </label>
          {/* --- Custom Scrollable Dropdown (Updated Syntax) --- */}
          <div className="w-43 shrink-0">
            <Listbox
              value={selectedYearId}
              onChange={(newYearId) => {
                // Create a fake event object to pass to your existing handler
                const fakeEvent = { target: { value: newYearId } };
                handleYearChange(fakeEvent);
              }}
            >
              <div className="relative">
                {/* This is the box you see */}
                <ListboxButton className="relative w-full h-8 px-3 py-1.5 text-left bg-white border rounded-lg text-xs shadow-none focus:outline-none focus:border-gray-400">
                  <span className="block truncate">
                    {selectedYearId
                      ? academicYears.find(
                        (y) => y.year_id.toString() === selectedYearId.toString()
                      )?.year_name
                      : "-- Select Academic Year --"}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <FaChevronDown
                      className="w-2.5 h-2.5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </ListboxButton>

                {/* THIS IS THE DROPDOWN MENU YOU WANTED TO STYLE. */}
                <div className="overflow-hidden">
                  <ListboxOptions className="absolute w-full mt-1 border overflow-auto text-xs bg-white rounded-md shadow-lg max-h-25  focus:outline-none z-50">
                    {academicYears.map((year) => (
                      <ListboxOption
                        key={year.year_id}
                        value={year.year_id}
                        className={({ focus }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${focus ? "bg-gray-100 text-gray-900" : "text-gray-900"
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={`block truncate ${selected ? "font-medium" : "font-normal"
                                }`}
                            >
                              {year.year_name}
                            </span>
                            {selected ? (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                                <FaCheck className="w-3 h-3" aria-hidden="true" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </div>
            </Listbox>
          </div>
          {/* --- End of Custom Dropdown --- */}
          <button
            onClick={handleToggleTableClick}
            disabled={!selectedYearId || isLoading}
            className={`px-3 py-1.5 rounded-lg text-white text-xs w-24 text-center transition shadow-sm shrink-0 ${!selectedYearId
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gray-500 hover:bg-gray-600"
              }`}
          >
            {isLoading ? "Loading..." : showTable ? "Hide Table" : "Show Table"}
          </button>
        </div>

        {showTable && (
          <button
            onClick={handleExportExcel}
            disabled={isLoading || isExporting}
            className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm self-end sm:self-auto ${isLoading || isExporting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {isExporting ? "Exporting..." : "Export to Excel"}
          </button>
        )}
      </div>

      {/* --- Table Container --- */}
      {showTable && (
        <div>
          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm mb-2">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 text-sm">Records per page:</label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="p-1 border rounded-lg text-xs bg-white focus:outline-none focus:border-gray-400"
              >
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
              {rowsPerPage !== "all" && (
                <span className="text-gray-600">
                  Showing {Math.min(serialNoOffset + 1, data.length)} -{" "}
                  {Math.min(serialNoOffset + paginatedData.length, data.length)}{" "}
                  of {data.length}
                </span>
              )}
              {rowsPerPage === "all" && (
                <span className="text-gray-600">
                  Showing all {data.length} records
                </span>
              )}
            </div>
            {rowsPerPage !== "all" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-2 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <span className="font-semibold">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-2 py-1 bg-white border rounded-lg shadow-sm text-xs hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Filters & Table */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[1100px]">
              {/* Filters Row */}
              <div className="grid grid-cols-[0.5fr_1.2fr_1.2fr_0.8fr_0.8fr_1.2fr_0.8fr_1fr] items-center pb-1">
                <div className="p-2"></div>
                <div className="p-2">
                  <input
                    type="text"
                    name="drive_name"
                    value={filters.drive_name}
                    onChange={handleFilterChange}
                    placeholder="Search Drive..."
                    className="w-full lg:w-40 bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    name="company_name"
                    value={filters.company_name}
                    onChange={handleFilterChange}
                    placeholder="Search Company..."
                    className="w-full lg:w-40 bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    name="ctc"
                    value={filters.ctc}
                    onChange={handleFilterChange}
                    placeholder="Search CTC..."
                    className="w-full lg:w-32 bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2 text-center">
                  <select
                    value={isActiveFilter}
                    onChange={(e) => {
                      setIsActiveFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-17 bg-white text-xs p-1 border rounded-lg focus:outline-none focus:border-gray-400"
                  >
                    <option value="all">All</option>
                    <option value="1">Active</option>
                    <option value="0">Closed</option>
                  </select>
                </div>
                <div className="p-2"></div> {/* Description (no filter) */}
                <div className="p-2 flex justify-center">
                  <input
                    type="text"
                    name="count_apply"
                    value={filters.count_apply}
                    onChange={handleFilterChange}
                    placeholder="Search..."
                    className="w-22 bg-white text-xs p-1 border rounded-lg text-left"
                  />
                </div>
                <div className="p-2 flex justify-end pr-4">
                  <input
                    type="text"
                    name="count_selected"
                    value={filters.count_selected}
                    onChange={handleFilterChange}
                    placeholder="Search..."
                    className="w-24 bg-white text-xs p-1 border rounded-lg text-left"
                  />
                </div>
              </div>

              {/* Table Header */}
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[0.5fr_1.2fr_1.2fr_0.8fr_0.8fr_1.2fr_0.8fr_1fr] bg-gray-300 font-semibold text-sm sticky top-0">
                  <div className="p-2 whitespace-nowrap">Sl. No.</div>
                  <div className="p-2 text-left whitespace-nowrap">
                    Drive Name
                  </div>
                  <div className="p-2 text-left whitespace-nowrap">
                    Company Name
                  </div>
                  <div className="p-2 text-left whitespace-nowrap">
                    CTC
                  </div>
                  <div className="p-2 text-center whitespace-nowrap">
                    Status
                  </div>
                  <div className="p-2 text-center whitespace-nowrap">
                    Description
                  </div>
                  <div className="p-2 text-center whitespace-nowrap">
                    Count Applied
                  </div>
                  <div className="p-2 text-right whitespace-nowrap pr-4">
                    Count Selected
                  </div>
                </div>

                {/* Table Body */}
                <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                  {isLoading ? (
                    <p className="text-center text-gray-500 p-4">
                      Loading data...
                    </p>
                  ) : data.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <div
                        key={item.drive_id}
                        className="grid grid-cols-[0.5fr_1.2fr_1.2fr_0.8fr_0.8fr_1.2fr_0.8fr_1fr] items-center border-t bg-white text-sm"
                      >
                        <div className="pl-5">
                          {serialNoOffset + index + 1}.
                        </div>
                        <div className="p-2 font-medium">{item.drive_name}</div>
                        <div className="p-2">{item.company_name}</div>
                        <div className="p-2">{formatCTC(item.ctc)}</div>
                        <div className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.is_active === "1"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                              }`}
                          >
                            {item.is_active === "1" ? "Active" : "Closed"}
                          </span>
                        </div>
                        <div className="p-2 text-center">
                          <span
                            onClick={() =>
                              handleDescriptionClick(item.description)
                            }
                            className="text-blue-600 hover:underline cursor-pointer"
                          >
                            View
                          </span>
                        </div>
                        <div className="p-2 text-center">
                          {item.count_apply}
                        </div>
                        <div className="p-2 text-center lg:pl-10">
                          {item.count_selected}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 p-4">
                      No data found for the selected filters.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Modal */}
      {showDescModal && (
        <DescriptionModal
          content={selectedDesc}
          onClose={() => setShowDescModal(false)}
        />
      )}

      <style>{`
         @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
         .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PlacementDriveReportTable;