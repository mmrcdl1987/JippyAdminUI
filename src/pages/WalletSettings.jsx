import { useState, useEffect } from "react";
import "../styles/WalletSettings.css";
import { saveWalletSettings, getWalletSettings } from "../services/walletSettingsService";

function WalletSettings() {
  // Navigation & View States: 'list', 'add', 'edit', 'detail'
  const [currentView, setCurrentView] = useState("list");
  const [selectedSetting, setSelectedSetting] = useState(null);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Dynamic Wallet Settings List & Pagination State from Spring Boot Backend
  const [walletList, setWalletList] = useState([]);
  const [page, setPage] = useState(0); // Spring Boot Page index starts at 0
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    walletSettingsId: null,
    pointsType: "Order Amount",
    numOfPoints: "",
    streakMinDays: "",
  });

  // Fetch dynamic wallet settings on mount and when pagination changes
  useEffect(() => {
    fetchWalletSettings(page, size);
  }, [page, size]);

  const fetchWalletSettings = async (pageNo, pageSize) => {
    try {
      setLoading(true);
      const response = await getWalletSettings(pageNo, pageSize);
      const resData = response.data !== undefined ? response.data : response;

      if (Array.isArray(resData)) {
        setWalletList(resData);
        setTotalPages(1);
        setTotalElements(resData.length);
      } else if (resData && resData.content) {
        setWalletList(resData.content);
        setTotalPages(resData.totalPages || 1);
        setTotalElements(resData.totalElements || 0);
        setHasNext(!resData.last);
        setHasPrevious(!resData.first);
      } else {
        setWalletList([]);
      }
    } catch (error) {
      console.error("Error fetching wallet settings:", error);
      alert("Unable to load dynamic wallet settings from server.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      walletSettingsId: null,
      pointsType: "Order Amount",
      numOfPoints: "",
      streakMinDays: "",
    });
    setCurrentView("add");
  };

  const handleOpenEdit = (setting) => {
    setSelectedSetting(setting);
    setFormData({
      walletSettingsId: setting.walletSettingsId,
      pointsType: setting.pointsType,
      numOfPoints: setting.numOfPoints,
      streakMinDays: setting.streakMinDays,
    });
    setCurrentView("edit");
  };

  const handleOpenDetail = (setting) => {
    setSelectedSetting(setting);
    setCurrentView("detail");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        walletSettingsId: currentView === "edit" ? formData.walletSettingsId : null,
        pointsType: formData.pointsType,
        numOfPoints: Number(formData.numOfPoints),
        streakMinDays: Number(formData.streakMinDays),
        createdBy: 1, 
        updatedBy: 1, 
      };

      const response = await saveWalletSettings(payload);
      console.log(response?.data);

      alert(currentView === "edit" ? "Wallet Settings Updated Successfully." : "Wallet Settings Created Successfully.");
      setCurrentView("list");
      fetchWalletSettings(page, size); 
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.errorMessage || error.response?.data?.message;
      alert(message || "Unable to save wallet settings.");
    } finally {
      setLoading(false);
    }
  };

  const filteredWalletList = walletList.filter(
    (item) =>
      item.pointsType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.numOfPoints?.toString().includes(searchTerm) ||
      item.streakMinDays?.toString().includes(searchTerm)
  );

  return (
    <div className="wal-page-wrapper">
      {/* Top Clean Navigation Bar */}
      <header className="wal-topbar">
        <div className="wal-topbar-left">
          <span className="wal-menu-trigger">&#9776;</span>
          <span className="wal-brand-title">Jippy Mart</span>
        </div>
        <div className="wal-header-right">
          <span className="wal-notify">&#128276;</span>
          <span className="wal-user-dropdown">Sudheer Admin &#9662;</span>
        </div>
      </header>

      <div className="wal-content-body">
        {/* VIEW 1: LIST / TABLE VIEW */}
        {currentView === "list" && (
          <>
            <div className="wal-page-title-row">
              <div>
                <h1 className="wal-page-main-title">Wallet Settings</h1>
                <p className="wal-breadcrumb-sub">Manage wallet points and streak settings</p>
              </div>
              <button className="wal-btn-primary" onClick={handleOpenAdd}>
                + Add Wallet Settings
              </button>
            </div>

            <div className="wal-table-card">
              <div className="wal-table-toolbar">
                <div className="wal-search-box">
                  <span className="search-icon">&#128269;</span>
                  <input
                    type="text"
                    placeholder="Search by points type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="wal-toolbar-right">
                  <button className="wal-btn-outline">&#127881; Filters</button>
                </div>
              </div>

              <div className="wal-table-container">
                <table className="wal-data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>POINTS TYPE</th>
                      <th>NUM OF POINTS</th>
                      <th>STREAK MIN DAYS</th>
                      <th>CREATED AT</th>
                      <th>UPDATED AT</th>
                      <th className="text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && walletList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center" style={{ padding: "24px", color: "#666" }}>
                          Loading wallet settings...
                        </td>
                      </tr>
                    ) : filteredWalletList.length > 0 ? (
                      filteredWalletList.map((item, index) => (
                        <tr key={item.walletSettingsId}>
                          <td>{page * size + index + 1}</td>
                          <td>{item.pointsType}</td>
                          <td>{item.numOfPoints}</td>
                          <td>{item.streakMinDays}</td>
                          <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}</td>
                          <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}</td>
                          <td className="text-center action-col">
                            <button className="act-btn view" title="View" onClick={() => handleOpenDetail(item)}>&#128065;</button>
                            <button className="act-btn edit" title="Edit" onClick={() => handleOpenEdit(item)}>&#9998;</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center" style={{ padding: "24px", color: "#666" }}>
                          No wallet settings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="wal-table-footer">
                <p>Showing page {page + 1} of {totalPages} (Total: {totalElements} entries)</p>
                <div className="pagination">
                  <button 
                    className="page-btn" 
                    disabled={!hasPrevious} 
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  >
                    &lt;
                  </button>
                  <button className="page-btn active">{page + 1}</button>
                  <button 
                    className="page-btn" 
                    disabled={!hasNext} 
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2 & 3: ADD OR EDIT WALLET SETTINGS FORM */}
        {(currentView === "add" || currentView === "edit") && (
          <div className="wal-form-container-card">
            <div className="wal-detail-top-nav">
              <button className="back-link" onClick={() => setCurrentView("list")}>&larr; Back</button>
              <p className="wal-breadcrumb-sub">Wallet Settings &gt; {currentView === "add" ? "Add" : "Edit"}</p>
            </div>

            <div className="wal-settings-card">
              <div className="wal-card-header">
                {currentView === "add" ? "ADD WALLET SETTINGS" : "EDIT WALLET SETTINGS"}
              </div>

              <form onSubmit={handleSave}>
                <div className="wal-form-grid">
                  <div className="wal-form-group">
                    <label className="wal-form-label">
                      Points Type <span className="req">*</span>
                    </label>
                    <select
                      className="wal-form-select"
                      name="pointsType"
                      value={formData.pointsType}
                      onChange={handleChange}
                    >
                      <option value="Order Amount">Order Amount</option>
                      <option value="Per Order">Per Order</option>
                      <option value="Sign Up Bonus">Sign Up Bonus</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="ORDER">Order</option>
                      <option value="STREAK">Streak</option>
                    </select>
                  </div>

                  <div className="wal-form-group">
                    <label className="wal-form-label">
                      Num Of Points <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      className="wal-form-input"
                      name="numOfPoints"
                      value={formData.numOfPoints}
                      onChange={handleChange}
                      placeholder="Enter number of points"
                      required
                    />
                  </div>

                  <div className="wal-form-group">
                    <label className="wal-form-label">
                      Streak Min Days <span className="req">*</span>
                    </label>
                    <input
                      type="number"
                      className="wal-form-input"
                      name="streakMinDays"
                      value={formData.streakMinDays}
                      onChange={handleChange}
                      placeholder="Enter streak minimum days"
                      required
                    />
                  </div>
                </div>

                <div className="wal-button-wrapper">
                  <button
                    type="button"
                    className="wal-btn-secondary"
                    onClick={() => setCurrentView("list")}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="wal-save-btn"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : currentView === "add" ? "Save" : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 4: DETAIL / VIEW WALLET SETTINGS */}
        {currentView === "detail" && selectedSetting && (
          <div className="wal-detail-card">
            <div className="wal-detail-top-nav">
              <button className="back-link" onClick={() => setCurrentView("list")}>&larr; Back</button>
              <p className="wal-breadcrumb-sub">Wallet Settings &gt; View</p>
              <div className="detail-action-top">
                <button className="wal-btn-primary" onClick={() => handleOpenEdit(selectedSetting)}>Edit</button>
              </div>
            </div>

            <h2 className="wal-page-main-title mb-4">Wallet Settings Details</h2>

            <div className="wal-detail-section-block">
              <div className="overview-grid-columns">
                <div className="row-item"><span className="lbl">Wallet Settings ID</span><span className="colon">:</span><p>{selectedSetting.walletSettingsId}</p></div>
                <div className="row-item"><span className="lbl">Points Type</span><span className="colon">:</span><p>{selectedSetting.pointsType}</p></div>
                <div className="row-item"><span className="lbl">Num Of Points</span><span className="colon">:</span><p>{selectedSetting.numOfPoints}</p></div>
                <div className="row-item"><span className="lbl">Streak Min Days</span><span className="colon">:</span><p>{selectedSetting.streakMinDays}</p></div>
                <div className="row-item"><span className="lbl">Created By</span><span className="colon">:</span><p>{selectedSetting.createdBy || "-"}</p></div>
                <div className="row-item"><span className="lbl">Created At</span><span className="colon">:</span><p>{selectedSetting.createdAt ? new Date(selectedSetting.createdAt).toLocaleString() : "-"}</p></div>
                <div className="row-item"><span className="lbl">Updated By</span><span className="colon">:</span><p>{selectedSetting.updatedBy || "-"}</p></div>
                <div className="row-item"><span className="lbl">Updated At</span><span className="colon">:</span><p>{selectedSetting.updatedAt ? new Date(selectedSetting.updatedAt).toLocaleString() : "-"}</p></div>
              </div>
            </div>

            <div className="wal-button-wrapper mt-4">
              <button className="wal-btn-secondary" onClick={() => setCurrentView("list")}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WalletSettings;