import { useState } from "react";
import { FiPlus, FiMinus } from "react-icons/fi";

function MerchantTableRow({ merchant }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr>
 <td>

  <button

    className={expanded ? "collapse-btn" : "expand-btn"}

    onClick={() => setExpanded(!expanded)}

  >

    {expanded ? <FiMinus /> : <FiPlus />}

  </button>

</td>

        <td>{merchant.merchantId}</td>
        <td>{merchant.merchantName}</td>
        <td>{merchant.merchantEmail}</td>
        <td>{merchant.merchantPhone}</td>
        <td>{merchant.merchantBusinessType}</td>
        <td>{merchant.status}</td>
        <td>{merchant.state}</td>
        <td>{merchant.isActive}</td>
        <td>{merchant.isApproved ? "Yes" : "No"}</td>
        <td>{merchant.uploadedBy}</td>

        <td>
          {merchant.profilePicUrl ? (
            <img
                src={merchant.profilePicUrl}
                alt="Profile"
                className="profile-pic"
/>
          ) : (
            "No Image"
          )}
        </td>

        <td>{merchant.firstName}</td>
        <td>{merchant.lastName}</td>
      </tr>

      {expanded && (
        <tr className="expand-row">
          <td></td>

          <td colSpan="13">

            <div className="merchant-details">

  <div className="detail-card">
    <span>Created At</span>
    <p>{merchant.createdAt}</p>
  </div>

  <div className="detail-card">
    <span>Created By</span>
    <p>{merchant.createdBy}</p>
  </div>

  <div className="detail-card">
    <span>Updated At</span>
    <p>{merchant.updatedAt}</p>
  </div>

  <div className="detail-card">
    <span>Updated By</span>
    <p>{merchant.updatedBy}</p>
  </div>

  <div className="detail-card">
    <span>Date of Birth</span>
    <p>{merchant.dob}</p>
  </div>

</div>

          </td>

        </tr>
      )}
    </>
  );
}

export default MerchantTableRow;