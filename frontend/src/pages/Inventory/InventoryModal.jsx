import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';
import './InventoryModal.css';

const API_BASE = import.meta.env.VITE_API_URL;

const InventoryModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'tea-leaves',
    currentStock: '',
    minStock: '',
    maxStock: '',
    unit: 'kg',
    costPerUnit: '',
    supplier: '',
    expiryDate: '',
    batchNumber: '',
    location: ''
  });
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'tea-leaves', label: 'Tea Leaves' },
    { value: 'milk', label: 'Milk' },
    { value: 'sugar', label: 'Sugar' },
    { value: 'spices', label: 'Spices' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'cups', label: 'Cups' },
    { value: 'others', label: 'Others' }
  ];

  const units = [
    { value: 'kg', label: 'Kilograms' },
    { value: 'g', label: 'Grams' },
    { value: 'l', label: 'Liters' },
    { value: 'ml', label: 'Milliliters' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'packets', label: 'Packets' },
    { value: 'bottles', label: 'bottles' }
    

  ];

  useEffect(() => {
    fetchSuppliers();
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || 'tea-leaves',
        currentStock: item.currentStock?.toString() || '',
        minStock: item.minStock?.toString() || '',
        maxStock: item.maxStock?.toString() || '',
        unit: item.unit || 'kg',
        costPerUnit: item.costPerUnit?.toString() || '',
        supplier: item.supplier?._id || '',
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
        batchNumber: item.batchNumber || '',
        location: item.location || ''
      });
    }
  }, [item]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/suppliers`);
      setSuppliers(response.data.filter(supplier => supplier.isActive));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

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
        currentStock: parseFloat(formData.currentStock),
        minStock: parseFloat(formData.minStock),
        maxStock: parseFloat(formData.maxStock),
        costPerUnit: parseFloat(formData.costPerUnit),
        expiryDate: formData.expiryDate || undefined
      };

      if (item) {
        await axios.put(`${API_BASE}/inventory/${item._id}`, submitData);
      } else {
        await axios.post(`${API_BASE}/inventory`, submitData);
      }

      onSave();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content inventory-modal">
        <div className="modal-header">
          <h2>{item ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Item Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="currentStock" className="form-label">Current Stock *</label>
              <input
                type="number"
                id="currentStock"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                className="form-input"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit" className="form-label">Unit *</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="form-select"
                required
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="minStock" className="form-label">Minimum Stock </label>
              <input
                type="number"
                id="minStock"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className="form-input"
                step="0.01"
                min="0"
                
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxStock" className="form-label">Maximum Stock </label>
              <input
                type="number"
                id="maxStock"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
                className="form-input"
                step="0.01"
                min="0"
                
              />
            </div>

            <div className="form-group">
              <label htmlFor="costPerUnit" className="form-label">Cost per Unit ($) *</label>
              <input
                type="number"
                id="costPerUnit"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleChange}
                className="form-input"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="supplier" className="form-label">Supplier *</label>
              <select
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate" className="form-label">Expiry Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="batchNumber" className="form-label">Batch Number</label>
              <input
                type="text"
                id="batchNumber"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">Storage Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Shelf A1, Cold Storage"
              />
            </div>
          </div>

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
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Save size={16} />
                  {item ? 'Update Item' : 'Add Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;
