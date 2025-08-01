import React, { useState, useEffect } from 'react';
import { useAuth } from  '../../context/AuthContext';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Phone,
  Mail,
  MapPin,
  Calendar,
  UserCheck
} from 'lucide-react';
import StaffModal from './StaffModal';
import './Staff.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Staff = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const { hasPermission } = useAuth();

  const roles = ['admin', 'manager', 'staff', 'cashier', 'kitchen'];

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staffMembers, searchTerm, roleFilter, statusFilter]);

  const fetchStaffMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/staff`);
      setStaffMembers(response.data);
    } catch (error) {
      console.error('Error fetching staff members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = staffMembers;

    if (searchTerm) {
      filtered = filtered.filter(staff =>
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(staff => staff.role === roleFilter);
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(staff => staff.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(staff => !staff.isActive);
    }

    setFilteredStaff(filtered);
  };

  const handleAddStaff = () => {
    setSelectedStaff(null);
    setShowModal(true);
  };

  const handleEditStaff = (staff) => {
    setSelectedStaff(staff);
    setShowModal(true);
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to deactivate this staff member?')) {
      try {
        await axios.delete(`${API_BASE}/staff/${staffId}`);
        fetchStaffMembers();
      } catch (error) {
        console.error('Error deactivating staff member:', error);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedStaff(null);
  };

  const handleModalSave = () => {
    fetchStaffMembers();
    handleModalClose();
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#ef4444',
      manager: '#f59e0b',
      staff: '#3b82f6',
      cashier: '#10b981',
      kitchen: '#8b5cf6'
    };
    return colors[role] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="staff-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Staff Management</h1>
          <p>Manage your team members, roles, and permissions</p>
        </div>
        {hasPermission('staff', 'create') && (
          <button className="btn btn-primary" onClick={handleAddStaff}>
            <Plus size={20} />
            Add Staff Member
          </button>
        )}
      </div>

      <div className="staff-filters">
        <div className="search-bar">
          <div className="search-input-wrapper">
            
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="staff-stats">
        <div className="stat-item">
          <span className="stat-value">{filteredStaff.length}</span>
          <span className="stat-label">Total Staff</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{filteredStaff.filter(staff => staff.isActive).length}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{filteredStaff.filter(staff => !staff.isActive).length}</span>
          <span className="stat-label">Inactive</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{roles.length}</span>
          <span className="stat-label">Roles</span>
        </div>
      </div>

      {filteredStaff.length === 0 ? (
        <div className="empty-state">
          <UserCheck size={64} />
          <h3>No staff members found</h3>
          <p>
            {searchTerm || roleFilter || statusFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first staff member'
            }
          </p>
          {hasPermission('staff', 'create') && !searchTerm && !roleFilter && !statusFilter && (
            <button className="btn btn-primary" onClick={handleAddStaff}>
              <Plus size={20} />
              Add First Staff Member
            </button>
          )}
        </div>
      ) : (
        <div className="staff-grid">
          {filteredStaff.map(staff => (
            <div key={staff._id} className={`staff-card ${!staff.isActive ? 'inactive' : ''}`}>
              <div className="staff-card-header">
                <div 
                  className="staff-avatar"
                  style={{ background: getRoleColor(staff.role) }}
                >
                  {staff.name.charAt(0).toUpperCase()}
                </div>
                <div className="staff-info">
                  <h3 className="staff-name">{staff.name}</h3>
                  <p className="staff-role">{staff.role}</p>
                  <p className="staff-email">{staff.email}</p>
                </div>
              </div>

              <div className="staff-card-content">
                <div className="staff-details">
                  {staff.phone && (
                    <div className="detail-item">
                      <Phone size={16} />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <Mail size={16} />
                    <span>{staff.email}</span>
                  </div>

                  {staff.address && (
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{staff.address}</span>
                    </div>
                  )}

                  <div className="detail-item">
                    <Calendar size={16} />
                    <span>Joined {new Date(staff.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="detail-item">
                    <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {staff.permissions && staff.permissions.length > 0 && (
                    <div className="detail-item">
                      <span>Permissions:</span>
                      <div className="permissions-list">
                        {staff.permissions.map((perm, index) => (
                          <span key={index} className="permission-tag">
                            {perm.module}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="staff-card-actions">
  {hasPermission('staff', 'update') && (
    <button
      className="action-btn edit-btn"
      onClick={() => handleEditStaff(staff)}
      title="Edit staff member"
    >
      Edit
    </button>
  )}
  {hasPermission('staff', 'delete') && (
    <button
      className="action-btn delete-btn"
      onClick={() => handleDeleteStaff(staff._id)}
      title="Deactivate staff member"
    >
      Delete
    </button>
  )}
</div>

            </div>
          ))}
        </div>
      )}

      {showModal && (
        <StaffModal
          staff={selectedStaff}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default Staff;
