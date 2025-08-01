import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, Plus, Minus } from 'lucide-react';
import './StockUpdateModal.css';

const API_BASE = import.meta.env.VITE_API_URL;

const StockUpdateModal = ({ item, onClose, onSave }) => {
  const [operation, setOperation] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!quantity || parseFloat(quantity) <= 0) {
      setError('Please enter a valid quantity');
      setLoading(false);
      return;
    }

    try {
      await axios.patch(`${API_BASE}/inventory/${item._id}/stock`, {
        quantity: parseFloat(quantity),
        operation,
        reason
      });

      onSave();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getNewStock = () => {
    const qty = parseFloat(quantity) || 0;
    if (operation === 'add') {
      return item.currentStock + qty;
    } else {
      return Math.max(0, item.currentStock - qty);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content stock-modal">
        <div className="modal-header">
          <h2>Update Stock - {item.name}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="current-stock-info">
          <div className="stock-item">
            <span className="label">Current Stock:</span>
            <span className="value">{item.currentStock} {item.unit}</span>
          </div>
          <div className="stock-item">
            <span className="label">Minimum Stock:</span>
            <span className="value">{item.minStock} {item.unit}</span>
          </div>
          <div className="stock-item">
            <span className="label">Maximum Stock:</span>
            <span className="value">{item.maxStock} {item.unit}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="operation-selector">
            <label className="form-label">Operation</label>
            <div className="operation-buttons">
              <button
                type="button"
                className={`operation-btn ${operation === 'add' ? 'active' : ''}`}
                onClick={() => setOperation('add')}
              >
                <Plus size={16} />
                Add Stock
              </button>
              <button
                type="button"
                className={`operation-btn ${operation === 'subtract' ? 'active' : ''}`}
                onClick={() => setOperation('subtract')}
              >
                <Minus size={16} />
                Remove Stock
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="quantity" className="form-label">
              Quantity to {operation === 'add' ? 'Add' : 'Remove'} *
            </label>
            <div className="quantity-input-wrapper">
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input"
                step="0.01"
                min="0.01"
                required
              />
              <span className="unit-label">{item.unit}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reason" className="form-label">Reason</label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="form-select"
            >
              <option value="">Select reason</option>
              {operation === 'add' ? (
                <>
                  <option value="purchase">New Purchase</option>
                  <option value="return">Customer Return</option>
                  <option value="adjustment">Stock Adjustment</option>
                  <option value="transfer">Transfer In</option>
                </>
              ) : (
                <>
                  <option value="sale">Sale/Usage</option>
                  <option value="waste">Waste/Spoilage</option>
                  <option value="damage">Damage</option>
                  <option value="adjustment">Stock Adjustment</option>
                  <option value="transfer">Transfer Out</option>
                </>
              )}
            </select>
          </div>

          {quantity && (
            <div className="stock-preview">
              <div className="preview-header">Stock Preview</div>
              <div className="preview-calculation">
                <span className="current">{item.currentStock} {item.unit}</span>
                <span className="operator">{operation === 'add' ? '+' : '-'}</span>
                <span className="quantity">{quantity} {item.unit}</span>
                <span className="equals">=</span>
                <span className={`result ${getNewStock() <= item.minStock ? 'low-stock' : ''}`}>
                  {getNewStock()} {item.unit}
                </span>
              </div>
              {getNewStock() <= item.minStock && (
                <div className="warning-message">
                  ⚠️ Warning: Stock will be at or below minimum level
                </div>
              )}
              {operation === 'subtract' && parseFloat(quantity) > item.currentStock && (
                <div className="error-message">
                  ❌ Error: Cannot remove more stock than available
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || (operation === 'subtract' && parseFloat(quantity) > item.currentStock)}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Save size={16} />
                  Update Stock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockUpdateModal;
