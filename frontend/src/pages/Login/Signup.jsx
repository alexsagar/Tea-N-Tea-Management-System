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
        <div className="signup-header">
          <div className="logo">
            <span className="logo-icon">🍵</span>
            <h1>Tea Shop Management</h1>
          </div>
          <p className="signup-subtitle">Create your tea shop account</p>
        </div>

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
            <label htmlFor="shopName" className="form-label">Shop Name</label>
            <input
              type="text"
              id="shopName"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your shop name"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Shop Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter shop address (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ownerName" className="form-label">Owner Name</label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter owner's full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ownerEmail" className="form-label">Owner Email</label>
            <input
              type="email"
              id="ownerEmail"
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter owner's email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ownerPassword" className="form-label">Owner Password</label>
            <input
              type="password"
              id="ownerPassword"
              name="ownerPassword"
              value={formData.ownerPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Create a secure password"
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
