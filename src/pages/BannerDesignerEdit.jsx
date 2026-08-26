import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadBannerImages } from "../services/api";
import "../styles/BannerDesignerEdit.css";

function BannerDesignerEdit() {
  const navigate = useNavigate();
  const bannerId = localStorage.getItem("selectedBannerId");
  
  // Assuming you store the logged-in user's ID in localStorage
  const currentUserId = localStorage.getItem("userId") || 1; 

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    outletId: "",
    subscriptionPlanId: "",
    subscriptionFromDate: "",
    subscriptionToDate: "",
    bannerFromDate: "",
    bannerToDate: "",
    priceModelType: "",
    offerAmount: "",
    status: "",
    mainBannerUrl: "",
    bestRestaurantBannerUrl: "",
    dealsBannerUrl: "",
  });

  // Store the actual File objects for upload
  const [bannerFiles, setBannerFiles] = useState({
    mainBanner: null,
    bestRestaurantBanner: null,
    dealsBanner: null,
  });

  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    try {
      console.log("Loading banner with ID:", bannerId);
      // Replace or extend this with your actual GET fetch API call using bannerId
      const response = {
        outletId: 101,
        subscriptionPlanId: bannerId || 9, // Fallback to 9 or fetched bannerId
        subscriptionFromDate: "2026-06-01",
        subscriptionToDate: "2026-12-31",
        bannerFromDate: "2026-06-10",
        bannerToDate: "2026-07-10",
        priceModelType: "FIXED",
        offerAmount: 100,
        status: "ACTIVE",
        mainBannerUrl: "https://s3.amazonaws.com/main.jpg",
        bestRestaurantBannerUrl: "https://s3.amazonaws.com/best.jpg",
        dealsBannerUrl: "https://s3.amazonaws.com/deals.jpg",
      };

      setForm(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerChange = (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Save the raw file object for FormData
    setBannerFiles((prev) => ({
      ...prev,
      [type]: file,
    }));

    // Create a local preview URL for the text input/display
    const fakeUrl = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      [type === "mainBanner"
        ? "mainBannerUrl"
        : type === "bestRestaurantBanner"
        ? "bestRestaurantBannerUrl"
        : "dealsBannerUrl"]: fakeUrl,
    }));
  };

  const updateBanner = async () => {
    try {
      setLoading(true);

      // 1. Construct FormData with keys matching Swagger specifications
      const formData = new FormData();
      
      if (bannerFiles.mainBanner) {
        formData.append("mainBannerImage", bannerFiles.mainBanner);
      }
      if (bannerFiles.bestRestaurantBanner) {
        formData.append("bestRestaurantBannerImage", bannerFiles.bestRestaurantBanner);
      }
      if (bannerFiles.dealsBanner) {
        formData.append("dealsBannerImage", bannerFiles.dealsBanner);
      }

      // 2. Define Query Parameters required by the API
      const outletSubscriptionPlanId = form.subscriptionPlanId || bannerId;
      const updatedBy = currentUserId;

      // 3. Call the modular API function
      await uploadBannerImages(outletSubscriptionPlanId, updatedBy, formData);

      alert("Banner Updated Successfully");
      navigate("/dashboard/bannerDesigner");
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Failed to update banner. Please check the console.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form.outletId) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="banner-edit-page">
      <div className="page-header">
        <h2>Edit Banner</h2>
      </div>

      <div className="banner-form">
        <h3>Subscription Details</h3>

        <div className="form-grid">
          <div className="form-group">
            <label>Outlet ID</label>
            <input value={form.outletId} readOnly />
          </div>

          <div className="form-group">
            <label>Subscription Plan ID</label>
            <input value={form.subscriptionPlanId} readOnly />
          </div>

          <div className="form-group">
            <label>Subscription From Date</label>
            <input value={form.subscriptionFromDate} readOnly />
          </div>

          <div className="form-group">
            <label>Subscription To Date</label>
            <input value={form.subscriptionToDate} readOnly />
          </div>

          <div className="form-group">
            <label>Banner From Date</label>
            <input value={form.bannerFromDate} readOnly />
          </div>

          <div className="form-group">
            <label>Banner To Date</label>
            <input value={form.bannerToDate} readOnly />
          </div>

          <div className="form-group">
            <label>Price Model</label>
            <input value={form.priceModelType} readOnly />
          </div>

          <div className="form-group">
            <label>Offer Amount</label>
            <input value={form.offerAmount} readOnly />
          </div>

          <div className="form-group">
            <label>Status</label>
            <input value={form.status} readOnly />
          </div>
        </div>

        <div className="divider"></div>

        <h3>Banner URL Details</h3>

        <div className="form-group">
          <label>Main Banner</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleBannerChange("mainBanner", e)}
          />
          <input
            type="text"
            value={form.mainBannerUrl}
            readOnly
            placeholder="Banner URL will appear after upload"
          />
        </div>

        <div className="form-group">
          <label>Best Restaurant Banner</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleBannerChange("bestRestaurantBanner", e)}
          />
          <input
            type="text"
            value={form.bestRestaurantBannerUrl}
            readOnly
            placeholder="Banner URL will appear after upload"
          />
        </div>

        <div className="form-group">
          <label>Deals Banner</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleBannerChange("dealsBanner", e)}
          />
          <input
            type="text"
            value={form.dealsBannerUrl}
            readOnly
            placeholder="Banner URL will appear after upload"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/dashboard/bannerDesigner")}
          >
            Cancel
          </button>

          <button
            type="button"
            className="save-btn"
            onClick={updateBanner}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Banner"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BannerDesignerEdit;