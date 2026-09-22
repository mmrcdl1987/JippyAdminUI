import { useEffect, useState } from "react";
import { FiEdit2, FiMapPin, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import Swal from "sweetalert2";
import { showSuccessToast } from "../utils/notifications";
import {
  createCustomerDeliveryRule,
  deleteCustomerDeliveryRule,
  getCustomerDeliveryAreas,
  getCustomerDeliveryRules,
  updateCustomerDeliveryRule,
} from "../services/deliveryChargeService";

const EMPTY_FORM = {
  areaId: "",
  planName: "",
  orderValueThreshold: "",
  freeDistanceKms: "",
  chargePerKm: "",
  isActive: true,
};

const listFrom = (value) =>
  Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : Array.isArray(value?.content) ? value.content : [];

const idOf = (area) => area?.areaId ?? area?.id ?? area?.area_id;
const nameOf = (area) => area?.areaName ?? area?.name ?? area?.area_name ?? `Area ${idOf(area)}`;

function CustomerDeliveryCharge() {
  const [rules, setRules] = useState([]);
  const [areas, setAreas] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ruleResponse, areaResponse] = await Promise.all([
        getCustomerDeliveryRules(),
        getCustomerDeliveryAreas(),
      ]);
      setRules(listFrom(ruleResponse));
      setAreas(listFrom(areaResponse).filter((area) => idOf(area) != null));
    } catch (error) {
      console.error("Error loading customer delivery rules:", error);
      Swal.fire({ icon: "error", title: "Unable to load customer delivery settings", text: error.response?.data?.errorMessage || "Please try again.", confirmButtonColor: "#ff6b35" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The initial fetch synchronizes this screen with the delivery settings API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const areaName = (id) => nameOf(areas.find((area) => String(idOf(area)) === String(id)) || { id });
  const filteredRules = (() => {
    const term = search.trim().toLowerCase();
    if (!term) return rules;
    return rules.filter((rule) => `${rule.customerDeliveryChargeSettingsId} ${rule.planName} ${areaName(rule.areaId)} ${rule.isActive}`.toLowerCase().includes(term));
  })();

  const activeCount = rules.filter((rule) => rule.isActive === true || String(rule.isActive).toLowerCase() === "true").length;
  const openCreate = () => {
    setForm({ ...EMPTY_FORM, areaId: areas[0] ? idOf(areas[0]) : "" });
    setModal({ type: "create" });
  };
  const openEdit = (rule) => {
    setForm({ ...EMPTY_FORM, ...rule, areaId: rule.areaId ?? "" });
    setModal({ type: "edit", id: rule.customerDeliveryChargeSettingsId });
  };
  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.areaId || !form.planName.trim() || Number(form.orderValueThreshold) < 0 || Number(form.freeDistanceKms) < 0 || Number(form.chargePerKm) <= 0) {
      Swal.fire({ icon: "warning", title: "Check the form", text: "Select an area, enter a plan name, and provide valid non-negative values. Charge per KM must be greater than zero.", confirmButtonColor: "#ff6b35" });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        areaId: Number(form.areaId),
        planName: form.planName.trim(),
        orderValueThreshold: Number(form.orderValueThreshold),
        freeDistanceKms: Number(form.freeDistanceKms),
        chargePerKm: Number(form.chargePerKm),
        isActive: Boolean(form.isActive),
      };
      if (modal.type === "edit") await updateCustomerDeliveryRule(modal.id, payload);
      else await createCustomerDeliveryRule(payload);
      setModal(null);
      await loadData();
      showSuccessToast(modal.type === "edit" ? "Rule updated" : "Rule created");
    } catch (error) {
      console.error("Error saving customer delivery rule:", error);
      Swal.fire({ icon: "error", title: "Save failed", text: error.response?.data?.errorMessage || "Please try again.", confirmButtonColor: "#ff6b35" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (rule) => {
    const result = await Swal.fire({ icon: "warning", title: "Delete this rule?", text: "This action cannot be undone.", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#ef4444" });
    if (!result.isConfirmed) return;
    try {
      await deleteCustomerDeliveryRule(rule.customerDeliveryChargeSettingsId);
      await loadData();
    } catch (error) {
      console.error("Error deleting customer delivery rule:", error);
      Swal.fire({ icon: "error", title: "Delete failed", text: error.response?.data?.errorMessage || "Please try again.", confirmButtonColor: "#ff6b35" });
    }
  };

  return (
    <div className="jmart-content-body customer-delivery-page">
      <div className="jmart-page-title-row"><div><h1 className="jmart-title">Customer Delivery Charge Settings</h1><p className="jmart-breadcrumb">Pricing &gt; Delivery Charge Settings &gt; Customer</p></div><button className="customer-delivery-primary" onClick={openCreate}><FiPlus /> Add Customer Rule</button></div>
      <div className="customer-delivery-kpis">
        <div><small>Total Rules</small><strong>{rules.length}</strong></div>
        <div><small>Active Rules</small><strong>{activeCount}</strong></div>
        <div><small>Areas Configured</small><strong>{new Set(rules.map((rule) => rule.areaId)).size}</strong></div>
        <div><small>Average Charge / KM</small><strong>{rules.length ? `₹${(rules.reduce((sum, rule) => sum + Number(rule.chargePerKm || 0), 0) / rules.length).toFixed(2)}` : "₹0.00"}</strong></div>
      </div>
      <section className="customer-delivery-card"><div className="customer-delivery-toolbar"><div className="customer-delivery-search"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by area, plan, or ID..." /></div><button className="customer-delivery-refresh" onClick={loadData} aria-label="Refresh"><FiRefreshCw /></button></div>
        {loading ? <div className="customer-delivery-empty">Loading customer delivery rules...</div> : filteredRules.length === 0 ? <div className="customer-delivery-empty">No customer delivery rules found.</div> : <div className="customer-delivery-table-wrap"><table className="customer-delivery-table"><thead><tr><th># ID</th><th>AREA</th><th>PLAN NAME</th><th>ORDER THRESHOLD (₹)</th><th>FREE DISTANCE (KM)</th><th>CHARGE / KM (₹)</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{filteredRules.map((rule) => <tr key={rule.customerDeliveryChargeSettingsId}><td>#{rule.customerDeliveryChargeSettingsId}</td><td><span className="customer-delivery-city"><FiMapPin /> {areaName(rule.areaId)}</span></td><td>{rule.planName}</td><td>₹{rule.orderValueThreshold}</td><td>{rule.freeDistanceKms}</td><td>₹{rule.chargePerKm}</td><td><span className={rule.isActive ? "customer-delivery-active" : "customer-delivery-inactive"}>{rule.isActive ? "ACTIVE" : "INACTIVE"}</span></td><td><div className="customer-delivery-actions"><button onClick={() => openEdit(rule)} aria-label="Edit"><FiEdit2 /></button><button onClick={() => remove(rule)} aria-label="Delete"><FiTrash2 /></button></div></td></tr>)}</tbody></table></div>}
        <div className="customer-delivery-footer">Showing 1 to {filteredRules.length} of {filteredRules.length} entries</div>
      </section>
      {modal && <div className="customer-delivery-overlay" onMouseDown={(event) => event.target === event.currentTarget && !saving && setModal(null)}><form className="customer-delivery-modal" onSubmit={submit}><div className="customer-delivery-modal-header"><div><h2>{modal.type === "edit" ? "Edit" : "Add"} Customer Delivery Rule</h2><p>Configure area-based delivery pricing for customers.</p></div><button type="button" onClick={() => !saving && setModal(null)}><FiX /></button></div><div className="customer-delivery-form-grid"><label>Area<select name="areaId" value={form.areaId} onChange={updateField} required><option value="">Select area</option>{areas.map((area) => <option key={idOf(area)} value={idOf(area)}>{nameOf(area)}</option>)}</select></label><label>Plan Name<input name="planName" maxLength="30" value={form.planName} onChange={updateField} required /></label><label>Order Value Threshold (₹)<input name="orderValueThreshold" type="number" min="0" step="0.01" value={form.orderValueThreshold} onChange={updateField} required /></label><label>Free Distance (KM)<input name="freeDistanceKms" type="number" min="0" step="0.01" value={form.freeDistanceKms} onChange={updateField} required /></label><label>Charge per KM (₹)<input name="chargePerKm" type="number" min="0.01" step="0.01" value={form.chargePerKm} onChange={updateField} required /></label><label className="customer-delivery-checkbox"><input name="isActive" type="checkbox" checked={Boolean(form.isActive)} onChange={updateField} /> Active</label></div><div className="customer-delivery-modal-actions"><button type="button" onClick={() => setModal(null)}>Cancel</button><button className="customer-delivery-primary" disabled={saving}>{saving ? "Saving..." : modal.type === "edit" ? "Update Rule" : "Create Rule"}</button></div></form></div>}
    </div>
  );
}

export default CustomerDeliveryCharge;
