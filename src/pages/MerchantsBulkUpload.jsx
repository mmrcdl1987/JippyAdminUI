import "../styles/MerchantsBulkUpload.css";
import { useState } from "react";
import { uploadMerchants } from "../services/merchantService";

function MerchantsBulkUpload() {

  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleUpload = async () => {

    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    try {

      const response = await uploadMerchants(selectedFile);

      console.log(response);

      setUploadResult(response);

    } catch (error) {

      console.error(error);

      setUploadResult({
  success: false,
  message: "Upload Failed"
});

    }

  };

  return (

    <div className="bulk-upload-page">

      <div className="bulk-header">

        <p className="bulk-subtitle">
          ONBOARDING DASHBOARD
        </p>

        <h1>
          Add Merchants
          <br />
          <span>Instantly.</span>
        </h1>

        <p className="bulk-description">
          Register a single merchant manually, or upload a bulk
          CSV / Excel file to onboard hundreds at once.
        </p>

        <div className="bulk-actions">

          <button className="add-btn">
            + Add Merchant
          </button>

          <button
            className="upload-btn"
            onClick={() => setShowUpload(true)}
          >
            ↑ Upload File
          </button>

        </div>

      </div>

      {showUpload && (

        <div className="upload-card">

          <div className="upload-header">

            <h2>Bulk Upload</h2>

            <button
              className="close-btn"
             onClick={() => {
  setShowUpload(false);
  setSelectedFile(null);
  setUploadResult(null);
}}
            >
              ✕
            </button>

          </div>

          <p className="upload-text">
            Upload a CSV or Excel file to add multiple merchants at once.
          </p>

          <div className="upload-box">

            <div className="upload-icon">
              📁
            </div>

            <h3>Drop your file here</h3>

            <p>or click to browse</p>

            <input
              id="merchant-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              hidden
              onChange={(e) =>
                setSelectedFile(e.target.files[0])
              }
            />

            <label
              htmlFor="merchant-file"
              className="browse-btn"
            >
              Browse Files
            </label>

            {selectedFile && (
              <>
                <p className="selected-file">
                  {selectedFile.name}
                </p>

                <button
                  className="upload-submit-btn"
                  onClick={handleUpload}
                >
                  Upload
                </button>
                {uploadResult && (
  <div className="upload-result">

    <h4>{uploadResult.message}</h4>

    {uploadResult.data && (
      <>
        <p>Total Rows : {uploadResult.data.totalRows}</p>
        <p>Success : {uploadResult.data.successCount}</p>
        <p>Failed : {uploadResult.data.failureCount}</p>
      </>
    )}

  </div>
)}
              </>
            )}

          </div>

        </div>

      )}

    </div>

  );
}

export default MerchantsBulkUpload;