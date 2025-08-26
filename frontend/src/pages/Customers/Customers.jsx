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
  const [statusFilter, setStatusFilter] = useState('');
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
  }, [customers, searchTerm, statusFilter, sortBy]);

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

    if (statusFilter) {
      filtered = filtered.filter(customer => 
        statusFilter === 'active' ? customer.isActive : !customer.isActive
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
    <div className="customers">
      <div className="customers-header">
        <div>
          <h1 className="customers-title">Customers</h1>
        </div>
        <button className="add-customer-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      <div className="customers-filters">
        <input
          type="text"
          placeholder="Search customers..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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

      <div className="customers-table">
        <div className="table-header">
          <h2 className="table-title">Customer List</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact</th>
              <th>Loyalty</th>
              <th>Spending</th>
              <th>Last Visit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer._id}>
                <td>
                  <div className="customer-name">{customer.name}</div>
                  {customer.email && (
                    <div className="customer-email">{customer.email}</div>
                  )}
                </td>
                <td>
                  <div className="customer-phone">{customer.phone}</div>
                  {customer.address?.street && (
                    <div className="text-muted">
                      {customer.address.street}, {customer.address.city}
                    </div>
                  )}
                </td>
                <td>
                  <div className="text-muted">{customer.loyaltyPoints} points</div>
                  <div className="text-subtle">{getLoyaltyTier(customer.loyaltyPoints)}</div>
                </td>
                <td>
                  <div className="text-muted">Nrs {(customer.totalSpent || 0).toFixed(2)}</div>
                  <div className="text-subtle">{customer.visitCount} visits</div>
                </td>
                <td>
                  <div className="text-muted">
                    {customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td>
                  <span className={`customer-status ${customer.isActive ? 'active' : 'inactive'}`}>
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="customer-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditCustomer(customer)}
                      title="Edit customer"
                    >
                      <Edit size={16} />
                    </button>
                    {hasPermission('customers', 'delete') && (
                      <button
                        className="action-btn delete"
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

      {filteredCustomers.length === 0 && (
        <div className="empty-state">
          <h3>No customers found</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Start by adding your first customer'
            }
          </p>
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