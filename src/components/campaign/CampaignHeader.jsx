import React from "react";

const CampaignHeader = () => {
  return (
    <div className="campaign-header">

      <div>
        <h1>Campaign Scheduler</h1>

        <p>
          Configure coupon campaigns and price drop campaigns.
        </p>
      </div>

      <div className="header-actions">

        <button className="btn-secondary">
          Reset
        </button>

        <button className="btn-primary">
          + New Campaign
        </button>

      </div>

    </div>
  );
};

export default CampaignHeader;