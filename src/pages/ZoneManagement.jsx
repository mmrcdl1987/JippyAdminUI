import { useEffect, useState } from "react";
import API from "../services/api";
import "../styles/ZoneManagement.css";

function ZoneManagement({ setActivePage }) {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      const response = await API.get(
        "/driver/getZones"
      );

      console.log("Zones:", response.data);

      if (Array.isArray(response.data)) {
        setZones(response.data);
      }
    } catch (error) {
      console.error(
        "Error loading zones:",
        error
      );
    }
  };

  const handleStatusToggle = async (
    zone
  ) => {
    try {
      const updatedStatus =
        !zone.status;

      await API.put(
        `/driver/updateZoneStatus/${zone.zoneId}`,
        {
          status: updatedStatus,
        }
      );

      setZones((prevZones) =>
        prevZones.map((z) =>
          z.zoneId === zone.zoneId
            ? {
                ...z,
                status: updatedStatus,
              }
            : z
        )
      );

      console.log(
        `Zone ${zone.zoneId} updated`
      );
    } catch (error) {
      console.error(
        "Error updating status:",
        error
      );

      alert(
        "Failed to update zone status"
      );
    }
  };

  return (
    <div className="zone-page">
      <div className="zone-header">
        <div className="zone-title">
          <h2>Zone List</h2>

          <p>
            View and manage all the
            zones
          </p>
        </div>

       <button
  className="zone-btn"
  onClick={() => {

    localStorage.removeItem(
      "editZoneId"
    );

    setActivePage("createZone");
  }}
>
  + Zone Create
</button>
      </div>

      <table className="zone-table">
        <thead>
          <tr>
            <th>Zone Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {zones.length > 0 ? (
            zones.map((zone) => (
              <tr key={zone.zoneId}>
                <td>
                  {zone.zoneName}
                </td>

                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={
                        zone.status
                      }
                      onChange={() =>
                        handleStatusToggle(
                          zone
                        )
                      }
                    />

                    <span className="slider"></span>
                  </label>
                </td>

                <td>
               <button
  className="edit-btn"
  onClick={() => {

    localStorage.setItem(
      "editZoneId",
      zone.zoneId
    );

    setActivePage("createZone");
  }}
>
  ✏️ Edit
</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="3"
                style={{
                  textAlign:
                    "center",
                  padding: "20px",
                }}
              >
                No Zones Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ZoneManagement;