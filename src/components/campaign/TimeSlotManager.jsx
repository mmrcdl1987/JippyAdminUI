import React, { useState } from "react";
import "../../styles/campaign/TimeSlotManager.css";

function TimeSlotManager() {

  const [slots, setSlots] = useState([
    {
      startTime: "",
      endTime: "",
    },
  ]);

  const handleChange = (index, field, value) => {

    const updatedSlots = [...slots];

    updatedSlots[index][field] = value;

    setSlots(updatedSlots);

  };

  const addSlot = () => {

    setSlots([
      ...slots,
      {
        startTime: "",
        endTime: "",
      },
    ]);

  };

  const removeSlot = (index) => {

    const updatedSlots = [...slots];

    updatedSlots.splice(index, 1);

    setSlots(updatedSlots);

  };

  return (

    <div className="time-slot-section">

      <div className="time-header">

        <h3>Campaign Time Slots</h3>

        <button
          className="add-slot-btn"
          onClick={addSlot}
        >
          + Add Slot
        </button>

      </div>

      {slots.map((slot, index) => (

        <div
          className="slot-row"
          key={index}
        >

          <div className="slot-group">

            <label>Start Time</label>

            <input
              type="time"
              value={slot.startTime}
              onChange={(e) =>
                handleChange(
                  index,
                  "startTime",
                  e.target.value
                )
              }
            />

          </div>

          <div className="slot-group">

            <label>End Time</label>

            <input
              type="time"
              value={slot.endTime}
              onChange={(e) =>
                handleChange(
                  index,
                  "endTime",
                  e.target.value
                )
              }
            />

          </div>

          {slots.length > 1 && (

            <button
              className="remove-slot-btn"
              onClick={() => removeSlot(index)}
            >
              ✕
            </button>

          )}

        </div>

      ))}

    </div>

  );

}

export default TimeSlotManager;