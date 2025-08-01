import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Plus } from 'lucide-react';
import './SupplierModal.css';

const API_BASE = import.meta.env.VITE_API_URL;

const SupplierModal = ({ supplier, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    paymentTerms: '30-days',
    rating: 3,
    products: [],
    isActive: true
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    pricePerUnit: '',
    unit: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const paymentTermsOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: '15-days', label: '15 Days' },
    { value: '30-days', label: '30 Days' },
    { value: '45-days', label: '45 Days' }
  ];

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: {
          street: supplier.address?.street || '',
          city: supplier.address?.city || '',
          state: supplier.address?.state || '',
          zipCode: supplier.address?.zipCode || '',
          country: supplier.address?.country || ''
        },
        paymentTerms: supplier.paymentTerms || '30-days',
        rating: supplier.rating || 3,
        products: supplier.products || [],
        isActive: supplier.isActive !== undefined ? supplier.isActive : true
      });
    }
  }, [supplier]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleRatingChange = (e) => {
    setFormData(prev => ({
      ...prev,
      rating: parseInt(e.target.value, 10)
    }));
  };

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProduct = () => {
    const { name, category, pricePerUnit, unit } = newProduct;
    if (name && category && pricePerUnit && unit) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, { name, category, pricePerUnit: parseFloat(pricePerUnit), unit }]
      }));
      setNewProduct({ name: '', category: '', pricePerUnit: '', unit: '' });
    }
  };

  const handleRemoveProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (supplier) {
        await axios.put(`${API_BASE}/suppliers/${supplier._id}`, formData);
      } else {
        await axios.post(`${API_BASE}/suppliers`, formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < rating ? '' : 'empty'}`}>★</span>
    ));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content supplier-modal">
        <div className="modal-header">
          <h2>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-grid">
            {/* ... Company, Contact, Email, Phone ... */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">Company Name *</label>
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
              <label htmlFor="contactPerson" className="form-label">Contact Person *</label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="paymentTerms" className="form-label">Payment Terms *</label>
              <select
                id="paymentTerms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
                className="form-select"
                required
              >
                {paymentTermsOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active Supplier
              </label>
            </div>
          </div>

          <div className="address-section">
            <h3>Address Information</h3>
            <div className="form-grid">
              {['street', 'city', 'state', 'zipCode', 'country'].map(field => (
                <div key={field} className="form-group">
                  <label htmlFor={field} className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    type="text"
                    id={field}
                    name={`address.${field}`}
                    value={formData.address[field]}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rating-section">
            <h3>Supplier Rating</h3>
            <div className="rating-input">
              <input
                type="range"
                min="1"
                max="5"
                value={formData.rating}
                onChange={handleRatingChange}
                className="rating-slider"
              />
              <div className="rating-display">
                <div className="stars">{renderStars(formData.rating)}</div>
                <span className="rating-value">{formData.rating}/5</span>
              </div>
            </div>
          </div>

          <div className="products-section">
            <h3>Products & Services</h3>
            <div className="products-list">
              {formData.products.map((product, index) => (
                <div key={index} className="product-item">
                  <div className="product-info">
                    <div className="product-name">{product.name}</div>
                    <div className="product-category">{product.category}</div>
                  </div>
                  <div className="product-price">
                    Nrs{product.pricePerUnit.toFixed(2)}/{product.unit}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(index)}
                    className="remove-product-btn"
                    title="Remove product"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Updated add product grid */}
            <div className="add-product-grid">
              <input
                type="text"
                placeholder="Product name"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
              />
              <input
                type="text"
                placeholder="Category"
                name="category"
                value={newProduct.category}
                onChange={handleNewProductChange}
              />
              <input
                type="number"
                placeholder="Price"
                name="pricePerUnit"
                value={newProduct.pricePerUnit}
                onChange={handleNewProductChange}
                step="0.01"
              />
              <input
                type="text"
                placeholder="Unit"
                name="unit"
                value={newProduct.unit}
                onChange={handleNewProductChange}
              />
              <button
                type="button"
                onClick={handleAddProduct}
                className="add-product-btn"
                title="Add product"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
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
                  {supplier ? 'Update Supplier' : 'Add Supplier'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
