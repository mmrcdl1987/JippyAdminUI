import "../styles/AllOutletsList.css";

import React, { useEffect, useMemo, useState } from "react";

import {
  getAllOutlets,
  getOutletDetails,
  getOutletCount,
  uploadOutletsBulk,
  setOutletUnavailable,
  restoreOutletUnavailability,

    toggleOutlet,

} from "../services/outletListService";
import { getCompleteOrdersFlowCounts } from "../services/orderService";

import {
  FiSearch,
  FiDownloadCloud,
  FiUpload,
  FiCheck,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiX,
  FiCalendar,
  FiInfo,
  FiHome,
  FiCheckCircle,
  FiXCircle,
  FiLayers,
  FiPackage,
} from "react-icons/fi";

function AllOutletsList({ setActivePage }) {
  const [unavailabilityModal, setUnavailabilityModal] =
    useState({
      open: false,
      outlet: null,
      mode: "create",
    });

  const [unavailabilityForm, setUnavailabilityForm] =
    useState({
      fromDate: "",
      toDate: "",
      reason: "",
    });

  const [unavailabilityData, setUnavailabilityData] =
    useState(() => {
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
  const [expandedOutletId, setExpandedOutletId] =
    useState(null);

  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(30);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  const [outletStatus, setOutletStatus] = useState(null);
  const [outletType, setOutletType] = useState(null);
  const [globalStatus, setGlobalStatus] = useState("OPEN");

  const [showExportMenu, setShowExportMenu] =
    useState(false);

  const [showTurnOnConfirm, setShowTurnOnConfirm] = useState(false);
const [turnOnOutlet, setTurnOnOutlet] = useState(null);
const [turningOn, setTurningOn] = useState(false);
const [showTurnOnSuccess, setShowTurnOnSuccess] = useState(false);
const [turnOnSuccessMessage, setTurnOnSuccessMessage] = useState("");


  // DRAG AND DROP & BULK UPLOAD STATE
  const [isDragging, setIsDragging] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  // =========================================================
  // COLUMNS
  // =========================================================

  const [showColumnsMenu, setShowColumnsMenu] =
    useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    outletId: true,
    outletName: true,
    merchantId: true,
    cuisineType: true,
    outletPhone: true,
    status: true,
    menuItemCount: true,
    orders: true,
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
      orders: true,
      areaId: true,
      stateId: true,
      availability: true,
    });
  };

  // =========================================================
  // EXPAND OUTLET
  // =========================================================

  const handleExpandOutlet = (outletId) => {
    const id = Number(outletId);

    if (!id) {
      console.error(
        "Outlet ID not found:",
        outletId
      );
      return;
    }

    setExpandedOutletId((prev) =>
      prev === id ? null : id
    );
  };

  // =========================================================
  // EDIT UNAVAILABILITY
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

  // =========================================================
  // FORMAT DATE
  // =========================================================

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

// const handleOutletToggle = (outlet) => {
//   if (!outlet?.outletId) {
//     console.error("Outlet ID not found");
//     return;
//   }

//   // ==========================================
//   // ON → OFF
//   // ==========================================

//   if (outlet.isToggle === true) {
//     setSelectedOutlet(outlet);

//     setUnavailabilityForm({
//       fromDate: "",
//       toDate: "",
//       reason: "",
//     });

//     setUnavailabilityModal({
//       open: true,
//       outlet: outlet,
//       mode: "create",
//     });

//     return;
//   }

//   // ==========================================
//   // OFF → ON
//   // OPEN RESTORE CONFIRMATION
//   // ==========================================

//   setSelectedOutlet(outlet);

//   setUnavailabilityModal({
//     open: true,
//     outlet: outlet,
//     mode: "restore",
//   });
// };



// const handleOutletToggle = async (outlet) => {
//   if (!outlet?.outletId) {
//     console.error("Outlet ID not found");
//     return;
//   }

//   const outletId = Number(outlet.outletId);

//   try {
//     setSelectedOutlet(outlet);

//     const details = await getOutletDetails(outletId);

//     console.log(`OUTLET ${outletId} DETAILS:`, details);

//     const isToggle = details?.isToggle === true;
//     const isAvailable = details?.isAvailable === true;

//     const latestOutlet = {
//       ...outlet,
//       isToggle,
//       isAvailable,
//     };

//     setOutlets((prev) =>
//       prev.map((item) =>
//         Number(item.outletId) === outletId
//           ? latestOutlet
//           : item
//       )
//     );

//     // ==========================================
//     // ON → OFF
//     // ==========================================

//     if (isToggle === true) {
//       setUnavailabilityForm({
//         fromDate: "",
//         toDate: "",
//         reason: "",
//       });

//       setUnavailabilityModal({
//         open: true,
//         outlet: latestOutlet,
//         mode: "create",
//       });

//       return;
//     }

//     // ==========================================
//     // OFF → ON
//     // DIRECTLY CALL TOGGLE API
//     // ==========================================

//     const response = await toggleOutlet(
//       outletId,
//       true
//     );

//     console.log(
//       "TOGGLE OUTLET RESPONSE:",
//       response
//     );

//     // Update UI after successful API call
//     setOutlets((prev) =>
//       prev.map((item) =>
//         Number(item.outletId) === outletId
//           ? {
//               ...item,
//               isToggle: true,
//               isAvailable: true,
//             }
//           : item
//       )
//     );

//     // SUCCESS POPUP
//    alert(
//   response?.statusMsg ||
//     "Outlet toggle enabled successfully"
// );

//   } catch (error) {
//     console.error(
//       "OUTLET TOGGLE ERROR:",
//       error
//     );

//     setSelectedOutlet(null);

//     alert(
//       error?.response?.data?.message ||
//         error?.response?.data?.statusMsg ||
//         "Failed to update outlet availability."
//     );
//   }
// };


const handleOutletToggle = async (outlet) => {
  if (!outlet?.outletId) {
    console.error("Outlet ID not found");
    return;
  }

  const outletId = Number(outlet.outletId);

  try {
    setSelectedOutlet(outlet);

    // Get latest toggle status only when user clicks
    const details = await getOutletDetails(outletId);

    console.log(
      `OUTLET ${outletId} DETAILS:`,
      details
    );

    const isToggle = details?.isToggle === true;
    const isAvailable = details?.isAvailable === true;

    const latestOutlet = {
      ...outlet,
      isToggle,
      isAvailable,
    };

    setOutlets((prev) =>
      prev.map((item) =>
        Number(item.outletId) === outletId
          ? latestOutlet
          : item
      )
    );

    // ==========================================
    // ON → OFF
    // ==========================================

    if (isToggle === true) {
      setUnavailabilityForm({
        fromDate: "",
        toDate: "",
        reason: "",
      });

      setUnavailabilityModal({
        open: true,
        outlet: latestOutlet,
        mode: "create",
      });

      return;
    }

    // ==========================================
    // OFF → ON
    // SHOW CONFIRMATION POPUP
    // ==========================================

    setTurnOnOutlet(latestOutlet);
    setShowTurnOnConfirm(true);

  } catch (error) {
    console.error(
      `Failed to fetch availability for outlet ${outletId}:`,
      error
    );

    setSelectedOutlet(null);

    // Don't use alert
    alert(
      error?.response?.data?.message ||
        "Unable to fetch outlet availability. Please try again."
    );
  }
};


const handleConfirmTurnOn = async () => {
  if (!turnOnOutlet?.outletId) {
    return;
  }

  try {
    setTurningOn(true);

    const outletId = Number(turnOnOutlet.outletId);

    const response = await toggleOutlet(
      outletId,
      true
    );

    console.log(
      "TOGGLE OUTLET RESPONSE:",
      response
    );

    // Update outlet in UI
    setOutlets((prev) =>
      prev.map((item) =>
        Number(item.outletId) === outletId
          ? {
              ...item,
              isToggle: true,
              isAvailable: true,
            }
          : item
      )
    );

    // Close confirmation popup
    setShowTurnOnConfirm(false);
    setTurnOnOutlet(null);

    // Success popup
    setTurnOnSuccessMessage(
      response?.statusMsg ||
        "Outlet toggle enabled successfully"
    );

    setShowTurnOnSuccess(true);

  } catch (error) {
    console.error(
      "OUTLET TOGGLE ERROR:",
      error
    );

    alert(
      error?.response?.data?.message ||
        error?.response?.data?.statusMsg ||
        "Failed to turn on outlet."
    );
  } finally {
    setTurningOn(false);
  }
};


const handleCancelTurnOn = () => {
  setShowTurnOnConfirm(false);
  setTurnOnOutlet(null);
};  

  const handleConfirmUnavailability = async () => {
    const outlet =
      unavailabilityModal.outlet;

    if (!outlet) {
      console.error("No outlet selected");
      return;
    }

    const {
      fromDate,
      toDate,
      reason,
    } = unavailabilityForm;

    // =======================================================
    // VALIDATION
    // =======================================================

    if (
      !fromDate ||
      !toDate ||
      !reason.trim()
    ) {
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

      // =====================================================
      // POST OUTLET UNAVAILABILITY
      // =====================================================

      const response =
        await setOutletUnavailable(
          Number(outlet.outletId),
          fromDate,
          toDate,
          reason.trim()
        );

      console.log(
        "OUTLET UNAVAILABILITY RESPONSE:",
        response
      );

      // =====================================================
      // SAVE LOCAL DATA
      // =====================================================

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

        localStorage.setItem(
          "jippy_outlet_unavailability",
          JSON.stringify(updated)
        );

        return updated;
      });

      // =====================================================
      // UPDATE TOGGLE
      // =====================================================

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

      // =====================================================
      // CLOSE MODAL
      // =====================================================

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

      // Keep outlet expanded.
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
  // OFF -> ON
  // =========================================================

  const handleConfirmOutletRestore =
    async () => {
      if (!selectedOutlet?.outletId) {
        return;
      }

      try {
        setSavingUnavailability(true);

        const response =
          await restoreOutletUnavailability(
            selectedOutlet.outletId
          );

        console.log(
          "OUTLET RESTORE RESPONSE:",
          response
        );

        // ===================================================
        // TURN OUTLET ON
        // ===================================================

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

        // ===================================================
        // REMOVE LOCAL UNAVAILABILITY
        // ===================================================

        setUnavailabilityData((prev) => {
          const updated = {
            ...prev,
          };

          delete updated[
            selectedOutlet.outletId
          ];

          localStorage.setItem(
            "jippy_outlet_unavailability",
            JSON.stringify(updated)
          );

          return updated;
        });

        // ===================================================
        // CLOSE MODAL
        // ===================================================

        setUnavailabilityModal({
          open: false,
          outlet: null,
          mode: "create",
        });

        setSelectedOutlet(null);

        // ===================================================
        // CLOSE EXPANDED OUTLET DETAILS
        // ===================================================

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

  // =========================================================
  // FETCH OUTLET COUNT
  // =========================================================

  const fetchOutletCount = async () => {
    try {
      const count = await getOutletCount();

      setOutletCount(count);
    } catch (error) {
      console.error(
        "Failed to fetch outlet count:",
        error
      );

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

//     // 2. Get isToggle from admin outlet-details API
//     const outletsWithAvailability = [];

//     for (const outlet of data) {
//       try {
//         const details = await getOutletDetails(
//           Number(outlet.outletId)
//         );

//         console.log(
//           `OUTLET ${outlet.outletId} DETAILS:`,
//           details
//         );

//         outletsWithAvailability.push({
//           ...outlet,

//           isToggle:
//             details?.isToggle === true,

//           isAvailable:
//             details?.isAvailable === true,
//         });

//       } catch (error) {
//         console.error(
//           `Failed to fetch details for outlet ${outlet.outletId}:`,
//           error
//         );

//         // Don't force isToggle to false
//         // if the API request failed.
//         outletsWithAvailability.push({
//           ...outlet,
//         });
//       }
//     }

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
const fetchOutlets = async () => {
  try {
    setLoading(true);

    // 1. Load all outlets first
    const data = await getAllOutlets();

      if (!Array.isArray(data)) {
        setOutlets([]);
        return;
      }

    // 2. Show outlets immediately
    setOutlets(data);

    // 3. Fetch isToggle separately in background
    data.forEach(async (outlet) => {
      try {
        const details = await getOutletDetails(
          Number(outlet.outletId)
        );

        setOutlets((prev) =>
          prev.map((item) =>
            Number(item.outletId) ===
            Number(outlet.outletId)
              ? {
                  ...item,
                  isToggle:
                    details?.isToggle === true,
                  isAvailable:
                    details?.isAvailable === true,
                }
              : item
          )
        );
      } catch (error) {
        console.error(
          `Failed to fetch details for outlet ${outlet.outletId}:`,
          error
        );
      }
    });

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

  // =========================================================
  // INITIAL LOAD
  //
  // Only ONE useEffect.
  // =========================================================

useEffect(() => {
  fetchOutlets();
  fetchOutletCount();

  const fetchOrdersCount = async () => {
    try {
      const flowData = await getCompleteOrdersFlowCounts();
      if (flowData?.totalOrdersCount != null) {
        setTotalOrdersCount(flowData.totalOrdersCount);
      }
    } catch (err) {
      console.warn("Failed to load total orders count:", err);
    }
  };
  fetchOrdersCount();
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
      const cuisineNames = Array.isArray(
        outlet.cuisineNames
      )
        ? outlet.cuisineNames.join(", ")
        : "";

      const cuisineType = Array.isArray(
        outlet.cuisineType
      )
        ? outlet.cuisineType.join(", ")
        : String(outlet.cuisineType || "");

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
        String(outlet.merchantName || "")
          .toLowerCase()
          .includes(keyword) ||
        cuisineNames
          .toLowerCase()
          .includes(keyword) ||
        cuisineType
          .toLowerCase()
          .includes(keyword) ||
        String(outlet.outletPhone || "")
          .toLowerCase()
          .includes(keyword) ||
        String(outlet.areaName || "")
          .toLowerCase()
          .includes(keyword) ||
        String(outlet.stateName || "")
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
        outlet.isActive ===
          outletStatus.value;

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

  const activeOutletCount =
    outlets.filter(
      (outlet) =>
        outlet.isActive === "Y"
    ).length;

  const inactiveOutletCount =
    outlets.filter(
      (outlet) =>
        outlet.isActive !== "Y"
    ).length;

  // =========================================================
  // OPEN OUTLET PROFILE
  // =========================================================

  const handleOutletProfile = (
    outlet,
    initialTab = "Basic"
  ) => {
    if (!outlet?.outletId) {
      console.error(
        "Outlet ID not found:",
        outlet
      );
      return;
    }

    sessionStorage.setItem(
      "selectedOutlet",
      JSON.stringify(outlet)
    );

    sessionStorage.setItem(
      "selectedOutletTab",
      initialTab
    );

    console.log(
      "OPENING OUTLET PROFILE:",
      outlet.outletId,
      "TAB:",
      initialTab
    );

    if (setActivePage) {
      setActivePage(
        "outletProfileDetails"
      );
    }
  };

  // =========================================================
  // EDIT OUTLET
  // =========================================================

  const handleEditOutlet = (outlet) => {
  const outletId = outlet?.outletId ?? outlet?.id;

  if (!outletId) {
    alert("Outlet ID not found.");
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

  if (setActivePage) {
    setActivePage("outletEdit");
  }
};  
  // =========================================================
  // DELETE OUTLET
  // =========================================================

  const handleDeleteOutlet = (
    outlet
  ) => {
    if (!outlet?.outletId) {
      alert(
        "Outlet ID not available."
      );
      return;
    }

    const confirmed =
      window.confirm(
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
      alert(
        "No outlets available to export."
      );
      return;
    }

    const headers = [
      "Outlet ID",
      "Merchant Name",
      "Outlet Name",
      "Cuisine Type",
      "Outlet Phone",
      "Status",
      "Menu Items",
      "State Name",
      "Area Name",
      "Road",
      "Landmark",
      "Building Number",
      "Availability",
    ];

    const rows =
      filteredOutlets.map(
        (outlet) => [
          outlet.outletId,
          outlet.merchantName ||
            "-",
          outlet.outletName,
          Array.isArray(
            outlet.cuisineNames
          )
            ? outlet.cuisineNames.join(
                ", "
              )
            : "-",
          outlet.outletPhone,
          outlet.isActive === "Y"
            ? "Active"
            : "Inactive",
          outlet.menuItemCount,
          outlet.stateName ||
            "-",
          outlet.areaName ||
            "-",
          outlet.road,
          outlet.landmark,
          outlet.buildingNumber,
          outlet.isToggle === true
            ? "Available"
            : "Unavailable",
        ]
      );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(
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
    link.download =
      "outlets.csv";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);

    setShowExportMenu(false);
  };

  // =========================================================
  // BULK UPLOAD
  // =========================================================

  const handleBulkUpload = (
    event
  ) => {
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

  const submitBulkUpload =
    async () => {
      if (!bulkFile) {
        alert(
          "Please select an Excel or CSV file first."
        );
        return;
      }

      try {
        setUploading(true);
        setUploadResult(null);

        const response =
          await uploadOutletsBulk(
            bulkFile
          );

        console.log(
          "Bulk upload response:",
          response
        );

        setUploadResult(
          response
        );

        if (
          response?.data
            ?.successCount > 0 &&
          response?.data
            ?.failureCount === 0
        ) {
          alert(
            "Outlets uploaded/updated successfully!"
          );

          setBulkFile(null);

          const fileInput =
            document.getElementById(
              "outlet-file-input"
            );

          if (fileInput) {
            fileInput.value =
              "";
          }
        }

        // Refresh only the list API.
        fetchOutlets();
        fetchOutletCount();
      } catch (error) {
        console.error(
          "Bulk upload error:",
          error
        );

        alert(
          `Failed to upload file: ${
            error.response?.data
              ?.message ||
            error.message
          }`
        );
      } finally {
        setUploading(false);
      }
    };

  // =========================================================
  // DRAG OVER
  // =========================================================

  const handleDragOver = (
    e
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
  };

  // =========================================================
  // DRAG LEAVE
  // =========================================================

  const handleDragLeave = (
    e
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  };

  // =========================================================
  // DROP
  // =========================================================

  const handleDrop = (
    e
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);

    const files =
      e.dataTransfer.files;

    if (
      files &&
      files.length > 0
    ) {
      handleBulkUpload({
        target: { files },
      });
    }
  };

  // =========================================================
  // GLOBAL STATUS
  // =========================================================

  const handleApplyGlobalStatus =
    () => {
      console.log(
        "Global outlet status:",
        globalStatus
      );
    };

  // =========================================================
  // COLUMN OPTIONS
  // =========================================================

  const columnOptions = [
    [
      "outletId",
      "Outlet ID",
    ],
    [
      "outletName",
      "Outlet Name",
    ],
    [
      "merchantId",
      "Merchant Name",
    ],
    [
      "cuisineType",
      "Cuisine Type",
    ],
    [
      "outletPhone",
      "Phone Number",
    ],
    [
      "status",
      "Status",
    ],
    [
      "menuItemCount",
      "Menu Items",
    ],
    [
      "orders",
      "Orders",
    ],
    [
      "areaId",
      "Area Name",
    ],
    [
      "stateId",
      "State Name",
    ],
    [
      "availability",
      "Availability",
    ],
  ];

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="jippy-all-outlets-page">

      {/* PAGE HEADER */}

      <div className="jippy-all-outlets-page-header cat-page-header">
        <div className="jippy-all-outlets-heading-left cat-heading-left">
          <div className="jippy-all-outlets-heading-icon cat-heading-icon">
            <FiHome />
          </div>
          <div>
            <h1 className="cat-title">Outlets Directory</h1>
            <p className="cat-subtitle">
              Manage and monitor all restaurant outlets across zones and cities
            </p>
          </div>
        </div>
      </div>

      {/* OUTLET TITLE + COUNT */}

      <div className="jippy-all-outlets-title-row">
        <div className="jippy-all-outlets-title">
          <h2>
            🏪 Outlets
          </h2>

          <span className="jippy-all-outlets-count">
            {outletCount}
          </span>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="jippy-all-outlets-summary-grid cat-stats-grid">

        {/* TOTAL OUTLETS (PURPLE - SAME AS CATEGORIES TOTAL) */}
        <div
          className="cat-stat-card cat-stat-purple jippy-all-outlets-summary-card jippy-all-outlets-total-card jippy-all-outlets-clickable-card"
          onClick={() => {
            setOutletStatus(null);
            setOutletType(null);
          }}
          title="Click to show All Outlets"
        >
          <div className="cat-stat-icon jippy-all-outlets-stat-icon">
            <FiHome />
          </div>
          <div className="cat-stat-content jippy-all-outlets-stat-content">
            <span>Total Outlets</span>
            <strong>{outletCount}</strong>
            <small>All registered outlets</small>
          </div>
        </div>

        {/* ACTIVE OUTLETS (GREEN - SAME AS CATEGORIES HOME/ACTIVE) */}
        <div
          className="cat-stat-card cat-stat-green jippy-all-outlets-summary-card jippy-all-outlets-active-card jippy-all-outlets-clickable-card"
          onClick={() => {
            setOutletStatus({ value: "Y", label: "Active" });
            setOutletType(null);
          }}
          title="Click to filter Active Outlets"
        >
          <div className="cat-stat-icon jippy-all-outlets-stat-icon">
            <FiCheckCircle />
          </div>
          <div className="cat-stat-content jippy-all-outlets-stat-content">
            <span>Active Outlets</span>
            <strong>{activeOutletCount}</strong>
            <small>Currently active</small>
          </div>
        </div>

        {/* INACTIVE OUTLETS (RED) */}
        <div
          className="cat-stat-card cat-stat-red jippy-all-outlets-summary-card jippy-all-outlets-inactive-card jippy-all-outlets-clickable-card"
          onClick={() => {
            setOutletStatus({ value: "N", label: "Inactive" });
            setOutletType(null);
          }}
          title="Click to filter Inactive Outlets"
        >
          <div className="cat-stat-icon jippy-all-outlets-stat-icon">
            <FiXCircle />
          </div>
          <div className="cat-stat-content jippy-all-outlets-stat-content">
            <span>Inactive Outlets</span>
            <strong>{inactiveOutletCount}</strong>
            <small>Currently inactive</small>
          </div>
        </div>

        {/* TOTAL MENU ITEMS (BLUE - SAME AS CATEGORIES ALL) */}
        <div
          className="cat-stat-card cat-stat-blue jippy-all-outlets-summary-card jippy-all-outlets-menu-card jippy-all-outlets-clickable-card"
          onClick={() => {
            if (setActivePage) {
              setActivePage("masterProducts");
            }
          }}
          title="Click to view Master Products"
        >
          <div className="cat-stat-icon jippy-all-outlets-stat-icon">
            <FiLayers />
          </div>
          <div className="cat-stat-content jippy-all-outlets-stat-content">
            <span>Total Menu Items</span>
            <strong>
              {outlets.reduce(
                (total, outlet) =>
                  total +
                  Number(
                    outlet.menuItemCount ||
                      0
                  ),
                0
              )}
            </strong>
            <small>Master product catalog</small>
          </div>
        </div>

        {/* TOTAL ORDERS (AMBER / GOLD) */}
        <div
          className="cat-stat-card cat-stat-amber jippy-all-outlets-summary-card jippy-all-outlets-orders-card jippy-all-outlets-clickable-card"
          onClick={() => {
            if (setActivePage) {
              setActivePage("orders");
            }
          }}
          title="Click to view Orders"
        >
          <div className="cat-stat-icon jippy-all-outlets-stat-icon">
            <FiPackage />
          </div>
          <div className="cat-stat-content jippy-all-outlets-stat-content">
            <span>Total Orders</span>
            <strong>{totalOrdersCount}</strong>
            <small>Live orders flow</small>
          </div>
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
          className={`jippy-all-outlets-upload-area ${
            isDragging
              ? "jippy-drag-active"
              : ""
          }`}
          onDragOver={
            handleDragOver
          }
          onDragLeave={
            handleDragLeave
          }
          onDrop={handleDrop}
        >

          <label htmlFor="outlet-file-input">
            Select Excel/CSV File or Drag & Drop here
          </label>

          <input
            id="outlet-file-input"
            type="file"
            accept=".xls,.xlsx,.csv"
            onChange={
              handleBulkUpload
            }
          />

          <small>
            {bulkFile
              ? `Selected: ${bulkFile.name}`
              : "File should contain Outlet Name, Phone, Address, Merchant ID, Status and Outlet ID for updates."}
          </small>

          <button
            type="button"
            className="jippy-all-outlets-bulk-btn"
            onClick={
              submitBulkUpload
            }
            disabled={uploading}
          >
            <FiUpload />

            {uploading
              ? "Uploading..."
              : "Bulk Update"}
          </button>

        </div>

      </div>

      {/* BULK UPLOAD RESULT */}

      {uploadResult && (
        <div
          className={`jippy-upload-feedback-card ${
            uploadResult.data
              ?.failureCount > 0
              ? "jippy-upload-has-errors"
              : "jippy-upload-success"
          }`}
          style={{
            padding: "16px",
            margin: "15px 0",
            borderRadius: "8px",
            background:
              uploadResult.data
                ?.failureCount > 0
                ? "#fff5f5"
                : "#f0fff4",
            border:
              uploadResult.data
                ?.failureCount > 0
                ? "1px solid #feb2b2"
                : "1px solid #9ae6b4",
          }}
        >

          <h3
            style={{
              margin:
                "0 0 8px 0",
              color:
                uploadResult.data
                  ?.failureCount > 0
                  ? "#c53030"
                  : "#22543d",
            }}
          >
            {uploadResult.data
              ?.failureCount > 0
              ? "Upload Completed with Errors"
              : "Upload Successful"}
          </h3>

          <p
            style={{
              margin:
                "0 0 12px 0",
              fontSize: "14px",
            }}
          >
            {uploadResult.message ||
              "Upload Summary"}
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom:
                "15px",
              fontSize: "14px",
              flexWrap:
                "wrap",
            }}
          >

            <span>
              Total Rows:{" "}
              <strong>
                {uploadResult.data
                  ?.totalRows ??
                  0}
              </strong>
            </span>

            <span
              style={{
                color:
                  "#15803d",
              }}
            >
              Success:{" "}
              <strong>
                {uploadResult.data
                  ?.successCount ??
                  0}
              </strong>
            </span>

            <span
              style={{
                color:
                  "#dc2626",
              }}
            >
              Failed:{" "}
              <strong>
                {uploadResult.data
                  ?.failureCount ??
                  0}
              </strong>
            </span>

          </div>

          {uploadResult.data
            ?.errors?.length >
            0 && (
            <div
              className="jippy-upload-error-list"
              style={{
                marginTop:
                  "10px",
                padding:
                  "12px",
                background:
                  "#ffffff",
                border:
                  "1px solid #f5c2c7",
                borderRadius:
                  "6px",
              }}
            >

              <h4
                style={{
                  margin:
                    "0 0 10px 0",
                  color:
                    "#b91c1c",
                  fontSize:
                    "15px",
                }}
              >
                Duplicate / Failed Rows
              </h4>

              {uploadResult.data.errors.map(
                (err, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding:
                        "10px",
                      marginBottom:
                        idx <
                        uploadResult
                          .data
                          .errors
                          .length -
                          1
                          ? "8px"
                          : "0",
                      background:
                        "#fff7f7",
                      border:
                        "1px solid #fecaca",
                      borderRadius:
                        "5px",
                    }}
                  >

                    <div
                      style={{
                        fontWeight:
                          "600",
                        color:
                          "#991b1b",
                        marginBottom:
                          "5px",
                      }}
                    >
                      ❌ Duplicate / Failed Row
                    </div>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#374151",
                        lineHeight:
                          "1.6",
                      }}
                    >

                      <div>
                        <strong>
                          Excel Row:
                        </strong>{" "}
                        {err.rowNumber ??
                          "-"}
                      </div>

                      <div>
                        <strong>
                          Outlet Name:
                        </strong>{" "}
                        {err.outletName ??
                          "-"}
                      </div>

                      <div>
                        <strong>
                          Reason:
                        </strong>{" "}
                        <span
                          style={{
                            color:
                              "#b91c1c",
                          }}
                        >
                          {err.reason ??
                            "Unknown error"}
                        </span>
                      </div>

                    </div>

                  </div>
                )
              )}

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
              globalStatus ===
              "OPEN"
                ? "jippy-all-outlets-status-selected"
                : ""
            }`}
            onClick={() =>
              setGlobalStatus(
                "OPEN"
              )
            }
          >
            <span className="jippy-all-outlets-status-dot jippy-all-outlets-status-dot-open" />

            All Open
          </button>

          <button
            type="button"
            className={`jippy-all-outlets-status-option ${
              globalStatus ===
              "CLOSED"
                ? "jippy-all-outlets-status-selected"
                : ""
            }`}
            onClick={() =>
              setGlobalStatus(
                "CLOSED"
              )
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

          <div className="jippy-all-outlets-header-actions">

            {/* COLUMNS */}

            <div className="jippy-all-outlets-columns-wrapper">

              <button
                type="button"
                className="jippy-all-outlets-columns-btn"
                onClick={() =>
                  setShowColumnsMenu(
                    (prev) =>
                      !prev
                  )
                }
              >
                Columns ▾
              </button>

              {showColumnsMenu && (
                <div className="jippy-all-outlets-columns-menu">

                  <div className="jippy-all-outlets-columns-menu-header">

                    <span>
                      Choose Columns
                    </span>

                    <button
                      type="button"
                      className="jippy-all-outlets-columns-close"
                      onClick={() =>
                        setShowColumnsMenu(
                          false
                        )
                      }
                      aria-label="Close columns"
                    >
                      ×
                    </button>

                  </div>

                  <div className="jippy-all-outlets-columns-title">
                    General
                  </div>

                  {columnOptions.map(
                    ([
                      key,
                      label,
                    ]) => (
                      <label
                        key={key}
                        className="jippy-all-outlets-column-option"
                      >

                        <input
                          type="checkbox"
                          checked={
                            visibleColumns[
                              key
                            ]
                          }
                          onChange={() =>
                            toggleColumn(
                              key
                            )
                          }
                        />

                        <span>
                          {label}
                        </span>

                      </label>
                    )
                  )}

                  <div className="jippy-all-outlets-columns-divider" />

                  <button
                    type="button"
                    className="jippy-all-outlets-show-all-columns"
                    onClick={
                      showAllColumns
                    }
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
                setActivePage(
                  "createOutletNew"
                )
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
              onChange={(
                event
              ) =>
                setEntries(
                  Number(
                    event.target
                      .value
                  )
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
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
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
                    onClick={
                      exportCSV
                    }
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

        {/* ====================================================
            OUTLETS TABLE
        ==================================================== */}

        <div className="jippy-all-outlets-table-scroll">

          <table className="jippy-all-outlets-table">

            <thead>

              <tr>

                {/* EXPAND */}

                <th className="jippy-all-outlets-expand-header">
                  <span className="jippy-all-outlets-expand-header-space">
                    &nbsp;
                  </span>
                </th>

                {visibleColumns.outletId && (
                  <th>
                    Outlet ID
                  </th>
                )}

                {visibleColumns.outletName && (
                  <th>
                    Outlet Name
                  </th>
                )}

                {visibleColumns.merchantId && (
                  <th>
                    Merchant Name
                  </th>
                )}

                {visibleColumns.cuisineType && (
                  <th>
                    Cuisine Type
                  </th>
                )}

                {visibleColumns.outletPhone && (
                  <th>
                    Phone Number
                  </th>
                )}

                {visibleColumns.status && (
                  <th>
                    Status
                  </th>
                )}

                {visibleColumns.menuItemCount && (
                  <th>
                    Menu Items
                  </th>
                )}

                {visibleColumns.orders && (
                  <th>
                    Orders
                  </th>
                )}

                {visibleColumns.areaId && (
                  <th>
                    Area Name
                  </th>
                )}

                {visibleColumns.stateId && (
                  <th>
                    State Name
                  </th>
                )}

                <th className="jippy-all-outlets-availability-header">
                  isToggle
                </th>

                <th className="jippy-all-outlets-actions-header">
                  Actions
                </th>

              </tr>

            </thead>

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
              ) : displayedOutlets.length ===
                0 ? (
                <tr>

                  <td
                    colSpan="12"
                    className="jippy-all-outlets-message"
                  >
                    No outlets found
                  </td>

                </tr>
              ) : (
                displayedOutlets.map(
                  (outlet) => {

                    const isExpanded =
                      expandedOutletId ===
                      Number(
                        outlet.outletId
                      );

                    const savedUnavailability =
                      unavailabilityData[
                        outlet.outletId
                      ];

                    return (
                      <React.Fragment
                        key={
                          outlet.outletId
                        }
                      >

                        {/* MAIN OUTLET ROW */}

                        <tr
                          className={
                            isExpanded
                              ? "jippy-all-outlets-main-row expanded"
                              : "jippy-all-outlets-main-row"
                          }
                        >

                          {/* EXPAND */}

                          <td className="jippy-all-outlets-expand-cell">

                            <button
                              type="button"
                              className="jippy-all-outlets-expand-btn"
                              onClick={() =>
                                handleExpandOutlet(
                                  outlet.outletId
                                )
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

                          {/* OUTLET NAME */}

                          {visibleColumns.outletName && (
                            <td>

                              <strong
                                className="jippy-outlet-name-link"
                                onClick={() =>
                                  handleOutletProfile(
                                    outlet
                                  )
                                }
                                title="View Outlet Details"
                              >
                                {outlet.outletName ||
                                  "-"}
                              </strong>

                            </td>
                          )}

                          {/* MERCHANT NAME */}

                          {visibleColumns.merchantId && (
                            <td>
                              {outlet.merchantName ||
                                "-"}
                            </td>
                          )}

                          {/* CUISINE NAME */}

                          {visibleColumns.cuisineType && (
                            <td>

                              {Array.isArray(
                                outlet.cuisineNames
                              ) &&
                              outlet.cuisineNames.length >
                                0
                                ? outlet.cuisineNames.join(
                                    ", "
                                  )
                                : "-"}

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
                                className={`jippy-all-outlets-status ${
                                  outlet.isActive ===
                                  "Y"
                                    ? "active"
                                    : "inactive"
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
                              <span
                                className="jippy-all-outlets-link-count"
                                onClick={() =>
                                  handleOutletProfile(
                                    outlet,
                                    "Foods"
                                  )
                                }
                                title="View Outlet Foods"
                              >
                                {outlet.menuItemCount ??
                                  0}
                              </span>
                            </td>
                          )}

                          {/* ORDERS */}

                          {visibleColumns.orders && (
                            <td>
                              <span
                                className="jippy-all-outlets-orders-link"
                                onClick={() =>
                                  handleOutletProfile(
                                    outlet,
                                    "Orders"
                                  )
                                }
                                title="View Outlet Orders"
                              >
                                {outlet.orderCount ??
                                  outlet.totalOrders ??
                                  "Orders ↗"}
                              </span>
                            </td>
                          )}

                          {/* AREA NAME */}

                          {visibleColumns.areaId && (
                            <td>
                              {outlet.areaName ||
                                "-"}
                            </td>
                          )}

                          {/* STATE NAME */}

                          {visibleColumns.stateId && (
                            <td>
                              {outlet.stateName ||
                                "-"}
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

                        {/* EXPANDED DETAILS */}

                        {isExpanded && (
                          <tr className="jippy-all-outlets-expanded-row">

                            <td
                              colSpan="12"
                              className="jippy-all-outlets-expanded-cell"
                            >

                              <div className="jippy-all-outlets-expanded-content">

                                {/* ADDRESS */}

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
                                      {outlet.road ||
                                        "-"}
                                    </strong>

                                  </div>

                                  <div className="jippy-outlet-detail-item">

                                    <span className="jippy-outlet-detail-label">
                                      📍 Landmark
                                    </span>

                                    <strong>
                                      {outlet.landmark ||
                                        "-"}
                                    </strong>

                                  </div>

                                  {/* AREA NAME */}

                                  <div className="jippy-outlet-detail-item">

                                    <span className="jippy-outlet-detail-label">
                                      🗺️ Area Name
                                    </span>

                                    <strong>
                                      {outlet.areaName ||
                                        "-"}
                                    </strong>

                                  </div>

                                  {/* STATE NAME */}

                                  <div className="jippy-outlet-detail-item">

                                    <span className="jippy-outlet-detail-label">
                                      🏛️ State Name
                                    </span>

                                    <strong>
                                      {outlet.stateName ||
                                        "-"}
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
                                        .filter(
                                          Boolean
                                        )
                                        .join(
                                          ", "
                                        ) ||
                                        "-"}
                                    </strong>

                                  </div>

                                </div>

                                {/* UNAVAILABILITY */}

                                {savedUnavailability && (
                                  <div className="jippy-outlet-unavailability-card">

                                    <div className="jippy-outlet-unavailability-heading">

                                      <div>

                                        <FiCalendar />

                                        <span>

                                          Outlet Unavailability{" "}

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

                                      </div>

                                      <div className="jippy-unavailability-info">

                                        <span>
                                          To Date & Time
                                        </span>

                                        <strong>
                                          {formatUnavailabilityDate(
                                            savedUnavailability.toDate
                                          )}
                                        </strong>

                                      </div>

                                      <div className="jippy-unavailability-info reason">

                                        <span>
                                          Reason
                                        </span>

                                        <strong>
                                          {
                                            savedUnavailability.reason
                                          }
                                        </strong>

                                      </div>

                                      <div className="jippy-unavailability-info">

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
                  }
                )
              )}

            </tbody>

          </table>


        </div>

          


          

        {/* PAGINATION FOOTER */}

        {!loading &&
          filteredOutlets.length >
            0 && (
            <div className="jippy-all-outlets-table-footer">

              <div className="jippy-all-outlets-showing-text">

                Showing{" "}

                {startIndex + 1}

                {" "}to{" "}

                {Math.min(
                  endIndex,
                  filteredOutlets.length
                )}

                {" "}of{" "}

                {filteredOutlets.length}

                {" "}outlets

              </div>

              <div className="jippy-all-outlets-pagination">

                <button
                  type="button"
                  className="jippy-all-outlets-page-btn"
                  disabled={
                    currentPage ===
                    1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        prev - 1
                    )
                  }
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (
                    _,
                    index
                  ) =>
                    index + 1
                ).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={`jippy-all-outlets-page-btn ${
                        currentPage ===
                        page
                          ? "jippy-all-outlets-page-btn-active"
                          : ""
                      }`}
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="jippy-all-outlets-page-btn"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (prev) =>
                        prev + 1
                    )
                  }
                >
                  Next
                </button>

              </div>

            </div>
          )}

        {/* =====================================================
            UNAVAILABILITY MODAL
        ===================================================== */}

        {unavailabilityModal.open && (
          <div className="jippy-unavailability-modal-overlay">

            <div className="jippy-unavailability-modal">

              {/* =================================================
                  RESTORE MODAL
              ================================================= */}

              {unavailabilityModal.mode ===
              "restore" ? (
                <>

                  <div className="jippy-unavailability-modal-header">

                    <h2>
                      Make Outlet Available
                    </h2>

                    <button
                      type="button"
                      className="jippy-unavailability-modal-close"
                      onClick={() => {
                        setUnavailabilityModal(
                          {
                            open: false,
                            outlet: null,
                            mode: "create",
                          }
                        );

                        setSelectedOutlet(
                          null
                        );
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
                        setUnavailabilityModal(
                          {
                            open: false,
                            outlet: null,
                            mode: "create",
                          }
                        );

                        setSelectedOutlet(
                          null
                        );
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="jippy-unavailability-confirm-btn"
                      onClick={
                        handleConfirmOutletRestore
                      }
                      disabled={
                        savingUnavailability
                      }
                    >
                      {savingUnavailability
                        ? "Restoring..."
                        : "Confirm & Turn ON"}
                    </button>

                  </div>

                </>
              ) : (
                <>

                  {/* =================================================
                      CREATE / EDIT UNAVAILABILITY MODAL
                  ================================================= */}

                  <div className="jippy-unavailability-modal-header">

                    <h2>
                      {unavailabilityModal.mode ===
                      "edit"
                        ? "Edit Outlet Unavailability"
                        : "Mark Outlet as Unavailable"}
                    </h2>

                    <button
                      type="button"
                      className="jippy-unavailability-modal-close"
                      onClick={() => {
                        setUnavailabilityModal(
                          {
                            open: false,
                            outlet: null,
                            mode: "create",
                          }
                        );

                        setSelectedOutlet(
                          null
                        );
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
                        From Date & Time{" "}
                        <span>
                          *
                        </span>
                      </label>

                      <div className="jippy-unavailability-input-wrapper">

                        <input
                          type="datetime-local"
                          value={
                            unavailabilityForm.fromDate
                          }
                          onChange={(
                            event
                          ) =>
                            setUnavailabilityForm(
                              (prev) => ({
                                ...prev,
                                fromDate:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                        />

                        <FiCalendar />

                      </div>

                    </div>

                    <div className="jippy-unavailability-field">

                      <label>
                        To Date & Time{" "}
                        <span>
                          *
                        </span>
                      </label>

                      <div className="jippy-unavailability-input-wrapper">

                        <input
                          type="datetime-local"
                          value={
                            unavailabilityForm.toDate
                          }
                          onChange={(
                            event
                          ) =>
                            setUnavailabilityForm(
                              (prev) => ({
                                ...prev,
                                toDate:
                                  event
                                    .target
                                    .value,
                              })
                            )
                          }
                        />

                        <FiCalendar />

                      </div>

                    </div>

                  </div>

                  {/* REASON */}

                  <div className="jippy-unavailability-field">

                    <label>
                      Reason{" "}
                      <span>
                        *
                      </span>
                    </label>

                    <textarea
                      value={
                        unavailabilityForm.reason
                      }
                      onChange={(
                        event
                      ) =>
                        setUnavailabilityForm(
                          (prev) => ({
                            ...prev,
                            reason:
                              event
                                .target
                                .value,
                          })
                        )
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
                        setUnavailabilityModal(
                          {
                            open: false,
                            outlet: null,
                            mode: "create",
                          }
                        );

                        setSelectedOutlet(
                          null
                        );
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="jippy-unavailability-confirm-btn"
                      onClick={
                        handleConfirmUnavailability
                      }
                      disabled={
                        savingUnavailability
                      }
                    >
                      {savingUnavailability
                        ? "Saving..."
                        : unavailabilityModal.mode ===
                          "edit"
                        ? "Update & Save"
                        : "Confirm & Turn OFF"}
                    </button>

                  </div>

                </>
              )}

            </div>

  </div>
)}


{showTurnOnConfirm && turnOnOutlet && (
  <div className="jippy-turn-on-overlay">

    <div className="jippy-turn-on-modal">

      <div className="jippy-turn-on-icon">
        ?
      </div>

      <h2>
        Turn On Outlet?
      </h2>

      <p>
        Are you sure you want to turn on
        <strong>
          {" "}{turnOnOutlet.outletName}
        </strong>
        ?
      </p>

      <div className="jippy-turn-on-actions">

        <button
          type="button"
          className="jippy-turn-on-cancel"
          onClick={handleCancelTurnOn}
          disabled={turningOn}
        >
          Cancel
        </button>

        <button
          type="button"
          className="jippy-turn-on-confirm"
          onClick={handleConfirmTurnOn}
          disabled={turningOn}
        >
          {turningOn
            ? "Turning On..."
            : "Confirm & Turn On"}
        </button>

      </div>

    </div>

  </div>
)}


{/* TURN ON SUCCESS POPUP */}
{showTurnOnSuccess && (
  <div className="jippy-outlet-toggle-popup-overlay">

    <div className="jippy-outlet-toggle-popup">

      <div className="jippy-outlet-toggle-success-icon">
        ✓
      </div>

      <h2>
        Outlet Turned On
      </h2>

      <p>
        {turnOnSuccessMessage}
      </p>

      <button
        type="button"
        className="jippy-outlet-toggle-confirm-button"
        onClick={() =>
          setShowTurnOnSuccess(false)
        } 
      >
        OK
      </button>

    </div>

  </div>
)}

      </div>
    </div>
  );
}

export default AllOutletsList;