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

  const handlePermanentDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to permanently delete this inactive staff member? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE}/staff/${staffId}/permanent`);
        
        // Remove the staff member from local state
        setStaffMembers(prev => prev.filter(staff => staff._id !== staffId));
        
        // Show success message
        console.log('Staff member permanently deleted');
      } catch (error) {
        console.error('Error permanently deleting staff member:', error);
        alert('Failed to delete staff member. Please try again.');
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
    <div className="staff">
      <div className="staff-header">
        <div>
          <h1 className="staff-title">Staff Management</h1>
        </div>
        <button className="add-staff-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Staff Member
        </button>
      </div>

      <div className="staff-filters">
        <input
          type="text"
          placeholder="Search staff members..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role} value={role}>
              {role.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="staff-table">
        <div className="table-header">
          <h2 className="table-title">Staff Members</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Role</th>
              <th>Contact</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(staff => (
              <tr key={staff._id}>
                <td>
                  <div className="staff-name">{staff.name}</div>
                  <div className="staff-id">ID: {staff.employeeId}</div>
                </td>
                <td>
                  <span className="staff-role">{staff.role}</span>
                </td>
                <td>
                  <div className="staff-contact">
                    <div className="contact-phone">{staff.phone}</div>
                    {staff.email && (
                      <div className="contact-email">{staff.email}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="staff-schedule">
                    <div className="schedule-days">{staff.workDays?.join(', ') || 'Not set'}</div>
                    <div className="schedule-hours">{staff.workHours || 'Not set'}</div>
                  </div>
                </td>
                <td>
                  <span className={`staff-status ${staff.isActive ? 'active' : 'inactive'}`}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="staff-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditStaff(staff)}
                      title="Edit staff member"
                    >
                      <Edit size={16} />
                    </button>
                    {hasPermission('staff', 'delete') && (
                      staff.isActive ? (
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteStaff(staff._id)}
                          title="Deactivate staff member"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          className="action-btn delete permanent"
                          onClick={() => handlePermanentDelete(staff._id)}
                          title="Permanently delete staff member"
                        >
                          <Trash2 size={16} />
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStaff.length === 0 && (
        <div className="empty-state">
          <h3>No staff members found</h3>
          <p>
            {searchTerm || roleFilter || statusFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first staff member'
            }
          </p>
        </div>
      )}

      {showModal && (
        <StaffModal
          staff={selectedStaff}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchStaffMembers();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Staff;
