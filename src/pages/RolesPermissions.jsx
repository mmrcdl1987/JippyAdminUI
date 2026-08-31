import { useEffect, useState } from "react";
import { FM_API } from "../services/api";
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { hasPermission } from "../utils/permissionUtils";
import "../styles/RolesPermissions.css";

function RolesPermissions() {
  const [activeTab, setActiveTab] = useState("roles");

  // State Management
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchRole, setSearchRole] = useState("");
  const [searchPermission, setSearchPermission] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  // Role Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roleName, setRoleName] = useState("");

  // Assign Permissions Modal State
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Permission CRUD Modal State
  const [showPermissionCrudModal, setShowPermissionCrudModal] = useState(false);
  const [isPermissionEditMode, setIsPermissionEditMode] = useState(false);
  const [permissionName, setPermissionName] = useState("");
  const [selectedPermission, setSelectedPermission] = useState(null);

  useEffect(() => {
    loadRoles();
    loadAllPermissions();
  }, []);

  if (!hasPermission("ROLE_READ")) {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  // --- API CALLS ---

  const loadRoles = async () => {
    try {
      const response = await FM_API.get("/api/fm/roles");
      setRoles(response.data);

      if (response.data.length > 0) {
        const initialRole = selectedRole
          ? response.data.find((r) => r.roleId === selectedRole.roleId) || response.data[0]
          : response.data[0];

        setSelectedRole(initialRole);
        loadPermissions(initialRole.roleId);
      } else {
        setSelectedRole(null);
        setPermissions([]);
      }
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  const loadPermissions = async (roleId) => {
    try {
      const response = await FM_API.get(`/api/fm/roles/${roleId}/permissions`);
      setPermissions(response.data);
    } catch (error) {
      console.error("Permission Error:", error);
    }
  };

  const loadAllPermissions = async () => {
    try {
      const response = await FM_API.get("/api/fm/permissions");
      setAllPermissions(response.data);
    } catch (error) {
      console.error("Error loading all permissions:", error);
    }
  };

  // --- ROLE ACTIONS ---

  const createRole = async () => {
    if (!roleName.trim()) {
      alert("Please enter a role name");
      return;
    }

    if (roleName.length > 25) {
      alert("Role name cannot exceed 25 characters.");
      return;
    }

    const roleRegex = /^[a-zA-Z0-9_-]+$/;
    if (!roleRegex.test(roleName)) {
      alert("Role name can only contain letters, numbers, underscores (_), and hyphens (-).");
      return;
    }

    try {
      await FM_API.post("/api/fm/roles", { roleName });
      alert("Role Created Successfully");
      setShowRoleModal(false);
      setRoleName("");
      loadRoles();
    } catch (error) {
      console.error("Create Role Error:", error);
      alert("Failed To Create Role");
    }
  };

  const updateRole = async () => {
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }
    if (!roleName.trim()) {
      alert("Please enter a role name");
      return;
    }

    if (roleName.length > 25) {
      alert("Role name cannot exceed 25 characters.");
      return;
    }

    const roleRegex = /^[a-zA-Z0-9_-]+$/;
    if (!roleRegex.test(roleName)) {
      alert("Role name can only contain letters, numbers, underscores (_), and hyphens (-).");
      return;
    }

    try {
      await FM_API.put(`/api/fm/roles/${selectedRole.roleId}`, { roleName });
      alert("Role Updated Successfully");
      setShowRoleModal(false);
      setIsEditMode(false);
      setRoleName("");
      loadRoles();
    } catch (error) {
      console.error("Update Role Error:", error);
      alert("Failed To Update Role");
    }
  };

  const deleteRole = async (roleId) => {
    if (!roleId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this role?");
    if (!confirmDelete) return;

    try {
      await FM_API.delete(`/api/fm/roles/${roleId}`);
      alert("Role Deleted Successfully");
      setSelectedRole(null);
      loadRoles();
    } catch (error) {
      console.error("Delete Role Error:", error);
      alert("Failed To Delete Role");
    }
  };

  const savePermissions = async () => {
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    try {
      const payload = { permissionIds: selectedPermissions };
      await FM_API.put(`/api/fm/roles/${selectedRole.roleId}/permissions`, payload);

      alert("Permissions Updated Successfully");
      setShowPermissionModal(false);
      loadPermissions(selectedRole.roleId);
    } catch (error) {
      console.error("Save Permission Error:", error);
      alert("Failed To Save Permissions");
    }
  };

  // --- PERMISSION CRUD ACTIONS ---

  const createPermission = async () => {
    if (!permissionName.trim()) {
      alert("Please enter a permission name");
      return;
    }

    try {
      await FM_API.post("/api/fm/permissions", { permissionName });
      alert("Permission Created Successfully");
      setShowPermissionCrudModal(false);
      setPermissionName("");
      loadAllPermissions();
    } catch (error) {
      console.error("Create Permission Error:", error);
      alert("Failed To Create Permission");
    }
  };

  const updatePermission = async () => {
    if (!selectedPermission) return;
    if (!permissionName.trim()) {
      alert("Please enter a permission name");
      return;
    }

    try {
      await FM_API.put(`/api/fm/permissions/${selectedPermission.permissionId}`, {
        permissionName,
      });
      alert("Permission Updated");
      setShowPermissionCrudModal(false);
      loadAllPermissions();
    } catch (error) {
      console.error("Update Permission Error:", error);
      alert("Update Failed");
    }
  };

  const deletePermission = async (permissionId) => {
    const confirmDelete = window.confirm("Delete Permission?");
    if (!confirmDelete) return;

    try {
      await FM_API.delete(`/api/fm/permissions/${permissionId}`);
      alert("Permission Deleted");
      loadAllPermissions();
    } catch (error) {
      console.error("Delete Permission Error:", error);
      alert("Delete Failed");
    }
  };

  // --- FILTERING ---
  const filteredRoles = roles.filter((role) =>
    role.roleName?.toLowerCase().includes(searchRole.toLowerCase())
  );

  const filteredPermissions = allPermissions.filter((permission) =>
    permission.permissionName
      ?.toLowerCase()
      .includes(searchPermission.toLowerCase())
  );

  return (
    <div className="rp-container">
      {/* HEADER */}
      <div className="rp-header">
        <div>
          <h2>Roles & Permissions</h2>
          <p className="sub-title">Manage roles and their associated permissions</p>
        </div>
      </div>

      {/* TOP TABS */}
      <div className="top-tabs">
        <button
          className={activeTab === "roles" ? "tab-active" : ""}
          onClick={() => setActiveTab("roles")}
        >
          Roles
        </button>
        <button
          className={activeTab === "permissions" ? "tab-active" : ""}
          onClick={() => setActiveTab("permissions")}
        >
          Permissions
        </button>
      </div>

      {/* ROLES TAB CONTENT */}
      {activeTab === "roles" && (
        <div className="rp-layout">
          {/* LEFT PANEL */}
          <div className="roles-panel">
            <div className="panel-header-flex">
              <h3>Roles</h3>
            </div>

            <div className="roles-search-container">
              <FaSearch className="roles-search-icon" />
              <input
                type="text"
                placeholder="Search Role..."
                className="roles-search-input"
                value={searchRole}
                onChange={(e) => setSearchRole(e.target.value)}
              />
            </div>

            <div className="roles-list">
              {filteredRoles.map((role) => (
                <div
                  key={role.roleId}
                  className={`role-card ${
                    selectedRole?.roleId === role.roleId
                      ? "role-card-active"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedRole(role);
                    loadPermissions(role.roleId);
                  }}
                >
                  <div>
                    <h4>{role.roleName}</h4>
                    <p>Manage permissions</p>
                  </div>

                  <span className="role-count">
                    {selectedRole?.roleId === role.roleId
                      ? permissions.length
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="permissions-panel">
            <div className="role-details-header">
              <div>
                <h3>Role Details</h3>
                <div className="role-field">
                  <label>Role Name</label>
                  <input
                    value={selectedRole?.roleName || ""}
                    readOnly
                    className="role-name-box"
                  />
                </div>
              </div>

              <div className="action-buttons">
                <div className="top-actions">
                  {hasPermission("ROLE_UPDATE") && (
                    <button
                      className="edit-role-btn"
                      onClick={() => {
                        setIsEditMode(true);
                        setRoleName(selectedRole?.roleName || "");
                        setShowRoleModal(true);
                      }}
                    >
                      Edit Role
                    </button>
                  )}

                  {hasPermission("ROLE_UPDATE") && (
                    <button
                      className="edit-role-btn"
                      onClick={() => {
                        setSelectedPermissions(
                          permissions.map((permission) => permission.permissionId)
                        );
                        setShowPermissionModal(true);
                      }}
                    >
                      Manage Permissions
                    </button>
                  )}
                </div>

                <div className="bottom-actions">
                  {hasPermission("ROLE_CREATE") && (
                    <button
                      className="create-role-btn"
                      onClick={() => {
                        setIsEditMode(false);
                        setRoleName("");
                        setShowRoleModal(true);
                      }}
                    >
                      + Create Role
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="permission-section">
              <div className="permission-header">
                <h3>Permissions ({permissions.length})</h3>
              </div>

              {/* TABLE CONTAINER FOR SCROLLBAR */}
              <div className="permission-table-wrapper">
                <table className="permission-table">
                  <thead>
                    <tr>
                      <th>Permission Name</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.length > 0 ? (
                      permissions.map((permission) => (
                        <tr key={permission.permissionId}>
                          <td>{permission.permissionName}</td>
                          <td>Role Permission</td>
                          <td>
                            <span className="status-active">Active</span>
                          </td>
                          <td>👁️</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                          No Permissions Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSIONS TAB CONTENT */}
      {activeTab === "permissions" && (
        <div className="permissions-page">
          <div className="permission-header">
            <h2>Permissions</h2>
            {hasPermission("ROLE_CREATE") && (
              <button
                className="create-role-btn"
                onClick={() => {
                  setSelectedPermission(null);
                  setPermissionName("");
                  setIsPermissionEditMode(false);
                  setShowPermissionCrudModal(true);
                }}
              >
                + Create Permission
              </button>
            )}
          </div>

          {/* Search bar for permissions */}
          <div className="roles-search-container">

            <FaSearch className="roles-search-icon" />
            <input
              type="text"
              className="roles-search-input"
              placeholder="Search Permission..."
              value={searchPermission}
              onChange={(e) => setSearchPermission(e.target.value)}
            />

  
</div>

      

          {/* TABLE CONTAINER FOR SCROLLBAR */}
          <div className="permission-table-wrapper">
            <table className="permission-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Permission Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              

                <tbody>
  {filteredPermissions.length > 0 ? (
    filteredPermissions.map((permission) => (
      <tr key={permission.permissionId}>
        <td>{permission.permissionId}</td>

        <td>{permission.permissionName}</td>

        <td>
          <div className="table-actions">

            {hasPermission("ROLE_UPDATE") && (
              <button
                className="action-btn edit-action"
                onClick={() => {
                  setSelectedPermission(permission);
                  setPermissionName(permission.permissionName);
                  setIsPermissionEditMode(true);
                  setShowPermissionCrudModal(true);
                }}
              >
                <FaEdit />
              </button>
            )}

            {hasPermission("ROLE_DELETE") && (
              <button
                className="action-btn delete-action"
                onClick={() =>
                  deletePermission(permission.permissionId)
                }
              >
                <FaTrash />
              </button>
            )}

          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
        No Permissions Found
      </td>
    </tr>
  )}
</tbody>
            </table>
          </div>
          
        </div>
      )}

      {/* MODAL: MANAGE ROLE PERMISSIONS */}
      {showPermissionModal && (
        <div className="modal-overlay">
          <div className="permission-modal">
            

            {hasPermission("ROLE_UPDATE") && (
              <button className="save-btn" onClick={savePermissions}>
                Save Permissions
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT ROLE */}
      {showRoleModal && (
        <div className="modal-overlay">
          <div className="permission-modal">
            <div className="modal-header">
              <h3>{isEditMode ? "Edit Role" : "Create New Role"}</h3>
              <button onClick={() => setShowRoleModal(false)}>✖</button>
            </div>

            <input
              type="text"
              placeholder="Enter Role Name"
              maxLength={25}
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="role-name-box"
            />
            <br />
            <small style={{ color: "#666" }}>{roleName.length}/25 characters</small>
            <br />
            <br />

            {((!isEditMode && hasPermission("ROLE_CREATE")) ||
              (isEditMode && hasPermission("ROLE_UPDATE"))) && (
              <button
                className="save-btn"
                onClick={isEditMode ? updateRole : createRole}
              >
                {isEditMode ? "Update Role" : "Create Role"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT PERMISSION */}
      {showPermissionCrudModal && (
        <div className="modal-overlay">
          <div className="permission-modal">
            <div className="modal-header">
              <h3>{isPermissionEditMode ? "Edit Permission" : "Create Permission"}</h3>
              <button onClick={() => setShowPermissionCrudModal(false)}>✖</button>
            </div>

            <input
              type="text"
              placeholder="Permission Name"
              value={permissionName}
              onChange={(e) => setPermissionName(e.target.value)}
            />
            <br />
            <br />

            {((!isPermissionEditMode && hasPermission("ROLE_CREATE")) ||
              (isPermissionEditMode && hasPermission("ROLE_UPDATE"))) && (
              <button
                className="save-btn"
                onClick={isPermissionEditMode ? updatePermission : createPermission}
              >
                {isPermissionEditMode ? "Update Permission" : "Save Permission"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPermissions;