import { useState, useEffect } from "react";
import "../styles/Incentives.css";
import {
  createOrUpdateIncentive,
  getDriverIncentiveHistory,
  getDriversIncentivesForSettlements,
  getDriverIncentiveHistoryPaged,
  getDriverIncentiveSettingsPaged,
} from "../services/incentivesService";

function Incentives() {
  const [currentView, setCurrentView] = useState("list");
  const [activeTab, setActiveTab] = useState("settings"); // 'settings' or 'history'
  
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState(null);

  const [saveLoading, setSaveLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Dynamic Data States
  const [settingsList, setSettingsList] = useState([]);
  const [history, setHistory] = useState([]);

  const [formData, setFormData] = useState({
    ordersCount: "",
    incentiveAmount: "",
  });

  const [searchData, setSearchData] = useState({
    driverId: "",
    filter: "CURRENT_MONTH",
  });

  const [settingSearchTerm, setSettingSearchTerm] = useState("");
  const [historySearchTerm, setHistorySearchTerm] = useState("");

  // Fetch initial settings data on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Automatically fetch history when active tab switches to history
  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await getDriverIncentiveSettingsPaged(0, 20);
      if (response && response.data) {
        const data = Array.isArray(response.data) ? response.data : response.data.content || [];
        setSettingsList(data);
      }
    } catch (error) {
      console.error("Failed to fetch incentive settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      let response;

      if (searchData.driverId) {
        response = await getDriverIncentiveHistory(
          searchData.driverId,
          searchData.filter
        );
      } else {
        response = await getDriverIncentiveHistoryPaged(0, 20);
      }

      if (response && response.data) {
        const items = Array.isArray(response.data) ? response.data : response.data.content || [];
        setHistory(items);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
      const errorMessage = error.response?.data?.errorMessage;
      if (errorMessage) {
        alert(errorMessage);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAdd = () => {
    setFormData({ ordersCount: "", incentiveAmount: "" });
    setSelectedSetting(null); // Clear selected setting so ID is null (triggers Create)
    setCurrentView("add");
  };

  const handleOpenEdit = (setting) => {
    setSelectedSetting(setting);
    setFormData({
      ordersCount: setting.ordersCount ?? "",
      incentiveAmount: setting.incentiveAmount ?? "",
    });
    setCurrentView("edit");
  };

  const handleOpenDetail = (setting) => {
    setSelectedSetting(setting);
    setCurrentView("detail");
  };

  const handleOpenHistoryDetail = (item) => {
    setSelectedHistoryItem(item);
    setCurrentView("history-detail");
  };

  const handleDeletePrompt = (id) => {
    setSettingToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setSettingsList(settingsList.filter((s) => s.driverIncentiveSettingsId !== settingToDelete));
    alert("Incentive setting removed from view.");
    setDeleteModalOpen(false);
    setSettingToDelete(null);
    if (currentView === "detail") {
      setCurrentView("list");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      
      const payload = {
        ...(currentView === "edit" && selectedSetting?.driverIncentiveSettingsId
          ? { driverIncentiveSettingsId: selectedSetting.driverIncentiveSettingsId }
          : {}),
        ordersCount: Number(formData.ordersCount),
        incentiveAmount: Number(formData.incentiveAmount),
      };

      await createOrUpdateIncentive(payload);
      alert(currentView === "edit" ? "Incentive updated successfully." : "Incentive created successfully.");
      setCurrentView("list");
      fetchSettings(); 
    } catch (error) {
      console.error("Failed to save incentive:", error);
      alert("Unable to save incentive.");
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredSettings = settingsList.filter((item) => {
    const count = String(item.ordersCount ?? "");
    const amount = String(item.incentiveAmount ?? "");
    return (
      count.toLowerCase().includes(settingSearchTerm.toLowerCase()) ||
      amount.toLowerCase().includes(settingSearchTerm.toLowerCase())
    );
  });

  const filteredHistory = history.filter((item) => {
    const driverIdStr = String(item.driverId ?? "");
    const driverNameStr = String(item.driverName ?? "");
    const dateStr = String(item.currDate ?? "");
    const term = historySearchTerm.toLowerCase();

    return (
      driverIdStr.toLowerCase().includes(term) ||
      driverNameStr.toLowerCase().includes(term) ||
      dateStr.toLowerCase().includes(term)
    );
  });

  return (
    <div className="jmart-main-standalone" style={{ width: "100%", margin: 0, padding: 0 }}>
      <header className="jmart-topbar-clean">
        <span className="jmart-menu-trigger">&#9776;</span>
        <div className="jmart-header-right">
          <span className="jmart-notify">&#128276;</span>
          <span className="jmart-user-dropdown">Admin &#9662;</span>
        </div>
      </header>

      <div className="jmart-content-body-clean" style={{ padding: "30px 40px" }}>
        {currentView === "list" && (
          <>
            <div className="jmart-page-title-row flex-between">
              <div>
                <h1 className="jmart-title">Driver Incentive Settings</h1>
                <p className="jmart-breadcrumb">Manage driver incentive slabs and view dynamic incentive history</p>
              </div>
              {activeTab === "settings" && (
                <button className="jmart-btn-primary" onClick={handleOpenAdd}>
                  + Add Incentive Setting
                </button>
              )}
            </div>

            <div className="inc-tabs-row">
              <button 
                className={`inc-tab-item ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                Incentive Settings
              </button>
              <button 
                className={`inc-tab-item ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                Incentive History
              </button>
            </div>

            {activeTab === "settings" && (
              <div className="jmart-table-card">
                <div className="jmart-table-toolbar">
                  <div className="jmart-search-box">
                    <span className="search-icon">&#128269;</span>
                    <input 
                      type="text" 
                      placeholder="Search by orders count..." 
                      value={settingSearchTerm}
                      onChange={(e) => setSettingSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="jmart-table-container">
                  <table className="jmart-data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>ORDERS COUNT</th>
                        <th>INCENTIVE AMOUNT (₹)</th>
                        <th>CREATED AT</th>
                        <th>UPDATED AT</th>
                        <th className="text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settingsLoading ? (
                        <tr>
                          <td colSpan="6" className="text-center" style={{ padding: "24px" }}>Loading settings...</td>
                        </tr>
                      ) : filteredSettings.length > 0 ? (
                        filteredSettings.map((item, index) => (
                          <tr key={item.driverIncentiveSettingsId || index}>
                            <td>{index + 1}</td>
                            <td>{item.ordersCount ?? "N/A"}</td>
                            <td>{Number(item.incentiveAmount ?? 0).toFixed(2)}</td>
                            <td>{item.createdAt ?? "N/A"}</td>
                            <td>{item.updatedAt ?? "N/A"}</td>
                            <td className="text-center action-col">
                              <button className="act-btn view" title="View" onClick={() => handleOpenDetail(item)}>&#128065;</button>
                              <button className="act-btn edit" title="Edit" onClick={() => handleOpenEdit(item)}>&#9998;</button>
                              <button className="act-btn delete" title="Delete" onClick={() => handleDeletePrompt(item.driverIncentiveSettingsId)}>&#128465;</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center" style={{ padding: "24px", color: "#666" }}>
                            No incentive settings found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="jmart-table-card">
                <div className="jmart-table-toolbar">
                  <div className="jmart-search-box">
                    <span className="search-icon">&#128269;</span>
                    <input 
                      type="text" 
                      placeholder="Search by Driver Name, ID or Date..." 
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="jmart-toolbar-right flex gap-2">
                    <input 
                      type="number" 
                      className="jmart-input-sm" 
                      name="driverId"
                      placeholder="Driver ID" 
                      value={searchData.driverId}
                      onChange={handleSearchChange}
                      style={{ width: "110px", padding: "6px 10px", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                    <select 
                      className="jmart-select"
                      name="filter"
                      value={searchData.filter}
                      onChange={handleSearchChange}
                    >
                      <option value="CURRENT_MONTH">Current Month</option>
                      <option value="ALL">All</option>
                    </select>
                    <button className="jmart-btn-primary" onClick={fetchHistory} disabled={historyLoading}>
                      {historyLoading ? "Searching..." : "Search"}
                    </button>
                  </div>
                </div>

                <div className="jmart-table-container">
                  <table className="jmart-data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>DRIVER ID</th>
                        <th>DRIVER NAME</th>
                        <th>DATE</th>
                        <th>COMPLETED ORDERS COUNT</th>
                        <th>INCENTIVE AMOUNT (₹)</th>
                        <th>CREATED AT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyLoading ? (
                        <tr>
                          <td colSpan="7" className="text-center" style={{ padding: "24px" }}>Loading history...</td>
                        </tr>
                      ) : filteredHistory.length > 0 ? (
                        filteredHistory.map((item, index) => (
                          <tr key={item.driverIncentiveHistoryId || index} onClick={() => handleOpenHistoryDetail(item)} style={{ cursor: "pointer" }}>
                            <td>{index + 1}</td>
                            <td>{item.driverId ?? "N/A"}</td>
                            <td>{item.driverName ?? "N/A"}</td>
                            <td>{item.currDate ?? "N/A"}</td>
                            <td>{item.completedOrdersCount ?? "0"}</td>
                            <td>{Number(item.incentiveAmount ?? 0).toFixed(2)}</td>
                            <td>{item.createdAt ?? "N/A"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center" style={{ padding: "24px", color: "#666" }}>
                            No Incentive History Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {(currentView === "add" || currentView === "edit") && (
          <div className="jmart-form-container-card">
            <div className="detail-top-nav mb-3">
              <button className="back-link" onClick={() => setCurrentView("list")}>&larr; Back</button>
              <p className="jmart-breadcrumb">Incentive Settings &gt; {currentView === "add" ? "Add" : "Edit"}</p>
            </div>

            <div className="form-top-row">
              <h2>{currentView === "add" ? "Add Incentive Setting" : "Edit Incentive Setting"}</h2>
              <button className="close-x" onClick={() => setCurrentView("list")}>&times;</button>
            </div>

            <form onSubmit={handleSave}>
              <div className="pricing-section-box mt-3">
                <h4 className="section-subtitle blue">INCENTIVE SETTING DETAILS</h4>
                <div className="pricing-grid-2">
                  <div className="jmart-field-group">
                    <label className="jmart-label">Orders Count (From) <span className="req">*</span></label>
                    <input 
                      type="number" 
                      name="ordersCount" 
                      value={formData.ordersCount} 
                      onChange={handleInputChange} 
                      className="jmart-input" 
                      placeholder="Enter minimum orders count" 
                      required 
                    />
                  </div>
                  <div className="jmart-field-group">
                    <label className="jmart-label">Incentive Amount (₹) <span className="req">*</span></label>
                    <input 
                      type="number" 
                      name="incentiveAmount" 
                      value={formData.incentiveAmount} 
                      onChange={handleInputChange} 
                      className="jmart-input" 
                      placeholder="Enter incentive amount" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="form-action-buttons">
                <button type="button" className="jmart-btn-secondary" onClick={() => setCurrentView("list")}>Cancel</button>
                <button type="submit" className="jmart-btn-primary" disabled={saveLoading}>
                  {saveLoading ? "Saving..." : currentView === "add" ? "Save" : "Update"}
                </button>
              </div>
            </form>
          </div>
        )}

        {currentView === "detail" && selectedSetting && (
          <div className="jmart-detail-card">
            <div className="detail-top-nav">
              <button className="back-link" onClick={() => setCurrentView("list")}>&larr; Back</button>
              <p className="jmart-breadcrumb">Incentive Settings &gt; View</p>
              <div className="detail-action-top">
                <button className="jmart-btn-primary" onClick={() => handleOpenEdit(selectedSetting)}>Edit</button>
                <button className="jmart-btn-danger" onClick={() => handleDeletePrompt(selectedSetting.driverIncentiveSettingsId)}>Delete</button>
              </div>
            </div>

            <h2 className="jmart-title mb-4">Incentive Setting Details</h2>

            <div className="detail-section-block">
              <div className="overview-grid-columns">
                <div className="row-item"><span className="lbl">ID</span><span className="colon">:</span><p>{selectedSetting.driverIncentiveSettingsId || "N/A"}</p></div>
                <div className="row-item"><span className="lbl">Orders Count</span><span className="colon">:</span><p>{selectedSetting.ordersCount || "N/A"}</p></div>
                <div className="row-item"><span className="lbl">Incentive Amount (₹)</span><span className="colon">:</span><p>{Number(selectedSetting.incentiveAmount || 0).toFixed(2)}</p></div>
                <div className="row-item"><span className="lbl">Created At</span><span className="colon">:</span><p>{selectedSetting.createdAt || "N/A"}</p></div>
                <div className="row-item"><span className="lbl">Updated At</span><span className="colon">:</span><p>{selectedSetting.updatedAt || "N/A"}</p></div>
              </div>
            </div>
          </div>
        )}

        {currentView === "history-detail" && selectedHistoryItem && (
          <div className="jmart-detail-card">
            <div className="detail-top-nav">
              <button className="back-link" onClick={() => setCurrentView("list")}>&larr; Back</button>
              <p className="jmart-breadcrumb">Incentive History &gt; View</p>
            </div>

            <h2 className="jmart-title mb-4">Incentive History Details</h2>

            <div className="detail-section-block">
              <div className="overview-grid-columns">
                <div className="row-item"><span className="lbl">Incentive History ID</span><span className="colon">:</span><p>{selectedHistoryItem.driverIncentiveHistoryId ?? "N/A"}</p></div>
                <div className="row-item"><span className="lbl">Driver ID</span><span className="colon">:</span><p>{selectedHistoryItem.driverId ?? "N/A"}</p></div>
                <div className="row-item"><span className="lbl">Driver Name</span><span className="colon">:</span><p>{selectedHistoryItem.driverName ?? "N/A"}</p></div>
                <div className="row-item"><span className="lbl">Date</span><span className="colon">:</span><p>{selectedHistoryItem.currDate ?? "N/A"}</p></div>
                <div className="row-item"><span className="lbl">Completed Orders Count</span><span className="colon">:</span><p>{selectedHistoryItem.completedOrdersCount ?? "0"}</p></div>
                <div className="row-item"><span className="lbl">Incentive Amount (₹)</span><span className="colon">:</span><p>{Number(selectedHistoryItem.incentiveAmount ?? 0).toFixed(2)}</p></div>
                <div className="row-item"><span className="lbl">Created At</span><span className="colon">:</span><p>{selectedHistoryItem.createdAt ?? "N/A"}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteModalOpen && (
        <div className="jmart-modal-backdrop">
          <div className="jmart-modal-dialog">
            <div className="warning-circle">&#9888;</div>
            <h3>Delete Incentive Setting</h3>
            <p>Are you sure you want to delete this incentive setting? This action cannot be undone.</p>
            <div className="modal-btns">
              <button className="jmart-btn-secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
              <button className="jmart-btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Incentives;