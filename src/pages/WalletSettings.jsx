import { useEffect, useState } from "react";
import "../styles/WalletSettings.css";
import {
  getWalletSettings,
  saveWalletSettings,
} from "../services/walletSettingsService";

function WalletSettings() {
  const [settingsList, setSettingsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");

  // Create form state
  const [formData, setFormData] = useState({
    settingType: "REFERRAL",
    settingValue: "",
    createdBy: "",
  });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    walletSettingsId: "",
    settingType: "",
    settingValue: "",
    updatedBy: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setFetching(true);
      const res = await getWalletSettings();
      console.log("Wallet Settings Response:", res);

      // Handle various response structures gracefully
      let dataList = [];
      if (Array.isArray(res)) {
        dataList = res;
      } else if (res && Array.isArray(res.data)) {
        dataList = res.data;
      } else if (res && Array.isArray(res.content)) {
        dataList = res.content;
      } else if (res && typeof res === "object") {
        dataList = res.data || res.walletSettings || [];
      }

      setSettingsList(Array.isArray(dataList) ? dataList : []);
    } catch (error) {
      console.error("Error fetching wallet settings:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.settingType) {
      alert("Setting Type is required.");
      return;
    }
    if (formData.settingValue === "") {
      alert("Setting Value is required.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        settingType: formData.settingType,
        settingValue: Number(formData.settingValue),
        createdBy: formData.createdBy ? Number(formData.createdBy) : 1,
      };

      await saveWalletSettings(payload);
      alert("Wallet Setting created successfully.");
      setFormData({
        settingType: "REFERRAL",
        settingValue: "",
        createdBy: "",
      });
      fetchSettings();
    } catch (error) {
      console.error("Save Error:", error);
      const message =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        "Unable to save wallet setting.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditFormData({
      walletSettingsId: item.walletSettingsId,
      settingType: item.settingType || "",
      settingValue: item.settingValue !== undefined ? item.settingValue : "",
      updatedBy: item.updatedBy || 1,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editFormData.settingType) {
      alert("Setting Type is required.");
      return;
    }
    if (editFormData.settingValue === "") {
      alert("Setting Value is required.");
      return;
    }

    try {
      setUpdating(true);
      // For editing, pass walletSettingsId along in the payload to /save endpoint
      const payload = {
        walletSettingsId: editFormData.walletSettingsId,
        settingType: editFormData.settingType,
        settingValue: Number(editFormData.settingValue),
        updatedBy: editFormData.updatedBy ? Number(editFormData.updatedBy) : 1,
      };

      await saveWalletSettings(payload);
      alert("Wallet Setting updated successfully.");
      setShowEditModal(false);
      setEditingItem(null);
      fetchSettings();
    } catch (error) {
      console.error("Update Error:", error);
      const message =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        "Unable to update wallet setting.";
      alert(message);
    } finally {
      setUpdating(false);
    }
  };


  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const filteredSettings = Array.isArray(settingsList)
    ? settingsList.filter((item) => {
        const query = search.toLowerCase();
        const typeMatch = item.settingType?.toLowerCase().includes(query);
        const idMatch = String(item.walletSettingsId || "").includes(query);
        const valMatch = String(item.settingValue || "").includes(query);
        return typeMatch || idMatch || valMatch;
      })
    : [];

  return (
    <div className="wal-page-wrapper">
      <div className="wal-header-flex">
        <h2 className="wal-page-title">Wallet Settings</h2>
        <button className="wal-refresh-btn" onClick={fetchSettings} disabled={fetching}>
          {fetching ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>


      {/* Table Section */}
      <div className="wal-settings-card wal-table-card">
        <div className="wal-card-header">WALLET SETTINGS LIST</div>

        <div className="wal-table-wrapper">
          <table className="wal-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Setting Type</th>
                <th>Setting Value</th>
                <th>Updated By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="8" className="wal-empty-row">
                    Loading Wallet Settings...
                  </td>
                </tr>
              ) : filteredSettings.length > 0 ? (
                filteredSettings.map((item) => (
                  <tr key={item.walletSettingsId}>
                    <td>
                      <span className="wal-id-tag">#{item.walletSettingsId}</span>
                    </td>
                    <td>
                      <span className="wal-type-badge">{item.settingType || "-"}</span>
                    </td>
                    <td className="wal-value-cell">{item.settingValue ?? "-"}</td>
                    <td>{item.updatedBy ?? "-"}</td>
                    <td className="wal-actions-cell">
                      <button
                        className="wal-action-edit-btn"
                        onClick={() => openEditModal(item)}
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="wal-empty-row">
                    No Wallet Settings Found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="wal-modal-overlay">
          <div className="wal-modal">
            <div className="wal-modal-header">
              <h3>Edit Wallet Setting (ID: #{editFormData.walletSettingsId})</h3>
              <button
                className="wal-modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
              >
                ✖
              </button>
            </div>

            <div className="wal-modal-body">

              <div className="wal-form-group" style={{ marginTop: "15px" }}>
                <label className="wal-form-label">
                  Setting Value <span className="wal-required">*</span>
                </label>
                <input
                  type="number"
                  className="wal-form-input"
                  name="settingValue"
                  value={editFormData.settingValue}
                  onChange={handleEditFormChange}
                  placeholder="Enter Setting Value"
                />
              </div>

              <div className="wal-form-group" style={{ marginTop: "15px" }}>
                <label className="wal-form-label">Updated By (User ID)</label>
                <input
                  type="number"
                  className="wal-form-input"
                  name="updatedBy"
                  value={editFormData.updatedBy}
                  onChange={handleEditFormChange}
                  placeholder="Enter Admin/User ID"
                />
              </div>
            </div>

            <div className="wal-modal-footer">
              <button
                className="wal-modal-cancel-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                }}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                className="wal-modal-save-btn"
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletSettings;
