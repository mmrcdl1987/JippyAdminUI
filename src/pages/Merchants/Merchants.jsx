import "../../styles/Merchants/Merchants.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FM_API } from "../../services/api";
import {
  uploadMerchants,
  fetchStates,
  getMerchantAddress,
  getMerchantProfile,
  toggleMerchantStatus,
  updateMerchantProfilePic,
} from "../../services/merchantService";
import { getAllAreas } from "../../services/managerAreaService";
import { FaStore, FaEdit, FaEye, FaCamera } from "react-icons/fa";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

function Merchants() {
  const navigate = useNavigate();
  const [merchants, setMerchants] = useState([]);
  const [merchantAddresses, setMerchantAddresses] = useState({});
  const [merchantProfiles, setMerchantProfiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [selectedMerchantType, setSelectedMerchantType] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // Filter states
  const [filterMerchantType, setFilterMerchantType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Date Range Picker states
  const [showCalendar, setShowCalendar] = useState(false);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // Areas state
  const [areas, setAreas] = useState([]);
  const [areasLoading, setAreasLoading] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState("");

  useEffect(() => {
    fetchMerchants();
    fetchAreas();
    fetchStatesList();
  }, []);

  const [selectedFile, setSelectedFile] = useState(null);
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState(null);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);

  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDocMerchant, setSelectedDocMerchant] = useState(null);
  const [docModalLoading, setDocModalLoading] = useState(false);

  const [showPicModal, setShowPicModal] = useState(false);
  const [selectedPicMerchant, setSelectedPicMerchant] = useState(null);
  const [selectedPicFile, setSelectedPicFile] = useState(null);
  const [previewPicUrl, setPreviewPicUrl] = useState("");
  const [updatingPic, setUpdatingPic] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    merchantInfo: true,
    ownerInfo: true,
    zone: true,
    status: true,
    adminCommission: true,
    date: true,
    documents: true,
  });

  // ============================================================
  // DATE RANGE HANDLERS
  // ============================================================
  const handleApplyRange = () => {
    const start = range[0]?.startDate;
    const end = range[0]?.endDate;

    if (start) {
      const formattedStart = start.toISOString().split("T")[0];
      setFilterDateFrom(formattedStart);
    }
    if (end) {
      const formattedEnd = end.toISOString().split("T")[0];
      setFilterDateTo(formattedEnd);
    }

    setShowCalendar(false);
    setCurrentPage(1);
  };

  const handleCancelRange = () => {
    setRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setShowCalendar(false);
  };

  const handleClearDateRange = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
    setRange([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setCurrentPage(1);
  };

  // ============================================================
  // FETCH AREAS
  // ============================================================
  const fetchAreas = async () => {
    try {
      setAreasLoading(true);
      const response = await getAllAreas();
      console.log("Areas API response:", response);

      let list = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response?.content)) {
        list = response.content;
      } else if (response?.success && Array.isArray(response?.data)) {
        list = response.data;
      }
      setAreas(list);
    } catch (error) {
      console.error("Error fetching areas:", error);
      setAreas([]);
    } finally {
      setAreasLoading(false);
    }
  };

  // ============================================================
  // CHECKBOX HANDLERS
  // ============================================================
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      const allIds = currentMerchants.map(m => m.merchantId);
      setSelectedMerchants(allIds);
    } else {
      setSelectedMerchants([]);
    }
  };

  const handleSelectMerchant = (merchantId) => {
    setSelectedMerchants(prev => {
      if (prev.includes(merchantId)) {
        return prev.filter(id => id !== merchantId);
      } else {
        return [...prev, merchantId];
      }
    });
  };

  // ============================================================
  // BULK ACTION HANDLERS
  // ============================================================
  const handleBulkDelete = () => {
    if (selectedMerchants.length === 0) {
      alert("Please select at least one merchant to delete.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${selectedMerchants.length} merchant(s)?`)) {
      console.log("Deleting merchants:", selectedMerchants);
      setSelectedMerchants([]);
      setSelectAll(false);
    }
  };

  const handleBulkStatusToggle = (status) => {
    if (selectedMerchants.length === 0) {
      alert("Please select at least one merchant.");
      return;
    }
    console.log(`Setting ${status} for merchants:`, selectedMerchants);
    setSelectedMerchants([]);
    setSelectAll(false);
  };

  const handleOpenPicModal = (merchant) => {
    setSelectedPicMerchant(merchant);
    setSelectedPicFile(null);
    setPreviewPicUrl(merchant.profilePicUrl || "");
    setShowPicModal(true);
  };

  const handlePicFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setSelectedPicFile(file);
      setPreviewPicUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfilePic = async () => {
    if (!selectedPicMerchant) return;
    if (!selectedPicFile) {
      alert("Please select an image file to upload.");
      return;
    }
    try {
      setUpdatingPic(true);
      const res = await updateMerchantProfilePic(selectedPicMerchant.merchantId, selectedPicFile);
      console.log("Update profile pic response:", res);
      const updatedUrl = res?.data?.profilePicUrl || res?.profilePicUrl || previewPicUrl;
      setMerchants((prev) =>
        prev.map((m) =>
          m.merchantId === selectedPicMerchant.merchantId
            ? { ...m, profilePicUrl: updatedUrl }
            : m
        )
      );
      setShowPicModal(false);
      alert("Profile picture updated successfully!");
      fetchMerchants();
    } catch (err) {
      console.error("Failed to update profile pic:", err);
      alert("Failed to update profile picture: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingPic(false);
    }
  };

  const handleToggleStatus = async (merchant) => {
    const currentIsActive = merchant.isActive === "Y" || merchant.isActive === true || merchant.status === "ACTIVE";
    const nextIsActive = !currentIsActive;

    setMerchants((prev) =>
      prev.map((m) =>
        m.merchantId === merchant.merchantId
          ? {
            ...m,
            isActive: nextIsActive ? "Y" : "N",
            status: nextIsActive ? "ACTIVE" : "INACTIVE",
          }
          : m
      )
    );

    try {
      await toggleMerchantStatus(merchant.merchantId, nextIsActive);
    } catch (err) {
      console.error("Failed to toggle merchant status:", err);
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
      fetchMerchants();
    }
  };

  const handleOpenDocumentsModal = async (merchant) => {
    setSelectedDocMerchant(merchant);
    setShowDocModal(true);
    if (!merchantProfiles[merchant.merchantId]) {
      setDocModalLoading(true);
      try {
        const profRes = await getMerchantProfile(merchant.merchantId);
        if (profRes) {
          setMerchantProfiles((prev) => ({
            ...prev,
            [merchant.merchantId]: profRes?.data || profRes,
          }));
        }
      } catch (err) {
        console.warn("Failed to load profile for documents modal:", err);
      } finally {
        setDocModalLoading(false);
      }
    }
  };

  const openOutlets = (merchant) => {
    console.log("Saving merchantId to localStorage:", merchant.merchantId);
    localStorage.setItem("merchantId", merchant.merchantId);
    navigate("/dashboard/viewOutlets");
  };

  const handleViewMerchant = (merchant) => {
    console.log("Viewing merchant details:", merchant);
    localStorage.setItem("merchantId", merchant.merchantId);
    navigate("/dashboard/viewMerchant");
  };

  const handleEditMerchant = (merchant) => {
    console.log("Editing merchant:", merchant);
    localStorage.setItem("merchantId", merchant.merchantId);
    navigate("/dashboard/editMerchant");
  };

  const handleCreateMerchant = () => {
    navigate("/dashboard/createMerchant");
  };

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await FM_API.get("/api/fm/merchants");
      if (response.data.success) {
        const list = response.data.data || [];
        setMerchants(list);
        fetchMerchantAddresses(list);
      } else {
        setMerchants([]);
      }
    } catch (error) {
      console.error("Error fetching merchants:", error);
      setMerchants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (e) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    setSelectedCity("");
    fetchCities(stateId);
  };

  const fetchStatesList = async () => {
    try {
      setLocationLoading(true);
      const response = await FM_API.get("/api/fm/location/fetchStates");
      console.log("States API response:", response.data);
      setStates(response.data || []);
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }
    try {
      setLocationLoading(true);
      const response = await FM_API.get(
        `/api/fm/location/fetchCityInState?stateId=${stateId}`
      );
      console.log("Cities API response:", response.data);
      setCities(response.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchMerchantAddresses = async (merchantList) => {
    try {
      const addressPromises = merchantList.map(async (m) => {
        if (!m.merchantId) return null;
        try {
          const res = await getMerchantAddress(m.merchantId);
          const data = res?.data || res;
          return { merchantId: m.merchantId, address: data };
        } catch {
          return null;
        }
      });
      const results = await Promise.all(addressPromises);
      const addrMap = {};
      results.forEach((item) => {
        if (item && item.address) {
          addrMap[item.merchantId] = item.address;
        }
      });
      setMerchantAddresses((prev) => ({ ...prev, ...addrMap }));
    } catch (err) {
      console.warn("Could not batch load merchant addresses:", err);
    }
  };

  const handleToggleExpand = async (merchantId) => {
    if (expandedRow === merchantId) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(merchantId);
    if (!merchantAddresses[merchantId]) {
      try {
        const addrRes = await getMerchantAddress(merchantId);
        if (addrRes) {
          setMerchantAddresses((prev) => ({
            ...prev,
            [merchantId]: addrRes?.data || addrRes,
          }));
        }
      } catch (e) {
        console.warn("Address fetch failed for row expand:", e);
      }
    }
    if (!merchantProfiles[merchantId]) {
      try {
        const profRes = await getMerchantProfile(merchantId);
        if (profRes) {
          setMerchantProfiles((prev) => ({
            ...prev,
            [merchantId]: profRes?.data || profRes,
          }));
        }
      } catch (e) {
        console.warn("Profile fetch failed for row expand:", e);
      }
    }
  };
  const handleBulkFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setBulkUploadResult(null);
      return;
    }
    const fileName = file.name.toLowerCase();
    const isValidFile =
      fileName.endsWith(".csv") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls");
    if (!isValidFile) {
      alert("Please select a CSV or Excel file (.csv, .xlsx, .xls).");
      event.target.value = "";
      setSelectedFile(null);
      setBulkUploadResult(null);
      return;
    }
    if (file.size === 0) {
      alert("The selected file is empty.");
      event.target.value = "";
      setSelectedFile(null);
      setBulkUploadResult(null);
      return;
    }
    setSelectedFile(file);
    setBulkUploadResult(null);
  };

  const handleBulkUpdate = async () => {
    if (!selectedFile) {
      alert("Please select a CSV or Excel file first.");
      return;
    }
    try {
      setBulkUploadLoading(true);
      setBulkUploadResult(null);
      console.log("[MERCHANT BULK] Uploading:", selectedFile.name);
      const response = await uploadMerchants(selectedFile);
      console.log("[MERCHANT BULK] API response:", response);
      const resultData = response?.data || response;
      const success = response?.success !== false;
      setBulkUploadResult({
        success,
        message:
          response?.message ||
          (success
            ? "Merchants uploaded successfully."
            : "Merchant upload failed."),
        data: resultData,
      });
      if (success) {
        await fetchMerchants();
      }
      if (success) {
        setSelectedFile(null);
        const fileInput = document.getElementById("merchant-bulk-file");
        if (fileInput) {
          fileInput.value = "";
        }
      }
    } catch (error) {
      console.error("[MERCHANT BULK] Upload failed:", error);
      const errorData = error?.response?.data;
      setBulkUploadResult({
        success: false,
        message:
          errorData?.message ||
          errorData?.error ||
          error?.message ||
          "Merchant bulk upload failed.",
        data: errorData?.data || errorData || null,
      });
    } finally {
      setBulkUploadLoading(false);
    }
  };


  // ============================================================
  // FILTER FUNCTIONS
  // ============================================================
  // Apply all filters
  const filteredMerchants = merchants.filter((merchant) => {
    const keyword = search.toLowerCase();
    const addr = merchantAddresses[merchant.merchantId];

    // Search filter
    const matchesSearch =
      merchant.merchantName?.toLowerCase().includes(keyword) ||
      merchant.firstName?.toLowerCase().includes(keyword) ||
      merchant.lastName?.toLowerCase().includes(keyword) ||
      merchant.merchantEmail?.toLowerCase().includes(keyword) ||
      merchant.merchantPhone?.toLowerCase().includes(keyword) ||
      merchant.area?.toLowerCase().includes(keyword) ||
      merchant.city?.toLowerCase().includes(keyword) ||
      merchant.state?.toLowerCase().includes(keyword) ||
      addr?.areaName?.toLowerCase().includes(keyword) ||
      addr?.cityName?.toLowerCase().includes(keyword) ||
      addr?.stateName?.toLowerCase().includes(keyword) ||
      merchant.merchantBusinessType?.toLowerCase().includes(keyword) ||
      merchant.status?.toLowerCase().includes(keyword);

    // Merchant Type filter
    const activeTypeFilter = filterMerchantType || selectedMerchantType;
    const matchesType = activeTypeFilter
      ? (merchant.merchantBusinessType === activeTypeFilter ||
        (activeTypeFilter === "Outlets" && merchant.merchantBusinessType === "Outlet") ||
        (activeTypeFilter === "Outlet" && merchant.merchantBusinessType === "Outlets"))
      : true;

    // State filter
    const matchesState =
      !selectedState ||
      String(merchant.stateId) === String(selectedState) ||
      String(addr?.stateId) === String(selectedState);

    // City filter
    const matchesCity =
      !selectedCity ||
      String(merchant.cityId) === String(selectedCity) ||
      String(addr?.cityId) === String(selectedCity);

    // Status filter - Active, Inactive, Pending
    let matchesStatus = true;
    if (filterStatus) {
      if (filterStatus === "ACTIVE") {
        matchesStatus = merchant.isActive === "Y" || merchant.isActive === true || merchant.status === "ACTIVE";
      } else if (filterStatus === "INACTIVE") {
        matchesStatus = merchant.isActive === "N" || merchant.isActive === false || merchant.status === "INACTIVE";
      } else if (filterStatus === "PENDING") {
        matchesStatus = merchant.isApproved === false || merchant.status === "PENDING";
      }
    }

    // Area filter - from API fetched areas
    const matchesArea = filterArea
      ? (addr?.areaName === filterArea || merchant.area === filterArea || merchant.zone === filterArea)
      : true;

    // Date filter - From Date and To Date
    let matchesDate = true;
    const merchantDate = new Date(merchant.createdAt);

    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      const merchantDateOnly = new Date(merchantDate.getFullYear(), merchantDate.getMonth(), merchantDate.getDate());
      matchesDate = matchesDate && merchantDateOnly >= fromDate;
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      const merchantDateOnly = new Date(merchantDate.getFullYear(), merchantDate.getMonth(), merchantDate.getDate());
      matchesDate = matchesDate && merchantDateOnly <= toDate;
    }

    return matchesSearch && matchesType && matchesState && matchesCity && matchesStatus && matchesArea && matchesDate;
  });

  const merchantColumnOptions = [
    ["merchantInfo", "Merchant Info"],
    ["ownerInfo", "Contacts"],
    ["zone", "Zone"],
    ["status", "Status"],
    ["adminCommission", "Admin Commission"],
    ["date", "Date"],
    ["documents", "Documents"],
  ];

  const toggleMerchantColumn = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const showAllMerchantColumns = () => {
    const allColumns = {};
    merchantColumnOptions.forEach(([key]) => {
      allColumns[key] = true;
    });
    setVisibleColumns(allColumns);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMerchants = filteredMerchants.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage) || 1;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleEntriesChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // ============================================================
  // FILTER HANDLERS
  // ============================================================
  const handleFilterTypeChange = (e) => {
    setFilterMerchantType(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterAreaChange = (e) => {
    setFilterArea(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterMerchantType("");
    setFilterStatus("");
    setFilterArea("");
    handleClearDateRange();
    setSearch("");
    setAreaSearchQuery("");
    setShowAreaDropdown(false);
    setCurrentPage(1);
  };

  // Helper to format date range display
  const getDateRangeDisplay = () => {
    if (filterDateFrom && filterDateTo) {
      const from = new Date(filterDateFrom).toLocaleDateString();
      const to = new Date(filterDateTo).toLocaleDateString();
      return `${from} - ${to}`;
    } else if (filterDateFrom) {
      return `From: ${new Date(filterDateFrom).toLocaleDateString()}`;
    } else if (filterDateTo) {
      return `To: ${new Date(filterDateTo).toLocaleDateString()}`;
    }
    return "Select Range";
  };

  return (
    <div className="merchant-list-page">
      {/* Header */}
      <div className="merchant-list-header">
        <div>
          <h2>Merchants</h2>
        </div>
        <div className="merchant-list-breadcrumb">
          Dashboard &gt; Merchants &gt; Merchants List
        </div>
      </div>

      {/* Toolbar */}
      <div className="merchant-list-toolbar">
        <div className="merchant-list-title">
          <span className="merchant-list-shop-icon">🏪</span>
          <h2>
            Merchants
            <span className="merchant-list-count-badge">
              {merchants.length}
            </span>
          </h2>
        </div>

        <div className="merchant-list-filters">
          {/* Merchant Type - Outlet and Mart */}
          <select
            value={filterMerchantType || selectedMerchantType}
            onChange={(e) => {
              handleFilterTypeChange(e);
              setSelectedMerchantType(e.target.value);
            }}
          >
            <option value="">Merchant Type</option>
            <option value="Outlet">Outlet</option>
            <option value="Mart">Mart</option>
          </select>

          {/* Status - Active, Inactive, Pending */}
          <select
            value={filterStatus}
            onChange={handleFilterStatusChange}
          >
            <option value="">Select Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </select>

          {/* Area - Searchable Dropdown */}
          <div className="merchant-list-area-dropdown-wrapper">
            <button
              type="button"
              className="merchant-list-area-btn"
              onClick={() => setShowAreaDropdown((prev) => !prev)}
            >
              <span className="truncate">
                {filterArea || "Select Area"}
              </span>
              <span>▾</span>
            </button>

            {showAreaDropdown && (
              <div className="merchant-list-area-menu">
                <input
                  type="text"
                  className="merchant-list-area-search-input"
                  placeholder="Search area..."
                  value={areaSearchQuery}
                  onChange={(e) => setAreaSearchQuery(e.target.value)}
                  autoFocus
                />
                <div className="merchant-list-area-options">
                  <div
                    className={`merchant-list-area-option-item ${!filterArea ? "selected" : ""}`}
                    onClick={() => {
                      setFilterArea("");
                      setShowAreaDropdown(false);
                      setAreaSearchQuery("");
                      setCurrentPage(1);
                    }}
                  >
                    Select Area (All)
                  </div>
                  {areasLoading ? (
                    <div className="merchant-list-area-no-results">Loading areas...</div>
                  ) : (
                    areas
                      .filter((area) => {
                        const name = (area.areaName || area.name || "").toLowerCase();
                        return name.includes(areaSearchQuery.toLowerCase());
                      })
                      .map((area) => {
                        const name = area.areaName || area.name;
                        return (
                          <div
                            key={area.id || area.areaId || name}
                            className={`merchant-list-area-option-item ${filterArea === name ? "selected" : ""}`}
                            onClick={() => {
                              setFilterArea(name);
                              setShowAreaDropdown(false);
                              setAreaSearchQuery("");
                              setCurrentPage(1);
                            }}
                          >
                            {name}
                          </div>
                        );
                      })
                  )}
                  {!areasLoading &&
                    areas.filter((area) =>
                      (area.areaName || area.name || "").toLowerCase().includes(areaSearchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="merchant-list-area-no-results">No areas found</div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* DATE RANGE PICKER */}
          <div className="merchant-list-date-wrapper">
            <button
              type="button"
              className="merchant-list-date-button"
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <span className="merchant-list-date-label">
                {getDateRangeDisplay()}
              </span>
              <span className="merchant-list-date-arrow">▼</span>
            </button>

            {showCalendar && (
              <div className="merchant-list-calendar-popup">
                <DateRange
                  editableDateInputs
                  ranges={range}
                  onChange={(item) => setRange([item.selection])}
                  months={2}
                  direction="horizontal"
                  rangeColors={["#ff6b00"]}
                />

                <div className="merchant-list-calendar-actions">
                  <button
                    type="button"
                    onClick={handleCancelRange}
                    className="merchant-list-calendar-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyRange}
                    className="merchant-list-calendar-apply"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {(filterMerchantType || selectedMerchantType || selectedState || selectedCity || filterStatus || filterArea || filterDateFrom || filterDateTo || search) && (
            <button
              onClick={() => {
                handleClearFilters();
                setSelectedMerchantType("");
                setSelectedState("");
                setSelectedCity("");
              }}
              className="merchant-list-clear-filters-btn"
            >
              Clear Filters ✕
            </button>
          )}
        </div>
      </div>

      {/* Statistics - Made more compact */}
      <div className="merchant-list-stats-row">
        <div className="merchant-list-stat-card merchant-list-total-card">
          <h1>{filteredMerchants.length}</h1>
          <p>Filtered Merchants</p>
        </div>

        <div className="merchant-list-stat-card merchant-list-active-card">
          <h1>
            {
              filteredMerchants.filter(
                (m) => m.isActive === "Y" || m.isActive === true
              ).length
            }
          </h1>
          <p>Active</p>
        </div>

        <div className="merchant-list-stat-card merchant-list-inactive-card">
          <h1>
            {
              filteredMerchants.filter(
                (m) => m.isActive === "N" || m.isActive === false
              ).length
            }
          </h1>
          <p>Inactive</p>
        </div>

        <div className="merchant-list-stat-card merchant-list-new-card">
          <h1>{filteredMerchants.filter((m) => m.isApproved).length}</h1>
          <p>Approved</p>
        </div>
      </div>

      {/* Bulk Import Section */}
      <div className="merchant-list-bulk-import-card">
        <div className="merchant-list-bulk-left">
          <h2>Bulk Import / Update Merchants</h2>
          <p>
            Upload CSV or Excel file to import or update multiple merchants at once
          </p>
        </div>

        <div className="merchant-list-bulk-middle">
          <button
            type="button"
            className="merchant-list-download-btn"
          >
            ⬇ Download Template
          </button>
        </div>

        <div className="merchant-list-bulk-right">
          <label htmlFor="merchant-bulk-file">
            Select File (.csv / .xls / .xlsx)
          </label>

          <input
            id="merchant-bulk-file"
            type="file"
            className="merchant-list-file-input"
            accept=".csv,.xlsx,.xls"
            onChange={handleBulkFileChange}
            disabled={bulkUploadLoading}
          />

          <small>
            File should contain Merchant Name, Email, Mobile, Address, Area,
            City, State, Business Model, Merchant Type and Merchant Id (for updates).
          </small>

          {selectedFile && (
            <div className="merchant-list-selected-file">
              Selected File: <strong>{selectedFile.name}</strong>
            </div>
          )}

          <button
            type="button"
            className="merchant-list-update-btn"
            onClick={handleBulkUpdate}
            disabled={bulkUploadLoading || !selectedFile}
          >
            {bulkUploadLoading ? "⏳ Uploading..." : "⬆ Bulk Update"}
          </button>

          {bulkUploadResult && (
            <div
              className={
                bulkUploadResult.success
                  ? "upload-result upload-success"
                  : "upload-result upload-error"
              }
            >
              <h4>
                {bulkUploadResult.success ? "✓ " : "✕ "}
                {bulkUploadResult.message}
              </h4>

              {bulkUploadResult.data && (
                <div className="upload-result-details">
                  {bulkUploadResult.data.totalRows !== undefined && (
                    <p>
                      <strong>Total Rows:</strong>{" "}
                      {bulkUploadResult.data.totalRows}
                    </p>
                  )}

                  {bulkUploadResult.data.successCount !== undefined && (
                    <p>
                      <strong>Success:</strong>{" "}
                      {bulkUploadResult.data.successCount}
                    </p>
                  )}

                  {bulkUploadResult.data.failureCount !== undefined && (
                    <p>
                      <strong>Failed:</strong>{" "}
                      {bulkUploadResult.data.failureCount}
                    </p>
                  )}

                  {bulkUploadResult.data.errors?.length > 0 && (
                    <div className="upload-errors-container">
                      <strong>Upload Errors:</strong>
                      <div className="upload-errors-list">
                        {bulkUploadResult.data.errors.map((error, index) => {
                          if (typeof error === "string") {
                            return (
                              <div key={index} className="upload-error-item">
                                {error}
                              </div>
                            );
                          }

                          const rowNum =
                            error.rowNumber ??
                            error.row ??
                            error.line ??
                            index + 1;

                          const fieldName =
                            error.field ??
                            error.column ??
                            error.key ??
                            "";

                          const errorMsg =
                            error.reason ??
                            error.message ??
                            error.error ??
                            JSON.stringify(error);

                          return (
                            <div key={index} className="upload-error-item">
                              <strong>Row {rowNum}</strong>
                              {fieldName && <span>{` - ${fieldName}`}</span>}
                              {errorMsg && <span>{`: ${errorMsg}`}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Merchant List */}
      <div className="merchant-list-container">
        <div className="merchant-list-heading">
          <div>
            <h2>Merchants List</h2>
            <p>View and manage all the merchants</p>
          </div>

          <div className="merchant-list-actions">
            <div className="merchant-list-columns-wrapper">
              <button
                type="button"
                className="merchant-list-columns-btn"
                onClick={() =>
                  setShowColumnsMenu((prev) => !prev)
                }
              >
                Columns ▾
              </button>

              {showColumnsMenu && (
                <div className="merchant-list-columns-menu">
                  <div className="merchant-list-columns-menu-header">
                    <span>Choose Columns</span>
                    <button
                      type="button"
                      className="merchant-list-columns-close"
                      onClick={() => setShowColumnsMenu(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="merchant-list-columns-title">
                    General
                  </div>

                  {merchantColumnOptions.map(
                    ([key, label]) => (
                      <label
                        key={key}
                        className="merchant-list-column-option"
                      >
                        <input
                          type="checkbox"
                          checked={visibleColumns[key]}
                          onChange={() =>
                            toggleMerchantColumn(key)
                          }
                        />
                        <span>{label}</span>
                      </label>
                    )
                  )}

                  <div className="merchant-list-columns-divider" />

                  <button
                    type="button"
                    className="merchant-list-show-all-columns"
                    onClick={showAllMerchantColumns}
                  >
                    Show All
                  </button>
                </div>
              )}
            </div>
            <button
              className="merchant-list-create-btn"
              onClick={handleCreateMerchant}
            >
              + Create Merchant
            </button>
          </div>
        </div>

        <div className="merchant-list-toolbar-bottom">
          <div className="merchant-list-entries">
            <span>Show</span>
            <select value={itemsPerPage} onChange={handleEntriesChange}>
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="merchant-list-search-export">
            <input
              type="text"
              placeholder="Search merchants..."
              className="merchant-list-search-box"
              value={search}
              onChange={handleSearchChange}
            />
            <button className="merchant-list-export-btn">Export as ▼</button>
          </div>
        </div>

        <table className="merchant-list-table">
          <thead>
            <tr>
              <th className="merchant-list-checkbox-col">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  title="Select all merchants"
                />
              </th>

              {visibleColumns.merchantInfo && (
                <th>Merchant Info</th>
              )}

              {visibleColumns.ownerInfo && (
                <th>Contacts</th>
              )}

              {visibleColumns.zone && (
                <th>Zone</th>
              )}

              {visibleColumns.status && (
                <th>Status</th>
              )}

              {visibleColumns.date && (
                <th>Date</th>
              )}

              {visibleColumns.documents && (
                <th>Documents</th>
              )}

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="merchant-list-loading-cell" colSpan="9">
                  Loading...
                </td>
              </tr>
            ) : currentMerchants.length > 0 ? (
              currentMerchants.map((merchant) => (
                <React.Fragment key={merchant.merchantId}>
                  <tr>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedMerchants.includes(merchant.merchantId)}
                        onChange={() => handleSelectMerchant(merchant.merchantId)}
                      />
                    </td>

                    {visibleColumns.merchantInfo && (
                      <td>
                        <div className="merchant-list-info">
                          <div
                            className="merchant-list-avatar-wrapper"
                            onClick={() => handleOpenPicModal(merchant)}
                            title="Click to update profile picture"
                          >
                            {merchant.profilePicUrl ? (
                              <img
                                src={merchant.profilePicUrl}
                                alt={merchant.merchantName}
                                className="merchant-list-avatar-img"
                              />
                            ) : (
                              <div className="merchant-list-avatar-placeholder">
                                {(merchant.merchantName || merchant.firstName || "M").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="merchant-list-avatar-camera">
                              <FaCamera />
                            </div>
                          </div>
                          <div>
                            <strong
                              onClick={() => handleViewMerchant(merchant)}
                              className="merchant-name-link"
                              title="Click to view merchant details"
                            >
                              {merchant.merchantName}
                            </strong>
                            <br />
                            <small>
                              {merchant.merchantBusinessType}
                            </small>
                          </div>
                        </div>
                      </td>
                    )}

                    {visibleColumns.ownerInfo && (
                      <td>
                        {merchant.firstName} {merchant.lastName}
                        <br />
                        {merchant.merchantPhone}
                        <br />
                        <small>
                          {merchant.merchantEmail}
                        </small>
                      </td>
                    )}

                    {visibleColumns.zone && (
                      <td>
                        {merchantAddresses[merchant.merchantId] ? (
                          <div>
                            <strong>
                              {merchantAddresses[merchant.merchantId].areaName ||
                                merchant.area ||
                                "-"}
                            </strong>
                            {(merchantAddresses[merchant.merchantId].cityName ||
                              merchantAddresses[merchant.merchantId].stateName) && (
                                <div className="merchant-list-zone-details">
                                  {[
                                    merchantAddresses[merchant.merchantId].cityName,
                                    merchantAddresses[merchant.merchantId].stateName,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              )}
                          </div>
                        ) : (
                          merchant.area || merchant.zone || "-"
                        )}
                      </td>
                    )}

                    {visibleColumns.status && (
                      <td className="merchant-list-status-cell">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(merchant)}
                          className="merchant-list-toggle-btn"
                          title={
                            (merchant.isActive === "Y" || merchant.isActive === true || merchant.status === "ACTIVE")
                              ? "Click to Deactivate Merchant"
                              : "Click to Activate Merchant"
                          }
                        >
                          <div
                            className={`merchant-list-toggle-track ${(merchant.isActive === "Y" || merchant.isActive === true || merchant.status === "ACTIVE")
                              ? "active"
                              : "inactive"
                              }`}
                          >
                            <div
                              className={`merchant-list-toggle-thumb ${(merchant.isActive === "Y" || merchant.isActive === true || merchant.status === "ACTIVE")
                                ? "active"
                                : "inactive"
                                }`}
                            />
                          </div>
                        </button>
                      </td>
                    )}

                    {visibleColumns.date && (
                      <td>
                        {merchant.createdAt
                          ? new Date(merchant.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    )}

                    {visibleColumns.documents && (
                      <td className="merchant-list-docs-cell">
                        <button
                          type="button"
                          onClick={() => handleOpenDocumentsModal(merchant)}
                          className="merchant-list-docs-btn"
                          title="View Documents"
                        >
                          📄 Docs
                        </button>
                      </td>
                    )}

                    <td>
                      <div className="merchant-list-action-icons">
                        <FaEdit
                          onClick={() => handleEditMerchant(merchant)}
                          title="Edit Merchant"
                          className="merchant-list-edit-icon"
                        />
                      </div>
                    </td>
                  </tr>

                  {expandedRow === merchant.merchantId && (
                    <tr className="merchant-list-expanded-row">
                      <td colSpan="9">
                        <div className="merchant-list-expand-container">
                          <div className="merchant-list-left">
                            <div className="merchant-list-item">
                              <span>Merchant ID</span>
                              <strong>{merchant.merchantId || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Owner Name</span>
                              <strong>
                                {merchant.firstName} {merchant.lastName}
                              </strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Business Type</span>
                              <strong>
                                {merchant.merchantBusinessType || "N/A"}
                              </strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Email</span>
                              <strong>{merchant.merchantEmail || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Phone Number</span>
                              <strong>{merchant.merchantPhone || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Area</span>
                              <strong>{merchant.area || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>City</span>
                              <strong>{merchant.city || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>State</span>
                              <strong>{merchant.state || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>API Status</span>
                              <strong>{merchant.status || "N/A"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Is Approved</span>
                              <strong>{merchant.isApproved ? "True" : "False"}</strong>
                            </div>

                            <div className="merchant-list-item">
                              <span>Active Status</span>
                              <span
                                className={
                                  merchant.isActive === "Y" ||
                                    merchant.isActive === true
                                    ? "merchant-list-plan-badge"
                                    : "merchant-list-expired-badge"
                                }
                              >
                                {merchant.isActive === "Y" ||
                                  merchant.isActive === true
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </div>

                          <div className="merchant-list-right">
                            <button
                              onClick={() => openOutlets(merchant)}
                              className="merchant-list-view-outlets-btn"
                            >
                              <FaStore /> View All Outlets
                            </button>

                            <button
                              onClick={() => handleEditMerchant(merchant)}
                              className="merchant-list-edit-btn"
                            >
                              <FaEdit /> Edit Merchant
                            </button>

                            <button
                              onClick={() => handleViewMerchant(merchant)}
                              className="merchant-list-view-btn"
                            >
                              <FaEye /> View Details
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td className="merchant-list-no-data-cell" colSpan="9">
                  No Merchants Found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="merchant-list-pagination">
          <div className="merchant-list-pagination-info">
            Showing {filteredMerchants.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
            {Math.min(indexOfLastItem, filteredMerchants.length)} of {filteredMerchants.length} entries
          </div>

          <div className="merchant-list-pagination-buttons">
            <button
              className="merchant-list-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`merchant-list-pagination-btn ${currentPage === index + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            <button
              className="merchant-list-pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Documents Modal */}
      {showDocModal && selectedDocMerchant && (
        <div
          className="doc-modal-backdrop"
          onClick={() => setShowDocModal(false)}
        >
          <div
            className="doc-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doc-modal-header">
              <h3>
                📄 Documents - {selectedDocMerchant.merchantName}
              </h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="doc-modal-close"
              >
                ×
              </button>
            </div>

            {docModalLoading ? (
              <p className="doc-modal-loading">Loading documents...</p>
            ) : (
              <div className="doc-modal-body">
                <div className="doc-section">
                  <div className="doc-section-title">
                    Aadhaar Card
                  </div>
                  <div className="doc-section-number">
                    Number: <strong>{merchantProfiles[selectedDocMerchant.merchantId]?.aadharNumber || "N/A"}</strong>
                  </div>
                  {merchantProfiles[selectedDocMerchant.merchantId]?.aadhaarNumberUrl ? (
                    <a
                      href={merchantProfiles[selectedDocMerchant.merchantId].aadhaarNumberUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doc-download-link"
                    >
                      📥 View / Download Aadhaar
                    </a>
                  ) : (
                    <span className="doc-no-url">No document URL uploaded</span>
                  )}
                </div>

                <div className="doc-section">
                  <div className="doc-section-title">
                    PAN Card
                  </div>
                  <div className="doc-section-number">
                    Number: <strong>{merchantProfiles[selectedDocMerchant.merchantId]?.panNumber || "N/A"}</strong>
                  </div>
                  {merchantProfiles[selectedDocMerchant.merchantId]?.panNumberUrl ? (
                    <a
                      href={merchantProfiles[selectedDocMerchant.merchantId].panNumberUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="doc-download-link"
                    >
                      📥 View / Download PAN
                    </a>
                  ) : (
                    <span className="doc-no-url">No document URL uploaded</span>
                  )}
                </div>
              </div>
            )}

            <div className="doc-modal-footer">
              <button
                onClick={() => setShowDocModal(false)}
                className="doc-modal-close-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Picture Modal */}
      {showPicModal && selectedPicMerchant && (
        <div
          className="pic-modal-backdrop"
          onClick={() => setShowPicModal(false)}
        >
          <div
            className="pic-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pic-modal-header">
              <h3>
                🖼️ Profile Picture - {selectedPicMerchant.merchantName}
              </h3>
              <button
                onClick={() => setShowPicModal(false)}
                className="pic-modal-close"
              >
                ×
              </button>
            </div>

            <div className="pic-modal-body">
              {previewPicUrl ? (
                <img
                  src={previewPicUrl}
                  alt="Preview"
                  className="pic-modal-preview"
                />
              ) : (
                <div className="pic-modal-placeholder">
                  {(selectedPicMerchant?.merchantName || selectedPicMerchant?.firstName || "M").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="pic-modal-upload-section">
                <label className="pic-modal-file-label">
                  Select Image File (.png, .jpg, .jpeg)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePicFileChange}
                  className="pic-modal-file-input"
                />
                {selectedPicFile && (
                  <small className="pic-modal-file-name">
                    Selected: {selectedPicFile.name} ({(selectedPicFile.size / 1024).toFixed(1)} KB)
                  </small>
                )}
              </div>
            </div>

            <div className="pic-modal-footer">
              <button
                onClick={() => setShowPicModal(false)}
                disabled={updatingPic}
                className="pic-modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfilePic}
                disabled={updatingPic}
                className="pic-modal-save-btn"
              >
                {updatingPic ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Merchants;