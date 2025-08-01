import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Users
} from 'lucide-react';
import CustomerModal from './CustomerModal';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { hasPermission } = useAuth();

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, sortBy]);

const fetchCustomers = async () => {
  try {
    const response = await axios.get(`${API_BASE}/customers`);
    setCustomers(response.data);
  } catch (error) {
    console.error('Error fetching customers:', error);
  } finally {
    setLoading(false);
  }
};

  const filterCustomers = () => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'loyaltyPoints':
          return b.loyaltyPoints - a.loyaltyPoints;
        case 'visitCount':
          return b.visitCount - a.visitCount;
        case 'lastVisit':
          return new Date(b.lastVisit) - new Date(a.lastVisit);
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setShowModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowModal(true);
  };

 const handleDeleteCustomer = async (customerId) => {
  if (window.confirm('Are you sure you want to deactivate this customer?')) {
    try {
      await axios.delete(`${API_BASE}/customers/${customerId}`);
      fetchCustomers();
    } catch (error) {
      console.error('Error deactivating customer:', error);
    }
  }
};

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const handleModalSave = () => {
    fetchCustomers();
    handleModalClose();
  };

  const getLoyaltyTier = (points) => {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    if (points >= 100) return 'Bronze';
    return 'Basic';
  };

  const calculateStats = () => {
    const totalCustomers = filteredCustomers.length;
    const activeCustomers = filteredCustomers.filter(c => c.isActive).length;
    const totalSpent = filteredCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalLoyaltyPoints = filteredCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

    return { totalCustomers, activeCustomers, totalSpent, totalLoyaltyPoints };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Customer Management</h1>
          <p>Manage customer information, loyalty points, and purchase history</p>
        </div>
        {hasPermission('customers', 'create') && (
          <button className="btn btn-primary" onClick={handleAddCustomer}>
            <Plus size={20} />
            Add Customer
          </button>
        )}
      </div>

      <div className="customers-filters">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Sort by Name</option>
              <option value="totalSpent">Sort by Total Spent</option>
              <option value="loyaltyPoints">Sort by Loyalty Points</option>
              <option value="visitCount">Sort by Visit Count</option>
              <option value="lastVisit">Sort by Last Visit</option>
            </select>
          </div>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.totalCustomers}</span>
          <span className="stat-label">Total Customers</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.activeCustomers}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">${stats.totalSpent.toFixed(2)}</span>
          <span className="stat-label">Total Spent</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.totalLoyaltyPoints}</span>
          <span className="stat-label">Loyalty Points</span>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="empty-state">
          <Users size={64} />
          <h3>No customers found</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Start by adding your first customer'
            }
          </p>
          {hasPermission('customers', 'create') && !searchTerm && (
            <button className="btn btn-primary" onClick={handleAddCustomer}>
              <Plus size={20} className="first-customer" />
              Add First Customer
            </button>
          )}
        </div>
      ) : (
        <div className="customers-table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Loyalty Points</th>
                <th>Total Spent</th>
                <th>Last Visit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer._id}>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="customer-details">
                        <div className="customer-name">{customer.name}</div>
                        {customer.email && (
                          <div className="customer-email">{customer.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="phone-number">{customer.phone}</div>
                      {customer.address?.street && (
                        <div className="address">
                          {customer.address.street}, {customer.address.city}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="loyalty-info">
                      <div className="loyalty-points">{customer.loyaltyPoints}</div>
                      <div className="loyalty-tier">{getLoyaltyTier(customer.loyaltyPoints)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="spending-info">
                      <div className="total-spent">${customer.totalSpent.toFixed(2)}</div>
                      <div className="visit-count">{customer.visitCount} visits</div>
                    </div>
                  </td>
                 <td>
  <div className="last-visit">
    {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '-'}
  </div>
</td>
                  <td>
                    <span className={`status-badge ${customer.isActive ? 'active' : 'inactive'}`}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="customer-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleEditCustomer(customer)}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      {hasPermission('customers', 'update') && (
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditCustomer(customer)}
                          title="Edit customer"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {hasPermission('customers', 'delete') && (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteCustomer(customer._id)}
                          title="Deactivate customer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default Customers;