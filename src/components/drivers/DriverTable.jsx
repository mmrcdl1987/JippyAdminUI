import "../../styles/DriverTable.css";
import { FiSearch, FiDownloadCloud } from "react-icons/fi";
import { useState } from "react";
import DriverTableRow from "./DriverTableRow";

function DriverTable({ drivers }) {
  const [search, setSearch] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filteredDrivers = drivers.filter((driver) => {
    const keyword = search.toLowerCase();

    return (
      driver.firstName.toLowerCase().includes(keyword) ||
      driver.lastName.toLowerCase().includes(keyword) ||
      driver.email.toLowerCase().includes(keyword) ||
      driver.phoneNumber.includes(keyword)
    );
  });

  return (
    <div className="driver-table-container">

      <div className="driver-table-header">

        <div>
          <h3>Drivers List</h3>
          <p>View and manage all the drivers</p>
        </div>

        <button className="create-driver-btn">
          + Create Driver
        </button>

      </div>

      <div className="driver-toolbar">

        <div className="driver-entries-section">

          <span>Show</span>

          <select>
            <option>10</option>
            <option>30</option>
            <option>50</option>
            <option>100</option>
          </select>

          <span>entries</span>

        </div>

        <div className="driver-toolbar-right">

          <div className="driver-search-wrapper">

            <input
              type="text"
              className="driver-search-box"
              placeholder="Search here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <FiSearch className="driver-search-icon" />

          </div>

          <div className="driver-export-wrapper">

            <button
              className="driver-export-btn"
              onClick={() =>
                setShowExportMenu(!showExportMenu)
              }
            >
              <FiDownloadCloud />
              Export as
            </button>

            {showExportMenu && (

              <div className="driver-export-menu">

                <div>Export PDF</div>

                <div>Export Excel</div>

                <div>Export CSV</div>

              </div>

            )}

          </div>

        </div>

      </div>

      <table className="driver-table">

        <thead>

          <tr>

            <th></th>

            <th>Driver ID</th>

            <th>First Name</th>

            <th>Last Name</th>

            <th>Email</th>

            <th>Phone Number</th>

            <th>Nominee Name</th>

            <th>Nominee Phone</th>

            <th>Family Member</th>

            <th>Family Phone</th>

            <th>Profile Picture</th>

          </tr>

        </thead>

        <tbody>

          {filteredDrivers.length > 0 ? (

            filteredDrivers.map((driver) => (

              <DriverTableRow
                key={driver.driverId}
                driver={driver}
              />

            ))

          ) : (

            <tr>

              <td
                colSpan="11"
                className="driver-no-result"
              >
                No Results Found
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

export default DriverTable;