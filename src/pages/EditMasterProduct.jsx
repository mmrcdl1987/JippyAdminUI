
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

import {
  updateMasterProduct,
  getMasterProductById,
  getAllCategories,
} from "../services/masterProductsService";

import "../styles/EditMasterProduct.css";

function EditMasterProduct({
  selectedProduct,
  setSelectedProduct,
  setActivePage,
}) {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // Photo
  const [photo, setPhoto] = useState(null);
  const [existingPhoto, setExistingPhoto] = useState("");

  const [photos, setPhotos] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  // Product Type
  // ONLY:
  // P
  // PV
  const [productType, setProductType] = useState("");

  // Category
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  // IS VEG
  // true / false
  const [veg, setVeg] = useState(true);

  // Publish
  // 1 = Active
  // 0 = Inactive
  const [publish, setPublish] = useState(0);

  // Nutrition
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fats, setFats] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [grams, setGrams] = useState(0);

  // CSV
  const [csvMerchantPrice, setCsvMerchantPrice] = useState("");
  const [csvTiming, setCsvTiming] = useState("");
  const [csvDayOfWeek, setCsvDayOfWeek] = useState("");

  // Loading
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  // =========================================================
  // NORMALIZE PRODUCT TYPE
  // =========================================================

  const normalizeProductType = (value) => {
    if (value === "P" || value === "PV") {
      return value;
    }

    // Backward compatibility if old API returns numbers
    if (value === 1 || value === "1") {
      return "P";
    }

    if (value === 0 || value === "0") {
      return "PV";
    }

    return "";
  };

  // =========================================================
  // NORMALIZE VEG VALUE
  // =========================================================

  const normalizeVegValue = (value) => {
    if (
      value === true ||
      value === 1 ||
      value === "1" ||
      value === "true" ||
      value === "TRUE" ||
      value === "True"
    ) {
      return true;
    }

    return false;
  };

  // =========================================================
  // GET CURRENT LOGGED-IN USER ID
  //
  // The function checks common localStorage keys.
  // =========================================================

  const getCurrentUserId = () => {
    const possibleUserIdKeys = [
      "userId",
      "user_id",
      "currentUserId",
      "current_user_id",
      "loggedInUserId",
      "logged_in_user_id",
      "loginUserId",
      "login_user_id",
    ];

    // -------------------------------------------------------
    // Check direct user ID values
    // -------------------------------------------------------

    for (const key of possibleUserIdKeys) {
      const storedValue = localStorage.getItem(key);

      if (
        storedValue !== null &&
        storedValue !== undefined &&
        String(storedValue).trim() !== ""
      ) {
        const numericUserId = Number(storedValue);

        if (Number.isFinite(numericUserId)) {
          return numericUserId;
        }
      }
    }

    // -------------------------------------------------------
    // Check JSON user objects
    // -------------------------------------------------------

    const possibleUserObjectKeys = [
      "user",
      "currentUser",
      "loggedInUser",
      "loginUser",
      "authUser",
    ];

    for (const key of possibleUserObjectKeys) {
      const storedUser = localStorage.getItem(key);

      if (!storedUser) {
        continue;
      }

      try {
        const parsedUser = JSON.parse(storedUser);

        const possibleIds = [
          parsedUser?.userId,
          parsedUser?.user_id,
          parsedUser?.id,
          parsedUser?.employeeId,
          parsedUser?.employee_id,
        ];

        for (const id of possibleIds) {
          const numericUserId = Number(id);

          if (Number.isFinite(numericUserId)) {
            return numericUserId;
          }
        }
      } catch (error) {
        // Ignore invalid JSON
      }
    }

    return null;
  };

  // =========================================================
  // GET PRODUCT ID
  // =========================================================

  const getCurrentProductId = () => {
    if (
      selectedProduct?.masterProductId !== undefined &&
      selectedProduct?.masterProductId !== null
    ) {
      return selectedProduct.masterProductId;
    }

    const storedProductId = localStorage.getItem(
      "selectedMasterProductId"
    );

    return storedProductId;
  };

  // =========================================================
  // BACK
  // =========================================================

  const handleBackNavigation = () => {
    localStorage.removeItem("selectedMasterProductId");

    if (typeof setActivePage === "function") {
      setActivePage("masterProducts");
    } else {
      navigate("/dashboard/masterProducts");
    }
  };

  // =========================================================
  // LOAD PRODUCT AFTER PAGE REFRESH
  // =========================================================

  useEffect(() => {
    const loadProductAfterRefresh = async () => {
      if (selectedProduct) {
        return;
      }

      const storedProductId = localStorage.getItem(
        "selectedMasterProductId"
      );

      if (!storedProductId) {
        return;
      }

      try {
        setFetchingProduct(true);

        const response = await getMasterProductById(
          storedProductId
        );

        const productData =
          response?.data?.data ||
          response?.data ||
          null;

        if (
          productData &&
          typeof setSelectedProduct === "function"
        ) {
          setSelectedProduct(productData);
        }
      } catch (error) {
        console.error(
          "Failed to load product after refresh:",
          error
        );

        setSubmitError(
          "Failed to load product details."
        );
      } finally {
        setFetchingProduct(false);
      }
    };

    loadProductAfterRefresh();
  }, [selectedProduct, setSelectedProduct]);

  // =========================================================
  // SAVE PRODUCT ID
  // =========================================================

  useEffect(() => {
    if (
      selectedProduct?.masterProductId !== undefined &&
      selectedProduct?.masterProductId !== null
    ) {
      localStorage.setItem(
        "selectedMasterProductId",
        String(selectedProduct.masterProductId)
      );
    }
  }, [selectedProduct]);

  // =========================================================
  // LOAD SELECTED PRODUCT INTO FORM
  // =========================================================

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    console.log(
      "Selected Product for Edit:",
      selectedProduct
    );

    // -------------------------------------------------------
    // Product Name
    // -------------------------------------------------------

    setProductName(
      selectedProduct.masterProductName || ""
    );

    // -------------------------------------------------------
    // Description
    // -------------------------------------------------------

    setDescription(
      selectedProduct.description || ""
    );

    // -------------------------------------------------------
    // Short Description
    // -------------------------------------------------------

    setShortDescription(
      selectedProduct.shortDescription || ""
    );

    // -------------------------------------------------------
    // Photo
    // -------------------------------------------------------

    setExistingPhoto(
      selectedProduct.photo || ""
    );

    setPhoto(null);

    setPhotos(
      selectedProduct.photos || ""
    );

    setThumbnail(
      selectedProduct.thumbnail || ""
    );

    // -------------------------------------------------------
    // Product Type
    // -------------------------------------------------------

    setProductType(
      normalizeProductType(
        selectedProduct.productType
      )
    );

    // -------------------------------------------------------
    // Category
    // -------------------------------------------------------

    setCategoryId(
      selectedProduct.categoryId !== undefined &&
      selectedProduct.categoryId !== null
        ? String(selectedProduct.categoryId)
        : ""
    );

    setCategoryName(
      selectedProduct.categoryName || ""
    );

    // -------------------------------------------------------
    // IS VEG
    //
    // Database:
    // is_veg BOOLEAN
    // -------------------------------------------------------

    const apiVegValue =
      selectedProduct.isVeg !== undefined &&
      selectedProduct.isVeg !== null
        ? selectedProduct.isVeg
        : selectedProduct.veg;

    setVeg(
      normalizeVegValue(apiVegValue)
    );

    // -------------------------------------------------------
    // Publish / Active
    // -------------------------------------------------------

    const publishValue =
      selectedProduct.publish === 1 ||
      selectedProduct.publish === "1" ||
      selectedProduct.isActive === "Y" ||
      selectedProduct.isActive === "y" ||
      selectedProduct.isActive === true
        ? 1
        : 0;

    setPublish(publishValue);

    // -------------------------------------------------------
    // Nutrition
    // -------------------------------------------------------

    setCalories(
      selectedProduct.calories ?? 0
    );

    setProtein(
      selectedProduct.protein ?? 0
    );

    setFats(
      selectedProduct.fats ?? 0
    );

    setCarbs(
      selectedProduct.carbs ?? 0
    );

    setGrams(
      selectedProduct.grams ?? 0
    );

    // -------------------------------------------------------
    // CSV
    // -------------------------------------------------------

    setCsvMerchantPrice(
      selectedProduct.csvMerchantPrice ?? ""
    );

    setCsvTiming(
      selectedProduct.csvTiming || ""
    );

    setCsvDayOfWeek(
      selectedProduct.csvDayOfWeek || ""
    );

    // -------------------------------------------------------
    // Reset custom category
    // -------------------------------------------------------

    setIsOtherCategory(false);
    setCustomCategoryName("");
  }, [selectedProduct]);

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoriesError("");

        const response = await getAllCategories("ALL");

        const data =
          response?.data?.data ||
          response?.data ||
          [];

        const categoryList = Array.isArray(data)
          ? data
          : [];

        if (mounted) {
          setCategories(categoryList);
        }
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );

        if (mounted) {
          setCategoriesError(
            "Could not load categories."
          );

          setCategories([]);
        }
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;

    if (selectedId === "OTHER") {
      setIsOtherCategory(true);
      setCategoryId("");
      setCategoryName("");
      return;
    }

    setIsOtherCategory(false);
    setCustomCategoryName("");

    setCategoryId(selectedId);

    const selectedCategory = categories.find(
      (category) =>
        String(category.categoryId) ===
        String(selectedId)
    );

    if (selectedCategory) {
      setCategoryName(
        selectedCategory.categoryName || ""
      );
    } else {
      setCategoryName("");
    }
  };

  // =========================================================
  // PHOTO CHANGE
  // =========================================================

  const handlePhotoChange = (e) => {
    const selectedFile =
      e.target.files?.[0] || null;

    setPhoto(selectedFile);
  };

  // =========================================================
  // UPDATE PRODUCT
  // =========================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    setSubmitError("");

    // -------------------------------------------------------
    // Product ID
    // -------------------------------------------------------

    const currentProductId =
      getCurrentProductId();

    if (
      currentProductId === null ||
      currentProductId === undefined ||
      String(currentProductId).trim() === ""
    ) {
      setSubmitError(
        "Invalid product ID."
      );
      return;
    }

    const numericProductId =
      Number(currentProductId);

    if (!Number.isFinite(numericProductId)) {
      setSubmitError(
        "Invalid product ID."
      );
      return;
    }

    // -------------------------------------------------------
    // Product Type Validation
    // ONLY P / PV
    // -------------------------------------------------------

    if (
      productType !== "P" &&
      productType !== "PV"
    ) {
      setSubmitError(
        "Please select Product Type: P or PV."
      );
      return;
    }

    // -------------------------------------------------------
    // Product Name Validation
    // -------------------------------------------------------

    if (!productName.trim()) {
      setSubmitError(
        "Product name is required."
      );
      return;
    }

    // -------------------------------------------------------
    // Category Validation
    // -------------------------------------------------------

    if (
      isOtherCategory &&
      !customCategoryName.trim()
    ) {
      setSubmitError(
        "Please enter the new category name."
      );
      return;
    }

    if (
      !isOtherCategory &&
      !categoryId
    ) {
      setSubmitError(
        "Please select a category."
      );
      return;
    }

    // -------------------------------------------------------
    // Current Logged-In User ID
    // -------------------------------------------------------

    const currentUserId =
      getCurrentUserId();

    console.log(
      "Current Logged-In User ID:",
      currentUserId
    );

    // -------------------------------------------------------
    // Category
    // -------------------------------------------------------

    const finalCategoryId =
      isOtherCategory
        ? null
        : categoryId
        ? Number(categoryId)
        : null;

    const finalCategoryName =
      isOtherCategory
        ? customCategoryName.trim()
        : categoryName.trim();

    // -------------------------------------------------------
    // Veg
    //
    // IMPORTANT:
    // isVeg = boolean
    // veg   = 1 / 0 for old backend compatibility
    // -------------------------------------------------------

    const finalIsVeg = Boolean(veg);

    // -------------------------------------------------------
    // Photo
    //
    // Current API is JSON based.
    // If a new File is selected, the service must support
    // multipart/Base64 upload to actually replace it.
    //
    // Until then, preserve existing photo.
    // -------------------------------------------------------

    let finalPhoto = existingPhoto || null;

    if (photo instanceof File) {
      console.log(
        "New photo selected:",
        photo.name
      );

      // Keep existing photo because the current
      // update service sends JSON.
      finalPhoto =
        existingPhoto || null;
    }

    // -------------------------------------------------------
    // PAYLOAD
    // -------------------------------------------------------

    const payload = {
      // -----------------------------------------------------
      // Primary Key
      // -----------------------------------------------------

      masterProductId:
        numericProductId,

      // -----------------------------------------------------
      // Product Information
      // -----------------------------------------------------

      masterProductName:
        productName.trim(),

      description:
        description.trim() || null,

      shortDescription:
        shortDescription.trim() || null,

      // -----------------------------------------------------
      // Photo
      // -----------------------------------------------------

      photo:
        finalPhoto,

      photos:
        typeof photos === "string"
          ? photos.trim() || null
          : null,

      thumbnail:
        typeof thumbnail === "string"
          ? thumbnail.trim() || null
          : null,

      // -----------------------------------------------------
      // Category
      // -----------------------------------------------------

      categoryId:
        finalCategoryId,

      categoryName:
        finalCategoryName || null,

      // -----------------------------------------------------
      // Product Type
      //
      // DB:
      // product_type VARCHAR(10)
      //
      // Values:
      // P
      // PV
      // -----------------------------------------------------

      productType:
        productType,

      // -----------------------------------------------------
      // Veg
      //
      // DB:
      // is_veg BOOLEAN
      // -----------------------------------------------------

      isVeg:
        finalIsVeg,

      // Old backend compatibility
      veg:
        finalIsVeg ? 1 : 0,

      // -----------------------------------------------------
      // Options
      // -----------------------------------------------------

      hasOptions: 0,

      optionsEnabled: 0,

      options: null,

      subCategoryId: null,

      subCategoryName: null,

      foodType: null,

      cuisineType: null,

      // -----------------------------------------------------
      // Active / Publish
      // -----------------------------------------------------

      publish:
        Number(publish) === 1
          ? 1
          : 0,

      // -----------------------------------------------------
      // Nutrition
      // -----------------------------------------------------

      calories:
        calories === "" ||
        calories === null ||
        calories === undefined
          ? 0
          : Number(calories),

      protein:
        protein === "" ||
        protein === null ||
        protein === undefined
          ? 0
          : Number(protein),

      fats:
        fats === "" ||
        fats === null ||
        fats === undefined
          ? 0
          : Number(fats),

      carbs:
        carbs === "" ||
        carbs === null ||
        carbs === undefined
          ? 0
          : Number(carbs),

      grams:
        grams === "" ||
        grams === null ||
        grams === undefined
          ? 0
          : Number(grams),

      // -----------------------------------------------------
      // CSV
      // -----------------------------------------------------

      csvMerchantPrice:
        csvMerchantPrice === ""
          ? null
          : Number(csvMerchantPrice),

      csvTiming:
        csvTiming.trim() || null,

      csvDayOfWeek:
        csvDayOfWeek.trim() || null,
    };

    // =======================================================
    // UPDATED BY
    //
    // Only add it when a valid user ID exists.
    // This prevents updatedBy: NaN.
    // =======================================================

    if (
      currentUserId !== null &&
      Number.isFinite(currentUserId)
    ) {
      payload.updatedBy =
        currentUserId;
    }

    // =======================================================
    // DEBUG
    // =======================================================

    console.log(
      "================================================"
    );

    console.log(
      "UPDATE MASTER PRODUCT"
    );

    console.log(
      "Product ID:",
      numericProductId
    );

    console.log(
      "Current User ID:",
      currentUserId
    );

    console.log(
      "Product Type:",
      productType
    );

    console.log(
      "IS VEG:",
      finalIsVeg
    );

    console.log(
      "Payload:",
      payload
    );

    console.log(
      "================================================"
    );

    // =======================================================
    // SUBMIT
    // =======================================================

    try {
      setIsSubmitting(true);

      const response =
        await updateMasterProduct(
          numericProductId,
          payload
        );

      console.log(
        "Update Response:",
        response
      );

      if (
        response?.status === 200 ||
        response?.status === 201 ||
        response?.status === 204
      ) {
        alert(
          "Product updated successfully!"
        );

        handleBackNavigation();
        return;
      }

      // Some APIs return the data without status
      // being available in the service wrapper.
      if (response) {
        alert(
          "Product updated successfully!"
        );

        handleBackNavigation();
        return;
      }

      setSubmitError(
        "Product update failed."
      );
    } catch (error) {
      console.error(
        "========================================"
      );

      console.error(
        "UPDATE MASTER PRODUCT ERROR"
      );

      console.error(error);

      console.error(
        "Response:",
        error?.response
      );

      console.error(
        "Response Data:",
        error?.response?.data
      );

      console.error(
        "========================================"
      );

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.detail;

      setSubmitError(
        backendMessage ||
          error?.message ||
          "Failed to update master product."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (fetchingProduct) {
    return (
      <div className="edit-product-page">
        <h1>
          Edit Master Product
        </h1>

        <p>
          Loading product details...
        </p>
      </div>
    );
  }

  // =========================================================
  // NO PRODUCT
  // =========================================================

  if (!selectedProduct) {
    return (
      <div className="edit-product-page">
        <button
          type="button"
          className="back-btn"
          onClick={
            handleBackNavigation
          }
        >
          ← Back
        </button>

        <h1>
          Edit Master Product
        </h1>

        <div
          className="alert-banner error-banner"
          style={{
            marginTop: "20px",
          }}
        >
          No product selected for editing.
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="edit-product-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <button
        type="button"
        className="back-btn"
        onClick={
          handleBackNavigation
        }
        disabled={isSubmitting}
      >
        ← Back
      </button>

      <h1>
        Edit Master Product
      </h1>

      <p className="edit-subtitle">
        Update product details below.
      </p>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {categoriesError && (
        <div className="alert-banner error-banner">
          ⚠️ {categoriesError}
        </div>
      )}

      {submitError && (
        <div className="alert-banner error-banner">
          ❌ {submitError}
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        className="edit-form"
        onSubmit={handleUpdate}
      >
        {/* ===================================================
            REQUIRED INFORMATION
        =================================================== */}

        <div className="form-card">
          <h2>
            📦 Product Information
          </h2>

          <div className="form-grid">
            {/* Product Name */}
            <div className="form-group">
              <label htmlFor="productName">
                Product Name *
              </label>

              <input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) =>
                  setProductName(
                    e.target.value
                  )
                }
                required
              />
            </div>

            {/* =================================================
                PRODUCT TYPE
                ONLY P / PV
            ================================================= */}

            <div className="form-group">
              <label htmlFor="productType">
                Product Type *
              </label>

              <select
                id="productType"
                value={
                  productType === "P" ||
                  productType === "PV"
                    ? productType
                    : ""
                }
                onChange={(e) =>
                  setProductType(
                    e.target.value
                  )
                }
                required
              >
                <option value="">
                  -- Select Product Type --
                </option>

                <option value="P">
                  P
                </option>

                <option value="PV">
                  PV
                </option>
              </select>
            </div>

            {/* =================================================
                CATEGORY
            ================================================= */}

            <div className="form-group">
              <label htmlFor="categoryId">
                Category *
              </label>

              <select
                id="categoryId"
                value={
                  isOtherCategory
                    ? "OTHER"
                    : categoryId
                }
                onChange={
                  handleCategoryChange
                }
                disabled={
                  loadingCategories
                }
                required={!isOtherCategory}
              >
                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : "-- Select Category --"}
                </option>

                {/* Current category if API did not return it */}
                {categoryId &&
                  !isOtherCategory &&
                  !categories.some(
                    (category) =>
                      String(
                        category.categoryId
                      ) ===
                      String(
                        categoryId
                      )
                  ) && (
                    <option
                      value={
                        categoryId
                      }
                    >
                      {categoryName ||
                        `Category ID: ${categoryId}`}{" "}
                      (Current)
                    </option>
                  )}

                {/* Categories */}
                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.categoryId
                      }
                      value={String(
                        category.categoryId
                      )}
                    >
                      {
                        category.categoryName
                      }
                    </option>
                  )
                )}

                <option value="OTHER">
                  + Other (Create New)
                </option>
              </select>
            </div>

            {/* =================================================
                CUSTOM CATEGORY
            ================================================= */}

            {isOtherCategory && (
              <div className="form-group full-width">
                <label htmlFor="customCategoryName">
                  New Category Name *
                </label>

                <input
                  id="customCategoryName"
                  type="text"
                  value={
                    customCategoryName
                  }
                  onChange={(e) =>
                    setCustomCategoryName(
                      e.target.value
                    )
                  }
                  placeholder="Enter new category name"
                  required
                />
              </div>
            )}

            {/* =================================================
                PHOTO
            ================================================= */}

            <div className="form-group">
              <label htmlFor="photo">
                Photo
              </label>

              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={
                  handlePhotoChange
                }
              />

              {photo && (
                <small
                  style={{
                    display: "block",
                    marginTop: "8px",
                  }}
                >
                  Selected file:{" "}
                  {photo.name}
                </small>
              )}

              {!photo &&
                existingPhoto && (
                  <small
                    style={{
                      display: "block",
                      marginTop: "8px",
                    }}
                  >
                    Existing photo will be
                    preserved.
                  </small>
                )}
            </div>

            {/* =================================================
                IS VEG
                TRUE / FALSE
            ================================================= */}

            <div className="form-group">
              <label htmlFor="veg">
                IS-VEG
              </label>

              <select
                id="veg"
                value={
                  veg ? "true" : "false"
                }
                onChange={(e) => {
                  setVeg(
                    e.target.value ===
                      "true"
                  );
                }}
              >
                <option value="true">
                  True
                </option>

                <option value="false">
                  False
                </option>
              </select>
            </div>

            {/* =================================================
                IS ACTIVE
            ================================================= */}

            <div className="form-group">
              <label htmlFor="publish">
                Is-Active
              </label>

              <select
                id="publish"
                value={
                  Number(publish) === 1
                    ? "1"
                    : "0"
                }
                onChange={(e) => {
                  setPublish(
                    e.target.value ===
                      "1"
                      ? 1
                      : 0
                  );
                }}
              >
                <option value="1">
                  Y
                </option>

                <option value="0">
                  N
                </option>
              </select>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="form-group full-width">
              <label htmlFor="description">
                Description
              </label>

              <textarea
                id="description"
                rows="4"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
              />
            </div>

            {/* =================================================
                SHORT DESCRIPTION
            ================================================= */}

            {/* <div className="form-group full-width">
              <label htmlFor="shortDescription">
                Short Description
              </label>

              <textarea
                id="shortDescription"
                rows="2"
                value={
                  shortDescription
                }
                onChange={(e) =>
                  setShortDescription(
                    e.target.value
                  )
                }
              />
            </div> */}
          </div>
        </div>

        {/* ===================================================
            BUTTONS
        =================================================== */}

        <div className="button-group">
          <button
            type="button"
            className="cancel-btn"
            onClick={
              handleBackNavigation
            }
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Updating..."
              : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ===========================================================
// PROP TYPES
// ===========================================================

EditMasterProduct.propTypes = {
  selectedProduct: PropTypes.object,

  setSelectedProduct:
    PropTypes.func,

  setActivePage:
    PropTypes.func,
};

// ===========================================================
// EXPORT
// ===========================================================

export default EditMasterProduct;

