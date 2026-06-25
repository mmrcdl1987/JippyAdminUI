import React from "react";

const CampaignDetails = () => {
  return (
    <div className="card">

      <div className="section-header">

        <div>

          <h2>Campaign Details</h2>

          <p>
            Basic information about the campaign.
          </p>

        </div>

      </div>

      <div className="form-grid">

        <div className="form-group">

          <label>
            Campaign Name
            <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="Summer Mega Sale"
          />

        </div>

        <div className="form-group">

          <label>Campaign Code</label>

          <input
            type="text"
            placeholder="Auto Generated"
            disabled
          />

        </div>

        <div className="form-group">

          <label>Status</label>

          <select>

            <option>Draft</option>

            <option>Active</option>

            <option>Inactive</option>

          </select>

        </div>

        <div className="form-group">

          <label>Priority</label>

          <select>

            <option>Low</option>

            <option>Medium</option>

            <option>High</option>

          </select>

        </div>

        <div className="form-group">

          <label>Start Date</label>

          <input type="date"/>

        </div>

        <div className="form-group">

          <label>End Date</label>

          <input type="date"/>

        </div>

        <div className="form-group full-width">

          <label>Description</label>

          <textarea
            rows="5"
            placeholder="Campaign description..."
          />

        </div>

      </div>

    </div>
  );
};

export default CampaignDetails;