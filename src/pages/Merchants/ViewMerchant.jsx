import React from "react";

function ViewMerchant({ setActivePage }) {

  const merchantId = localStorage.getItem("merchantId");

  return (
    <div style={{ padding: "30px" }}>

      <h1>View Merchant</h1>

      <h3>Merchant Id : {merchantId}</h3>

      <button
        onClick={() => setActivePage("outlets")}
      >
        Back
      </button>

    </div>
  );
}

export default ViewMerchant;