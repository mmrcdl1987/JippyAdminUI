import { useState } from "react";
import { FM_API } from "../services/api"; 
import { createMasterProduct } from "../services/masterProductsService";
import "../styles/EditMasterProduct.css";

function CreateMasterProduct({
  setActivePage,
}) {

const [productName, setProductName] = useState("");
const [description, setDescription] = useState("");
const [shortDescription, setShortDescription] = useState("");

// const [createdBy, setCreatedBy] = useState("");
// const [updatedBy, setUpdatedBy] = useState("");

const [photo, setPhoto] = useState("");
const [photos, setPhotos] = useState("");
const [thumbnail, setThumbnail] = useState("");

const [categoryId, setCategoryId] = useState("");
const [categoryName, setCategoryName] = useState("");

const [subCategoryId, setSubCategoryId] = useState("");
const [subCategoryName, setSubCategoryName] = useState("");

const [foodType, setFoodType] = useState("");
const [cuisineType, setCuisineType] = useState("");

const [veg, setVeg] = useState(0);
const [publish, setPublish] = useState(0);

const [hasOptions, setHasOptions] = useState(0);
const [optionsEnabled, setOptionsEnabled] = useState(0);
const [options, setOptions] = useState("");

const [calories, setCalories] = useState(0);
const [protein, setProtein] = useState(0);
const [fats, setFats] = useState(0);
const [carbs, setCarbs] = useState(0);
const [grams, setGrams] = useState(0);




const clearForm = () => {
  setProductName("");
  setDescription("");
  setShortDescription("");

  // setCreatedBy("");
  // setUpdatedBy("");

  setPhoto("");
  setPhotos("");
  setThumbnail("");

  setCategoryId("");
  setCategoryName("");

  setSubCategoryId("");
  setSubCategoryName("");

  setFoodType("");
  setCuisineType("");

  setVeg(0);
  setPublish(0);

  setHasOptions(0);
  setOptionsEnabled(0);
  setOptions("");

  setCalories(0);
  setProtein(0);
  setFats(0);
  setCarbs(0);
  setGrams(0);

  
};

const handleCreate = async () => {



const payload = {
  // masterProductId: 0,

  masterProductName: productName,
  description,
  shortDescription,

  // photo,
  // photos,
  // thumbnail,

  photo: photo || null,
photos: photos || null,
thumbnail: thumbnail || null,



  categoryId: Number(categoryId),
  categoryName,

  subCategoryId: Number(subCategoryId),
  subCategoryName,

  veg,
  nonVeg: veg ? 0 : 1,

  foodType,
  cuisineType,

  hasOptions,
  optionsEnabled,
  options: options?.trim() ? options : null,
  // options,

  calories,
  protein,
  fats,
  carbs,
  grams,

  publish,

  // createdBy: Number(createdBy),
  // updatedBy: Number(updatedBy),

  // csvMerchantPrice: null,
  // csvTiming: null,
  // csvDayOfWeek: null
};
try{

console.log("Payload:", payload);




const response = await FM_API.post(
  "/api/fm/master-products",
  payload
);

if (response.status === 200 || response.status === 201) {

 alert("✅ Product created successfully!");

clearForm();

setActivePage("masterProducts");

}


}
catch (error) {

  console.log("Status:", error.response?.status);

  console.log("Response Body:", error.response?.data);

  console.log("Payload Sent:", payload);

  console.log(error);

}

};

return(

<div className="edit-product-page">

<button
className="back-btn"
onClick={() => { 
  clearForm();
  setActivePage("masterProducts");
}}
>
← Back
</button>

<h1>Create Master Product</h1>

<p className="edit-subtitle">
Fill the details below to create a new product.
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
    onClick={handleCreate}
  >
    Create
  </button>

</div>

</form>

</div>

);

}

export default CreateMasterProduct;