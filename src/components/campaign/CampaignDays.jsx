import React, { useState } from "react";
import "../../styles/campaign/CampaignDays.css";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function CampaignDays() {

  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDay = (day) => {

    if (selectedDays.includes(day)) {

      setSelectedDays(
        selectedDays.filter((d) => d !== day)
      );

    } else {

      setSelectedDays([
        ...selectedDays,
        day,
      ]);

    }

  };

  const selectWeekdays = () => {

    setSelectedDays([
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ]);

  };

  const selectWeekends = () => {

    setSelectedDays([
      "Saturday",
      "Sunday",
    ]);

  };

  const clearSelection = () => {

    setSelectedDays([]);

  };

  return (

    <div className="campaign-days">

      <div className="days-header">

        <h3>Campaign Days</h3>

        <button
          className="clear-btn"
          onClick={clearSelection}
        >
          Clear
        </button>

      </div>

      <div className="quick-selection">

        <button
          onClick={selectWeekdays}
        >
          Weekdays
        </button>

        <button
          onClick={selectWeekends}
        >
          Weekends
        </button>

      </div>

      <div className="days-grid">

        {weekDays.map((day) => (

          <div
            key={day}
            className={`day-card ${
              selectedDays.includes(day)
                ? "selected"
                : ""
            }`}
            onClick={() =>
              toggleDay(day)
            }
          >

            <input
              type="checkbox"
              checked={selectedDays.includes(day)}
              readOnly
            />

            <span>{day}</span>

          </div>

        ))}

      </div>

    </div>

  );

}

export default CampaignDays;