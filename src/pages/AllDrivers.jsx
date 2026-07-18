import "../styles/AllDrivers.css";
import { useState } from "react";
import Select from "react-select";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import DriverTable from "../components/drivers/DriverTable";
import driverData from "../data/driverData";

function AllDrivers() {
  const [showCalendar, setShowCalendar] = useState(false);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  return (
    <div className="all-drivers-container">

      <h2>All Drivers</h2>

      <div className="drivers-header">
        <h3>
          Drivers List
          <span className="drivers-count">
            {driverData.length}
          </span>
        </h3>
      </div>

      <div className="filters-row">

        <Select
          className="filter-select"
          placeholder="Driver Status"
          isClearable
          options={[
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
        />

        <Select
          className="filter-select"
          placeholder="Verification"
          isClearable
          options={[
            { value: "VERIFIED", label: "Verified" },
            { value: "NOT_VERIFIED", label: "Not Verified" },
          ]}
        />

        <div className="range-picker">

          <div
            className="range-input"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            Select Range ▼
          </div>

          {showCalendar && (

            <div className="calendar-popup">

              <DateRange
                editableDateInputs
                ranges={range}
                onChange={(item) =>
                  setRange([item.selection])
                }
                months={2}
                direction="horizontal"
                rangeColors={["#ff6b00"]}
              />

              <div className="range-actions">

                <button
                  onClick={() => setShowCalendar(false)}
                >
                  Cancel
                </button>

                <button
                  onClick={() => setShowCalendar(false)}
                >
                  Apply
                </button>

              </div>

            </div>

          )}

        </div>

      </div>

     

      <DriverTable drivers={driverData} />

    </div>
  );
}

export default AllDrivers;