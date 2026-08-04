import "../styles/Categories.css";
import { useState, useEffect } from "react";
import {
  FiSearch,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import {
  getHomeOrAllCategories,
} from "../services/categoryService";

function Categories({
  setActivePage,
  refreshCategories,
}) {

  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);

  const fetchCategories = async () => {

    try {

      const response =
        await getHomeOrAllCategories(filter);

      setCategories(response.data.data || []);

    } catch (error) {

      console.error(error);

    }

  };

  useEffect(() => {

    fetchCategories();

  }, [filter, refreshCategories]);

  const filteredCategories =
    categories.filter((item) =>
      item.categoryName
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

  return (

    <div className="cat-page">

      <h2 className="cat-title">
        Categories
      </h2>

      {/* Filter */}

      <div className="cat-filter-card">

        <div>

          <h3 className="cat-filter-heading">
            Category Filter
          </h3>

          <p className="cat-filter-subtitle">
            View Home Categories or All Categories
          </p>

        </div>

        <div className="cat-filter-right">

          <label>
            Filter
          </label>

          <select
            className="cat-filter-select"
            value={filter}
            onChange={(e)=>
              setFilter(e.target.value)
            }
          >

            <option value="ALL">
              ALL
            </option>

            <option value="HOME">
              HOME
            </option>

          </select>

        </div>

      </div>

      {/* Card */}

      <div className="cat-card">

        <div className="cat-header">

          <div>

            <h3>
              Category List
            </h3>

            <p>
              View and manage all the categories
            </p>

          </div>

          <button
            className="cat-create-btn"
            onClick={() =>
              setActivePage("createCategory")
            }
          >

            + Create Category

          </button>

        </div>

        <div className="cat-toolbar">

          <div className="cat-entries">

            <span>
              Show
            </span>

            <select
              value={entries}
              onChange={(e)=>
                setEntries(Number(e.target.value))
              }
            >

              <option value={5}>5</option>

              <option value={10}>10</option>

              <option value={25}>25</option>

              <option value={50}>50</option>

            </select>

            <span>
              entries
            </span>

          </div>

          <div className="cat-search">

            <input
              type="text"
              placeholder="Search Category..."
              value={search}
              onChange={(e)=>
                setSearch(e.target.value)
              }
            />

            <FiSearch className="cat-search-icon"/>

          </div>

        </div>

        <div className="cat-table-wrapper">

          <table className="cat-table">

            <thead>

             <tr>
              <th>ID</th>

<th>Category Name</th>

<th>Type</th>

<th>Image</th>

<th>Actions</th>
</tr>
            </thead>

            <tbody>             
              {filteredCategories.length > 0 ? (

                filteredCategories
                  .slice(0, entries)
                  .map((category) => (

                    <tr key={category.categoryId}>

                      <td className="cat-id">
                        {category.categoryId}
                      </td>

                      <td className="cat-name">
                        {category.categoryName}
                      </td>

                      <td>

                        <span className="cat-type">

                          {category.categoryType}

                        </span>

                      </td>

                      <td className="cat-image-cell">

                        <img
                          src={category.categoryImageUrl}
                          alt={category.categoryName}
                          className="cat-image"
                        />

                      </td>

                      <td>

                        <div className="cat-actions">

                          <button
                            type="button"
                            className="cat-edit-btn"
                            onClick={() =>
                              setActivePage("editCategory")
                            }
                          >

                            <FiEdit2 />

                          </button>

                          <button
                            type="button"
                            className="cat-delete-btn"
                            onClick={() =>
                              console.log(
                                "Delete",
                                category.categoryId
                              )
                            }
                          >

                            <FiTrash2 />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

              ) : (

                <tr>

                  <td
                    colSpan={5}
                    className="cat-empty"
                  >

                    No Categories Found

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

export default Categories;