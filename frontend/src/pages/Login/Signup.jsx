import React, { useState } from 'react';
import axios from 'axios';
import "./Signup.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SignupShop = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [shopId, setShopId] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post(`${API_URL}/auth/signup-shop`, formData);
      setShopId(res.data.shopId);
      setSuccess('Shop created successfully! Please save your Shop ID for login.');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Your Tea Shop</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              {success}
              {shopId && (
                <div className="shopid-info">
                  <strong>Your Shop ID:</strong> <span>{shopId}</span>
                  <div>Use this Shop ID for admin login.</div>
                </div>
              )}
            </div>
          )}

          <div className="form-group">
            <label>Shop Name</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Shop Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className="form-group">
            <label>Owner Name</label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Owner Email</label>
            <input
              type="email"
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Owner Password</label>
            <input
              type="password"
              name="ownerPassword"
              value={formData.ownerPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Creating Shop...' : 'Create Shop'}
          </button>
        </form>
        <div className="signup-footer">
          <p>
            Already have a shop? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupShop;
