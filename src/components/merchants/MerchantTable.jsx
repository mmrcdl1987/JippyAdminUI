import "../../styles/MerchantTable.css";
import { FiSearch } from "react-icons/fi";
import { FiDownloadCloud } from "react-icons/fi";
import { useState } from "react";
import MerchantTableRow from "./MerchantTableRow";

function MerchantTable({ merchants }) {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [search, setSearch] = useState("");

const filteredMerchants = merchants.filter((merchant)=>{

    const keyword = search.toLowerCase();

    return(

        merchant.merchantName.toLowerCase().includes(keyword) ||

        merchant.merchantEmail.toLowerCase().includes(keyword) ||

        merchant.merchantPhone.includes(keyword) ||

        merchant.state.toLowerCase().includes(keyword)

    );

});
  return (
    <div className="merchant-table-container">
        <div className="merchant-table-header">

  <div>
    <h3>Merchants List</h3>
    <p>View and manage all the merchants</p>
  </div>

  <button className="create-merchant-btn">
    + Create Merchant
  </button>

</div>

<div className="merchant-toolbar">

  <div className="entries-section">
    <span>Show</span>

    <select>
        <option>10</option>
      <option>30</option>
      <option>50</option>
      <option>100</option>
    </select>

    <span>entries</span>
  </div>

  <div className="toolbar-right">

  <div className="search-wrapper">

   <input
    type="text"
    placeholder="Search here..."
    className="search-box"
    value={search}
    onChange={(e)=>setSearch(e.target.value)}
/>

    <FiSearch className="search-icon"/>

  </div>

  <div className="export-wrapper">

  <button
    className="export-btn"
    onClick={() => setShowExportMenu(!showExportMenu)}
  >
    <FiDownloadCloud size={18} />
    <span>Export as</span>
  </button>

  {showExportMenu && (
    <div className="export-menu">

      <div
        className="export-item"
        onClick={() => {
          setShowExportMenu(false);
          console.log("Export PDF");
        }}
      >
        Export PDF
      </div>

      <div
        className="export-item"
        onClick={() => {
          setShowExportMenu(false);
          console.log("Export Excel");
        }}
      >
        Export Excel
      </div>

      <div
        className="export-item"
        onClick={() => {
          setShowExportMenu(false);
          console.log("Export CSV");
        }}
      >
        Export CSV
      </div>

    </div>
  )}

</div>

</div>

</div>

      <table className="merchant-table">

        <thead>

          <tr>

            <th></th>

           

            <th>Merchant ID</th>

            <th>Merchant Name</th>

            <th>Email</th>

            <th>Phone No.</th>

            <th>Business Type</th>

            <th>Status</th>

            <th>State</th>

            <th>Active</th>

            <th>Approved</th>

            <th>Uploaded By</th>

             <th>Profile Picture</th>

              <th>First Name</th>

               <th>Last Name</th>

          </tr>

        </thead>

        
            <tbody>

{filteredMerchants.length > 0 ? (

    filteredMerchants.map((merchant) => (
  <MerchantTableRow
    key={merchant.merchantId}
    merchant={merchant}
  />
))

) : (

<tr>

<td colSpan="14" className="no-result">

No Results Found

</td>

</tr>

)}

</tbody>

        

      </table>

    </div>
  );
}

export default MerchantTable;