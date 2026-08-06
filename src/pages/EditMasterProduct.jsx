import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  updateMasterProduct,
  getAllCategories,
} from "../services/masterProductsService";
import "../styles/EditMasterProduct.css";

function EditMasterProduct({ selectedProduct, setActivePage }) {
  // Loading & Error States
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

  const [subCategoryId, setSubCategoryId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");

  const [foodType, setFoodType] = useState("");
  const [cuisineType, setCuisineType] = useState("");

  const [veg, setVeg] = useState(0);
  const [publish, setPublish] = useState(0);

  const [hasOptions, setHasOptions] = useState(0);
  const [optionsEnabled, setOptionsEnabled] = useState(0);
  const [options, setOptions] = useState("");

  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fats, setFats] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [grams, setGrams] = useState(0);

  const [csvMerchantPrice, setCsvMerchantPrice] = useState("");
  const [csvTiming, setCsvTiming] = useState("");
  const [csvDayOfWeek, setCsvDayOfWeek] = useState("");

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

      setSubCategoryId(
        selectedProduct.subCategoryId ? String(selectedProduct.subCategoryId) : ""
      );
      setSubCategoryName(selectedProduct.subCategoryName || "");

      setFoodType(selectedProduct.foodType || "");
      setCuisineType(selectedProduct.cuisineType || "");

      setVeg(selectedProduct.veg ?? 0);
      setPublish(selectedProduct.publish ?? 0);

      setHasOptions(selectedProduct.hasOptions ?? 0);
      setOptionsEnabled(selectedProduct.optionsEnabled ?? 0);

      setOptions(
        typeof selectedProduct.options === "object"
          ? JSON.stringify(selectedProduct.options)
          : selectedProduct.options || ""
      );

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

    setSubCategoryId("");
    setSubCategoryName("");
  };

  // Sub Category Change Handler
  const handleSubCategoryChange = (e) => {
    const selectedSubId = e.target.value;
    setSubCategoryId(selectedSubId);

    const currentCat = categories.find(
      (cat) => String(cat.categoryId) === String(categoryId)
    );

    const subCats = currentCat?.subCategories || currentCat?.subCategoryList || [];
    const selectedSub = subCats.find(
      (sub) => String(sub.subCategoryId || sub.id) === String(selectedSubId)
    );

    if (selectedSub) {
      setSubCategoryName(selectedSub.subCategoryName || selectedSub.name || "");
    } else {
      setSubCategoryName("");
    }
  };

  const currentCategory = categories.find(
    (cat) => String(cat.categoryId) === String(categoryId)
  );
  const availableSubCategories =
    currentCategory?.subCategories || currentCategory?.subCategoryList || [];

  // Submit Handler: Only builds required and provided fields
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!selectedProduct?.masterProductId) {
      alert("Invalid product ID");
      return;
    }

    if (isOtherCategory && !customCategoryName.trim()) {
      setSubmitError("Please enter a new category name.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Dynamic Category construction
    const finalCategoryId = isOtherCategory
      ? null
      : categoryId
      ? Number(categoryId)
      : null;

    const finalCategoryName = isOtherCategory
      ? customCategoryName.trim()
      : categoryName.trim() || null;

    const finalSubCategoryId =
      isOtherCategory || !subCategoryId ? null : Number(subCategoryId);

    const finalSubCategoryName =
      isOtherCategory || !subCategoryName.trim()
        ? null
        : subCategoryName.trim();

    // Clean JSON Options handling
    let sanitizedOptions = null;
    if (options && options.trim()) {
      try {
        JSON.parse(options.trim());
        sanitizedOptions = options.trim();
      } catch (err) {
        sanitizedOptions = JSON.stringify(options.trim());
      }
    }

    // Dynamic payload - sends explicit values for provided inputs and NULL for missing values
    const payload = {
      masterProductId: selectedProduct.masterProductId,
      masterProductName: productName.trim(),
      categoryName: finalCategoryName,
      categoryId: finalCategoryId,
      subCategoryId: finalSubCategoryId,
      subCategoryName: finalSubCategoryName,

      // Include options if explicitly marked or typed
      hasOptions: Number(hasOptions),
      optionsEnabled: Number(optionsEnabled),
      options: sanitizedOptions,

      // Other fields (null if empty string to prevent DB type errors)
      description: description.trim() || null,
      shortDescription: shortDescription.trim() || null,
      photo: photo.trim() || null,
      photos: photos.trim() || null,
      thumbnail: thumbnail.trim() || null,
      foodType: foodType.trim() || null,
      cuisineType: cuisineType.trim() || null,
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
      const response = await updateMasterProduct(
        selectedProduct.masterProductId,
        payload
      );

      if (response?.status === 200 || response?.status === 204) {
        alert("✅ Product updated successfully!");
        setActivePage("masterProducts");
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

  return (
    <div className="edit-product-page">
      <button
        type="button"
        className="back-btn"
        onClick={() => setActivePage("masterProducts")}
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
              <label htmlFor="foodType">Food Type</label>
              <input
                id="foodType"
                type="text"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cuisineType">Cuisine Type</label>
              <input
                id="cuisineType"
                type="text"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
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

        {/* ================= CATEGORY DETAILS ================= */}
        <div className="form-card">
          <h2>📂 Category Details</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="subCategoryId">Sub Category</label>
              <select
                id="subCategoryId"
                value={subCategoryId}
                onChange={handleSubCategoryChange}
                disabled={
                  loadingCategories ||
                  isOtherCategory ||
                  (!categoryId && availableSubCategories.length === 0)
                }
              >
                <option value="">
                  {isOtherCategory
                    ? "N/A (Creating New Category)"
                    : !categoryId
                    ? "Select a main category first"
                    : availableSubCategories.length === 0 && !subCategoryId
                    ? "No Sub Categories Available"
                    : "-- Select Sub Category --"}
                </option>

                {subCategoryId &&
                  !availableSubCategories.some(
                    (s) =>
                      String(s.subCategoryId || s.id) === String(subCategoryId)
                  ) && (
                    <option value={subCategoryId}>
                      {subCategoryName
                        ? `${subCategoryName} (Current)`
                        : `Sub Category ID: ${subCategoryId}`}
                    </option>
                  )}

                {availableSubCategories.map((sub) => {
                  const sId = String(sub.subCategoryId || sub.id);
                  const sName = sub.subCategoryName || sub.name;
                  const isCurrentSub = sId === String(subCategoryId);

                  return (
                    <option key={sId} value={sId}>
                      {sName} {isCurrentSub ? "(Current)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* ================= OPTIONS ================= */}
        <div className="form-card">
          <h2>⚙️ Options</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="hasOptions">Has Options</label>
              <select
                id="hasOptions"
                value={hasOptions}
                onChange={(e) => setHasOptions(Number(e.target.value))}
              >
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="optionsEnabled">Options Enabled</label>
              <select
                id="optionsEnabled"
                value={optionsEnabled}
                onChange={(e) => setOptionsEnabled(Number(e.target.value))}
              >
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label htmlFor="options">Options JSON Payload</label>
              <textarea
                id="options"
                rows="3"
                placeholder='{"size": "large"} or []'
                value={options}
                onChange={(e) => setOptions(e.target.value)}
              />
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

        {/* ================= CSV DETAILS ================= */}
        <div className="form-card">
          <h2>📄 CSV Details</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="csvMerchantPrice">CSV Merchant Price</label>
              <input
                id="csvMerchantPrice"
                type="number"
                value={csvMerchantPrice}
                onChange={(e) => setCsvMerchantPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="csvTiming">CSV Timing</label>
              <input
                id="csvTiming"
                type="text"
                value={csvTiming}
                onChange={(e) => setCsvTiming(e.target.value)}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="csvDayOfWeek">CSV Day Of Week</label>
              <input
                id="csvDayOfWeek"
                type="text"
                value={csvDayOfWeek}
                onChange={(e) => setCsvDayOfWeek(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ================= BUTTONS ================= */}
        <div className="button-group">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setActivePage("masterProducts")}
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
  setActivePage: PropTypes.func.isRequired,
};

export default EditMasterProduct;