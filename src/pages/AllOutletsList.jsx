import "../styles/AllOutletsList.css";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import {
  getAllOutlets,
  getOutletById,
  updateOutlet,
  createOutlet,
   getOutletCount,
} from "../services/outletListService";

import {
  FiSearch,
  FiDownloadCloud,
  FiUpload,
  FiCheck,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

function AllOutletsList({ setActivePage }) {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [outletCount, setOutletCount] = useState(0);

  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(30);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  const [outletStatus, setOutletStatus] = useState(null);
  const [outletType, setOutletType] = useState(null);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [globalStatus, setGlobalStatus] = useState("OPEN");

  // =========================================================
  // COLUMNS
  // =========================================================

  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    outletId: true,
    outletName: true,
    merchantId: true,
    cuisineType: true,
    outletPhone: true,
    status: true,
    menuItemCount: true,
    address: true,
    areaId: true,
    stateId: true,
  });

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const showAllColumns = () => {
    setVisibleColumns({
      outletId: true,
      outletName: true,
      merchantId: true,
      cuisineType: true,
      outletPhone: true,
      status: true,
      menuItemCount: true,
      address: true,
      areaId: true,
      stateId: true,
    });
  };

  // const API_BASE_URL =
  //   "http://srv1617582.hstgr.cloud:8084";

  // =========================================================
  // FETCH OUTLET COUNT
  // =========================================================

 const fetchOutletCount = async () => {
  try {
    const count = await getOutletCount();
    setOutletCount(count);
  } catch (error) {
    console.error("Failed to fetch outlet count:", error);
    setOutletCount(0);
  }
};

  // =========================================================
  // FETCH ALL OUTLETS
  // =========================================================

const fetchOutlets = async () => {
  try {
    setLoading(true);

    const data = await getAllOutlets();

    setOutlets(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Failed to fetch outlets:", error);
    setOutlets([]);
  } finally {
    setLoading(false);
  }
};

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchOutlets();
    fetchOutletCount();
  }, []);

  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  const statusOptions = [
    {
      value: "Y",
      label: "Active",
    },
    {
      value: "N",
      label: "Inactive",
    },
  ];

  const outletTypeOptions = [
    {
      value: "ALL",
      label: "All Outlets",
    },
    {
      value: "ACTIVE",
      label: "Active Outlets",
    },
    {
      value: "INACTIVE",
      label: "Inactive Outlets",
    },
  ];

  // =========================================================
  // FILTER + SEARCH
  // =========================================================

  const filteredOutlets = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    return outlets.filter((outlet) => {
      const matchesSearch =
        !keyword ||
        String(outlet.outletId || "")
          .toLowerCase()
          .includes(keyword) ||
        String(outlet.outletName || "")
          .toLowerCase()
          .includes(keyword) ||
        String(outlet.merchantId || "")
          .toLowerCase()
          .includes(keyword) ||
        String(outlet.outletPhone || "")
          .toLowerCase()
          .includes(keyword) ||
        String(outlet.road || "")
          .toLowerCase()
          .includes(keyword) ||
        String(outlet.landmark || "")
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        !outletStatus ||
        outlet.isActive === outletStatus.value;

      const matchesType =
        !outletType ||
        outletType.value === "ALL" ||
        (outletType.value === "ACTIVE" &&
          outlet.isActive === "Y") ||
        (outletType.value === "INACTIVE" &&
          outlet.isActive === "N");

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    outlets,
    search,
    outletStatus,
    outletType,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.ceil(
    filteredOutlets.length / entries
  );

  const startIndex =
    (currentPage - 1) * entries;

  const endIndex =
    startIndex + entries;

  const displayedOutlets =
    filteredOutlets.slice(
      startIndex,
      endIndex
    );

  // =========================================================
  // RESET PAGINATION
  // =========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    outletStatus,
    outletType,
    entries,
  ]);

  // =========================================================
  // COUNTS
  // =========================================================

  const activeOutletCount = outlets.filter(
    (outlet) => outlet.isActive === "Y"
  ).length;

  const inactiveOutletCount = outlets.filter(
    (outlet) => outlet.isActive !== "Y"
  ).length;

  // =========================================================
  // EDIT OUTLET
  // =========================================================

  const handleEditOutlet = (outlet) => {
    if (!outlet?.outletId) {
      alert("Outlet ID not available.");
      return;
    }

    sessionStorage.setItem(
      "editOutletId",
      String(outlet.outletId)
    );

    sessionStorage.setItem(
      "selectedOutlet",
      JSON.stringify(outlet)
    );

    setActivePage("outletEdit");
  };

  // =========================================================
  // DELETE OUTLET
  // =========================================================

  const handleDeleteOutlet = (outlet) => {
    if (!outlet?.outletId) {
      alert("Outlet ID not available.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${outlet.outletName}"?`
    );

    if (!confirmed) {
      return;
    }

    console.log(
      "Delete outlet requested:",
      outlet.outletId
    );

    alert(
      "Delete API is not connected yet."
    );
  };

  // =========================================================
  // EXPORT CSV
  // =========================================================

  const exportCSV = () => {
    if (!filteredOutlets.length) {
      alert("No outlets available to export.");
      return;
    }

    const headers = [
      "Outlet ID",
      "Merchant ID",
      "Outlet Name",
      "Cuisine Type",
      "Outlet Phone",
      "Status",
      "Menu Items",
      "State ID",
      "Area ID",
      "Road",
      "Landmark",
      "Building Number",
    ];

    const rows = filteredOutlets.map(
      (outlet) => [
        outlet.outletId,
        outlet.merchantId,
        outlet.outletName,
        outlet.cuisineType,
        outlet.outletPhone,
        outlet.isActive === "Y"
          ? "Active"
          : "Inactive",
        outlet.menuItemCount,
        outlet.stateId,
        outlet.areaId,
        outlet.road,
        outlet.landmark,
        outlet.buildingNumber,
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(
              /"/g,
              '""'
            )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = "outlets.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setShowExportMenu(false);
  };

  // =========================================================
  // BULK UPLOAD
  // =========================================================

  const handleBulkUpload = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    console.log(
      "Selected outlet bulk upload file:",
      file
    );
  };

  // =========================================================
  // GLOBAL STATUS
  // =========================================================

  const handleApplyGlobalStatus = () => {
    console.log(
      "Global outlet status:",
      globalStatus
    );
  };

  // =========================================================
  // COLUMN OPTIONS
  // =========================================================

  const columnOptions = [
    ["outletId", "Outlet ID"],
    ["outletName", "Outlet Name"],
    ["merchantId", "Merchant ID"],
    ["cuisineType", "Cuisine Type"],
    ["outletPhone", "Phone Number"],
    ["status", "Status"],
    ["menuItemCount", "Menu Items"],
    ["address", "Address"],
    ["areaId", "Area ID"],
    ["stateId", "State ID"],
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="jippy-all-outlets-page">

      {/* PAGE HEADER */}

      <div className="jippy-all-outlets-page-header">
        <div>
          <h1>Outlets</h1>

          <p>
            Manage and monitor all restaurant outlets
          </p>
        </div>
      </div>

      {/* OUTLET TITLE + COUNT */}

      <div className="jippy-all-outlets-title-row">
        <div className="jippy-all-outlets-title">
          <h2>🏪 Outlets</h2>

          <span className="jippy-all-outlets-count">
            {outletCount}
          </span>
        </div>
      </div>

      {/* FILTERS */}

      {/* <div className="jippy-all-outlets-filter-row">

        <Select
          className="jippy-all-outlets-select"
          classNamePrefix="jippy-all-outlets-select"
          placeholder="Outlet Type"
          isClearable
          options={outletTypeOptions}
          value={outletType}
          onChange={setOutletType}
        />

        <Select
          className="jippy-all-outlets-select"
          classNamePrefix="jippy-all-outlets-select"
          placeholder="Outlet Status"
          isClearable
          options={statusOptions}
          value={outletStatus}
          onChange={setOutletStatus}
        />

      </div> */}

      {/* SUMMARY CARDS */}

      <div className="jippy-all-outlets-summary-grid">

        <div className="jippy-all-outlets-summary-card jippy-all-outlets-total-card">
          <strong>{outletCount}</strong>
          <span>Total Outlets</span>
        </div>

        <div className="jippy-all-outlets-summary-card jippy-all-outlets-active-card">
          <strong>{activeOutletCount}</strong>
          <span>Active Outlets</span>
        </div>

        <div className="jippy-all-outlets-summary-card jippy-all-outlets-inactive-card">
          <strong>{inactiveOutletCount}</strong>
          <span>Inactive Outlets</span>
        </div>

        <div className="jippy-all-outlets-summary-card jippy-all-outlets-menu-card">
          <strong>
            {outlets.reduce(
              (total, outlet) =>
                total +
                Number(
                  outlet.menuItemCount || 0
                ),
              0
            )}
          </strong>

          <span>Total Menu Items</span>
        </div>

      </div>

      {/* BULK IMPORT / UPDATE */}

      <div className="jippy-all-outlets-bulk-card">

        <div className="jippy-all-outlets-bulk-info">

          <h2>
            Bulk Import / Update Outlets
          </h2>

          <p>
            Upload an Excel file to import or
            update multiple outlets at once.
          </p>

          <button
            type="button"
            className="jippy-all-outlets-template-btn"
          >
            <FiDownloadCloud />
            Download Template
          </button>

        </div>

        <div className="jippy-all-outlets-upload-area">

          <label>
            Select Excel File (.xls/.xlsx)
          </label>

          <input
            type="file"
            accept=".xls,.xlsx"
            onChange={handleBulkUpload}
          />

          <small>
            File should contain Outlet Name,
            Phone, Address, Merchant ID,
            Status and Outlet ID for updates.
          </small>

          <button
            type="button"
            className="jippy-all-outlets-bulk-btn"
            onClick={() =>
              console.log(
                "Bulk update clicked"
              )
            }
          >
            <FiUpload />
            Bulk Update
          </button>

        </div>

      </div>

      {/* GLOBAL OUTLET STATUS */}

      <div className="jippy-all-outlets-global-card">

        <div>

          <h2>
            Global Outlet Status
          </h2>

          <p>
            Override all outlets open / closed status.
          </p>

        </div>

        <div className="jippy-all-outlets-global-actions">

          <button
            type="button"
            className={`jippy-all-outlets-status-option ${
              globalStatus === "OPEN"
                ? "jippy-all-outlets-status-selected"
                : ""
            }`}
            onClick={() =>
              setGlobalStatus("OPEN")
            }
          >
            <span className="jippy-all-outlets-status-dot jippy-all-outlets-status-dot-open" />
            All Open
          </button>

          <button
            type="button"
            className={`jippy-all-outlets-status-option ${
              globalStatus === "CLOSED"
                ? "jippy-all-outlets-status-selected"
                : ""
            }`}
            onClick={() =>
              setGlobalStatus("CLOSED")
            }
          >
            <span className="jippy-all-outlets-status-dot jippy-all-outlets-status-dot-closed" />
            All Closed
          </button>

          <button
            type="button"
            className="jippy-all-outlets-apply-btn"
            onClick={
              handleApplyGlobalStatus
            }
          >
            <FiCheck />
            Apply to All Outlets
          </button>

        </div>

      </div>

      {/* OUTLETS TABLE CARD */}

      <div className="jippy-all-outlets-table-card">

        {/* TABLE HEADER */}

        <div className="jippy-all-outlets-table-header">

          <div>

            <h2>
              Outlets List
            </h2>

            <p>
              View and manage all the outlets
            </p>

          </div>

          {/* COLUMNS + CREATE */}

          <div className="jippy-all-outlets-header-actions">

            {/* COLUMNS */}

           {/* COLUMNS */}

<div className="jippy-all-outlets-columns-wrapper">

  <button
    type="button"
    className="jippy-all-outlets-columns-btn"
    onClick={() =>
      setShowColumnsMenu((prev) => !prev)
    }
  >
    Columns ▾
  </button>

  {showColumnsMenu && (
    <div className="jippy-all-outlets-columns-menu">

      {/* HEADER */}
      <div className="jippy-all-outlets-columns-menu-header">
        <span>Choose Columns</span>

        <button
          type="button"
          className="jippy-all-outlets-columns-close"
          onClick={() => setShowColumnsMenu(false)}
          aria-label="Close columns"
        >
          ×
        </button>
      </div>

      <div className="jippy-all-outlets-columns-title">
        General
      </div>

      {columnOptions.map(([key, label]) => (
        <label
          key={key}
          className="jippy-all-outlets-column-option"
        >
          <input
            type="checkbox"
            checked={visibleColumns[key]}
            onChange={() => toggleColumn(key)}
          />

          <span>{label}</span>
        </label>
      ))}

      <div className="jippy-all-outlets-columns-divider" />

      <button
        type="button"
        className="jippy-all-outlets-show-all-columns"
        onClick={showAllColumns}
      >
        Show All
      </button>

    </div>
  )}

</div>
            {/* CREATE OUTLET */}

            <button
              type="button"
              className="jippy-all-outlets-create-btn"
              onClick={() =>
                setActivePage("createOutletNew")
              }
            >
              + Create Outlet
            </button>

          </div>

        </div>

        {/* TOOLBAR */}

        <div className="jippy-all-outlets-toolbar">

          <div className="jippy-all-outlets-entries">

            <span>
              Show
            </span>

            <select
              value={entries}
              onChange={(event) =>
                setEntries(
                  Number(event.target.value)
                )
              }
            >
              <option value="10">
                10
              </option>

              <option value="30">
                30
              </option>

              <option value="50">
                50
              </option>

              <option value="100">
                100
              </option>
            </select>

            <span>
              entries
            </span>

          </div>

          <div className="jippy-all-outlets-toolbar-right">

            <div className="jippy-all-outlets-search">

              <input
                type="text"
                placeholder="Search outlets..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

              <FiSearch />

            </div>

            <div className="jippy-all-outlets-export-wrapper">

              <button
                type="button"
                className="jippy-all-outlets-export-btn"
                onClick={() =>
                  setShowExportMenu(
                    !showExportMenu
                  )
                }
              >
                <FiDownloadCloud />
                Export as
              </button>

              {showExportMenu && (

                <div className="jippy-all-outlets-export-menu">

                  <button
                    type="button"
                    onClick={exportCSV}
                  >
                    Export CSV
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      console.log(
                        "Excel export"
                      )
                    }
                  >
                    Export Excel
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      console.log(
                        "PDF export"
                      )
                    }
                  >
                    Export PDF
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="jippy-all-outlets-table-scroll">

          <table className="jippy-all-outlets-table">

            <thead>

              <tr>

                {visibleColumns.outletId && (
                  <th>Outlet ID</th>
                )}

                {visibleColumns.outletName && (
                  <th>Outlet Name</th>
                )}

                {visibleColumns.merchantId && (
                  <th>Merchant ID</th>
                )}

                {visibleColumns.cuisineType && (
                  <th>Cuisine Type</th>
                )}

                {visibleColumns.outletPhone && (
                  <th>Phone Number</th>
                )}

                {visibleColumns.status && (
                  <th>Status</th>
                )}

                {visibleColumns.menuItemCount && (
                  <th>Menu Items</th>
                )}

                {visibleColumns.address && (
                  <th>Address</th>
                )}

                {visibleColumns.areaId && (
                  <th>Area ID</th>
                )}

                {visibleColumns.stateId && (
                  <th>State ID</th>
                )}

                {/* ALWAYS VISIBLE */}

                <th className="jippy-all-outlets-actions-header">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="11"
                    className="jippy-all-outlets-message"
                  >
                    Loading outlets...
                  </td>

                </tr>

              ) : displayedOutlets.length === 0 ? (

                <tr>

                  <td
                    colSpan="11"
                    className="jippy-all-outlets-message"
                  >
                    No outlets found
                  </td>

                </tr>

              ) : (

                displayedOutlets.map(
                  (outlet) => (

                    <tr
                      key={
                        outlet.outletId
                      }
                    >

                      {/* OUTLET ID */}

                      {visibleColumns.outletId && (
                        <td>
                          {outlet.outletId ??
                            "-"}
                        </td>
                      )}

                      {/* OUTLET NAME */}

                      {visibleColumns.outletName && (
                        <td className="jippy-all-outlets-name">

                          <button
                            type="button"
                            className="jippy-all-outlets-name-button"
                            onClick={() => {

                              sessionStorage.setItem(
                                "selectedOutlet",
                                JSON.stringify(
                                  outlet
                                )
                              );

                              setActivePage(
                                "outletProfileDetails"
                              );

                            }}
                          >
                            {outlet.outletName ||
                              "-"}
                          </button>

                        </td>
                      )}

                      {/* MERCHANT */}

                      {visibleColumns.merchantId && (
                        <td>
                          {outlet.merchantId ??
                            "-"}
                        </td>
                      )}

                      {/* CUISINE */}

                      {visibleColumns.cuisineType && (
                        <td>
                          {Array.isArray(
                            outlet.cuisineType
                          )
                            ? outlet.cuisineType.join(
                                ", "
                              )
                            : outlet.cuisineType ||
                              "-"}
                        </td>
                      )}

                      {/* PHONE */}

                      {visibleColumns.outletPhone && (
                        <td>
                          {outlet.outletPhone ||
                            "-"}
                        </td>
                      )}

                      {/* STATUS */}

                      {visibleColumns.status && (
                        <td>

                          <span
                            className={`jippy-all-outlets-status-badge ${
                              outlet.isActive ===
                              "Y"
                                ? "jippy-all-outlets-active"
                                : "jippy-all-outlets-inactive"
                            }`}
                          >
                            {outlet.isActive ===
                            "Y"
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>
                      )}

                      {/* MENU ITEMS */}

                      {visibleColumns.menuItemCount && (
                        <td>
                          {outlet.menuItemCount ??
                            0}
                        </td>
                      )}

                      {/* ADDRESS */}

                      {visibleColumns.address && (
                        <td className="jippy-all-outlets-address">

                          {[
                            outlet.buildingNumber,
                            outlet.road,
                            outlet.landmark,
                          ]
                            .filter(Boolean)
                            .join(", ") ||
                            "-"}

                        </td>
                      )}

                      {/* AREA */}

                      {visibleColumns.areaId && (
                        <td>
                          {outlet.areaId ??
                            "-"}
                        </td>
                      )}

                      {/* STATE */}

                      {visibleColumns.stateId && (
                        <td>
                          {outlet.stateId ??
                            "-"}
                        </td>
                      )}

                      {/* ACTIONS - ALWAYS VISIBLE */}

                      <td>

                        <div className="jippy-all-outlets-actions">

                          <button
                            type="button"
                            className="jippy-all-outlets-edit-btn"
                            title="Edit Outlet"
                            aria-label="Edit Outlet"
                            onClick={() =>
                              handleEditOutlet(
                                outlet
                              )
                            }
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="jippy-all-outlets-delete-btn"
                            title="Delete Outlet"
                            aria-label="Delete Outlet"
                            onClick={() =>
                              handleDeleteOutlet(
                                outlet
                              )
                            }
                          >
                            <FiTrash2 />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION FOOTER */}

        {!loading &&
          filteredOutlets.length > 0 && (

            <div className="jippy-all-outlets-table-footer">

              <div className="jippy-all-outlets-showing-text">

                Showing{" "}
                {startIndex + 1} to{" "}
                {Math.min(
                  endIndex,
                  filteredOutlets.length
                )}{" "}
                of{" "}
                {filteredOutlets.length}{" "}
                outlets

              </div>

              <div className="jippy-all-outlets-pagination">

                <button
                  type="button"
                  className="jippy-all-outlets-page-btn"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) => prev - 1
                    )
                  }
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    key={page}
                    type="button"
                    className={`jippy-all-outlets-page-btn ${
                      currentPage === page
                        ? "jippy-all-outlets-page-btn-active"
                        : ""
                    }`}
                    onClick={() =>
                      setCurrentPage(page)
                    }
                  >
                    {page}
                  </button>

                ))}

                <button
                  type="button"
                  className="jippy-all-outlets-page-btn"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) => prev + 1
                    )
                  }
                >
                  Next
                </button>

              </div>

            </div>

          )}

      </div>

    </div>
  );
}

export default AllOutletsList;