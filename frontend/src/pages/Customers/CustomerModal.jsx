import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Plus, Minus } from 'lucide-react';
import './CustomerModal.css';

const API_BASE = import.meta.env.VITE_API_URL;

const CustomerModal = ({ customer, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    preferences: {
      dietaryRestrictions: [],
      notes: ''
    },
    isActive: true
  });
  const [loyaltyPoints, setLoyaltyPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dietaryOptions = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Sugar-Free',
    'Nut-Free'
  ];

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: {
          street: customer.address?.street || '',
          city: customer.address?.city || '',
          state: customer.address?.state || '',
          zipCode: customer.address?.zipCode || ''
        },
        preferences: {
          dietaryRestrictions: customer.preferences?.dietaryRestrictions || [],
          notes: customer.preferences?.notes || ''
        },
        isActive: customer.isActive !== undefined ? customer.isActive : true
      });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('preferences.')) {
      const prefField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleDietaryRestrictionChange = (restriction, checked) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        dietaryRestrictions: checked
          ? [...prev.preferences.dietaryRestrictions, restriction]
          : prev.preferences.dietaryRestrictions.filter(r => r !== restriction)
      }
    }));
  };

const handleLoyaltyPointsUpdate = async (operation) => {
  if (!loyaltyPoints || !customer) return;
  
  try {
    await axios.patch(`${API_BASE}/customers/${customer._id}/loyalty`, {
      points: parseInt(loyaltyPoints),
      operation
    });

    // Fetch updated customer data after points update
    const res = await axios.get(`${API_BASE}/customers/${customer._id}`);
    setFormData({
      ...formData,
      ...res.data.customer, // adapt if your API returns differently
    });

    setLoyaltyPoints('');
  } catch (error) {
    setError('Error updating loyalty points');
  }
};
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    if (customer) {
      await axios.put(`${API_BASE}/customers/${customer._id}`, formData);
    } else {
      await axios.post(`${API_BASE}/customers`, formData);
    }

    onSave();
  } catch (error) {
    setError(error.response?.data?.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};

  const getLoyaltyTier = (points) => {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    if (points >= 100) return 'Bronze';
    return 'Basic';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content customer-modal">
        <div className="modal-header">
          <h2>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
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
              <label htmlFor="name" className="form-label">Full Name *</label>
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
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
                Active Customer
              </label>
            </div>
          </div>

          <div className="address-section">
            <h3>Address Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="street" className="form-label">Street Address</label>
                <input
                  type="text"
                  id="street"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city" className="form-label">City</label>
                <input
                  type="text"
                  id="city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="state" className="form-label">State</label>
                <input
                  type="text"
                  id="state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="zipCode" className="form-label">ZIP Code</label>
                <input
                  type="text"
                  id="zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="preferences-section">
            <h3>Preferences</h3>
            
            <div className="form-group">
              <label className="form-label">Dietary Restrictions</label>
              <div className="dietary-restrictions">
                {dietaryOptions.map(option => (
                  <label key={option} className="dietary-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.preferences.dietaryRestrictions.includes(option)}
                      onChange={(e) => handleDietaryRestrictionChange(option, e.target.checked)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                id="notes"
                name="preferences.notes"
                value={formData.preferences.notes}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
                placeholder="Any special notes about the customer..."
              />
            </div>
          </div>

          {customer && (
            <div className="loyalty-section">
              <h3>Loyalty Information</h3>
              
              <div className="loyalty-stats">
                <div className="loyalty-stat">
                  <div className="value">{customer.loyaltyPoints}</div>
                  <div className="label">Points</div>
                </div>
                <div className="loyalty-stat">
                  <div className="value">{getLoyaltyTier(customer.loyaltyPoints)}</div>
                  <div className="label">Tier</div>
                </div>
                <div className="loyalty-stat">
                  <div className="value">{customer.visitCount}</div>
                  <div className="label">Visits</div>
                </div>
              </div>

              <div className="loyalty-actions">
                <input
                  type="number"
                  value={loyaltyPoints}
                  onChange={(e) => setLoyaltyPoints(e.target.value)}
                  placeholder="Points to add/subtract"
                  className="loyalty-input"
                  min="1"
                />
                <button
                  type="button"
                  className="loyalty-btn add"
                  onClick={() => handleLoyaltyPointsUpdate('add')}
                  disabled={!loyaltyPoints}
                >
                  <Plus size={16} />
                  Add
                </button>
                <button
                  type="button"
                  className="loyalty-btn subtract"
                  onClick={() => handleLoyaltyPointsUpdate('subtract')}
                  disabled={!loyaltyPoints}
                >
                  <Minus size={16} />
                  Subtract
                </button>
              </div>
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
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Save size={16} />
                  {customer ? 'Update Customer' : 'Add Customer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;