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

  const handleOverlayClick = (e) => {
    console.log('Overlay clicked:', e.target, e.currentTarget);
    // Only close if clicking directly on the overlay
    if (e.target === e.currentTarget) {
      console.log('Closing modal via overlay click');
      onClose();
    }
  };

  const handleModalContentClick = (e) => {
    console.log('Modal content clicked, stopping propagation');
    // Prevent clicks on modal content from bubbling to overlay
    e.stopPropagation();
  };

  return (
    <div className="inventory-modal-overlay" onClick={handleOverlayClick}>
      <div className="inventory-modal-content" onClick={handleModalContentClick}>
        <div className="inventory-modal-header">
          <h2>{item ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
          <button className="inventory-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="inventory-modal-form">
          {error && (
            <div className="inventory-error-message">
              {error}
            </div>
          )}

          <div className="inventory-form-row">
            <div className="inventory-form-group">
              <label htmlFor="name" className="inventory-form-label">Item Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="inventory-form-input"
                required
              />
            </div>

            <div className="inventory-form-group">
              <label htmlFor="category" className="inventory-form-label">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="inventory-form-select"
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="inventory-form-group">
              <label htmlFor="currentStock" className="inventory-form-label">Current Stock *</label>
              <input
                type="number"
                id="currentStock"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleChange}
                className="inventory-form-input"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="inventory-form-group">
              <label htmlFor="unit" className="inventory-form-label">Unit *</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="inventory-form-select"
                required
              >
                {units.map(unit => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="inventory-form-group">
              <label htmlFor="minStock" className="inventory-form-label">Minimum Stock</label>
              <input
                type="number"
                id="minStock"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className="inventory-form-input"
                step="0.01"
                min="0"
              />
            </div>

            <div className="inventory-form-group">
              <label htmlFor="maxStock" className="inventory-form-label">Maximum Stock</label>
              <input
                type="number"
                id="maxStock"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
                className="inventory-form-input"
                step="0.01"
                min="0"
              />
            </div>

            <div className="inventory-form-group">
              <label htmlFor="costPerUnit" className="inventory-form-label">Cost per Unit (Nrs) *</label>
              <input
                type="number"
                id="costPerUnit"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleChange}
                className="inventory-form-input"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="inventory-form-group">
              <label htmlFor="supplier" className="inventory-form-label">Supplier *</label>
              <select
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="inventory-form-select"
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

            <div className="inventory-form-group">
              <label htmlFor="expiryDate" className="inventory-form-label">Expiry Date</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="inventory-form-input"
              />
            </div>

            <div className="inventory-form-group">
              <label htmlFor="batchNumber" className="inventory-form-label">Batch Number</label>
              <input
                type="text"
                id="batchNumber"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                className="inventory-form-input"
              />
            </div>

            <div className="inventory-form-group">
              <label htmlFor="location" className="inventory-form-label">Storage Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="inventory-form-input"
                placeholder="e.g., Shelf A1, Cold Storage"
              />
            </div>
          </div>

          <div className="inventory-modal-actions">
            <button
              type="button"
              className="inventory-modal-btn inventory-modal-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inventory-modal-btn inventory-modal-btn-primary"
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
