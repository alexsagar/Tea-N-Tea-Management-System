import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';
import './StaffModal.css';

const API_BASE = import.meta.env.VITE_API_URL;

const StaffModal = ({ staff, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    phone: '',
    address: '',
    isActive: true,
    permissions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'kitchen', label: 'Kitchen Staff' }
  ];

  const modules = [
    { name: 'menu', label: 'Menu Management', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'orders', label: 'Order Management', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'inventory', label: 'Inventory Management', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'staff', label: 'Staff Management', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'customers', label: 'Customer Management', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'tables', label: 'Table Management', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'suppliers', label: 'Supplier Management', actions: ['create', 'read', 'update', 'delete'] },
    { name: 'reports', label: 'Reports', actions: ['read'] },
    { name: 'settings', label: 'Settings', actions: ['read', 'update'] }
  ];

  useEffect(() => {
    if (staff) {
      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        password: '',
        role: staff.role || 'staff',
        phone: staff.phone || '',
        address: staff.address || '',
        isActive: staff.isActive !== undefined ? staff.isActive : true,
        permissions: staff.permissions || []
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePermissionChange = (module, action, checked) => {
    setFormData(prev => {
      const permissions = [...prev.permissions];
      const moduleIndex = permissions.findIndex(p => p.module === module);

      if (moduleIndex >= 0) {
        if (checked) {
          if (!permissions[moduleIndex].actions.includes(action)) {
            permissions[moduleIndex].actions.push(action);
          }
        } else {
          permissions[moduleIndex].actions = permissions[moduleIndex].actions.filter(a => a !== action);
          if (permissions[moduleIndex].actions.length === 0) {
            permissions.splice(moduleIndex, 1);
          }
        }
      } else if (checked) {
        permissions.push({ module, actions: [action] });
      }

      return { ...prev, permissions };
    });
  };

  const hasPermission = (module, action) => {
    const modulePermission = formData.permissions.find(p => p.module === module);
    return modulePermission ? modulePermission.actions.includes(action) : false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = { ...formData };
      if (!submitData.password && staff) {
        delete submitData.password; // Skip password update if empty when editing
      }

      if (staff) {
        await axios.put(`${API_BASE}/staff/${staff._id}`, submitData);
      } else {
        await axios.post(`${API_BASE}/staff`, submitData);
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
      <div className="modal-content staff-modal">
        <div className="modal-header">
          <h2>{staff ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

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
              <label htmlFor="password" className="form-label">
                Password {staff ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                required={!staff}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
                required
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
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
                Active Staff Member
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
            />
          </div>

          {formData.role !== 'admin' && (
            <div className="permissions-section">
              <h3>Permissions</h3>
              <div className="permissions-grid">
                {modules.map(module => (
                  <div key={module.name} className="permission-group">
                    <h4>{module.label}</h4>
                    <div className="permission-actions">
                      {module.actions.map(action => (
                        <label key={action} className="permission-checkbox">
                          <input
                            type="checkbox"
                            checked={hasPermission(module.name, action)}
                            onChange={(e) => handlePermissionChange(module.name, action, e.target.checked)}
                          />
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  {staff ? 'Update Staff Member' : 'Add Staff Member'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
