import { useState } from "react";
import "../styles/CreateUser.css";

function CreateUser({ setActivePage }) {
  const [active, setActive] = useState(true);

  return (
    <div className="create-user-page">

      <h2 className="page-heading">Users</h2>

      <div className="user-form-card">

        <div className="section-label">
          USER DETAILS
        </div>

        <div className="form-grid">

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              placeholder="Insert First Name"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Insert Last Name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Insert Email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Insert Password"
            />
          </div>

          <div className="form-group full-width">
            <label>Phone</label>
            <input
              type="text"
              placeholder="Insert Phone Number"
            />
          </div>

          <div className="form-group full-width">
            <label>Image</label>
            <input type="file" />
          </div>

        </div>

      </div>

      <div className="status-card">

        <div className="section-label">
          USER ACTIVE / DEACTIVE
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={active}
            onChange={() =>
              setActive(!active)
            }
          />
          Active
        </label>

      </div>

      <div className="action-buttons">

        <button className="save-btn">
          Save
        </button>

        <button
          className="cancel-btn"
          onClick={() =>
            setActivePage(
              "usersCustomers"
            )
          }
        >
          Cancel
        </button>

      </div>

    </div>
  );
}

export default CreateUser;