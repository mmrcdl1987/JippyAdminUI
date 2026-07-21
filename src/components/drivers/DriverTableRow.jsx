import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

function DriverTableRow({ driver }) {

  const [expanded, setExpanded] = useState(false);

  return (
    <>

      <tr>

        <td>

          <button
            className={
              expanded
                ? "driver-collapse-btn"
                : "driver-expand-btn"
            }
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <FiMinus /> : <FiPlus />}
          </button>

        </td>

        <td>{driver.driverId}</td>

        <td>{driver.firstName}</td>

        <td>{driver.lastName}</td>

        <td>{driver.email}</td>

        <td>{driver.phoneNumber}</td>

        <td>{driver.nomineeName}</td>

        <td>{driver.nomineePhoneNumber}</td>

        <td>{driver.familyMemberName}</td>

        <td>{driver.familyMemberPhoneNumber}</td>

        <td>

          {driver.profilePicUrl ? (

            <img
              src={driver.profilePicUrl}
              alt="Driver"
              className="driver-profile"
            />

          ) : (

            "No Image"

          )}

        </td>

      </tr>

      {expanded && (

        <tr className="driver-expand-row">

          <td></td>

          <td colSpan="10">

            <div className="driver-details">

              <div className="driver-detail-card">
                <span>Nominee Verified</span>
                <p>
                  {driver.isNomineeVerified ? "Yes" : "No"}
                </p>
              </div>

              <div className="driver-detail-card">
                <span>Family Member Verified</span>
                <p>
                  {driver.isFamilyMemberVerified ? "Yes" : "No"}
                </p>
              </div>

              <div className="driver-detail-card">
                <span>Created At</span>
                <p>{driver.createdAt}</p>
              </div>

              <div className="driver-detail-card">
                <span>Created By</span>
                <p>{driver.createdBy}</p>
              </div>

              <div className="driver-detail-card">
                <span>Updated At</span>
                <p>{driver.updatedAt}</p>
              </div>

              <div className="driver-detail-card">
                <span>Updated By</span>
                <p>{driver.updatedBy}</p>
              </div>

            </div>

          </td>

        </tr>

      )}

    </>
  );
}

export default DriverTableRow;