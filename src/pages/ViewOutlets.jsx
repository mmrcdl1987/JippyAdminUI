import React, { useEffect, useState } from "react";
import { FM_API } from "../services/api";

function ViewOutlets() {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for tracking selected outlet and its products inline
  const [expandedOutletId, setExpandedOutletId] = useState(null);
  const [outletProducts, setOutletProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // States for handling the Date Range selection per outlet
  const [dateRangeModalOutletId, setDateRangeModalOutletId] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    const merchantId = localStorage.getItem("merchantId");
    console.log("Retrieved merchantId from localStorage:", merchantId);

    if (merchantId) {
      fetchOutletsByMerchant(merchantId);
    } else {
      setLoading(false);
      console.warn("No merchantId found in localStorage!");
    }
  }, []);

  const fetchOutletsByMerchant = async (merchantId) => {
    try {
      setLoading(true);
      
      const response = await FM_API.get("/api/fm/outlets/getOutletsByMerchant", {
        params: {
          merchantId,
        },
      });

      console.log("API Response for merchant outlets:", response.data);

      if (Array.isArray(response.data)) {
        const outletsWithStatus = response.data.map(outlet => ({
          ...outlet,
          isOpen: outlet.isOpen !== undefined ? outlet.isOpen : true,
        }));
        setOutlets(outletsWithStatus);
      } else if (response.data && Array.isArray(response.data.data)) {
        setOutlets(response.data.data);
      } else {
        setOutlets([]);
      }
    } catch (error) {
      console.error("Error fetching outlets for merchant:", error);
      setOutlets([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch products safely and catch errors/failure payloads gracefully
  const handleManageProducts = async (outlet) => {
    if (expandedOutletId === outlet.outletId) {
      setExpandedOutletId(null);
      setOutletProducts([]);
      return;
    }

    setExpandedOutletId(outlet.outletId);
    setLoadingProducts(true);
    localStorage.setItem("outletId", outlet.outletId);
    localStorage.setItem("outletName", outlet.outletName);

    try {
      const response = await FM_API.get(`/api/fm/products/outlets/${outlet.outletId}`);
      console.log(`API Response for products of outlet ${outlet.outletId}:`, response.data);

      if (response.data && response.data.success === false) {
        setOutletProducts([]);
      } else if (Array.isArray(response.data)) {
        setOutletProducts(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setOutletProducts(response.data.data);
      } else if (response.data && Array.isArray(response.data.products)) {
        setOutletProducts(response.data.products);
      } else {
        setOutletProducts([]);
      }
    } catch (error) {
      console.warn("No products found or endpoint returned an error status:", error);
      setOutletProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Triggered when user clicks the toggle switch
  const handleToggleClick = (outlet) => {
    setDateRangeModalOutletId(outlet.outletId);
    setFromDate("");
    setToDate("");
    setReason("Outlet closed temporarily");
  };

  // Confirm and submit status change via the outlet-unavailability API
  const handleConfirmStatusChange = async (outletId) => {
    if (!fromDate || !toDate) {
      alert("Please select both From and To dates.");
      return;
    }

    try {
      const payload = {
        unavailabilityId: 0,
        outletId: Number(outletId),
        unavailabilityFromDate: new Date(fromDate).toISOString(),
        unavailabilityToDate: new Date(toDate).toISOString(),
        reason: reason || "Outlet closed temporarily",
        type: "closure"
      };

      console.log("Sending outlet unavailability payload:", payload);

      // Call the requested unavailability API endpoint
      await FM_API.post("/api/fm/outlet-unavailability", payload);

      // Update state locally upon successful response
      setOutlets(prevOutlets =>
        prevOutlets.map(outlet =>
          outlet.outletId === outletId 
            ? { ...outlet, isOpen: !outlet.isOpen, fromDate, toDate } 
            : outlet
        )
      );

      // Close the date picker row
      setDateRangeModalOutletId(null);
      alert("Outlet unavailability saved successfully!");
    } catch (error) {
      console.error("Failed to update outlet unavailability:", error.response?.data || error);
      alert("Failed to update outlet status. Check console for server error details.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Merchant Outlets ({outlets.length})</h2>
      {loading ? (
        <p>Loading outlets...</p>
      ) : outlets.length > 0 ? (
        <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse", backgroundColor: "#fff" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4", textAlign: "left" }}>
              <th style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>Outlet ID</th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>Outlet Name</th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>Phone</th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>Location</th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>Approval Status</th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>Open / Close</th>
              <th style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {outlets.map((outlet) => (
              <React.Fragment key={outlet.outletId}>
                <tr style={{ backgroundColor: expandedOutletId === outlet.outletId ? "#f9f9f9" : "transparent" }}>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{outlet.outletId}</td>
                  
                  {/* Clickable Outlet Name */}
                  <td 
                    style={{ 
                      padding: "12px", 
                      borderBottom: "1px solid #eee", 
                      color: "#007bff", 
                      cursor: "pointer",
                      fontWeight: "500"
                    }}
                    onClick={() => handleManageProducts(outlet)}
                    title="Click to view outlet products"
                  >
                    {outlet.outletName} 🔗
                  </td>

                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>{outlet.outletPhone || "N/A"}</td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    {outlet.areaName}, {outlet.cityName}
                  </td>
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    <span style={{
                      color: outlet.isApproved ? "green" : "orange",
                      fontWeight: "bold"
                    }}>
                      {outlet.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>

                  {/* Open / Close Toggle Switch */}
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    <label style={{ position: "relative", display: "inline-block", width: "45px", height: "24px", cursor: "pointer" }}>
                      <input 
                        type="checkbox" 
                        checked={outlet.isOpen} 
                        onChange={() => handleToggleClick(outlet)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span style={{
                        position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: outlet.isOpen ? "#28a745" : "#ccc",
                        transition: ".4s",
                        borderRadius: "24px"
                      }}>
                        <span style={{
                          position: "absolute", content: "", height: "18px", width: "18px", left: outlet.isOpen ? "23px" : "3px", bottom: "3px",
                          backgroundColor: "white",
                          transition: ".4s",
                          borderRadius: "50%"
                        }}></span>
                      </span>
                    </label>
                    <span style={{ marginLeft: "8px", fontSize: "12px", color: outlet.isOpen ? "green" : "gray" }}>
                      {outlet.isOpen ? "Open" : "Closed"}
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td style={{ padding: "12px", borderBottom: "1px solid #eee" }}>
                    <button 
                      onClick={() => handleManageProducts(outlet)}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: expandedOutletId === outlet.outletId ? "#6c757d" : "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      {expandedOutletId === outlet.outletId ? "Hide Products" : "Manage Products"}
                    </button>
                  </td>
                </tr>

                {/* Date Range Selector Row */}
                {dateRangeModalOutletId === outlet.outletId && (
                  <tr>
                    <td colSpan="7" style={{ padding: "15px", backgroundColor: "#fff3cd", borderBottom: "1px solid #ffeeba" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                        <strong>Select Closure/Availability Date Range:</strong>
                        
                        <label>
                          From:{" "}
                          <input 
                            type="date" 
                            value={fromDate} 
                            min={getTodayDate()} 
                            onChange={(e) => {
                              setFromDate(e.target.value);
                              if (toDate && e.target.value > toDate) {
                                setToDate("");
                              }
                            }} 
                            style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                          />
                        </label>

                        <label>
                          To:{" "}
                          <input 
                            type="date" 
                            value={toDate} 
                            min={fromDate || getTodayDate()} 
                            onChange={(e) => setToDate(e.target.value)} 
                            style={{ padding: "4px", borderRadius: "4px", border: "1px solid #ccc" }}
                          />
                        </label>

                        <button 
                          onClick={() => handleConfirmStatusChange(outlet.outletId)}
                          style={{ padding: "5px 10px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setDateRangeModalOutletId(null)}
                          style={{ padding: "5px 10px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Inline Expanded Products Table Row */}
                {expandedOutletId === outlet.outletId && (
                  <tr>
                    <td colSpan="7" style={{ padding: "20px", backgroundColor: "#fdfdfd", borderBottom: "2px solid #007bff" }}>
                      <div style={{ padding: "10px", background: "#fff", border: "1px solid #ddd", borderRadius: "6px" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
                          Products for: {outlet.outletName} ({outletProducts.length})
                        </h4>
                        {loadingProducts ? (
                          <p>Loading products for this outlet...</p>
                        ) : outletProducts.length > 0 ? (
                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ backgroundColor: "#eaeaea", textAlign: "left" }}>
                                <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Product ID</th>
                                <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Product Name</th>
                                <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Price</th>
                                <th style={{ padding: "8px", borderBottom: "1px solid #ccc" }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {outletProducts.map((product) => (
                                <tr key={product.productId || product.id}>
                                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{product.productId || product.id}</td>
                                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{product.productName || product.name}</td>
                                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{product.price || "N/A"}</td>
                                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{product.status || "Available"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p style={{ margin: 0, color: "#666" }}>No products found for this outlet.</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No outlets found mapped to this specific merchant.</p>
      )}
    </div>
  );
}

export default ViewOutlets;