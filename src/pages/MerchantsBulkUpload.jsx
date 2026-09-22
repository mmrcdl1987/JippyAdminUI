import "../styles/MerchantsBulkUpload.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadMerchants } from "../services/merchantService";
import {
  FiUploadCloud,
  FiFileText,
  FiArrowLeft,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiX,
  FiUsers,
  FiShield,
  FiZap,
} from "react-icons/fi";

function MerchantsBulkUpload() {
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // ============================================================
  // FILE VALIDATION HELPER
  // ============================================================

  const processFile = (file) => {
    if (!file) {
      setSelectedFile(null);
      setUploadResult(null);
      return;
    }

    const allowedExtensions = [".csv", ".xlsx", ".xls"];
    const fileName = file.name.toLowerCase();

    const isValidFile = allowedExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!isValidFile) {
      alert("Please select a CSV or Excel file (.csv, .xlsx, .xls).");
      setSelectedFile(null);
      setUploadResult(null);
      return;
    }

    if (file.size === 0) {
      alert("The selected file is empty.");
      setSelectedFile(null);
      setUploadResult(null);
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  // ============================================================
  // HANDLE FILE SELECTION VIA INPUT
  // ============================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  // ============================================================
  // DRAG & DROP HANDLERS
  // ============================================================

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // ============================================================
  // SAMPLE CSV TEMPLATE DOWNLOAD
  // ============================================================

  const handleDownloadTemplate = () => {
    const headers = [
      "Merchant Name",
      "Email",
      "Mobile",
      "Address",
      "Area",
      "City",
      "State",
      "Business Model",
      "Merchant Type",
      "Status",
    ];

    const sampleRow = [
      "Royal Mart",
      "royal.mart@example.com",
      "9876543210",
      "Plot 12, Road 36, Jubilee Hills",
      "Jubilee Hills",
      "Hyderabad",
      "Telangana",
      "Retail",
      "Mart",
      "ACTIVE",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), sampleRow.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "merchants_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============================================================
  // UPLOAD MERCHANTS
  // ============================================================

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    try {
      setLoading(true);
      setUploadResult(null);

      console.log("================================================");
      console.log("[MERCHANT BULK] Starting upload");
      console.log("[MERCHANT BULK] File:", selectedFile.name);
      console.log("[MERCHANT BULK] Size:", selectedFile.size, "bytes");
      console.log("[MERCHANT BULK] Type:", selectedFile.type);
      console.log("================================================");

      const response = await uploadMerchants(selectedFile);

      console.log("[MERCHANT BULK] API response:", response);

      const resultData = response?.data || null;
      const backendSuccess = response?.success !== false;

      setUploadResult({
        success: backendSuccess,
        message:
          response?.message ||
          (backendSuccess
            ? "Merchants uploaded successfully."
            : "Merchant upload failed."),
        data: resultData,
      });

      if (backendSuccess) {
        setSelectedFile(null);
        const fileInput = document.getElementById("merchant-file");
        if (fileInput) {
          fileInput.value = "";
        }
      }
    } catch (error) {
      console.error("[MERCHANT BULK] Upload failed:", error);
      const errorResponse = error?.response?.data;
      console.error("[MERCHANT BULK] Backend error:", errorResponse);

      setUploadResult({
        success: false,
        message:
          errorResponse?.message ||
          errorResponse?.error ||
          error?.message ||
          "Merchant bulk upload failed.",
        data: errorResponse?.data || null,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CLEAR / REMOVE SELECTED FILE
  // ============================================================

  const handleRemoveFile = () => {
    if (loading) return;
    setSelectedFile(null);
    setUploadResult(null);
    const fileInput = document.getElementById("merchant-file");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className="bulk-upload-page">
      {/* ======================================================
          TOP HEADER BAR (Zone Management Style)
      ======================================================= */}
      <div className="bulk-top-header">
        <div className="bulk-header-left">
          <div className="bulk-header-icon-box">
            <FiUploadCloud />
          </div>
          <div className="bulk-header-titles">
            <div className="bulk-eyebrow-row">
              <span className="bulk-eyebrow">Merchant Management</span>
              <span className="bulk-divider">•</span>
              <span className="bulk-breadcrumb">Batch Onboarding</span>
            </div>
            <h1>
              Merchants Bulk Upload
              <span className="bulk-badge-pill">CSV / Excel Engine</span>
            </h1>
          </div>
        </div>

        <div className="bulk-header-actions">
          <button
            type="button"
            className="bulk-btn-back"
            onClick={() => navigate("/dashboard/merchants")}
          >
            <FiArrowLeft />
            <span>All Merchants</span>
          </button>

          <button
            type="button"
            className="bulk-btn-template"
            onClick={handleDownloadTemplate}
          >
            <FiDownload />
            <span>Download CSV Template</span>
          </button>

          <button
            type="button"
            className="bulk-btn-create-single"
            onClick={() => navigate("/dashboard/createMerchant")}
          >
            <FiPlus />
            <span>Add Single Merchant</span>
          </button>
        </div>
      </div>

      {/* ======================================================
          HERO / WELCOME BANNER
      ======================================================= */}
      <div className="bulk-hero-card">
        <div className="bulk-hero-left">
          <div className="bulk-hero-tag">
            <FiUsers /> Fast Automated Onboarding
          </div>
          <h2>
            Scale Your Merchant Network <span>Instantly.</span>
          </h2>
          <p>
            Upload a single CSV or Excel workbook to register or update hundreds of merchants,
            assign geographic operating areas, and configure store profiles automatically.
          </p>
        </div>

        <div className="bulk-hero-right">
          <div className="bulk-stat-pill">
            <strong>3 Types</strong>
            <span>.CSV / .XLSX / .XLS</span>
          </div>
          <div className="bulk-stat-pill">
            <strong>100%</strong>
            <span>Row Validation</span>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN BULK UPLOAD CARD
      ======================================================= */}
      <div className="bulk-main-card">
        <div className="bulk-card-header">
          <div className="bulk-card-header-left">
            <div className="bulk-card-header-icon">
              <FiFileText />
            </div>
            <div>
              <h3>Import Spreadsheet</h3>
              <p>Drag and drop your prepared file or browse your computer</p>
            </div>
          </div>
        </div>

        {/* ====================================================
            DROPZONE
        ==================================================== */}
        <div
          className={`bulk-dropzone ${isDragging ? "drag-active" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("merchant-file")?.click()}
        >
          <div className="bulk-cloud-icon-wrapper">
            <FiUploadCloud />
          </div>

          <h3 className="bulk-dropzone-title">
            {isDragging ? "Drop your file here now" : "Drag and drop your file here"}
          </h3>
          <p className="bulk-dropzone-desc">
            Supports standardized CSV and Excel spreadsheets up to 20MB
          </p>

          <div className="bulk-format-tags">
            <span className="bulk-format-tag">.CSV</span>
            <span className="bulk-format-tag">.XLSX</span>
            <span className="bulk-format-tag">.XLS</span>
          </div>

          <button
            type="button"
            className="bulk-browse-btn"
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById("merchant-file")?.click();
            }}
          >
            <FiUploadCloud />
            <span>Browse Files</span>
          </button>

          <input
            id="merchant-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            hidden
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>

        {/* ====================================================
            SELECTED FILE PREVIEW
        ==================================================== */}
        {selectedFile && (
          <div className="bulk-file-preview-card">
            <div className="bulk-file-preview-left">
              <div className="bulk-file-icon-badge">
                <FiFileText />
              </div>
              <div className="bulk-file-meta">
                <span className="bulk-file-name">{selectedFile.name}</span>
                <span className="bulk-file-size">
                  {(selectedFile.size / 1024).toFixed(2)} KB • Ready to process
                </span>
              </div>
            </div>

            <div className="bulk-file-actions">
              <button
                type="button"
                className="bulk-btn-remove"
                onClick={handleRemoveFile}
                disabled={loading}
              >
                <FiX /> Remove
              </button>

              <button
                type="button"
                className="bulk-btn-submit-upload"
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="bulk-spinner" />
                    <span>Processing Upload...</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud />
                    <span>Upload & Process</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ====================================================
            LOADING PROGRESS
        ==================================================== */}
        {loading && (
          <div className="bulk-loading-box">
            <div className="bulk-spinner" />
            <span>Parsing spreadsheet and registering merchants with the backend. Please wait...</span>
          </div>
        )}

        {/* ====================================================
            UPLOAD RESULT CARD
        ==================================================== */}
        {uploadResult && (
          <div
            className={`bulk-result-card ${
              uploadResult.success ? "bulk-result-success" : "bulk-result-error"
            }`}
          >
            <div className="bulk-result-header">
              {uploadResult.success ? (
                <FiCheckCircle style={{ fontSize: "20px" }} />
              ) : (
                <FiAlertCircle style={{ fontSize: "20px" }} />
              )}
              <span>{uploadResult.message}</span>
            </div>

            {uploadResult.data && (
              <>
                <div className="bulk-result-stats-row">
                  {uploadResult.data.totalRows !== undefined && (
                    <div className="bulk-result-metric">
                      Total Rows: <strong>{uploadResult.data.totalRows}</strong>
                    </div>
                  )}

                  {uploadResult.data.successCount !== undefined && (
                    <div className="bulk-result-metric">
                      Successfully Processed: <strong>{uploadResult.data.successCount}</strong>
                    </div>
                  )}

                  {uploadResult.data.failureCount !== undefined && (
                    <div className="bulk-result-metric">
                      Failed / Skipped: <strong>{uploadResult.data.failureCount}</strong>
                    </div>
                  )}
                </div>

                {uploadResult.data.errors && uploadResult.data.errors.length > 0 && (
                  <div className="bulk-errors-container">
                    <div className="bulk-errors-title">
                      <FiAlertCircle />
                      <span>Row-by-Row Issue Breakdown ({uploadResult.data.errors.length}):</span>
                    </div>

                    <div className="bulk-error-list">
                      {uploadResult.data.errors.map((err, idx) => (
                        <div key={idx} className="bulk-error-item">
                          <span className="bulk-error-row-badge">
                            Row {err.rowNumber || idx + 1}
                          </span>
                          {err.field && (
                            <span className="bulk-error-field-badge">
                              {err.field}
                            </span>
                          )}
                          <span className="bulk-error-reason">
                            {err.reason || "Validation constraint failed"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ======================================================
          GUIDANCE / INFO CARDS
      ======================================================= */}
      <div className="bulk-guidance-grid">
        <div className="bulk-guidance-card">
          <div className="bulk-guidance-icon" style={{ color: "#7c3aed" }}>
            <FiFileText />
          </div>
          <h4>Required Header Columns</h4>
          <p>
            Ensure your file contains: Merchant Name, Email, Mobile, Address, Area, City, State,
            and Business Model for flawless automatic ingestion.
          </p>
        </div>

        <div className="bulk-guidance-card">
          <div className="bulk-guidance-icon" style={{ color: "#10b981" }}>
            <FiShield />
          </div>
          <h4>Automatic De-duplication</h4>
          <p>
            The backend verifies unique email and phone constraints. Providing an existing Merchant ID
            will perform a safe in-place update rather than creating duplicates.
          </p>
        </div>

        <div className="bulk-guidance-card">
          <div className="bulk-guidance-icon" style={{ color: "#f59e0b" }}>
            <FiZap />
          </div>
          <h4>Instant Area Resolution</h4>
          <p>
            Areas and cities specified in the file are verified against active registered manager zones
            and operating boundaries in real time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MerchantsBulkUpload;