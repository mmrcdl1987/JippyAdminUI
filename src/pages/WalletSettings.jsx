import { useState } from "react";
import "../styles/WalletSettings.css";

import {
  saveWalletSettings,
} from "../services/walletSettingsService";

function WalletSettings() {

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({

    pointsType: "REFERRAL",

    numOfPoints: "",

    streakMinDays: "",

    // createdBy: "",

    // updatedBy: "",

  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleSave = async () => {

    try {

      setLoading(true);

      const response =
        await saveWalletSettings(formData);

      console.log(response.data);

      alert("Wallet Settings Saved Successfully.");

    } catch (error) {

      console.log(error);

      const message =
        error.response?.data?.errorMessage;

      alert(message || "Unable to save wallet settings.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="wal-page-wrapper">

      <h2 className="wal-page-title">

        Wallet Settings

      </h2>
            <div className="wal-settings-card">

        <div className="wal-card-header">
          WALLET SETTINGS
        </div>

        <div className="wal-form-grid">

          <div className="wal-form-group">

            <label className="wal-form-label">
              Points Type
            </label>

            <select
              className="wal-form-select"
              name="pointsType"
              value={formData.pointsType}
              onChange={handleChange}
            >
              <option value="REFERRAL">Referral</option>
              <option value="ORDER">Order</option>
              <option value="STREAK">Streak</option>
            </select>

          </div>

          <div className="wal-form-group">

            <label className="wal-form-label">
              Number Of Points
            </label>

            <input
              type="number"
              className="wal-form-input"
              name="numOfPoints"
              value={formData.numOfPoints}
              onChange={handleChange}
              placeholder="Enter Number Of Points"
            />

          </div>

          <div className="wal-form-group">

            <label className="wal-form-label">
              Minimum Streak Days
            </label>

            <input
              type="number"
              className="wal-form-input"
              name="streakMinDays"
              value={formData.streakMinDays}
              onChange={handleChange}
              placeholder="Enter Minimum Streak Days"
            />

          </div>

          {/* <div className="wal-form-group">

            <label className="wal-form-label">
              Created By
            </label>

            <input
              type="number"
              className="wal-form-input"
              name="createdBy"
              value={formData.createdBy}
              onChange={handleChange}
              placeholder="Enter User ID"
            />

          </div> */}

          {/* <div className="wal-form-group">

            <label className="wal-form-label">
              Updated By
            </label>

            <input
              type="number"
              className="wal-form-input"
              name="updatedBy"
              value={formData.updatedBy}
              onChange={handleChange}
              placeholder="Enter User ID"
            />

          </div> */}

        </div>

        <div className="wal-button-wrapper">

          <button
            className="wal-save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {
              loading
                ? "Saving..."
                : "Save Wallet Settings"
            }
          </button>

        </div>

      </div>

    </div>

  );

}

export default WalletSettings;