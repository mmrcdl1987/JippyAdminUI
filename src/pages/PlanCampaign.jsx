import React from "react";
import "../styles/PlanCampaign.css";

import CampaignHeader from "../components/campaign/CampaignHeader";
import CampaignDetails from "../components/campaign/CampaignDetails";

// import LocationSelection from "../components/campaign/LocationSelection";
// import TimeSlotManager from "../components/campaign/TimeSlotManager";
// import CalendarSection from "../components/campaign/CalendarSection";
// import CampaignType from "../components/campaign/CampaignType";
// import PreviewSection from "../components/campaign/PreviewSection";
// import ActionButtons from "../components/campaign/ActionButtons";

const PlanCampaign = () => {
  return (
    <div className="campaign-page">
      <CampaignHeader />
      <CampaignDetails />

      {/* Coming Soon */}
    </div>
  );
};

export default PlanCampaign;