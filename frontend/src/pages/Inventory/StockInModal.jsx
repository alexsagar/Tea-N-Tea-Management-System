import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Save, Plus } from "lucide-react";
import "./StockInModal.css";

const API_BASE = import.meta.env.VITE_API_URL;

const StockInModal = ({ onClose, onSave }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    supplier: "",
    product: "",
    quantity: 1,
    unit: "",
    unitPrice: "",
    totalPrice: "",
    invoiceNumber: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch suppliers and products for dropdowns
  useEffect(() => {
    axios.get(`${API_BASE}/suppliers?status=active`).then((res) => setSuppliers(res.data));
    axios.get(`${API_BASE}/inventory`).then((res) => setProducts(res.data));
  }, []);

  // Auto-calculate totalPrice
  useEffect(() => {
    setForm((f) => ({
      ...f,
      totalPrice: f.quantity && f.unitPrice ? (f.quantity * f.unitPrice) : "",
    }));
  }, [form.quantity, form.unitPrice]);

  // When product changes, update unit (autofill)
  useEffect(() => {
    const selected = products.find((p) => p._id === form.product);
    if (selected) setForm((f) => ({ ...f, unit: selected.unit }));
  }, [form.product, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    // Coerce to numbers!
    const submitData = {
      ...form,
      quantity: Number(form.quantity),
      unitPrice: Number(form.unitPrice),
      totalPrice: Number(form.totalPrice),
    };

    await axios.post(`${API_BASE}/stockin`, submitData);
    onSave(); // Refresh inventory table/list
  } catch (err) {
    setError(err.response?.data?.message || "Could not record stock-in.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="modal-overlay">
      <div className="modal-content stockin-modal">
        <div className="modal-header">
          <h2>Add Stock-In / Purchase</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Supplier *</label>
              <select
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select supplier</option>
                {suppliers.map((sup) => (
                  <option value={sup._id} key={sup._id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Product *</label>
              <select
                name="product"
                value={form.product}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select product</option>
                {products.map((prod) => (
                  <option value={prod._id} key={prod._id}>
                    {prod.name} ({prod.unit})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Unit</label>
              <input
                type="text"
                name="unit"
                value={form.unit}
                className="form-input"
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Unit Price (Nrs)*</label>
              <input
                type="number"
                name="unitPrice"
                value={form.unitPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Total Price</label>
              <input
                type="number"
                name="totalPrice"
                value={form.totalPrice}
                className="form-input"
                readOnly
              />
            </div>
            <div className="form-group">
              <label>Invoice Number</label>
              <input
                type="text"
                name="invoiceNumber"
                value={form.invoiceNumber}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Purchase Date</label>
              <input
                type="date"
                name="purchaseDate"
                value={form.purchaseDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ gridColumn: "1/-1" }}>
              <label>Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="form-textarea"
                rows="2"
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="stockin-modal-btn stockin-modal-btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="stockin-modal-btn stockin-modal-btn-primary" disabled={loading}>
              {loading ? <div className="spinner"></div> : (<><Save size={16} />Add Stock-In</>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockInModal;
