import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
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
  DollarSign,
  Truck
} from 'lucide-react';
import SupplierModal from './SupplierModal';
import './Suppliers.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const { hasPermission } = useAuth();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, statusFilter]);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_BASE}/suppliers`);
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    let filtered = suppliers;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(lowerTerm) ||
        supplier.contactPerson.toLowerCase().includes(lowerTerm) ||
        supplier.email.toLowerCase().includes(lowerTerm)
      );
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(supplier => supplier.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(supplier => !supplier.isActive);
    }

    setFilteredSuppliers(filtered);
  };

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

const handleDeleteSupplier = async (supplierId) => {
  if (window.confirm("Are you sure you want to permanently delete this supplier? This cannot be undone.")) {
    try {
      await axios.delete(`${API_BASE}/suppliers/${supplierId}`);
      // Remove from UI without refresh
      setSuppliers(prev => prev.filter(s => s._id !== supplierId));
      // Or re-fetch your suppliers
      // fetchSuppliers();
    } catch (error) {
      alert("Failed to delete supplier.");
      console.error(error);
    }
  }
};


  const handleModalClose = () => {
    setShowModal(false);
    setSelectedSupplier(null);
  };

  const handleModalSave = () => {
    fetchSuppliers();
    handleModalClose();
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={`star ${i < rating ? '' : 'empty'}`}>★</span>
    ));
  };

  const calculateStats = () => {
    const totalSuppliers = filteredSuppliers.length;
    const activeSuppliers = filteredSuppliers.filter(s => s.isActive).length;
    const totalOrders = filteredSuppliers.reduce((sum, s) => sum + (s.totalOrders || 0), 0);
    const totalAmount = filteredSuppliers.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

    return { totalSuppliers, activeSuppliers, totalOrders, totalAmount };
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
    <div className="suppliers-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Supplier Management</h1>
          <p>Manage your suppliers, contacts, and procurement relationships</p>
        </div>
        {hasPermission('suppliers', 'create') && (
          <button className="btn btn-primary" onClick={handleAddSupplier}>
            <Plus size={20} />
            Add Supplier
          </button>
        )}
      </div>

      <div className="suppliers-filters">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="suppliers-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.totalSuppliers}</span>
          <span className="stat-label">Total Suppliers</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.activeSuppliers}</span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.totalOrders}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">Nrs{stats.totalAmount.toFixed(2)}</span>
          <span className="stat-label">Total Amount</span>
        </div>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="empty-state">
          <Truck size={64} />
          <h3>No suppliers found</h3>
          <p>
            {searchTerm || statusFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first supplier'
            }
          </p>
          {hasPermission('suppliers', 'create') && !searchTerm && !statusFilter && (
            <button className="btn btn-primary" onClick={handleAddSupplier}>
              <Plus size={20} className="first-supp" />
              Add First Supplier
            </button>
          )}
        </div>
      ) : (
        <div className="suppliers-grid">
  {filteredSuppliers.map(supplier => (
    <div key={supplier._id} className={`supplier-card ${!supplier.isActive ? 'inactive' : ''}`}>
      <div className="supplier-card-header">
        <div className="supplier-info">
          <h3 className="supplier-name">{supplier.name}</h3>
          <p className="contact-person">{supplier.contactPerson}</p>
          <div className="rating-display">
            <div className="stars">{renderStars(supplier.rating)}</div>
            <span className="rating-value">({supplier.rating}/5)</span>
          </div>
        </div>
        <span className={`status-badge ${supplier.isActive ? 'active' : 'inactive'}`}>
          {supplier.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="supplier-card-content">
        <div className="supplier-details">
          <div className="detail-item">
            <Phone size={16} />
            <span>{supplier.phone}</span>
          </div>
          <div className="detail-item">
            <Mail size={16} />
            <span>{supplier.email}</span>
          </div>
          {supplier.address && (
            <div className="detail-item">
              <MapPin size={16} />
              <span>{supplier.address.city}, {supplier.address.state}</span>
            </div>
          )}
          <div className="detail-item">
            <DollarSign size={16} />
            <span className="payment-terms">{supplier.paymentTerms}</span>
          </div>
          {supplier.lastOrder && (
            <div className="detail-item">
              <Calendar size={16} />
              <span>Last order: {new Date(supplier.lastOrder).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="supplier-stats">
          <div className="stat-group">
            <div className="stat-number">{supplier.totalOrders || 0}</div>
            <div className="stat-text">Orders</div>
          </div>
          <div className="stat-group">
            <div className="stat-number">Nrs{(supplier.totalAmount || 0).toFixed(0)}</div>
            <div className="stat-text">Total</div>
          </div>
          <div className="stat-group">
            <div className="stat-number">{supplier.products?.length || 0}</div>
            <div className="stat-text">Products</div>
          </div>
        </div>

        {/* === PRODUCTS LIST START === */}
        {supplier.products && supplier.products.length > 0 && (
          <div className="supplier-products-list">
            <div className="products-title"><b>Products & Services</b></div>
            <ul>
              {supplier.products.map((product, idx) => (
                <li key={idx}>
                  <span className="product-name">{product.name}</span>
                  {' '}
                  <span className="product-category">({product.category})</span>
                  {' — '}
                  <span className="product-price">
                    Nrs{Number(product.pricePerUnit).toFixed(2)} / {product.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* === PRODUCTS LIST END === */}
      </div>

      <div className="supplier-card-actions">
        {hasPermission('suppliers', 'update') && (
          <button
            className="action-btn edit-btn"
            onClick={() => handleEditSupplier(supplier)}
            title="Edit supplier"
          >
            <Edit size={16} />
          </button>
        )}
        {hasPermission('suppliers', 'delete') && (
          <button
            className="action-btn delete-btn"
            onClick={() => handleDeleteSupplier(supplier._id)}
            title="Deactivate supplier"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  ))}
</div>

      )}

      {showModal && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default Suppliers;
