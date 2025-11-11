import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { debounce } from "lodash";
// ADDED IMPORTS
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

// Define the 11 columns structure (Unchanged)
const TABLE_GRID_COLS =
  "0.5fr 1.8fr 1fr 1.2fr 1.5fr 1.5fr 0.9fr 0.8fr 1.2fr 1fr";
const MIN_TABLE_WIDTH = "min-w-[1400px] lg:min-w-0";
const TABLE_WRAPPER_CLASSES = `w-full ${MIN_TABLE_WIDTH}`;

const SelectedStudentReportTable = ({ setToastMessage }) => {
  // --- All state hooks (useState, etc.) are unchanged ---
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    student_name: "",
    rollno: "",
    program_name: "",
    drive_name: "",
    company_name: "",
    company_type: "",
    ctc: "",
    role: "",
    place: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // --- All data fetching logic (useEffect, useCallback, useMemo) is unchanged ---
  // Fetch academic years
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

  // Debounce filters
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1);
    }, 300);
    handler();
    return () => handler.cancel();
  }, [filters]);

  // Fetch data with applied filters
  const fetchData = useCallback(async () => {
    if (!showTable || !selectedYearId) {
      setData([]);
      return;
    }
    setIsLoading(true);
    try {
      const params = {
        yearId: selectedYearId,
        studentName: debouncedFilters.student_name,
        rollNo: debouncedFilters.rollno,
        programName: debouncedFilters.program_name,
        driveName: debouncedFilters.drive_name,
        companyName: debouncedFilters.company_name,
        company_type: debouncedFilters.company_type,
        ctc: debouncedFilters.ctc,
        role: debouncedFilters.role,
        place: debouncedFilters.place,
      };
      const res = await api.get("/reports/selected-students", { params });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch report:", err);
      setToastMessage({
        type: "error",
        content: err.response?.data?.message || "Failed to load report data.",
      });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [showTable, selectedYearId, debouncedFilters, setToastMessage]);

  useEffect(() => {
    if (showTable && selectedYearId) {
      fetchData();
    } else {
      setData([]);
    }
  }, [fetchData, showTable, selectedYearId]);

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

  const formatCTC = (ctc) => {
    const val = parseFloat(ctc);
    return isNaN(val) ? "N/A" : `₹${val.toFixed(2)} LPA`;
  };

  // --- All event handler functions (handleYearChange, etc.) are unchanged ---
  const handleYearChange = (e) => {
    setSelectedYearId(e.target.value);
    if (!e.target.value) setShowTable(false);
    setData([]);
    setCurrentPage(1);
    setRowsPerPage(10);
    setFilters({
      student_name: "",
      rollno: "",
      program_name: "",
      drive_name: "",
      company_name: "",
      company_type: "",
      ctc: "",
      role: "",
      place: "",
    });
  };

  const handleToggleTableClick = () => {
    if (!selectedYearId) {
      setToastMessage({
        type: "error",
        content: "Please select an Academic Year first.",
      });
      return;
    }
    setShowTable(!showTable);
    setCurrentPage(1);
    if (!showTable) setData([]);
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

  // --- Export logic (unchanged from last version, exports ALL filtered data) ---
  const handleExportExcel = useCallback(() => {
    const dataToExport = data;
    if (dataToExport.length === 0) {
      setToastMessage({ type: "error", content: "No data to export." });
      return;
    }
    setIsLoading(true);

    const headers = [
      "Sl. No.",
      "Student Name",
      "Roll No.",
      "Program",
      "Drive Name",
      "Company",
      "Type",
      "CTC (LPA)",
      "Role",
      "Place",
    ];

    const dataRows = dataToExport.map((item, index) =>
      [
        `"${index + 1}"`,
        `"${(item.student_name || "").replace(/"/g, '""')}"`,
        `"${(item.rollno || "").replace(/"/g, '""')}"`,
        `"${(item.program_name || "").replace(/"/g, '""')}"`,
        `"${(item.drive_name || "").replace(/"/g, '""')}"`,
        `"${(item.company_name || "").replace(/"/g, '""')}"`,
        `"${(item.company_type || "").replace(/"/g, '""')}"`,
        `"${item.ctc || 0}"`,
        `"${(item.role || "").replace(/"/g, '""')}"`,
        `"${(item.place || "").replace(/"/g, '""')}"`,
      ].join(",")
    );

    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const yearName =
      academicYears.find(
        (y) => y.year_id.toString() === selectedYearId.toString()
      )?.year_name.replace(/[^a-zA-Z0-9]/g, "_") || "Report";

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Selected_Students_${yearName}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsExporting(false);
    setToastMessage({
      type: "success",
      content: `Exported ${dataToExport.length} records.`,
    });
  }, [data, academicYears, selectedYearId, setToastMessage]);

  return (
    <div>
      {/* Top Controls (Unchanged) */}
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

      {/* Table Container */}
      {showTable && (
        <div>
          {/* Pagination (Unchanged) */}
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

          {/* Table */}
          {/* Outer container for horizontal scroll on mobile/tablet */}
          <div className="overflow-x-auto no-scrollbar">
            {/* Inner div enforces minimum width */}
            <div className={TABLE_WRAPPER_CLASSES}>
              <div
                className={`grid items-center pb-1`}
                style={{ gridTemplateColumns: TABLE_GRID_COLS }}
              >
                {/*
                Spacing before student name search bar for serial no. 
              */}
                <div className="p-2"></div>
                <div className="pl-10 pr-2 py-2">
                  <input
                    type="text"
                    name="student_name"
                    value={filters.student_name}
                    onChange={handleFilterChange}
                    placeholder="Search Name..."
                    className="w-full bg-white text-xs p-1 border rounded-lg"
                  />
                </div>

                <div className="p-2">
                  <input
                    type="text"
                    name="rollno"
                    value={filters.rollno}
                    onChange={handleFilterChange}
                    placeholder="Search Roll..."
                    className="w-full bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    name="program_name"
                    value={filters.program_name}
                    onChange={handleFilterChange}
                    placeholder="Search Program..."
                    className="w-full bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    name="drive_name"
                    value={filters.drive_name}
                    onChange={handleFilterChange}
                    placeholder="Search Drive..."
                    className="w-full bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    name="company_name"
                    value={filters.company_name}
                    onChange={handleFilterChange}
                    placeholder="Search Company..."
                    className="w-full bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    name="company_type"
                    value={filters.company_type}
                    onChange={handleFilterChange}
                    placeholder="Search Type..."
                    className="w-full bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    name="ctc"
                    value={filters.ctc}
                    onChange={handleFilterChange}
                    placeholder="Search CTC..."
                    className="w-full bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                    placeholder="Search Role..."
                    className="w-full bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
                <div className="p-2">
                  <input
                    type="text"
                    name="place"
                    value={filters.place}
                    onChange={handleFilterChange}
                    placeholder="Search Place..."
                    className="w-full bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
              </div>

              {/* Header */}
              <div className="border rounded-lg overflow-hidden">
                <div
                  className={`grid bg-gray-300 font-semibold text-sm sticky top-0`}
                  style={{ gridTemplateColumns: TABLE_GRID_COLS }}
                >
                  <div className="p-2 whitespace-nowrap">Sl. No.</div>
                  <div className="pl-10 pr-2 py-2 text-left whitespace-nowrap">
                    Student Name
                  </div>
                  <div className="p-2 text-left whitespace-nowrap">
                    Roll No.
                  </div>
                  <div className="p-2 text-left whitespace-nowrap">Program</div>
                  <div className="p-2 text-left whitespace-nowrap">
                    Drive Name
                  </div>
                  <div className="p-2 text-left whitespace-nowrap">Company</div>
                  <div className="p-2 text-left whitespace-nowrap">Type</div>
                  <div className="p-2 text-left whitespace-nowrap">CTC</div>
                  <div className="p-2 text-left whitespace-nowrap">Role</div>
                  <div className="p-2 text-left whitespace-nowrap">Place</div>
                </div>

                {/* Body */}
                <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                  {isLoading ? (
                    <p className="text-center text-gray-500 p-4">
                      Loading data...
                    </p>
                  ) : data.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <div
                        key={`${item.user_id}-${item.drive_id}-${index}`}
                        className={`grid items-center border-t bg-white text-sm`}
                        style={{ gridTemplateColumns: TABLE_GRID_COLS }}
                      >
                        <div className="p-2 pl-5">
                          {serialNoOffset + index + 1}.
                        </div>
                        <div className="pl-10 pr-2 py-2 font-medium">
                          {item.student_name}
                        </div>
                        <div className="p-2">{item.rollno}</div>
                        <div className="p-2">{item.program_name}</div>
                        <div className="p-2">{item.drive_name}</div>
                        <div className="p-2">{item.company_name}</div>
                        <div className="p-2">{item.company_type}</div>
                        <div className="p-2">{formatCTC(item.ctc)}</div>
                        <div className="p-2">{item.role || "N/A"}</div>
                        <div className="p-2">{item.place || "N/A"}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 p-4">
                      No selected students found for these filters.
                    </p>
                  )}
                </div>
              </div>
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

export default SelectedStudentReportTable;