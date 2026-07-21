import * as XLSX from "xlsx";
import "../styles/AllMerchants.css";
import { useState, useEffect } from "react";
import Select from "react-select";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { getAllMerchants } from "../services/merchantService";
import MerchantTable from "../components/merchants/MerchantTable";
import merchantData from "../data/merchantData";



function AllMerchants() {

  const [merchantType, setMerchantType] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [merchants, setMerchants] = useState([]);
const [loading, setLoading] = useState(false);

const [range, setRange] = useState([
  {
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  },
]);

// const handleImport = () => {
//   if (!selectedFile) {
//     setFileError("Please select a file.");
//     return;
//   }

//   setFileError("");

//   console.log("Import file:", selectedFile);
// };

const handleImport = () => {
  if (!selectedFile) {
    setFileError("Please select a file.");
    return;
  }

  const reader = new FileReader();

  reader.readAsArrayBuffer(selectedFile);

  reader.onload = (e) => {
    const data = e.target.result;

    const workbook = XLSX.read(data, {
      type: "array",
    });

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    // const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
  raw: false,
});

    // setMerchants(jsonData);

    const formattedData = jsonData.map((merchant) => ({
  ...merchant,
  dob: XLSX.SSF.format("yyyy-mm-dd", merchant.dob),
}));

setMerchants(formattedData);
  };
};

const fetchMerchants = async () => {
  try {
    setLoading(true);

    const response = await getAllMerchants();

    console.log("Merchant API Response:", response);

    setMerchants(response.data);

  } catch (error) {
    console.error("Failed to fetch merchants:", error);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchMerchants();
}, []);


  return (
    <div>
      <div className="all-merchants-container">

  <h2>All Merchants</h2>

<div className="vendors-header">
  <h3>
    Merchants List
    <span className="vendors-count">
      18
    </span>
  </h3>
</div>

<p>Total Merchants: {merchants.length}</p>

  <div className="filters-row">

   
<Select
  className="filter-select"
  placeholder="Merchant Type"
  isClearable
  options={[
    { value: "RESTAURANT", label: "Restaurant" },
    { value: "MART", label: "Mart" },
  ]}
  styles={{
    control: (base) => ({
      ...base,
      borderRadius: "12px",
      minHeight: "42px",
    }),
  }}
/>

<Select
  className="filter-select"
  placeholder="Status"
  isClearable
  options={[
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ]}
  styles={{
    control: (base) => ({
      ...base,
      borderRadius: "12px",
      minHeight: "42px",
    }),
  }}
/>

<Select
  className="filter-select"
  placeholder="Select Area"
  isClearable
  options={[
    { value: "1", label: "Kukatpally" },
    { value: "2", label: "Madhapur" },
    { value: "3", label: "Hitech City" },
  ]}
styles={{
    control: (base) => ({
      ...base,
      borderRadius: "12px",
      minHeight: "42px",
    }),
  }} 
/>


<div className="range-picker">

  <div
    className="range-input"
    onClick={() => setShowCalendar(!showCalendar)}
  >
     Select Range ▼
  </div>

  {showCalendar && (
    <div className="calendar-popup">

      <DateRange
  editableDateInputs={true}
  onChange={(item) => setRange([item.selection])}
  moveRangeOnFirstSelection={false}
  ranges={range}
  months={2}
  direction="horizontal"
  showMonthAndYearPickers={true}
  rangeColors={["#FF6A00F7"]}
/>

      <div className="range-actions">
        <button
          onClick={() => setShowCalendar(false)}
        >
          Cancel
        </button>

        <button
          onClick={() => setShowCalendar(false)}
        >
          Apply
        </button>
      </div>

    </div>
  )}

</div>
 

</div>

    
   

  </div>

<div className="bulk-import-card">

  <div className="bulk-import-top">
    <div>
      <h3>Bulk Import Merchants</h3>
      <p>Upload Excel file to import multiple merchants at once</p>
    </div>

    <button className="download-template-btn">
      Download Template
    </button>
  </div>

  <div className="bulk-import-body">

    <label>Select Excel File (.xls/.xlsx)</label>

    <input
      type="file"
      accept=".xls,.xlsx"
      onChange={(e) => {
  setSelectedFile(e.target.files[0]);
  setFileError("");
}}
    />
    {fileError && (
  <p className="file-error">{fileError}</p>
)}

    <p className="import-note">
      File should contain merchant details in the required format.
    </p>

    <button className="import-btn"
      onClick={handleImport}>

      Import Merchants
    </button>

  </div>

</div>
{/* <MerchantTable merchants={merchantData} /> */}
<MerchantTable merchants={merchants} />
</div>
    
  );

}

export default AllMerchants;