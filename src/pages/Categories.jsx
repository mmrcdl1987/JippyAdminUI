import "../styles/Categories.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEdit2, FiEye, FiX } from "react-icons/fi";
import { getHomeOrAllCategories } from "../services/categoryService";

function Categories({ refreshCategories, setSelectedCategory }) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  
  // View Modal States
  const [showViewModal, setShowViewModal] = useState(false);
  const [categoryToView, setCategoryToView] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await getHomeOrAllCategories(filter);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [filter, refreshCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const filteredCategories = categories.filter((item) =>
    item.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / entries) || 1;
  const startIndex = (currentPage - 1) * entries;
  const currentTableData = filteredCategories.slice(startIndex, startIndex + entries);

  const handleViewClick = (category) => {
    setCategoryToView(category);
    setShowViewModal(true);
  };

  return (
    <div className="cat-page">
      <div className="cat-top-header">
        <div>
          <h2 className="cat-title">Categories Management</h2>
          <p className="cat-subtitle">Manage global categories and link them to outlets</p>
        </div>
        <button
          className="cat-create-btn"
          onClick={() => navigate("/dashboard/createCategory")}
        >
          + Add Category
        </button>
      </div>

      <div className="cat-card">
        <div className="cat-toolbar">
          <div className="cat-search">
            <FiSearch className="cat-search-icon" />
            <input
              type="text"
              placeholder="Search by category name or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="cat-filter-right">
            <select
              className="cat-filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All Filters</option>
              <option value="HOME">Home Categories</option>
            </select>
          </div>
        </div>

        <div className="cat-table-wrapper">
          <table className="cat-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category Name</th>
                <th>Category Type</th>
                <th>Image</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTableData.length > 0 ? (
                currentTableData.map((category, index) => (
                  <tr key={category.categoryId || index}>
                    <td className="cat-id">{startIndex + index + 1}</td>
                    <td className="cat-name">{category.categoryName}</td>
                    <td>
                      <span className="cat-type">{category.categoryType}</span>
                    </td>
                    <td className="cat-image-cell">
                      <img
                        src={category.categoryImageUrl}
                        alt={category.categoryName}
                        className="cat-image"
                      />
                    </td>
                    <td>{category.createdAt || "10 May 2025 10:30 AM"}</td>
                    <td>
                      <div className="cat-actions">
                        <button
                          type="button"
                          className="cat-view-btn"
                          title="View Details"
                          onClick={() => handleViewClick(category)}
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="cat-edit-btn"
                          title="Edit"
                          onClick={() => {
                            if (typeof setSelectedCategory === "function") {
                              setSelectedCategory(category);
                            }
                            navigate("/dashboard/editCategory");
                          }}
                        >
                          <FiEdit2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="cat-empty">
                    No Categories Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="cat-footer">
          <span>
            Showing {filteredCategories.length > 0 ? startIndex + 1 : 0} to{" "}
            {Math.min(startIndex + entries, filteredCategories.length)} of {filteredCategories.length} entries
          </span>
          <div className="pagination-controls">
            <button 
              className="page-btn" 
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                className={`page-btn ${currentPage === pageNumber ? "active" : ""}`}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </button>
            ))}

            <button 
              className="page-btn" 
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* --- View Category Details Modal --- */}
      {showViewModal && categoryToView && (
        <div className="modal-backdrop">
          <div className="view-modal-container screen-fit-modal">
            <div className="modal-header-flex">
              <h3>Category Details</h3>
              <button className="close-modal-btn" onClick={() => setShowViewModal(false)}>
                <FiX />
              </button>
            </div>

            <div className="category-card view-card-layout-responsive">
              <div className="view-image-pane">
                <img
                  src={categoryToView.categoryImageUrl || "https://via.placeholder.com/150"}
                  alt={categoryToView.categoryName}
                  className="large-preview-image-enhanced"
                />
              </div>

              <div className="view-details-pane-enhanced">
                <div className="detail-row"><span>Category ID</span>: <strong>{categoryToView.categoryId}</strong></div>
                <div className="detail-row"><span>Category Name</span>: <strong>{categoryToView.categoryName}</strong></div>
                <div className="detail-row"><span>Category Type</span>: <strong>{categoryToView.categoryType}</strong></div>
                <div className="detail-row"><span>Created At</span>: <strong>{categoryToView.createdAt || "10 May 2025 10:30 AM"}</strong></div>
                <div className="detail-row"><span>Created By</span>: <strong>{categoryToView.createdBy || "Sudheer Admin"}</strong></div>

                <div className="button-group-right" style={{ marginTop: "30px" }}>
                  <button className="save-btn font-lg-btn" onClick={() => setShowViewModal(false)}>
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