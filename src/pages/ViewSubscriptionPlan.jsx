import { useNavigate } from "react-router-dom";
import "../styles/ViewSubscriptionPlan.css";

function ViewSubscriptionPlan({ selectedPlan }) {
  const navigate = useNavigate();

  return (
    <div className="view-sub-page-wrapper">
      <h2 className="view-sub-page-title">
        View Subscription Plan
      </h2>

      <div className="view-sub-toolbar">
        <button
          className="view-sub-top-back-btn"
          onClick={() =>
            navigate("/dashboard/subscriptionPlanSettings")
          }
        >
          ← Back
        </button>
      </div>

      <div className="view-sub-card">
        <div className="view-sub-card-header">
          SUBSCRIPTION PLAN DETAILS
        </div>

        <div className="view-sub-grid">
          <div className="view-sub-item">
            <label>Plan Name</label>
            <span>{selectedPlan?.planName || "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>Price</label>
            <span>
              ₹ {selectedPlan?.price !== undefined ? Number(selectedPlan.price).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "-"}
            </span>
          </div>

          <div className="view-sub-item">
            <label>Duration</label>
            <span>{selectedPlan?.durationInDays ? `${selectedPlan.durationInDays} Days` : "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>Banner Duration</label>
            <span>{selectedPlan?.bannerDurationInDays ? `${selectedPlan.bannerDurationInDays} Days` : "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>Radius</label>
            <span>{selectedPlan?.radiusInKms ? `${selectedPlan.radiusInKms} Km` : "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>Banner Slot</label>
            <span>{selectedPlan?.bannerSlot ?? "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>Best Restaurant Slot</label>
            <span>{selectedPlan?.bestRestaurantSlot ?? "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>Deals Slot</label>
            <span>{selectedPlan?.dealsSlot ?? "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>WhatsApp Broadcast</label>
            <span>{selectedPlan?.whatsappBroadcast || "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>Video Credits</label>
            <span>{selectedPlan?.videoCredits || "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>Area ID</label>
            <span>{selectedPlan?.areaId || "-"}</span>
          </div>

          <div className="view-sub-item">
            <label>User ID</label>
            <span>{selectedPlan?.userId || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewSubscriptionPlan;