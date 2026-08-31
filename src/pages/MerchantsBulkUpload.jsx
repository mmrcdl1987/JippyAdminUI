import "../styles/MerchantsBulkUpload.css";
import { useState } from "react";
import { uploadMerchants } from "../services/merchantService";

function MerchantsBulkUpload() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // HANDLE FILE SELECTION
  // ============================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setUploadResult(null);
      return;
    }

    const allowedExtensions = [
      ".csv",
      ".xlsx",
      ".xls",
    ];

    const fileName = file.name.toLowerCase();

    const isValidFile = allowedExtensions.some(
      (extension) => fileName.endsWith(extension)
    );

    if (!isValidFile) {
      alert(
        "Please select a CSV or Excel file (.csv, .xlsx, .xls)."
      );

      event.target.value = "";
      setSelectedFile(null);
      setUploadResult(null);

      return;
    }

    // Optional size validation
    if (file.size === 0) {
      alert("The selected file is empty.");

      event.target.value = "";
      setSelectedFile(null);
      setUploadResult(null);

      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
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

      console.log(
        "================================================"
      );

      console.log(
        "[MERCHANT BULK] Starting upload"
      );

      console.log(
        "[MERCHANT BULK] File:",
        selectedFile.name
      );

      console.log(
        "[MERCHANT BULK] Size:",
        selectedFile.size,
        "bytes"
      );

      console.log(
        "[MERCHANT BULK] Type:",
        selectedFile.type
      );

      console.log(
        "================================================"
      );


      // ========================================================
      // CALL MERCHANT BULK UPLOAD SERVICE
      // ========================================================

      const response = await uploadMerchants(
        selectedFile
      );


      console.log(
        "[MERCHANT BULK] API response:",
        response
      );


      // ========================================================
      // BACKEND RESPONSE
      // ========================================================

      /*
       * Expected response structure:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *      totalRows: 2,
       *      successCount: 2,
       *      failureCount: 0,
       *      errors: []
       *   }
       * }
       *
       * OR:
       *
       * {
       *   success: false,
       *   message: "...",
       *   data: {
       *      totalRows: 2,
       *      successCount: 1,
       *      failureCount: 1,
       *      errors: [...]
       *   }
       * }
       */


      const resultData =
        response?.data || null;


      const backendSuccess =
        response?.success !== false;


      setUploadResult({
        success: backendSuccess,

        message:
          response?.message ||
          (
            backendSuccess
              ? "Merchants uploaded successfully."
              : "Merchant upload failed."
          ),

        data: resultData,
      });


      // ========================================================
      // CLEAR FILE ONLY AFTER SUCCESS
      // ========================================================

      if (backendSuccess) {
        setSelectedFile(null);

        const fileInput =
          document.getElementById(
            "merchant-file"
          );

        if (fileInput) {
          fileInput.value = "";
        }
      }

    } catch (error) {

      console.error(
        "[MERCHANT BULK] Upload failed:",
        error
      );


      const errorResponse =
        error?.response?.data;


      console.error(
        "[MERCHANT BULK] Backend error:",
        errorResponse
      );


      setUploadResult({

        success: false,

        message:
          errorResponse?.message ||
          errorResponse?.error ||
          error?.message ||
          "Merchant bulk upload failed.",

        data:
          errorResponse?.data ||
          null,

      });

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // CLOSE UPLOAD CARD
  // ============================================================

  const handleCloseUpload = () => {

    if (loading) {
      return;
    }

    setShowUpload(false);
    setSelectedFile(null);
    setUploadResult(null);
    setLoading(false);


    const fileInput =
      document.getElementById(
        "merchant-file"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  };


  // ============================================================
  // OPEN UPLOAD CARD
  // ============================================================

  const handleOpenUpload = () => {

    setShowUpload(true);
    setUploadResult(null);
    setSelectedFile(null);
  };


  return (
    <div className="bulk-upload-page">


      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="bulk-header">

        <p className="bulk-subtitle">
          ONBOARDING DASHBOARD
        </p>


        <h1>

          Add Merchants
          <br />

          <span>
            Instantly.
          </span>

        </h1>


        <p className="bulk-description">

          Register a single merchant manually,
          or upload a bulk CSV / Excel file
          to onboard hundreds at once.

        </p>


        <div className="bulk-actions">


          {/* ADD MERCHANT */}

          <button
            type="button"
            className="add-btn"
          >
            + Add Merchant
          </button>


          {/* UPLOAD FILE */}

          <button
            type="button"
            className="upload-btn"
            onClick={handleOpenUpload}
            disabled={loading}
          >
            ↑ Upload File
          </button>

        </div>

      </div>


      {/* ======================================================
          BULK UPLOAD CARD
      ======================================================= */}

      {showUpload && (

        <div className="upload-card">


          {/* ==================================================
              UPLOAD HEADER
          =================================================== */}

          <div className="upload-header">

            <h2>
              Bulk Upload
            </h2>


            <button
              type="button"
              className="close-btn"
              onClick={handleCloseUpload}
              disabled={loading}
            >
              ✕
            </button>

          </div>


          <p className="upload-text">

            Upload a CSV or Excel file to add
            multiple merchants at once.

          </p>


          {/* ==================================================
              UPLOAD BOX
          =================================================== */}

          <div className="upload-box">


            <div className="upload-icon">
              📁
            </div>


            <h3>
              Drop your file here
            </h3>


            <p>
              or click to browse
            </p>


            {/* =================================================
                FILE INPUT
            ================================================== */}

            <input
              id="merchant-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              hidden
              onChange={handleFileChange}
              disabled={loading}
            />


            {/* =================================================
                BROWSE BUTTON
            ================================================== */}

            <label
              htmlFor="merchant-file"
              className="browse-btn"
            >
              Browse Files
            </label>


            {/* =================================================
                SELECTED FILE
            ================================================== */}

            {selectedFile && (

              <div className="selected-file-container">


                <p className="selected-file">

                  📄{" "}
                  {selectedFile.name}

                </p>


                <p className="selected-file-size">

                  {(
                    selectedFile.size /
                    1024
                  ).toFixed(2)}{" "}
                  KB

                </p>


                {/* =================================================
                    UPLOAD BUTTON
                ================================================== */}

                <button
                  type="button"
                  className="upload-submit-btn"
                  onClick={handleUpload}
                  disabled={loading}
                >

                  {loading
                    ? "⏳ Uploading..."
                    : "⬆ Upload"}

                </button>

              </div>

            )}


            {/* =================================================
                LOADING MESSAGE
            ================================================== */}

            {loading && (

              <p
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                }}
              >
                Uploading merchant file. Please wait...
              </p>

            )}


            {/* =================================================
                UPLOAD RESULT
            ================================================== */}

            {uploadResult && (

              <div
                className={`upload-result ${
                  uploadResult.success
                    ? "upload-success"
                    : "upload-error"
                }`}
              >


                {/* RESULT MESSAGE */}

                <h4>

                  {uploadResult.success
                    ? "✓ "
                    : "✕ "}

                  {uploadResult.message}

                </h4>


                {/* =================================================
                    RESULT DATA
                ================================================== */}

                {uploadResult.data && (

                  <div className="upload-result-details">


                    {/* TOTAL ROWS */}

                    {uploadResult.data
                      .totalRows !== undefined && (

                      <p>

                        <strong>
                          Total Rows:
                        </strong>{" "}

                        {
                          uploadResult.data
                            .totalRows
                        }

                      </p>

                    )}


                    {/* SUCCESS COUNT */}

                    {uploadResult.data
                      .successCount !== undefined && (

                      <p>

                        <strong>
                          Success:
                        </strong>{" "}

                        {
                          uploadResult.data
                            .successCount
                        }

                      </p>

                    )}


                    {/* FAILURE COUNT */}

                    {uploadResult.data
                      .failureCount !== undefined && (

                      <p>

                        <strong>
                          Failed:
                        </strong>{" "}

                        {
                          uploadResult.data
                            .failureCount
                        }

                      </p>

                    )}


                    {/* =================================================
                        ERROR LIST
                    ================================================== */}

                    {uploadResult.data.errors &&
                      uploadResult.data.errors.length >
                        0 && (

                      <div
                        className="upload-errors"
                        style={{
                          marginTop: "15px",
                        }}
                      >

                        <strong>
                          Upload Errors:
                        </strong>


                        <div
                          style={{
                            marginTop: "8px",
                          }}
                        >

                          {uploadResult.data.errors.map(
                            (error, index) => (

                              <div
                                key={index}
                                style={{
                                  marginBottom:
                                    "8px",
                                  padding:
                                    "8px",
                                  borderRadius:
                                    "6px",
                                  background:
                                    "#fff",
                                  border:
                                    "1px solid #ddd",
                                }}
                              >

                                <strong>
                                  Row{" "}
                                  {
                                    error.rowNumber
                                  }
                                </strong>


                                {error.field && (
                                  <>
                                    {" - "}
                                    <strong>
                                      {
                                        error.field
                                      }
                                    </strong>
                                  </>
                                )}


                                {error.reason && (
                                  <>
                                    {": "}
                                    {
                                      error.reason
                                    }
                                  </>
                                )}

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )}


                  </div>

                )}

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}

export default MerchantsBulkUpload;