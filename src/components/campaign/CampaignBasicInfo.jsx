import React, { useState } from "react";
import "../../styles/campaign/CampaignBasicInfo.css";

function CampaignBasicInfo() {
  const [formData, setFormData] = useState({
    campaignName: "",
    campaignCode: "AUTO_GENERATED",
    campaignType: "",
    priority: "MEDIUM",
    status: "DRAFT",
    startDate: "",
    endDate: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="basic-info-card">

      <div className="section-header">

        <h2>Campaign Basic Information</h2>

        <p>
          Enter the campaign details.
        </p>

      </div>

      <div className="basic-info-grid">

        {/* Campaign Name */}

        <div className="form-group">

          <label>
            Campaign Name
            <span className="required">*</span>
          </label>

          <input
            type="text"
            name="campaignName"
            placeholder="Enter campaign name"
            value={formData.campaignName}
            onChange={handleChange}
          />

        </div>

        {/* Campaign Code */}

        <div className="form-group">

          <label>
            Campaign Code
          </label>

          <input
            type="text"
            name="campaignCode"
            value={formData.campaignCode}
            readOnly
          />

        </div>

        {/* Campaign Type */}

        <div className="form-group">

          <label>
            Campaign Type
          </label>

          <select
            name="campaignType"
            value={formData.campaignType}
            onChange={handleChange}
          >
            <option value="">
              Select Campaign
            </option>

            <option>
              Coupon
            </option>

            <option>
              Price Drop
            </option>

            <option>
              Banner
            </option>

            <option>
              Flash Sale
            </option>

          </select>

        </div>

        {/* Priority */}

        <div className="form-group">

          <label>Priority</label>

          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >

            <option>LOW</option>

            <option>MEDIUM</option>

            <option>HIGH</option>

          </select>

        </div>

        {/* Status */}

        <div className="form-group">

          <label>Status</label>

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >

            <option>DRAFT</option>

            <option>ACTIVE</option>

            <option>INACTIVE</option>

          </select>

        </div>

        {/* Start Date */}

        <div className="form-group">

          <label>
            Start Date
          </label>

          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />

        </div>

        {/* End Date */}

        <div className="form-group">

          <label>
            End Date
          </label>

          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />

        </div>

      </div>

      <div className="form-group description-box">

        <label>Description</label>

        <textarea
          name="description"
          rows="5"
          placeholder="Enter campaign description..."
          value={formData.description}
          onChange={handleChange}
        />

      </div>

    </div>
  );
}

export default CampaignBasicInfo;