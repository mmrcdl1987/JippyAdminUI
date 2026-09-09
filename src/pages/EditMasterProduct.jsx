import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {
  updateMasterProduct,
  getMasterProductById,
  getAllCategories,
} from "../services/masterProductsService";
import "../styles/EditMasterProduct.css";

function EditMasterProduct({ selectedProduct, setSelectedProduct, setActivePage }) {
  const navigate = useNavigate();

  // Loading & Error States
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  // Form Fields State
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  const [photo, setPhoto] = useState("");
  const [photos, setPhotos] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // Custom Category State (for "Other" selection)
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  const [veg, setVeg] = useState(0);
  const [publish, setPublish] = useState(0);

  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fats, setFats] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [grams, setGrams] = useState(0);

  const [csvMerchantPrice, setCsvMerchantPrice] = useState("");
  const [csvTiming, setCsvTiming] = useState("");
  const [csvDayOfWeek, setCsvDayOfWeek] = useState("");

  // Helper navigation fallback handler supporting absolute dashboard path
  const handleBackNavigation = () => {
    localStorage.removeItem("selectedMasterProductId");
    if (typeof setActivePage === "function") {
      setActivePage("masterProducts");
    } else {
      navigate("/dashboard/masterProducts"); // FIXED: Absolute routing path
    }
  };

  // Handle page refresh persistence using localStorage
  useEffect(() => {
    const fetchProductOnReload = async () => {
      const storedId = localStorage.getItem("selectedMasterProductId");
      if (!selectedProduct && storedId) {
        try {
          setFetchingProduct(true);
          const response = await getMasterProductById(storedId);
          if (response?.data && typeof setSelectedProduct === "function") {
            setSelectedProduct(response.data);
          }
        } catch (error) {
          console.error("Failed to recover product on refresh:", error);
        } finally {
          setFetchingProduct(false);
        }
      }
    };

    if (!selectedProduct) {
      fetchProductOnReload();
    } else {
      localStorage.setItem("selectedMasterProductId", selectedProduct.masterProductId);
    }
  }, [selectedProduct, setSelectedProduct]);

  // Sync state when selectedProduct is updated
  useEffect(() => {
    if (selectedProduct) {
      setProductName(selectedProduct.masterProductName || "");
      setDescription(selectedProduct.description || "");
      setShortDescription(selectedProduct.shortDescription || "");

      setPhoto(selectedProduct.photo || "");
      setPhotos(selectedProduct.photos || "");
      setThumbnail(selectedProduct.thumbnail || "");

      setCategoryId(
        selectedProduct.categoryId ? String(selectedProduct.categoryId) : ""
      );
      setCategoryName(selectedProduct.categoryName || "");

      setVeg(selectedProduct.veg ?? 0);
      setPublish(selectedProduct.publish ?? 0);

      setCalories(selectedProduct.calories ?? 0);
      setProtein(selectedProduct.protein ?? 0);
      setFats(selectedProduct.fats ?? 0);
      setCarbs(selectedProduct.carbs ?? 0);
      setGrams(selectedProduct.grams ?? 0);

      setCsvMerchantPrice(selectedProduct.csvMerchantPrice || "");
      setCsvTiming(selectedProduct.csvTiming || "");
      setCsvDayOfWeek(selectedProduct.csvDayOfWeek || "");
    }
  }, [selectedProduct]);

  // Fetch Categories
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setLoadingCategories(true);
      setCategoriesError(null);

      try {
        const response = await getAllCategories("ALL");
        const rawData = response?.data?.data || response?.data || [];
        const categoryList = Array.isArray(rawData) ? rawData : [];

        if (isMounted) {
          setCategories(categoryList);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        if (isMounted) {
          setCategoriesError(
            "Could not load full categories list from the server."
          );
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Category Change Handler
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;

    if (selectedId === "OTHER") {
      setIsOtherCategory(true);
      setCategoryId("");
      setCategoryName("");
    } else {
      setIsOtherCategory(false);
      setCustomCategoryName("");
      setCategoryId(selectedId);

      const selectedCat = categories.find(
        (cat) => String(cat.categoryId) === String(selectedId)
      );

      if (selectedCat) {
        setCategoryName(selectedCat.categoryName || "");
      } else {
        setCategoryName("");
      }
    }

  };

  // Submit Handler
  const handleUpdate = async (e) => {
    e.preventDefault();

    const currentProductId = selectedProduct?.masterProductId || localStorage.getItem("selectedMasterProductId");

    if (!currentProductId) {
      alert("Invalid product ID");
      return;
    }

    if (isOtherCategory && !customCategoryName.trim()) {
      setSubmitError("Please enter a new category name.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const finalCategoryId = isOtherCategory
      ? null
      : categoryId
      ? Number(categoryId)
      : null;

    const finalCategoryName = isOtherCategory
      ? customCategoryName.trim()
      : categoryName.trim() || null;

    const payload = {
      masterProductId: Number(currentProductId),
      masterProductName: productName.trim(),
      categoryName: finalCategoryName,
      categoryId: finalCategoryId,
      subCategoryId: null,
      subCategoryName: null,

      hasOptions: 0,
      optionsEnabled: 0,
      options: null,

      description: description.trim() || null,
      shortDescription: shortDescription.trim() || null,
      photo: photo.trim() || null,
      photos: photos.trim() || null,
      thumbnail: thumbnail.trim() || null,
      foodType: null,
      cuisineType: null,
      veg: Number(veg),
      nonVeg: veg ? 0 : 1,
      publish: Number(publish),

      calories: calories ? Number(calories) : 0,
      protein: protein ? Number(protein) : 0,
      fats: fats ? Number(fats) : 0,
      carbs: carbs ? Number(carbs) : 0,
      grams: grams ? Number(grams) : 0,

      csvMerchantPrice: csvMerchantPrice !== "" ? Number(csvMerchantPrice) : null,
      csvTiming: csvTiming.trim() || null,
      csvDayOfWeek: csvDayOfWeek.trim() || null,
    };

    try {
      const response = await updateMasterProduct(currentProductId, payload);

      if (response?.status === 200 || response?.status === 204) {
        alert("✅ Product updated successfully!");
        handleBackNavigation();
      }
    } catch (error) {
      console.error("Update failed:", error);
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Failed to update master product."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (fetchingProduct) {
    return <h3>Loading product details...</h3>;
  }

  if (!selectedProduct && !localStorage.getItem("selectedMasterProductId")) {
    return (
      <div className="edit-product-page">
        <button
          type="button"
          className="back-btn"
          onClick={handleBackNavigation}
        >
          ← Back
        </button>
        <h1>Edit Master Product</h1>
        <div className="alert-banner error-banner" style={{ marginTop: "20px" }}>
          ⚠️ No product selected for editing. Please select a product from the list view.
        </div>
      </div>
    );
  }

  return (
    <div className="edit-product-page">
      <button
        type="button"
        className="back-btn"
        onClick={handleBackNavigation}
        disabled={isSubmitting}
      >
        ← Back
      </button>

      <h1>Edit Master Product</h1>
      <p className="edit-subtitle">Update product details below.</p>

      {categoriesError && (
        <div className="alert-banner error-banner">⚠️ {categoriesError}</div>
      )}

      {submitError && (
        <div className="alert-banner error-banner">❌ {submitError}</div>
      )}

      <form className="edit-form" onSubmit={handleUpdate}>
        {/* ================= PRODUCT INFORMATION ================= */}
        <div className="form-card">
          <h2>📦 Required Information</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="productName">Product Name *</label>
              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>

            {/* Category Dropdown */}
            <div className="form-group">
              <label htmlFor="categoryId">Category *</label>
              <select
                id="categoryId"
                value={isOtherCategory ? "OTHER" : categoryId}
                onChange={handleCategoryChange}
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : "-- Select Category --"}
                </option>

                {categoryId &&
                  !isOtherCategory &&
                  !categories.some(
                    (c) => String(c.categoryId) === String(categoryId)
                  ) && (
                    <option value={categoryId}>
                      {categoryName
                        ? `${categoryName} (Current)`
                        : `Category ID: ${categoryId}`}
                    </option>
                  )}

                {categories.map((cat) => {
                  const catIdStr = String(cat.categoryId);
                  const isCurrent =
                    catIdStr === String(categoryId) && !isOtherCategory;

                  return (
                    <option key={cat.categoryId} value={catIdStr}>
                      {cat.categoryName} {isCurrent ? "(Current)" : ""}
                    </option>
                  );
                })}

                <option value="OTHER">+ Other (Create New)</option>
              </select>
            </div>

            {/* New Category Field */}
            {isOtherCategory && (
              <div className="form-group full-width">
                <label htmlFor="customCategory">New Category Name *</label>
                <input
                  id="customCategory"
                  type="text"
                  placeholder="Enter new category name"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="photo">Photo URL</label>
              <input
                id="photo"
                type="text"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="photos">Photos List</label>
              <input
                id="photos"
                type="text"
                value={photos}
                onChange={(e) => setPhotos(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail">Thumbnail URL</label>
              <input
                id="thumbnail"
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="veg">Dietary Type</label>
              <select
                id="veg"
                value={veg}
                onChange={(e) => setVeg(Number(e.target.value))}
              >
                <option value={1}>Veg</option>
                <option value={0}>Non Veg</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="publish">Publish Status</label>
              <select
                id="publish"
                value={publish}
                onChange={(e) => setPublish(Number(e.target.value))}
              >
                <option value={1}>Published</option>
                <option value={0}>Unpublished</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group full-width">
              <label htmlFor="shortDescription">Short Description</label>
              <textarea
                id="shortDescription"
                rows="2"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>



        {/* ================= NUTRITION ================= */}
        <div className="form-card">
          <h2>❤️ Nutrition</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="calories">Calories</label>
              <input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="protein">Protein (g)</label>
              <input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fats">Fats (g)</label>
              <input
                id="fats"
                type="number"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="carbs">Carbs (g)</label>
              <input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="grams">Grams (g)</label>
              <input
                id="grams"
                type="number"
                value={grams}
                onChange={(e) => setGrams(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ================= BUTTONS ================= */}
        <div className="button-group">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleBackNavigation}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button type="submit" className="save-btn" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}

EditMasterProduct.propTypes = {
  selectedProduct: PropTypes.object,
  setSelectedProduct: PropTypes.func,
  setActivePage: PropTypes.func,
};

export default EditMasterProduct;