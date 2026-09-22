import "../styles/MasterProducts.css";
import MasterProductsTable from "../components/masterProducts/MasterProductsTable";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import {
  getAllMasterProducts,
  getMasterProductById,
  deleteMasterProduct,
  updateProductActiveStatusByProductType,
} from "../services/masterProductsService";

function MasterProducts({ setSelectedProduct }) {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [updatingProductId, setUpdatingProductId] = useState(null);

  // Prevent duplicate toggle requests
  const toggleLockRef = useRef(null);

  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Filters
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  // ============================================================
  // EXTRACT PRODUCT LIST
  // ============================================================

  const extractProductList = useCallback((data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.content)) {
      return data.content;
    }

    return [];
  }, []);

  // ============================================================
  // NORMALIZE PRODUCT
  // ============================================================

  const normalizeProduct = useCallback((product) => {
    if (!product || typeof product !== "object") {
      return product;
    }

    // ----------------------------------------------------------
    // VEG
    // ----------------------------------------------------------

    const isVeg =
      product.isVeg === true ||
      product.isVeg === 1 ||
      product.isVeg === "1" ||
      product.isVeg === "true" ||
      product.isVeg === "Y" ||
      product.isVeg === "y";

    // ----------------------------------------------------------
    // ACTIVE
    // ----------------------------------------------------------

    const isActive =
      product.isActive === true ||
      product.isActive === 1 ||
      product.isActive === "1" ||
      product.isActive === "Y" ||
      product.isActive === "y";

    return {
      ...product,

      isVeg,
      isActive: isActive ? "Y" : "N",

      // Compatibility
      veg: isVeg ? 1 : 0,
      nonVeg: isVeg ? 0 : 1,

      publish: isActive ? 1 : 0,
    };
  }, []);

  // ============================================================
  // FETCH ALL MASTER PRODUCTS
  // ============================================================

  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // --------------------------------------------------------
      // FIRST PAGE
      // --------------------------------------------------------

      const firstResponse = await getAllMasterProducts(
        0,
        pageSize
      );

      const firstData = firstResponse?.data;

      const firstList = extractProductList(firstData);

      let combinedProducts = [...firstList];

      // --------------------------------------------------------
      // TOTAL API PAGES
      // --------------------------------------------------------

      const totalPagesFromApi =
        firstData &&
          typeof firstData.totalPages === "number"
          ? firstData.totalPages
          : 1;

      // --------------------------------------------------------
      // LOAD REMAINING API PAGES
      // --------------------------------------------------------

      if (totalPagesFromApi > 1) {
        for (
          let currentPage = 1;
          currentPage < totalPagesFromApi;
          currentPage += 1
        ) {
          try {
            const response = await getAllMasterProducts(
              currentPage,
              pageSize
            );

            const data = response?.data;

            const list = extractProductList(data);

            combinedProducts = [
              ...combinedProducts,
              ...list,
            ];
          } catch (pageError) {
            console.error(
              `Failed to load master product page ${currentPage}:`,
              pageError
            );
          }
        }
      }

      // --------------------------------------------------------
      // NORMALIZE
      // --------------------------------------------------------

      const normalizedProducts =
        combinedProducts.map(normalizeProduct);

      // --------------------------------------------------------
      // REMOVE DUPLICATE MASTER PRODUCT IDS
      // --------------------------------------------------------

      const uniqueProducts = [];
      const productIds = new Set();

      normalizedProducts.forEach((product) => {
        const id = product?.masterProductId;

        if (id === undefined || id === null) {
          uniqueProducts.push(product);
          return;
        }

        if (!productIds.has(id)) {
          productIds.add(id);
          uniqueProducts.push(product);
        }
      });

      // --------------------------------------------------------
      // SET PRODUCTS
      // --------------------------------------------------------

      setAllProducts(uniqueProducts);

      // --------------------------------------------------------
      // KEEP CURRENT PAGE VALID
      // --------------------------------------------------------

      setPage((currentPage) => {
        const totalUiPages =
          Math.ceil(uniqueProducts.length / pageSize) || 1;

        return Math.min(
          currentPage,
          totalUiPages - 1
        );
      });
    } catch (error) {
      console.error(
        "Failed to fetch master products:",
        error
      );

      console.error(
        "Master products API response:",
        error?.response?.data
      );

      setAllProducts([]);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      setErrorMessage(
        backendMessage ||
        "Failed to load master products."
      );
    } finally {
      setLoading(false);
    }
  }, [
    extractProductList,
    normalizeProduct,
  ]);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  // ============================================================
  // FILTER + SEARCH
  // ============================================================

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // ----------------------------------------------------------
    // VEG
    // ----------------------------------------------------------

    if (activeFilter === "veg") {
      result = result.filter(
        (product) =>
          product.isVeg === true ||
          product.veg === 1
      );
    }

    // ----------------------------------------------------------
    // NON VEG
    // ----------------------------------------------------------

    if (activeFilter === "nonveg") {
      result = result.filter(
        (product) =>
          product.isVeg === false ||
          product.veg === 0 ||
          product.nonVeg === 1
      );
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    const keyword = searchKeyword
      .trim()
      .toLowerCase();

    if (keyword) {
      result = result.filter((product) => {
        const productName =
          product?.masterProductName
            ?.toString()
            .toLowerCase() || "";

        const description =
          product?.description
            ?.toString()
            .toLowerCase() || "";

        const categoryName =
          product?.categoryName
            ?.toString()
            .toLowerCase() || "";

        const cuisineType =
          product?.cuisineType
            ?.toString()
            .toLowerCase() || "";

        const productType =
          product?.productType
            ?.toString()
            .toLowerCase() || "";

        const masterProductId =
          product?.masterProductId
            ?.toString()
            .toLowerCase() || "";

        return (
          productName.includes(keyword) ||
          description.includes(keyword) ||
          categoryName.includes(keyword) ||
          cuisineType.includes(keyword) ||
          productType.includes(keyword) ||
          masterProductId.includes(keyword)
        );
      });
    }

    return result;
  }, [
    allProducts,
    activeFilter,
    searchKeyword,
  ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalElements = filteredProducts.length;

  const totalPages =
    Math.ceil(totalElements / pageSize) || 1;

  const products = useMemo(() => {
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredProducts.slice(
      startIndex,
      endIndex
    );
  }, [
    filteredProducts,
    page,
  ]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalVeg = useMemo(() => {
    return filteredProducts.filter(
      (product) =>
        product.isVeg === true ||
        product.veg === 1
    ).length;
  }, [filteredProducts]);

  const totalNonVeg = useMemo(() => {
    return filteredProducts.filter(
      (product) =>
        product.isVeg === false ||
        product.veg === 0 ||
        product.nonVeg === 1
    ).length;
  }, [filteredProducts]);

  const totalPublished = useMemo(() => {
    return filteredProducts.filter(
      (product) =>
        product.isActive === "Y"
    ).length;
  }, [filteredProducts]);

  // ============================================================
  // SEARCH
  // ============================================================

  const handleSearch = (keyword) => {
    setSearchKeyword(keyword);
    setPage(0);
  };

  // ============================================================
  // FILTER
  // ============================================================

  const handleFilter = (type) => {
    setActiveFilter(type);
    setPage(0);
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(
        (previousPage) =>
          previousPage + 1
      );
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(
        (previousPage) =>
          previousPage - 1
      );
    }
  };

  const handlePageClick = (pageNumber) => {
    if (
      pageNumber >= 0 &&
      pageNumber < totalPages
    ) {
      setPage(pageNumber);
    }
  };

  // ============================================================
  // EDIT PRODUCT
  // ============================================================

  const handleEdit = async (masterProductId) => {
    try {
      setErrorMessage("");

      const response =
        await getMasterProductById(
          masterProductId
        );

      const product = normalizeProduct(
        response?.data
      );

      setSelectedProduct(product);

      localStorage.setItem(
        "selectedMasterProductId",
        String(masterProductId)
      );

      navigate(
        "/dashboard/editMasterProduct"
      );
    } catch (error) {
      console.error(
        "Failed to fetch product:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to open product."
      );
    }
  };

  // ============================================================
  // TOGGLE MASTER PRODUCT ACTIVE STATUS
  //
  // API:
  //
  // PUT
  // /api/fm/products/productIsActiveToggleByProductType
  //
  // Payload:
  //
  // {
  //   productId: masterProductId,
  //   productType: "MASTERPRODUCT",
  //   isActive: "Y" / "N"
  // }
  //
  // ============================================================

  const handleTogglePublish = async (product) => {
    if (!product) {
      return;
    }

    const masterProductId =
      product.masterProductId;

    // ----------------------------------------------------------
    // VALIDATE ID
    // ----------------------------------------------------------

    if (
      masterProductId === undefined ||
      masterProductId === null
    ) {
      setErrorMessage(
        "Master Product ID is missing."
      );

      return;
    }

    // ----------------------------------------------------------
    // PREVENT DOUBLE CLICK
    // ----------------------------------------------------------

    if (
      toggleLockRef.current ===
      masterProductId
    ) {
      console.warn(
        `Toggle already running for product ${masterProductId}`
      );

      return;
    }

    // Lock immediately
    toggleLockRef.current =
      masterProductId;

    setUpdatingProductId(
      masterProductId
    );

    setErrorMessage("");

    // ----------------------------------------------------------
    // CURRENT STATUS
    // ----------------------------------------------------------

    const currentlyActive =
      product.isActive === "Y" ||
      product.isActive === "y" ||
      product.isActive === true ||
      product.isActive === 1 ||
      product.isActive === "1";

    // ----------------------------------------------------------
    // NEW STATUS
    // ----------------------------------------------------------

    const newIsActive =
      currentlyActive ? "N" : "Y";

    console.log(
      "========================================"
    );

    console.log(
      "[MASTER PRODUCT TOGGLE]"
    );

    console.log(
      "masterProductId:",
      masterProductId
    );

    console.log(
      "current isActive:",
      product.isActive
    );

    console.log(
      "new isActive:",
      newIsActive
    );

    console.log(
      "productType:",
      "MASTERPRODUCT"
    );

    console.log(
      "========================================"
    );

    try {
      // --------------------------------------------------------
      // CALL TOGGLE API
      // --------------------------------------------------------

      await updateProductActiveStatusByProductType(
        masterProductId,
        newIsActive
      );

      // --------------------------------------------------------
      // UPDATE LOCAL UI ONLY AFTER API SUCCESS
      // --------------------------------------------------------

      setAllProducts(
        (previousProducts) =>
          previousProducts.map((item) => {
            if (
              item.masterProductId !==
              masterProductId
            ) {
              return item;
            }

            return {
              ...item,

              isActive:
                newIsActive,

              publish:
                newIsActive === "Y"
                  ? 1
                  : 0,
            };
          })
      );

      console.log(
        `[MASTER PRODUCT TOGGLE] Product ${masterProductId} successfully changed to ${newIsActive}`
      );
    } catch (error) {
      // --------------------------------------------------------
      // DO NOT CHANGE UI IF API FAILS
      // --------------------------------------------------------

      console.error(
        "[MASTER PRODUCT TOGGLE] Failed:",
        error
      );

      console.error(
        "[MASTER PRODUCT TOGGLE] Response:",
        error?.response?.data
      );

      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update product active status."
      );
    } finally {
      // --------------------------------------------------------
      // RELEASE LOCK
      // --------------------------------------------------------

      toggleLockRef.current = null;

      setUpdatingProductId(null);
    }
  };

  // ============================================================
  // DELETE PRODUCT
  // ============================================================

  const handleDelete = async (
    masterProductId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      await deleteMasterProduct(
        masterProductId
      );

      await fetchAllProducts();
    } catch (error) {
      console.error(
        "Failed to delete product:",
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete product."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    setPage(0);
    await fetchAllProducts();
  };

  // ============================================================
  // PAGE NUMBERS
  // ============================================================

  const pageNumbers = useMemo(() => {
    const pages = [];

    for (
      let pageIndex = 0;
      pageIndex < totalPages;
      pageIndex += 1
    ) {
      pages.push(pageIndex);
    }

    return pages;
  }, [totalPages]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="master-products-page">

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="master-header">

        <div className="master-left">

          <p className="master-tag">
            PRODUCT CATALOGUE
          </p>

          <h1 className="master-heading">
            Master Products{" "}
            <span>Library</span>
          </h1>

          <p className="master-text">
            Manage the global master
            product catalogue. Add,
            edit, filter by Veg/Non-Veg,
            or bulk-import via Excel.
            Compare files to detect
            duplicates before adding.
          </p>

        </div>

        <div className="master-right">

          <button
            type="button"
            className="compare-btn"
            onClick={() =>
              navigate(
                "/dashboard/compareFile"
              )
            }
          >
            🔍 Compare File
          </button>

          <button
            type="button"
            className="add-product-btn"
            onClick={() =>
              navigate(
                "/dashboard/createMasterProduct"
              )
            }
          >
            + Add Product
          </button>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ======================================================= */}

      {errorMessage && (
        <div
          style={{
            margin: "15px 0",
            padding: "12px 16px",
            borderRadius: "8px",
            backgroundColor: "#fff1f1",
            border: "1px solid #f0b5b5",
            color: "#b42318",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
          }}
        >

          <span>{errorMessage}</span>

          <button
            type="button"
            onClick={() =>
              setErrorMessage("")
            }
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            ×
          </button>

        </div>
      )}

      {/* ======================================================
          STATISTICS
      ======================================================= */}

      <div className="stats-container">

        <div className="stat-box">

          <div className="stat-emoji">
            📦
          </div>

          <div>
            <h2>
              {allProducts.length}
            </h2>

            <p>Total Products</p>
          </div>

        </div>

        <div className="stat-box">

          <div className="stat-emoji">
            🥦
          </div>

          <div>
            <h2>{totalVeg}</h2>

            <p>Veg</p>
          </div>

        </div>

        <div className="stat-box">

          <div className="stat-emoji">
            🍗
          </div>

          <div>
            <h2>{totalNonVeg}</h2>

            <p>Non-Veg</p>
          </div>

        </div>

        <div className="stat-box">

          <div className="stat-emoji">
            ✅
          </div>

          <div>
            <h2>
              {totalPublished}
            </h2>

            <p>Active</p>
          </div>

        </div>

      </div>

      {/* ======================================================
          SEARCH + FILTER
      ======================================================= */}

      <div className="master-toolbar">

        <div className="master-search">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search products by name..."
            value={searchKeyword}
            onChange={(event) =>
              handleSearch(
                event.target.value
              )
            }
          />

        </div>

        <div className="toolbar-right">

          <button
            type="button"
            className={`filter-btn ${activeFilter === "all"
                ? "active"
                : ""
              }`}
            onClick={() =>
              handleFilter("all")
            }
          >
            All
          </button>

          <button
            type="button"
            className={`filter-btn ${activeFilter === "veg"
                ? "active"
                : ""
              }`}
            onClick={() =>
              handleFilter("veg")
            }
          >
            🥦 Veg
          </button>

          <button
            type="button"
            className={`filter-btn ${activeFilter === "nonveg"
                ? "active"
                : ""
              }`}
            onClick={() =>
              handleFilter("nonveg")
            }
          >
            🍗 Non-Veg
          </button>

          <button
            type="button"
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh"
          >
            ↻
          </button>

        </div>

      </div>

      {/* ======================================================
          RESULT INFORMATION
      ======================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "12px 0",
          color: "#666",
          fontSize: "14px",
        }}
      >

        <span>
          Showing{" "}

          <strong>
            {totalElements === 0
              ? 0
              : page * pageSize + 1}
          </strong>

          {" - "}

          <strong>
            {Math.min(
              (page + 1) * pageSize,
              totalElements
            )}
          </strong>

          {" of "}

          <strong>
            {totalElements}
          </strong>

          {" products"}
        </span>

        {loading && (
          <span>Loading...</span>
        )}

      </div>

      {/* ======================================================
          TABLE
      ======================================================= */}

      {products.length > 0 ? (

        <MasterProductsTable
          products={products}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          onTogglePublish={
            handleTogglePublish
          }
          updatingProductId={
            updatingProductId
          }
        />

      ) : (

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            padding: "50px 20px",
            textAlign: "center",
            color: "#666",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >

          {loading ? (
            <>
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "10px",
                }}
              >
                ⏳
              </div>

              <p>
                Loading master products...
              </p>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "10px",
                }}
              >
                📦
              </div>

              <p>
                No master products found.
              </p>

              {(searchKeyword ||
                activeFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchKeyword("");
                      setActiveFilter("all");
                      setPage(0);
                    }}
                    style={{
                      marginTop: "10px",
                      padding: "8px 16px",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Clear Filters
                  </button>
                )}
            </>
          )}

        </div>

      )}

      {/* ======================================================
          PAGINATION
      ======================================================= */}

      <div className="pagination-container">

        <p className="pagination-info">
          Page{" "}
          <strong>
            {page + 1}
          </strong>
          {" of "}
          <strong>
            {totalPages}
          </strong>
          {" • "}
          <strong>
            {totalElements}
          </strong>
          {" total products"}
        </p>

        <div className="pagination-buttons">

          {/* Previous */}
          <button
            type="button"
            className="pagination-btn"
            onClick={handlePrevPage}
            disabled={page === 0 || loading}
          >
            ← Previous
          </button>

          {/* Page Numbers */}
          {pageNumbers.map((pageNumber) => (
            <button
              type="button"
              key={pageNumber}
              className={`page-number-btn ${pageNumber === page ? "active" : ""}`}
              onClick={() => handlePageClick(pageNumber)}
              disabled={loading}
            >
              {pageNumber + 1}
            </button>
          ))}

          {/* Next */}
          <button
            type="button"
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={page >= totalPages - 1 || loading}
          >
            Next →
          </button>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// PROP TYPES
// ============================================================

MasterProducts.propTypes = {
  setSelectedProduct:
    PropTypes.func.isRequired,
};

// ============================================================
// EXPORT
// ============================================================

export default MasterProducts;