import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import InventoryModal from './InventoryModal';
import StockUpdateModal from './StockUpdateModal';
import StockInModal from './StockInModal'; // <-- Import StockInModal
import './Inventory.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false); // <-- NEW STATE
  const [selectedItem, setSelectedItem] = useState(null);
  const { hasPermission } = useAuth();
  const { socket } = useSocket();

  const categories = ['tea-leaves', 'milk', 'sugar', 'spices', 'snacks', 'cups', 'others'];

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [inventoryItems, searchTerm, categoryFilter, stockFilter]);

  useEffect(() => {
    if (socket) {
      socket.on('low-stock-alert', () => {
        fetchInventoryItems();
      });
      return () => {
        socket.off('low-stock-alert');
      };
    }
  }, [socket]);

  const fetchInventoryItems = async () => {
    try {
      const response = await axios.get(`${API_BASE}/inventory`);
      setInventoryItems(response.data);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = inventoryItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (stockFilter === 'low') {
      filtered = filtered.filter(item => item.currentStock <= item.minStock);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(item => item.currentStock === 0);
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleUpdateStock = (item) => {
    setSelectedItem(item);
    setShowStockModal(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await axios.delete(`${API_BASE}/inventory/${itemId}`);
        fetchInventoryItems();
      } catch (error) {
        console.error('Error deleting inventory item:', error);
      }
    }
  };

  const getStockStatus = (item) => {
    if (item.currentStock === 0) return 'out';
    if (item.currentStock <= item.minStock) return 'low';
    if (item.maxStock && item.currentStock >= item.maxStock * 0.8) return 'high';
    return 'normal';
  };

  const getStockStatusColor = (status) => {
    const colors = {
      out: '#ef4444',
      low: '#f59e0b',
      normal: '#10b981',
      high: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  };

  const getStockStatusIcon = (status) => {
    const icons = {
      out: AlertTriangle,
      low: TrendingDown,
      normal: Package,
      high: TrendingUp
    };
    const Icon = icons[status] || Package;
    return <Icon size={16} />;
  };

  const calculateTotalValue = () => {
    return filteredItems.reduce((total, item) => 
      total + (item.currentStock * item.costPerUnit || 0), 0
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Inventory Management</h1>
          <p>Track stock levels, manage suppliers, and monitor inventory costs</p>
        </div>
        <div>
          {hasPermission('inventory', 'create') && (
            <>
              <button
                className="btn btn-secondary"
                style={{ marginRight: 10 }}
                onClick={() => setShowStockInModal(true)}
              >
                <Plus size={20} />
                Add Stock-In
              </button>
              <button className="btn btn-primary" onClick={handleAddItem}>
                <Plus size={20} />
                Add Inventory Item
              </button>
            </>
          )}
        </div>
      </div>

      <div className="inventory-filters">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Stock Levels</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="inventory-stats">
        <div className="stat-item">
          <span className="stat-value">{filteredItems.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredItems.filter(item => getStockStatus(item) === 'low').length}
          </span>
          <span className="stat-label">Low Stock</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredItems.filter(item => getStockStatus(item) === 'out').length}
          </span>
          <span className="stat-label">Out of Stock</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">Nrs {calculateTotalValue().toFixed(2)}</span>
          <span className="stat-label">Total Value</span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <Package size={64} />
          <h3>No inventory items found</h3>
          <p>
            {searchTerm || categoryFilter || stockFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first inventory item'
            }
          </p>
          {hasPermission('inventory', 'create') && !searchTerm && !categoryFilter && !stockFilter && (
            <button className="btn btn-primary" onClick={handleAddItem}>
              <Plus size={20} className="first-item" />
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="inventory-table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min/Max Stock</th>
                <th>Cost per Unit</th>
                <th>Total Value</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const status = getStockStatus(item);
                return (
                  <tr key={item._id} className={status === 'out' ? 'out-of-stock' : ''}>
                    <td>
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        {item.batchNumber && (
                          <div className="batch-number">Batch: {item.batchNumber}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {item.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td>
                      <div className="stock-info">
                        <div className="current-stock">
                          {item.currentStock} {item.unit}
                        </div>
                        {item.expiryDate && (
                          <div className="expiry-date">
                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="stock-limits">
                        <div>Min: {item.minStock} {item.unit}</div>
                        <div>Max: {item.maxStock} {item.unit}</div>
                      </div>
                    </td>
                    <td>
                      <div className="cost-info">
                        Nrs {item.costPerUnit.toFixed(2)} / {item.unit}
                      </div>
                    </td>
                    <td>
                      <div className="total-value">
                        Nrs {(item.currentStock * item.costPerUnit).toFixed(2)}
                      </div>
                    </td>
                    <td>
                      <div className="supplier-info">
                        <div className="supplier-name">{item.supplier?.name}</div>
                        <div className="supplier-contact">{item.supplier?.contactPerson}</div>
                      </div>
                    </td>
                    <td>
                      <div 
                        className="status-badge"
                        style={{ color: getStockStatusColor(status) }}
                      >
                        {getStockStatusIcon(status)}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </td>
                    <td>
                      <div className="inventory-actions">
                        {hasPermission('inventory', 'update') && (
                          <>
                            <button
                              className="action-btn stock-btn"
                              onClick={() => handleUpdateStock(item)}
                              title="Update stock"
                            >
                              <Package size={16} />
                            </button>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEditItem(item)}
                              title="Edit item"
                            >
                              <Edit size={16} />
                            </button>
                          </>
                        )}
                        {hasPermission('inventory', 'delete') && (
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDeleteItem(item._id)}
                            title="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <InventoryModal
          item={selectedItem}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchInventoryItems();
            setShowModal(false);
          }}
        />
      )}

      {showStockModal && (
        <StockUpdateModal
          item={selectedItem}
          onClose={() => setShowStockModal(false)}
          onSave={() => {
            fetchInventoryItems();
            setShowStockModal(false);
          }}
        />
      )}

      {/* Add StockInModal at the bottom */}
      {showStockInModal && (
        <StockInModal
          onClose={() => setShowStockInModal(false)}
          onSave={() => {
            fetchInventoryItems();
            setShowStockInModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
