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

  const [activeTab, setActiveTab] =
    useState("list");

  const [showRoleModal, setShowRoleModal] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {

      const response =
        await FM_API.get("/api/fm/users/all");

      setUsers(response.data);

    } catch (error) {

      console.error(
        "Error Loading Users:",
        error
      );
    }
  };

  const loadRoles = async () => {
    try {

      const response =
        await FM_API.get("/api/fm/roles");

      setRoles(response.data);

    } catch (error) {

      console.error(
        "Role Load Error:",
        error
      );
    }
  };


  const handleCancel = () => {
    setEmployeeName("");
    setEmail("");
    setMobileNumber("");
    setUsername("");
    setPassword("");

    setActiveTab("list");   // Go back to Admin List
  };
  const openRoleModal = async (user) => {

    try {

      setSelectedUser(user);

      const response =
        await FM_API.get(
          `/api/fm/users/${user.usersId}/roles`
        );
      setSelectedRoleIds(
        response.data
      );

      setShowRoleModal(true);

    } catch (error) {

      console.error(error);

      alert(
        "Failed To Load User Roles"
      );
    }
  };

  const assignRole = async () => {

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
            selectedRoleIds.map(Number)
        }
      );

      alert(
        "Role Assigned Successfully"
      );

      setShowRoleModal(false);

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
  //   const saveEmployee = async () => {

  //   try {

  //     await FM_API.post(
  //   "/api/fm/users/createEmployee",
  //       {
  //         employeeName,
  //         email,
  //         mobileNumber,
  //         username,
  //         password
  //       }
  //     );

  //     alert("Employee Created Successfully");


  //     loadUsers();

  //       setActiveTab("list"); 

  //   } catch (error) {

  //     console.error(error);

  //     alert("Failed To Create Employee");
  //   }
  // };


  const saveEmployee = async () => {
    try {
      const response = await FM_API.post(
        "/api/fm/users/createEmployee",
        {
          employeeName,
          email,
          mobileNumber,
          username,
          password,
        }
      );



      alert("Employee Created Successfully");

      loadUsers();

      setActiveTab("list");

    } catch (error) {
      console.error(error);


      alert(error.response?.data || "Failed To Create Employee");
    }
  };
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

      <div className="tabs">

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

      {activeTab === "list" && (

        <div>

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

          <table className="admin-table">

            <thead>

              <tr>
                <th>Username</th>
                <th>User Type</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredUsers.length > 0 ? (

                filteredUsers.map(
                  (user) => (

                    <tr
                      key={
                        user.usersId
                      }
                    >

                      <td>
                        {user.username}
                      </td>

                      <td>
                        {user.userType}
                      </td>

                      <td>
                        {user.roleName ||
                          "-"}
                      </td>

                      <td>

                        <div className="action-buttons">

                          {hasPermission("ADMIN_USER_UPDATE") && (
                            <button
                              className="assign-role-btn"
                              onClick={() => openRoleModal(user)}
                            >
                              Assign Role
                            </button>
                          )}

                          <button
                            className="edit-user-btn"
                            onClick={() => editUser(user)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-user-btn"
                            onClick={() => deleteUser(user.usersId)}
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

              )}

            </tbody>

          </table>

        </div>

      )}

      {
        activeTab === "create" &&
        hasPermission(
          "ADMIN_USER_CREATE"
        ) && (

          <div className="create-admin-card">

            <h3>Create Employee Admin</h3>

            <div className="form-grid">

              <div className="form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={employeeName}
                  onChange={(e) =>
                    setEmployeeName(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="text"
                  placeholder="Enter mobile number"
                  value={mobileNumber}
                  onChange={(e) =>
                    setMobileNumber(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              </div>

            </div>

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

      {showRoleModal && (

        <div className="modal-overlay">

          <div className="permission-modal">

            <div className="modal-header">

              <h3>
                Assign Role
              </h3>

              <button
                className="close-btn"
                onClick={() =>
                  setShowRoleModal(
                    false
                  )
                }
              >
                ✖
              </button>


            </div>

            <div className="create-form">

              <input
                type="text"
                value={
                  selectedUser?.username ||
                  ""
                }
                disabled
              />

              <input
                type="text"
                value={
                  selectedUser?.userType ||
                  ""
                }
                disabled
              />

              <div className="role-checkbox-container">

                {roles.map((role) => (

                  <div
                    key={role.roleId}
                    className="role-checkbox-item"
                  >

                    <input
                      type="checkbox"
                      id={`role-${role.roleId}`}
                      checked={
                        selectedRoleIds.includes(
                          role.roleId
                        )
                      }
                      onChange={(e) => {

                        if (
                          e.target.checked
                        ) {

                          setSelectedRoleIds([
                            ...selectedRoleIds,
                            role.roleId
                          ]);

                        } else {

                          setSelectedRoleIds(
                            selectedRoleIds.filter(
                              id =>
                                id !== role.roleId
                            )
                          );

                        }

                      }}
                    />

                    <label
                      htmlFor={`role-${role.roleId}`}
                    >
                      {role.roleName}
                    </label>

                  </div>

                ))}

              </div>

              {
                hasPermission(
                  "ADMIN_USER_UPDATE"
                ) && (

                  <button
                    onClick={
                      assignRole
                    }
                  >
                    Save Role
                  </button>

                )
              }

            </div>

          </div>

        </div>

      )}

    </div>

  );
}

export default AdminUsers;