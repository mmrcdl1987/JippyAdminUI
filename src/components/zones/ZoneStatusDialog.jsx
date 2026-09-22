import PropTypes from "prop-types";
import { FiAlertTriangle, FiCheckCircle, FiX, FiRefreshCw } from "react-icons/fi";

function ZoneStatusDialog({
  isOpen,
  zone,
  targetStatus,
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen || !zone) return null;

  const isDeactivating = targetStatus === "INACTIVE";

  return (
    <div className="zone-modal-backdrop" onClick={onCancel}>
      <div
        className="zone-modal-card status-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-dialog-title"
      >
        <div className="status-dialog-header">
          <div
            className={`status-dialog-icon ${
              isDeactivating ? "icon-warning" : "icon-success"
            }`}
          >
            {isDeactivating ? (
              <FiAlertTriangle size={24} />
            ) : (
              <FiCheckCircle size={24} />
            )}
          </div>
          <div>
            <h3 id="status-dialog-title">
              {isDeactivating ? "Deactivate Delivery Zone" : "Activate Delivery Zone"}
            </h3>
            <p className="status-dialog-subtitle">
              Review and confirm the status transition for this zone.
            </p>
          </div>
          <button
            type="button"
            className="zone-modal-close"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="status-dialog-body">
          <div className="status-target-zone-box">
            <div className="status-zone-label">Target Zone:</div>
            <div className="status-zone-title">
              <strong>{zone.zoneName || "Unnamed Zone"}</strong>
              <span className="zone-id-tag-pill">ID #{zone.zoneId}</span>
            </div>

            <div className="status-transition-row">
              <div className="status-transition-item">
                <span className="status-transition-label">Current Status</span>
                <span
                  className={`status-pill ${
                    isDeactivating ? "status-active" : "status-inactive"
                  }`}
                >
                  <span className="status-dot" />
                  {isDeactivating ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <div className="status-transition-arrow">➔</div>

              <div className="status-transition-item">
                <span className="status-transition-label">Requested Status</span>
                <span
                  className={`status-pill ${
                    isDeactivating ? "status-inactive" : "status-active"
                  }`}
                >
                  <span className="status-dot" />
                  {targetStatus}
                </span>
              </div>
            </div>
          </div>

          <div
            className={`status-warning-banner ${
              isDeactivating ? "banner-warning" : "banner-info"
            }`}
          >
            <strong>
              {isDeactivating ? "Warning: " : "Operational Note: "}
            </strong>
            {isDeactivating
              ? "Deactivating this delivery zone will immediately suspend driver dispatching and prevent customer orders from being placed or assigned in this area."
              : "Activating this delivery zone will make it live immediately. Drivers operating within this boundary will become eligible to receive new orders."}
          </div>
        </div>

        <div className="status-dialog-footer">
          <button
            type="button"
            className="btn-status-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`btn-status-confirm ${
              isDeactivating ? "btn-danger" : "btn-primary"
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <FiRefreshCw className="zone-spin" size={15} />
                <span>Updating...</span>
              </>
            ) : (
              <span>
                Confirm {isDeactivating ? "Deactivation" : "Activation"}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

ZoneStatusDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  zone: PropTypes.object,
  targetStatus: PropTypes.oneOf(["ACTIVE", "INACTIVE"]).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ZoneStatusDialog;
