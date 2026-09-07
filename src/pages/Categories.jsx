import "../styles/Categories.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiEdit2,
  FiEye,
  FiX,
  FiImage,
} from "react-icons/fi";
import { getHomeOrAllCategories } from "../services/categoryService";

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
  const allCategoriesCount = categories.length;

const homeCategoriesCount = categories.filter(
  (item) =>
    item?.categoryType?.toUpperCase() === "HOME"
).length;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // View modal
  const [showViewModal, setShowViewModal] =
    useState(false);
  const [categoryToView, setCategoryToView] =
    useState(null);

  // Loading
  const [loading, setLoading] = useState(false);

  // ============================================================
  // FETCH CATEGORIES
  // ============================================================
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response =
        await getHomeOrAllCategories(filter);

      console.log(
        "GET CATEGORIES RESPONSE:",
        response
      );

      /*
       * Expected response:
       *
       * {
       *   data: {
       *     data: [...]
       *   }
       * }
       *
       * But handle a few possible response shapes safely.
       */

      const categoryData =
        response?.data?.data ||
        response?.data ||
        [];

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : []
      );

    } catch (error) {
      console.error(
        "ERROR FETCHING CATEGORIES:",
        error
      );

      setCategories([]);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH WHEN FILTER / REFRESH CHANGES
  // ============================================================
  useEffect(() => {
    fetchCategories();
  }, [filter, refreshCategories]);

  // ============================================================
  // RESET PAGINATION
  // ============================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter, entries]);

  // ============================================================
  // SEARCH + FILTER
  // ============================================================
  const normalizedSearch =
    search.trim().toLowerCase();

  const filteredCategories =
    categories.filter((item) => {
      const categoryName =
        item?.categoryName
          ?.toLowerCase() || "";

      const categoryType =
        item?.categoryType
          ?.toLowerCase() || "";

      return (
        categoryName.includes(
          normalizedSearch
        ) ||
        categoryType.includes(
          normalizedSearch
        )
      );
    });

  // ============================================================
  // PAGINATION
  // ============================================================
  const totalPages =
    Math.ceil(
      filteredCategories.length / entries
    ) || 1;

  // Safety if filtering reduces total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    (currentPage - 1) * entries;

  const currentTableData =
    filteredCategories.slice(
      startIndex,
      startIndex + entries
    );

  // ============================================================
  // VIEW CATEGORY
  // ============================================================
  const handleViewClick = (category) => {
    setCategoryToView(category);
    setShowViewModal(true);
  };

  // ============================================================
  // CLOSE VIEW MODAL
  // ============================================================
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setCategoryToView(null);
  };

  // ============================================================
  // EDIT CATEGORY
  // ============================================================
  const handleEditClick = (category) => {
    console.log(
      "EDIT CATEGORY:",
      category
    );

    /*
     * Pass the complete category object.
     *
     * Important:
     * categoryImageUrl contains the existing S3 image URL.
     * EditCategory uses this URL to display the existing image.
     */

    if (
      typeof setSelectedCategory ===
      "function"
    ) {
      setSelectedCategory(category);
    }

    navigate(
      "/dashboard/editCategory"
    );
  };

  // ============================================================
  // IMAGE FALLBACK
  // ============================================================
  const handleImageError = (event) => {
    /*
     * Prevent infinite error loops.
     */
    event.currentTarget.onerror = null;

    event.currentTarget.style.display =
      "none";

    const fallback =
      event.currentTarget.parentElement?.querySelector(
        ".cat-image-fallback"
      );

    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  // ============================================================
  // VIEW MODAL IMAGE ERROR
  // ============================================================
  const handleModalImageError = (
    event
  ) => {
    event.currentTarget.style.display =
      "none";

    const fallback =
      event.currentTarget.parentElement?.querySelector(
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
          TOP HEADER
          ====================================================== */}
      <div className="cat-top-header">

        <div>
          <h2 className="cat-title">
            Categories Management
          </h2>

          <p className="cat-subtitle">
            Manage global categories and
            link them to outlets
          </p>
        </div>

        <button
          type="button"
          className="cat-create-btn"
          onClick={() =>
            navigate(
              "/dashboard/createCategory"
            )
          }
        >
          + Add Category
        </button>

      </div>

      {/* ======================================================
          CATEGORY CARD
          ====================================================== */}
      <div className="cat-card">

        {/* ====================================================
    CATEGORY COUNTS
    ==================================================== */}
<div className="category-counts">

  {/* ALL COUNT */}
  <div className="category-count-card">
    <div className="category-count-content">
      <span className="category-count-label">
        Categories
      </span>

      <strong className="category-count-value">
        {allCategoriesCount}
      </strong>
    </div>
  </div>

</div>

        {/* ====================================================
            TOOLBAR
            ==================================================== */}
        <div className="cat-toolbar">

          {/* Search */}
          <div className="cat-search">

            <FiSearch className="cat-search-icon" />

            <input
              type="text"
              placeholder="Search by category name or type..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          {/* Filter */}
          <div className="cat-filter-right">

            <select
              className="cat-filter-select"
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
            >

              <option value="ALL">
                All
              </option>

              <option value="HOME">
                Home Categories
              </option>

            </select>

          </div>

        </div>

        {/* ====================================================
            TABLE
            ==================================================== */}
        <div className="cat-table-wrapper">

          <table className="cat-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Category Type</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {/* Loading */}
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="cat-empty"
                  >
                    Loading categories...
                  </td>
                </tr>

              ) : currentTableData.length >
                0 ? (

                currentTableData.map(
                  (category, index) => {

                    const imageUrl =
                      category?.categoryImageUrl ||
                      "";

                    return (
                      <tr
                        key={
                          category?.categoryId ||
                          index
                        }
                      >

                        {/* Number */}
                        <td className="cat-id">
                          {startIndex +
                            index +
                            1}
                        </td>

                        {/* Category Name */}
                        <td className="cat-name">
                          {
                            category?.categoryName ||
                            "-"
                          }
                        </td>

                        {/* Category Type */}
                        <td>
                          <span className="cat-type">
                            {
                              category?.categoryType ||
                              "-"
                            }
                          </span>
                        </td>

                        {/* Image */}
                        <td className="cat-image-cell">

                          <div
                            style={{
                              width: "50px",
                              height: "50px",
                              position:
                                "relative",
                            }}
                          >

                            {imageUrl ? (
                              <>
                                <img
                                  src={imageUrl}
                                  alt={
                                    category?.categoryName ||
                                    "Category"
                                  }
                                  className="cat-image"
                                  onError={
                                    handleImageError
                                  }
                                />

                                <div
                                  className="cat-image-fallback"
                                  style={{
                                    display:
                                      "none",
                                    width: "50px",
                                    height: "50px",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                    borderRadius:
                                      "8px",
                                    background:
                                      "#f3f4f6",
                                    border:
                                      "1px solid #ddd",
                                  }}
                                >
                                  <FiImage
                                    size={20}
                                  />
                                </div>
                              </>
                            ) : (
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  borderRadius:
                                    "8px",
                                  background:
                                    "#f3f4f6",
                                  border:
                                    "1px solid #ddd",
                                }}
                              >
                                <FiImage
                                  size={20}
                                />
                              </div>
                            )}

                          </div>

                        </td>

                        {/* Actions */}
                        <td>

                          <div className="cat-actions">

                            {/* View */}
                            <button
                              type="button"
                              className="cat-view-btn"
                              title="View Details"
                              onClick={() =>
                                handleViewClick(
                                  category
                                )
                              }
                            >
                              <FiEye />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              className="cat-edit-btn"
                              title="Edit"
                              onClick={() =>
                                handleEditClick(
                                  category
                                )
                              }
                            >
                              <FiEdit2 />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                /* No categories */
                <tr>
                  <td
                    colSpan={5}
                    className="cat-empty"
                  >
                    No Categories Found
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* ====================================================
            FOOTER / PAGINATION
            ==================================================== */}
        <div className="cat-footer">

          {/* Entries information */}
          <span>
            Showing{" "}
            {filteredCategories.length >
              0
              ? startIndex + 1
              : 0}{" "}
            to{" "}
            {Math.min(
              startIndex + entries,
              filteredCategories.length
            )}{" "}
            of{" "}
            {filteredCategories.length}{" "}
            entries
          </span>

          <div className="pagination-controls">

            {/* Previous */}
            <button
              type="button"
              className="page-btn"
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.max(
                      previous - 1,
                      1
                    )
                )
              }
              disabled={
                currentPage === 1
              }
            >
              &lt;
            </button>

            {/* Page Numbers */}
            {Array.from(
              {
                length: totalPages,
              },
              (_, index) =>
                index + 1
            ).map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={`page-btn ${currentPage ===
                      pageNumber
                      ? "active"
                      : ""
                    }`}
                  onClick={() =>
                    setCurrentPage(
                      pageNumber
                    )
                  }
                >
                  {pageNumber}
                </button>
              )
            )}

            {/* Next */}
            <button
              type="button"
              className="page-btn"
              onClick={() =>
                setCurrentPage(
                  (previous) =>
                    Math.min(
                      previous + 1,
                      totalPages
                    )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
            >
              &gt;
            </button>

          </div>

        </div>

      </div>

      {/* ========================================================
          VIEW CATEGORY DETAILS MODAL
          ======================================================== */}
      {showViewModal &&
        categoryToView && (

          <div
            className="modal-backdrop"
            onClick={
              handleCloseViewModal
            }
          >

            <div
              className="view-modal-container screen-fit-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              {/* Modal Header */}
              <div className="modal-header-flex">

                <h3>
                  Category Details
                </h3>

                <button
                  type="button"
                  className="close-modal-btn"
                  onClick={
                    handleCloseViewModal
                  }
                  title="Close"
                >
                  <FiX />
                </button>

              </div>

              {/* Category Details */}
              <div className="category-card view-card-layout-responsive">

                {/* Image */}
                <div className="view-image-pane">

                  {categoryToView?.categoryImageUrl ? (
                    <>
                      <img
                        src={
                          categoryToView.categoryImageUrl
                        }
                        alt={
                          categoryToView?.categoryName ||
                          "Category"
                        }
                        className="large-preview-image-enhanced"
                        onError={
                          handleModalImageError
                        }
                      />

                      <div
                        className="modal-image-fallback"
                        style={{
                          display: "none",
                          width: "180px",
                          height: "180px",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          borderRadius:
                            "10px",
                          background:
                            "#f3f4f6",
                          border:
                            "1px solid #ddd",
                        }}
                      >
                        <FiImage
                          size={50}
                        />
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        width: "180px",
                        height: "180px",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        borderRadius:
                          "10px",
                        background:
                          "#f3f4f6",
                        border:
                          "1px solid #ddd",
                      }}
                    >
                      <FiImage
                        size={50}
                      />
                    </div>
                  )}

                </div>

                {/* Details */}
                <div className="view-details-pane-enhanced">

                  <div className="detail-row">
                    <span>
                      Category ID
                    </span>
                    :{" "}
                    <strong>
                      {
                        categoryToView?.categoryId ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>
                      Category Name
                    </span>
                    :{" "}
                    <strong>
                      {
                        categoryToView?.categoryName ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>
                      Category Type
                    </span>
                    :{" "}
                    <strong>
                      {
                        categoryToView?.categoryType ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>
                      Created By
                    </span>
                    :{" "}
                    <strong>
                      {
                        categoryToView?.createdBy ||
                        "Sudheer Admin"
                      }
                    </strong>
                  </div>

                  {/* Back */}
                  <div
                    className="button-group-right"
                    style={{
                      marginTop:
                        "30px",
                    }}
                  >

                    <button
                      type="button"
                      className="save-btn font-lg-btn"
                      onClick={
                        handleCloseViewModal
                      }
                    >
                      Back
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

export default Categories;