import "../../styles/DriverTable.css";

import {
  FiSearch,
  FiDownloadCloud,
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
  const [search, setSearch] =
    useState(searchQuery || "");

  const [
    showExportMenu,
    setShowExportMenu,
  ] = useState(false);

  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */
  const handleSearch = (e) => {
    const value =
      e.target.value;

    setSearch(value);

    if (setSearchQuery) {
      setSearchQuery(value);
    }
  };

  /*
   * =========================================================
   * CREATE DRIVER
   * =========================================================
   */
  const handleCreateDriver = () => {
    setActivePage("createDriver");
  };

  /*
   * =========================================================
   * DRIVER DATA
   *
   * Filtering is already handled by AllDrivers.
   * We simply display the drivers received.
   * =========================================================
   */

  return (
    <div className="jippy-driver-table-container">

      {/* =====================================================
          TABLE HEADER
          ===================================================== */}
      <div className="jippy-driver-table-header">

        <div>
          <h3>
            Drivers List
          </h3>

          <p>
            View and manage all the drivers
          </p>
        </div>

        <button
          type="button"
          className="jippy-driver-create-btn"
          onClick={
            handleCreateDriver
          }
        >
          + Create Driver
        </button>

      </div>

      {/* =====================================================
          TOOLBAR
          ===================================================== */}
      <div className="jippy-driver-toolbar">

        {/* ENTRIES */}
        <div className="jippy-driver-entries">

          <span>
            Show
          </span>

          <select
            className="jippy-driver-entry-select"
            value={driversPerPage}
            onChange={(e) =>
              setDriversPerPage(
                Number(e.target.value)
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

        {/* SEARCH + EXPORT */}
        <div className="jippy-driver-toolbar-right">

          {/* SEARCH */}
          <div className="jippy-driver-search-wrapper">

            <input
              type="text"
              className="jippy-driver-search-input"
              placeholder="Search here..."
              value={search}
              onChange={
                handleSearch
              }
            />

            <FiSearch className="jippy-driver-search-icon" />

          </div>

          {/* EXPORT */}
          <div className="jippy-driver-export-wrapper">

            <button
              type="button"
              className="jippy-driver-export-btn"
              onClick={() =>
                setShowExportMenu(
                  (previous) =>
                    !previous
                )
              }
            >
              <FiDownloadCloud />

              <span>
                Export as
              </span>
            </button>

            {showExportMenu && (
              <div className="jippy-driver-export-menu">

                <button
                  type="button"
                >
                  Export PDF
                </button>

                <button
                  type="button"
                >
                  Export Excel
                </button>

                <button
                  type="button"
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
      <div className="jippy-driver-table-scroll">

        <table className="jippy-driver-table">

          {/* TABLE HEADER */}
          <thead>
            <tr>

              <th>
                Driver ID
              </th>

              <th>
                First Name
              </th>

              <th>
                Last Name
              </th>

              <th>
                Email
              </th>

              <th>
                Phone Number
              </th>

              <th>
                Area
              </th>

              <th>
                Status
              </th>

              <th>
                Profile Picture
              </th>

              <th>
                Actions
              </th>

            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody>

            {drivers &&
            drivers.length > 0 ? (
              drivers.map(
                (driver) => (
                  <DriverTableRow
                    key={
                      driver.driverId ||
                      driver.id
                    }
                    driver={driver}
                    onView={
                      onView
                    }
                    onEdit={
                      () =>
                        onEdit(
                          driver
                        )
                    }
                    onDelete={
                      () =>
                        onDelete(
                          driver
                        )
                    }
                  />
                )
              )
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="jippy-driver-no-result"
                >
                  No Results Found
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* =====================================================
          TABLE FOOTER
          ===================================================== */}
      <div className="jippy-driver-table-footer">

        <span>
          Showing{" "}
          {drivers?.length || 0}{" "}
          entries
        </span>

      </div>

    </div>
  );
}

export default DriverTable;