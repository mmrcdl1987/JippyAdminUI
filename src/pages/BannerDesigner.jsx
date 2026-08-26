import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/BannerDesigner.css";
import { getBannerDesignerData } from "../services/api";

function BannerDesigner() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getBannerDesignerData();
      console.log("Banner Designer Response:", response);
      setData(response || []);
    } catch (error) {
      console.error("Failed to fetch banner data", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((row) => {
    const value = search.toLowerCase();
    return (
      row.outletId?.toString().includes(value) ||
      row.subscriptionPlanId?.toString().includes(value) ||
      row.priceModelType?.toLowerCase().includes(value) ||
      row.status?.toLowerCase().includes(value)
    );
  });

  if (loading) {
    return <div className="loading">Loading Banner Designer...</div>;
  }

  return (
    <div className="banner-page">
      <div className="page-header">
        <h2>Banner Designer</h2>
      </div>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search Outlet ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Outlet ID</th>
              <th>Plan ID</th>
              <th>Subscription From</th>
              <th>Subscription To</th>
              <th>Banner From</th>
              <th>Banner To</th>
              <th>Main Banner</th>
              <th>Best Banner</th>
              <th>Deals Banner</th>
              <th>Price Model</th>
              <th>Offer Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="13" style={{ textAlign: "center", padding: "20px" }}>
                  No Banner Records Found
                </td>
              </tr>
            )}

            {filteredData.map((row) => (
              <tr key={row.outletSubscriptionPlanId || row.id}>
                <td>{row.outletId || "-"}</td>
                <td>{row.subscriptionPlanId || "-"}</td>
                {/* Dynamically mapped date fields */}
                <td>{row.subscriptionFromDate || row.subscriptionFrom || "-"}</td>
                <td>{row.subscriptionToDate || row.subscriptionTo || "-"}</td>
                <td>{row.bannerFromDate || row.bannerFrom || "-"}</td>
                <td>{row.bannerToDate || row.bannerTo || "-"}</td>
                
                {/* Main Banner Link */}
                <td>
                  {row.mainBannerUrl || row.mainBanner ? (
                    <a href={row.mainBannerUrl || row.mainBanner} target="_blank" rel="noopener noreferrer" className="banner-link">
                      View URL
                    </a>
                  ) : (
                    <span className="no-url">No URL</span>
                  )}
                </td>

                {/* Best Restaurant Banner Link */}
                <td>
                  {row.bestRestaurantBannerUrl || row.bestRestaurantBanner ? (
                    <a href={row.bestRestaurantBannerUrl || row.bestRestaurantBanner} target="_blank" rel="noopener noreferrer" className="banner-link">
                      View URL
                    </a>
                  ) : (
                    <span className="no-url">No URL</span>
                  )}
                </td>

                {/* Deals Banner Link */}
                <td>
                  {row.dealsBannerUrl || row.dealsBanner ? (
                    <a href={row.dealsBannerUrl || row.dealsBanner} target="_blank" rel="noopener noreferrer" className="banner-link">
                      View URL
                    </a>
                  ) : (
                    <span className="no-url">No URL</span>
                  )}
                </td>

                <td>{row.priceModelType || "-"}</td>
                <td>₹{row.offerAmount !== undefined ? row.offerAmount : "0"}</td>
                <td>
                  <span className={row.status === "ACTIVE" ? "status-active" : "status-inactive"}>
                    {row.status || "INACTIVE"}
                  </span>
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => {
                      localStorage.setItem("selectedBannerId", row.outletSubscriptionPlanId);
                      navigate("/dashboard/bannerDesignerEdit");
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BannerDesigner;