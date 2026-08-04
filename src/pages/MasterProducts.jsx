import "../styles/MasterProducts.css";
import MasterProductsTable from "../components/masterProducts/MasterProductsTable"
import { useState, useEffect } from "react";
import CreateMasterProduct from "./CreateMasterProduct";

import {
  getAllMasterProducts,
  getMasterProductById,
  deleteMasterProduct,
  filterMasterProducts,
  searchMasterProducts
} from "../services/masterProductsService";



import {
  FiSearch,
  FiRefreshCw,
  FiPlus,
  FiUpload,
} from "react-icons/fi";

function MasterProducts({
  setActivePage,
  selectedProduct,
  setSelectedProduct,
}) {
  
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const totalProducts = products.length;

const [activeFilter, setActiveFilter] = useState("all");
const [searchKeyword, setSearchKeyword] = useState("");

const totalVeg = products.filter(
  (product) => product.veg === 1
).length;

const totalNonVeg = products.filter(
  (product) => product.nonVeg === 1
).length;

const totalPublished = products.filter(
  (product) => product.publish === 1
).length;

//Fetch all master products
const fetchProducts = async () => {
  try {
    setLoading(true);

    const response = await getAllMasterProducts();

    console.log(response.data);

    setProducts(response.data);
  } catch (error) {
    console.error("Failed to fetch master products:", error);
  } finally {
    setLoading(false);
  }
};

//Edit a product by ID 
const handleEdit = async (masterProductId) => {
  try {
    const response = await getMasterProductById(masterProductId);

    console.log("Product Details:", response.data);

setSelectedProduct(response.data);

setActivePage("editMasterProduct");

  } catch (error) {
    console.error("Failed to fetch product:", error);
  }
};

//Delete a product by ID
const handleDelete = async (masterProductId) => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmDelete) return;

  try {

    const response = await deleteMasterProduct(masterProductId);

    console.log(response.data);

    fetchProducts();

  } catch (error) {

    console.error("Failed to delete product:", error);

  }

};

useEffect(() => {
  fetchProducts();
}, []);


//Filter Master Products (all, veg, non-veg)
const handleFilter = async (type) => {

  try {

    console.log("Filter Type:", type);

    setActiveFilter(type);

    const response = await filterMasterProducts(type);

    console.log("Filter Response:", response.data);

    setProducts(response.data);

  } catch (error) {

    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.error(error);

  }

};


//Search Master Products
const handleSearch = async (keyword) => {

  try {

    setSearchKeyword(keyword);

    if (keyword.trim() === "") {
      fetchProducts();
      return;
    }

    const response = await searchMasterProducts(keyword);

    console.log("Search Response:", response.data);

    setProducts(response.data);

  } catch (error) {

    console.error("Search failed:", error);

  }

};

return (
    <div className="master-products-page">

  <div className="master-header">

    <div className="master-left">

      <p className="master-tag">
        PRODUCT CATALOGUE
      </p>

      <h1 className="master-heading">
        Master Products <span>Library</span>
      </h1>

      <p className="master-text">
        Manage the global master product catalogue.
        Add, edit, filter by Veg/Non-Veg, or bulk-import
        via Excel. Compare files to detect duplicates
        before adding.
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

    <div className="stat-emoji">
      📦
    </div>

    <div>

   <h2>{totalProducts}</h2>

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

<h2>{totalPublished}</h2>

      <p>Published</p>

    </div>

  </div>

</div>

{/* Search & Filters */}

<div className="master-toolbar">

  <div className="master-search">

    <span className="search-icon">
      🔍
    </span>

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

  <button
    className="refresh-btn"
    onClick={fetchProducts}
  >
    ↻
  </button>

</div>

</div>


<MasterProductsTable
  products={products}
  handleEdit={handleEdit}
  handleDelete={handleDelete}
/>


</div>
    );
}

export default MasterProducts;