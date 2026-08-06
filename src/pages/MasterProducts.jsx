import "../styles/MasterProducts.css";
import MasterProductsTable from "../components/masterProducts/MasterProductsTable";
import { useState, useEffect } from "react";

import {
  getAllMasterProducts,
  getMasterProductById,
  deleteMasterProduct,
  filterMasterProducts,
  searchMasterProducts
} from "../services/masterProductsService";

function MasterProducts({
  setActivePage,
  setSelectedProduct,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pagination State (Spring Data JPA uses 0-based page indexes)
  const [page, setPage] = useState(0); 
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Statistics calculation across currently displayed items
  const totalVeg = products.filter((p) => p.veg === 1).length;
  const totalNonVeg = products.filter((p) => p.nonVeg === 1).length;
  const totalPublished = products.filter((p) => p.publish === 1).length;

  // Helper to extract list from API response
  const extractProductList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    return [];
  };

  // Fetch paginated products from API
  const fetchProducts = async (pageNumber = page) => {
    try {
      setLoading(true);
      const response = await getAllMasterProducts(pageNumber, pageSize);
      const data = response.data;

      const list = extractProductList(data);
      setProducts(list);

      if (data && typeof data.totalPages === "number") {
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } else {
        setTotalPages(Math.ceil(list.length / pageSize) || 1);
        setTotalElements(list.length);
      }
    } catch (error) {
      console.error("Failed to fetch master products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch new page when `page` changes
  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  // Page Handlers
  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage((prevPage) => prevPage - 1);
    }
  };

  // Filter Master Products
  const handleFilter = async (type) => {
    try {
      setActiveFilter(type);
      const response = await filterMasterProducts(type);
      const list = extractProductList(response.data);
      
      setProducts(list);
      setPage(0);
      setTotalPages(Math.ceil(list.length / pageSize) || 1);
      setTotalElements(list.length);
    } catch (error) {
      console.error("Filter failed:", error);
    }
  };

  // Search Master Products
  const handleSearch = async (keyword) => {
    try {
      setSearchKeyword(keyword);
      if (keyword.trim() === "") {
        fetchProducts(0);
        return;
      }
      const response = await searchMasterProducts(keyword);
      const list = extractProductList(response.data);

      setProducts(list);
      setPage(0);
      setTotalPages(Math.ceil(list.length / pageSize) || 1);
      setTotalElements(list.length);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // Edit Product Handler
  const handleEdit = async (masterProductId) => {
    try {
      const response = await getMasterProductById(masterProductId);
      setSelectedProduct(response.data);
      setActivePage("editMasterProduct");
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  // Delete Product Handler
  const handleDelete = async (masterProductId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteMasterProduct(masterProductId);
      fetchProducts(page);
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <div className="master-products-page">
      <div className="master-header">
        <div className="master-left">
          <p className="master-tag">PRODUCT CATALOGUE</p>
          <h1 className="master-heading">
            Master Products <span>Library</span>
          </h1>
          <p className="master-text">
            Manage the global master product catalogue. Add, edit, filter by Veg/Non-Veg, or bulk-import via Excel. Compare files to detect duplicates before adding.
          </p>
        </div>

        <div className="master-right">
          <button
            className="compare-btn"
            onClick={() => setActivePage("compareFile")}
          >
            🔍 Compare File
          </button>
          <button
            className="add-product-btn"
            onClick={() => setActivePage("createMasterProduct")}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-container">
        <div className="stat-box">
          <div className="stat-emoji">📦</div>
          <div>
            <h2>{totalElements}</h2>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-emoji">🥦</div>
          <div>
            <h2>{totalVeg}</h2>
            <p>Veg (Page)</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-emoji">🍗</div>
          <div>
            <h2>{totalNonVeg}</h2>
            <p>Non-Veg (Page)</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-emoji">✅</div>
          <div>
            <h2>{totalPublished}</h2>
            <p>Published (Page)</p>
          </div>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="master-toolbar">
        <div className="master-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-right">
          <button
            className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => handleFilter("all")}
          >
            All
          </button>

          <button
            className={`filter-btn ${activeFilter === "veg" ? "active" : ""}`}
            onClick={() => handleFilter("veg")}
          >
            🥦 Veg
          </button>

          <button
            className={`filter-btn ${activeFilter === "nonveg" ? "active" : ""}`}
            onClick={() => handleFilter("nonveg")}
          >
            🍗 Non-Veg
          </button>

          <button className="refresh-btn" onClick={() => fetchProducts(page)}>
            ↻
          </button>
        </div>
      </div>

      {/* Product Table */}
      <MasterProductsTable
        products={products}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      {/* Server-Side Pagination Bar */}
      <div
        className="pagination-container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          padding: "12px 16px",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}
      >
        <p className="pagination-info" style={{ color: "#666", fontSize: "14px", margin: 0 }}>
          Page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong> ({totalElements} total products)
        </p>

        <div className="pagination-buttons" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={handlePrevPage}
            disabled={page === 0 || loading}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: page === 0 || loading ? "#f5f5f5" : "#fff",
              cursor: page === 0 || loading ? "not-allowed" : "pointer",
              fontWeight: "500"
            }}
          >
            Previous
          </button>

          <span style={{ fontSize: "14px", fontWeight: "600" }}>
            {page + 1} / {totalPages || 1}
          </span>

          <button
            onClick={handleNextPage}
            disabled={page >= totalPages - 1 || loading}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: page >= totalPages - 1 || loading ? "#f5f5f5" : "#fff",
              cursor: page >= totalPages - 1 || loading ? "not-allowed" : "pointer",
              fontWeight: "500"
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default MasterProducts;