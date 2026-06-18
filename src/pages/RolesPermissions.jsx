import { useEffect, useState } from "react";
import { FM_API } from "../services/api";
import { FaEdit, FaTrash } from "react-icons/fa";
import { hasPermission }
from "../utils/permissionUtils";
import "../styles/RolesPermissions.css";

function RolesPermissions() {
  if (!hasPermission("ROLE_READ")) {
  return (
    <div className="access-denied">
      <h2>Access Denied</h2>
      <p>You don't have permission to access this page.</p>
    </div>
  );
}
const [activeTab, setActiveTab] =
  useState("roles");
  const [showPermissionCrudModal,
setShowPermissionCrudModal] =
useState(false);

const [isPermissionEditMode,
      setIsPermissionEditMode] =
      useState(false);
const [permissionName,
setPermissionName] =
useState("");

const [selectedPermission,
setSelectedPermission] =
useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchRole, setSearchRole] = useState("");
  const [permissions, setPermissions] =
  useState([]);
  const [showPermissionModal,
      setShowPermissionModal] =
      useState(false);
const [editRoleName, setEditRoleName] =
  useState("");
const [allPermissions,
      setAllPermissions] =
      useState([]);

const [selectedPermissions,
      setSelectedPermissions] =
      useState([]);
      const [showRoleModal,
      setShowRoleModal] =
      useState(false);
      const [isEditMode, setIsEditMode] =
  useState(false);

const [roleName,
      setRoleName] =
      useState("");
     

useEffect(() => {
  loadRoles();
  loadAllPermissions();
}, []);

 const loadRoles = async () => {
  try {
    const response = await FM_API.get("/fm/roles");

    console.log("Roles Response:", response.data);

    setRoles(response.data);

    if (response.data.length > 0) {
      setSelectedRole(response.data[0]);

      loadPermissions(
        response.data[0].roleId
      );
    }
  } catch (error) {
    console.error(
      "Error loading roles:",
      error
    );
  }
};
  const loadPermissions = async (
  roleId
) => {
  try {

    console.log(
      "Loading permissions for role:",
      roleId
    );

    const response =
      await FM_API.get(
        `/fm/roles/${roleId}/permissions`
      );

    console.log(
      "Permissions:",
      response.data
    );

    setPermissions(
      response.data
    );

  } catch (error) {

    console.error(
      "Permission Error:",
      error
    );

  }
};
const loadAllPermissions = async () => {
  try {

    const response =
      await FM_API.get(
        "/fm/permissions"
      );

    console.log(
      "All Permissions:",
      response.data
    );

    setAllPermissions(
      response.data
    );

  } catch (error) {

    console.error(
      "Error loading all permissions:",
      error
    );

  }
};
const savePermissions = async () => {

  if (!selectedRole) {
    alert("Please select a role");
    return;
  }

  try {

    const payload = {
      permissionIds:
        selectedPermissions
    };

    console.log(
  "Selected Role:",
  selectedRole
);

console.log(
  "Selected Permission Ids:",
  selectedPermissions
);

console.log(
  "Request Payload:",
  payload
);
    await FM_API.put(
      `/fm/roles/${selectedRole.roleId}/permissions`,
      payload
    );

    alert(
      "Permissions Updated Successfully"
    );

    setShowPermissionModal(false);

    loadPermissions(
      selectedRole.roleId
    );

  } catch (error) {

    console.error(
      "Save Permission Error:",
      error
    );

    alert(
      "Failed To Save Permissions"
    );
  }
};
  const filteredRoles = roles.filter((role) =>
    role.roleName
      ?.toLowerCase()
      .includes(
        searchRole.toLowerCase()
      )
  );

//   const permissions = [
//     {
//       module: "User Management",
//       view: true,
//       create: true,
//       edit: true,
//       delete: true,
//     },
//     {
//       module: "Role Management",
//       view: true,
//       create: true,
//       edit: false,
//       delete: false,
//     },
//     {
//       module: "Zone Management",
//       view: true,
//       create: true,
//       edit: true,
//       delete: false,
//     },
//   ];
const createRole = async () => {

  try {

    await FM_API.post(
      "/fm/roles",
      {
        roleName
      }
    );

    alert(
      "Role Created Successfully"
    );

    setShowRoleModal(false);

    setRoleName("");

    loadRoles();

  } catch (error) {

    console.error(
      "Create Role Error:",
      error
    );

  }
};
const updateRole = async () => {

  if (!selectedRole) {
    alert("Please select a role");
    return;
  }

  try {

    await FM_API.put(
      `/fm/roles/${selectedRole.roleId}`,
      {
        roleName
      }
    );

    alert(
      "Role Updated Successfully"
    );

    setShowRoleModal(false);

    setIsEditMode(false);

    setRoleName("");

    loadRoles();

  } catch (error) {

    console.error(error);

    alert(
      "Failed To Update Role"
    );

  }

};
const createPermission = async () => {

  try {

    await FM_API.post(
      "/fm/permissions",
      {
        permissionName
      }
    );

    alert(
      "Permission Created Successfully"
    );

    setShowPermissionCrudModal(false);

    setPermissionName("");

    loadAllPermissions();

  } catch (error) {

    console.error(error);

    alert(
      "Failed To Create Permission"
    );

  }

};

const deletePermission = async (
  permissionId
) => {

  const confirmDelete =
    window.confirm(
      "Delete Permission?"
    );

  if (!confirmDelete) return;

  try {

    await FM_API.delete(
      `/fm/permissions/${permissionId}`
    );

    alert(
      "Permission Deleted"
    );

    loadAllPermissions();

  } catch (error) {

    console.error(error);

    alert(
      "Delete Failed"
    );

  }

};
const updatePermission = async () => {

  try {

    await FM_API.put(
      `/fm/permissions/${selectedPermission.permissionId}`,
      {
        permissionName
      }
    );

    alert(
      "Permission Updated"
    );

    setShowPermissionCrudModal(false);

    loadAllPermissions();

  } catch (error) {

    console.error(error);

    alert(
      "Update Failed"
    );

  }

};
  return (
    <div className="rp-container">

      <div className="rp-header">
        <div>
          <h2>
            Roles & Permissions
          </h2>

          <p className="sub-title">
            Manage roles and their
            associated permissions
          </p>
        </div>

    {
  hasPermission("ROLE_CREATE") && (
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
  )
}
      </div>

     <div className="top-tabs">

  <button
    className={
      activeTab === "roles"
        ? "tab-active"
        : ""
    }
    onClick={() =>
      setActiveTab("roles")
    }
  >
    Roles
  </button>

  <button
    className={
      activeTab === "permissions"
        ? "tab-active"
        : ""
    }
    onClick={() =>
      setActiveTab("permissions")
    }
  >
    Permissions
  </button>

  <button
    className={
      activeTab === "assignRoles"
        ? "tab-active"
        : ""
    }
    onClick={() =>
      setActiveTab("assignRoles")
    }
  >
    Assign Roles
  </button>

</div>

      {activeTab === "roles" && (

<div className="rp-layout">

        {/* LEFT PANEL */}

        <div className="roles-panel">

          <h3>Roles</h3>

          <input
            type="text"
            placeholder="Search roles..."
            className="search-input"
            value={searchRole}
            onChange={(e) =>
              setSearchRole(
                e.target.value
              )
            }
          />

          {filteredRoles.map(
            (role) => (
              <div
                key={role.roleId}
                className={`role-card ${
                  selectedRole?.roleId ===
                  role.roleId
                    ? "role-card-active"
                    : ""
                }`}
onClick={() => {

  console.log(
    "Selected Role:",
    role
  );

  setSelectedRole(role);

  loadPermissions(
    role.roleId
  );

}}
              >
                <div>
                  <h4>
                    {role.roleName}
                  </h4>

                  <p>
                    Manage
                    permissions
                  </p>
                </div>

             <span className="role-count">
  {selectedRole?.roleId === role.roleId
    ? permissions.length
    : ""}
</span>
              </div>
            )
          )}

        </div>

        {/* RIGHT PANEL */}

        <div className="permissions-panel">

          <div className="role-details-header">

            <div>

              <h3>
                Role Details
              </h3>

              <div className="role-field">

                <label>
                  Role Name
                </label>

                <input
                  value={
                    selectedRole?.roleName ||
                    ""
                  }
                  readOnly
                  className="role-name-box"
                />

              </div>

            </div>

            <div className="action-buttons">

{
  hasPermission("ROLE_UPDATE") && (
    <button
      className="edit-role-btn"
      onClick={() => {

        setIsEditMode(true);

        setRoleName(
          selectedRole?.roleName || ""
        );

        setShowRoleModal(true);

      }}
    >
      Edit Role
    </button>
  )
}
{
  hasPermission("ROLE_UPDATE") && (
    <button
      className="edit-role-btn"
      onClick={() => {

        setSelectedPermissions(
          permissions.map(
            permission =>
              permission.permissionId
          )
        );

        setShowPermissionModal(true);

      }}
    >
      Manage Permissions
    </button>
  )
}
            {
  hasPermission("ROLE_DELETE") && (
    <button
      className="delete-role-btn"
    >
      Delete Role
    </button>
  )
}

            </div>

          </div>

          <div className="permission-section">

            <div className="permission-header">

  <h3>
    Permissions (
    {permissions.length}
    )
  </h3>

 {
  hasPermission("ROLE_CREATE") && (
    <button
      className="create-role-btn"
      onClick={() => {

        setSelectedPermission(null);

        setPermissionName("");

        setIsPermissionEditMode(false);

        setShowPermissionCrudModal(true);

      }}
    >
      + Add Permission
    </button>
  )
}

</div>

            <table className="permission-table">

              <thead>
                <tr>
                  <th>
                    Permission
                    Name
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              {/* <tbody>

                {permissions.map(
                  (
                    permission,
                    index
                  ) => (
                    <tr
                      key={index}
                    >
                     <td>
  {permission.permissionName}
</td>

<td>
  Role Permission
</td>

                      <td>
                        <span className="status-active">
                          Active
                        </span>
                      </td>

                      <td>
                        👁️
                      </td>
                    </tr>
                  )
                )}

              </tbody> */}

<tbody>
  {permissions.length > 0 ? (
    permissions.map((permission) => (
      <tr key={permission.permissionId}>
        <td>{permission.permissionName}</td>
        <td>Role Permission</td>
        <td>
          <span className="status-active">
            Active
          </span>
        </td>
        <td>👁️</td>
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan="4"
        style={{
          textAlign: "center",
          padding: "20px"
        }}
      >
        No Permissions Found
      </td>
    </tr>
  )}
</tbody>

            </table>

          </div>

        </div>


           </div>
)}
{activeTab === "permissions" && (

<div className="permissions-page">

  <div className="permission-header">

    <h2>Permissions</h2>

  {
  hasPermission("ROLE_CREATE") && (
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
  )
}

  </div>

  <table className="permission-table">

    <thead>
      <tr>
        <th>ID</th>
        <th>Permission Name</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>

      {allPermissions.map(permission => (

        <tr key={permission.permissionId}>

          <td>{permission.permissionId}</td>

          <td>{permission.permissionName}</td>

          <td>
{
  hasPermission("ROLE_UPDATE") && (
    <button
      className="edit-btn icon-btn"
      onClick={() => {
        setSelectedPermission(permission);
        setPermissionName(permission.permissionName);
        setIsPermissionEditMode(true);
        setShowPermissionCrudModal(true);
      }}
    >
      <FaEdit />
    </button>
  )
}

{
  hasPermission("ROLE_DELETE") && (
    <button
      className="delete-btn icon-btn"
      onClick={() =>
        deletePermission(
          permission.permissionId
        )
      }
    >
      <FaTrash />
    </button>
  )
}
          </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

)}
{activeTab === "assignRoles" && (

<div className="permissions-page">

  <h2>Assign Roles To Users</h2>

  <p>
    Move your AdminUsers component here.
  </p>

</div>

)}
      {showPermissionModal && (
        <div className="modal-overlay">

          <div className="permission-modal">

            <div className="modal-header">

              <h3>
                Manage Permissions -
                {selectedRole?.roleName}
              </h3>

              <button
                onClick={() =>
                  setShowPermissionModal(false)
                }
              >
                ✖
              </button>

            </div>

            {allPermissions.map(
              (permission) => (

                <div
                  key={permission.permissionId}
                  className="checkbox-row"
                >

                 <input
  type="checkbox"
  checked={selectedPermissions.includes(
    permission.permissionId
  )}
  onChange={(e) => {

    if (e.target.checked) {

      setSelectedPermissions([
        ...selectedPermissions,
        permission.permissionId
      ]);

    } else {

      setSelectedPermissions(
        selectedPermissions.filter(
          id =>
            id !== permission.permissionId
        )
      );

    }

  }}
/>

                  <label>
                    {permission.permissionName}
                  </label>

                </div>

              )
            )}

        {
  hasPermission("ROLE_UPDATE") && (
    <button
      className="save-btn"
      onClick={savePermissions}
    >
      Save Permissions
    </button>
  )
}

          </div>

        </div>
      )}
      {showRoleModal && (

  <div className="modal-overlay">

    <div className="permission-modal">

      <div className="modal-header">

   <h3>
  {isEditMode
    ? "Edit Role"
    : "Create New Role"}
</h3>

        <button
          onClick={() =>
            setShowRoleModal(false)
          }
        >
          ✖
        </button>

      </div>

      <input
        type="text"
        placeholder="Enter Role Name"
        value={roleName}
        onChange={(e) =>
          setRoleName(
            e.target.value
          )
        }
        className="role-name-box"
      />

      <br />
      <br />
{
  (
    (!isEditMode &&
      hasPermission("ROLE_CREATE")) ||
    (isEditMode &&
      hasPermission("ROLE_UPDATE"))
  ) && (
    <button
      className="save-btn"
      onClick={
        isEditMode
          ? updateRole
          : createRole
      }
    >
      {isEditMode
        ? "Update Role"
        : "Create Role"}
    </button>
  )
}

    </div>

  </div>

)}
{showPermissionCrudModal && (

  <div className="modal-overlay">

    <div className="permission-modal">

      <div className="modal-header">

        <h3>
  {isPermissionEditMode
    ? "Edit Permission"
    : "Create Permission"}
</h3>

        <button
          onClick={() =>
            setShowPermissionCrudModal(false)
          }
        >
          ✖
        </button>

      </div>

      <input
        type="text"
        placeholder="Permission Name"
        value={permissionName}
        onChange={(e) =>
          setPermissionName(
            e.target.value
          )
        }
      />

      <br />
      <br />

    {
  (
    (!isPermissionEditMode &&
      hasPermission("ROLE_CREATE")) ||
    (isPermissionEditMode &&
      hasPermission("ROLE_UPDATE"))
  ) && (
    <button
      className="save-btn"
      onClick={
        isPermissionEditMode
          ? updatePermission
          : createPermission
      }
    >
      {isPermissionEditMode
        ? "Update Permission"
        : "Save Permission"}
    </button>
  )
}

    </div>

  </div>

)}

    </div>
  );
}

export default RolesPermissions;