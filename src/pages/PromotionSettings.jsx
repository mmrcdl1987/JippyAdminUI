import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getPromotionSettings,
  deletePromotionSetting,
} from "../services/promotionSettingsService";

import api from "../services/api";

import "../styles/PromotionSettingss.css";

/* =========================================================
   PROMOTION SETTINGS PAGE
========================================================= */

const AdminPromotionSettings = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
    empty: true,
  });

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     GET ALL PROMOTION SETTINGS
  ========================================================= */

  const loadPromotionSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPromotionSettings({
        page,
        size,
      });

      setData(response);
    } catch (err) {
      console.error(
        "Error fetching promotion settings:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load promotion settings."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    loadPromotionSettings();
  }, [page, size]);

  /* =========================================================
     PREVIOUS PAGE
  ========================================================= */

  const handlePrevious = () => {
    if (!data.first && page > 0) {
      setPage((prev) => prev - 1);
    }
  };

  /* =========================================================
     NEXT PAGE
  ========================================================= */

  const handleNext = () => {
    if (!data.last) {
      setPage((prev) => prev + 1);
    }
  };

  /* =========================================================
     PAGE SIZE
  ========================================================= */

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);

    setSize(newSize);
    setPage(0);
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* =========================================================
     FORMAT LABEL
  ========================================================= */

  const formatLabel = (value) => {
    if (!value) {
      return "-";
    }

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /* =========================================================
     CREATE PROMOTION
  ========================================================= */

  const handleCreate = () => {
    navigate("/dashboard/createPromotionSettings");
  };

  /* =========================================================
     EDIT PROMOTION
     
     API:
     GET /api/fm/product-price-settings/{id}
  ========================================================= */

  const handleEdit = async (item) => {
    try {
      /* -----------------------------------------
         GET ID
      ----------------------------------------- */

      const id = item?.productPriceSettingsId;

      /* -----------------------------------------
         VALIDATE ID
      ----------------------------------------- */

      if (
        id === undefined ||
        id === null ||
        id === ""
      ) {
        setError(
          "Product price settings ID is missing."
        );
        return;
      }

      setError("");
      setLoading(true);

      console.log(
        "Edit clicked. Product Price Settings ID:",
        id
      );

      /* -----------------------------------------
         CALL GET BY ID API

         GET:
         /api/fm/product-price-settings/{id}
      ----------------------------------------- */

      const response = await api.get(
        `/api/fm/product-price-settings/${encodeURIComponent(
          id
        )}`
      );

      console.log(
        "GET /api/fm/product-price-settings/{id} response:",
        response.data
      );

      /* -----------------------------------------
         STORE RESPONSE TEMPORARILY

         Navigate to edit page with ID.
         The edit page can use the same ID to
         load/edit the selected record.
      ----------------------------------------- */

      navigate(
        `/dashboard/editPromotionSettings?id=${encodeURIComponent(
          id
        )}`,
        {
          state: {
            productPriceSettings: response.data,
          },
        }
      );
    } catch (err) {
      console.error(
        "Error loading product price settings:",
        err
      );

      console.error(
        "API response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to load product price settings."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     ACTIVE / INACTIVE TOGGLE
     ========================================================= */

  const handleStatusToggle = async (item) => {
    const id = item?.productPriceSettingsId;

    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      setError("Product price settings ID is missing.");
      return;
    }

    const currentStatus = item?.isActive;

    const isCurrentlyActive =
      currentStatus === "Y" ||
      currentStatus === "y" ||
      currentStatus === "ACTIVE" ||
      currentStatus === "active" ||
      currentStatus === true;

    const newStatus = isCurrentlyActive ? "N" : "Y";

    try {
      setLoading(true);
      setError("");

      console.log(
        "Updating product price setting status:",
        {
          id,
          currentStatus,
          newStatus,
        }
      );

      /*
       * ONE API FOR ACTIVE / INACTIVE
       *
       * PUT /api/fm/product-price-settings/{id}/status?status=Y
       * PUT /api/fm/product-price-settings/{id}/status?status=N
       */
      await api.put(
        `/api/fm/product-price-settings/${encodeURIComponent(id)}/status`,
        null,
        {
          params: {
            status: newStatus,
          },
        }
      );

      await loadPromotionSettings();
    } catch (err) {
      console.error(
        "Error updating product price setting status:",
        err
      );

      console.error(
        "API response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update product price setting status."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (item) => {
    const id = item?.productPriceSettingsId;

    if (
      id === undefined ||
      id === null ||
      id === ""
    ) {
      setError(
        "Product price settings ID is missing."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete promotion setting ${id}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      await deletePromotionSetting(id);

      /*
       * If this was the only record on the
       * current page, move to previous page.
       */

      if (
        data.content?.length === 1 &&
        page > 0
      ) {
        setPage((prev) => prev - 1);
      } else {
        await loadPromotionSettings();
      }
    } catch (err) {
      console.error(
        "Error deleting promotion setting:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to delete promotion setting."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <style>{`
        .promotion-settings-status-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          padding: 4px 0;
          cursor: pointer;
          font: inherit;
        }

        .promotion-settings-status-toggle:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .promotion-settings-status-toggle-track {
          position: relative;
          display: inline-block;
          width: 42px;
          height: 22px;
          border-radius: 999px;
          background: #b8bec8;
          transition: background 0.2s ease;
          flex-shrink: 0;
        }

        .promotion-settings-status-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s ease;
        }

        .promotion-settings-status-toggle.active
        .promotion-settings-status-toggle-track {
          background: #22c55e;
        }

        .promotion-settings-status-toggle.active
        .promotion-settings-status-toggle-thumb {
          transform: translateX(20px);
        }

        .promotion-settings-status-toggle-label {
          min-width: 58px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
        }

        .promotion-settings-status-toggle.active
        .promotion-settings-status-toggle-label {
          color: #15803d;
        }

        .promotion-settings-status-toggle.inactive
        .promotion-settings-status-toggle-label {
          color: #6b7280;
        }
      `}</style>

      <div className="promotion-settings-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="promotion-settings-header">

        <div>
          <h2>
            Promotion Settings
          </h2>

          <p>
            Manage product price and promotion settings
          </p>
        </div>

        {/* ===================================================
            HEADER BUTTONS
        =================================================== */}

        <div className="promotion-settings-header-actions">

          <button
            type="button"
            className="promotion-settings-create-btn"
            onClick={handleCreate}
            disabled={loading}
          >
            + Create Promotion
          </button>

          <button
            type="button"
            className="promotion-settings-refresh-btn"
            onClick={loadPromotionSettings}
            disabled={loading}
          >
            {loading
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="promotion-settings-error">
          {error}
        </div>
      )}

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="promotion-settings-card">

        {/* ===================================================
            TABLE HEADER
        =================================================== */}

        <div className="promotion-settings-table-header">

          <div className="promotion-settings-title-section">

            <strong>
              Promotion Settings
            </strong>

            <span className="promotion-settings-record-count">
              {data.totalElements
                ? data.totalElements.toLocaleString(
                    "en-IN"
                  )
                : 0}{" "}
              records
            </span>

          </div>

          <div className="promotion-settings-page-size">

            <label htmlFor="promotion-page-size">
              Rows:
            </label>

            <select
              id="promotion-page-size"
              value={size}
              onChange={
                handlePageSizeChange
              }
              disabled={loading}
            >
              <option value={5}>
                5
              </option>

              <option value={10}>
                10
              </option>

              <option value={20}>
                20
              </option>

              <option value={50}>
                50
              </option>

              <option value={100}>
                100
              </option>
            </select>

          </div>

        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="promotion-settings-table-wrapper">

          <table className="promotion-settings-table">

            <thead>

              <tr>
                <th>ID</th>
                <th>Outlet ID</th>
                <th>Product ID</th>
                <th>Variant ID</th>
                <th>Location ID</th>
                <th>Location Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Price</th>
                <th>Price Type</th>
                <th>Adjustment</th>
                <th>Created By</th>
                <th>Created At</th>
                <th>Updated By</th>
                <th>Updated At</th>
                <th>Is Active</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="17"
                    className="promotion-settings-loading"
                  >
                    Loading promotion settings...
                  </td>
                </tr>

              ) : data.content?.length > 0 ? (

                data.content.map(
                  (item) => (

                    <tr
                      key={
                        item.productPriceSettingsId
                      }
                    >

                      {/* ID */}

                      <td>
                        <strong>
                          {
                            item.productPriceSettingsId
                          }
                        </strong>
                      </td>

                      {/* OUTLET ID */}

                      <td>
                        {
                          item.outletId ??
                          "-"
                        }
                      </td>

                      {/* PRODUCT ID */}

                      <td>
                        {
                          item.productId ??
                          "-"
                        }
                      </td>

                      {/* VARIANT ID */}

                      <td>
                        {
                          item.productVariantId ??
                          "-"
                        }
                      </td>

                      {/* LOCATION ID */}

                      <td>
                        {
                          item.locationId ??
                          "-"
                        }
                      </td>

                      {/* LOCATION TYPE */}

                      <td>
                        <span className="promotion-settings-location-badge">
                          {
                            item.locationType ||
                            "-"
                          }
                        </span>
                      </td>

                      {/* START DATE */}

                      <td>
                        {formatDate(
                          item.startDateTime
                        )}
                      </td>

                      {/* END DATE */}

                      <td>
                        {formatDate(
                          item.endDateTime
                        )}
                      </td>

                      {/* PRICE */}

                      <td>
                        <strong>
                          ₹
                          {Number(
                            item.priceValue ||
                              0
                          ).toFixed(2)}
                        </strong>
                      </td>

                      {/* PRICE TYPE */}

                      <td>
                        {formatLabel(
                          item.priceType
                        )}
                      </td>

                      {/* ADJUSTMENT */}

                      <td>

                        <span
                          className={`promotion-settings-adjustment-badge ${
                            item.priceAdjustmentType ===
                            "INCREASE"
                              ? "increase"
                              : item.priceAdjustmentType ===
                                "DECREASE"
                              ? "decrease"
                              : ""
                          }`}
                        >
                          {
                            item.priceAdjustmentType ||
                            "-"
                          }
                        </span>

                      </td>

                      {/* CREATED BY */}

                      <td>
                        {
                          item.createdBy ??
                          "-"
                        }
                      </td>

                      {/* CREATED AT */}

                      <td>
                        {formatDate(
                          item.createdAt
                        )}
                      </td>

                      {/* UPDATED BY */}

                      <td>
                        {
                          item.updatedBy ??
                          "-"
                        }
                      </td>

                      {/* UPDATED AT */}

                      <td>
                        {formatDate(
                          item.updatedAt
                        )}
                      </td>

                      {/* IS ACTIVE */}

                      <td>
                        {(() => {
                          const isActive =
                            item?.isActive === "Y" ||
                            item?.isActive === "y" ||
                            item?.isActive === "ACTIVE" ||
                            item?.isActive === "active" ||
                            item?.isActive === true;

                          return (
                            <button
                              type="button"
                              className={`promotion-settings-status-toggle ${
                                isActive ? "active" : "inactive"
                              }`}
                              onClick={() =>
                                handleStatusToggle(item)
                              }
                              disabled={loading}
                              title={
                                isActive
                                  ? "Click to make inactive"
                                  : "Click to make active"
                              }
                            >
                              <span className="promotion-settings-status-toggle-track">
                                <span className="promotion-settings-status-toggle-thumb" />
                              </span>

                              <span className="promotion-settings-status-toggle-label">
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </button>
                          );
                        })()}
                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="promotion-settings-actions">

                          {/* EDIT */}

                          <button
                            type="button"
                            className="promotion-settings-edit-btn"
                            onClick={() =>
                              handleEdit(item)
                            }
                            disabled={
                              loading
                            }
                          >
                            Edit
                          </button>

                          {/*
                            =====================================================
                            DELETE BUTTON - KEPT BUT COMMENTED OUT
                            =====================================================

                            <button
                              type="button"
                              className="promotion-settings-delete-btn"
                              onClick={() =>
                                handleDelete(item)
                              }
                              disabled={
                                loading
                              }
                            >
                              Delete
                            </button>
                          */}

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="17"
                    className="promotion-settings-empty"
                  >
                    No promotion settings found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        <div className="promotion-settings-pagination">

          <div className="promotion-settings-pagination-info">

            {data.totalElements > 0 ? (

              <>
                Showing{" "}

                <strong>
                  {page * size + 1}
                </strong>{" "}

                to{" "}

                <strong>
                  {Math.min(
                    (page + 1) * size,
                    data.totalElements
                  )}
                </strong>{" "}

                of{" "}

                <strong>
                  {data.totalElements.toLocaleString(
                    "en-IN"
                  )}
                </strong>{" "}

                records
              </>

            ) : (

              "No records"

            )}

          </div>

          <div className="promotion-settings-pagination-controls">

            <button
              type="button"
              onClick={
                handlePrevious
              }
              disabled={
                data.first ||
                loading
              }
            >
              ← Previous
            </button>

            <span>
              Page{" "}

              <strong>
                {page + 1}
              </strong>{" "}

              of{" "}

              <strong>
                {data.totalPages || 1}
              </strong>
            </span>

            <button
              type="button"
              onClick={
                handleNext
              }
              disabled={
                data.last ||
                loading
              }
            >
              Next →
            </button>

          </div>

        </div>

      </div>

      </div>
    </>
  );
};

export default AdminPromotionSettings;