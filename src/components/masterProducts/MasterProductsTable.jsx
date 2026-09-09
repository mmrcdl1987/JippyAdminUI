import React, { Fragment, useState } from "react";
import { FiChevronRight, FiChevronDown, FiEdit2, FiTrash2 } from "react-icons/fi";
import "../../styles/MasterProductsTable.css";



function MasterProductsTable({
  products,
  handleEdit,
  handleDelete,
  onTogglePublish,
}) {

  const [expandedRow, setExpandedRow] = useState(null);


  return (
    <div className="master-products-table">

      <table>

        <thead>
          <tr>
            <th></th>

            <th>Product ID</th>
            <th>Product Name</th>
            <th>Category</th>
            {/* <th>Food Type</th> */}
            <th>Dietary Type</th>
            <th>Publish Status</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {products.length > 0 ? (

            products.map((product) => {
              return (
                <Fragment key={product.masterProductId}>

                  <tr>
                    <td>
                      <button
                        className="expand-btn"
                        onClick={() =>
                          setExpandedRow(
                            expandedRow === product.masterProductId
                              ? null
                              : product.masterProductId
                          )
                        }
                      >
                        {expandedRow === product.masterProductId ? (
                          <FiChevronDown />
                        ) : (
                          <FiChevronRight />
                        )}
                      </button>
                    </td>

                    <td>{product.masterProductId}</td>

                    <td>{product.masterProductName}</td>

                    <td>{product.categoryName}</td>

                    {/* <td>{product.foodType || "-"}</td> */}

                    <td>{product.veg ? "Veg" : "Non-Veg"}</td>

                    <td>
                      <label className="publish-switch">
                        <input
                          type="checkbox"
                          checked={product.publish === 1}
                          onChange={() => onTogglePublish && onTogglePublish(product)}
                        />
                        <span className="publish-slider"></span>
                      </label>
                    </td>


                    <td>
                      {product.photo || product.thumbnail ? (
                        <img
                          src={product.photo || product.thumbnail}
                          alt="Product"
                          width="80"
                          height="80"
                          style={{
                            objectFit: "cover",
                            borderRadius: "6px",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>

                    <td>
                      <div className="action-icons">

                        <FiEdit2
                          className="edit-icon"
                          onClick={() => handleEdit(product.masterProductId)}
                        />
                        <FiTrash2
                          className="delete-icon"
                          onClick={() => handleDelete(product.masterProductId)}
                        />

                      </div>
                    </td>

                  </tr>
                  {expandedRow === product.masterProductId && (
                    <tr>
                      <td colSpan="10">

                        <table className="expanded-table">
                          <tbody>
                            <tr>
                              <td><strong>Description</strong></td>
                              <td>{product.description || "-"}</td>
                              <td><strong>Short Description</strong></td>
                              <td>{product.shortDescription || "-"}</td>
                            </tr>

                            <tr>
                              <td><strong>Calories</strong></td>
                              <td>{product.calories}</td>
                              <td><strong>Protein (g)</strong></td>
                              <td>{product.protein}</td>
                            </tr>

                            <tr>
                              <td><strong>Carbs (g)</strong></td>
                              <td>{product.carbs}</td>
                              <td><strong>Fats (g)</strong></td>
                              <td>{product.fats}</td>
                            </tr>

                            <tr>
                              <td><strong>Grams (g)</strong></td>
                              <td>{product.grams || "-"}</td>
                              <td></td>
                              <td></td>
                            </tr>

                            <tr>
                              <td><strong>Created At</strong></td>
                              <td>{product.createdAt || "-"}</td>
                              <td><strong>Updated At</strong></td>
                              <td>{product.updatedAt || "-"}</td>
                            </tr>

                            <tr>
                              <td><strong>Thumbnail</strong></td>
                              <td>
                                {product.thumbnail ? (
                                  <img
                                    src={product.thumbnail}
                                    alt="Thumbnail"
                                    width="80"
                                    height="80"
                                    style={{
                                      objectFit: "cover",
                                      borderRadius: "8px"
                                    }}
                                  />
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td></td>
                              <td></td>
                            </tr>

                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );

            })

          ) : (

            <tr>

              <td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>
                No Products Found
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

export default MasterProductsTable;