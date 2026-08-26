import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../services/categoryService";
import { FiArrowLeft, FiUploadCloud } from "react-icons/fi";
import "../styles/CreateCategory.css";

function CreateCategory({ setRefreshCategories }) {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("HOME"); // Must be "HOME" or "ALL" based on your backend DTO pattern
  const [categoryImageUrl, setCategoryImageUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  // Handle local file selection via Drag & Drop or Browse
  const handleFileSelect = async (file) => {
    if (file) {
      // 1. Show immediate local preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);

      try {
        setUploading(true);
        
        // 2. TODO: Call your image upload service here (e.g., uploadToS3(file))
        // const uploadedUrl = await uploadImageService(file);
        // setCategoryImageUrl(uploadedUrl);

        // Simulated mock URL for demonstration until your file-upload endpoint is wired up:
        setTimeout(() => {
          const mockS3Url = `https://jippy-images.s3.ap-south-1.amazonaws.com/categories/${file.name}`;
          setCategoryImageUrl(mockS3Url);
          setUploading(false);
        }, 1000);

      } catch (err) {
        console.error("Image upload failed", err);
        alert("Failed to upload image file.");
        setUploading(false);
      }
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      alert("Category Name is required.");
      return;
    }

    const loggedInUserId = parseInt(localStorage.getItem("userId") || "1073741824", 10);

    try {
      // Sends clean JSON payload matching FmCreateCategoryRequestDto
      const response = await createCategory({
        categoryName,
        categoryType,
        categoryImageUrl,
        createdBy: loggedInUserId,
      });

      alert(response?.message || "Category created successfully!");
      if (typeof setRefreshCategories === "function") {
        setRefreshCategories((prev) => prev + 1);
      }
      navigate("/dashboard/categories");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create category.");
    }
  };

  return (
    <div className="create-category-page">
      <div className="page-header-container">
        <div className="breadcrumb-header" onClick={() => navigate("/dashboard/categories")}>
          <FiArrowLeft className="back-arrow-icon" />
          <h2>Add Category</h2>
        </div>
        <p className="breadcrumb-trail">
          <span onClick={() => navigate("/dashboard/categories")}>Categories</span> &gt; Add Category
        </p>
      </div>

      <div className="category-card">
        <div className="card-section-title">
          <h3>Category Information</h3>
          <p>Provide details to add a new category to your system.</p>
        </div>
        
        <div className="category-form">
          <div className="form-row">
            <div className="form-group">
              <label>Category Name <span>*</span></label>
              <input
                type="text"
                placeholder="e.g., Pizza"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Category Type <span>*</span></label>
              <select
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value)}
              >
                <option value="HOME">HOME</option>
                <option value="ALL">ALL</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Category Image</label>
            
            {/* Hidden Native File Input */}
            <input
              type="file"
              id="categoryFileInput"
              style={{ display: "none" }}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileInputChange}
            />

            {/* Drag & Drop Zone */}
            <div 
              className="dropzone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById("categoryFileInput").click()}
              style={{ cursor: "pointer" }}
            >
              <div className="dropzone-content">
                <FiUploadCloud className="upload-icon" />
                <p>
                  {uploading ? "Uploading image..." : "Drag and drop your image here, or browse"}
                </p>
                <small>Supports: PNG, JPG, WEBP (Max 2MB)</small>
              </div>
            </div>

            {/* Direct Image URL fallback input */}
            <input
              type="text"
              placeholder="Or paste direct image URL here..."
              value={categoryImageUrl}
              onChange={(e) => {
                setCategoryImageUrl(e.target.value);
                setImagePreview(e.target.value);
              }}
              className="url-input-field"
              style={{ marginTop: "10px" }}
            />

            {/* Image Preview Area */}
            {imagePreview && (
              <div style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "15px" }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", border: "1px solid #ddd" }}
                  onError={() => setImagePreview("")}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setCategoryImageUrl("");
                  }}
                  style={{ padding: "5px 10px", background: "#ff4d4d", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <div className="button-group-right">
            <button className="cancel-btn" onClick={() => navigate("/dashboard/categories")}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave} disabled={uploading}>
              {uploading ? "Processing Image..." : "Save Category"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCategory; // Or export default CreateCategory depending on your build setup