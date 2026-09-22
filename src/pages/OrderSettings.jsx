import { useEffect, useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiEdit2,
  FiMapPin,
  FiPercent,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import Swal from "sweetalert2";
import "../styles/OrderSettings.css";
import { showSuccessToast } from "../utils/notifications";
import { getAllAreas } from "../services/managerAreaService";
import {
  createCheckoutFee,
  createCheckoutTax,
  deleteCheckoutFee,
  deleteCheckoutTax,
  getCheckoutFees,
  getCheckoutTaxes,
  updateCheckoutFee,
  updateCheckoutTax,
} from "../services/orderSettingsService";

const EMPTY_FEE = {
  platformFee: "",
  platformFeeToggle: true,
  surgeFee: "",
  surgeFeeToggle: true,
  packagingFee: "",
  packagingFeeToggle: true,
  areaId: "",
};

const EMPTY_TAX = {
  platformFeeTax: "",
  surgeFeeTax: "",
  packagingFeeTax: "",
  deliveryFeeTax: "",
  foodAmountTax: "",
};

const unwrapList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const getUserId = () => {
  const raw = localStorage.getItem("userId") || localStorage.getItem("id");
  return Number(raw) || undefined;
};

const getAreaId = (area) => area?.areaId ?? area?.id ?? area?.areaID;
const getAreaName = (area) =>
  area?.areaName ?? area?.name ?? area?.area ?? `Area ${getAreaId(area)}`;

function OrderSettings() {
  const [tab, setTab] = useState("fees");
  const [fees, setFees] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FEE);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feeResponse, taxResponse, areaResponse] = await Promise.all([
        getCheckoutFees(),
        getCheckoutTaxes(),
        getAllAreas(),
      ]);
      setFees(unwrapList(feeResponse));
      setTaxes(unwrapList(taxResponse));
      setAreas(unwrapList(areaResponse).filter((area) => getAreaId(area) != null));
    } catch (error) {
      console.error("Error loading checkout settings:", error);
      Swal.fire({
        icon: "error",
        title: "Unable to load settings",
        text: error.response?.data?.errorMessage || "Please try again.",
        confirmButtonColor: "#ff6b35",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The initial fetch synchronizes this screen with the checkout settings API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const rows = tab === "fees" ? fees : taxes;
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      tab === "fees"
        ? `${row.areaId} ${getAreaName(areas.find((area) => String(getAreaId(area)) === String(row.areaId)))}`.toLowerCase().includes(term)
        : Object.values(row).some((value) => String(value).toLowerCase().includes(term))
    );
  }, [areas, rows, search, tab]);

  const feeCount = fees.length;
  const activePlatform = fees.filter((item) => item.platformFeeToggle).length;
  const activeSurge = fees.filter((item) => item.surgeFeeToggle).length;
  const activePackaging = fees.filter((item) => item.packagingFeeToggle).length;
  const tax = taxes[0];

  const openCreate = () => {
    setForm(tab === "fees" ? { ...EMPTY_FEE, areaId: areas[0] ? getAreaId(areas[0]) : "" } : EMPTY_TAX);
    setModal({ type: "create" });
  };

  const openEdit = (item) => {
    setForm(tab === "fees"
      ? { ...EMPTY_FEE, ...item, areaId: item.areaId ?? "" }
      : { ...EMPTY_TAX, ...item });
    setModal({ type: "edit", id: item.orderCheckoutFeeId ?? item.orderCheckoutTaxId });
  };

  const closeModal = () => {
    if (!saving) setModal(null);
  };

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const numericFields = tab === "fees"
      ? ["platformFee", "surgeFee", "packagingFee"]
      : ["platformFeeTax", "surgeFeeTax", "packagingFeeTax", "deliveryFeeTax", "foodAmountTax"];
    if (numericFields.some((field) => form[field] === "" || Number(form[field]) < 0 || (tab === "taxes" && Number(form[field]) > 100))) {
      Swal.fire({ icon: "warning", title: "Check the values", text: "Enter valid non-negative values; tax rates must be between 0 and 100.", confirmButtonColor: "#ff6b35" });
      return;
    }
    if (tab === "fees" && !form.areaId) {
      Swal.fire({ icon: "warning", title: "Area is required", text: "Select an area for this fee rule.", confirmButtonColor: "#ff6b35" });
      return;
    }
    try {
      setSaving(true);
      const payload = { ...form, userId: getUserId() };
      if (tab === "fees") {
        if (modal.type === "edit") await updateCheckoutFee(modal.id, payload);
        else await createCheckoutFee(payload);
      } else if (modal.type === "edit") {
        await updateCheckoutTax(modal.id, payload);
      } else {
        await createCheckoutTax(payload);
      }
      setModal(null);
      await loadData();
      showSuccessToast(modal.type === "edit" ? "Rule updated" : "Rule created");
    } catch (error) {
      console.error("Error saving checkout setting:", error);
      Swal.fire({ icon: "error", title: "Save failed", text: error.response?.data?.errorMessage || "Please try again.", confirmButtonColor: "#ff6b35" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    const id = item.orderCheckoutFeeId ?? item.orderCheckoutTaxId;
    const result = await Swal.fire({ icon: "warning", title: "Delete this rule?", text: "This action cannot be undone.", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#ef4444" });
    if (!result.isConfirmed) return;
    try {
      if (tab === "fees") await deleteCheckoutFee(id);
      else await deleteCheckoutTax(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting checkout setting:", error);
      Swal.fire({ icon: "error", title: "Delete failed", text: error.response?.data?.errorMessage || "Please try again.", confirmButtonColor: "#ff6b35" });
    }
  };

  const areaName = (id) => getAreaName(areas.find((area) => String(getAreaId(area)) === String(id)) || { areaId: id });
  const money = (value, enabled = true) => <span className="ord-value">₹{value ?? 0} <b className={enabled ? "ord-on" : "ord-off"}>{enabled ? "ON" : "OFF"}</b></span>;
  const percent = (value) => <span className="ord-pill">{value ?? 0}%</span>;

  return (
    <main className="ord-page">
      <div className="ord-breadcrumb"><span>⌂</span><span>›</span><strong>Order Settings</strong></div>
      <header className="ord-header">
        <div><h1>Order Checkout Settings</h1><p>Manage area-wise checkout fees (platform, surge, packaging) and tax rates.</p></div>
        <button className="ord-primary" onClick={openCreate}><FiPlus /> Add {tab === "fees" ? "Checkout Fee" : "Tax Rule"}</button>
      </header>
      <div className="ord-tabs">
        <button className={tab === "fees" ? "active" : ""} onClick={() => { setTab("fees"); setSearch(""); }}><span>₹</span> Checkout Fees (Area-wise) <em>{feeCount}</em></button>
        <button className={tab === "taxes" ? "active" : ""} onClick={() => { setTab("taxes"); setSearch(""); }}><FiPercent /> Checkout Taxes (Percentage) <em>{taxes.length}</em></button>
      </div>
      {tab === "fees" ? (
        <div className="ord-stat-grid">
          <Stat icon="▱" label="TOTAL FEE RULES" value={feeCount} tone="blue" />
          <Stat icon={<FiCheckCircle />} label="ACTIVE PLATFORM FEES" value={activePlatform} tone="green" />
          <Stat icon="↕" label="ACTIVE SURGE FEES" value={activeSurge} tone="orange" />
          <Stat icon="₹" label="ACTIVE PACKAGING FEES" value={activePackaging} tone="purple" />
        </div>
      ) : (
        <div className="ord-stat-grid">
          <Stat icon="▱" label="TAX CONFIGURATIONS" value={taxes.length} tone="purple" />
          <Stat icon="%" label="FOOD AMOUNT TAX" value={`${tax?.foodAmountTax ?? 0}%`} tone="blue" />
          <Stat icon="%" label="DELIVERY FEE TAX" value={`${tax?.deliveryFeeTax ?? 0}%`} tone="green" />
          <Stat icon="%" label="PLATFORM FEE TAX" value={`${tax?.platformFeeTax ?? 0}%`} tone="orange" />
        </div>
      )}
      <section className="ord-table-card">
        <div className="ord-toolbar"><div className="ord-search"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === "fees" ? "Search by Area name, ID, fee..." : "Search by tax rates..."} /></div><button className="ord-refresh" onClick={loadData} aria-label="Refresh"><FiRefreshCw /></button></div>
        {loading ? <div className="ord-empty">Loading checkout settings...</div> : filteredRows.length === 0 ? <div className="ord-empty">No checkout {tab === "fees" ? "fee rules" : "tax rules"} found.</div> : (
          <div className="ord-table-wrap"><table><thead><tr>{tab === "fees" ? <><th># ID</th><th>AREA</th><th>PLATFORM FEE (₹)</th><th>SURGE FEE (₹)</th><th>PACKAGING FEE (₹)</th><th>CREATED BY</th></> : <><th># ID</th><th>PLATFORM TAX (%)</th><th>SURGE TAX (%)</th><th>PACKAGING TAX (%)</th><th>DELIVERY TAX (%)</th><th>FOOD AMOUNT TAX (%)</th><th>CREATED BY</th></>}<th>ACTIONS</th></tr></thead><tbody>{filteredRows.map((item, index) => <tr key={item.orderCheckoutFeeId ?? item.orderCheckoutTaxId}><td>#{item.orderCheckoutFeeId ?? item.orderCheckoutTaxId ?? index + 1}</td>{tab === "fees" ? <><td><span className="ord-area"><FiMapPin />{areaName(item.areaId)}</span></td><td>{money(item.platformFee, item.platformFeeToggle)}</td><td>{money(item.surgeFee, item.surgeFeeToggle)}</td><td>{money(item.packagingFee, item.packagingFeeToggle)}</td><td>{item.createdBy ? `User #${item.createdBy}` : "System"}</td></> : <><td>{percent(item.platformFeeTax)}</td><td>{percent(item.surgeFeeTax)}</td><td>{percent(item.packagingFeeTax)}</td><td>{percent(item.deliveryFeeTax)}</td><td>{percent(item.foodAmountTax)}</td><td>{item.createdBy ? `User #${item.createdBy}` : "System"}</td></>}<td><div className="ord-actions"><button onClick={() => openEdit(item)} aria-label="Edit"><FiEdit2 /></button><button onClick={() => remove(item)} aria-label="Delete"><FiTrash2 /></button></div></td></tr>)}</tbody></table></div>
        )}
        <div className="ord-footer">Showing 1 to {filteredRows.length} of {filteredRows.length} entries <span>‹ <b>1</b> ›</span></div>
      </section>
      {modal && <div className="ord-overlay" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}><form className="ord-modal" onSubmit={submit}><div className="ord-modal-header"><div><h2>{modal.type === "edit" ? "Edit" : "Add"} {tab === "fees" ? "Checkout Fee" : "Tax Rule"}</h2><p>Enter the values for this configuration.</p></div><button type="button" onClick={closeModal}><FiX /></button></div><div className="ord-modal-grid">{tab === "fees" ? <><label>Area<select name="areaId" value={form.areaId} onChange={updateField}><option value="">Select area</option>{areas.map((area) => <option key={getAreaId(area)} value={getAreaId(area)}>{getAreaName(area)}</option>)}</select></label>{[["platformFee", "Platform Fee (₹)", "platformFeeToggle"], ["surgeFee", "Surge Fee (₹)", "surgeFeeToggle"], ["packagingFee", "Packaging Fee (₹)", "packagingFeeToggle"]].map(([name, label, toggle]) => <label key={name}>{label}<input name={name} type="number" min="0" step="0.01" value={form[name]} onChange={updateField} required /><span className="ord-check"><input type="checkbox" name={toggle} checked={form[toggle]} onChange={updateField} /> Active</span></label>)}</> : [["platformFeeTax", "Platform Fee Tax (%)"], ["surgeFeeTax", "Surge Fee Tax (%)"], ["packagingFeeTax", "Packaging Fee Tax (%)"], ["deliveryFeeTax", "Delivery Fee Tax (%)"], ["foodAmountTax", "Food Amount Tax (%)"]].map(([name, label]) => <label key={name}>{label}<input name={name} type="number" min="0" max="100" step="0.01" value={form[name]} onChange={updateField} required /></label>)}</div><div className="ord-modal-actions"><button type="button" className="ord-secondary" onClick={closeModal}>Cancel</button><button className="ord-primary" disabled={saving}>{saving ? "Saving..." : modal.type === "edit" ? "Update Rule" : "Create Rule"}</button></div></form></div>}
    </main>
  );
}

function Stat({ icon, label, value, tone }) {
  return <div className="ord-stat"><span className={`ord-stat-icon ${tone}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>;
}

export default OrderSettings;
