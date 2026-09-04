import { useState } from "react";
import { bulkUploadVariants } from "../services/variantBulkUploadService";
import "../styles/VariantBulkUpload.css";

function VariantBulkUpload() {
  // ─── State ─────────────────────────────────────────────────
  const [outletId, setOutletId] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // ─── Outlet ID ready? ──────────────────────────────────────
  const isOutletReady = outletId !== "" && !isNaN(outletId) && Number(outletId) > 0;

  // ─── File Selection ────────────────────────────────────────
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      setUploadResult(null);
      return;
    }

    const allowedExtensions = [".xlsx", ".xls"];
    const fileName = file.name.toLowerCase();
    const isValid = allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      alert("Please select an Excel file (.xlsx or .xls).");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      alert("The selected file is empty.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  // ─── Drag & Drop ──────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        alert("Please drop an Excel file (.xlsx or .xls).");
      }
    }
  };

  // ─── Upload Handler ───────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    if (!isOutletReady) {
      alert("Please enter a valid Outlet ID.");
      return;
    }

    try {
      setLoading(true);
      setUploadResult(null);

      console.log("================================================");
      console.log("[VARIANT BULK] Starting upload");
      console.log("[VARIANT BULK] Outlet ID:", outletId);
      console.log("[VARIANT BULK] File:", selectedFile.name);
      console.log("[VARIANT BULK] Size:", selectedFile.size, "bytes");
      console.log("================================================");

      const response = await bulkUploadVariants(
        Number(outletId),
        selectedFile
      );

      console.log("[VARIANT BULK] API response:", response);

      const backendSuccess = response?.success !== false;

      setUploadResult({
        success: backendSuccess,
        message:
          response?.message ||
          (backendSuccess
            ? "Variants uploaded successfully."
            : "Variant upload failed."),
        outletId: response?.outletId,
        totalRows: response?.totalRows,
        createdCount: response?.createdCount,
        updatedCount: response?.updatedCount,
        skippedCount: response?.skippedCount,
        results: response?.results || [],
      });

      if (backendSuccess) {
        setSelectedFile(null);
        const fileInput = document.getElementById("variant-file");
        if (fileInput) fileInput.value = "";
      }
    } catch (error) {
      console.error("[VARIANT BULK] Upload failed:", error);

      const errorResponse = error?.response?.data;
      console.error("[VARIANT BULK] Backend error:", errorResponse);

      setUploadResult({
        success: false,
        message:
          errorResponse?.message ||
          errorResponse?.error ||
          error?.message ||
          "Variant bulk upload failed.",
        totalRows: errorResponse?.totalRows || 0,
        createdCount: errorResponse?.createdCount || 0,
        updatedCount: errorResponse?.updatedCount || 0,
        skippedCount: errorResponse?.skippedCount || 0,
        results: errorResponse?.results || [],
      });
    } finally {
      setLoading(false);
    }
  };

  // ─── Open / Close Upload Panel ────────────────────────────
  const handleOpenUpload = () => {
    setShowUpload(true);
    setUploadResult(null);
    setSelectedFile(null);
  };

  const handleCloseUpload = () => {
    if (loading) return;
    setShowUpload(false);
    setSelectedFile(null);
    setUploadResult(null);

    const fileInput = document.getElementById("variant-file");
    if (fileInput) fileInput.value = "";
  };

  // ─── Render ───────────────────────────────────────────────
  return (
    <div className="variant-bulk-page">

      {/* HEADER */}
      <div className="variant-bulk-header">
        <p className="variant-bulk-tag">MENU MANAGEMENT</p>
        <h1>
          Bulk Upload 
          <span> Variants</span>
        </h1>
        <p className="variant-bulk-description">
          Upload an Excel file to create or update product variants for a
          specific outlet. Enter the Outlet ID, select your file, and
          let the system handle the rest.
        </p>
      </div>

      {/* OUTLET ID CARD */}
      <div className="variant-outlet-card">
        <h2>🏪 Select Outlet</h2>
        <p className="card-hint">
          Enter the outlet ID for which you want to upload variants.
        </p>

        <div className="outlet-input-group">
          <input
            type="number"
            className="outlet-id-input"
            placeholder="Enter Outlet ID"
            value={outletId}
            onChange={(e) => {
              setOutletId(e.target.value);
              setUploadResult(null);
            }}
            min="1"
            disabled={loading}
          />

          {isOutletReady ? (
            <span className="outlet-badge ready">✓ Outlet {outletId} selected</span>
          ) : (
            <span className="outlet-badge waiting">⏳ Waiting for Outlet ID</span>
          )}

          {isOutletReady && !showUpload && (
            <button
              type="button"
              className="variant-browse-btn"
              onClick={handleOpenUpload}
              style={{ marginLeft: "auto" }}
            >
              ⬆ Upload Variants
            </button>
          )}
        </div>
      </div>

      {/* UPLOAD CARD */}
      {showUpload && isOutletReady && (
        <div className="variant-upload-card">

          {/* Upload Header */}
          <div className="variant-upload-header">
            <h2>📤 Bulk Upload</h2>
            <button
              type="button"
              className="variant-close-btn"
              onClick={handleCloseUpload}
              disabled={loading}
            >
              ✕
            </button>
          </div>

          <p className="variant-upload-hint">
            Upload an Excel (.xlsx / .xls) file with variant data for
            Outlet <strong>#{outletId}</strong>.
          </p>

          {/* Dropzone */}
          <div
            className={`variant-dropzone ${dragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="dropzone-icon">📁</div>
            <h3>Drop your Excel file here</h3>
            <p>or click to browse (.xlsx, .xls)</p>

            <input
              id="variant-file"
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleFileChange}
              disabled={loading}
            />

            <label
              htmlFor="variant-file"
              className="variant-browse-btn"
            >
              Browse Files
            </label>
          </div>

          {/* Selected File */}
          {selectedFile && (
            <div className="variant-file-info">
              <div className="file-details">
                <span className="file-name">📄 {selectedFile.name}</span>
                <span className="file-size">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </span>
              </div>

              <button
                type="button"
                className="variant-upload-btn"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    Uploading...
                  </>
                ) : (
                  "⬆ Upload"
                )}
              </button>
            </div>
          )}

          {/* Loading bar */}
          {loading && (
            <div className="variant-loading-bar">
              <div className="progress-track">
                <div className="progress-fill" />
              </div>
              <p>Processing variant file for Outlet #{outletId}. Please wait...</p>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div
              className={`variant-result ${
                uploadResult.success ? "success" : "error"
              }`}
            >
              {/* Banner */}
              <div className="result-banner">
                <span className="result-icon">
                  {uploadResult.success ? "✅" : "❌"}
                </span>
                <h3>{uploadResult.message}</h3>
              </div>

              {/* Stats */}
              <div className="result-stats">
                {uploadResult.totalRows !== undefined && (
                  <div className="stat-pill total">
                    <p className="stat-value">{uploadResult.totalRows}</p>
                    <p className="stat-label">Total Rows</p>
                  </div>
                )}
                {uploadResult.createdCount !== undefined && (
                  <div className="stat-pill created">
                    <p className="stat-value">{uploadResult.createdCount}</p>
                    <p className="stat-label">Created</p>
                  </div>
                )}
                {uploadResult.updatedCount !== undefined && (
                  <div className="stat-pill updated">
                    <p className="stat-value">{uploadResult.updatedCount}</p>
                    <p className="stat-label">Updated</p>
                  </div>
                )}
                {uploadResult.skippedCount !== undefined && (
                  <div className="stat-pill skipped">
                    <p className="stat-value">{uploadResult.skippedCount}</p>
                    <p className="stat-label">Skipped</p>
                  </div>
                )}
              </div>

              {/* Row-level Results Table */}
              {uploadResult.results && uploadResult.results.length > 0 && (
                <div className="variant-results-table-container">
                  <h4>Row-Level Details</h4>
                  <div className="variant-results-table-wrapper">
                    <table className="variant-results-table">
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Product</th>
                          <th>Variant Group</th>
                          <th>Value</th>
                          <th>Price Type</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Message</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResult.results.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.rowNumber}</td>
                            <td>{row.productName || "—"}</td>
                            <td>{row.variantGroupName || "—"}</td>
                            <td>{row.variantGroupValue || "—"}</td>
                            <td>{row.priceType || "—"}</td>
                            <td>
                              {row.variantPrice !== null &&
                              row.variantPrice !== undefined
                                ? `₹${row.variantPrice}`
                                : "—"}
                            </td>
                            <td>
                              <span
                                className={`status-chip ${row.status || ""}`}
                              >
                                {row.status || "—"}
                              </span>
                            </td>
                            <td>{row.message || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VariantBulkUpload;
