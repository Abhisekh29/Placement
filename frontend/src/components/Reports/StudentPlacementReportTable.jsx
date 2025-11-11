import React, { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../api/axios";
import { debounce } from "lodash";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { FaChevronDown, FaCheck } from "react-icons/fa";

const StudentPlacementReportTable = ({ setToastMessage }) => {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [data, setData] = useState([]); // This will hold ALL the data
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // State for column filters
  const [filters, setFilters] = useState({
    student_name: "",
    rollno: "",
    program_name: "",
    session_name: "",
    count_apply: "",
    count_selected: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // --- Client-side Pagination State (like StudentTable.jsx) ---
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // --- (useEffect for academic years is unchanged) ---
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

  // Debounce the filter inputs
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedFilters(filters);
      setCurrentPage(1); // Reset to page 1 when filters change
    }, 100);
    handler();
    return () => {
      handler.cancel();
    };
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
        studentName: debouncedFilters.student_name,
        rollNo: debouncedFilters.rollno,
        programName: debouncedFilters.program_name,
        sessionName: debouncedFilters.session_name,
        countApply: debouncedFilters.count_apply,
        countSelected: debouncedFilters.count_selected,
        // No page or limit params
      };
      const res = await api.get("/reports/student-placement-stats", { params });
      setData(res.data); // Set all data directly
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
  }, [showTable, selectedYearId, debouncedFilters, setToastMessage]);

  // Fetch data when filters or show state change
  useEffect(() => {
    if (showTable && selectedYearId) {
      fetchData();
    } else {
      setData([]); // Clear data if table is hidden or no year
    }
  }, [fetchData, showTable, selectedYearId]);

  // --- Client-side pagination logic (like StudentTable.jsx) ---
  const paginatedData = useMemo(() => {
    if (rowsPerPage === "all") {
      return data;
    }
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

  const handleYearChange = (e) => {
    const newYearId = e.target.value;
    setSelectedYearId(newYearId);

    if (!newYearId) {
      setShowTable(false);
      setData([]);
    } else {
      setData([]);
    }

    setCurrentPage(1);
    setRowsPerPage(10);
    setFilters({
      student_name: "",
      rollno: "",
      program_name: "",
      session_name: "",
      count_apply: "",
      count_selected: "",
    });
  };

  const handleToggleTableClick = () => {
    if (!showTable && !selectedYearId) {
      setToastMessage({
        type: "error",
        content: "Please select an Academic Year first.",
      });
      return;
    }

    const nextShowTable = !showTable;
    setShowTable(nextShowTable);

    // Reset pagination when table is toggled
    setCurrentPage(1);
    setRowsPerPage(10);

    if (nextShowTable === false) {
      setData([]);
    }
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

  const handleExportExcel = useCallback(() => {
    if (data.length === 0) {
      setToastMessage({ type: "error", content: "No data to export." });
      return;
    }
    setIsExporting(true);

    const headers = [
      "Sl. No.",
      "Student Name",
      "Roll No.",
      "Program Name",
      "Academic Session",
      "Count Apply",
      "Count Selected",
    ];

    const dataRows = data.map((item, index) =>
      [
        `"${index + 1}"`,
        `"${(item.student_name || "N/A").replace(/"/g, '""')}"`,
        `"${(item.rollno || "N/A").replace(/"/g, '""')}"`,
        `"${(item.program_name || "N/A").replace(/"/g, '""')}"`,
        `"${(item.session_name || "N/A").replace(/"/g, '""')}"`,
        `"${item.count_apply || 0}"`,
        `"${item.count_selected || 0}"`,
      ].join(",")
    );

    const csvString = [headers.join(","), ...dataRows].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const selectedYear = academicYears.find(
      (year) => year.year_id.toString() === selectedYearId.toString()
    );
    const yearName = selectedYear
      ? selectedYear.year_name.replace(/[^a-zA-Z0-9]/g, "_")
      : "Report";
    const fileName = `Student_Placement_Stats_${yearName}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    setIsExporting(false);
    setToastMessage({
      type: "success",
      content: `Exported ${data.length} records.`,
    });
  }, [data, academicYears, selectedYearId, setToastMessage]);

  return (
    <div>

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

        {/* Right side container */}
        {showTable && (
          <button
            onClick={handleExportExcel}
            disabled={isLoading || isExporting}
            className={`px-3 py-1.5 rounded-lg text-white text-xs transition shadow-sm self-end sm:self-auto ${isLoading || isExporting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
              }`}
            title="Export current table data to CSV"
          >
            {isExporting ? "Exporting..." : "Export to Excel"}
          </button>
        )}
      </div>

      {/* --- Report Table Structure --- */}
      {showTable && (
        <div>
          {/* --- MODIFIED: Pagination Controls (No background) --- */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
            <div className="flex items-center gap-2">
              <label
                htmlFor="limit-select-report"
                className="text-gray-700 text-sm "
              >
                Records per page:
              </label>
              <select
                id="limit-select-report"
                name="limit"
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

          {/* --- Filters Container --- */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[1000px]">
              <div className="grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_1.5fr_1fr_1fr] items-center pb-1">

                {/* MODIFIED: p-2 for alignment */}
                <div className="p-2"></div>

                {/* MODIFIED: Responsive width */}
                <div className="pl-10 pr-2 py-2">
                  <input
                    type="text"
                    name="student_name"
                    value={filters.student_name}
                    onChange={handleFilterChange}
                    placeholder="Search Name..."
                    className="w-full lg:w-44 bg-white text-xs p-1 border rounded-lg"
                  />
                </div>

                {/* MODIFIED: Responsive width */}
                <div className="p-2">
                  <input
                    type="text"
                    name="rollno"
                    value={filters.rollno}
                    onChange={handleFilterChange}
                    placeholder="Search Roll No..."
                    className="w-full lg:w-32 bg-white text-xs p-1 border rounded-lg"
                  />
                </div>

                {/* MODIFIED: Responsive width */}
                <div className="p-2">
                  <input
                    type="text"
                    name="program_name"
                    value={filters.program_name}
                    onChange={handleFilterChange}
                    placeholder="Search Program..."
                    className="w-full lg:w-48 bg-white text-xs p-1 border rounded-lg"
                  />
                </div>

                {/* MODIFIED: Responsive width */}
                <div className="p-2">
                  <input
                    type="text"
                    name="session_name"
                    value={filters.session_name}
                    onChange={handleFilterChange}
                    placeholder="Search Session..."
                    className="w-full lg:w-40 bg-white text-xs p-1 border rounded-lg"
                  />
                </div>

                {/* --- COUNT FIELDS (No Change, these are correct) --- */}
                <div className="p-2 flex justify-center">
                  <input
                    type="text"
                    name="count_apply"
                    value={filters.count_apply}
                    onChange={handleFilterChange}
                    placeholder="Search..."
                    className="w-24 bg-white text-xs p-1 border rounded-lg"
                  />
                </div>

                <div className="p-2 flex justify-end pr-4">
                  <input
                    type="text"
                    name="count_selected"
                    value={filters.count_selected}
                    onChange={handleFilterChange}
                    placeholder="Search..."
                    className="w-24 bg-white text-xs p-1 border rounded-lg"
                  />
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_1.5fr_1fr_1fr] bg-gray-300 font-semibold text-sm sticky top-0">
                  <div className="p-2 whitespace-nowrap">Sl. No.</div>
                  <div className="pl-10 pr-2 py-2 text-left whitespace-nowrap">
                    Student Name
                  </div>
                  <div className="p-2 text-left whitespace-nowrap">
                    Roll No.
                  </div>
                  <div className="p-2 text-left whitespace-nowrap">
                    Program Name
                  </div>
                  <div className="p-2 text-left whitespace-nowrap">
                    Academic Session
                  </div>
                  <div className="p-2 text-center whitespace-nowrap">
                    Count Apply
                  </div>
                  <div className="p-2 text-right pr-4 whitespace-nowrap">
                    Count Selected
                  </div>
                </div>

                {/* Table Body (Scrollable) */}
                <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                  {isLoading ? (
                    <p className="text-center text-gray-500 p-4">
                      Loading data...
                    </p>
                  ) : data.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[0.5fr_1.5fr_1fr_1.5fr_1.5fr_1fr_1fr] items-center border-t bg-white text-sm"
                      >
                        <div className="pl-5">
                          {serialNoOffset + index + 1}.
                        </div>
                        <div className="pl-10 pr-2 py-2 font-medium">
                          {item.student_name}
                        </div>
                        <div className="p-2">{item.rollno}</div>
                        <div className="p-2">{item.program_name}</div>
                        <div className="p-2">{item.session_name}</div>
                        <div className="p-2 text-center">
                          {item.count_apply}
                        </div>
                        <div className="p-2 text-center lg:pl-14">
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
    </div>
  );
};

export default StudentPlacementReportTable;