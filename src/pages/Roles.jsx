import { useEffect, useState } from "react";
import API from "../services/api";
import { FM_API } from "../services/api";
import { menuData } from "../data/menuData";
import "../styles/Roles.css";

function Roles() {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleName, setRoleName] = useState("");

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await FM_API.get("/fm/roles");
      setRoles(response.data);
    } catch (error) {
      console.error("Error Loading Roles:", error);
    }
  };

  // const handleCreateRole = async () => {
    // if (!roleName.trim()) {
    //   alert("Enter Role Name");
    //   return;
    // }

 const handleCreateRole = async () => {

  const trimmedRoleName = roleName.trim();

  if (!trimmedRoleName) {
    alert("Enter Role Name");
    return;
  }

  const roleNameRegex = /^[A-Za-z_]+$/;

  if (!roleNameRegex.test(trimmedRoleName)) {
    alert("Role Name should contain only letters (A-Z) and underscores (_).");
    return;
  }

  if (trimmedRoleName.length > 25) {
    alert("Role Name should not exceed 25 characters.");
    return;
  }

  try {

    const payload = {
      roleName: trimmedRoleName,
    };

    await API.post("/createRole", payload);

    alert("Role Created Successfully");

    setRoleName("");
    loadRoles();
    setActiveTab("list");

  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.errorMessage ||
      "Failed To Create Role"
    );
  }
};


      alert(
        error.response?.data?.errorMessage || "Failed To Create Role"
      );
    }
  };


  const filteredRoles = roles.filter((role) =>
    role.roleName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setSelectedPermissions([]);
    setShowPermissionModal(true);
  };

  const togglePermission = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSavePermissions = () => {
    console.log("Role:", selectedRole?.roleName);
    console.log("Permissions:", selectedPermissions);


  const togglePermission = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSavePermissions = () => {
    console.log("Role:", selectedRole?.roleName);
    console.log("Permissions:", selectedPermissions);

    alert("Permissions selected successfully");
  };

  return (
    <div className="roles-page">
      <div className="roles-header">
        <h2>Role Management</h2>
      </div>

      <div className="roles-tabs">
        <button
          className={activeTab === "list" ? "active-tab" : ""}
          onClick={() => setActiveTab("list")}
        >
          📋 Role List
        </button>

        <button
          className={activeTab === "create" ? "active-tab" : ""}
          onClick={() => setActiveTab("create")}
        >
          ➕ Create Role
        </button>
      </div>

      {activeTab === "list" && (
        <>
          <div className="roles-summary">
            <div className="summary-card">
              <h3>{roles.length}</h3>
              <p>Total Roles</p>
            </div>

            <div className="summary-card">
              <h3>{filteredRoles.length}</h3>
              <p>Visible Roles</p>
            </div>

            <div className="summary-card">
              <h3>24</h3>
              <p>Total Permissions</p>
            </div>
          </div>

          <div className="roles-table-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search Role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="roles-table-scroll">
              <table className="roles-table">
                <thead>
                  <tr>
                    <th>Role Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRoles.length > 0 ? (
                    filteredRoles.map((role) => (
                      <tr key={role.roleId}>
                        <td>{role.roleName}</td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => handleEditRole(role)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        style={{
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        No Roles Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "create" && (
        <div className="create-role-form">
          <h3>Create Role</h3>

          {/* <input
            type="text"
            placeholder="Enter Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          /> */}
          <input
  type="text"
  placeholder="Enter Role Name"
  value={roleName}
  maxLength={25}
  onChange={(e) => {
    const value = e.target.value;

    if (/^[A-Za-z_]*$/.test(value)) {
      setRoleName(value);
    }
  }}
/>

          <button onClick={handleCreateRole}>Save Role</button>
        </div>
      )}


          <input
            type="text"
            placeholder="Enter Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />

          <button onClick={handleCreateRole}>Save Role</button>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="modal-overlay">
          <div className="permission-modal">
            <div className="modal-header">
              <h3>Permissions - {selectedRole?.roleName}</h3>

              <button
                className="close-btn"
                onClick={() => setShowPermissionModal(false)}
              >
                ✖
              </button>
            </div>

            <div className="permission-grid">
              {menuData.map((section) =>
                section.items.map((item) =>
                  item.children ? (
                    item.children.map((child) => (
                      <div key={child.name} className="permission-row">
                        <span>{child.name}</span>

                        <label>
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(
                              `${child.name}_VIEW`
                            )}
                            onChange={() =>
                              togglePermission(`${child.name}_VIEW`)
                            }
                          />
                          View
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(
                              `${child.name}_CREATE`
                            )}
                            onChange={() =>
                              togglePermission(`${child.name}_CREATE`)
                            }
                          />
                          Create
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(
                              `${child.name}_EDIT`
                            )}
                            onChange={() =>
                              togglePermission(`${child.name}_EDIT`)
                            }
                          />
                          Edit
                        </label>

                        <label>
                          <input
                            type="checkbox"
                            checked={selectedPermissions.includes(
                              `${child.name}_DELETE`
                            )}
                            onChange={() =>
                              togglePermission(`${child.name}_DELETE`)
                            }
                          />
                          Delete
                        </label>
                      </div>
                    ))
                  ) : (
                    <div key={item.name} className="permission-row">
                      <span>{item.name}</span>

                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(
                            `${item.name}_VIEW`
                          )}
                          onChange={() =>
                            togglePermission(`${item.name}_VIEW`)
                          }
                        />
                        View
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(
                            `${item.name}_CREATE`
                          )}
                          onChange={() =>
                            togglePermission(`${item.name}_CREATE`)
                          }
                        />
                        Create
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(
                            `${item.name}_EDIT`
                          )}
                          onChange={() =>
                            togglePermission(`${item.name}_EDIT`)
                          }
                        />
                        Edit
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(
                            `${item.name}_DELETE`
                          )}
                          onChange={() =>
                            togglePermission(`${item.name}_DELETE`)
                          }
                        />
                        Delete
                      </label>
                    </div>
                  )
                )
              )}
            </div>

            <button
              className="save-btn"
              onClick={handleSavePermissions}
            >
              Save Permissions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roles;