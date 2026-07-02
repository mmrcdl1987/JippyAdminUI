import { useState } from "react";
import "../styles/ProductPriceUpdate.css";
import Select from "react-select";

const ProductPriceUpdate = () => {
  const [stateValue, setStateValue] = useState("");
  const [cityValue, setCityValue] = useState("");
  const [areaValue, setAreaValue] = useState("");
  const [selectedOutlets, setSelectedOutlets] = useState([]);
  const [search, setSearch] = useState("");

  const outletOptions = [
  { value: 1, label: "Outlet A" },
  { value: 2, label: "Outlet B" },
  { value: 3, label: "Outlet C" },
  { value: 4, label: "Outlet D" },
  { value: 5, label: "Outlet E" },
  { value: 6, label: "Outlet F" },
];

  const products = [
    {
      id: 1,
      name: "Burger",
      merchantPrice: 50,
      onlinePrice: 50,
      newPrice: 55,
    },
    {
      id: 2,
      name: "Veg Pizza",
      merchantPrice: 200,
      onlinePrice: 200,
      newPrice: 210,
    },
    {
      id: 3,
      name: "Chicken Sub",
      merchantPrice: 120,
      onlinePrice: 120,
      newPrice: 130,
    },
    {
      id: 4,
      name: "French Fries",
      merchantPrice: 99,
      onlinePrice: 99,
      newPrice: 105,
    },
  ];

  return (
    <div className="price-update-page">
      <div className="page-header">
        <h2>Product Price Update</h2>
        <p>Dashboard / Price Management / Product Price Update</p>
      </div>

      <div className="filter-card">
        <div className="filter-grid">
          <div>
            <label>State</label>
            <select
              value={stateValue}
              onChange={(e) => setStateValue(e.target.value)}
            >
              <option>Select State</option>
              <option>Telangana</option>
              <option>Karnataka</option>
            </select>
          </div>

          <div>
            <label>City</label>
            <select
              value={cityValue}
              onChange={(e) => setCityValue(e.target.value)}
            >
              <option>Select City</option>
              <option>Hyderabad</option>
              <option>Bangalore</option>
            </select>
          </div>

          <div>
            <label>Area</label>
            <select
              value={areaValue}
              onChange={(e) => setAreaValue(e.target.value)}
            >
              <option>Select Area</option>
              <option>Madhapur</option>
              <option>Hitech City</option>
            </select>
          </div>

          <div>
  <label>Outlet</label>

  <Select
    isMulti
    options={outletOptions}
    value={selectedOutlets}
    onChange={setSelectedOutlets}
    placeholder="Select Outlet(s)"
    closeMenuOnSelect={false}
  />
</div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search Product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Select</th>
              <th>Product</th>
              <th>Merchant Price</th>
              <th>Online Price</th>
              <th>New Price</th>
              <th>Difference</th>
            </tr>
          </thead>

          <tbody>
            {products
              .filter((item) =>
                item.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <tr key={item.id}>
                  <td>
                    <input type="checkbox" />
                  </td>

                  <td>{item.name}</td>

                  <td>₹{item.merchantPrice}</td>

                  <td>₹{item.onlinePrice}</td>

                  <td>
                    <input
                      type="number"
                      defaultValue={item.newPrice}
                    />
                  </td>

                  <td className="difference">
                    +₹{item.newPrice - item.onlinePrice}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="footer-buttons">
        <button className="cancel-btn">Cancel</button>
        <button className="preview-btn">Preview Changes</button>
      </div>
    </div>
  );
};

export default ProductPriceUpdate;