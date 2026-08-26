import "../../styles/DriverTable.css";

import { getDriverDetails } from "../../services/driverService";

import {
  FiSearch,
  FiDownloadCloud,
} from "react-icons/fi";

import { useState } from "react";

import DriverTableRow from "./DriverTableRow";


function DriverTable({
  drivers,
  setActivePage,
}) {

  const [search, setSearch] = useState("");

  const [showExportMenu, setShowExportMenu] =
    useState(false);

  const [expandedDriverId, setExpandedDriverId] =
    useState(null);

  const [expandedDriver, setExpandedDriver] =
    useState(null);

  const [driverDetailsLoading, setDriverDetailsLoading] =
    useState(false);


  /* =========================================================
     EXPAND / COLLAPSE DRIVER
     Only one driver can be expanded at a time
     ========================================================= */

  const handleToggleDriver = async (driver) => {

    /* Close currently expanded driver */

    if (expandedDriverId === driver.driverId) {

      setExpandedDriverId(null);
      setExpandedDriver(null);

      return;
    }


    try {

      /*
       * Immediately close previous driver
       * and open selected driver.
       */

      setExpandedDriverId(driver.driverId);

      setExpandedDriver(null);

      setDriverDetailsLoading(true);


      /*
       * GET
       * /api/driver/getDriverDetails?driverId={driverId}
       */

      const details =
        await getDriverDetails(driver.driverId);


      /*
       * Merge table data + API details.
       *
       * The getDriverDetails API does not return
       * profilePicUrl / isApproved, so we preserve
       * those values from the table object if available.
       */

      const mergedDriver = {
        ...driver,
        ...details,

        profilePicture:
          details?.profilePicture ||
          details?.profilePicUrl ||
          driver?.profilePicture ||
          driver?.profilePicUrl ||
          null,

        isApproved:
          details?.isApproved ??
          driver?.isApproved ??
          null,
      };


      setExpandedDriver(mergedDriver);

    } catch (error) {

      console.error(
        "Failed to fetch driver details:",
        error
      );

      setExpandedDriver(null);

    } finally {

      setDriverDetailsLoading(false);

    }

  };


  /* =========================================================
     SEARCH
     ========================================================= */

  const filteredDrivers = drivers.filter((driver) => {

    const keyword =
      search.toLowerCase().trim();


    return (

      String(driver.firstName || "")
        .toLowerCase()
        .includes(keyword)

      ||

      String(driver.lastName || "")
        .toLowerCase()
        .includes(keyword)

      ||

      String(driver.email || "")
        .toLowerCase()
        .includes(keyword)

      ||

      String(driver.phoneNumber || "")
        .includes(keyword)

      ||

      String(driver.driverId || "")
        .includes(keyword)

    );

  });


  /* =========================================================
     EDIT DRIVER
     ========================================================= */

  const handleEditDriver = (driver) => {

    console.log(
      "Edit Driver:",
      driver
    );

    /*
     * Later connect your Edit Driver page here.
     *
     * Example:
     *
     * setActivePage("editDriver");
     */

  };


  /* =========================================================
     DELETE DRIVER
     ========================================================= */

  const handleDeleteDriver = (driver) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${driver.firstName} ${driver.lastName}?`
      );


    if (!confirmed) {
      return;
    }


    console.log(
      "Delete Driver:",
      driver
    );

    /*
     * DELETE API can be integrated here
     * when backend provides it.
     */

  };


  /* =========================================================
     CREATE DRIVER
     ========================================================= */

  const handleCreateDriver = () => {

    setActivePage("createDriver");

  };


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
          onClick={handleCreateDriver}
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
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <FiSearch
              className="jippy-driver-search-icon"
            />

          </div>


          {/* EXPORT */}

          <div className="jippy-driver-export-wrapper">

            <button
              type="button"
              className="jippy-driver-export-btn"
              onClick={() =>
                setShowExportMenu(
                  (previous) => !previous
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

                <button type="button">
                  Export PDF
                </button>

                <button type="button">
                  Export Excel
                </button>

                <button type="button">
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


          {/* TABLE HEAD */}

          <thead>

            <tr>

              <th className="jippy-driver-expand-column">
                #
              </th>

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
                Family Member
              </th>

              <th>
                Family Phone
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

            {filteredDrivers.length > 0 ? (

              filteredDrivers.map((driver) => (

                <DriverTableRow
                  key={driver.driverId}
                  driver={driver}

                  isExpanded={
                    expandedDriverId ===
                    driver.driverId
                  }

                  expandedDriver={
                    expandedDriverId ===
                    driver.driverId
                      ? expandedDriver
                      : null
                  }

                  loading={
                    expandedDriverId ===
                      driver.driverId &&
                    driverDetailsLoading
                  }

                  onToggle={() =>
                    handleToggleDriver(driver)
                  }

                  onEdit={() =>
                    handleEditDriver(driver)
                  }

                  onDelete={() =>
                    handleDeleteDriver(driver)
                  }
                />

              ))

            ) : (

              <tr>

                <td
                  colSpan="10"
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
          Showing {filteredDrivers.length} of{" "}
          {drivers.length} entries
        </span>

      </div>

    </div>

  );

}


export default DriverTable;