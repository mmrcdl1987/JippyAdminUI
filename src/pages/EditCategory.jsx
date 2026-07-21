import { useState } from "react";
import "../styles/CreateCategory.css";

function EditCategory({ setActivePage }) {

  const [categoryName, setCategoryName] = useState("Chicken");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [publish, setPublish] = useState(true);
  const [showInHomepage, setShowInHomepage] = useState(false);

  const handleUpdate = () => {

    alert("Update API will be integrated later.");

  };

  return (

    <div className="create-category-page">

      <h2 className="page-title">
        Edit Category
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
            EDIT CATEGORY
          </span>

          <div className="form-group">

            <label>Name</label>

            <input
              type="text"
              value={categoryName}
              onChange={(e) =>
                setCategoryName(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>Description</label>

            <textarea
              rows="6"
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
              onClick={() =>
                setActivePage("categories")
              }
            >
              Cancel
            </button>

            <button
              className="save-btn"
              onClick={handleUpdate}
            >
              Update
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default EditCategory;