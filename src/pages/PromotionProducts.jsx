import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiList,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCheckSquare,
  FiSquare,
} from "react-icons/fi";
import {
  getStoredPromotionProducts,
  saveStoredPromotionProducts,
  updatePromotionSettingStatus,
  deletePromotionSetting,
} from "../services/promotionSettingsService";
import CreatePromotionProduct from "./CreatePromotionProduct";
import "../styles/PromotionProducts.css";

const PromotionProducts = ({ setActivePage }) => {
  const navigate = useNavigate();

  // Mode: "list" | "create" | "edit"
  const [viewMode, setViewMode] = useState("list");
  const [editingItem, setEditingItem] = useState(null);

  // Promotions Data List
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Controls
  const [selectedType, setSelectedType] = useState("All");
  const [selectedZone, setSelectedZone] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(30);
  const [currentPage, setCurrentPage] = useState(1);

  // Selected row IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);

  // Sorting
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  // Load Promotions on mount
  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = () => {
    setLoading(true);
    try {
      const stored = getStoredPromotionProducts();
      setPromotions(stored);
    } catch (err) {
      console.error("Error loading promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Available Zones
  const zonesList = useMemo(() => {
    const set = new Set(["Ongole"]);
    promotions.forEach((p) => {
      if (p.zone) set.add(p.zone);
    });
    return Array.from(set);
  }, [promotions]);

  // Format Date for display e.g. "11/09/2026, 11:51:00"
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    } catch {
      return dateStr;
    }
  };

  // Handle Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Toggle Switch for Available (Green)
  const handleToggleAvailable = async (item) => {
    const updatedStatus = !item.isAvailable;
    const updatedList = promotions.map((p) =>
      p.id === item.id ? { ...p, isAvailable: updatedStatus } : p
    );
    setPromotions(updatedList);
    saveStoredPromotionProducts(updatedList);

    // Try backend API status update
    try {
      await updatePromotionSettingStatus(item.id, updatedStatus ? "Y" : "N");
    } catch (e) {
      console.warn("Backend status update error:", e);
    }
  };

  // Toggle Switch for Promo (Red)
  const handleTogglePromo = (item) => {
    const updatedStatus = !item.isPromoAccepted;
    const updatedList = promotions.map((p) =>
      p.id === item.id ? { ...p, isPromoAccepted: updatedStatus } : p
    );
    setPromotions(updatedList);
    saveStoredPromotionProducts(updatedList);
  };

  // Delete Action
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this promotion?")) {
      return;
    }
    const updatedList = promotions.filter((p) => p.id !== id);
    setPromotions(updatedList);
    saveStoredPromotionProducts(updatedList);
    setSelectedIds((prev) => prev.filter((i) => i !== id));

    try {
      await deletePromotionSetting(id);
    } catch (e) {
      console.warn("Backend delete error:", e);
    }
  };

  // Edit Action
  const handleEdit = (item) => {
    setEditingItem(item);
    setViewMode("edit");
  };

  // Add Action
  const handleAddNew = () => {
    setEditingItem(null);
    setViewMode("create");
  };

  // Multi-select Checkboxes
  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (filteredItems) => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((p) => p.id));
    }
  };

  // Filter and Sort Logic
  const filteredPromotions = useMemo(() => {
    return promotions
      .filter((item) => {
        // Restaurant Type filter
        if (selectedType !== "All" && item.type !== selectedType) {
          return false;
        }
        // Zone filter
        if (selectedZone !== "All" && item.zone !== selectedZone) {
          return false;
        }
        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesRestaurant = item.restaurant?.toLowerCase().includes(q);
          const matchesProduct = item.product?.toLowerCase().includes(q);
          const matchesZone = item.zone?.toLowerCase().includes(q);
          return matchesRestaurant || matchesProduct || matchesZone;
        }
        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [promotions, selectedType, selectedZone, searchTerm, sortField, sortOrder]);

  // Pagination Logic
  const totalEntries = filteredPromotions.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const currentEntries = filteredPromotions.slice(startIndex, endIndex);

  // If viewMode is create or edit, render CreatePromotionProduct
  if (viewMode === "create" || viewMode === "edit") {
    return (
      <CreatePromotionProduct
        setActivePage={setActivePage}
        editItem={editingItem}
        onSaveSuccess={() => {
          loadPromotions();
          setViewMode("list");
        }}
        onCancel={() => {
          setViewMode("list");
        }}
      />
    );
  }

  return (
    <div className="promotion-products-page">
      {/* Top Bar / Breadcrumb */}
      <div className="promotion-products-topbar">
        <h1 className="promotion-products-page-title">Promotions</h1>
        <div className="promotion-products-breadcrumb">
          Dashboard <span>&gt;</span> <strong>Promotions</strong>
        </div>
      </div>

      {/* Header Bar: Promotions List Badge + Filters + Add Promotion */}
      <div className="promotion-products-header-bar">
        <div className="promotion-products-header-left">
          <div className="promotion-products-list-icon">
            <FiList />
          </div>
          <h2>
            Promotions List
            <span className="promotion-products-count-badge">
              {promotions.length}
            </span>
          </h2>
        </div>

        <div className="promotion-products-header-right">
          {/* Restaurant Type Filter */}
          <select
            className="promotion-products-filter-select"
            value={selectedType}
            onChange={(e) => {
              setSelectedType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">Restaurant Type</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Mart">Mart</option>
          </select>

          {/* Zone Filter */}
          <select
            className="promotion-products-filter-select"
            value={selectedZone}
            onChange={(e) => {
              setSelectedZone(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">Select Zone</option>
            {zonesList.map((z, idx) => (
              <option key={idx} value={z}>
                {z}
              </option>
            ))}
          </select>

          {/* + Add Promotion Button */}
          <button
            type="button"
            className="promotion-products-add-btn"
            onClick={handleAddNew}
          >
            <FiPlus /> Add Promotion
          </button>
        </div>
      </div>

      {/* Main Promotions Table Card */}
      <div className="promotion-products-card">
        <div className="promotion-products-table-heading">
          <h3>Promotions Table</h3>
          <p>Manage all promotions and their details</p>
        </div>

        {/* Table Controls (Show entries + Search) */}
        <div className="promotion-products-table-controls">
          <div className="promotion-products-entries-selector">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>

          <div className="promotion-products-search-box">
            <label>Search:</label>
            <div className="promotion-products-search-input-wrapper">
              <input
                type="text"
                placeholder=""
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <FiSearch className="promotion-products-search-icon" />
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="promotion-products-table-responsive">
          <table className="promotion-products-table">
            <thead>
              <tr>
                <th className="promotion-products-checkbox-cell">
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      type="checkbox"
                      checked={
                        filteredPromotions.length > 0 &&
                        selectedIds.length === filteredPromotions.length
                      }
                      onChange={() => handleSelectAll(filteredPromotions)}
                    />
                    <span style={{ fontSize: 11, color: "#ea580c", fontWeight: 700 }}>
                      All
                    </span>
                  </div>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("type")}
                >
                  Type <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("zone")}
                >
                  Zone <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("restaurant")}
                >
                  Restaurant/Mart{" "}
                  <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("product")}
                >
                  Product <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("specialPrice")}
                >
                  Special Price{" "}
                  <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("itemLimit")}
                >
                  Item Limit{" "}
                  <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("extraKmCharge")}
                >
                  Extra KM Charge{" "}
                  <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("freeDeliveryKm")}
                >
                  Free Delivery KM{" "}
                  <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("startTime")}
                >
                  Start Time{" "}
                  <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("endTime")}
                >
                  End Time{" "}
                  <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th
                  className="promotion-products-th-sortable"
                  onClick={() => handleSort("paymentMode")}
                >
                  Payment Mode{" "}
                  <span className="promotion-products-sort-icon">⇅</span>
                </th>
                <th>Available</th>
                <th>Promo</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={15}>
                    <div className="promotion-products-empty-state">
                      <FiList />
                      <h4>No promotions found</h4>
                      <p>
                        Try adjusting your filters or click "+ Add Promotion" to create one.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentEntries.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id}>
                      {/* Checkbox */}
                      <td className="promotion-products-checkbox-cell">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(item.id)}
                        />
                      </td>

                      {/* Type */}
                      <td className="promotion-products-type-badge">
                        {item.type}
                      </td>

                      {/* Zone */}
                      <td>{item.zone || "Ongole"}</td>

                      {/* Restaurant / Mart */}
                      <td>
                        <strong>{item.restaurant}</strong>
                      </td>

                      {/* Product */}
                      <td
                        className="promotion-products-product-cell"
                        title={item.product}
                      >
                        {item.product}
                      </td>

                      {/* Special Price */}
                      <td className="promotion-products-price-cell">
                        ₹{item.specialPrice}
                      </td>

                      {/* Item Limit */}
                      <td>{item.itemLimit ?? 2}</td>

                      {/* Extra KM Charge */}
                      <td>{item.extraKmCharge ?? 5}</td>

                      {/* Free Delivery KM */}
                      <td>{item.freeDeliveryKm ?? 0}</td>

                      {/* Start Time */}
                      <td className="promotion-products-time-cell">
                        {formatDateTime(item.startTime)}
                      </td>

                      {/* End Time */}
                      <td className="promotion-products-time-cell">
                        {formatDateTime(item.endTime)}
                      </td>

                      {/* Payment Mode */}
                      <td className="promotion-products-payment-cell">
                        {item.paymentMode || "prepaid"}
                      </td>

                      {/* Available Toggle (Green) */}
                      <td>
                        <label className="promotion-toggle-switch promotion-toggle-switch-green">
                          <input
                            type="checkbox"
                            checked={Boolean(item.isAvailable)}
                            onChange={() => handleToggleAvailable(item)}
                          />
                          <span className="promotion-toggle-slider"></span>
                        </label>
                      </td>

                      {/* Promo Toggle (Red) */}
                      <td>
                        <label className="promotion-toggle-switch promotion-toggle-switch-red">
                          <input
                            type="checkbox"
                            checked={Boolean(item.isPromoAccepted)}
                            onChange={() => handleTogglePromo(item)}
                          />
                          <span className="promotion-toggle-slider"></span>
                        </label>
                      </td>

                      {/* Actions (Blue Edit, Red Delete) */}
                      <td>
                        <div className="promotion-products-actions">
                          <button
                            type="button"
                            className="promotion-action-btn promotion-action-edit"
                            onClick={() => handleEdit(item)}
                            title="Edit Promotion"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            className="promotion-action-btn promotion-action-delete"
                            onClick={() => handleDelete(item.id)}
                            title="Delete Promotion"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Counter & Pagination */}
        <div className="promotion-products-footer">
          <div>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
            {endIndex} of {totalEntries} entries
          </div>

          <div className="promotion-products-pagination">
            <button
              type="button"
              className="promotion-pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
              (pNum) => (
                <button
                  key={pNum}
                  type="button"
                  className={`promotion-pagination-btn ${
                    currentPage === pNum ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(pNum)}
                >
                  {pNum}
                </button>
              )
            )}

            <button
              type="button"
              className="promotion-pagination-btn"
              disabled={currentPage === totalPages || totalEntries === 0}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionProducts;
