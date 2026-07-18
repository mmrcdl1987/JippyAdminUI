import { useState } from "react";
import { updateMasterProduct } from "../services/masterProductsService";
import "../styles/EditMasterProduct.css";

function EditMasterProduct({
  selectedProduct,
  setActivePage,
}) {

const [productName, setProductName] = useState(selectedProduct?.masterProductName || "");
const [description, setDescription] = useState(selectedProduct?.description || "");
const [shortDescription, setShortDescription] = useState(selectedProduct?.shortDescription || "");

const [photo, setPhoto] = useState(selectedProduct?.photo || "");
const [photos, setPhotos] = useState(selectedProduct?.photos || "");
const [thumbnail, setThumbnail] = useState(selectedProduct?.thumbnail || "");

const [categoryId, setCategoryId] = useState(selectedProduct?.categoryId || "");
const [categoryName, setCategoryName] = useState(selectedProduct?.categoryName || "");

const [subCategoryId, setSubCategoryId] = useState(selectedProduct?.subCategoryId || "");
const [subCategoryName, setSubCategoryName] = useState(selectedProduct?.subCategoryName || "");

const [foodType, setFoodType] = useState(selectedProduct?.foodType || "");
const [cuisineType, setCuisineType] = useState(selectedProduct?.cuisineType || "");

const [veg, setVeg] = useState(selectedProduct?.veg || 0);
const [publish, setPublish] = useState(selectedProduct?.publish || 0);

const [hasOptions, setHasOptions] = useState(selectedProduct?.hasOptions || 0);
const [optionsEnabled, setOptionsEnabled] = useState(selectedProduct?.optionsEnabled || 0);
const [options, setOptions] = useState(selectedProduct?.options || "");

const [calories, setCalories] = useState(selectedProduct?.calories || 0);
const [protein, setProtein] = useState(selectedProduct?.protein || 0);
const [fats, setFats] = useState(selectedProduct?.fats || 0);
const [carbs, setCarbs] = useState(selectedProduct?.carbs || 0);
const [grams, setGrams] = useState(selectedProduct?.grams || 0);

const [csvMerchantPrice, setCsvMerchantPrice] = useState(selectedProduct?.csvMerchantPrice || "");
const [csvTiming, setCsvTiming] = useState(selectedProduct?.csvTiming || "");
const [csvDayOfWeek, setCsvDayOfWeek] = useState(selectedProduct?.csvDayOfWeek || "");

const handleUpdate = async () => {

try{

const payload = {

...selectedProduct,

masterProductName: productName,
description,
shortDescription,

photo,
photos,
thumbnail,

categoryId:Number(categoryId),
categoryName,

subCategoryId:Number(subCategoryId),
subCategoryName,

veg,
nonVeg:veg?0:1,

foodType,
cuisineType,

hasOptions,
optionsEnabled,
options,

calories,
protein,
fats,
carbs,
grams,

publish,

csvMerchantPrice,
csvTiming,
csvDayOfWeek,

};

const response = await updateMasterProduct(
  selectedProduct.masterProductId,
  payload
);

if (response.status === 200) {

  alert("✅ Product updated successfully!");

  setActivePage("masterProducts");

}

}catch(error){

console.error(error);

}

};

return(

<div className="edit-product-page">

<button
className="back-btn"
onClick={()=>setActivePage("masterProducts")}
>
← Back
</button>

<h1>Edit Master Product</h1>

<p className="edit-subtitle">
Update the product details below.
</p>

<form className="edit-form">

<div className="form-card">

<h2>📦 Product Information</h2>

<div className="form-grid">

<div className="form-group">
<label>Product Name</label>
<input
type="text"
value={productName}
onChange={(e)=>setProductName(e.target.value)}
/>
</div>

<div className="form-group">
<label>Category ID</label>
<input
type="number"
value={categoryId}
onChange={(e)=>setCategoryId(e.target.value)}
/>
</div>

<div className="form-group">
<label>Category Name</label>
<input
type="text"
value={categoryName}
onChange={(e)=>setCategoryName(e.target.value)}
/>
</div>

<div className="form-group">
<label>Photo</label>
<input
type="text"
value={photo}
onChange={(e)=>setPhoto(e.target.value)}
/>
</div>

<div className="form-group">
<label>Photos</label>
<input
type="text"
value={photos}
onChange={(e)=>setPhotos(e.target.value)}
/>
</div>

<div className="form-group">
<label>Thumbnail</label>
<input
type="text"
value={thumbnail}
onChange={(e)=>setThumbnail(e.target.value)}
/>
</div>

<div className="form-group">
<label>Food Type</label>
<input
type="text"
value={foodType}
onChange={(e)=>setFoodType(e.target.value)}
/>
</div>

<div className="form-group">
<label>Cuisine Type</label>
<input
type="text"
value={cuisineType}
onChange={(e)=>setCuisineType(e.target.value)}
/>
</div>

<div className="form-group">
<label>Veg</label>

<select
value={veg}
onChange={(e)=>setVeg(Number(e.target.value))}
>

<option value={1}>Veg</option>
<option value={0}>Non Veg</option>

</select>

</div>

<div className="form-group">
<label>Publish</label>

<select
value={publish}
onChange={(e)=>setPublish(Number(e.target.value))}
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
onChange={(e)=>setDescription(e.target.value)}

></textarea>

</div>

<div className="form-group full-width">

<label>Short Description</label>

<textarea

rows="3"
value={shortDescription}
onChange={(e)=>setShortDescription(e.target.value)}

></textarea>

</div>

</div>

</div>
{/* ================= OPTIONS ================= */}

<div className="form-card">

  <h2>⚙️ Options</h2>

  <div className="form-grid">

    <div className="form-group">
      <label>Has Options</label>

      <select
        value={hasOptions}
        onChange={(e) => setHasOptions(Number(e.target.value))}
      >
        <option value={1}>Yes</option>
        <option value={0}>No</option>
      </select>
    </div>

    <div className="form-group">
      <label>Options Enabled</label>

      <select
        value={optionsEnabled}
        onChange={(e) => setOptionsEnabled(Number(e.target.value))}
      >
        <option value={1}>Yes</option>
        <option value={0}>No</option>
      </select>
    </div>

    <div className="form-group full-width">
      <label>Options</label>

      <textarea
        rows="3"
        value={options}
        onChange={(e) => setOptions(e.target.value)}
      />
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
      <label>Protein</label>

      <input
        type="number"
        value={protein}
        onChange={(e) => setProtein(Number(e.target.value))}
      />
    </div>

    <div className="form-group">
      <label>Fats</label>

      <input
        type="number"
        value={fats}
        onChange={(e) => setFats(Number(e.target.value))}
      />
    </div>

    <div className="form-group">
      <label>Carbs</label>

      <input
        type="number"
        value={carbs}
        onChange={(e) => setCarbs(Number(e.target.value))}
      />
    </div>

    <div className="form-group">
      <label>Grams</label>

      <input
        type="number"
        value={grams}
        onChange={(e) => setGrams(Number(e.target.value))}
      />
    </div>

  </div>

</div>

{/* ================= CATEGORY ================= */}

<div className="form-card">

  <h2>📂 Category</h2>

  <div className="form-grid">

    <div className="form-group">
      <label>Sub Category ID</label>

      <input
        type="number"
        value={subCategoryId}
        onChange={(e) => setSubCategoryId(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label>Sub Category Name</label>

      <input
        type="text"
        value={subCategoryName}
        onChange={(e) => setSubCategoryName(e.target.value)}
      />
    </div>

  </div>

</div>

{/* ================= CSV ================= */}

<div className="form-card">

  <h2>📄 CSV Details</h2>

  <div className="form-grid">

    <div className="form-group">
      <label>CSV Merchant Price</label>

      <input
        type="number"
        value={csvMerchantPrice}
        onChange={(e) => setCsvMerchantPrice(e.target.value)}
      />
    </div>

    <div className="form-group">
      <label>CSV Timing</label>

      <input
        type="text"
        value={csvTiming}
        onChange={(e) => setCsvTiming(e.target.value)}
      />
    </div>

    <div className="form-group full-width">
      <label>CSV Day Of Week</label>

      <input
        type="text"
        value={csvDayOfWeek}
        onChange={(e) => setCsvDayOfWeek(e.target.value)}
      />
    </div>

  </div>

</div>

{/* ================= BUTTONS ================= */}

<div className="button-group">

  <button
    type="button"
    className="cancel-btn"
    onClick={() => setActivePage("masterProducts")}
  >
    Cancel
  </button>

  <button
    type="button"
    className="save-btn"
    onClick={handleUpdate}
  >
    Update
  </button>

</div>

</form>

</div>

);

}

export default EditMasterProduct;