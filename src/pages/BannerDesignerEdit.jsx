import React, { useEffect, useState } from "react";
import "../styles/BannerDesignerEdit.css";

function BannerDesignerEdit({ setActivePage }) {

  const bannerId =
    localStorage.getItem("selectedBannerId");

  const [loading, setLoading] =
    useState(true);

  const [form, setForm] =
    useState({
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

      // TODO:
      // const response =
      // await getBannerDesignerById(bannerId);

      // Temporary Data

      const response = {
        outletId: 101,
        subscriptionPlanId: 1,
        subscriptionFromDate: "2026-06-01",
        subscriptionToDate: "2026-12-31",
        bannerFromDate: "2026-06-10",
        bannerToDate: "2026-07-10",
        priceModelType: "FIXED",
        offerAmount: 100,
        status: "ACTIVE",

        mainBannerUrl:
          "https://s3.amazonaws.com/main.jpg",

        bestRestaurantBannerUrl:
          "https://s3.amazonaws.com/best.jpg",

        dealsBannerUrl:
          "https://s3.amazonaws.com/deals.jpg",
      };

      setForm(response);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value,

    });

  };
const handleBannerChange = async (type, event) => {
  const file = event.target.files[0];

  if (!file) return;

  // Upload to backend
  const response = await uploadBanner(file);

  const url = response.data.bannerUrl;

  setForm((prev) => ({
    ...prev,
    [type === "mainBanner"
      ? "mainBannerUrl"
      : type === "bestRestaurantBanner"
      ? "bestRestaurantBannerUrl"
      : "dealsBannerUrl"]: url,
  }));
};

  const updateBanner = async () => {

    try {

      // TODO

      // await updateBannerDesigner(
      // bannerId,
      // form
      // );

      alert("Banner Updated Successfully");

      setActivePage(
        "bannerDesigner"
      );

    } catch (error) {

      console.error(error);

    }

  };

  if (loading) {

    return <h3>Loading...</h3>;

  }

  return (

    <div className="banner-edit-page">

      <div className="page-header">

        <h2>
          Edit Banner
        </h2>

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
    onChange={(e) =>
      handleBannerChange("bestRestaurantBanner", e)
    }
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
    onChange={(e) =>
      handleBannerChange("dealsBanner", e)
    }
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
      className="cancel-btn"
      onClick={() => setActivePage("bannerDesigner")}
    >
      Cancel
    </button>

    <button
      className="save-btn"
      onClick={updateBanner}
    >
      Update Banner
    </button>

  </div>

</div>

    </div>

  );

}

export default BannerDesignerEdit;