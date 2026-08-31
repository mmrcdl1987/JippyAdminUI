import {
  FiPlus,
  FiMinus,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiLoader,
} from "react-icons/fi";


function DriverTableRow({
  driver,
  isExpanded,
  expandedDriver,
  loading,
  onToggle,
  onEdit,
  onDelete,
}) {


  /*
   * Use API details when expanded.
   * Otherwise use normal table data.
   */

  const details =
    expandedDriver || driver;


  const profileImage =
    details?.profilePicUrl ||
    details?.profilePicture ||
    driver?.profilePicUrl ||
    driver?.profilePicture ||
    null;


  return (

    <>


      {/* =====================================================
          MAIN DRIVER ROW
          ===================================================== */}

      <tr className="jippy-driver-main-row">


        {/* EXPAND BUTTON */}

        <td className="jippy-driver-expand-cell">

          <button
            type="button"
            className={`jippy-driver-expand-btn ${
              isExpanded
                ? "jippy-driver-expand-btn-open"
                : ""
            }`}
            onClick={onToggle}
            title={
              isExpanded
                ? "Hide Driver Details"
                : "View Driver Details"
            }
          >

            {isExpanded ? (
              <FiMinus />
            ) : (
              <FiPlus />
            )}

          </button>

        </td>


        {/* DRIVER ID */}

        <td>
          {driver.driverId || "-"}
        </td>


        {/* FIRST NAME */}

        <td>
          {driver.firstName || "-"}
        </td>


        {/* LAST NAME */}

        <td>
          {driver.lastName || "-"}
        </td>


        {/* EMAIL */}

        <td className="jippy-driver-email-cell">
          {driver.email || "-"}
        </td>


        {/* PHONE */}

        <td>
          {driver.phoneNumber || "-"}
        </td>


        {/* FAMILY MEMBER */}

        <td>
          {driver.familyMemberName || "-"}
        </td>


        {/* FAMILY PHONE */}

        <td>
          {driver.familyMemberPhoneNumber || "-"}
        </td>


        {/* PROFILE */}

        <td className="jippy-driver-profile-cell">

          {profileImage ? (

            <img
              src={profileImage}
              alt="Driver"
              className="jippy-driver-profile-image"
            />

          ) : (

            <span className="jippy-driver-no-image">
              No Image
            </span>

          )}

        </td>


        {/* ACTIONS */}

        <td className="jippy-driver-actions-cell">


          <button
            type="button"
            className="jippy-driver-edit-icon-btn"
            title="Edit Driver"
            onClick={onEdit}
          >
            <FiEdit2 />
          </button>


          <button
            type="button"
            className="jippy-driver-delete-icon-btn"
            title="Delete Driver"
            onClick={onDelete}
          >
            <FiTrash2 />
          </button>

        </td>

      </tr>


      {/* =====================================================
          EXPANDED DRIVER DETAILS
          ===================================================== */}

      {isExpanded && (

        <tr className="jippy-driver-expanded-row">

          <td
            colSpan="10"
            className="jippy-driver-expanded-cell"
          >


            <div className="jippy-driver-expanded-content">


              {/* =================================================
                  EXPANDED HEADER
                  ================================================= */}

              <div className="jippy-driver-expanded-header">

                <div>

                  <h3>
                    Driver Details
                  </h3>

                  <span>
                    Driver ID:{" "}
                    {details?.driverId ||
                      driver?.driverId ||
                      "-"}
                  </span>

                </div>


                {/* APPROVAL */}

                {details?.isApproved !== null &&
                  details?.isApproved !== undefined && (

                  <div
                    className={
                      details.isApproved
                        ? "jippy-driver-approved-badge"
                        : "jippy-driver-pending-badge"
                    }
                  >

                    {details.isApproved && (
                      <FiCheck />
                    )}

                    {details.isApproved
                      ? "Approved"
                      : "Pending"}

                  </div>

                )}

              </div>


              {/* =================================================
                  LOADING
                  ================================================= */}

              {loading ? (

                <div className="jippy-driver-loading">

                  <FiLoader />

                  <span>
                    Loading driver details...
                  </span>

                </div>

              ) : (

                <div className="jippy-driver-detail-cards">


                  {/* =================================================
                      CARD 1
                      NOMINEE & FAMILY
                      ================================================= */}

                  <div className="jippy-driver-detail-card">

                    <h4>
                      Nominee &amp; Family Details
                    </h4>


                    <div className="jippy-driver-detail-list">


                      <div className="jippy-driver-detail-item">

                        <span>
                          Nominee Name
                        </span>

                        <strong>
                          {details?.nomineeName ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Nominee Phone
                        </span>

                        <strong>
                          {details?.nomineePhoneNumber ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Nominee Verified
                        </span>

                        <strong
                          className={
                            details?.isNomineeVerified
                              ? "jippy-driver-verified"
                              : "jippy-driver-not-verified"
                          }
                        >
                          {details?.isNomineeVerified
                            ? "Yes"
                            : "No"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Family Member
                        </span>

                        <strong>
                          {details?.familyMemberName ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Family Phone
                        </span>

                        <strong>
                          {details?.familyMemberPhoneNumber ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Family Member Verified
                        </span>

                        <strong
                          className={
                            details?.isFamilyMemberVerified
                              ? "jippy-driver-verified"
                              : "jippy-driver-not-verified"
                          }
                        >
                          {details?.isFamilyMemberVerified
                            ? "Yes"
                            : "No"}
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      CARD 2
                      KYC
                      ================================================= */}

                  <div className="jippy-driver-detail-card">

                    <h4>
                      KYC Details
                    </h4>


                    <div className="jippy-driver-detail-list">


                      <div className="jippy-driver-detail-item">

                        <span>
                          Driver KYC ID
                        </span>

                        <strong>
                          {details?.driverKycId ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Aadhaar Number
                        </span>

                        <strong>
                          {details?.aadharNumber ||
                            details?.aadhaarNumber ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Driving License
                        </span>

                        <strong>
                          {details?.drivingLicenseNumber ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          RC Number
                        </span>

                        <strong>
                          {details?.rcCopy ||
                            "-"}
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      CARD 3
                      ADDRESS
                      ================================================= */}

                  <div className="jippy-driver-detail-card">

                    <h4>
                      Address Details
                    </h4>


                    <div className="jippy-driver-detail-list">


                      <div className="jippy-driver-detail-item">

                        <span>
                          Building Number
                        </span>

                        <strong>
                          {details?.buildingNumber ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Road
                        </span>

                        <strong>
                          {details?.road ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Landmark
                        </span>

                        <strong>
                          {details?.landmark ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          State ID
                        </span>

                        <strong>
                          {details?.stateId ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          City ID
                        </span>

                        <strong>
                          {details?.cityId ||
                            "-"}
                        </strong>

                      </div>


                      <div className="jippy-driver-detail-item">

                        <span>
                          Area ID
                        </span>

                        <strong>
                          {details?.areaId ||
                            "-"}
                        </strong>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      CARD 4
                      PROFILE PICTURE
                      ================================================= */}

                  <div className="jippy-driver-detail-card jippy-driver-profile-detail-card">

                    <h4>
                      Profile Picture
                    </h4>


                    <div className="jippy-driver-profile-preview">

                      {profileImage ? (

                        <img
                          src={profileImage}
                          alt="Driver Profile"
                        />

                      ) : (

                        <div className="jippy-driver-profile-placeholder">

                          <span>
                            No Image
                          </span>

                        </div>

                      )}

                    </div>

                  </div>


                </div>

              )}

            </div>

          </td>

        </tr>

      )}

    </>

  );

}


export default DriverTableRow;