import React, { useState } from "react";
import "../../styles/campaign/OutletSelection.css";

function OutletSelection({
  outlets = [],
  selectedOutlets = [],
  setSelectedOutlets,
}) {
  const [search, setSearch] = useState("");

  const filteredOutlets = outlets.filter((outlet) =>
    outlet.outletName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  const toggleOutlet = (outletId) => {
    if (selectedOutlets.includes(outletId)) {
      setSelectedOutlets(
        selectedOutlets.filter((id) => id !== outletId)
      );
    } else {
      setSelectedOutlets([
        ...selectedOutlets,
        outletId,
      ]);
    }
  };

  const selectAll = () => {
    if (
      filteredOutlets.length > 0 &&
      selectedOutlets.length === filteredOutlets.length
    ) {
      setSelectedOutlets([]);
    } else {
      setSelectedOutlets(
        filteredOutlets.map((outlet) => outlet.outletId)
      );
    }
  };

  return (
    <div className="outlet-section">

      <div className="outlet-header">

        <h3>Select Outlets</h3>

        <span>{selectedOutlets.length} Selected</span>

      </div>

      <input
        type="text"
        className="outlet-search"
        placeholder="Search outlet..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="outlet-box">

        <label className="checkbox-row select-all">

          <input
            type="checkbox"
            checked={
              filteredOutlets.length > 0 &&
              selectedOutlets.length ===
                filteredOutlets.length
            }
            onChange={selectAll}
          />

          Select All Outlets

        </label>

        <div className="divider"></div>

        {filteredOutlets.length === 0 ? (

          <div className="no-outlets">
            No outlets found.
          </div>

        ) : (

          filteredOutlets.map((outlet) => (

            <label
              key={outlet.outletId}
              className="checkbox-row"
            >

              <input
                type="checkbox"
                checked={selectedOutlets.includes(
                  outlet.outletId
                )}
                onChange={() =>
                  toggleOutlet(outlet.outletId)
                }
              />

              {outlet.outletName}

            </label>

          ))

        )}

      </div>

    </div>
  );
}

export default OutletSelection;