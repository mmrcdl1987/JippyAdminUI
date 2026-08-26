import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUploadCloud } from "react-icons/fi";
import { updateCategory } from "../services/categoryService";
import "../styles/CreateCategory.css";

function EditCategory({ selectedCategory }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categoryName, setCategoryName] = useState(selectedCategory?.categoryName || "");
  const [categoryType, setCategoryType] = useState(selectedCategory?.categoryType || "Food");
  const [categoryImageUrl, setCategoryImageUrl] = useState(selectedCategory?.categoryImageUrl || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDropzoneClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCategoryImageUrl(URL.createObjectURL(file)); 
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setCategoryImageUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdate = async () => {
    if (!categoryName.trim()) {
      alert("Category Name is required.");
      return;
    }

    // Robust user ID lookup preventing forced login redirects
    let loggedInUserId = localStorage.getItem("userId") || localStorage.getItem("id");

    if (!loggedInUserId) {
      try {
        const userObj = JSON.parse(localStorage.getItem("user") || "{}");
        loggedInUserId = userObj.id || userObj.userId;
      } catch (e) {
        // Safe catch
      }
    }

    // Final safety fallback so it NEVER forces you to the login screen during development tests
    if (!loggedInUserId) {
      loggedInUserId = 1; 
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("categoryId", selectedCategory?.categoryId || ""); 
      formData.append("categoryName", categoryName);
      formData.append("categoryType", categoryType);
      formData.append("updatedBy", loggedInUserId);
      
      if (selectedFile) {
        formData.append("categoryImage", selectedFile);
      } else if (categoryImageUrl) {
        formData.append("categoryImageUrl", categoryImageUrl);
      }

      await updateCategory(formData);

      alert("Category updated successfully!");
      navigate("/dashboard/categories");
    } catch (error) {
      console.error("Error updating category:", error);
      alert(error.response?.data?.message || "Failed to update category. Please check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-category-page">
      <div className="page-header-container">
        <div className="breadcrumb-header" onClick={() => navigate("/dashboard/categories")}>
          <FiArrowLeft className="back-arrow-icon" />
          <h2>Edit Category</h2>
        </div>
        <p className="breadcrumb-trail">
          <span onClick={() => navigate("/dashboard/categories")}>Categories</span> &gt; Edit Category
        </p>
      </div>

      <div className="category-card">
        <div className="card-section-title">
          <h3>Category Information</h3>
          <p>Modify the details of your existing category below.</p>
        </div>

        <div className="category-form">
          <div className="form-row">
            <div className="form-group">
              <label>Category Name <span>*</span></label>
              <input
                type="text"
                placeholder="Enter category name"
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
                <option value="Food">Food</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Essentials">Essentials</option>
                <option value="HOME">HOME</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Category Image</label>
            
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
            />

            <div 
              className="dropzone" 
              onClick={handleDropzoneClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{ cursor: "pointer" }}
            >
              <div className="dropzone-content">
                <FiUploadCloud className="upload-icon" />
                <p>
                  {selectedFile ? `Selected: ${selectedFile.name}` : <>Drag and drop your new image here, or <span>browse</span></>}
                </p>
                <small>Supports: PNG, JPG, WEBP (Max 2MB)</small>
              </div>
            </div>

            <input
              type="text"
              placeholder="Or paste direct image URL here..."
              value={categoryImageUrl}
              onChange={(e) => setCategoryImageUrl(e.target.value)}
              className="url-input-field"
              style={{ marginTop: "10px" }}
            />
          </div>

          <div className="button-group-right">
            <button className="cancel-btn" onClick={() => navigate("/dashboard/categories")}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleUpdate} disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditCategory;