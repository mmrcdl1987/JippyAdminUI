import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUploadCloud,
  FiX,
  FiImage,
} from "react-icons/fi";
import { updateCategory } from "../services/categoryService";
import "../styles/CreateCategory.css";

function EditCategory({ selectedCategory }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ============================================================
  // FORM STATE
  // ============================================================
  const [categoryName, setCategoryName] = useState(
    selectedCategory?.categoryName || ""
  );

  const [categoryType, setCategoryType] = useState(
    selectedCategory?.categoryType || "HOME"
  );

  // Existing image URL returned by backend/S3
  const [existingImageUrl, setExistingImageUrl] = useState(
    selectedCategory?.categoryImageUrl || ""
  );

  // Actual newly selected File
  const [selectedFile, setSelectedFile] = useState(null);

  // Preview of either existing image or newly selected image
  const [imagePreview, setImagePreview] = useState(
    selectedCategory?.categoryImageUrl || ""
  );

  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // ============================================================
  // UPDATE STATE WHEN selectedCategory CHANGES
  // ============================================================
  useEffect(() => {
    const imageUrl =
      selectedCategory?.categoryImageUrl || "";

    setCategoryName(
      selectedCategory?.categoryName || ""
    );

    setCategoryType(
      selectedCategory?.categoryType || "HOME"
    );

    setExistingImageUrl(imageUrl);
    setSelectedFile(null);
    setImagePreview(imageUrl);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [selectedCategory]);

  // ============================================================
  // IMAGE VALIDATION
  // ============================================================
  //
  // Backend currently validates using ImageIO.
  // Use JPG / JPEG / PNG.
  //
  // Backend max size = 5 MB.
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

    const fileName =
      file.name?.toLowerCase() || "";

    const validMimeType =
      allowedMimeTypes.includes(file.type);

    const validExtension =
      allowedExtensions.some((extension) =>
        fileName.endsWith(extension)
      );

    if (!validMimeType || !validExtension) {
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
  // HANDLE SELECTED FILE
  // ============================================================
  const handleFileSelect = (file) => {
    if (!file || loading) {
      return;
    }

    if (!validateImage(file)) {
      return;
    }

    // Revoke previous local object URL only
    // Do not revoke the existing S3 URL.
    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // ============================================================
  // FILE INPUT CHANGE
  // ============================================================
  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }

    // Allow selecting the same file again
    event.target.value = "";
  };

  // ============================================================
  // OPEN FILE PICKER
  // ============================================================
  const handleDropzoneClick = () => {
    if (loading) {
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

    if (!loading) {
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

    if (loading) {
      return;
    }

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  // ============================================================
  // REMOVE / CLEAR SELECTED IMAGE
  // ============================================================
  const handleRemoveImage = (event) => {
    event.stopPropagation();

    if (loading) {
      return;
    }

    // If the current preview is a newly selected local file,
    // revoke its object URL.
    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    // Clear the selected file
    setSelectedFile(null);

    // If there was a newly selected file, restore the existing image.
    // If we're removing the existing image itself, clear everything.
    if (selectedFile) {
      // User is cancelling a newly picked file — restore existing image
      setImagePreview(existingImageUrl || "");
    } else {
      // User is removing the existing image — clear it entirely
      setImagePreview("");
      setExistingImageUrl("");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // GET LOGGED-IN USER ID
  // ============================================================
  const getLoggedInUserId = () => {
    let loggedInUserId =
      localStorage.getItem("userId") ||
      localStorage.getItem("id");

    if (!loggedInUserId) {
      try {
        const userObj = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        loggedInUserId =
          userObj.id ||
          userObj.userId;
      } catch (error) {
        console.warn(
          "Unable to parse stored user object.",
          error
        );
      }
    }

    // Development fallback
    if (!loggedInUserId) {
      loggedInUserId = "1";
    }

    return loggedInUserId;
  };

  // ============================================================
  // UPDATE CATEGORY
  // ============================================================
  const handleUpdate = async () => {
    // ----------------------------------------------------------
    // Validate category
    // ----------------------------------------------------------
    if (!categoryName.trim()) {
      alert("Category Name is required.");
      return;
    }

    if (!categoryType) {
      alert("Category Type is required.");
      return;
    }

    if (!selectedCategory?.categoryId) {
      alert("Category ID is missing.");
      return;
    }

    if (loading) {
      return;
    }

    const loggedInUserId =
      getLoggedInUserId();

    // ----------------------------------------------------------
    // Create FormData
    // ----------------------------------------------------------
    const formData = new FormData();

    formData.append(
      "categoryId",
      String(selectedCategory.categoryId)
    );

    formData.append(
      "categoryName",
      categoryName.trim()
    );

    formData.append(
      "categoryType",
      categoryType
    );

    formData.append(
      "updatedBy",
      String(loggedInUserId)
    );

    // ==========================================================
    // IMPORTANT
    // ==========================================================
    //
    // UPDATE backend expects:
    //
    // request.getCategoryImage()
    //
    // Therefore:
    //
    // categoryImage = actual File
    //
    // DO NOT send the existing S3 URL as categoryImageUrl.
    //
    // If selectedFile is null, don't append any image field.
    // The backend will preserve the existing image URL.
    // ==========================================================
    if (selectedFile) {
      formData.append(
        "categoryImage",
        selectedFile,
        selectedFile.name
      );
    }

    // ----------------------------------------------------------
    // Debug FormData
    // ----------------------------------------------------------
    console.log(
      "========== UPDATE CATEGORY REQUEST =========="
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
      setLoading(true);

      const response =
        await updateCategory(formData);

      console.log(
        "UPDATE CATEGORY RESPONSE:",
        response
      );

      alert(
        response?.message ||
          "Category updated successfully!"
      );

      navigate(
        "/dashboard/categories"
      );

    } catch (error) {
      console.error(
        "ERROR UPDATING CATEGORY:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update category.";

      alert(message);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CANCEL
  // ============================================================
  const handleCancel = () => {
    if (loading) {
      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imagePreview);
    }

    navigate(
      "/dashboard/categories"
    );
  };

  // ============================================================
  // CLEANUP LOCAL PREVIEW
  // ============================================================
  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
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

          <h2>
            Edit Category
          </h2>
        </div>

        <p className="breadcrumb-trail">

          <span onClick={handleCancel}>
            Categories
          </span>

          {" > "}

          Edit Category

        </p>

      </div>

      {/* ======================================================
          CATEGORY CARD
          ====================================================== */}
      <div className="category-card">

        <div className="card-section-title">

          <h3>
            Category Information
          </h3>

          <p>
            Modify the details of your
            existing category below.
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
                placeholder="Enter category name"
                value={categoryName}
                onChange={(event) =>
                  setCategoryName(
                    event.target.value
                  )
                }
                disabled={loading}
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
                disabled={loading}
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
              CATEGORY IMAGE
              ================================================== */}
          <div className="form-group">

            <label>
              Category Profile Image
            </label>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              style={{
                display: "none",
              }}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={
                handleFileChange
              }
              disabled={loading}
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
                onClick={
                  handleDropzoneClick
                }
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={handleDrop}
                style={{
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >

                <div className="dropzone-content">

                  <FiUploadCloud
                    className="upload-icon"
                  />

                  <p>
                    Drag and drop your
                    image here, or{" "}
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
                    alt="Category"
                    style={{
                      width: "130px",
                      height: "130px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border:
                        "1px solid #ddd",
                      display: "block",
                    }}
                    onError={(event) => {
                      console.error(
                        "Unable to load category image:",
                        imagePreview
                      );

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

                {/* Image information */}
                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "5px",
                  }}
                >

                  {selectedFile ? (
                    <>
                      <strong>
                        {selectedFile.name}
                      </strong>

                      <small>
                        {(
                          selectedFile.size /
                          (1024 * 1024)
                        ).toFixed(2)}
                        {" "}
                        MB
                      </small>

                      <small>
                        {selectedFile.type}
                      </small>

                      <small>
                        New image selected
                      </small>
                    </>
                  ) : (
                    <>
                      <strong>
                        Current category image
                      </strong>

                      <small>
                        Existing image
                      </small>
                    </>
                  )}

                  {/* Remove / Reset */}
                  <button
                    type="button"
                    onClick={
                      handleRemoveImage
                    }
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      width: "fit-content",
                      marginTop: "5px",
                      padding:
                        "6px 10px",
                      background:
                        "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: loading
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >

                    <FiX size={14} />

                    {selectedFile
                      ? "Cancel New Image"
                      : "Remove"}

                  </button>

                </div>

              </div>
            )}

            {/* =================================================
                CHANGE IMAGE BUTTON
                ================================================= */}
            {imagePreview && (
              <button
                type="button"
                onClick={
                  handleDropzoneClick
                }
                disabled={loading}
                style={{
                  marginTop: "12px",
                  padding:
                    "8px 14px",
                  border:
                    "1px solid #ccc",
                  background: "#fff",
                  borderRadius: "6px",
                  cursor: loading
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                Choose another image
              </button>
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
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-btn"
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Category"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default EditCategory;