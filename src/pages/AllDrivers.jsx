import "../styles/AllDrivers.css";
import { useState, useEffect } from "react";
import Select from "react-select";
import { DateRange } from "react-date-range";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import DriverTable from "../components/drivers/DriverTable";
import {
  getAllDrivers,
  getDriverById,
} from "../services/driverService";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiPlus,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

function AllDrivers({ setActivePage }) {
  const [showCalendar, setShowCalendar] =
    useState(false);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // =========================================================
  // STATES
  // =========================================================

  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [driversPerPage, setDriversPerPage] =
    useState(10);

  // Selected driver for edit
  const [selectedDriver, setSelectedDriver] =
    useState(null);

  const [statusFilter, setStatusFilter] = useState(null);
  const [verificationFilter, setVerificationFilter] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // =========================================================
  // LOAD ALL DRIVERS
  // =========================================================

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);

    try {
      const data = await getAllDrivers();

      setDrivers(
        Array.isArray(data)
          ? data
          : data?.drivers || []
      );
    } catch (error) {
      console.error(
        "Error fetching all drivers:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDrivers();
    setTimeout(() => setRefreshing(false), 500);
  };

  // =========================================================
  // DATE RANGE
  // =========================================================

  const handleApplyRange = () => {
    setShowCalendar(false);
  };

  const handleCancelRange = () => {
    setShowCalendar(false);
  };

  // =========================================================
  // DRIVER STATUS OPTIONS
  // =========================================================

  const driverStatusOptions = [
    {
      value: "ACTIVE",
      label: "Active",
    },
    {
      value: "INACTIVE",
      label: "Inactive",
    },
  ];

  // =========================================================
  // VERIFICATION OPTIONS
  // =========================================================

  const verificationOptions = [
    {
      value: "VERIFIED",
      label: "Verified",
    },
    {
      value: "NOT_VERIFIED",
      label: "Not Verified",
    },
  ];

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearchChange = (e) => {
    const query =
      typeof e === "string"
        ? e
        : e.target.value;

    setSearchQuery(query);

    // Always reset pagination to page 1
    setCurrentPage(1);
  };

  // =========================================================
  // FILTER DRIVERS
  // =========================================================

  const filteredDrivers = drivers.filter(
    (driver) => {
      // Status filter
      if (statusFilter?.value === "ACTIVE" && !driver?.isActive) return false;
      if (statusFilter?.value === "INACTIVE" && driver?.isActive) return false;

      // Verification filter
      if (verificationFilter?.value === "VERIFIED" && !driver?.isApproved) return false;
      if (verificationFilter?.value === "NOT_VERIFIED" && driver?.isApproved) return false;

      const query =
        searchQuery
          .toLowerCase()
          .trim();

      if (!query) {
        return true;
      }

      const driverId = String(
        driver?.driverId ||
          driver?.id ||
          ""
      ).toLowerCase();

      const firstName = String(
        driver?.firstName || ""
      ).toLowerCase();

      const lastName = String(
        driver?.lastName || ""
      ).toLowerCase();

      const phoneNumber = String(
        driver?.phoneNumber || ""
      ).toLowerCase();

      const email = String(
        driver?.email || ""
      ).toLowerCase();

      const area = String(
        driver?.areaName ||
          driver?.areaId ||
          ""
      ).toLowerCase();

      return (
        driverId.includes(query) ||
        firstName.includes(query) ||
        lastName.includes(query) ||
        phoneNumber.includes(query) ||
        email.includes(query) ||
        area.includes(query)
      );
    }
  );

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Math.ceil(
      filteredDrivers.length /
        driversPerPage
    ) || 1;

  const safeCurrentPage =
    currentPage > totalPages
      ? 1
      : currentPage;

  const indexOfLastDriver =
    safeCurrentPage *
    driversPerPage;

  const indexOfFirstDriver =
    indexOfLastDriver -
    driversPerPage;

  const currentDrivers =
    filteredDrivers.slice(
      indexOfFirstDriver,
      indexOfLastDriver
    );

  const paginate = (pageNumber) => {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages
    ) {
      return;
    }

    setCurrentPage(pageNumber);
  };

  // =========================================================
  // ENTRIES PER PAGE
  // =========================================================

  const handleEntriesChange = (
    newLimit
  ) => {
    setDriversPerPage(
      Number(newLimit)
    );

    setCurrentPage(1);
  };

  // =========================================================
  // VIEW DRIVER
  // =========================================================
  //
  // Clicking the Driver First Name will open
  // DriverDetails.jsx as a separate page.
  //
  // IMPORTANT:
  // setActivePage expects a STRING because
  // the dashboard uses pageRegistry.
  //
  // Do NOT pass an object here.
  //
  // =========================================================

  const handleViewDriver = (driver) => {
    const driverId =
      driver?.driverId ||
      driver?.id;

    if (!driverId) {
      console.error(
        "Driver ID not found:",
        driver
      );

      return;
    }

    console.log(
      "Opening Driver Details for Driver ID:",
      driverId
    );

    // Store the selected driver so that
    // DriverDetails.jsx can read it.
    sessionStorage.setItem(
      "selectedDriver",
      JSON.stringify(driver)
    );

    // IMPORTANT:
    // pageRegistry expects a string.
    //
    // Correct:
    // setActivePage("driverDetails");
    //
    // Incorrect:
    // setActivePage({
    //   name: "driverDetails",
    //   data: driver,
    // });

    setActivePage("driverDetails");
  };

  // =========================================================
  // EDIT DRIVER
  // =========================================================

  const handleEditDriver = async (
    driver
  ) => {
    const driverId =
      driver?.driverId ||
      driver?.id;

    if (!driverId) {
      console.error(
        "Driver ID not found on object:",
        driver
      );

      return;
    }

    try {
      setLoading(true);

      /*
       * Existing API
       *
       * getDriverById(driverId)
       */

      const detailedDriverData =
        await getDriverById(
          driverId
        );

      console.log(
        "Fetched driver details for editing:",
        detailedDriverData
      );

      setSelectedDriver(
        detailedDriverData
      );

      /*
       * If you have an Edit Driver page,
       * you can navigate here.
       *
       * Example:
       *
       * sessionStorage.setItem(
       *   "selectedDriver",
       *   JSON.stringify(detailedDriverData)
       * );
       *
       * setActivePage("editDriver");
       */
    } catch (error) {
      console.error(
        "Failed to fetch driver details for editing:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DELETE DRIVER
  // =========================================================

  const handleDeleteDriver = async (
    driver
  ) => {
    const driverId =
      driver?.driverId ||
      driver?.id;

    console.log(
      "Delete driver ID:",
      driverId
    );

    // Add delete API here when available.
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="cat-page jippy-all-drivers-page">
      {/* =====================================================
          PAGE HEADER (Categories Style)
          ===================================================== */}
      <div className="cat-page-header">
        <div className="cat-heading-left">
          <div className="cat-heading-icon">
            <FiUsers />
          </div>

          <div>
            <h1 className="cat-title">Drivers Management</h1>
            <p className="cat-subtitle">
              Manage delivery partners, view profiles, and monitor verification status
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="cat-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            title="Refresh driver list"
          >
            <FiRefreshCw className={refreshing || loading ? "cat-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="cat-create-btn"
            onClick={() => setActivePage("createDriver")}
          >
            <FiPlus />
            Create Driver
          </button>
        </div>
      </div>

      {/* =====================================================
          STAT CARDS (Categories Style)
          ===================================================== */}
      <div className="cat-stats-grid">
        {/* TOTAL */}
        <div className="cat-stat-card cat-stat-purple">
          <div className="cat-stat-icon">
            <FiUsers />
          </div>
          <div className="cat-stat-content">
            <span>Total Drivers</span>
            <strong>{drivers.length}</strong>
            <small>Registered delivery partners</small>
          </div>
        </div>

        {/* ACTIVE */}
        <div className="cat-stat-card cat-stat-green">
          <div className="cat-stat-icon">
            <FiUserCheck />
          </div>
          <div className="cat-stat-content">
            <span>Active Drivers</span>
            <strong>{drivers.filter((d) => d?.isActive).length}</strong>
            <small>Currently active on platform</small>
          </div>
        </div>

        {/* INACTIVE */}
        <div className="cat-stat-card cat-stat-blue">
          <div className="cat-stat-icon">
            <FiUserX />
          </div>
          <div className="cat-stat-content">
            <span>Inactive Drivers</span>
            <strong>{drivers.filter((d) => !d?.isActive).length}</strong>
            <small>Inactive or pending verification</small>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTERS SECTION
          ===================================================== */}
      <div className="driver-filters-bar">
        {/* DRIVER STATUS */}
        <div className="driver-filter-item">
          <Select
            className="jippy-driver-react-select"
            classNamePrefix="jippy-driver-select"
            placeholder="Driver Status"
            isClearable
            value={statusFilter}
            onChange={(selected) => {
              setStatusFilter(selected);
              setCurrentPage(1);
            }}
            options={driverStatusOptions}
          />
        </div>

        {/* VERIFICATION */}
        <div className="driver-filter-item">
          <Select
            className="jippy-driver-react-select"
            classNamePrefix="jippy-driver-select"
            placeholder="Verification"
            isClearable
            value={verificationFilter}
            onChange={(selected) => {
              setVerificationFilter(selected);
              setCurrentPage(1);
            }}
            options={verificationOptions}
          />
        </div>

        {/* DATE RANGE */}
        <div className="jippy-driver-date-wrapper">
          <button
            type="button"
            className="jippy-driver-date-button"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            <span>Select Range</span>
            <span className="jippy-driver-date-arrow">▼</span>
          </button>

          {showCalendar && (
            <div className="jippy-driver-calendar-popup">
              <DateRange
                editableDateInputs
                ranges={range}
                onChange={(item) => setRange([item.selection])}
                months={2}
                direction="horizontal"
                rangeColors={["#4f46e5"]}
              />

              <div className="jippy-driver-calendar-actions">
                <button type="button" onClick={handleCancelRange}>
                  Cancel
                </button>
                <button type="button" onClick={handleApplyRange}>
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          TABLE SECTION
          ===================================================== */}
      <div className="jippy-drivers-table-section">
        {loading ? (
          <div className="driver-loading-card">
            <span>Loading drivers...</span>
          </div>
        ) : (
          <>
            <DriverTable
              drivers={currentDrivers}
              setActivePage={setActivePage}
              driversPerPage={driversPerPage}
              setDriversPerPage={handleEntriesChange}
              searchQuery={searchQuery}
              setSearchQuery={handleSearchChange}
              onView={handleViewDriver}
              onEdit={handleEditDriver}
              onDelete={handleDeleteDriver}
            />

            {/* =================================================
                PAGINATION (Categories Style)
                ================================================= */}
            <div className="cat-footer">
              <div className="cat-footer-info">
                Showing{" "}
                <strong>
                  {filteredDrivers.length > 0 ? indexOfFirstDriver + 1 : 0}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(indexOfLastDriver, filteredDrivers.length)}
                </strong>{" "}
                of <strong>{filteredDrivers.length}</strong> entries
              </div>

              <div className="pagination-controls">
                {/* PREVIOUS */}
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => paginate(safeCurrentPage - 1)}
                  disabled={safeCurrentPage === 1}
                  title="Previous Page"
                >
                  <FiChevronLeft />
                </button>

                {/* PAGE NUMBERS */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safeCurrentPage) <= 1
                  )
                  .map((p, idx, arr) => (
                    <span key={p} className="pagination-item">
                      {idx > 0 && p - arr[idx - 1] > 1 && (
                        <span className="pagination-dots">...</span>
                      )}
                      <button
                        type="button"
                        className={`page-btn ${
                          p === safeCurrentPage ? "active" : ""
                        }`}
                        onClick={() => paginate(p)}
                      >
                        {p}
                      </button>
                    </span>
                  ))}

                {/* NEXT */}
                <button
                  type="button"
                  className="page-btn"
                  onClick={() => paginate(safeCurrentPage + 1)}
                  disabled={
                    safeCurrentPage === totalPages || totalPages === 0
                  }
                  title="Next Page"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AllDrivers;