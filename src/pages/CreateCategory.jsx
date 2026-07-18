import { useState } from "react";
import { createCategory } from "../services/categoryService";
import "../styles/CreateCategory.css";

function CreateCategory({
  setActivePage,
  setRefreshCategories,
}) {

  const [categoryName, setCategoryName] = useState("");
  const [categoryType, setCategoryType] = useState("ALL");
  const [categoryImageUrl, setCategoryImageUrl] = useState("");

  const handleSave = async () => {

    if (!categoryName.trim()) {

      alert("Category Name is required.");

      return;

    }

    try {

      const response = await createCategory({

        categoryName,

        categoryType,

        categoryImageUrl,

        createdBy: 5,

      });

      console.log(response);

      alert(response.message);

      setRefreshCategories(prev => prev + 1);

      setActivePage("categories");

    } catch (error) {

      console.error(error);

      alert(
        error?.response?.data?.message ||
        "Failed to create category."
      );

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

        </div>

        <div className="category-form">

          <span className="form-tag">

            CREATE CATEGORY

          </span>

          <div className="form-group">

            <label>

              Category Name

            </label>

            <input
              type="text"
              placeholder="Enter Category Name"
              value={categoryName}
              onChange={(e) =>
                setCategoryName(e.target.value)
              }
            />

            <label>

              Category Type

            </label>

            <select
              value={categoryType}
              onChange={(e) =>
                setCategoryType(e.target.value)
              }
            >

              <option value="ALL">
                ALL
              </option>

              <option value="RESTAURANT">
                HOME
              </option>

              

            </select>

                        <label>

              Category Image URL

            </label>

            <input
              type="text"
              placeholder="Enter Image URL"
              value={categoryImageUrl}
              onChange={(e) =>
                setCategoryImageUrl(e.target.value)
              }
            />

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