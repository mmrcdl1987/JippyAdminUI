import React, { useState, useEffect } from "react";
import { getActiveCoupons } from "../../services/campaignApi";
import "../../styles/campaign/CampaignRules.css";

function CampaignRules({ campaignData, setCampaignData }) {
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  useEffect(() => {
    if (campaignData.campaignType === "COUPON") {
      fetchCoupons();
    }
  }, [campaignData.campaignType]);

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const response = await getActiveCoupons();
      setCoupons(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch active coupons:", error);
      setCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "campaignType") {
      setCampaignData((prev) => ({
        ...prev,
        [name]: value,
        couponId: null, // Reset coupon selection
        priceModelId: null,
        priceDropValue: null,
      }));
      return;
    }

    if (name === "couponId") {
      setCampaignData((prev) => ({
        ...prev,
        couponId: value ? parseInt(value, 10) : null,
      }));
      return;
    }

    setCampaignData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="section-card rules-card">
      <div className="section-title-row">
        <span className="icon-badge">🏷️</span>
        <div>
          <h2>Campaign Type</h2>
          <p>Select a campaign type to configure its options.</p>
        </div>
      </div>

      {/* Primary Dropdown */}
      <div className="form-group campaign-type-dropdown">
        <label>
          Campaign Type <span className="required">*</span>
        </label>
        <select
          name="campaignType"
          value={campaignData.campaignType || ""}
          onChange={handleChange}
        >
          <option value="">-- Select Campaign Type --</option>
          <option value="COUPON">Coupon</option>
          <option value="PRICE_DROP">Price Drop</option>
        </select>
      </div>

      {campaignData.campaignType && <hr className="section-divider" />}

      {/* 1. COUPON Dropdown */}
      {campaignData.campaignType === "COUPON" && (
        <div className="rules-grid single-field-grid">
          <div className="form-group">
            <label>
              Select Coupon <span className="required">*</span>
            </label>
            <select
              name="couponId"
              value={campaignData.couponId || ""}
              onChange={handleChange}
              disabled={loadingCoupons}
            >
              <option value="">
                {loadingCoupons ? "Loading coupons..." : "-- Select Coupon Code --"}
              </option>
              {coupons.map((coupon) => (
                <option key={coupon.couponId} value={coupon.couponId}>
                  {coupon.couponCode} {coupon.discountValue ? `(${coupon.discountValue} OFF)` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 2. PRICE DROP Options */}
      {campaignData.campaignType === "PRICE_DROP" && (
        <div className="rules-grid">
          <div className="form-group">
            <label>
              Discount Type <span className="required">*</span>
            </label>
            <select
              name="discountType"
              value={campaignData.discountType || "PERCENTAGE"}
              onChange={handleChange}
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Amount ($/₹)</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              {campaignData.discountType === "FLAT"
                ? "Discount Amount"
                : "Discount Percentage (%)"}{" "}
              <span className="required">*</span>
            </label>
            <input
              type="number"
              name="priceDropValue"
              placeholder={
                campaignData.discountType === "FLAT" ? "e.g. 100" : "e.g. 20 (%)"
              }
              value={campaignData.priceDropValue || ""}
              onChange={handleChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignRules;