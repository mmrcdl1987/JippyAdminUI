import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../services/categoryService";
import {
  FiArrowLeft,
  FiUploadCloud,
  FiX,
  FiImage,
} from "react-icons/fi";
import "../styles/CreateCategory.css";

function CreateCategory({ setRefreshCategories }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ============================================================
  // FORM STATE
  // ============================================================
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("HOME");

  // Actual File object
  const [categoryImage, setCategoryImage] = useState(null);

  // Local image preview URL
  const [imagePreview, setImagePreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  // ============================================================
  // IMAGE VALIDATION
  // ============================================================
  //
  // Backend currently validates image content using ImageIO.
  // To avoid WEBP validation problems, only allow:
  // JPG / JPEG / PNG
  //
  // Backend max size = 5 MB
  // ============================================================
  const validateImage = (file) => {
    if (!file) {
      return false;
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
    ];

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
    ];

    const fileName = file.name?.toLowerCase() || "";

    const hasValidMimeType =
      allowedMimeTypes.includes(file.type);

    const hasValidExtension =
      allowedExtensions.some((extension) =>
        fileName.endsWith(extension)
      );

    if (!hasValidMimeType || !hasValidExtension) {
      alert(
        "Only JPG, JPEG and PNG images are allowed."
      );
      return false;
    }

    // 5 MB
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(
        "Category image size cannot exceed 5 MB."
      );
      return false;
    }

    return true;
  };

  // ============================================================
  // HANDLE FILE SELECTION
  // ============================================================
  const handleFileSelect = (file) => {
    if (!file) {
      return;
    }

    if (saving) {
      return;
    }

    if (!validateImage(file)) {
      return;
    }

    // Revoke old preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // Store actual File
    setCategoryImage(file);

    // Create local preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // ============================================================
  // FILE INPUT CHANGE
  // ============================================================
  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }

    // Allow selecting same file again
    event.target.value = "";
  };

  // ============================================================
  // OPEN FILE PICKER
  // ============================================================
  const openFilePicker = () => {
    if (saving) {
      return;
    }

    fileInputRef.current?.click();
  };

  // ============================================================
  // DRAG OVER
  // ============================================================
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!saving) {
      setDragging(true);
    }
  };

  // ============================================================
  // DRAG LEAVE
  // ============================================================
  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);
  };

  // ============================================================
  // DROP
  // ============================================================
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);

    if (saving) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  // ============================================================
  // REMOVE SELECTED IMAGE
  // ============================================================
  const handleRemoveImage = (event) => {
    event.stopPropagation();

    if (saving) {
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setCategoryImage(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // CREATE CATEGORY
  // ============================================================
  const handleSave = async () => {
    // ----------------------------------------------------------
    // Validate category name
    // ----------------------------------------------------------
    if (!categoryName.trim()) {
      alert("Category Name is required.");
      return;
    }

    // ----------------------------------------------------------
    // Validate category type
    // ----------------------------------------------------------
    if (!categoryType) {
      alert("Category Type is required.");
      return;
    }

    // ----------------------------------------------------------
    // Prevent duplicate request
    // ----------------------------------------------------------
    if (saving) {
      return;
    }

    // ----------------------------------------------------------
    // Get logged-in user ID
    // ----------------------------------------------------------
    const loggedInUserId = parseInt(
      localStorage.getItem("userId") || "1073741824",
      10
    );

    // ----------------------------------------------------------
    // Create multipart FormData
    // ----------------------------------------------------------
    const formData = new FormData();

    formData.append(
      "categoryName",
      categoryName.trim()
    );

    formData.append(
      "categoryType",
      categoryType
    );

    formData.append(
      "createdBy",
      loggedInUserId.toString()
    );

    // ==========================================================
    // IMPORTANT
    // ==========================================================
    //
    // CREATE backend expects:
    //
    // request.getCategoryImageUrl()
    //
    // Therefore the MultipartFile must be sent as:
    //
    // categoryImageUrl
    //
    // Do NOT send "categoryImage" here.
    // ==========================================================
    if (categoryImage) {
      formData.append(
        "categoryImageUrl",
        categoryImage,
        categoryImage.name
      );
    }

    // ----------------------------------------------------------
    // Debug request
    // ----------------------------------------------------------
    console.log(
      "========== CREATE CATEGORY REQUEST =========="
    );

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, {
          name: value.name,
          type: value.type,
          size: value.size,
        });
      } else {
        console.log(key, value);
      }
    }

    console.log(
      "=============================================="
    );

    try {
      setSaving(true);

      // --------------------------------------------------------
      // Send multipart request
      // --------------------------------------------------------
      const response = await createCategory(
        formData
      );

      console.log(
        "CREATE CATEGORY RESPONSE:",
        response
      );

      alert(
        response?.message ||
          "Category created successfully!"
      );

      // --------------------------------------------------------
      // Refresh categories
      // --------------------------------------------------------
      if (
        typeof setRefreshCategories ===
        "function"
      ) {
        setRefreshCategories(
          (previous) => previous + 1
        );
      }

      // --------------------------------------------------------
      // Navigate back
      // --------------------------------------------------------
      navigate("/dashboard/categories");

    } catch (error) {
      console.error(
        "CREATE CATEGORY ERROR:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create category.";

      alert(message);

    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CANCEL
  // ============================================================
  const handleCancel = () => {
    if (saving) {
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    navigate("/dashboard/categories");
  };

  // ============================================================
  // CLEANUP OBJECT URL
  // ============================================================
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="create-category-page">

      {/* ======================================================
          PAGE HEADER
          ====================================================== */}
      <div className="page-header-container">

        <div
          className="breadcrumb-header"
          onClick={handleCancel}
        >
          <FiArrowLeft className="back-arrow-icon" />

          <h2>Add Category</h2>
        </div>

        <p className="breadcrumb-trail">
          <span onClick={handleCancel}>
            Categories
          </span>

          {" > "}

          Add Category
        </p>

      </div>

      {/* ======================================================
          CATEGORY CARD
          ====================================================== */}
      <div className="category-card">

        <div className="card-section-title">
          <h3>Category Information</h3>

          <p>
            Provide details to add a new category
            to your system.
          </p>
        </div>

        <div className="category-form">

          {/* ==================================================
              CATEGORY NAME + TYPE
              ================================================== */}
          <div className="form-row">

            {/* Category Name */}
            <div className="form-group">

              <label>
                Category Name{" "}
                <span>*</span>
              </label>

              <input
                type="text"
                placeholder="e.g., Pizza"
                value={categoryName}
                onChange={(event) =>
                  setCategoryName(
                    event.target.value
                  )
                }
                disabled={saving}
              />

            </div>

            {/* Category Type */}
            <div className="form-group">

              <label>
                Category Type{" "}
                <span>*</span>
              </label>

              <select
                value={categoryType}
                onChange={(event) =>
                  setCategoryType(
                    event.target.value
                  )
                }
                disabled={saving}
              >

                <option value="HOME">
                  HOME
                </option>

                <option value="ALL">
                  ALL
                </option>

              </select>

            </div>

          </div>

          {/* ==================================================
              CATEGORY PROFILE IMAGE
              ================================================== */}
          <div className="form-group">

            <label>
              Category Profile Image
            </label>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              style={{
                display: "none",
              }}
              onChange={
                handleFileInputChange
              }
              disabled={saving}
            />

            {/* =================================================
                DROPZONE
                ================================================= */}
            {!imagePreview && (
              <div
                className={`dropzone ${
                  dragging
                    ? "dragging"
                    : ""
                }`}
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={handleDrop}
                onClick={
                  openFilePicker
                }
              >

                <div className="dropzone-content">

                  <FiUploadCloud
                    className="upload-icon"
                  />

                  <p>
                    Drag and drop your image here,
                    or{" "}
                    <strong>
                      browse
                    </strong>
                  </p>

                  <small>
                    Supports JPG, JPEG and PNG
                    {" "}
                    (Max 5 MB)
                  </small>

                </div>

              </div>
            )}

            {/* =================================================
                IMAGE PREVIEW
                ================================================= */}
            {imagePreview && (
              <div
                className="category-image-preview"
                style={{
                  marginTop: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                }}
              >

                {/* Image */}
                <div
                  style={{
                    position: "relative",
                  }}
                >

                  <img
                    src={imagePreview}
                    alt="Category preview"
                    style={{
                      width: "110px",
                      height: "110px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      display: "block",
                    }}
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        "0 1px 5px rgba(0,0,0,0.2)",
                    }}
                  >
                    <FiImage size={14} />
                  </div>

                </div>

                {/* File information */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                  }}
                >

                  <strong>
                    {categoryImage?.name}
                  </strong>

                  {categoryImage && (
                    <small>
                      {(
                        categoryImage.size /
                        (1024 * 1024)
                      ).toFixed(2)}
                      {" "}
                      MB
                    </small>
                  )}

                  <small>
                    {categoryImage?.type}
                  </small>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={
                      handleRemoveImage
                    }
                    disabled={saving}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      width: "fit-content",
                      marginTop: "5px",
                      padding: "6px 10px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: saving
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >

                    <FiX size={14} />

                    Remove

                  </button>

                </div>

              </div>
            )}

          </div>

          {/* ==================================================
              BUTTONS
              ================================================== */}
          <div className="button-group-right">

            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? "Creating Category..."
                : "Save Category"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CreateCategory;