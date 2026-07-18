import "../styles/AddToOutletProducts.css";
import { useState, useEffect } from "react";
import { getAllOutlets,  addProductsToOutlet, } from "../services/masterProductsService";
import Select from "react-select";

function AddToOutletProducts({
        
    setShowOutletPopup,
    selectedProducts,

}) {

  const [outlet, setOutlet] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [defaultPrice, setDefaultPrice] = useState(""); 
  const [defaultTiming, setDefaultTiming] = useState("");
  const [defaultType, setDefaultType] = useState("");

  const products = selectedProducts || [];
  console.log("Products received:", products);

  const fetchOutlets = async () => {

  try {

    const response = await getAllOutlets();

    console.log(response.data);

    setOutlets(response.data.data);

  } catch (error) {

    console.error(error);

  }

};

useEffect(() => {
 
  fetchOutlets();

}, []);

const handleSaveProducts = async () => {

  if (!outlet) {
    alert("Please select an outlet.");
    return;
  }

  const payload = {
    outletCategoryId: 1, // Change later if dynamic
    outletId: outlet,
    products: products.map(product => ({
      productName: product.masterProductName,
      description: product.description,
      merchantPrice: Number(defaultPrice || 0),
      isVeg: product.veg === 1,
      hasProductVariants: product.hasOptions === 1,
      variants: [],
      masterProductId: product.masterProductId,
      categoryId: product.categoryId,
      csvDayOfWeek: "",
      csvTiming: defaultTiming,
      timings: []
    }))
  };

  console.log("Payload:", payload);

  try {

    const response = await addProductsToOutlet(payload);

    console.log(response.data);

    alert("Products added successfully!");

    setShowOutletPopup(false);

  } catch (error) {

    console.error(error);

    alert("Failed to add products.");

  }

};
  return (

    <div className="outlet-page">

      <div className="outlet-card">

        {/* Header */}

        <div className="outlet-header">

          <h2>📂 Add to Outlet Products</h2>

          <button
            className="close-btn"
           onClick={() => setShowOutletPopup(false)}
          >
            ✕
          </button>

        </div>

        {/* Info */}

        <div className="outlet-info">

          <div className="outlet-icon">
            📦
          </div>

          <div>

            <h3>Map selected products to an outlet</h3>

            <p>
              Choose the outlet, set a default price and timing,
              then save. Every selected product will be mapped
              to the selected outlet.

            </p>

          </div>

        </div>

        {/* Form */}

        <div className="outlet-form">

          <div className="form-group full">

            <label>Outlet *</label>
           <Select
  options={outlets.map((item) => ({
    value: item.outletId,
    label: item.outletName,
  }))}

  value={
    outlets
      .map((item) => ({
        value: item.outletId,
        label: item.outletName,
      }))
      .find((option) => option.value === outlet) || null
  }

  onChange={(selected) => setOutlet(selected.value)}

  placeholder="Select Outlet..."

  isSearchable

  styles={{
    control: (base) => ({
      ...base,
      minHeight: "46px",
      borderRadius: "8px",
    }),

    menu: (base) => ({
      ...base,
      zIndex: 99999,
    }),
  }}
/>

          </div>

          <div className="row">

            <div className="form-group">

              <label>Default Price (₹)</label>

              <input
                type="number"
                placeholder="149"
                value={defaultPrice}
                onChange={(e) =>
                  setDefaultPrice(e.target.value)
                }
              />

            </div>

            <button className="apply-btn">
              ↓ Apply
            </button>

            <div className="form-group">

              <label>Default Timing</label>

              <input
                type="text"
                placeholder="9:00-22:00"
                value={defaultTiming}
                onChange={(e) =>
                  setDefaultTiming(e.target.value)
                }
              />

            </div>

            <button className="apply-btn">
              ↓ Apply
            </button>

          </div>

          <div className="form-group full">

            <label>Default Type</label>

            <select
              value={defaultType}
              onChange={(e) =>
                setDefaultType(e.target.value)
              }
            >

              <option>
                -- Keep Per Item --
              </option>

              <option>Veg</option>

              <option>Non Veg</option>

            </select>

          </div>

        </div>

        <div className="products-header">

          <h4>PRODUCTS TO MAP</h4>

          <span>{products.length}</span>

        </div>

        <div className="products-list">

          {products.map((product) => (

            <div
              key={product.id}
              className="product-card"
            >

              <div className="product-details">

                <h5>

                  {product.masterProductName}

                  <span>{product.price}</span>

                </h5>

                <p>

                  {product.description}

                </p>

              </div>

              <div className="product-price">

                <input
                  type="number"
                  placeholder="Price"
                />

              </div>

              <div className="product-time">

                <input
                  type="text"
                  placeholder="e.g. 9:00-22:00"
                />

              </div>

              <div className="product-type">

                <select defaultValue={product.type}>

                  <option>Veg</option>

                  <option>Non Veg</option>

                </select>

              </div>

            </div>

          ))}

        </div>

        {/* Footer */}

        <div className="outlet-footer">

          <button
            className="outlet-cancel-btn"
        onClick={() => setShowOutletPopup(false)}
          >
            Cancel
          </button>

          <button
  className="outlet-save-btn"
  onClick={handleSaveProducts}
>
  💾 Save to Products
</button>

        </div>

      </div>

    </div>

  );

}

export default AddToOutletProducts;