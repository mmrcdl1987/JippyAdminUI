import "../styles/Categories.css";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import {
  FiSearch,
  FiEdit2,
  FiEye,
  FiX,
  FiImage,
  FiLayers,
  FiRefreshCw,
  FiUploadCloud,
} from "react-icons/fi";

import {
  getHomeOrAllCategories,
  updateCategory,
} from "../services/categoryService";

function Categories({
  refreshCategories,
  setSelectedCategory,
}) {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Category counts
  const [totalCategoriesCount, setTotalCategoriesCount] = useState(0);
  const [allCategoriesCount, setAllCategoriesCount] = useState(0);
  const [homeCategoriesCount, setHomeCategoriesCount] = useState(0);

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryType, setEditCategoryType] = useState("HOME");
  const [editExistingImageUrl, setEditExistingImageUrl] = useState("");
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editDragging, setEditDragging] = useState(false);
  const editFileInputRef = useRef(null);

  // ============================================================
  // ROBUST CATEGORY EXTRACTION HELPER
  // ============================================================
  /**
   * Safely extracts category list regardless of backend response shape:
   * 1. Direct array: [...]
   * 2. Axios / Standard API wrapper: { data: [...] }
   * 3. Named categories wrapper: { categories: [...] }
   * 4. Nested API wrapper: { data: { categories: [...] } }
   * 5. Double-nested wrapper: { data: { data: [...] } }
   * 6. Spring Boot Page: { content: [...] } or { data: { content: [...] } }
   */
  const extractCategoryList = useCallback((response) => {
    if (!response) {
      return [];
    }

    // 1. Direct array
    if (Array.isArray(response)) {
      return response;
    }

    // 2. response.data is an array
    if (Array.isArray(response.data)) {
      return response.data;
    }

    // 3. response.categories is an array
    if (Array.isArray(response.categories)) {
      return response.categories;
    }

    // 4. response.data.categories is an array
    if (Array.isArray(response.data?.categories)) {
      return response.data.categories;
    }

    // 5. response.data.data is an array
    if (Array.isArray(response.data?.data)) {
      return response.data.data;
    }

    // 6. response.data.data.categories is an array
    if (Array.isArray(response.data?.data?.categories)) {
      return response.data.data.categories;
    }

    // 7. response.content is an array (Spring Boot Page)
    if (Array.isArray(response.content)) {
      return response.content;
    }

    // 8. response.data.content is an array
    if (Array.isArray(response.data?.content)) {
      return response.data.content;
    }

    // 9. response.result is an array
    if (Array.isArray(response.result)) {
      return response.result;
    }

    // 10. response.data.result is an array
    if (Array.isArray(response.data?.result)) {
      return response.data.result;
    }

    // 11. response.categoryList is an array
    if (Array.isArray(response.categoryList)) {
      return response.categoryList;
    }

    // 12. response.data.categoryList is an array
    if (Array.isArray(response.data?.categoryList)) {
      return response.data.categoryList;
    }

    // 13. response.data.data.categoryList is an array
    if (Array.isArray(response.data?.data?.categoryList)) {
      return response.data.data.categoryList;
    }

    return [];
  }, []);

  /**
   * Safely extracts metadata container (for counts, totalCount, etc.)
   */
  const extractMetadata = useCallback((response) => {
    if (!response || typeof response !== "object" || Array.isArray(response)) {
      return null;
    }

    if (
      response.data?.data &&
      typeof response.data.data === "object" &&
      !Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    if (
      response.data &&
      typeof response.data === "object" &&
      !Array.isArray(response.data)
    ) {
      return response.data;
    }

    return response;
  }, []);

  // ============================================================
  // FETCH CATEGORIES
  // ============================================================

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await getHomeOrAllCategories(filter);

      console.log("[CATEGORIES] API Raw Response:", response);

      const categoryList = extractCategoryList(response);

      console.log(
        `[CATEGORIES] Extracted ${categoryList.length} category records:`,
        categoryList
      );

      setCategories(categoryList);

      // Extract metadata if returned by server
      const meta = extractMetadata(response);

      const totalFromApi =
        meta?.totalCount !== undefined && meta?.totalCount !== null
          ? Number(meta.totalCount)
          : meta?.totalElements !== undefined && meta?.totalElements !== null
            ? Number(meta.totalElements)
            : null;

      const typeCounts = Array.isArray(meta?.categoryTypeCounts)
        ? meta.categoryTypeCounts
        : [];

      const allFromTypeCounts = typeCounts.find(
        (c) => String(c?.categoryType || "").toUpperCase() === "ALL"
      )?.count;

      const homeFromTypeCounts = typeCounts.find(
        (c) => String(c?.categoryType || "").toUpperCase() === "HOME"
      )?.count;

      // Dynamic counts from list
      const homeInList = categoryList.filter(
        (c) => String(c?.categoryType || "").toUpperCase() === "HOME"
      ).length;

      const allInList = categoryList.filter(
        (c) => String(c?.categoryType || "").toUpperCase() === "ALL"
      ).length;

      const computedAllCount =
        allFromTypeCounts !== undefined
          ? Number(allFromTypeCounts)
          : allInList > 0
            ? allInList
            : categoryList.length;

      const computedHomeCount =
        homeFromTypeCounts !== undefined
          ? Number(homeFromTypeCounts)
          : homeInList;

      if (totalFromApi !== null) {
        setTotalCategoriesCount(totalFromApi);
      } else if (filter === "ALL" || totalCategoriesCount === 0) {
        setTotalCategoriesCount(categoryList.length);
      }

      if (allFromTypeCounts !== undefined) {
        setAllCategoriesCount(Number(allFromTypeCounts));
      } else if (filter === "ALL" || allCategoriesCount === 0) {
        setAllCategoriesCount(computedAllCount);
      }

      if (homeFromTypeCounts !== undefined) {
        setHomeCategoriesCount(Number(homeFromTypeCounts));
      } else {
        setHomeCategoriesCount(computedHomeCount);
      }
    } catch (error) {
      console.error("[CATEGORIES] Fetch Error:", error);

      setCategories([]);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load categories.";

      setErrorMessage(backendMessage);
    } finally {
      setLoading(false);
    }
  }, [
    filter,
    extractCategoryList,
    extractMetadata,
    totalCategoriesCount,
    allCategoriesCount,
  ]);

  // Fetch when filter or refreshCategories changes
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, refreshCategories]);

  // Reset pagination on search, filter, or entries change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, entries]);

  // ============================================================
  // SEARCH & FILTER
  // ============================================================

  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return categories.filter((item) => {
      const categoryName = String(
        item?.categoryName || item?.name || item?.category_name || item?.title || ""
      ).toLowerCase();
      const categoryType = String(
        item?.categoryType || item?.type || item?.category_type || ""
      ).toLowerCase();
      const categoryId = String(
        item?.categoryId ?? item?.id ?? item?.category_id ?? ""
      ).toLowerCase();

      if (!normalizedSearch) {
        return true;
      }

      return (
        categoryName.includes(normalizedSearch) ||
        categoryType.includes(normalizedSearch) ||
        categoryId.includes(normalizedSearch)
      );
    });
  }, [categories, search]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = useMemo(() => {
    return Math.ceil(filteredCategories.length / entries) || 1;
  }, [filteredCategories.length, entries]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * entries;

  const currentTableData = useMemo(() => {
    return filteredCategories.slice(startIndex, startIndex + entries);
  }, [filteredCategories, startIndex, entries]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleViewClick = (category) => {
    setCategoryToView(category);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setCategoryToView(null);
  };

  // ============================================================
  // EDIT CATEGORY MODAL HANDLERS
  // ============================================================

  const handleOpenEditModal = (category) => {
    if (typeof setSelectedCategory === "function") {
      setSelectedCategory(category);
    }

    setCategoryToEdit(category);
    setEditCategoryName(
      category?.categoryName ||
        category?.name ||
        category?.category_name ||
        category?.title ||
        ""
    );
    setEditCategoryType(
      category?.categoryType ||
        category?.type ||
        category?.category_type ||
        "HOME"
    );

    const imgUrl =
      category?.categoryImageUrl ||
      category?.categoryImage ||
      category?.image ||
      category?.photo ||
      "";

    setEditExistingImageUrl(imgUrl);
    setEditImagePreview(imgUrl);
    setEditSelectedFile(null);
    setEditLoading(false);
    setEditDragging(false);

    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }

    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    if (editLoading) return;

    if (editImagePreview && editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }

    setShowEditModal(false);
    setCategoryToEdit(null);
    setEditSelectedFile(null);
    setEditImagePreview("");
    setEditExistingImageUrl("");
  };

  const handleEditClick = (category) => {
    handleOpenEditModal(category);
  };

  // Image validation for Category Edit
  const validateCategoryEditImage = (file) => {
    if (!file) return false;

    const allowedMimeTypes = ["image/jpeg", "image/png"];
    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileName = file.name?.toLowerCase() || "";

    const hasValidMime = allowedMimeTypes.includes(file.type);
    const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!hasValidMime || !hasValidExt) {
      alert("Only JPG, JPEG and PNG images are allowed.");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Category image size cannot exceed 5 MB.");
      return false;
    }

    return true;
  };

  const handleEditFileSelect = (file) => {
    if (!file || editLoading) return;
    if (!validateCategoryEditImage(file)) return;

    if (editImagePreview && editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setEditImagePreview(previewUrl);
  };

  const handleEditFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleEditFileSelect(file);
    }
    event.target.value = "";
  };

  const handleEditRemoveImage = (event) => {
    event.stopPropagation();
    if (editLoading) return;

    if (editImagePreview && editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }

    setEditSelectedFile(null);

    if (editSelectedFile) {
      setEditImagePreview(editExistingImageUrl || "");
    } else {
      setEditImagePreview("");
      setEditExistingImageUrl("");
    }

    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  const handleSaveEditCategory = async () => {
    if (!editCategoryName.trim()) {
      alert("Category Name is required.");
      return;
    }

    if (!editCategoryType) {
      alert("Category Type is required.");
      return;
    }

    const catId =
      categoryToEdit?.categoryId ??
      categoryToEdit?.id ??
      categoryToEdit?.category_id;

    if (!catId) {
      alert("Category ID is missing.");
      return;
    }

    if (editLoading) return;

    let loggedInUserId =
      localStorage.getItem("userId") || localStorage.getItem("id");

    if (!loggedInUserId) {
      try {
        const userObj = JSON.parse(localStorage.getItem("user") || "{}");
        loggedInUserId = userObj.id || userObj.userId;
      } catch (err) {
        console.warn("Unable to parse stored user object.", err);
      }
    }

    if (!loggedInUserId) {
      loggedInUserId = "1";
    }

    const formData = new FormData();
    formData.append("categoryId", String(catId));
    formData.append("categoryName", editCategoryName.trim());
    formData.append("categoryType", editCategoryType);
    formData.append("updatedBy", String(loggedInUserId));

    if (editSelectedFile) {
      formData.append("categoryImage", editSelectedFile, editSelectedFile.name);
    }

    try {
      setEditLoading(true);
      const response = await updateCategory(formData);
      alert(response?.message || "Category updated successfully!");
      handleCloseEditModal();
      fetchCategories();
    } catch (error) {
      console.error("[CATEGORIES] Error updating category:", error);
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update category.";
      alert(msg);
    } finally {
      setEditLoading(false);
    }
  };

  // Cleanup object preview URL on unmount
  useEffect(() => {
    return () => {
      if (editImagePreview && editImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [editImagePreview]);

  const handleRefresh = () => {
    fetchCategories();
  };

  const handleImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.style.display = "none";

    const fallback = event.currentTarget.parentElement?.querySelector(
      ".cat-image-fallback"
    );

    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  const handleModalImageError = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.style.display = "none";

    const fallback = event.currentTarget.parentElement?.querySelector(
      ".modal-image-fallback"
    );

    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="cat-page">
      {/* ======================================================
          PAGE HEADER
      ======================================================= */}
      <div className="cat-page-header">
        <div className="cat-heading-left">
          <div className="cat-heading-icon">
            <FiLayers />
          </div>

          <div>
            <h1 className="cat-title">Categories Management</h1>
            <p className="cat-subtitle">
              Manage global categories and organize them across your outlets
            </p>
          </div>
        </div>

        <button
          type="button"
          className="cat-create-btn"
          onClick={() => navigate("/dashboard/createCategory")}
        >
          <span>+</span>
          Add Category
        </button>
      </div>

      {/* ======================================================
          STAT CARDS
      ======================================================= */}
      <div className="cat-stats-grid">
        {/* TOTAL */}
        <div className="cat-stat-card cat-stat-purple">
          <div className="cat-stat-icon">
            <FiLayers />
          </div>

          <div className="cat-stat-content">
            <span>Total Categories</span>
            <strong>{totalCategoriesCount}</strong>
            <small>Across all category types</small>
          </div>
        </div>

        {/* ALL */}
        <div className="cat-stat-card cat-stat-blue">
          <div className="cat-stat-icon">
            <FiLayers />
          </div>

          <div className="cat-stat-content">
            <span>All Categories</span>
            <strong>{allCategoriesCount}</strong>
            <small>Standard categories</small>
          </div>
        </div>

        {/* HOME */}
        <div className="cat-stat-card cat-stat-green">
          <div className="cat-stat-icon">
            <FiLayers />
          </div>

          <div className="cat-stat-content">
            <span>Home Categories</span>
            <strong>{homeCategoriesCount}</strong>
            <small>Home-specific categories</small>
          </div>
        </div>
      </div>

      {/* ======================================================
          CATEGORY MAIN CARD
      ======================================================= */}
      <div className="cat-main-card">
        {/* CARD HEADER */}
        <div className="cat-card-header">
          <div>
            <h2>Category List</h2>
            <p>View, search and manage your categories</p>
          </div>

          <button
            type="button"
            className="cat-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh category list"
          >
            <FiRefreshCw className={loading ? "cat-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="cat-toolbar">
          {/* Search Input */}
          <div className="cat-search-wrapper">
            <FiSearch className="cat-search-icon" />

            <input
              type="text"
              placeholder="Search category name or type..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                className="cat-search-clear"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          {/* Right Controls */}
          <div className="cat-toolbar-right">
            <div className="cat-results-count">
              <strong>{filteredCategories.length}</strong>
              <span>Results</span>
            </div>

            {/* Filter Dropdown */}
            <select
              className="cat-filter-select"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="HOME">Home Categories</option>
            </select>

            {/* Entries Per Page */}
            <select
              className="cat-entries-select"
              value={entries}
              onChange={(event) => setEntries(Number(event.target.value))}
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {errorMessage && (
          <div
            style={{
              margin: "0 20px 16px",
              padding: "12px 16px",
              backgroundColor: "#fff1f1",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              color: "#b91c1c",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "12px",
            }}
          >
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "16px",
                color: "#b91c1c",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* TABLE */}
        <div className="cat-table-container">
          <table className="cat-table">
            <thead>
              <tr>
                <th className="col-number">#</th>
                <th>Category</th>
                <th>Type</th>
                <th>Image</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* LOADING STATE */}
              {loading ? (
                Array.from({ length: Math.min(entries, 5) }).map((_, idx) => (
                  <tr key={`loading-${idx}`} className="cat-loading-row">
                    <td className="cat-id">
                      <span className="cat-skeleton small" />
                    </td>

                    <td>
                      <div className="cat-name-wrapper">
                        <div
                          className="cat-skeleton"
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 9,
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          <div className="cat-skeleton medium" />
                          <div
                            className="cat-skeleton small"
                            style={{
                              marginTop: 4,
                              width: 50,
                              height: 8,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="cat-skeleton type" />
                    </td>

                    <td className="cat-image-cell">
                      <div className="cat-skeleton image" />
                    </td>

                    <td>
                      <div className="cat-skeleton-actions">
                        <div className="cat-skeleton button" />
                        <div className="cat-skeleton button" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : currentTableData.length > 0 ? (
                /* DATA ROWS */
                currentTableData.map((category, index) => {
                  const categoryId =
                    category?.categoryId ??
                    category?.id ??
                    category?.category_id ??
                    "-";

                  const categoryName =
                    category?.categoryName ||
                    category?.name ||
                    category?.category_name ||
                    category?.title ||
                    "-";

                  const categoryType =
                    category?.categoryType ||
                    category?.type ||
                    category?.category_type ||
                    "-";

                  const imageUrl =
                    category?.categoryImageUrl ||
                    category?.categoryImage ||
                    category?.imageUrl ||
                    category?.image ||
                    category?.photo ||
                    "";

                  const isHome =
                    String(categoryType).toUpperCase() === "HOME";

                  const initial =
                    categoryName && categoryName !== "-"
                      ? categoryName.trim().charAt(0).toUpperCase()
                      : "C";

                  return (
                    <tr key={category?.categoryId ?? category?.id ?? category?.category_id ?? index}>
                      {/* NUMBER */}
                      <td className="cat-id">
                        <span>{startIndex + index + 1}</span>
                      </td>

                      {/* CATEGORY NAME & ID */}
                      <td>
                        <div className="cat-name-wrapper">
                          <div className="cat-name-avatar">{initial}</div>

                          <div>
                            <div className="cat-name" title={categoryName}>
                              {categoryName}
                            </div>

                            <div className="cat-id-text">
                              ID: {categoryId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY TYPE BADGE */}
                      <td>
                        <span
                          className={`cat-type-badge ${
                            isHome ? "home" : "all"
                          }`}
                        >
                          <span className="cat-type-dot" />
                          {categoryType}
                        </span>
                      </td>

                      {/* IMAGE */}
                      <td className="cat-image-cell">
                        <div className="cat-image-wrapper">
                          {imageUrl ? (
                            <>
                              <img
                                src={imageUrl}
                                alt={categoryName}
                                className="cat-image"
                                onError={handleImageError}
                              />

                              <div
                                className="cat-image-fallback"
                                style={{ display: "none" }}
                              >
                                <FiImage />
                              </div>
                            </>
                          ) : (
                            <div className="cat-image-fallback">
                              <FiImage />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td>
                        <div className="cat-actions">
                          {/* VIEW DETAILS */}
                          <button
                            type="button"
                            className="cat-action-btn cat-view-btn"
                            title="View Details"
                            onClick={() => handleViewClick(category)}
                          >
                            <FiEye />
                          </button>

                          {/* EDIT CATEGORY */}
                          <button
                            type="button"
                            className="cat-action-btn cat-edit-btn"
                            title="Edit Category"
                            onClick={() => handleEditClick(category)}
                          >
                            <FiEdit2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* EMPTY STATE */
                <tr>
                  <td colSpan={5} className="cat-empty-cell">
                    <div className="cat-empty-state">
                      <div className="cat-empty-icon">
                        <FiLayers />
                      </div>

                      <h3>No Categories Found</h3>

                      <p>
                        {search
                          ? `No categories match "${search}".`
                          : "No categories are currently available for this filter."}
                      </p>

                      {(search || filter !== "ALL") && (
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setFilter("ALL");
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="cat-footer">
          <div className="cat-footer-info">
            Showing{" "}
            <strong>
              {filteredCategories.length > 0 ? startIndex + 1 : 0}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(startIndex + entries, filteredCategories.length)}
            </strong>{" "}
            of <strong>{filteredCategories.length}</strong> entries
          </div>

          <div className="pagination-controls">
            {/* PREVIOUS BUTTON */}
            <button
              type="button"
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              title="Previous Page"
            >
              &lt;
            </button>

            {/* PAGE BUTTONS */}
            {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .filter((pageNumber) => {
                if (totalPages <= 7) return true;
                if (pageNumber === 1 || pageNumber === totalPages) return true;
                if (Math.abs(pageNumber - currentPage) <= 1) return true;
                return false;
              })
              .reduce((acc, pageNumber, idx, arr) => {
                if (idx > 0 && pageNumber - arr[idx - 1] > 1) {
                  acc.push(
                    <span key={`dots-${pageNumber}`} className="pagination-dots">
                      ...
                    </span>
                  );
                }
                acc.push(
                  <button
                    type="button"
                    key={pageNumber}
                    className={`page-btn ${
                      currentPage === pageNumber ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={loading}
                  >
                    {pageNumber}
                  </button>
                );
                return acc;
              }, [])}

            {/* NEXT BUTTON */}
            <button
              type="button"
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || loading}
              title="Next Page"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          VIEW CATEGORY DETAILS MODAL
      ======================================================== */}
      {showViewModal && categoryToView && (
        <div
          className="category-modal-overlay"
          onClick={handleCloseViewModal}
        >
          <div
            className="category-modal"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="category-modal-header">
              <div className="modal-title-area">
                <div className="modal-title-icon">
                  <FiLayers />
                </div>

                <div>
                  <h3>Category Details</h3>
                  <p>View complete category information</p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseViewModal}
                title="Close"
              >
                <FiX />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="category-modal-body">
              {/* IMAGE SECTION */}
              <div className="modal-image-section">
                {categoryToView?.categoryImageUrl ||
                categoryToView?.categoryImage ||
                categoryToView?.image ||
                categoryToView?.photo ? (
                  <>
                    <img
                      src={
                        categoryToView.categoryImageUrl ||
                        categoryToView.categoryImage ||
                        categoryToView.image ||
                        categoryToView.photo
                      }
                      alt={categoryToView?.categoryName || "Category"}
                      className="modal-category-image"
                      onError={handleModalImageError}
                    />

                    <div
                      className="modal-image-fallback"
                      style={{ display: "none" }}
                    >
                      <FiImage />
                    </div>
                  </>
                ) : (
                  <div className="modal-image-fallback">
                    <FiImage />
                  </div>
                )}
              </div>

              {/* DETAILS SECTION */}
              <div className="modal-details">
                <div className="modal-detail-card">
                  <span>Category ID</span>
                  <strong>
                    {categoryToView?.categoryId ??
                      categoryToView?.id ??
                      categoryToView?.category_id ??
                      "-"}
                  </strong>
                </div>

                <div className="modal-detail-card">
                  <span>Category Name</span>
                  <strong>
                    {categoryToView?.categoryName ||
                      categoryToView?.name ||
                      categoryToView?.category_name ||
                      categoryToView?.title ||
                      "-"}
                  </strong>
                </div>

                <div className="modal-detail-card">
                  <span>Category Type</span>
                  <strong>
                    {categoryToView?.categoryType ||
                      categoryToView?.type ||
                      categoryToView?.category_type ||
                      "-"}
                  </strong>
                </div>

                <div className="modal-detail-card">
                  <span>Created By</span>
                  <strong>
                    {categoryToView?.createdBy ||
                      categoryToView?.created_by ||
                      categoryToView?.createdByName ||
                      "Sudheer Admin"}
                  </strong>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="category-modal-footer">
              <button
                type="button"
                className="modal-back-btn"
                onClick={handleCloseViewModal}
              >
                Back
              </button>

              <button
                type="button"
                className="modal-edit-btn"
                onClick={() => {
                  const targetCategory = categoryToView;
                  handleCloseViewModal();
                  handleOpenEditModal(targetCategory);
                }}
              >
                <FiEdit2 />
                <span>Edit Category</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          EDIT CATEGORY MODAL / CARD
      ======================================================== */}
      {showEditModal && categoryToEdit && (
        <div
          className="category-modal-overlay"
          onClick={handleCloseEditModal}
        >
          <div
            className="category-modal category-edit-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="category-modal-header">
              <div className="modal-title-area">
                <div className="modal-title-icon category-edit-icon">
                  <FiEdit2 />
                </div>

                <div>
                  <h3>Edit Category</h3>
                  <p>Update category details and image</p>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseEditModal}
                disabled={editLoading}
                title="Close"
              >
                <FiX />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="category-edit-modal-body">
              {/* CATEGORY ID BADGE */}
              <div className="category-edit-id-badge">
                <span>Category ID:</span>
                <strong>
                  #{categoryToEdit?.categoryId ??
                    categoryToEdit?.id ??
                    categoryToEdit?.category_id ??
                    "-"}
                </strong>
              </div>

              {/* FORM FIELDS ROW */}
              <div className="category-edit-form-row">
                {/* Category Name */}
                <div className="category-edit-form-group">
                  <label>
                    Category Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    disabled={editLoading}
                    className="category-edit-input"
                  />
                </div>

                {/* Category Type */}
                <div className="category-edit-form-group">
                  <label>
                    Category Type <span className="required-star">*</span>
                  </label>
                  <select
                    value={editCategoryType}
                    onChange={(e) => setEditCategoryType(e.target.value)}
                    disabled={editLoading}
                    className="category-edit-select"
                  >
                    <option value="HOME">HOME</option>
                    <option value="ALL">ALL</option>
                  </select>
                </div>
              </div>

              {/* CATEGORY IMAGE SECTION */}
              <div className="category-edit-form-group">
                <label>Category Profile Image</label>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={editFileInputRef}
                  style={{ display: "none" }}
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  onChange={handleEditFileChange}
                  disabled={editLoading}
                />

                {!editImagePreview ? (
                  /* DROPZONE */
                  <div
                    className={`category-edit-dropzone ${
                      editDragging ? "dragging" : ""
                    }`}
                    onClick={() => {
                      if (!editLoading) editFileInputRef.current?.click();
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!editLoading) setEditDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setEditDragging(false);
                      if (editLoading) return;
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleEditFileSelect(file);
                    }}
                    style={{
                      cursor: editLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    <div className="category-edit-dropzone-content">
                      <FiUploadCloud className="category-edit-upload-icon" />
                      <p>
                        Drag and drop your image here, or <strong>browse</strong>
                      </p>
                      <small>Supports JPG, JPEG, PNG (Max 5 MB)</small>
                    </div>
                  </div>
                ) : (
                  /* PREVIEW CARD */
                  <div className="category-edit-preview-card">
                    <div className="category-edit-thumb-wrapper">
                      <img
                        src={editImagePreview}
                        alt="Category Preview"
                        className="category-edit-thumb"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fb = e.currentTarget.parentElement?.querySelector(
                            ".category-edit-thumb-fallback"
                          );
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                      <div
                        className="category-edit-thumb-fallback"
                        style={{ display: "none" }}
                      >
                        <FiImage />
                      </div>
                    </div>

                    <div className="category-edit-preview-info">
                      {editSelectedFile ? (
                        <>
                          <div className="category-edit-preview-badge">
                            New Image Selected
                          </div>
                          <strong>{editSelectedFile.name}</strong>
                          <small>
                            {(editSelectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                            MB • {editSelectedFile.type}
                          </small>
                        </>
                      ) : (
                        <>
                          <div className="category-edit-preview-badge current-badge">
                            Current Image
                          </div>
                          <strong>Existing Category Image</strong>
                          <small>Preserves current server image</small>
                        </>
                      )}

                      <div className="category-edit-preview-actions">
                        <button
                          type="button"
                          className="category-edit-change-img-btn"
                          onClick={() => {
                            if (!editLoading) editFileInputRef.current?.click();
                          }}
                          disabled={editLoading}
                        >
                          <FiUploadCloud size={13} />
                          <span>Change Image</span>
                        </button>

                        <button
                          type="button"
                          className="category-edit-remove-img-btn"
                          onClick={handleEditRemoveImage}
                          disabled={editLoading}
                        >
                          <FiX size={13} />
                          <span>
                            {editSelectedFile ? "Cancel New Image" : "Remove"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="category-modal-footer">
              <button
                type="button"
                className="modal-back-btn"
                onClick={handleCloseEditModal}
                disabled={editLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-edit-btn category-edit-submit-btn"
                onClick={handleSaveEditCategory}
                disabled={editLoading}
              >
                {editLoading ? (
                  <>
                    <FiRefreshCw className="cat-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <FiEdit2 />
                    <span>Update Category</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PROP TYPES
// ============================================================

Categories.propTypes = {
  refreshCategories: PropTypes.any,
  setSelectedCategory: PropTypes.func,
};

export default Categories;