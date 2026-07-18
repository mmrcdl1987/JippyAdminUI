import { useState, useEffect } from "react";
import "../styles/Outlets.css";


import {
  getAllOutlets,
  getOutletCount
} from "../services/masterProductsService";

import {
  FiEdit,
  FiTrash2
//   FiEye
} from "react-icons/fi";

 
function Outlets({
  setActivePage,
}) {

  const [outlets, setOutlets] = useState([]);
  const [totalOutlets, setTotalOutlets] = useState(0);

  const fetchOutlets = async () => {

    try {

      const response = await getAllOutlets();

      console.log(response.data);

      setOutlets(response.data.data);

    } catch (error) {

      console.error(error);

    }

  };



  //Total outlets count
  const fetchOutletCount = async () => {

  try {

    const response = await getOutletCount();

    console.log(response.data);

    setTotalOutlets(response.data.data);

  } catch (error) {

    console.error(error);

  }

};

useEffect(() => {

  fetchOutlets();
  fetchOutletCount();

}, []);

const activeOutlets = outlets.filter(
  (outlet) => outlet.isActive === "Y"
).length;

const inactiveOutlets = outlets.filter(
  (outlet) => outlet.isActive !== "Y"
).length;

const newlyJoinedOutlets = 0; 

  
  return (

    <div className="outlets-page">

      {/* Header */}

      <div className="outlets-page-header">

        <h1>Outlets</h1>

      </div>

      {/* Section */}

      <div className="outlets-section-header">

        <h2>🏪 Outlets</h2>

        <span className="outlets-count-badge">

          {outlets.length}

        </span>

      </div>

      {/* Filters */}

      <div className="outlets-filter-row">

        <select>

          <option>Outlet Type</option>
         

        </select>

        <select>

          <option>Business Model</option>

        </select>

        <select>

          <option>Select Zone</option>

        </select>

        <select>

          <option>Best Outlets</option>

        </select>

      </div>

      {/* Statistics */}

      <div className="outlets-stats-grid">

        <div className="outlets-stat-card blue">

          <h3>{totalOutlets}</h3>

          <p>Total Outlets</p>

        </div>

        <div className="outlets-stat-card cream">

          <h3>{activeOutlets}</h3>

          <p>Active Outlets</p>

        </div>

        <div className="outlets-stat-card green">

          <h3>{inactiveOutlets}</h3>

          <p>Inactive Outlets</p>

        </div>

        <div className="outlets-stat-card pink">

          <h3>{newlyJoinedOutlets}</h3>

          <p>Newly Joined Outlets</p>

        </div>

      </div>

      {/* Bulk Upload */}

      <div className="outlets-bulk-card">

        <div className="outlets-bulk-header">

          <div>

            <h3>Bulk Import / Update Outlets</h3>

            <p>

              Upload Excel file to import or update multiple outlets at once.

            </p>

          </div>

          <button className="outlets-download-btn">

            ⬇ Download Template

          </button>

        </div>

        <div className="outlets-bulk-body">

          <label>Select Excel File (.xls/.xlsx)</label>

          <input
            type="file"
            accept=".xls,.xlsx"
          />

          <small>

            File should contain outletId, outletName, merchantId, phone, address etc.

          </small>

          <button className="outlets-bulk-upload-btn">

            ⬆ Bulk Upload

          </button>

        </div>

      </div>

      {/* Global Status */}

      <div className="outlets-status-card">

        <div>

          <h4>Global Outlet Status</h4>

          <p>

            Override all outlets open / closed status

          </p>

        </div>

        <div className="outlets-status-actions">

          <span className="outlets-status-text">

            ✓ All Open

          </span>

          <button className="outlets-apply-btn">

            Apply to All Outlets

          </button>

        </div>

      </div>

      {/* Outlets List */}

      <div className="outlets-list-card">

        <div className="outlets-list-header">

          <div>

            <h3>Outlets List</h3>

            <p>

              View and manage all the outlets

            </p>

          </div>

          <div className="outlets-list-header-buttons">

            <button className="outlets-columns-btn">

              Columns ▼

            </button>

          <button
  className="outlets-create-btn"
  onClick={() => setActivePage("createOutlet")}
>
  + Create Outlet
</button>

          </div>

        </div>

        {/* Toolbar */}

        <div className="outlets-table-toolbar">

          <div className="outlets-entries">

            Show

            <select>

              <option>10</option>

              <option>30</option>

              <option>50</option>

              <option>100</option>

            </select>

            entries

          </div>

          <div className="outlets-toolbar-right">

            <input
              type="text"
              placeholder="Search here..."
              className="outlets-search-box"
            />

            <button className="outlets-export-btn">

              Export ▼

            </button>

          </div>

        </div>

      <div className="outlets-table-wrapper">

  <table className="outlets-table">


          <thead>

            <tr>

              <th>Outlet ID</th>

              <th>Merchant ID</th>

              <th>Outlet Name</th>

              <th>Cuisine Type</th>

              <th>Phone</th>

              <th>Menu Items</th>

              <th>State ID</th>

              <th>Area ID</th>

              <th>Road</th>

              <th>Landmark</th>

              <th>Building No.</th>

              <th>Status</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

                      {outlets.map((outlet) => (

            <tr key={outlet.outletId}>

              <td>{outlet.outletId}</td>

              <td>{outlet.merchantId}</td>

              <td>{outlet.outletName}</td>

              <td>{outlet.cuisineType}</td>

              <td>{outlet.outletPhone}</td>

              <td>{outlet.menuItemCount}</td>

              <td>{outlet.stateId}</td>

              <td>{outlet.areaId}</td>

              <td>{outlet.road}</td>

              <td>{outlet.landmark}</td>

              <td>{outlet.buildingNumber}</td>

              <td>

                <span
                  className={
                    outlet.isActive === "Y"
                      ? "outlets-active-status"
                      : "outlets-inactive-status"
                  }
                >
                  {outlet.isActive === "Y"
                    ? "Active"
                    : "Inactive"}
                </span>

              </td>

              <td className="outlets-actions">

 <span
  className="edit-icon"
  onClick={() => {

    setSelectedOutlet(outlet);

    setActivePage("editOutlet");

  }}
>
  ✏️
</span>

  <span className="delete-icon">
    🗑️
  </span>

</td>
            </tr>

          ))}

          </tbody>

        </table>
</div>
      </div>

    </div>

  );

}

export default Outlets;