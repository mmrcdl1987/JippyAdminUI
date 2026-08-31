import { useState } from "react";
import "../styles/ApprovalRequests.css";
import { createApprovalRequest } from "../services/approvalService";

function CreateApprovalRequest() {
  const [formData, setFormData] = useState({
    entityType: "OUTLET",
    entityId: "",
    createdBy: 1,
  });

  const [loading, setLoading] = useState(false);
  const [lastSubmitted, setLastSubmitted] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.entityType) {
      alert("Please select an Entity Type.");
      return;
    }

    if (!formData.entityId || isNaN(Number(formData.entityId))) {
      alert("Please enter a valid numeric Entity ID.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        entityType: formData.entityType,
        entityId: Number(formData.entityId),
        createdBy: Number(formData.createdBy) || 1,
      };

      const res = await createApprovalRequest(payload);
      console.log("Create Approval Request Response:", res);

      const message =
        res?.message || res?.responseMessage || "Approval Request created successfully.";
      alert(message);

      setLastSubmitted({
        ...payload,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Reset form
      setFormData({
        entityType: "OUTLET",
        entityId: "",
        createdBy: 1,
      });
    } catch (error) {
      console.error("Create Approval Request Error:", error);
      const errMsg =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        "Failed to create Approval Request.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="req-page-wrapper">
      <div className="req-header-flex">
        <div>
          <h2 className="req-page-title">Create Approval Request</h2>
          <p className="req-subtitle">
            Initiate a new approval workflow request for an Outlet, Merchant, or Driver entity.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="req-card">
        <div className="req-card-header orange">NEW APPROVAL REQUEST</div>

        <form onSubmit={handleSubmit}>
          <div className="req-form-grid">
            <div className="req-form-group">
              <label className="req-form-label">
                Entity Type <span className="req-required">*</span>
              </label>
              <select
                className="req-form-select"
                name="entityType"
                value={formData.entityType}
                onChange={handleInputChange}
              >
                <option value="OUTLET">OUTLET</option>
                <option value="MERCHANT">MERCHANT</option>
                <option value="DRIVER">DRIVER</option>
              </select>
            </div>

            <div className="req-form-group">
              <label className="req-form-label">
                Entity ID <span className="req-required">*</span>
              </label>
              <input
                type="number"
                className="req-form-input"
                name="entityId"
                value={formData.entityId}
                onChange={handleInputChange}
                placeholder="e.g. 55, 102, 1"
              />
            </div>

            <div className="req-form-group">
              <label className="req-form-label">Created By (User ID)</label>
              <input
                type="number"
                className="req-form-input"
                name="createdBy"
                value={formData.createdBy}
                onChange={handleInputChange}
                placeholder="User / Admin ID (Default 1)"
              />
            </div>
          </div>

          <div className="req-button-wrapper">
            <button type="submit" className="req-submit-btn" disabled={loading}>
              {loading ? "Submitting Request..." : "+ Submit Approval Request"}
            </button>
          </div>
        </form>
      </div>

      {/* Last Submitted Info Banner */}
      {lastSubmitted && (
        <div className="req-card" style={{ paddingTop: "24px" }}>
          <div style={{ color: "#15803d", fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>
            ✅ Last Submitted Request ({lastSubmitted.timestamp}):
          </div>
          <div style={{ fontSize: "13px", color: "#334155" }}>
            Entity Type: <strong>{lastSubmitted.entityType}</strong> | Entity ID:{" "}
            <strong>#{lastSubmitted.entityId}</strong> | Created By: User #{lastSubmitted.createdBy}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateApprovalRequest;
