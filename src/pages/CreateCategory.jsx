import { useState } from "react";
import { createCategory } from "../services/categoryService";
import "../styles/CreateCategory.css";


function CreateCategory({setActivePage, setRefreshCategories
}) {

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [publish, setPublish] = useState(true);
  const [showInHomepage, setShowInHomepage] = useState(false);

  const handleSave = async () => {

  if (!categoryName.trim()) {

    alert("Category Name is required.");

    return;

  }

  try {

    const response = await createCategory({
  categoryName
});

console.log("Category Created:", response);

alert(response.message);

console.log("Refreshing categories...");

setRefreshCategories(prev => prev + 1);

setActivePage("categories");

  } catch (error) {

    console.error(error);

    alert("Failed to create category.");

  }

};

  return (

    <div className="create-category-page">

      <h2 className="page-title">

        Create Category

      </h2>

      <div className="category-card">

        <div className="tab-header">

          <button className="active-tab">

            Category Information
          </button>

          <button className="inactive-tab">
            Review Attributes
          </button>

        </div>

        <div className="category-form">

          <span className="form-tag">

            CREATE CATEGORY

          </span>

          <div className="form-group">

            <label>Name</label>

            <input
              type="text"
              placeholder="Insert Name"
              value={categoryName}
              onChange={(e) =>
                setCategoryName(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>Description</label>

            <textarea
              rows={6}
              placeholder="Insert Description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>Image</label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setSelectedImage(e.target.files[0])
              }
            />

            <small>
              Insert image in SVG format
            </small>

          </div>

          <div className="checkbox-group">

            <label>

              <input
                type="checkbox"
                checked={publish}
                onChange={() =>
                  setPublish(!publish)
                }
              />

              Publish

            </label>

            <label>

              <input
                type="checkbox"
                checked={showInHomepage}
                onChange={() =>
                  setShowInHomepage(!showInHomepage)
                }
              />

              Show in Homepage?

            </label>

            <small>
              Maximum 5 categories will show in homepage
            </small>

          </div>

         <div className="button-group">

  <button
    className="cancel-btn"
    onClick={() => setActivePage("categories")}
  >
    Cancel
  </button>

  <button
    className="save-btn"
    onClick={handleSave}
  >
    Save
  </button>

</div>

        </div>

      </div>

    </div>

  );

}

export default CreateCategory;