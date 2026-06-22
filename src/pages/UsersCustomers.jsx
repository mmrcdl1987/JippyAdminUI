import { useEffect, useState } from "react";
import { FM_API } from "../services/api";
import "../styles/UsersCustomers.css";

function UsersCustomers({
  setActivePage
}) {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {

    try {

      // Change API after backend is ready
   const response =
  await FM_API.get("/api/co/customers");

      setUsers(response.data);

    } catch (error) {

      console.error(
        "Error Loading Customers:",
        error
      );

      setUsers([]);
    }
  };

  const filteredUsers =
    users.filter((user) =>
      (
        user.customerName ||
        user.name ||
        ""
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (

    <div className="users-container">

      {/* Page Title */}

      <div className="page-title">

        <h2>Users</h2>

      </div>

      {/* Top Card */}

      <div className="users-overview-card">

        <div className="users-header">

          <div className="users-info">

            <h3>👤 Users</h3>

            <span className="users-count">
              {users.length}
            </span>

          </div>

          <div className="filters">

            <select>
              <option>Status</option>
            </select>

            <select>
              <option>Select Zone</option>
            </select>

            <select>
              <option>Select Range</option>
            </select>

          </div>

        </div>

        <div className="bulk-import-card">

          <div>

            <h3>
              Bulk Import Users
            </h3>

            <p>
              Upload Excel file to import multiple users at once
            </p>

            <label>
              Select Excel File (.xls/.xlsx)
            </label>

            <input type="file" />

          </div>

          <div className="bulk-actions">

            <button className="download-btn">
              ⬇ Download Template
            </button>

            <button className="import-btn">
              ⬆ Import Users
            </button>

          </div>

        </div>

      </div>

      {/* Users List */}

      <div className="users-list-card">

        <div className="list-header">

          <div>

            <h3>
              Users List
            </h3>

            <p>
              View and manage all users
            </p>

          </div>

          <div className="list-actions">

            <button className="column-btn">
              Columns ▼
            </button>

          <button
  className="create-btn"
  onClick={() =>
    setActivePage("createUser")
  }
>
  + Create User
</button>

          </div>

        </div>

        <div className="table-controls">

          <div>

            Show

            <select>
              <option>30</option>
              <option>50</option>
              <option>100</option>
            </select>

            entries

          </div>

          <div className="right-controls">

            <input
              type="text"
              placeholder="Search here..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <button className="export-btn">
              Export ▼
            </button>

          </div>

        </div>

        <table className="users-table">

          <thead>
  <tr>
    <th>User Info</th>
    <th>Email</th>
    <th>Phone Number</th>
    <th>Zone</th>
    <th>Date</th>
    <th>Streak</th>
  </tr>
</thead>

          <tbody>
  {filteredUsers.length > 0 ? (
    filteredUsers.map((user) => (
      <tr key={user.customerId || user.id}>

        <td>
          <div className="user-info-cell">
            <div className="user-avatar">
              👤
            </div>

            <span>
              {user.customerName || user.name}
            </span>
          </div>
        </td>

        <td>{user.email || "-"}</td>

        <td>{user.phoneNumber || "-"}</td>

        <td>{user.areaName || "-"}</td>

        <td>
          {user.createdAt
            ? new Date(user.createdAt).toLocaleString()
            : "-"}
        </td>

        <td>{user.currentStreak ?? 0}</td>

      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan="6"
        style={{
          textAlign: "center",
          padding: "20px",
        }}
      >
        No Users Found
      </td>
    </tr>
  )}
</tbody>

        </table>

      </div>

    </div>

  );
}

export default UsersCustomers;