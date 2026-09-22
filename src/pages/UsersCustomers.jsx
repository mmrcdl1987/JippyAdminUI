import { useEffect, useState } from "react";
import { FM_API } from "../services/api";
import { getWalletByCustomerId } from "../services/userWalleService";
import UserDetails from "./UserDetails";
import {
  FiUsers,
  FiUserPlus,
  FiDownload,
  FiUpload,
  FiSearch,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiCreditCard,
  FiExternalLink,
  FiX
} from "react-icons/fi";
import { FaFire, FaCoins } from "react-icons/fa";
import "../styles/UsersCustomers.css";

function UsersCustomers({ setActivePage }) {
  const [users, setUsers] = useState([]);
  const [walletMap, setWalletMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [pageSize, setPageSize] = useState(30);

  // Selected customer for User Details page view
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerTab, setSelectedCustomerTab] = useState("overview");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await FM_API.get("/api/co/customers");
      const customerList = Array.isArray(response.data) ? response.data : [];
      setUsers(customerList);

      // Fetch wallet data in parallel for each customer
      const map = {};
      await Promise.allSettled(
        customerList.map(async (u) => {
          const cId = u.customerId || u.id;
          if (!cId) return;
          if (
            u.balancePoints !== undefined ||
            u.walletCoins !== undefined ||
            u.points !== undefined
          ) {
            map[cId] = {
              balancePoints: Number(u.balancePoints ?? u.walletCoins ?? u.points ?? 0),
              balanceAmount: Number(u.balanceAmount ?? u.walletAmount ?? 0),
            };
            return;
          }
          try {
            const w = await getWalletByCustomerId(cId);
            if (w) {
              map[cId] = {
                balancePoints: Number(w.balancePoints ?? 0),
                balanceAmount: Number(w.balanceAmount ?? 0),
              };
            }
          } catch (e) {
            map[cId] = { balancePoints: 0, balanceAmount: 0 };
          }
        })
      );
      setWalletMap(map);
    } catch (error) {
      console.error("Error Loading Customers:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Open User Details Page
  const handleOpenCustomer = (user, tab = "overview") => {
    setSelectedCustomer(user);
    setSelectedCustomerTab(tab);
  };

  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase().trim();
    const name = (user.customerName || user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const phone = (user.phoneNumber || "").toLowerCase();
    const area = (user.areaName || "").toLowerCase();

    const matchesSearch =
      !q || name.includes(q) || email.includes(q) || phone.includes(q) || area.includes(q);

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "ACTIVE" && (user.status === "ACTIVE" || user.active !== false)) ||
      (statusFilter === "INACTIVE" && (user.status === "INACTIVE" || user.active === false));

    const matchesArea = !areaFilter || user.areaName === areaFilter;

    return matchesSearch && matchesStatus && matchesArea;
  });

  const uniqueAreas = Array.from(
    new Set(
      users
        .map((u) => u.areaName)
        .filter((area) => Boolean(area) && area !== "-")
    )
  );

  // If a customer is selected, open the User Details page
  if (selectedCustomer) {
    return (
      <UserDetails
        customerId={selectedCustomer.customerId || selectedCustomer.id}
        initialCustomer={selectedCustomer}
        onBack={() => setSelectedCustomer(null)}
        setActivePage={setActivePage}
        initialTab={selectedCustomerTab}
      />
    );
  }

  return (
    <div className="users-container">
      {/* Top Header */}
      <div className="users-top-header">
        <div className="users-header-left">
          <div className="users-header-icon-box">
            <FiUsers />
          </div>
          <div className="users-header-titles">
            <div className="users-eyebrow-row">
              <span className="users-eyebrow">CUSTOMERS & ACCOUNTS</span>
              <span className="users-divider">•</span>
              <span className="users-breadcrumb">DIRECTORY</span>
            </div>
            <h2>
              Users & Customers
              <span className="users-badge-pill">{users.length} Registered</span>
            </h2>
          </div>
        </div>

        <div className="users-header-actions">
          <button
            className="zone-refresh-btn"
            onClick={loadUsers}
            disabled={loading}
            title="Refresh Customers List"
          >
            <FiRefreshCw className={loading ? "spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            className="users-btn-create-top"
            onClick={() => setActivePage && setActivePage("createUser")}
          >
            <FiUserPlus /> + Create User
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="users-stats-row">
        <div className="users-stat-card users-stat-total">
          <h1>{users.length}</h1>
          <p>Total Customers</p>
        </div>
        <div className="users-stat-card users-stat-active">
          <h1>{users.filter((u) => u.status === "ACTIVE" || u.active !== false).length}</h1>
          <p>Active Users</p>
        </div>
        <div className="users-stat-card users-stat-streak">
          <h1>{users.filter((u) => Number(u.currentStreak || 0) > 0).length}</h1>
          <p>Active Streaks</p>
        </div>
        <div className="users-stat-card users-stat-coins">
          <h1>
            {users
              .reduce((sum, u) => {
                const cId = u.customerId || u.id;
                const coins =
                  walletMap[cId]?.balancePoints ??
                  u.balancePoints ??
                  u.walletCoins ??
                  u.points ??
                  u.coins ??
                  0;
                return sum + Number(coins || 0);
              }, 0)
              .toLocaleString()}
          </h1>
          <p>Total Wallet Coins</p>
        </div>
        <div className="users-stat-card users-stat-zones">
          <h1>{uniqueAreas.length || 1}</h1>
          <p>Assigned Areas</p>
        </div>
      </div>

      {/* Top Controls & Bulk Import Card */}
      <div className="users-overview-card">
        <div className="users-header">
          <div className="users-info">
            <h3>Directory Controls</h3>
            <span className="users-count">{filteredUsers.length} shown</span>
          </div>

          <div className="filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status (All)</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
            >
              <option value="">Select Area (All)</option>
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bulk-import-card">
          <div>
            <h3>Bulk Import Users</h3>
            <p>Upload Excel file (.xls / .xlsx) to import multiple user records at once</p>
            <label>Select Excel File</label>
            <input type="file" accept=".xls,.xlsx" />
          </div>

          <div className="bulk-actions">
            <button className="download-btn" type="button">
              <FiDownload /> Download Template
            </button>
            <button className="import-btn" type="button">
              <FiUpload /> Import Users
            </button>
          </div>
        </div>
      </div>

      {/* Users List Card */}
      <div className="users-list-card">
        <div className="list-header">
          <div>
            <h3>Users List</h3>
            <p>View and manage all customer accounts and streaks</p>
          </div>

          <div className="list-actions">
            <button className="column-btn" type="button">
              Columns ▼
            </button>
            <button
              className="create-btn"
              onClick={() => setActivePage && setActivePage("createUser")}
            >
              <FiUserPlus /> + Create User
            </button>
          </div>
        </div>

        <div className="table-controls">
          <div>
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="right-controls">
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="export-btn" type="button">
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
              <th>Area Name</th>
              <th>Streak</th>
              <th>Wallet Coins</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.slice(0, pageSize).map((user) => {
                const name = user.customerName || user.name || "Unnamed Customer";
                const initials =
                  name
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "U";
                const streak = Number(user.currentStreak || 0);
                const coins = Number(
                  walletMap[user.customerId || user.id]?.balancePoints ??
                  user.balancePoints ??
                  user.walletCoins ??
                  user.points ??
                  user.coins ??
                  0
                );

                return (
                  <tr key={user.customerId || user.id}>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-details-col">
                          <button
                            type="button"
                            className="user-name-link"
                            onClick={() => handleOpenCustomer(user, "overview")}
                            title="Click to view all customer details"
                          >
                            {name}
                          </button>
                          {user.customerId && (
                            <span className="user-id-sub">#{user.customerId}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="user-email-text">{user.email || "—"}</span>
                    </td>

                    <td>
                      <span className="user-phone-text">{user.phoneNumber || "—"}</span>
                    </td>

                    <td>
                      {user.areaName && user.areaName !== "-" ? (
                        <span className="user-area-badge">{user.areaName}</span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>—</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={
                          streak > 0 ? "user-streak-badge active" : "user-streak-badge zero"
                        }
                      >
                        <FaFire /> {streak} {streak === 1 ? "day" : "days"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          coins > 0 ? "user-coins-badge" : "user-coins-badge zero"
                        }
                        title={`Customer #${user.customerId || user.id}: ${coins.toLocaleString()} Wallet Coins. Click to manage.`}
                        onClick={() => handleOpenCustomer(user, "wallet")}
                        style={{ cursor: "pointer" }}
                      >
                        <FaCoins className="coin-icon" /> {coins.toLocaleString()} {coins === 1 ? "coin" : "coins"}
                      </span>
                    </td>

                    <td>
                      <span className="user-date-text">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="users-empty-row">
                  <div className="users-empty-state">
                    <span className="users-empty-icon">👥</span>
                    <h4>No Users Found</h4>
                    <p>
                      {search || statusFilter || areaFilter
                        ? "Try clearing or changing your filters"
                        : "No customer records currently available"}
                    </p>
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

export default UsersCustomers;