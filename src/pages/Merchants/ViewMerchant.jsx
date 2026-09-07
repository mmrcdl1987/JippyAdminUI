import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiCreditCard, 
  FiUser, 
  FiFileText, 
  FiExternalLink,
  FiAlertCircle
} from "react-icons/fi";
import { FaStore, FaCamera } from "react-icons/fa";
import { getMerchantAddress, getMerchantProfile, updateMerchantProfilePic } from "../../services/merchantService";
import "../../styles/Merchants/ViewMerchant.css";

function ViewMerchant({ setActivePage }) {
  const navigate = useNavigate();
  const merchantId = localStorage.getItem("merchantId");

  const [profile, setProfile] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Profile picture states
  const [showPicModal, setShowPicModal] = useState(false);
  const [selectedPicFile, setSelectedPicFile] = useState(null);
  const [previewPicUrl, setPreviewPicUrl] = useState("");
  const [updatingPic, setUpdatingPic] = useState(false);

  useEffect(() => {
    if (!merchantId) {
      setError("No Merchant ID provided.");
      setLoading(false);
      return;
    }
    fetchMerchantDetails();
  }, [merchantId]);

  const fetchMerchantDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both profile and address in parallel
      const [profileRes, addressRes] = await Promise.allSettled([
        getMerchantProfile(merchantId),
        getMerchantAddress(merchantId)
      ]);

      let hasData = false;

      if (profileRes.status === "fulfilled" && profileRes.value) {
        const pData = profileRes.value?.data || profileRes.value;
        if (pData) {
          setProfile(pData);
          // Set preview URL from profile
          if (pData.profilePicUrl) {
            setPreviewPicUrl(pData.profilePicUrl);
          }
          hasData = true;
        }
      } else {
        console.warn("Profile fetch failed or returned null:", profileRes.reason);
      }

      if (addressRes.status === "fulfilled" && addressRes.value) {
        const aData = addressRes.value?.data || addressRes.value;
        if (aData) {
          setAddress(aData);
          hasData = true;
        }
      } else {
        console.warn("Address fetch failed or returned null:", addressRes.reason);
      }

      if (!hasData) {
        setError("Merchant profile and address details could not be found.");
      }
    } catch (err) {
      console.error("Error loading merchant details:", err);
      setError("Failed to load merchant information.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // PROFILE PICTURE HANDLERS
  // ============================================================
  const handleOpenPicModal = () => {
    setSelectedPicFile(null);
    setPreviewPicUrl(profile?.profilePicUrl || "");
    setShowPicModal(true);
  };

  const handlePicFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setSelectedPicFile(file);
      setPreviewPicUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveProfilePic = async () => {
    if (!selectedPicFile) {
      alert("Please select an image file to upload.");
      return;
    }
    try {
      setUpdatingPic(true);
      const res = await updateMerchantProfilePic(merchantId, selectedPicFile);
      console.log("Update profile pic response:", res);
      
      const updatedUrl = res?.data?.profilePicUrl || res?.profilePicUrl || previewPicUrl;
      
      // Update profile state
      setProfile((prev) => ({
        ...prev,
        profilePicUrl: updatedUrl
      }));
      
      setShowPicModal(false);
      alert("Profile picture updated successfully!");
      
      // Refresh merchant details
      await fetchMerchantDetails();
    } catch (err) {
      console.error("Failed to update profile pic:", err);
      alert("Failed to update profile picture: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingPic(false);
    }
  };

  const handleBack = () => {
    if (setActivePage) {
      setActivePage("merchants");
    } else {
      navigate("/dashboard/merchants");
    }
  };

  const handleViewOutlets = () => {
    localStorage.setItem("merchantId", merchantId);
    if (setActivePage) {
      setActivePage("viewOutlets");
    } else {
      navigate("/dashboard/viewOutlets");
    }
  };

  const handleEditMerchant = () => {
    localStorage.setItem("merchantId", merchantId);
    if (setActivePage) {
      setActivePage("editMerchant");
    } else {
      navigate("/dashboard/editMerchant");
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="view-merchant-page">
        <div className="view-merchant-container">
          <div className="view-merchant-loading">
            <h3>⏳ Loading Merchant Details...</h3>
            <p>Please wait while we fetch the merchant information.</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================
  if (error && !profile && !address) {
    return (
      <div className="view-merchant-page">
        <div className="view-merchant-container">
          <div className="view-merchant-error">
            <FiAlertCircle size={36} color="#ef4444" />
            <h3>Unable to Load Merchant Details</h3>
            <p>{error}</p>
            <button className="view-merchant-back-btn" onClick={handleBack}>
              <FiArrowLeft /> Back to Merchants List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STATUS HELPERS
  // ============================================================
  const rawStatus = profile?.status || "";
  const isStatusActive = rawStatus.toUpperCase() === "ACTIVE" || rawStatus === "Y" || rawStatus === "APPROVED";
  const savedProfilePic = localStorage.getItem("merchantProfilePicUrl");
  const profilePicToDisplay = profile?.profilePicUrl || savedProfilePic || previewPicUrl;

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="view-merchant-page">
      <div className="view-merchant-container">
        
        {/* ============================================================
            NAVIGATION & HEADER
        ============================================================ */}
        <div className="view-merchant-header">
          <button className="view-merchant-back-btn" onClick={handleBack}>
            <FiArrowLeft /> Back to Merchants
          </button>

          <div className="view-merchant-header-actions">
            <button className="view-merchant-action-btn outlets-btn" onClick={handleViewOutlets}>
              <FaStore /> View Outlets
            </button>
            <button className="view-merchant-action-btn edit-btn" onClick={handleEditMerchant}>
              Edit Merchant
            </button>
          </div>
        </div>

        {/* ============================================================
            HERO CARD WITH PROFILE PICTURE
        ============================================================ */}
        <div className="view-merchant-hero-card">
          <div className="view-merchant-profile-meta">
            <div 
              className="view-merchant-avatar-wrapper"
              onClick={handleOpenPicModal}
              title="Click to update profile picture"
            >
              {profilePicToDisplay ? (
                <img 
                  src={profilePicToDisplay} 
                  alt={profile?.merchantName || "Merchant"} 
                />
              ) : (
                (profile?.merchantName || "M").charAt(0).toUpperCase()
              )}
              <div className="view-merchant-avatar-camera-overlay">
                <FaCamera />
              </div>
            </div>
            <div>
              <h2 className="view-merchant-name-title">
                {profile?.merchantName || `Merchant #${merchantId}`}
              </h2>
              <div className="view-merchant-subtitle">
                <span>ID: #{merchantId}</span>
                {profile?.businessType && (
                  <span className="view-merchant-badge business-type">
                    {profile.businessType}
                  </span>
                )}
                {rawStatus && (
                  <span className={`view-merchant-badge ${isStatusActive ? "status-active" : "status-inactive"}`}>
                    {rawStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            DETAILS GRID
        ============================================================ */}
        <div className="view-merchant-grid-layout">

          {/* ============================================================
              1. BASIC MERCHANT INFORMATION
          ============================================================ */}
          <div className="view-merchant-card">
            <div className="view-merchant-card-header">
              <FiUser className="view-merchant-card-icon" />
              <span>Merchant Profile</span>
            </div>

            <div className="view-merchant-info-list">
              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Merchant Name</span>
                <span className="view-merchant-value highlight">{profile?.merchantName || "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Business Type</span>
                <span className="view-merchant-value">{profile?.businessType || "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Email Address</span>
                <span className="view-merchant-value">{profile?.merchantEmail || "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Phone Number</span>
                <span className="view-merchant-value">{profile?.merchantPhone || "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">User Type</span>
                <span className="view-merchant-value">{profile?.userType || "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Status</span>
                <span className="view-merchant-value">{rawStatus || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* ============================================================
              2. MERCHANT ZONE & ADDRESS
          ============================================================ */}
          <div className="view-merchant-card">
            <div className="view-merchant-card-header">
              <FiMapPin className="view-merchant-card-icon" />
              <span>Merchant Zone & Address</span>
            </div>

            {/* Merchant Zone Banner */}
            <div className="view-merchant-zone-box">
              <FiMapPin className="view-merchant-zone-icon" />
              <div className="view-merchant-zone-text">
                <h4>
                  Zone: {[address?.areaName, address?.cityName, address?.stateName].filter(Boolean).join(", ") || "Zone Not Specified"}
                </h4>
                <p>Location Hierarchy (Area, City, State)</p>
              </div>
            </div>

            <div className="view-merchant-info-list">
              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Area</span>
                <span className="view-merchant-value highlight">{address?.areaName || "-"} (ID: {address?.areaId ?? "N/A"})</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">City</span>
                <span className="view-merchant-value highlight">{address?.cityName || "-"} (ID: {address?.cityId ?? "N/A"})</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">State</span>
                <span className="view-merchant-value highlight">{address?.stateName || "-"} (ID: {address?.stateId ?? "N/A"})</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Address Type</span>
                <span className="view-merchant-value">{address?.addressType || "PRIMARY"}</span>
              </div>

              <div className="view-merchant-info-item full-width">
                <span className="view-merchant-label">Building / House No.</span>
                <span className="view-merchant-value">{address?.buildingNumber || "-"}</span>
              </div>

              <div className="view-merchant-info-item full-width">
                <span className="view-merchant-label">Road / Street</span>
                <span className="view-merchant-value">{address?.road || "-"}</span>
              </div>

              <div className="view-merchant-info-item full-width">
                <span className="view-merchant-label">Landmark</span>
                <span className="view-merchant-value">{address?.landmark || "-"}</span>
              </div>
            </div>
          </div>

          {/* ============================================================
              3. BANK ACCOUNT & FINANCIAL DETAILS
          ============================================================ */}
          <div className="view-merchant-card">
            <div className="view-merchant-card-header">
              <FiCreditCard className="view-merchant-card-icon" />
              <span>Bank & Financial Details</span>
            </div>

            <div className="view-merchant-info-list">
              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Account Holder Name</span>
                <span className="view-merchant-value highlight">{profile?.accountHolderName || "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Bank Name</span>
                <span className="view-merchant-value">{profile?.bankName || "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Account Number</span>
                <span className="view-merchant-value">{profile?.accountNumber || "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">IFSC Code</span>
                <span className="view-merchant-value">{profile?.ifscCode || "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Bank ID</span>
                <span className="view-merchant-value">{profile?.bankId ?? "-"}</span>
              </div>

              <div className="view-merchant-info-item">
                <span className="view-merchant-label">Recipient ID</span>
                <span className="view-merchant-value">{profile?.recipientId ?? "-"}</span>
              </div>
            </div>
          </div>

          {/* ============================================================
              4. KYC & VERIFICATION DOCUMENTS
          ============================================================ */}
          <div className="view-merchant-card">
            <div className="view-merchant-card-header">
              <FiFileText className="view-merchant-card-icon" />
              <span>KYC Documents & Verification</span>
            </div>

            <div className="view-merchant-info-list">
              <div className="view-merchant-info-item full-width">
                <span className="view-merchant-label">Aadhaar Number</span>
                <span className="view-merchant-value highlight">{profile?.aadharNumber || "-"}</span>
                {profile?.aadhaarNumberUrl ? (
                  <a 
                    href={profile.aadhaarNumberUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="view-merchant-doc-link"
                  >
                    📄 View Aadhaar Document <FiExternalLink />
                  </a>
                ) : (
                  <span className="view-merchant-no-doc">No document uploaded</span>
                )}
              </div>

              <div className="view-merchant-info-item full-width">
                <span className="view-merchant-label">PAN Number</span>
                <span className="view-merchant-value highlight">{profile?.panNumber || "-"}</span>
                {profile?.panNumberUrl ? (
                  <a 
                    href={profile.panNumberUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="view-merchant-doc-link"
                  >
                    📄 View PAN Document <FiExternalLink />
                  </a>
                ) : (
                  <span className="view-merchant-no-doc">No document uploaded</span>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================
          PROFILE PICTURE MODAL
      ============================================================ */}
      {showPicModal && (
        <div className="pic-modal-backdrop" onClick={() => setShowPicModal(false)}>
          <div className="pic-modal-content" onClick={(e) => e.stopPropagation()}>
            
            <div className="pic-modal-header">
              <h3>🖼️ Profile Picture - {profile?.merchantName || "Merchant"}</h3>
              <button className="pic-modal-close" onClick={() => setShowPicModal(false)}>
                ×
              </button>
            </div>

            <div className="pic-modal-body">
              {previewPicUrl ? (
                <img 
                  src={previewPicUrl} 
                  alt="Preview" 
                  className="pic-modal-preview"
                />
              ) : (
                <div className="pic-modal-preview-placeholder">
                  {(profile?.merchantName || "M").charAt(0).toUpperCase()}
                </div>
              )}

              <div style={{ width: "100%" }}>
                <label className="pic-modal-file-label">
                  Select Image File (.png, .jpg, .jpeg)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePicFileChange}
                  className="pic-modal-file-input"
                />
                {selectedPicFile && (
                  <span className="pic-modal-file-info">
                    Selected: {selectedPicFile.name} ({(selectedPicFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
            </div>

            <div className="pic-modal-footer">
              <button
                className="pic-modal-cancel-btn"
                onClick={() => setShowPicModal(false)}
                disabled={updatingPic}
              >
                Cancel
              </button>
              <button
                className="pic-modal-save-btn"
                onClick={handleSaveProfilePic}
                disabled={updatingPic}
              >
                {updatingPic ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default ViewMerchant;