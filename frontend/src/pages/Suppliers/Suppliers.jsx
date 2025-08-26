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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const { hasPermission } = useAuth();

  const categories = ['tea-leaves', 'milk', 'sugar', 'spices', 'snacks', 'cups', 'others'];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm, categoryFilter, statusFilter]);

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

    if (categoryFilter) {
      filtered = filtered.filter(supplier => supplier.category === categoryFilter);
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
    <div className="suppliers">
      <div className="suppliers-header">
        <div>
          <h1 className="suppliers-title">Suppliers</h1>
        </div>
        <button className="add-supplier-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Supplier
        </button>
      </div>

      <div className="suppliers-filters">
        <input
          type="text"
          placeholder="Search suppliers..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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

      <div className="suppliers-table">
        <div className="table-header">
          <h2 className="table-title">Supplier List</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Category</th>
              <th>Contact</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier._id}>
                <td>
                  <div className="supplier-name">{supplier.name}</div>
                  {supplier.company && (
                    <div className="supplier-company">{supplier.company}</div>
                  )}
                </td>
                <td>
                  <span className="supplier-category">{supplier.category}</span>
                </td>
                <td>
                  <div className="supplier-contact">
                    <div className="contact-phone">{supplier.phone}</div>
                    {supplier.email && (
                      <div className="contact-email">{supplier.email}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="supplier-products">
                    <div className="products-count">{supplier.products?.length || 0} products</div>
                    {supplier.products && supplier.products.length > 0 && (
                      <div className="products-list">
                        {supplier.products.slice(0, 2).map((product, index) => (
                          <span key={product._id || `product-${index}`} className="product-tag">
                            {typeof product === 'string' ? product : product.name || 'Unknown Product'}
                          </span>
                        ))}
                        {supplier.products.length > 2 && (
                          <span className="product-more">+{supplier.products.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`supplier-status ${supplier.isActive ? 'active' : 'inactive'}`}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="supplier-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditSupplier(supplier)}
                      title="Edit supplier"
                    >
                      <Edit size={16} />
                    </button>
                    {hasPermission('suppliers', 'delete') && (
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteSupplier(supplier._id)}
                        title="Deactivate supplier"
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

      {filteredSuppliers.length === 0 && (
        <div className="empty-state">
          <h3>No suppliers found</h3>
          <p>
            {searchTerm || categoryFilter || statusFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first supplier'
            }
          </p>
        </div>
      )}

      {showModal && (
        <SupplierModal
          supplier={selectedSupplier}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchSuppliers();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Suppliers;
