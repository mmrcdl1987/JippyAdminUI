import React, { useState } from "react";
import "../../styles/campaign/CampaignRules.css";

function CampaignRules() {

  const [rules, setRules] = useState({
    discountType: "",
    discountValue: "",
    minimumOrder: "",
    maximumDiscount: "",
    usageLimit: "",
    perUserLimit: "",
  });

  const handleChange = (e) => {
    setRules({
      ...rules,
      [e.target.name]: e.target.value,
    });
  };

  return (

    <div className="rules-card">

      <div className="section-header">

        <h2>Campaign Rules</h2>

        <p>
          Configure campaign eligibility and discount rules.
        </p>

      </div>

      <div className="rules-grid">

        <div className="form-group">
          <label>Discount Type</label>

          <select
            name="discountType"
            value={rules.discountType}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat Amount</option>
            <option value="FREE_DELIVERY">Free Delivery</option>
          </select>
        </div>

        <div className="form-group">
          <label>Discount Value</label>

          <input
            type="number"
            name="discountValue"
            placeholder="Enter value"
            value={rules.discountValue}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Minimum Order Amount</label>

          <input
            type="number"
            name="minimumOrder"
            placeholder="Minimum order"
            value={rules.minimumOrder}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Maximum Discount</label>

          <input
            type="number"
            name="maximumDiscount"
            placeholder="Maximum discount"
            value={rules.maximumDiscount}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Usage Limit</label>

          <input
            type="number"
            name="usageLimit"
            placeholder="Campaign usage limit"
            value={rules.usageLimit}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Per User Limit</label>

          <input
            type="number"
            name="perUserLimit"
            placeholder="Per user limit"
            value={rules.perUserLimit}
            onChange={handleChange}
          />
        </div>

      </div>

    </div>

  );
}

export default CampaignRules;