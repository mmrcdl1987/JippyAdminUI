import {
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

function DriverTableRow({
  driver,
  onView,
  onEdit,
  onDelete,
}) {
  /*
   * =========================================================
   * PROFILE IMAGE
   * =========================================================
   */
  const profileImage =
    driver?.profilePicUrl ||
    driver?.profilePicture ||
    null;

  /*
   * =========================================================
   * DRIVER NAME CLICK
   * =========================================================
   *
   * Clicking the driver first name will open
   * the separate DriverDetails page.
   */
  const handleDriverNameClick = () => {
    if (!driver) {
      console.error(
        "Driver data not found."
      );
      return;
    }

    const driverId =
      driver?.driverId ||
      driver?.id;

    if (!driverId) {
      console.error(
        "Driver ID not found:",
        driver
      );
      return;
    }

    if (onView) {
      onView(driver);
    }
  };

  /*
   * =========================================================
   * EDIT DRIVER
   * =========================================================
   */
  const handleEditClick = () => {
    if (onEdit) {
      onEdit(driver);
    }
  };

  /*
   * =========================================================
   * DELETE DRIVER
   * =========================================================
   */
  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(driver);
    }
  };

  return (
    <tr className="jippy-driver-main-row">

      {/* =====================================================
          DRIVER ID
          ===================================================== */}
      <td>
        {driver?.driverId ||
          driver?.id ||
          "-"}
      </td>

      {/* =====================================================
          FIRST NAME
          CLICKABLE HYPERLINK
          ===================================================== */}
      <td>
        {driver?.firstName ? (
          <button
            type="button"
            className="jippy-driver-name-link"
            onClick={
              handleDriverNameClick
            }
            title="Open Driver Details"
          >
            {driver.firstName}
          </button>
        ) : (
          "-"
        )}
      </td>

      {/* =====================================================
          LAST NAME
          ===================================================== */}
      <td>
        {driver?.lastName || "-"}
      </td>

      {/* =====================================================
          EMAIL
          ===================================================== */}
      <td className="jippy-driver-email-cell">
        {driver?.email || "-"}
      </td>

      {/* =====================================================
          PHONE NUMBER
          ===================================================== */}
      <td>
        {driver?.phoneNumber || "-"}
      </td>

      {/* =====================================================
          AREA
          ===================================================== */}
      <td>
        {driver?.areaName ||
          driver?.areaId ||
          "-"}
      </td>

      {/* =====================================================
          STATUS
          ===================================================== */}
      <td>
        <span
          className={`jippy-status-badge ${
            driver?.isActive
              ? "active"
              : "inactive"
          }`}
        >
          {driver?.isActive
            ? "Active"
            : "Inactive"}
        </span>
      </td>

      {/* =====================================================
          PROFILE PICTURE
          ===================================================== */}
      <td className="jippy-driver-profile-cell">

        {profileImage ? (
          <img
            src={profileImage}
            alt="Driver Profile"
            className="jippy-driver-profile-image"
          />
        ) : (
          <span className="jippy-driver-no-image">
            No Image
          </span>
        )}

      </td>

      {/* =====================================================
          ACTIONS
          ===================================================== */}
      <td className="jippy-driver-actions-cell">

        {/* EDIT BUTTON */}
        <button
          type="button"
          className="jippy-driver-edit-icon-btn"
          title="Edit Driver"
          onClick={handleEditClick}
        >
          <FiEdit2 />
        </button>

        {/* DELETE BUTTON */}
        <button
          type="button"
          className="jippy-driver-delete-icon-btn"
          title="Delete Driver"
          onClick={handleDeleteClick}
        >
          <FiTrash2 />
        </button>

      </td>

    </tr>
  );
}

export default DriverTableRow;