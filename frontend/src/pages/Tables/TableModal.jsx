import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';
import './TableModal.css';

const API_BASE = import.meta.env.VITE_API_URL;

const TableModal = ({ table, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    number: '',
    capacity: '',
    location: 'indoor',
    status: 'available'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const locations = [
    { value: 'indoor', label: 'Indoor' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'private', label: 'Private Room' }
  ];

  const statuses = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'reserved', label: 'Reserved' },
    { value: 'maintenance', label: 'Maintenance' }
  ];

  useEffect(() => {
    if (table) {
      setFormData({
        number: table.number || '',
        capacity: table.capacity?.toString() || '',
        location: table.location || 'indoor',
        status: table.status || 'available'
      });
    }
  }, [table]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        capacity: parseInt(formData.capacity, 10)
      };

      if (table) {
        await axios.put(`${API_BASE}/tables/${table._id}`, submitData);
      } else {
        await axios.post(`${API_BASE}/tables`, submitData);
      }

      onSave();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="table-modal-overlay" onClick={handleOverlayClick}>
      <div className="table-modal-content" onClick={handleModalContentClick}>
        <div className="table-modal-header">
          <h2>{table ? 'Edit Table' : 'Add New Table'}</h2>
          <button className="table-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="table-modal-form">
          {error && (
            <div className="table-error-message" role="alert">
              {error}
            </div>
          )}

          <div className="table-form-row">
            <div className="table-form-group">
              <label htmlFor="number" className="table-form-label">Table Number *</label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                className="table-form-input"
                required
                autoComplete="off"
              />
            </div>

            <div className="table-form-group">
              <label htmlFor="capacity" className="table-form-label">Capacity *</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="table-form-input"
                min="1"
                required
              />
            </div>

            <div className="table-form-group">
              <label htmlFor="location" className="table-form-label">Location *</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="table-form-select"
                required
              >
                {locations.map(loc => (
                  <option key={loc.value} value={loc.value}>
                    {loc.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="table-form-group">
              <label htmlFor="status" className="table-form-label">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="table-form-select"
                required
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="table-modal-btn table-modal-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="table-modal-btn table-modal-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner" aria-label="Loading"></div>
              ) : (
                <>
                  <Save size={16} />
                  {table ? 'Update Table' : 'Add Table'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableModal;
