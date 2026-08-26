import "../styles/AllDrivers.css";

import { useState } from "react";

import Select from "react-select";

import {
  DateRange,
} from "react-date-range";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import DriverTable from "../components/drivers/DriverTable";

import driverData from "../data/driverData";


function AllDrivers({
  setActivePage,
}) {

  const [
    showCalendar,
    setShowCalendar,
  ] = useState(false);


  const [
    range,
    setRange,
  ] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);


  const handleApplyRange = () => {
    setShowCalendar(false);
  };


  const handleCancelRange = () => {
    setShowCalendar(false);
  };


  const driverStatusOptions = [
    {
      value: "ACTIVE",
      label: "Active",
    },
    {
      value: "INACTIVE",
      label: "Inactive",
    },
  ];


  const verificationOptions = [
    {
      value: "VERIFIED",
      label: "Verified",
    },
    {
      value: "NOT_VERIFIED",
      label: "Not Verified",
    },
  ];


  return (

    <div className="jippy-all-drivers-page">


      {/* HEADER */}

      <div className="jippy-all-drivers-header">

        <h2>
          All Drivers
        </h2>

      </div>


      {/* TITLE */}

      <div className="jippy-drivers-title-section">

        <h3>

          <span>
            Drivers List
          </span>

          <span className="jippy-drivers-count">
            {driverData.length}
          </span>

        </h3>

      </div>


      {/* FILTERS */}

      <div className="jippy-drivers-filter-section">


        <div className="jippy-driver-filter-wrapper">

          <Select
            className="jippy-driver-react-select"
            classNamePrefix="jippy-driver-select"
            placeholder="Driver Status"
            isClearable
            options={
              driverStatusOptions
            }
          />

        </div>


        <div className="jippy-driver-filter-wrapper">

          <Select
            className="jippy-driver-react-select"
            classNamePrefix="jippy-driver-select"
            placeholder="Verification"
            isClearable
            options={
              verificationOptions
            }
          />

        </div>


        <div className="jippy-driver-date-wrapper">

          <button
            type="button"
            className="jippy-driver-date-button"
            onClick={() =>
              setShowCalendar(
                !showCalendar
              )
            }
          >

            <span>
              Select Range
            </span>

            <span className="jippy-driver-date-arrow">
              ▼
            </span>

          </button>


          {showCalendar && (

            <div className="jippy-driver-calendar-popup">

              <DateRange
                editableDateInputs
                ranges={range}
                onChange={(item) =>
                  setRange([
                    item.selection,
                  ])
                }
                months={2}
                direction="horizontal"
                rangeColors={[
                  "#ff6b00",
                ]}
              />


              <div className="jippy-driver-calendar-actions">

                <button
                  type="button"
                  onClick={
                    handleCancelRange
                  }
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={
                    handleApplyRange
                  }
                >
                  Apply
                </button>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* TABLE */}

      <div className="jippy-drivers-table-section">

        <DriverTable
          drivers={driverData}
          setActivePage={
            setActivePage
          }
        />

      </div>

    </div>

  );

}


export default AllDrivers;