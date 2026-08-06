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
    locationType: "STATE",
    selectedOutlets: [],

    startDate: "",
    endDate: "",
    mealTypeSlotIds: [], // List of slot IDs

    campaignType: "",
    couponId: null,
    discountType: "PERCENTAGE",
    priceModelId: null,
    priceDropValue: null,
  });

  const [loading, setLoading] = useState(false);

  // Function to get the current logged-in user's ID
  const getLoggedInUserId = () => {
    // 1. Try reading user object from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id || parsedUser.userId) {
          return parseInt(parsedUser.id || parsedUser.userId, 10);
        }
      } catch (e) {
        console.error("Failed to parse stored user object:", e);
      }
    }

    // 2. Alternatively check direct item key if stored separately
    const directUserId = localStorage.getItem("userId");
    if (directUserId) {
      return parseInt(directUserId, 10);
    }

    // 3. Fallback default ID if not found
    return 1;
  };

  const buildPayload = () => {
    const userId = getLoggedInUserId();

    // Map Discount Type to priceModelId (1 = PERCENTAGE, 2 = FLAT) if not explicitly set
    let resolvedPriceModelId = campaignData.priceModelId;
    if (campaignData.campaignType === "PRICE_DROP" && !resolvedPriceModelId) {
      resolvedPriceModelId = campaignData.discountType === "FLAT" ? 2 : 1;
    }

    return {
      campainType: campaignData.campaignType,
      locationId: parseInt(campaignData.locationId, 10),
      locationType: campaignData.locationType,
      mealTypeSlotIds: campaignData.mealTypeSlotIds,
      promotionFromDate: `${campaignData.startDate}T00:00:00`,
      promotionToDate: `${campaignData.endDate}T23:59:59`,
      outletIds: campaignData.selectedOutlets,
      couponId: campaignData.couponId ? parseInt(campaignData.couponId, 10) : null,
      priceModelId: resolvedPriceModelId ? parseInt(resolvedPriceModelId, 10) : null,
      priceDropValue: campaignData.priceDropValue ? parseFloat(campaignData.priceDropValue) : null,
      createdBy: userId,
    };
  };

  const handlePublish = async () => {
    // 1. Location Validation
    if (!campaignData.locationId) {
      alert("Please select a Location.");
      return;
    }

    // 2. Dates Validation
    if (!campaignData.startDate || !campaignData.endDate) {
      alert("Please select both Start Date and End Date.");
      return;
    }

    // 3. Meal Slots Validation
    if (!campaignData.mealTypeSlotIds || campaignData.mealTypeSlotIds.length === 0) {
      alert("Please select at least one available Meal Time Slot.");
      return;
    }

    // 4. Outlets Validation
    if (!campaignData.selectedOutlets || campaignData.selectedOutlets.length === 0) {
      alert("Please select at least one outlet.");
      return;
    }

    // 5. Campaign Type & Specific Type Validations
    if (!campaignData.campaignType) {
      alert("Please select a Campaign Type.");
      return;
    }

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
      alert(response?.message || "Campaign Created Successfully!");
    } catch (error) {
      console.error("Failed to publish campaign:", error);
      alert(error?.response?.data?.message || "Failed to create campaign.");
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