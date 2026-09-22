
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

import { FM_API } from "../services/api";
import { getAllCategories } from "../services/masterProductsService";

import "../styles/EditMasterProduct.css";

function CreateMasterProduct({ setActivePage }) {
  const navigate = useNavigate();

  // ============================================================
  // CATEGORY STATE
  // ============================================================

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  // ============================================================
  // PRODUCT STATE
  // ============================================================

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // ============================================================
  // IMAGE STATE
  // ============================================================

  const [photo, setPhoto] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");

  // Kept for compatibility with the existing API structure.
  const [photos, setPhotos] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  // ============================================================
  // CATEGORY STATE
  // ============================================================

  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  // ============================================================
  // PRODUCT TYPE / VEG / ACTIVE
  // ============================================================

  // Database column:
  // is_veg boolean
  const [veg, setVeg] = useState(true);

  // Database column:
  // product_type varchar(10)
  // Allowed values: P / PV
  const [productType, setProductType] = useState("P");

  // Existing UI uses:
  // 1 = Y
  // 0 = N
  const [publish, setPublish] = useState(1);

  // ============================================================
  // NUTRITION STATE
  // ============================================================

  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fats, setFats] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [grams, setGrams] = useState(0);

  // ============================================================
  // GET CURRENT LOGGED-IN USER ID
  // ============================================================

  const getCurrentUserId = () => {
    const directKeys = [
      "userId",
      "user_id",
      "currentUserId",
      "current_user_id",
      "loggedInUserId",
      "logged_in_user_id",
      "loginUserId",
      "login_user_id",
    ];

    // ----------------------------------------------------------
    // First check direct localStorage values
    // ----------------------------------------------------------

    for (const key of directKeys) {
      try {
        const value = localStorage.getItem(key);

        if (
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
        ) {
          const numberValue = Number(value);

          if (Number.isFinite(numberValue)) {
            return numberValue;
          }
        }
      } catch (error) {
        console.warn(
          `Could not read localStorage key "${key}"`,
          error
        );
      }
    }

    // ----------------------------------------------------------
    // Then check common user objects
    // ----------------------------------------------------------

    const userObjectKeys = [
      "user",
      "currentUser",
      "loggedInUser",
      "loginUser",
      "authUser",
    ];

    for (const key of userObjectKeys) {
      try {
        const value = localStorage.getItem(key);

        if (!value) {
          continue;
        }

        const userObject = JSON.parse(value);

        if (
          !userObject ||
          typeof userObject !== "object"
        ) {
          continue;
        }

        const possibleIds = [
          userObject.userId,
          userObject.user_id,
          userObject.id,
          userObject.employeeId,
          userObject.employee_id,
        ];

        for (const id of possibleIds) {
          if (
            id !== null &&
            id !== undefined &&
            String(id).trim() !== ""
          ) {
            const numberValue = Number(id);

            if (Number.isFinite(numberValue)) {
              return numberValue;
            }
          }
        }
      } catch (error) {
        console.warn(
          `Could not parse localStorage user object "${key}"`,
          error
        );
      }
    }

    return null;
  };

  // ============================================================
  // BACK NAVIGATION
  // ============================================================

  const handleBackNavigation = () => {
    if (typeof setActivePage === "function") {
      setActivePage("masterProducts");
      return;
    }

    navigate("/dashboard/masterProducts");
  };

  // ============================================================
  // EXTRACT CATEGORY LIST
  // ============================================================

  const extractCategories = (response) => {
    if (!response) {
      return [];
    }

    const responseData = response.data;

    // Direct array
    if (Array.isArray(responseData)) {
      return responseData;
    }

    // Common API response formats
    if (Array.isArray(responseData?.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData?.content)) {
      return responseData.content;
    }

    if (Array.isArray(responseData?.categories)) {
      return responseData.categories;
    }

    if (Array.isArray(responseData?.result)) {
      return responseData.result;
    }

    return [];
  };

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        setCategoriesError("");

        console.log(
          "Loading categories using getAllCategories('ALL')..."
        );

        // IMPORTANT:
        // Use the existing project service.
        // Do NOT call guessed category URLs here.
        const response = await getAllCategories("ALL");

        console.log(
          "CATEGORY API RESPONSE:",
          response
        );

        if (!mounted) {
          return;
        }

        const categoryData =
          extractCategories(response);

        console.log(
          "CATEGORY DATA:",
          categoryData
        );

        setCategories(categoryData);

        if (categoryData.length === 0) {
          console.warn(
            "Category API returned no category records."
          );
        }
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );

        if (!mounted) {
          return;
        }

        setCategories([]);

        const status =
          error?.response?.status;

        const serverMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "";

        if (status === 404) {
          setCategoriesError(
            "Category API endpoint was not found. Please check the category service endpoint."
          );
        } else if (status === 500) {
          setCategoriesError(
            serverMessage ||
              "The server returned an error while loading categories."
          );
        } else {
          setCategoriesError(
            serverMessage ||
              "Could not load categories from the server."
          );
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

  // ============================================================
  // CATEGORY CHANGE
  // ============================================================

  const handleCategoryChange = (event) => {
    const selectedId = event.target.value;

    // Other category
    if (selectedId === "OTHER") {
      setIsOtherCategory(true);
      setCategoryId("");
      setCategoryName("");
      return;
    }

    setIsOtherCategory(false);
    setCustomCategoryName("");
    setCategoryId(selectedId);

    const selectedCategory =
      categories.find((category) => {
        const id =
          category?.categoryId ??
          category?.category_id ??
          category?.id;

        return (
          String(id) ===
          String(selectedId)
        );
      });

    if (selectedCategory) {
      const name =
        selectedCategory?.categoryName ??
        selectedCategory?.category_name ??
        selectedCategory?.name ??
        "";

      setCategoryName(String(name));
    } else {
      setCategoryName("");
    }
  };

  // ============================================================
  // IMAGE CHANGE
  // ============================================================

  const handlePhotoChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      setPhoto("");
      setPhotoPreview("");
      return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {
      alert(
        "Please select a valid image file."
      );

      event.target.value = "";

      setPhoto("");
      setPhotoPreview("");

      return;
    }

    // Remove previous object URL
    if (photoPreview) {
      try {
        URL.revokeObjectURL(
          photoPreview
        );
      } catch {
        // Ignore
      }
    }

    const previewUrl =
      URL.createObjectURL(file);

    setPhotoPreview(previewUrl);

    // Convert image to Base64
    // so it can be sent in the existing JSON payload.
    const reader =
      new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setPhoto(
          reader.result
        );
      } else {
        setPhoto("");
      }
    };

    reader.onerror = () => {
      console.error(
        "Could not read selected image."
      );

      alert(
        "Could not read the selected image."
      );

      setPhoto("");
      setPhotoPreview("");
    };

    reader.readAsDataURL(file);
  };

  // ============================================================
  // CLEAR FORM
  // ============================================================

  const clearForm = () => {
    setProductName("");
    setDescription("");
    setShortDescription("");

    if (photoPreview) {
      try {
        URL.revokeObjectURL(
          photoPreview
        );
      } catch {
        // Ignore
      }
    }

    setPhoto("");
    setPhotoPreview("");

    setPhotos("");
    setThumbnail("");

    setCategoryId("");
    setCategoryName("");

    setIsOtherCategory(false);
    setCustomCategoryName("");

    setVeg(true);
    setProductType("P");
    setPublish(1);

    setCalories(0);
    setProtein(0);
    setFats(0);
    setCarbs(0);
    setGrams(0);
  };

  // ============================================================
  // CREATE MASTER PRODUCT
  // ============================================================

  const handleCreate = async (event) => {
    event.preventDefault();

    // ----------------------------------------------------------
    // Validate product name
    // ----------------------------------------------------------

    if (!productName.trim()) {
      alert(
        "Please enter product name."
      );
      return;
    }

    // ----------------------------------------------------------
    // Validate category
    // ----------------------------------------------------------

    if (
      isOtherCategory &&
      !customCategoryName.trim()
    ) {
      alert(
        "Please enter a new category name."
      );
      return;
    }

    if (
      !isOtherCategory &&
      !categoryId
    ) {
      alert(
        "Please select a category."
      );
      return;
    }

    // ----------------------------------------------------------
    // Validate product type
    // ----------------------------------------------------------

    if (
      productType !== "P" &&
      productType !== "PV"
    ) {
      alert(
        "Product Type must be P or PV."
      );
      return;
    }

    // ----------------------------------------------------------
    // Category values
    // ----------------------------------------------------------

    const finalCategoryId =
      isOtherCategory
        ? null
        : categoryId
        ? Number(categoryId)
        : null;

    const finalCategoryName =
      isOtherCategory
        ? customCategoryName.trim()
        : categoryName.trim() ||
          null;

    // ----------------------------------------------------------
    // Current user
    // ----------------------------------------------------------

    const currentUserId =
      getCurrentUserId();

    console.log(
      "========================================"
    );

    console.log(
      "CREATE MASTER PRODUCT"
    );

    console.log(
      "Current Logged-In User ID:",
      currentUserId
    );

    console.log(
      "Product Type:",
      productType
    );

    console.log(
      "IS VEG:",
      veg
    );

    console.log(
      "IS ACTIVE:",
      publish
    );

    console.log(
      "========================================"
    );

    if (
      currentUserId === null ||
      !Number.isFinite(
        currentUserId
      )
    ) {
      alert(
        "Could not determine the logged-in user ID. Please login again."
      );
      return;
    }

    // ----------------------------------------------------------
    // FINAL PAYLOAD
    // ----------------------------------------------------------
    //
    // Database mapping:
    //
    // master_product_name -> masterProductName
    // description         -> description
    // photo               -> photo
    // category_id         -> categoryId
    // category_name       -> categoryName
    // is_veg              -> isVeg
    // has_options         -> hasOptions
    // product_type        -> productType
    // is_active           -> publish
    // created_by          -> createdBy
    //
    // created_at is intentionally NOT generated by React.
    // Backend/database should use CURRENT_TIMESTAMP.
    // ----------------------------------------------------------

    const payload = {
      masterProductName:
        productName.trim(),

      description:
        description.trim() ||
        null,

      shortDescription:
        shortDescription.trim() ||
        null,

      photo:
        photo || null,

      photos:
        photos.trim() || null,

      thumbnail:
        thumbnail.trim() || null,

      categoryId:
        finalCategoryId,

      categoryName:
        finalCategoryName,

      subCategoryId:
        null,

      subCategoryName:
        null,

      // Compatibility field
      veg:
        veg ? 1 : 0,

      // PostgreSQL boolean
      isVeg:
        Boolean(veg),

      cuisineType:
        null,

      foodType:
        null,

      hasOptions:
        0,

      optionsEnabled:
        0,

      options:
        null,

      // P or PV
      productType:
        productType,

      // 1 = active
      // 0 = inactive
      publish:
        Number(publish),

      // Current logged-in user
      createdBy:
        currentUserId,
    };

    console.log(
      "========================================"
    );

    console.log(
      "FINAL CREATE PRODUCT PAYLOAD"
    );

    console.log(
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    console.log(
      "createdBy =",
      payload.createdBy
    );

    console.log(
      "productType =",
      payload.productType
    );

    console.log(
      "isVeg =",
      payload.isVeg
    );

    console.log(
      "publish =",
      payload.publish
    );

    console.log(
      "========================================"
    );

    // ----------------------------------------------------------
    // POST API
    // ----------------------------------------------------------

    try {
      const response =
        await FM_API.post(
          "/api/fm/master-products",
          payload
        );

      console.log(
        "CREATE API RESPONSE:",
        response
      );

      if (
        response?.status === 200 ||
        response?.status === 201
      ) {
        alert(
          "Product created successfully!"
        );

        handleBackNavigation();

        return;
      }

      alert(
        "Product creation failed."
      );
    } catch (error) {
      console.error(
        "========================================"
      );

      console.error(
        "CREATE MASTER PRODUCT ERROR"
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "Payload:",
        payload
      );

      console.error(
        "========================================"
      );

      const serverMessage =
        error?.response?.data?.message ??
        error?.response?.data?.error ??
        error?.response?.data?.detail;

      alert(
        serverMessage ||
          "Failed to create master product."
      );
    }
  };

  // ============================================================
  // JSX
  // ============================================================

  return (
    <div className="edit-product-page">

      {/* BACK BUTTON */}
      <button
        type="button"
        className="back-btn"
        onClick={
          handleBackNavigation
        }
      >
        ← Back
      </button>

      {/* TITLE */}
      <h1>
        Create Master Product
      </h1>

      <p className="edit-subtitle">
        Fill the details below to create a new product.
      </p>

      {/* CATEGORY ERROR */}
      {categoriesError && (
        <div className="alert-banner error-banner">
          ⚠️ {categoriesError}
        </div>
      )}

      {/* FORM */}
      <form
        className="edit-form"
        onSubmit={handleCreate}
      >

        {/* ====================================================
            PRODUCT INFORMATION
            ==================================================== */}

        <div className="form-card">

          <h2>
            📦 Product Information
          </h2>

          <div className="form-grid">

            {/* PRODUCT NAME */}
            <div className="form-group">

              <label>
                Product Name *
              </label>

              <input
                type="text"
                value={productName}
                onChange={(event) =>
                  setProductName(
                    event.target.value
                  )
                }
                placeholder="Enter product name"
                required
              />

            </div>

            {/* CATEGORY */}
            <div className="form-group">

              <label>
                Category *
              </label>

              <select
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
                required
              >

                <option value="">
                  {loadingCategories
                    ? "Loading categories..."
                    : "-- Select Category --"}
                </option>

                {categories.map(
                  (
                    category,
                    index
                  ) => {

                    const id =
                      category?.categoryId ??
                      category?.category_id ??
                      category?.id ??
                      `category-${index}`;

                    const name =
                      category?.categoryName ??
                      category?.category_name ??
                      category?.name ??
                      `Category ${
                        index + 1
                      }`;

                    return (
                      <option
                        key={String(id)}
                        value={String(id)}
                      >
                        {name}
                      </option>
                    );
                  }
                )}

                <option value="OTHER">
                  + Other (Create New)
                </option>

              </select>

            </div>

            {/* NEW CATEGORY */}
            {isOtherCategory && (
              <div className="form-group full-width">

                <label>
                  New Category Name *
                </label>

                <input
                  type="text"
                  value={
                    customCategoryName
                  }
                  onChange={(event) =>
                    setCustomCategoryName(
                      event.target.value
                    )
                  }
                  placeholder="Enter new category name"
                  required
                />

              </div>
            )}

            {/* IMAGE */}
            <div className="form-group">

              <label>
                IMAGE
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={
                  handlePhotoChange
                }
              />

              {photoPreview && (
                <div
                  style={{
                    marginTop:
                      "10px",
                  }}
                >

                  <img
                    src={photoPreview}
                    alt="Selected product"
                    style={{
                      width:
                        "120px",
                      height:
                        "120px",
                      objectFit:
                        "cover",
                      borderRadius:
                        "8px",
                      border:
                        "1px solid #ddd",
                    }}
                  />

                </div>
              )}

            </div>

            {/* PRODUCT TYPE */}
            <div className="form-group">

              <label>
                PRODUCT-TYPE
              </label>

              <select
                value={productType}
                onChange={(event) => {

                  const value =
                    event.target.value;

                  if (
                    value === "P" ||
                    value === "PV"
                  ) {
                    setProductType(
                      value
                    );
                  }

                }}
              >

                <option value="P">
                  P
                </option>

                <option value="PV">
                  PV
                </option>

              </select>

            </div>

            {/* IS VEG */}
            <div className="form-group">

              <label>
                IS-VEG
              </label>

              <select
                value={
                  veg
                    ? "true"
                    : "false"
                }
                onChange={(event) =>
                  setVeg(
                    event.target.value ===
                      "true"
                  )
                }
              >

                <option value="true">
                  True
                </option>

                <option value="false">
                  False
                </option>

              </select>

            </div>

            {/* IS ACTIVE */}
            <div className="form-group">

              <label>
                IS-ACTIVE
              </label>

              <select
                value={publish}
                onChange={(event) =>
                  setPublish(
                    Number(
                      event.target.value
                    )
                  )
                }
              >

                <option value={1}>
                  Y
                </option>

                <option value={0}>
                  N
                </option>

              </select>

            </div>

            {/* DESCRIPTION */}
            <div className="form-group full-width">

              <label>
                Description
              </label>

              <textarea
                rows="4"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Enter product description"
              />

            </div>

            {/* SHORT DESCRIPTION */}
            {/* <div className="form-group full-width">

              <label>
                Short Description
              </label>

              <textarea
                rows="3"
                value={
                  shortDescription
                }
                onChange={(event) =>
                  setShortDescription(
                    event.target.value
                  )
                }
                placeholder="Enter short description"
              />

            </div> */}

          </div>
        </div>

        {/* ====================================================
            BUTTONS
            ==================================================== */}

        <div className="button-group">

          <button
            type="button"
            className="cancel-btn"
            onClick={
              handleBackNavigation
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
          >
            Create
          </button>

        </div>

      </form>
    </div>
  );
}

// ============================================================
// PROP TYPES
// ============================================================

CreateMasterProduct.propTypes = {
  setActivePage:
    PropTypes.func,
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default CreateMasterProduct;

