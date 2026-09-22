import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiMapPin,
} from "react-icons/fi";

function DriverTableRow({
  driver,
  onView,
  onEdit,
  onDelete,
}) {
  const profileImage =
    driver?.profilePicUrl ||
    driver?.profilePicture ||
    null;

  const driverId =
    driver?.driverId ||
    driver?.id ||
    "-";

  const firstName = driver?.firstName || "";
  const lastName = driver?.lastName || "";
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || `Driver #${driverId}`;

  const initial = (firstName?.[0] || fullName?.[0] || "D").toUpperCase();

  const handleDriverNameClick = () => {
    if (!driver) return;
    if (onView) {
      onView(driver);
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(driver);
    }
  };

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(driver);
    }
  };

  return (
    <tr className="jippy-driver-main-row">
      {/* DRIVER ID */}
      <td className="cat-id">
        <span>#{driverId}</span>
      </td>

      {/* DRIVER NAME & AVATAR */}
      <td>
        <div
          className="cat-name-wrapper"
          style={{ cursor: "pointer" }}
          onClick={handleDriverNameClick}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={fullName}
              className="driver-table-avatar"
            />
          ) : (
            <div className="cat-name-avatar">
              {initial}
            </div>
          )}

          <div>
            <button
              type="button"
              className="cat-name jippy-driver-name-link"
              onClick={handleDriverNameClick}
              title="Open Driver Details"
            >
              {fullName}
            </button>
            <div className="cat-id-text">
              {driver?.isApproved ? "Verified Driver" : "Pending Verification"}
            </div>
          </div>
        </div>
      </td>

      {/* EMAIL */}
      <td className="jippy-driver-email-cell">
        {driver?.email || "-"}
      </td>

      {/* PHONE NUMBER */}
      <td>
        <span style={{ fontWeight: "600", color: "#334155" }}>
          {driver?.phoneNumber || "-"}
        </span>
      </td>

      {/* AREA */}
      <td>
        <span className="driver-area-badge">
          <FiMapPin className="area-icon" />
          {driver?.areaName || (driver?.areaId ? `Area #${driver.areaId}` : "-")}
        </span>
      </td>

      {/* STATUS */}
      <td>
        <span
          className={`cat-type-badge ${
            driver?.isActive ? "home" : "all"
          }`}
        >
          <span className="cat-type-dot" />
          {driver?.isActive ? "Active" : "Inactive"}
        </span>
      </td>

      {/* ACTIONS */}
      <td className="jippy-driver-actions-cell" style={{ textAlign: "center" }}>
        <div className="cat-actions" style={{ justifyContent: "center" }}>
          <button
            type="button"
            className="cat-action-btn view"
            title="View Driver Details"
            onClick={handleDriverNameClick}
          >
            <FiEye />
          </button>

          <button
            type="button"
            className="cat-action-btn edit"
            title="Edit Driver"
            onClick={handleEditClick}
          >
            <FiEdit2 />
          </button>

          <button
            type="button"
            className="cat-action-btn delete"
            title="Delete Driver"
            onClick={handleDeleteClick}
          >
            <FiTrash2 />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default DriverTableRow;