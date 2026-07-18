import React, { Fragment, useState } from "react";
import { FiChevronRight, FiChevronDown, FiEdit2, FiTrash2 } from "react-icons/fi";
import "../../styles/MasterProductsTable.css";



function MasterProductsTable({
  products,
  handleEdit,
  handleDelete,
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
            <th>Sub Category</th>
            <th>Food Type</th>
            <th>Veg</th>
            <th>Publish</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

  {products.length > 0 ? (

    products.map((product) => {
      return(
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

        <td>{product.subCategoryName || "-"}</td>

        <td>{product.foodType || "-"}</td>

        <td>{product.veg ? "Veg" : "Non-Veg"}</td>

        {/* <td>{product.publish ? "Yes" : "No"}</td> */}
        <td>
  <label className="publish-switch">
    <input
      type="checkbox"
      checked={product.publish === 1}
      readOnly
    />
    <span className="publish-slider"></span>
  </label>
</td>
        

<td>
  {product.photo ? (
    <img
      src={product.photo}
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
      <td><strong>Category ID</strong></td>
      <td>{product.categoryId}</td>
      <td><strong>Sub Category ID</strong></td>
      <td>{product.subCategoryId || "-"}</td>
    </tr>

    <tr>
      <td><strong>Calories</strong></td>
      <td>{product.calories}</td>
      <td><strong>Protein</strong></td>
      <td>{product.protein}</td>
    </tr>

    <tr>
      <td><strong>Carbs</strong></td>
      <td>{product.carbs}</td>
      <td><strong>Fats</strong></td>
      <td>{product.fats}</td>
    </tr>

    <tr>
      <td><strong>Has Options</strong></td>
      <td>{product.hasOptions ? "Yes" : "No"}</td>
      <td><strong>Options Enabled</strong></td>
      <td>{product.optionsEnabled ? "Yes" : "No"}</td>
    </tr>

    <tr>
      <td><strong>Created By</strong></td>
      <td>{product.createdBy || "-"}</td>
      <td><strong>Updated By</strong></td>
      <td>{product.updatedBy || "-"}</td>
    </tr>

    <tr>
      <td><strong>grams</strong></td>
      <td>{product.grams || "-"}</td>
      <td><strong>csvMerchantPrice</strong></td>
      <td>{product.csvMerchantPrice || "-"}</td>
    </tr>
    <tr>
      <td><strong>csvTiming</strong></td>
      <td>{product.csvTiming|| "-"}</td>
      <td><strong>csvDayOfWeek</strong></td>
      <td>{product.csvDayOfWeek || "-"}</td>
    </tr>
    
     <tr>
      <td><strong>subCategoryName</strong></td>
      <td>{product.subCategoryName|| "-"}</td>
      <td><strong>options</strong></td>
      <td>{product.options || "-"}</td>
    </tr>

    


    <tr>
      <td><strong>Updated At</strong></td>
      <td>{product.updatedAt || "-"}</td>
      <td><strong>Cuisine Type</strong></td>
      <td>{product.cuisineType || "-"}</td>
    </tr>
    <tr>
  <td><strong>created At</strong></td>
  <td>{product.createdAt || "-"}</td>


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