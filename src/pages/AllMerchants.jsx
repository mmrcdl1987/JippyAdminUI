import { useState } from "react";

function MerchantTable({ merchants }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleRow = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="merchant-table-container">
      <table className="merchant-table">
        <thead>
          <tr>
            <th></th>
            <th>Merchant Info</th>
            <th>Owner Info</th>
            <th>Zone</th>
            <th>Admin Commission</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {merchants && merchants.length > 0 ? (
            merchants.map((merchant, index) => {
              const isExpanded = expandedIndex === index;

              return (
                // Use React Fragment to group main row and expanded row together
                <tr key={merchant.id || index}>
                  {/* Since fragment can't take keys easily in some versions, wrap rows or use tbody structure */}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No merchants found.
              </td>
            </tr>
          )}

          {/* Proper mapping loop */}
          {merchants.map((merchant, index) => {
            const isExpanded = expandedIndex === index;

            return (
              <React.Fragment key={merchant.id || index}>
                {/* Main Merchant Row */}
                <tr>
                  <td>
                    <button 
                      className="expand-btn" 
                      onClick={() => toggleRow(index)}
                      style={{
                        background: "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      {isExpanded ? "-" : "+"}
                    </button>
                  </td>
                  
                  {/* Merchant Info (Dynamic) */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img 
                        src={merchant.image || merchant.logo || "default-avatar.png"} 
                        alt={merchant.name} 
                        style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} 
                      />
                      <div>
                        <strong>{merchant.name}</strong>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          {merchant.type || merchant.category || merchant.merchantType}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Owner Info (Dynamic) */}
                  <td>
                    <div>{merchant.phone || merchant.ownerPhone || merchant.mobile}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>
                      {merchant.email || merchant.ownerEmail}
                    </div>
                  </td>

                  {/* Zone (Dynamic) */}
                  <td>{merchant.zone || merchant.area || "N/A"}</td>

                  {/* Admin Commission (Dynamic) */}
                  <td>{merchant.adminCommission || merchant.commission || "N/A"}</td>

                  {/* Date (Dynamic) */}
                  <td>{merchant.date || merchant.createdAt || merchant.dob || "N/A"}</td>
                </tr>

                {/* Expanded Details & View Outlets Section */}
                {isExpanded && (
                  <tr className="expanded-row">
                    <td colSpan="6" style={{ background: "#f9fafb", padding: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4>Merchant Details</h4>
                          <p><strong>ID:</strong> {merchant.id || "N/A"}</p>
                          <p><strong>Address:</strong> {merchant.address || merchant.location || "N/A"}</p>
                          <p><strong>Status:</strong> {merchant.status || "Active"}</p>
                        </div>
                        
                        {/* View Outlets Button */}
                        <button 
                          className="view-outlets-btn"
                          onClick={() => {
                            // Pass merchant ID or object to your outlet view handler/router
                            console.log("View outlets for merchant ID:", merchant.id);
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "#FF6A00",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItem: "center",
                            gap: "6px"
                          }}
                        >
                          👁️ View Outlets
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default MerchantTable;