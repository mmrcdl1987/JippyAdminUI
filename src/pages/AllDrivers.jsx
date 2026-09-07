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
    <div className="jippy-all-drivers-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="jippy-all-drivers-header">
        <h2>
          All Drivers
        </h2>
      </div>

      {/* =====================================================
          TITLE
          ===================================================== */}

      <div className="jippy-drivers-title-section">
        <h3>
          <span>
            Drivers List
          </span>

          <span className="jippy-drivers-count">
            {filteredDrivers.length}
          </span>
        </h3>
      </div>

      {/* =====================================================
          FILTERS
          ===================================================== */}

      <div className="jippy-drivers-filter-section">

        {/* DRIVER STATUS */}

        <div className="jippy-driver-filter-wrapper">
          <Select
            className="jippy-driver-react-select"
            classNamePrefix="jippy-driver-select"
            placeholder="Driver Status"
            isClearable
            options={
              driverStatusOptions
            }
          />
        </div>

        {/* VERIFICATION */}

        <div className="jippy-driver-filter-wrapper">
          <Select
            className="jippy-driver-react-select"
            classNamePrefix="jippy-driver-select"
            placeholder="Verification"
            isClearable
            options={
              verificationOptions
            }
          />
        </div>

        {/* DATE RANGE */}

        <div className="jippy-driver-date-wrapper">

          <button
            type="button"
            className="jippy-driver-date-button"
            onClick={() =>
              setShowCalendar(
                !showCalendar
              )
            }
          >
            <span>
              Select Range
            </span>

            <span className="jippy-driver-date-arrow">
              ▼
            </span>
          </button>

          {showCalendar && (
            <div className="jippy-driver-calendar-popup">

              <DateRange
                editableDateInputs
                ranges={range}
                onChange={(item) =>
                  setRange([
                    item.selection,
                  ])
                }
                months={2}
                direction="horizontal"
                rangeColors={[
                  "#ff6b00",
                ]}
              />

              <div className="jippy-driver-calendar-actions">

                <button
                  type="button"
                  onClick={
                    handleCancelRange
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleApplyRange
                  }
                >
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

          <p>
            Loading drivers...
          </p>

        ) : (

          <>

            <DriverTable
              drivers={
                currentDrivers
              }

              setActivePage={
                setActivePage
              }

              driversPerPage={
                driversPerPage
              }

              setDriversPerPage={
                handleEntriesChange
              }

              searchQuery={
                searchQuery
              }

              setSearchQuery={
                handleSearchChange
              }

              /*
               * Driver name click
               */
              onView={
                handleViewDriver
              }

              /*
               * Edit
               */
              onEdit={
                handleEditDriver
              }

              /*
               * Delete
               */
              onDelete={
                handleDeleteDriver
              }
            />

            {/* =================================================
                PAGINATION
                ================================================= */}

            <div
              className="jippy-pagination-controls"
              style={{
                marginTop: "20px",
                display: "flex",
                gap: "10px",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >

              {/* PREVIOUS */}

              <button
                type="button"
                onClick={() =>
                  paginate(
                    safeCurrentPage - 1
                  )
                }
                disabled={
                  safeCurrentPage ===
                  1
                }
                style={{
                  padding:
                    "5px 12px",
                  cursor:
                    safeCurrentPage ===
                    1
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Previous
              </button>

              {/* PAGE */}

              <span
                style={{
                  fontSize: "14px",
                }}
              >
                Page{" "}
                {safeCurrentPage} of{" "}
                {totalPages}
              </span>

              {/* NEXT */}

              <button
                type="button"
                onClick={() =>
                  paginate(
                    safeCurrentPage + 1
                  )
                }
                disabled={
                  safeCurrentPage ===
                    totalPages ||
                  totalPages === 0
                }
                style={{
                  padding:
                    "5px 12px",
                  cursor:
                    safeCurrentPage ===
                    totalPages
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Next
              </button>

            </div>

          </>

        )}

      </div>

    </div>
  );
}

export default AllDrivers;