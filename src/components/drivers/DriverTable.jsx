import "../../styles/DriverTable.css";

import {
  FiSearch,
  FiDownloadCloud,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useState } from "react";

import DriverTableRow from "./DriverTableRow";

function DriverTable({
  drivers,
  setActivePage,
  driversPerPage,
  setDriversPerPage,
  searchQuery,
  setSearchQuery,
  onView,
  onEdit,
  onDelete,
}) {
  const [search, setSearch] = useState(searchQuery || "");
  const [showExportMenu, setShowExportMenu] = useState(false);

  /*
   * SEARCH
   */
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (setSearchQuery) {
      setSearchQuery(value);
    }
  };

  const handleClearSearch = () => {
    setSearch("");
    if (setSearchQuery) {
      setSearchQuery("");
    }
  };

  return (
    <div className="cat-main-card jippy-driver-table-container">
      {/* =====================================================
          CARD HEADER (Categories Style)
          ===================================================== */}
      <div className="cat-card-header jippy-driver-table-header">
        <div>
          <h2>Drivers List</h2>
          <p>View, search and manage registered delivery partners</p>
        </div>

        <div className="cat-results-count">
          <strong>{drivers?.length || 0}</strong>
          <span>Drivers</span>
        </div>
      </div>

      {/* =====================================================
          TOOLBAR (Categories Style)
          ===================================================== */}
      <div className="cat-toolbar jippy-driver-toolbar">
        {/* Search Input */}
        <div className="cat-search-wrapper jippy-driver-search-wrapper">
          <FiSearch className="cat-search-icon jippy-driver-search-icon" />

          <input
            type="text"
            className="jippy-driver-search-input"
            placeholder="Search driver by name, phone, email, area or ID..."
            value={search}
            onChange={handleSearch}
          />

          {search && (
            <button
              type="button"
              className="cat-search-clear"
              onClick={handleClearSearch}
              title="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="cat-toolbar-right jippy-driver-toolbar-right">
          {/* Entries */}
          <div className="jippy-driver-entries">
            <span>Show</span>
            <select
              className="jippy-driver-entry-select"
              value={driversPerPage}
              onChange={(e) => setDriversPerPage(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries</span>
          </div>

          {/* Export Menu */}
          <div className="jippy-driver-export-wrapper">
            <button
              type="button"
              className="jippy-driver-export-btn"
              onClick={() => setShowExportMenu((prev) => !prev)}
            >
              <FiDownloadCloud />
              <span>Export</span>
            </button>

            {showExportMenu && (
              <div className="jippy-driver-export-menu">
                <button
                  type="button"
                  onClick={() => setShowExportMenu(false)}
                >
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(false)}
                >
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={() => setShowExportMenu(false)}
                >
                  Export CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE
          ===================================================== */}
      <div className="cat-table-wrapper jippy-driver-table-scroll">
        <table className="cat-table jippy-driver-table">
          <thead>
            <tr>
              <th style={{ width: "80px" }}>ID</th>
              <th>Driver</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Area</th>
              <th>Status</th>
              <th style={{ textAlign: "center", width: "130px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {drivers && drivers.length > 0 ? (
              drivers.map((driver) => (
                <DriverTableRow
                  key={driver.driverId || driver.id}
                  driver={driver}
                  onView={onView}
                  onEdit={() => onEdit(driver)}
                  onDelete={() => onDelete(driver)}
                />
              ))
            ) : (
              <tr>
                <td colSpan="7" className="cat-empty-cell">
                  <div className="cat-empty-state">
                    <div className="cat-empty-icon">
                      <FiUsers />
                    </div>
                    <h3>No Drivers Found</h3>
                    <p>
                      {search
                        ? `No drivers match "${search}".`
                        : "No drivers are currently available."}
                    </p>
                    {search && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DriverTable;