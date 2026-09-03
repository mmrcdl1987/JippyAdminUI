import "../styles/AllOutletsList.css";

import { Fragment } from "react";
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import {
  getAllOutlets,
  getOutletById,
  getOutletDetails,
  updateOutletDetailsByMerchant,
  createOutlet,
  getOutletCount,
<<<<<<< Updated upstream
  uploadOutletsBulk,
=======
  setOutletUnavailable,
  restoreOutletUnavailability,
>>>>>>> Stashed changes
} from "../services/outletListService";

import {
  FiSearch,
  FiDownloadCloud,
  FiUpload,
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
  FiMinus,
  FiX,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";

function AllOutletsList({ setActivePage }) {


  


const [unavailabilityModal, setUnavailabilityModal] = useState({
  open: false,
  outlet: null,
  mode: "create",
});

const [unavailabilityForm, setUnavailabilityForm] = useState({
  fromDate: "",
  toDate: "",
  reason: "",
});

const [unavailabilityData, setUnavailabilityData] = useState(() => {
  try {
    const saved = localStorage.getItem(
      "jippy_outlet_unavailability"
    );

    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.error(
      "Failed to load outlet unavailability data:",
      error
    );

    return {};
  }
});
const [savingUnavailability, setSavingUnavailability] =
  useState(false);
 
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [outletCount, setOutletCount] = useState(0);


const [selectedOutlet, setSelectedOutlet] = useState(null);
const [expandedOutletId, setExpandedOutletId] = useState(null);



  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(30);



  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  const [outletStatus, setOutletStatus] = useState(null);
  const [outletType, setOutletType] = useState(null);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [globalStatus, setGlobalStatus] = useState("OPEN");

<<<<<<< Updated upstream
  // DRAG AND DROP & BULK UPLOAD STATE
  const [isDragging, setIsDragging] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // <-- Added state for upload results/errors
=======



>>>>>>> Stashed changes

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
  areaId: true,
  stateId: true,
  availability: true,
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
    areaId: true,
    stateId: true,
    availability: true,
  });
};

<<<<<<< Updated upstream
=======
const handleExpandOutlet = (outletId) => {
  const id = Number(outletId);

  if (!id) {
    console.error("Outlet ID not found:", outletId);
    return;
  }

  setExpandedOutletId((prev) =>
    prev === id ? null : id
  );
};
  // =========================================================
// TOGGLE OUTLET AVAILABILITY
// =========================================================

const handleEditUnavailability = (outlet) => {
  const existing =
    unavailabilityData[outlet.outletId];

  if (!existing) {
    console.log(
      "No unavailability data available for this outlet"
    );
    return;
  }

  setSelectedOutlet(outlet);

  setUnavailabilityForm({
    fromDate: existing.fromDate || "",
    toDate: existing.toDate || "",
    reason: existing.reason || "",
  });

  setUnavailabilityModal({
    open: true,
    outlet,
    mode: "edit",
  });
};




const formatUnavailabilityDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const handleOutletToggle = (outlet) => {
  if (!outlet?.outletId) {
    console.error("Outlet ID not found");
    return;
  }

  // ==========================================
  // ON → OFF
  // ==========================================

  if (outlet.isToggle === true) {
    setSelectedOutlet(outlet);

    setUnavailabilityForm({
      fromDate: "",
      toDate: "",
      reason: "",
    });

    setUnavailabilityModal({
      open: true,
      outlet: outlet,
      mode: "create",
    });

    return;
  }

  // ==========================================
  // OFF → ON
  // OPEN RESTORE CONFIRMATION
  // ==========================================

  setSelectedOutlet(outlet);

  setUnavailabilityModal({
    open: true,
    outlet: outlet,
    mode: "restore",
  });
};

const handleConfirmUnavailability = async () => {
  const outlet = unavailabilityModal.outlet;

  if (!outlet) {
    console.error("No outlet selected");
    return;
  }

  const {
    fromDate,
    toDate,
    reason,
  } = unavailabilityForm;

  // ==========================================
  // VALIDATION
  // ==========================================

  if (!fromDate || !toDate || !reason.trim()) {
    alert(
      "Please select From Date, To Date and Reason."
    );
    return;
  }

  if (
    new Date(fromDate) >=
    new Date(toDate)
  ) {
    alert(
      "To Date & Time must be after From Date & Time."
    );
    return;
  }

  try {
    setSavingUnavailability(true);

    // ==========================================
    // POST OUTLET UNAVAILABILITY
    // ==========================================

    const response = await setOutletUnavailable(
      Number(outlet.outletId),
      fromDate,
      toDate,
      reason.trim()
    );

    console.log(
      "OUTLET UNAVAILABILITY RESPONSE:",
      response
    );

    // ==========================================
    // SAVE UNAVAILABILITY DETAILS
    // ==========================================

    const savedData = {
      fromDate,
      toDate,
      reason: reason.trim(),

      markedOn:
        response?.timestamp ||
        new Date().toISOString(),
    };

    setUnavailabilityData((prev) => {
      const updated = {
        ...prev,
        [outlet.outletId]: savedData,
      };

      // Persist after refresh
      localStorage.setItem(
        "jippy_outlet_unavailability",
        JSON.stringify(updated)
      );

      return updated;
    });

    // ==========================================
    // UPDATE TOGGLE UI
    // ==========================================

    setOutlets((prev) =>
      prev.map((item) =>
        Number(item.outletId) ===
        Number(outlet.outletId)
          ? {
              ...item,
              isToggle: false,
              isAvailable: false,
            }
          : item
      )
    );

    // ==========================================
    // CLOSE POPUP
    // ==========================================

    setUnavailabilityModal({
      open: false,
      outlet: null,
      mode: "create",
    });

    setSelectedOutlet(null);

    setUnavailabilityForm({
      fromDate: "",
      toDate: "",
      reason: "",
    });

    // ==========================================
    // KEEP OUTLET EXPANDED
    // ==========================================

    setExpandedOutletId(
      Number(outlet.outletId)
    );

  } catch (error) {
    console.error(
      "Failed to mark outlet unavailable:",
      error
    );

    alert(
      error?.response?.data?.message ||
      "Failed to mark outlet unavailable."
    );
  } finally {
    setSavingUnavailability(false);
  }
};


// =========================================================
// CONFIRM OUTLET RESTORE
// OFF → ON
// =========================================================

const handleConfirmOutletRestore = async () => {
  if (!selectedOutlet?.outletId) {
    return;
  }

  try {
    setSavingUnavailability(true);

    const response = await restoreOutletUnavailability(
      selectedOutlet.outletId
    );

    console.log(
      "OUTLET RESTORE RESPONSE:",
      response
    );

    // =========================================================
    // TURN OUTLET ON AFTER SUCCESSFUL API CALL
    // =========================================================

    setOutlets((prev) =>
      prev.map((item) =>
        Number(item.outletId) ===
        Number(selectedOutlet.outletId)
          ? {
              ...item,
              isToggle: true,
              isAvailable: true,
            }
          : item
      )
    );

    // =========================================================
    // REMOVE OUTLET UNAVAILABILITY DATA
    // =========================================================

    setUnavailabilityData((prev) => {
      const updated = {
        ...prev,
      };

      delete updated[selectedOutlet.outletId];

      localStorage.setItem(
        "jippy_outlet_unavailability",
        JSON.stringify(updated)
      );

      return updated;
    });

    // =========================================================
    // CLOSE RESTORE POPUP
    // =========================================================

    setUnavailabilityModal({
      open: false,
      outlet: null,
      mode: "create",
    });

    setSelectedOutlet(null);

    // =========================================================
    // CLOSE EXPANDED OUTLET DETAILS
    // =========================================================

    setExpandedOutletId(null);

  } catch (error) {
    console.error(
      "OUTLET RESTORE ERROR:",
      error
    );

    alert(
      error?.response?.data?.message ||
      "Failed to restore outlet availability."
    );
  } finally {
    setSavingUnavailability(false);
  }
};
  // const API_BASE_URL =
  //   "http://srv1617582.hstgr.cloud:8084";

>>>>>>> Stashed changes
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

// const fetchOutlets = async () => {
//   try {
//     setLoading(true);

//     // 1. Get all outlets
//     const data = await getAllOutlets();

//     if (!Array.isArray(data)) {
//       setOutlets([]);
//       return;
//     }

//     // 2. Get complete details for every outlet
//     //    because /api/fm/outlets does NOT return isToggle
//     const outletsWithAvailability = await Promise.all(
//       data.map(async (outlet) => {
//         try {
//           const details = await getOutletDetails(
//             Number(outlet.outletId)
//           );

//           console.log(
//             `OUTLET ${outlet.outletId} DETAILS:`,
//             details
//           );

//           return {
//             ...outlet,

//             // Get toggle from outlet-details API
//             isToggle: details?.isToggle === true,

//             // Get availability from outlet-details API
//             isAvailable: details?.isAvailable === true,
//           };
//         } catch (error) {
//           console.error(
//             `Failed to fetch details for outlet ${outlet.outletId}:`,
//             error
//           );

//           // Keep original outlet if details API fails
//           return outlet;
//         }
//       })
//     );

//     console.log(
//       "FINAL OUTLETS WITH AVAILABILITY:",
//       outletsWithAvailability
//     );

//     setOutlets(outletsWithAvailability);

//   } catch (error) {
//     console.error(
//       "Failed to fetch outlets:",
//       error
//     );

//     setOutlets([]);

//   } finally {
//     setLoading(false);
//   }
// };
//   // =========================================================
//   // INITIAL LOAD
//   // =========================================================

//   useEffect(() => {
//     fetchOutlets();
//     fetchOutletCount();
//   }, []);


  const fetchOutlets = async () => {
    try {
      setLoading(true);

      const data = await getAllOutlets();

<<<<<<< Updated upstream
      setOutlets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch outlets:", error);
      setOutlets([]);
    } finally {
      setLoading(false);
    }
  };
    if (!Array.isArray(data)) {
      setOutlets([]);
      return;
    }

    const outletsWithAvailability = await Promise.all(
      data.map(async (outlet) => {
        try {
          const details = await getOutletDetails(
            Number(outlet.outletId)
          );
          console.log(
  "OUTLET ID:",
  outlet.outletId,
  "DETAILS isToggle:",
  details?.isToggle
);

          console.log(
            `OUTLET ${outlet.outletId} DETAILS:`,
            details
          );

          return {
            ...outlet,

            isToggle:
              details?.isToggle === true,

            isAvailable:
              details?.isAvailable === true,
          };
        } catch (error) {
          console.error(
            `Failed to fetch details for outlet ${outlet.outletId}:`,
            error
          );

          return outlet;
        }
      })
    );

    console.log(
      "FINAL OUTLETS WITH AVAILABILITY:",
      outletsWithAvailability
    );

    setOutlets(outletsWithAvailability);

  } catch (error) {
    console.error(
      "Failed to fetch outlets:",
      error
    );

    setOutlets([]);

  } finally {
    setLoading(false);
  }
};
>>>>>>> Stashed changes

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
// OPEN OUTLET PROFILE DETAILS
// =========================================================

const handleOutletProfile = (outlet) => {
  if (!outlet?.outletId) {
    console.error("Outlet ID not found:", outlet);
    return;
  }

  // Store selected outlet for OutletProfileDetails.jsx
  sessionStorage.setItem(
    "selectedOutlet",
    JSON.stringify(outlet)
  );

  console.log(
    "OPENING OUTLET PROFILE:",
    outlet.outletId
  );

  if (setActivePage) {
    setActivePage("outletProfileDetails");
  }
};

  // =========================================================
  // EDIT OUTLET
  // =========================================================

  const handleEditOutlet = (outlet) => {
    console.log(
      "================================"
    );

    console.log(
      "EDIT OUTLET CLICKED"
    );

    console.log(
      "FULL OUTLET:",
      outlet
    );

    const outletId =
      outlet?.outletId ??
      outlet?.id;

    if (!outletId) {
      alert(
        "Outlet ID not found."
      );
      return;
    }

    sessionStorage.setItem(
      "selectedOutlet",
      JSON.stringify(outlet)
    );

    sessionStorage.setItem(
      "editOutletId",
      String(outletId)
    );

    console.log(
      "EDIT OUTLET ID:",
      outletId
    );

    console.log(
      "MERCHANT ID FROM TABLE:",
      outlet?.merchantId
    );

    console.log(
      "================================"
    );

    if (setActivePage) {
      setActivePage(
        "outletEdit"
      );
    }
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
      "Availability",
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
  // BULK UPLOAD & DRAG DROP (Supports Excel + CSV)
  // =========================================================

  const handleBulkUpload = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setBulkFile(file);
    console.log(
      "Selected outlet bulk upload file:",
      file
    );
  };

  const submitBulkUpload = async () => {
    if (!bulkFile) {
      alert("Please select an Excel or CSV file first.");
      return;
    }

    try {
      setUploading(true);
      setUploadResult(null); // Clear previous results

      const response = await uploadOutletsBulk(bulkFile);
      console.log("Bulk upload response:", response);

      // Save full response object to display stats and validation/duplicate errors
      setUploadResult(response);

      if (response?.data?.successCount > 0 && response?.data?.failureCount === 0) {
        alert("Outlets uploaded/updated successfully!");
        setBulkFile(null);
        const fileInput = document.getElementById("outlet-file-input");
        if (fileInput) fileInput.value = "";
      }

      // Refresh outlets and counts
      fetchOutlets();
      fetchOutletCount();
    } catch (error) {
      console.error("Bulk upload error:", error);
      alert(`Failed to upload file: ${error.response?.data?.message || error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleBulkUpload({ target: { files } });
    }
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
  ["areaId", "Area ID"],
  ["stateId", "State ID"],
  ["availability", "Availability"],
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
            Upload an Excel or CSV file to import or
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

        <div 
          className={`jippy-all-outlets-upload-area ${isDragging ? "jippy-drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >

          <label htmlFor="outlet-file-input">
            Select Excel/CSV File or Drag & Drop here
          </label>

          <input
            id="outlet-file-input"
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={handleBulkUpload}
          />

          <small>
            {bulkFile ? `Selected: ${bulkFile.name}` : "File should contain Outlet Name, Phone, Address, Merchant ID, Status and Outlet ID for updates."}
          </small>

          <button
            type="button"
            className="jippy-all-outlets-bulk-btn"
            onClick={submitBulkUpload}
            disabled={uploading}
          >
            <FiUpload />
            {uploading ? "Uploading..." : "Bulk Update"}
          </button>

        </div>

      </div>

      {/* =========================================================
          BULK UPLOAD RESULT / DUPLICATE DETAILS
      ========================================================= */}

      {uploadResult && (
        <div
          className={`jippy-upload-feedback-card ${
            uploadResult.data?.failureCount > 0
              ? "jippy-upload-has-errors"
              : "jippy-upload-success"
          }`}
          style={{
            padding: "16px",
            margin: "15px 0",
            borderRadius: "8px",
            background:
              uploadResult.data?.failureCount > 0
                ? "#fff5f5"
                : "#f0fff4",
            border:
              uploadResult.data?.failureCount > 0
                ? "1px solid #feb2b2"
                : "1px solid #9ae6b4",
          }}
        >
          {/* SUMMARY */}
          <h3
            style={{
              margin: "0 0 8px 0",
              color:
                uploadResult.data?.failureCount > 0
                  ? "#c53030"
                  : "#22543d",
            }}
          >
            {uploadResult.data?.failureCount > 0
              ? "Upload Completed with Errors"
              : "Upload Successful"}
          </h3>

          <p
            style={{
              margin: "0 0 12px 0",
              fontSize: "14px",
            }}
          >
            {uploadResult.message || "Upload Summary"}
          </p>

          {/* COUNTS */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "15px",
              fontSize: "14px",
              flexWrap: "wrap",
            }}
          >
            <span>
              Total Rows:{" "}
              <strong>
                {uploadResult.data?.totalRows ?? 0}
              </strong>
            </span>

            <span style={{ color: "#15803d" }}>
              Success:{" "}
              <strong>
                {uploadResult.data?.successCount ?? 0}
              </strong>
            </span>

            <span style={{ color: "#dc2626" }}>
              Failed:{" "}
              <strong>
                {uploadResult.data?.failureCount ?? 0}
              </strong>
            </span>
          </div>

          {/* DUPLICATE / FAILURE DETAILS */}
          {uploadResult.data?.errors?.length > 0 && (
            <div
              className="jippy-upload-error-list"
              style={{
                marginTop: "10px",
                padding: "12px",
                background: "#ffffff",
                border: "1px solid #f5c2c7",
                borderRadius: "6px",
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px 0",
                  color: "#b91c1c",
                  fontSize: "15px",
                }}
              >
                Duplicate / Failed Rows
              </h4>

              {uploadResult.data.errors.map((err, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "10px",
                    marginBottom:
                      idx < uploadResult.data.errors.length - 1
                        ? "8px"
                        : "0",
                    background: "#fff7f7",
                    border: "1px solid #fecaca",
                    borderRadius: "5px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#991b1b",
                      marginBottom: "5px",
                    }}
                  >
                    ❌ Duplicate / Failed Row
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#374151",
                      lineHeight: "1.6",
                    }}
                  >
                    <div>
                      <strong>Excel Row:</strong>{" "}
                      {err.rowNumber ?? "-"}
                    </div>

                    <div>
                      <strong>Outlet Name:</strong>{" "}
                      {err.outletName ?? "-"}
                    </div>

                    <div>
                      <strong>Reason:</strong>{" "}
                      <span style={{ color: "#b91c1c" }}>
                        {err.reason ?? "Unknown error"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

        {/* TABLE */}

{/* TABLE */}

{/* ============================================================
    OUTLETS TABLE
============================================================ */}

<div className="jippy-all-outlets-table-scroll">

  <table className="jippy-all-outlets-table">

    {/* ========================================================
        TABLE HEADER
    ======================================================== */}

   <thead>
  <tr>

    {/* EXPAND */}
    <th className="jippy-all-outlets-expand-header">
      <span className="jippy-all-outlets-expand-header-space">
        &nbsp;
      </span>
    </th>

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

<<<<<<< Updated upstream
                <th className="jippy-all-outlets-actions-header">
                  Actions
                </th>
=======
    {visibleColumns.menuItemCount && (
      <th>Menu Items</th>
    )}

    {visibleColumns.areaId && (
      <th>Area ID</th>
    )}
>>>>>>> Stashed changes

    {visibleColumns.stateId && (
      <th>State ID</th>
    )}

    {/* AVAILABILITY */}
    <th className="jippy-all-outlets-availability-header">
      isToggle
    </th>

    {/* ACTIONS */}
    <th className="jippy-all-outlets-actions-header">
      Actions
    </th>

  </tr>
</thead>


    {/* ========================================================
        TABLE BODY
    ======================================================== */}

    <tbody>
  {loading ? (
    <tr>
      <td
        colSpan="12"
        className="jippy-all-outlets-message"
      >
        Loading outlets...
      </td>
    </tr>
  ) : displayedOutlets.length === 0 ? (
    <tr>
      <td
        colSpan="12"
        className="jippy-all-outlets-message"
      >
        No outlets found
      </td>
    </tr>
  ) : (
    displayedOutlets.map((outlet) => {

      const isExpanded =
        expandedOutletId ===
        Number(outlet.outletId);

      const savedUnavailability =
        unavailabilityData[
          outlet.outletId
        ];

      return (
        <React.Fragment
          key={outlet.outletId}
        >

          {/* ================================================= */}
          {/* MAIN OUTLET ROW */}
          {/* ================================================= */}

          <tr
            className={
              isExpanded
                ? "jippy-all-outlets-main-row expanded"
                : "jippy-all-outlets-main-row"
            }
          >

            {/* EXPAND BUTTON */}
            <td className="jippy-all-outlets-expand-cell">
             <button
  type="button"
  className="jippy-all-outlets-expand-btn"
 onClick={() =>
  handleExpandOutlet(outlet.outletId)
}
  title={
    isExpanded
      ? "Collapse"
      : "Expand"
  }
  aria-label={
    isExpanded
      ? "Collapse outlet details"
      : "Expand outlet details"
  }
>
  {isExpanded ? (
    <FiMinus />
  ) : (
    <FiPlus />
  )}
</button>
            </td>

            {/* OUTLET ID */}
            {visibleColumns.outletId && (
              <td>
                {outlet.outletId}
              </td>
            )}

<<<<<<< Updated upstream
                      {visibleColumns.outletId && (
                        <td>
                          {outlet.outletId ??
                            "-"}
                        </td>
                      )}

                      {visibleColumns.outletName && (
                        <td className="jippy-all-outlets-name">
=======
            {/* OUTLET NAME */}
            {visibleColumns.outletName && (
  <td>
    <strong
      className="jippy-outlet-name-link"
      onClick={() => handleOutletProfile(outlet)}
      title="View Outlet Details"
    >
      {outlet.outletName || "-"}
    </strong>
  </td>
)}

            {/* MERCHANT ID */}
            {visibleColumns.merchantId && (
              <td>
                {outlet.merchantId ?? "-"}
              </td>
            )}

            {/* CUISINE */}
            {visibleColumns.cuisineType && (
              <td>
                {outlet.cuisineType ||
                  outlet.cuisineTypeName ||
                  "-"}
              </td>
            )}

            {/* PHONE */}
            {visibleColumns.outletPhone && (
              <td>
                {outlet.outletPhone || "-"}
              </td>
            )}
>>>>>>> Stashed changes

            {/* STATUS */}
            {visibleColumns.status && (
              <td>
                <span
                  className={`jippy-all-outlets-status ${
                    outlet.isActive === "Y"
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {outlet.isActive === "Y"
                    ? "Active"
                    : "Inactive"}
                </span>
              </td>
            )}

            {/* MENU ITEMS */}
            {visibleColumns.menuItemCount && (
              <td>
                {outlet.menuItemCount ?? 0}
              </td>
            )}

            {/* AREA */}
            {visibleColumns.areaId && (
              <td>
                {outlet.areaId ?? "-"}
              </td>
            )}

            {/* STATE */}
            {visibleColumns.stateId && (
              <td>
                {outlet.stateId ?? "-"}
              </td>
            )}

            {/* AVAILABILITY */}
           {visibleColumns.availability && (
<td>
  <label className="jippy-outlet-toggle">
   <input
  type="checkbox"
  checked={outlet.isToggle === true}
  onChange={() => handleOutletToggle(outlet)}
/>

<<<<<<< Updated upstream
                      {visibleColumns.merchantId && (
                        <td>
                          {outlet.merchantId ??
                            "-"}
                        </td>
                      )}

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

                      {visibleColumns.outletPhone && (
                        <td>
                          {outlet.outletPhone ||
                            "-"}
                        </td>
                      )}

                      {visibleColumns.status && (
                        <td>
=======
    <span className="jippy-outlet-toggle-slider" />
  </label>
</td>
)}

            {/* ACTIONS */}
            <td className="jippy-all-outlets-actions-cell">
              <div className="jippy-all-outlets-actions">

                <button
                  type="button"
                  className="jippy-all-outlets-edit-btn"
                  title="Edit Outlet"
                  aria-label="Edit Outlet"
                  onClick={() =>
                    handleEditOutlet(outlet)
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
                    handleDeleteOutlet(outlet)
                  }
                >
                  <FiTrash2 />
                </button>

              </div>
            </td>

          </tr>


          {/* ================================================= */}
          {/* EXPANDED DETAILS */}
          {/* ================================================= */}
>>>>>>> Stashed changes

          {isExpanded && (
            <tr className="jippy-all-outlets-expanded-row">

              <td
                colSpan="12"
                className="jippy-all-outlets-expanded-cell"
              >

                <div className="jippy-all-outlets-expanded-content">

                  {/* ADDRESS DETAILS */}

                  <div className="jippy-all-outlets-address-grid">

                    <div className="jippy-outlet-detail-item">
                      <span className="jippy-outlet-detail-label">
                        🏠 Building No.
                      </span>

                      <strong>
                        {outlet.buildingNumber ||
                          "-"}
                      </strong>
                    </div>


                    <div className="jippy-outlet-detail-item">
                      <span className="jippy-outlet-detail-label">
                        🛣️ Road
                      </span>

                      <strong>
                        {outlet.road || "-"}
                      </strong>
                    </div>


                    <div className="jippy-outlet-detail-item">
                      <span className="jippy-outlet-detail-label">
                        📍 Landmark
                      </span>

                      <strong>
                        {outlet.landmark || "-"}
                      </strong>
                    </div>


                    <div className="jippy-outlet-detail-item">
                      <span className="jippy-outlet-detail-label">
                        🗺️ Area ID
                      </span>

                      <strong>
                        {outlet.areaId ?? "-"}
                      </strong>
                    </div>


                    <div className="jippy-outlet-detail-item">
                      <span className="jippy-outlet-detail-label">
                        🏛️ State ID
                      </span>

                      <strong>
                        {outlet.stateId ?? "-"}
                      </strong>
                    </div>


                    <div className="jippy-outlet-detail-item jippy-outlet-full-address">
                      <span className="jippy-outlet-detail-label">
                        📍 Full Address
                      </span>

                      <strong>
                        {[
                          outlet.buildingNumber,
                          outlet.road,
                          outlet.landmark,
                        ]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </strong>
                    </div>

                  </div>


                  {/* ================================================= */}
                  {/* UNAVAILABILITY DETAILS */}
                  {/* ================================================= */}

                  {savedUnavailability && (
                    <div className="jippy-outlet-unavailability-card">

                      <div className="jippy-outlet-unavailability-heading">

                        <div>
                          <FiCalendar />

                          <span>
                            Outlet Unavailability
                            {" "}
                            <span className="jippy-outlet-unavailable-status">
                              (Currently Unavailable)
                            </span>
                          </span>
                        </div>

                      </div>


                      <div className="jippy-outlet-unavailability-content">

                        <div className="jippy-unavailability-info">

                          <span>
                            From Date & Time
                          </span>

                          <strong>
                            {formatUnavailabilityDate(
                              savedUnavailability.fromDate
                            )}
                          </strong>

<<<<<<< Updated upstream
                      {visibleColumns.menuItemCount && (
                        <td>
                          {outlet.menuItemCount ??
                            0}
                        </td>
                      )}

                      {visibleColumns.address && (
                        <td className="jippy-all-outlets-address">
=======
                        </div>


                        <div className="jippy-unavailability-info">

                          <span>
                            To Date & Time
                          </span>
>>>>>>> Stashed changes

                          <strong>
                            {formatUnavailabilityDate(
                              savedUnavailability.toDate
                            )}
                          </strong>

                        </div>

<<<<<<< Updated upstream
                      {visibleColumns.areaId && (
                        <td>
                          {outlet.areaId ??
                            "-"}
                        </td>
                      )}

                      {visibleColumns.stateId && (
                        <td>
                          {outlet.stateId ??
                            "-"}
                        </td>
                      )}

                      <td>
=======

                        <div className="jippy-unavailability-info reason">

                          <span>
                            Reason
                          </span>

                          <strong>
                            {savedUnavailability.reason}
                          </strong>

                        </div>

>>>>>>> Stashed changes

                        <div className="jippy-unavailability-info">

<<<<<<< Updated upstream
                          <button
                            type="button"
                            className="jippy-all-outlets-edit-btn"
                            title="Edit Outlet"
                            aria-label="Edit Outlet"
                            onClick={() => handleEditOutlet(outlet)}
                          >
                            <FiEdit2 />
                          </button>
=======
                          <span>
                            Marked On
                          </span>

                          <strong>
                            {formatUnavailabilityDate(
                              savedUnavailability.markedOn
                            )}
                          </strong>

                        </div>


                        <div className="jippy-unavailability-edit-wrapper">
>>>>>>> Stashed changes

                          <button
                            type="button"
                            className="jippy-edit-unavailability-btn"
                            onClick={() =>
                              handleEditUnavailability(
                                outlet
                              )
                            }
                          >
                            <FiEdit2 />
                            Edit Unavailability
                          </button>

                        </div>

                      </div>

                    </div>
                  )}

                </div>

              </td>

            </tr>
          )}

        </React.Fragment>
      );
    })
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

{unavailabilityModal.open && (
  <div className="jippy-unavailability-modal-overlay">
    <div className="jippy-unavailability-modal">

      {unavailabilityModal.mode === "restore" ? (

        <>
          <div className="jippy-unavailability-modal-header">

            <h2>
              Make Outlet Available
            </h2>

            <button
              type="button"
              className="jippy-unavailability-modal-close"
              onClick={() => {
                setUnavailabilityModal({
                  open: false,
                  outlet: null,
                  mode: "create",
                });

                setSelectedOutlet(null);
              }}
            >
              <FiX />
            </button>

          </div>

          <div className="jippy-unavailability-modal-info">

            <FiInfo />

            <span>
              This outlet is currently unavailable.
              Do you want to make this outlet available again?
            </span>

          </div>

          <div className="jippy-unavailability-modal-actions">

            <button
              type="button"
              className="jippy-unavailability-cancel-btn"
              onClick={() => {
                setUnavailabilityModal({
                  open: false,
                  outlet: null,
                  mode: "create",
                });

                setSelectedOutlet(null);
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="jippy-unavailability-confirm-btn"
              onClick={handleConfirmOutletRestore}
              disabled={savingUnavailability}
            >
              {savingUnavailability
                ? "Restoring..."
                : "Confirm & Turn ON"}
            </button>

          </div>
        </>

      ) : (

        <>
          {/* =========================================
              YOUR EXISTING MARK UNAVAILABLE MODAL
              KEEP THIS EXACTLY AS IT WAS
          ========================================= */}

          <div className="jippy-unavailability-modal-header">

            <h2>
              {unavailabilityModal.mode === "edit"
                ? "Edit Outlet Unavailability"
                : "Mark Outlet as Unavailable"}
            </h2>

            <button
              type="button"
              className="jippy-unavailability-modal-close"
              onClick={() => {
                setUnavailabilityModal({
                  open: false,
                  outlet: null,
                  mode: "create",
                });

                setSelectedOutlet(null);
              }}
            >
              <FiX />
            </button>

          </div>

          <div className="jippy-unavailability-modal-info">

            <FiInfo />

            <span>
              Please select the unavailability period and reason.
              The outlet will be marked as unavailable during this time.
            </span>

          </div>

          {/* FROM + TO */}

          <div className="jippy-unavailability-form-row">

            <div className="jippy-unavailability-field">

              <label>
                From Date & Time <span>*</span>
              </label>

              <div className="jippy-unavailability-input-wrapper">

                <input
                  type="datetime-local"
                  value={unavailabilityForm.fromDate}
                  onChange={(event) =>
                    setUnavailabilityForm((prev) => ({
                      ...prev,
                      fromDate: event.target.value,
                    }))
                  }
                />

                <FiCalendar />

              </div>

            </div>

            <div className="jippy-unavailability-field">

              <label>
                To Date & Time <span>*</span>
              </label>

              <div className="jippy-unavailability-input-wrapper">

                <input
                  type="datetime-local"
                  value={unavailabilityForm.toDate}
                  onChange={(event) =>
                    setUnavailabilityForm((prev) => ({
                      ...prev,
                      toDate: event.target.value,
                    }))
                  }
                />

                <FiCalendar />

              </div>

            </div>

          </div>

          {/* REASON */}

          <div className="jippy-unavailability-field">

            <label>
              Reason <span>*</span>
            </label>

            <textarea
              value={unavailabilityForm.reason}
              onChange={(event) =>
                setUnavailabilityForm((prev) => ({
                  ...prev,
                  reason: event.target.value,
                }))
              }
              placeholder="Enter reason for outlet unavailability"
              rows={4}
            />

          </div>

          {/* ACTIONS */}

          <div className="jippy-unavailability-modal-actions">

            <button
              type="button"
              className="jippy-unavailability-cancel-btn"
              onClick={() => {
                setUnavailabilityModal({
                  open: false,
                  outlet: null,
                  mode: "create",
                });

                setSelectedOutlet(null);
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="jippy-unavailability-confirm-btn"
              onClick={handleConfirmUnavailability}
              disabled={savingUnavailability}
            >
              {savingUnavailability
                ? "Saving..."
                : unavailabilityModal.mode === "edit"
                  ? "Update & Save"
                  : "Confirm & Turn OFF"}
            </button>

          </div>

        </>

      )}

    </div>

  </div>
)}

  </div>
  </div>
);

}

export default AllOutletsList;