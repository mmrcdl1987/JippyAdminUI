
import { useEffect, useState } from "react";
import { FM_API } from "../services/api";
import { hasPermission } from "../utils/permissionUtils";
import "../styles/AdminUsers.css";

function AdminUsers() {

  if (!hasPermission("ADMIN_USER_READ")) {
    return <h2>Access Denied</h2>;
  }

  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("list");

  const [showRoleModal, setShowRoleModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);

  const [loadingRoles, setLoadingRoles] = useState(false);

  /*
   * Load users when page loads.
   *
   * Roles are intentionally NOT loaded here.
   * Roles will be loaded when "Assign Role" is clicked.
   */
  useEffect(() => {
    loadUsers();
  }, []);

  /*
   * Load all users
   */
  const loadUsers = async () => {
    try {

      const response =
        await FM_API.get("/api/fm/users/all");

      setUsers(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error Loading Users:",
        error
      );
    }
  };

  /*
   * Load all available roles
   *
   * API:
   * GET http://localhost:8084/api/fm/roles
   */
  const loadRoles = async () => {

    try {

      const response =
        await FM_API.get("/api/fm/roles");

      const allRoles =
        Array.isArray(response.data)
          ? response.data
          : [];

      setRoles(allRoles);

      return allRoles;

    } catch (error) {

      console.error(
        "Role Load Error:",
        error
      );

      throw error;
    }
  };

  /*
   * Reset create employee form
   */
  const handleCancel = () => {

    setEmployeeName("");
    setEmail("");
    setMobileNumber("");
    setUsername("");
    setPassword("");

    setActiveTab("list");
  };

  /*
   * Open Assign Role Modal
   *
   * When Assign Role is clicked:
   *
   * 1. Select the user
   * 2. Load ALL roles
   * 3. Load user's existing roles
   * 4. Open the modal
   */
  const openRoleModal = async (user) => {

    try {

      setLoadingRoles(true);

      setSelectedUser(user);

      /*
       * Load ALL roles.
       *
       * GET:
       * http://localhost:8084/api/fm/roles
       */
      const rolesResponse =
        await FM_API.get("/api/fm/roles");

      const allRoles =
        Array.isArray(rolesResponse.data)
          ? rolesResponse.data
          : [];

      setRoles(allRoles);

      /*
       * Load roles already assigned
       * to the selected user.
       */
      const userRolesResponse =
        await FM_API.get(
          `/api/fm/users/${user.usersId}/roles`
        );

      const assignedRoleIds =
        Array.isArray(userRolesResponse.data)
          ? userRolesResponse.data.map(
              (id) => Number(id)
            )
          : [];

      setSelectedRoleIds(
        assignedRoleIds
      );

      /*
       * Open modal after both APIs
       * are successfully completed.
       */
      setShowRoleModal(true);

    } catch (error) {

      console.error(
        "Assign Role Modal Load Error:",
        error
      );

      setSelectedUser(null);
      setSelectedRoleIds([]);

      alert(
        error.response?.data ||
        "Failed To Load Roles"
      );

    } finally {

      setLoadingRoles(false);
    }
  };

  /*
   * Assign selected roles to user
   */
  const assignRole = async () => {

    if (!selectedUser) {

      alert(
        "Please Select User"
      );

      return;
    }

    if (selectedRoleIds.length === 0) {

      alert(
        "Please Select Role"
      );

      return;
    }

    try {

      await FM_API.post(
        "/api/fm/users/assignRole",
        {
          userId:
            selectedUser.usersId,

          roleIds:
            selectedRoleIds.map(
              (id) => Number(id)
            )
        }
      );

      alert(
        "Role Assigned Successfully"
      );

      /*
       * Close modal
       */
      setShowRoleModal(false);

      /*
       * Clear selected data
       */
      setSelectedUser(null);
      setSelectedRoleIds([]);

      /*
       * Reload users so the
       * updated role is displayed.
       */
      loadUsers();

    } catch (error) {

      console.error(
        "Assign Role Error:",
        error
      );

      alert(
        error.response?.data ||
        "Failed To Assign Role"
      );
    }
  };

  /*
   * Create employee admin
   */
  const saveEmployee = async () => {

    try {

      await FM_API.post(
        "/api/fm/users/createEmployee",
        {
          employeeName,
          email,
          mobileNumber,
          username,
          password
        }
      );

      alert(
        "Employee Created Successfully"
      );

      /*
       * Reload users
       */
      loadUsers();

      /*
       * Clear form
       */
      setEmployeeName("");
      setEmail("");
      setMobileNumber("");
      setUsername("");
      setPassword("");

      /*
       * Go back to admin list
       */
      setActiveTab("list");

    } catch (error) {

      console.error(
        "Create Employee Error:",
        error
      );

      alert(
        error.response?.data ||
        "Failed To Create Employee"
      );
    }
  };

  /*
   * Search users
   */
  const filteredUsers =
    Array.isArray(users)
      ? users.filter((user) =>
          user.username
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
        )
      : [];

  return (

    <div className="admin-users-page">

      <h2>
        Admin Users
      </h2>

      {/* =========================
          TABS
      ========================== */}

      <div className="tabs">

        {/* Admin List */}

        <button
          className={
            activeTab === "list"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("list")
          }
        >
          📋 Admin List
        </button>

        {/* Create Admin */}

        {
          hasPermission(
            "ADMIN_USER_CREATE"
          ) && (

            <button
              className={
                activeTab === "create"
                  ? "active-tab"
                  : ""
              }
              onClick={() =>
                setActiveTab("create")
              }
            >
              ➕ Create Admin
            </button>

          )
        }

      </div>

      {/* =========================
          ADMIN LIST
      ========================== */}

      {
        activeTab === "list" && (

          <div>

            {/* Search */}

            <div className="search-box">

              <input
                type="text"
                placeholder="Search User..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

            {/* Users Table */}

            <table className="admin-table">

              <thead>

                <tr>

                  <th>
                    Username
                  </th>

                  <th>
                    User Type
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  filteredUsers.length > 0 ? (

                    filteredUsers.map(
                      (user) => (

                        <tr
                          key={
                            user.usersId
                          }
                        >

                          {/* Username */}

                          <td>
                            {user.username}
                          </td>

                          {/* User Type */}

                          <td>
                            {user.userType}
                          </td>

                          {/* Role */}

                          <td>
                            {
                              user.roleName ||
                              "-"
                            }
                          </td>

                          {/* Actions */}

                          <td>

                            <div className="action-buttons">

                              {/* Assign Role */}

                              {
                                hasPermission(
                                  "ADMIN_USER_UPDATE"
                                ) && (

                                  <button
                                    className="assign-role-btn"
                                    onClick={() =>
                                      openRoleModal(
                                        user
                                      )
                                    }
                                  >
                                    Assign Role
                                  </button>

                                )
                              }

                              {/* Edit */}

                              <button
                                className="edit-user-btn"
                                onClick={() =>
                                  editUser(user)
                                }
                              >
                                Edit
                              </button>

                              {/* Delete */}

                              <button
                                className="delete-user-btn"
                                onClick={() =>
                                  deleteUser(
                                    user.usersId
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="4"
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "20px"
                        }}
                      >
                        No Users Found
                      </td>

                    </tr>

                  )
                }

              </tbody>

            </table>

          </div>

        )
      }

      {/* =========================
          CREATE ADMIN
      ========================== */}

      {
        activeTab === "create" &&
        hasPermission(
          "ADMIN_USER_CREATE"
        ) && (

          <div className="create-admin-card">

            <h3>
              Create Employee Admin
            </h3>

            <div className="form-grid">

              {/* Employee Name */}

              <div className="form-group">

                <label>
                  Employee Name
                </label>

                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={employeeName}
                  onChange={(e) =>
                    setEmployeeName(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Email */}

              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Mobile Number */}

              <div className="form-group">

                <label>
                  Mobile Number
                </label>

                <input
                  type="text"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Username */}

              <div className="form-group">

                <label>
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* Password */}

              <div className="form-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* Create Buttons */}

            <div className="button-container">

              <button
                className="create-employee-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                className="create-employee-save-btn"
                onClick={saveEmployee}
              >
                Create Employee
              </button>

            </div>

          </div>

        )
      }

      {/* =========================
          ASSIGN ROLE MODAL
      ========================== */}

      {
        showRoleModal && (

          <div className="modal-overlay">

            <div className="permission-modal">

              {/* Modal Header */}

              <div className="modal-header">

                <h3>
                  Assign Role
                </h3>

                <button
                  className="close-btn"
                  onClick={() => {

                    setShowRoleModal(false);

                    setSelectedUser(null);

                    setSelectedRoleIds([]);

                  }}
                >
                  ✖
                </button>

              </div>

              <div className="create-form">

                {/* Selected Username */}

                <input
                  type="text"
                  value={
                    selectedUser?.username ||
                    ""
                  }
                  disabled
                />

                {/* Selected User Type */}

                <input
                  type="text"
                  value={
                    selectedUser?.userType ||
                    ""
                  }
                  disabled
                />

                {/* =====================
                    ROLES TABLE / LIST
                ====================== */}

                <div className="role-checkbox-container">

                  {/* Loading */}

                  {
                    loadingRoles ? (

                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px"
                        }}
                      >
                        Loading Roles...
                      </div>

                    ) : roles.length > 0 ? (

                      roles.map(
                        (role) => {

                          const roleId =
                            Number(
                              role.roleId
                            );

                          const isSelected =
                            selectedRoleIds.includes(
                              roleId
                            );

                          return (

                            <div
                              key={
                                role.roleId
                              }
                              className="role-checkbox-item"
                            >

                              {/* Checkbox */}

                              <input
                                type="checkbox"
                                id={`role-${role.roleId}`}
                                checked={
                                  isSelected
                                }
                                onChange={(e) => {

                                  if (
                                    e.target.checked
                                  ) {

                                    /*
                                     * Add role ID
                                     */
                                    setSelectedRoleIds(
                                      (
                                        previousIds
                                      ) => {

                                        if (
                                          previousIds.includes(
                                            roleId
                                          )
                                        ) {

                                          return previousIds;

                                        }

                                        return [
                                          ...previousIds,
                                          roleId
                                        ];

                                      }
                                    );

                                  } else {

                                    /*
                                     * Remove role ID
                                     */
                                    setSelectedRoleIds(
                                      (
                                        previousIds
                                      ) =>
                                        previousIds.filter(
                                          (id) =>
                                            id !==
                                            roleId
                                        )
                                    );

                                  }

                                }}
                              />

                              {/* Role Name */}

                              <label
                                htmlFor={`role-${role.roleId}`}
                              >
                                {
                                  role.roleName
                                }
                              </label>

                            </div>

                          );

                        }
                      )

                    ) : (

                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px"
                        }}
                      >
                        No Roles Found
                      </div>

                    )
                  }

                </div>

                {/* Selected Role Count */}

                {
                  !loadingRoles &&
                  roles.length > 0 && (

                    <div
                      style={{
                        marginTop: "10px",
                        marginBottom: "10px"
                      }}
                    >
                      Selected Roles:{" "}
                      {
                        selectedRoleIds.length
                      }
                    </div>

                  )
                }

                {/* Save Role */}

                {
                  hasPermission(
                    "ADMIN_USER_UPDATE"
                  ) && (

                    <button
                      onClick={
                        assignRole
                      }
                      disabled={
                        loadingRoles ||
                        selectedRoleIds.length ===
                        0
                      }
                    >
                      Save Role
                    </button>

                  )
                }

              </div>

            </div>

          </div>

        )
      }

    </div>

  );
}

export default AdminUsers;

