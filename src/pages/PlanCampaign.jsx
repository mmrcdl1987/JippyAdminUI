import React, { useState } from "react";
import "../styles/PlanCampaign.css";

import CampaignLocation from "../components/campaign/CampaignLocation";
import CampaignRules from "../components/campaign/CampaignRules";
import { createCampaign } from "../services/campaignApi";

function PlanCampaign() {
  const [campaignData, setCampaignData] = useState({
    stateId: "",
    cityId: "",
    areaId: "",
    locationId: null,
    locationType: "", // Dynamically updated by selection (e.g., STATE, CITY, AREA, etc.)
    selectedOutlets: [],

    startDate: "",
    endDate: "",
    mealTypeSlotIds: [],

    campaignType: "", // Can be "COUPON" or "PRICE_DROP"
    couponId: null,
    discountType: "", // Dynamically updated by selection (e.g., PERCENTAGE, FLAT)
    priceModelId: null,
    priceDropValue: null,
  });

  const [loading, setLoading] = useState(false);

  /**
   * Dynamically extracts the user ID from localStorage scanning all available keys.
   */
  const getDynamicUserId = () => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        if (!value) continue;

        if (value.startsWith("{") || value.startsWith("[")) {
          try {
            const parsed = JSON.parse(value);
            const foundId = parsed.id || parsed.userId || parsed.accountId || parsed.empId;
            if (foundId) return Number(foundId);
          } catch (e) {
            // Ignore parse errors for non-JSON strings
          }
        } else if (key.toLowerCase().includes("user") || key.toLowerCase().includes("id")) {
          const num = Number(value);
          if (!isNaN(num) && num > 0) return num;
        }
      }
    } catch (err) {
      console.warn("Dynamic user ID resolution warning:", err);
    }
    return null; 
  };

  const buildPayload = () => {
    const userId = getDynamicUserId();

    // Dynamically infer locationType if not explicitly set, based on active IDs
    let resolvedLocationType = campaignData.locationType;
    if (!resolvedLocationType) {
      if (campaignData.areaId) resolvedLocationType = "AREA";
      else if (campaignData.cityId) resolvedLocationType = "CITY";
      else if (campaignData.stateId) resolvedLocationType = "STATE";
      else resolvedLocationType = "OUTLET";
    }

    // Base payload common to both campaign types with dynamic location parameters
    const payload = {
      campainType: campaignData.campaignType,
      locationId: campaignData.locationId ? Number(campaignData.locationId) : null,
      locationType: resolvedLocationType,
      mealTypeSlotIds: campaignData.mealTypeSlotIds,
      promotionFromDate: campaignData.startDate ? `${campaignData.startDate}T00:00:00` : null,
      promotionToDate: campaignData.endDate ? `${campaignData.endDate}T23:59:59` : null,
      outletIds: campaignData.selectedOutlets,
    };

    // Dynamically attach fields based on whether it's a COUPON or PRICE_DROP campaign
    if (campaignData.campaignType === "COUPON") {
      payload.couponId = campaignData.couponId ? Number(campaignData.couponId) : null;
      payload.priceModelId = null;
      payload.priceDropValue = null;
    } else if (campaignData.campaignType === "PRICE_DROP") {
      // Dynamically resolve discountType if not set
      const currentDiscountType = campaignData.discountType || "PERCENTAGE";

      let resolvedPriceModelId = campaignData.priceModelId;
      if (!resolvedPriceModelId) {
        resolvedPriceModelId = currentDiscountType.toUpperCase() === "FLAT" ? 2 : 1;
      }

      payload.priceModelId = Number(resolvedPriceModelId);
      payload.priceDropValue = campaignData.priceDropValue ? Number(campaignData.priceDropValue) : null;
      payload.couponId = null;
    }

    if (userId !== null) {
      payload.createdBy = userId;
    }

    return payload;
  };

  const handlePublish = async () => {
    // 1. General Validations
    if (!campaignData.locationId) {
      alert("Please select a Location.");
      return;
    }

    if (!campaignData.startDate || !campaignData.endDate) {
      alert("Please select both Start Date and End Date.");
      return;
    }

    if (!campaignData.mealTypeSlotIds?.length) {
      alert("Please select at least one available Meal Time Slot.");
      return;
    }

    if (!campaignData.selectedOutlets?.length) {
      alert("Please select at least one outlet.");
      return;
    }

    if (!campaignData.campaignType) {
      alert("Please select a Campaign Type.");
      return;
    }

    // 2. Conditional Validations based on Campaign Type
    if (campaignData.campaignType === "COUPON" && !campaignData.couponId) {
      alert("Please select a Coupon.");
      return;
    }

    if (campaignData.campaignType === "PRICE_DROP" && !campaignData.priceDropValue) {
      alert("Please enter a valid Price Drop Value.");
      return;
    }

    const payload = buildPayload();

    try {
      setLoading(true);
      const response = await createCampaign(payload);
      alert(response?.message || response?.successMessage || "Campaign Created Successfully!");
    } catch (error) {
      console.error("Failed to publish campaign:", error);
      
      // Extract backend error message dynamically (e.g., "No active products found for outlet : 191")
      const errorData = error?.response?.data || error?.data || error;
      const dynamicErrorMessage =
        errorData?.errorMessage ||
        errorData?.message ||
        errorData?.error ||
        error?.message ||
        "An unexpected error occurred while creating the campaign.";

      alert(dynamicErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-page-wrapper">
      <div className="campaign-header-card">
        <div>
          <h1>Campaign Scheduler</h1>
          <p>Create and manage outlet campaigns seamlessly across your stores.</p>
        </div>
      </div>

      <div className="campaign-body-container">
        <CampaignLocation
          campaignData={campaignData}
          setCampaignData={setCampaignData}
        />

        <CampaignRules
          campaignData={campaignData}
          setCampaignData={setCampaignData}
        />
      </div>

      <div className="campaign-action-footer">
        <button
          type="button"
          className="btn-primary"
          onClick={handlePublish}
          disabled={loading}
        >
          {loading ? "Publishing..." : "🚀 Publish Campaign"}
        </button>
      </div>
    </div>
  );
}

export default PlanCampaign;