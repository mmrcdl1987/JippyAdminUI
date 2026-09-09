import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { FM_API } from "../services/api"; 
import { getAllCategories } from "../services/masterProductsService";
import "../styles/EditMasterProduct.css";

function CreateMasterProduct({ setActivePage }) {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

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

  // Safe back navigation handler supporting both props and router routing
  const handleBackNavigation = () => {
    clearForm();
    if (typeof setActivePage === "function") {
      setActivePage("masterProducts");
    } else {
      navigate("/dashboard/masterProducts");
    }
  };

  // Fetch Categories on Load
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
          setCategoriesError("Could not load categories list from the server.");
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

  const clearForm = () => {
    setProductName("");
    setDescription("");
    setShortDescription("");

    setPhoto("");
    setPhotos("");
    setThumbnail("");

    setCategoryId("");
    setCategoryName("");
    setIsOtherCategory(false);
    setCustomCategoryName("");

    setVeg(0);
    setPublish(0);

    setCalories(0);
    setProtein(0);
    setFats(0);
    setCarbs(0);
    setGrams(0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (isOtherCategory && !customCategoryName.trim()) {
      alert("Please enter a new category name.");
      return;
    }

    const finalCategoryId = isOtherCategory ? null : categoryId ? Number(categoryId) : null;
    const finalCategoryName = isOtherCategory ? customCategoryName.trim() : categoryName.trim() || null;

    const payload = {
      masterProductName: productName.trim(),
      description: description.trim() || null,
      shortDescription: shortDescription.trim() || null,

      photo: photo.trim() || null,
      photos: photos.trim() || null,
      thumbnail: thumbnail.trim() || null,

      categoryId: finalCategoryId,
      categoryName: finalCategoryName,

      subCategoryId: null,
      subCategoryName: null,

      veg: Number(veg),
      nonVeg: veg ? 0 : 1,

      foodType: null,
      cuisineType: null,

      hasOptions: 0,
      optionsEnabled: 0,
      options: null,

      calories: Number(calories),
      protein: Number(protein),
      fats: Number(fats),
      carbs: Number(carbs),
      grams: Number(grams),

      publish: Number(publish),
    };

    try {
      console.log("Payload:", payload);

      const response = await FM_API.post("/api/fm/master-products", payload);

      if (response.status === 200 || response.status === 201) {
        alert("✅ Product created successfully!");
        handleBackNavigation(); // Handles navigation after successful creation
      }
    } catch (error) {
      console.log("Status:", error.response?.status);
      console.log("Response Body:", error.response?.data);
      console.log("Payload Sent:", payload);
      console.log(error);
      alert(error.response?.data?.message || "Failed to create master product.");
    }
  };

  return (
    <div className="edit-product-page">
      <button
        type="button"
        className="back-btn"
        onClick={handleBackNavigation}
      >
        ← Back
      </button>

      <h1>Create Master Product</h1>

      <p className="edit-subtitle">
        Fill the details below to create a new product.
      </p>

      {categoriesError && (
        <div className="alert-banner error-banner">⚠️ {categoriesError}</div>
      )}

      <form className="edit-form" onSubmit={handleCreate}>
        <div className="form-card">
          <h2>📦 Product Information</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>

            {/* Category Dropdown */}
            <div className="form-group">
              <label>Category *</label>
              <select
                value={isOtherCategory ? "OTHER" : categoryId}
                onChange={handleCategoryChange}
                disabled={loadingCategories}
                required
              >
                <option value="">
                  {loadingCategories ? "Loading categories..." : "-- Select Category --"}
                </option>

                {categories.map((cat) => (
                  <option key={cat.categoryId} value={String(cat.categoryId)}>
                    {cat.categoryName}
                  </option>
                ))}

                <option value="OTHER">+ Other (Create New)</option>
              </select>
            </div>

            {/* New Custom Category Field */}
            {isOtherCategory && (
              <div className="form-group full-width">
                <label>New Category Name *</label>
                <input
                  type="text"
                  placeholder="Enter new category name"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Photo URL</label>
              <input
                type="text"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Photos List</label>
              <input
                type="text"
                value={photos}
                onChange={(e) => setPhotos(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Thumbnail URL</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Dietary Type</label>
              <select
                value={veg}
                onChange={(e) => setVeg(Number(e.target.value))}
              >
                <option value={1}>Veg</option>
                <option value={0}>Non Veg</option>
              </select>
            </div>

            <div className="form-group">
              <label>Publish Status</label>
              <select
                value={publish}
                onChange={(e) => setPublish(Number(e.target.value))}
              >
                <option value={1}>Published</option>
                <option value={0}>Unpublished</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group full-width">
              <label>Short Description</label>
              <textarea
                rows="3"
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
              <label>Calories</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Protein (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Fats (g)</label>
              <input
                type="number"
                value={fats}
                onChange={(e) => setFats(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Carbs (g)</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Grams (g)</label>
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
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
          >
            Cancel
          </button>

          <button type="submit" className="save-btn">
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

CreateMasterProduct.propTypes = {
  setActivePage: PropTypes.func,
};

export default CreateMasterProduct;