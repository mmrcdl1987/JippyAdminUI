import "../styles/CompareFile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FiEdit2 } from "react-icons/fi";
import AddToOutletProducts from "./AddToOutletProducts";

import {
  compareMasterProductsFile,
  addNewItemsToMasterProducts,
} from "../services/masterProductsService";

function CompareFile({ setActivePage }) {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOutletPopup, setShowOutletPopup] = useState(false);

  const [activeTab, setActiveTab] = useState("duplicates");

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedOutletProducts, setSelectedOutletProducts] = useState([]);

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmType, setConfirmType] = useState("");

  // Safe navigation handler supporting both props and router routing
  const handleNavigation = () => {
    if (typeof setActivePage === "function") {
      setActivePage("masterProducts");
    } else {
      navigate("/dashboard/masterProducts");
    }
  };

  // ================= File Selection =================

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };

  // ================= Compare API =================

  const handleCompare = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    try {
      setLoading(true);
      const response = await compareMasterProductsFile(selectedFile);

      const data = response.data || {};

      /*
       * Keep the XLS values attached to every compare item.
       * Different backend DTO versions may expose the price as
       * csvPrice, csvMerchantPrice, or merchantPrice.
       * Normalize it once here so the outlet popup always receives
       * the XLS price/timing/day together with the product.
       */
      const normalizeCompareItem = (item) => {
        if (!item) return item;

        const rawPrice =
          item.xlsMerchantPrice ??
          item.csvMerchantPrice ??
          item.csvPrice ??
          item.merchantPrice ??
          null;

        const xlsMerchantPrice =
          rawPrice !== null &&
          rawPrice !== undefined &&
          rawPrice !== "" &&
          !Number.isNaN(Number(rawPrice))
            ? Number(rawPrice)
            : null;

        const xlsTiming =
          item.xlsTiming ??
          item.csvTiming ??
          item.timing ??
          "";

        const xlsDayOfWeek =
          item.xlsDayOfWeek ??
          item.csvDayOfWeek ??
          item.dayOfWeek ??
          "";

        return {
          ...item,
          xlsMerchantPrice,
          xlsTiming: String(xlsTiming || "").trim(),
          xlsDayOfWeek: String(xlsDayOfWeek || "").trim(),
        };
      };

      const normalizedResult = {
        ...data,
        duplicates: Array.isArray(data.duplicates)
          ? data.duplicates.map(normalizeCompareItem)
          : [],
        newProducts: Array.isArray(data.newProducts)
          ? data.newProducts.map(normalizeCompareItem)
          : [],
      };

      console.log("[COMPARE] Raw API response:", data);
      console.log("[COMPARE] Normalized XLS cache:", normalizedResult);

      setCompareResult(normalizedResult);
      setActiveTab("duplicates");
      setSelectedProducts([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= Add Selected Products =================

  const handleAddToMasterProducts = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    try {
      const payload = currentProducts
        .filter((_, index) => selectedProducts.includes(index))
        .map((product) => ({
          masterProductName: product.masterProductName,
          description: product.description,
          shortDescription: product.shortDescription,

          photo: product.photo,
          photos: product.photos,
          thumbnail: product.thumbnail,

          categoryId: product.categoryId,
          categoryName: product.categoryName,

          subCategoryId: product.subCategoryId,
          subCategoryName: product.subCategoryName,

          veg: product.veg,
          nonVeg: product.nonVeg,

          foodType: product.foodType,
          cuisineType: product.cuisineType,

          hasOptions: product.hasOptions,
          optionsEnabled: product.optionsEnabled,
          options: product.options,

          calories: product.calories,
          protein: product.protein,
          fats: product.fats,
          carbs: product.carbs,
          grams: product.grams,

          // IMPORTANT: preserve product_type from the compare response
          // and send it to the backend for persistence.
          productType:
            product.productType != null
              ? String(product.productType).trim()
              : null,

          publish: product.publish,

          createdBy: 1,
          updatedBy: 1,
        }));

      console.log(
        "[MASTER PRODUCT] Add New Items Payload:",
        JSON.stringify(payload, null, 2)
      );

      console.log(
        "[MASTER PRODUCT] Product types being sent:",
        payload.map((product) => ({
          masterProductName: product.masterProductName,
          productType: product.productType,
        }))
      );

      const response = await addNewItemsToMasterProducts(payload);

      console.log(response.data);
      alert("Products added successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  // ================= Current Table Data =================

  const currentProducts =
    activeTab === "duplicates"
      ? compareResult?.duplicates || []
      : compareResult?.newProducts || [];

  return (
    <div className="compare-page">
      <div className="compare-card">
        {/* Header */}

        <div className="compare-header">
          <h2>Compare File with Catalogue</h2>

          <button
            type="button"
            className="close-btn"
            onClick={handleNavigation}
          >
            ✕
          </button>
        </div>

        {/* Info */}

        <div className="info-card">
          <div className="info-icon">🔎</div>

          <div>
            <h3>Detect duplicates before importing</h3>

            <p>
              Upload an Excel or CSV file. The system compares the products
              against the Master Catalogue and separates Duplicate Products and
              New Products.
            </p>
          </div>
        </div>

        {/* Upload */}

        <div className="upload-area">
          <div className="upload-icon">📂</div>

          <h3>Drop your file here</h3>

          <span>or</span>

          <input
            id="compareFile"
            type="file"
            hidden
            onChange={handleFileChange}
          />

          <label htmlFor="compareFile" className="browse-btn">
            Browse File
          </label>

          {selectedFile && <p className="selected-file">{selectedFile.name}</p>}
        </div>

        {compareResult && (
          <>
            {/* Statistics */}

            <div className="compare-stats">
              <div className="compare-stat-card">
                <h2>{compareResult.totalInFile}</h2>

                <p>Total Products</p>
              </div>

              <div className="compare-stat-card">
                <h2>{compareResult.newCount}</h2>

                <p>New Products</p>
              </div>

              <div className="compare-stat-card">
                <h2>{compareResult.duplicateCount}</h2>

                <p>Duplicates</p>
              </div>

              <div className="compare-stat-card">
                <h2>{compareResult.skippedCount}</h2>

                <p>Skipped</p>
              </div>
            </div>

            {/* Tabs */}

            <div className="result-tabs">
              <button
                type="button"
                className={`tab-btn ${
                  activeTab === "duplicates" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab("duplicates");
                  setSelectedProducts([]);
                }}
              >
                Duplicates ({compareResult.duplicateCount})
              </button>

              <button
                type="button"
                className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("new");
                  setSelectedProducts([]);
                }}
              >
                New Products ({compareResult.newCount})
              </button>
            </div>

            <div className="table-toolbar">
              {activeTab === "new" && (
                <button
                  type="button"
                  className="bulk-add-btn"
                  onClick={() => {
                    if (selectedProducts.length === 0) {
                      alert("Please select at least one product.");
                      return;
                    }

                    setConfirmType("master");
                    setShowConfirmPopup(true);
                  }}
                >
                  + Add to Master Products
                </button>
              )}

              {activeTab === "duplicates" && (
                <button
                  type="button"
                  className="bulk-add-btn"
                  onClick={() => {
                    if (selectedProducts.length === 0) {
                      alert("Please select at least one product.");
                      return;
                    }

                    const products = selectedProducts.map(
                      (index) => currentProducts[index]
                    );

                    setSelectedOutletProducts(products);

                    setConfirmType("outlet");
                    setShowConfirmPopup(true);
                  }}
                >
                  + Add to Outlet Products
                </button>
              )}
            </div>

            {/* TABLE STARTS HERE */}

            <div className="compare-table-container">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>
                      <label className="select-all-label">
                        <input
                          type="checkbox"
                          checked={
                            currentProducts.length > 0 &&
                            selectedProducts.length === currentProducts.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts(
                                currentProducts.map((_, index) => index)
                              );
                            } else {
                              setSelectedProducts([]);
                            }
                          }}
                        />
                        Select All
                      </label>
                    </th>

                    <th>Photo</th>

                    <th>Product</th>

                    <th>Product Type</th>

                    <th>Category</th>

                    <th>Calories</th>

                    <th>Protein</th>

                    <th>Fat</th>

                    <th>Carbs</th>

                    <th>Wt(g)</th>

                    <th>Options</th>

                    <th>Status</th>

                    <th>Edit</th>
                  </tr>
                </thead>

                <tbody>
                  {currentProducts.map((product, index) => (
                    <tr
                      key={
                        product.masterProductId ??
                        `${product.masterProductName}-${index}`
                      }
                    >
                      {/* Checkbox */}

                      <td>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProducts([
                                ...selectedProducts,
                                index,
                              ]);
                            } else {
                              setSelectedProducts(
                                selectedProducts.filter((id) => id !== index)
                              );
                            }
                          }}
                        />
                      </td>

                      {/* Photo */}

                      <td>
                        <img
                          src={product.photo || "/no-image.png"}
                          alt=""
                          className="product-photo"
                        />
                      </td>

                      {/* Product */}

                      <td>
                        <div className="product-info">
                          <strong>{product.masterProductName}</strong>

                          <div className="product-sub">{product.foodType}</div>
                        </div>
                      </td>

                      {/* Product Type */}

                      <td>
                        <span className="product-sub">
                          {product.productType || "-"}
                        </span>
                      </td>

                      {/* Category */}

                      <td>
                        <div>
                          <strong>{product.categoryName}</strong>

                          <div className="product-sub">
                            {product.subCategoryName}
                          </div>
                        </div>
                      </td>

                      {/* Nutrition */}

                      <td>{product.calories}</td>

                      <td>{product.protein}</td>

                      <td>{product.fats}</td>

                      <td>{product.carbs}</td>

                      <td>{product.grams}</td>

                      {/* Options */}

                      <td>
                        <span
                          className={
                            product.hasOptions ? "yes-tag" : "no-tag"
                          }
                        >
                          {product.hasOptions ? "Yes" : "No"}
                        </span>
                      </td>

                      {/* Publish */}

                      <td>
                        <span
                          className={
                            product.publish === 1
                              ? "published-tag"
                              : "draft-tag"
                          }
                        >
                          {product.publish === 1 ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Edit */}

                      <td>
                        <button type="button" className="edit-small-btn">
                          <FiEdit2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {showConfirmPopup && (
          <div className="confirm-popup-overlay">
            <div className="confirm-popup">
              <h3>Confirmation</h3>

              <p>
                {confirmType === "master"
                  ? "Are you sure you want to add the selected products to Master Products?"
                  : "Are you sure you want to add the selected products to Outlet Products?"}
              </p>

              <div className="confirm-buttons">
                <button
                  type="button"
                  className="cancel-popup-btn"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="confirm-popup-btn"
                  onClick={() => {
                    setShowConfirmPopup(false);

                    if (confirmType === "master") {
                      handleAddToMasterProducts();
                    } else {
                      setShowOutletPopup(true);
                    }
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}

        <div className="compare-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleNavigation}
          >
            Close
          </button>

          <button
            type="button"
            className="compare-button"
            onClick={handleCompare}
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </div>
      </div>

      {showOutletPopup && (
        <AddToOutletProducts
          setShowOutletPopup={setShowOutletPopup}
          selectedProducts={selectedOutletProducts}
        />
      )}
    </div>
  );
}

CompareFile.propTypes = {
  setActivePage: PropTypes.func,
};

export default CompareFile;