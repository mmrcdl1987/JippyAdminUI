import { useState } from "react";
import "../styles/Incentives.css";

import {
  createOrUpdateIncentive,
  getDriverIncentiveHistory,
} from "../services/incentivesService";

function Incentives() {

  const [saveLoading, setSaveLoading] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(false);

  const [history, setHistory] = useState([]);

  const [formData, setFormData] = useState({
    ordersCount: "",
    incentiveAmount: "",
  });

  const [searchData, setSearchData] = useState({
    driverId: "",
    filter: "all",
  });

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleSearchChange = (e) => {

    const { name, value } = e.target;

    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleSave = async () => {

    try {

      setSaveLoading(true);

      const response =
        await createOrUpdateIncentive(formData);

      alert("Incentive saved successfully.");

      console.log(response.data);

    } catch (error) {

      console.log(error);

      alert("Unable to save incentive.");

    } finally {

      setSaveLoading(false);

    }

  };

  const fetchHistory = async () => {

    try {

      setHistoryLoading(true);

      const response =
        await getDriverIncentiveHistory(
          searchData.driverId,
          searchData.filter
        );

      console.log(response.data);

      setHistory(response.data.content);

    } catch (error) {

  console.error(error);

  const errorMessage =
    error.response?.data?.errorMessage;

  if (errorMessage) {
    alert(errorMessage);
  } else {
    alert("Unable to fetch history.");
  }

}finally {

      setHistoryLoading(false);

    }

  };

  return (

    <div className="inc-page-wrapper">

      <h2 className="inc-page-title">
        Driver Incentives
      </h2>

            {/* Create / Update Incentive */}

      <div className="inc-settings-card">

        <div className="inc-card-header">
          CREATE / UPDATE INCENTIVE
        </div>

        <div className="inc-form-grid">

          <div className="inc-form-group">

            <label className="inc-form-label">
              Orders Count
            </label>

            <input
              type="number"
              className="inc-form-input"
              name="ordersCount"
              value={formData.ordersCount}
              onChange={handleInputChange}
              placeholder="Enter Orders Count"
            />

          </div>

          <div className="inc-form-group">

            <label className="inc-form-label">
              Incentive Amount (₹)
            </label>

            <input
              type="number"
              className="inc-form-input"
              name="incentiveAmount"
              value={formData.incentiveAmount}
              onChange={handleInputChange}
              placeholder="Enter Incentive Amount"
            />

          </div>

        </div>

        <div className="inc-button-wrapper">

          <button
            className="inc-save-btn"
            onClick={handleSave}
            disabled={saveLoading}
          >
            {
              saveLoading
                ? "Saving..."
                : "Save Incentive"
            }
          </button>

        </div>

      </div>

      {/* Incentive History */}

      <div className="inc-settings-card">

        <div className="inc-card-header">
          DRIVER INCENTIVE HISTORY
        </div>

        <div className="inc-form-grid">

          <div className="inc-form-group">

            <label className="inc-form-label">
              Driver ID
            </label>

            <input
              type="number"
              className="inc-form-input"
              name="driverId"
              value={searchData.driverId}
              onChange={handleSearchChange}
              placeholder="Enter Driver ID"
            />

          </div>

          <div className="inc-form-group">

            <label className="inc-form-label">
              Filter
            </label>

            <select
              className="inc-form-select"
              name="filter"
              value={searchData.filter}
              onChange={handleSearchChange}
            >
              <option value="all">All</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

          </div>

        </div>

        <div className="inc-button-wrapper">

          <button
            className="inc-search-btn"
            onClick={fetchHistory}
            disabled={historyLoading}
          >
            {
              historyLoading
                ? "Searching..."
                : "Search History"
            }
          </button>

        </div>
                {history.length > 0 ? (

          <div className="inc-history-table-wrapper">

            <table className="inc-history-table">

              <thead>

                <tr>

                  <th>Date</th>

                  <th>Driver ID</th>

                  <th>No. Of Orders</th>

                  <th>Incentive Amount (₹)</th>

                </tr>

              </thead>

              <tbody>

                {history.map((item, index) => (

                  <tr key={index}>

                    <td>{item.date}</td>

                    <td>{item.driverId}</td>

                    <td>{item.noOfOrders}</td>

                    <td>₹ {item.incentiveAmount}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="inc-empty-history">

            No Incentive History Found

          </div>

        )}

      </div>

    </div>

  );

}

export default Incentives;