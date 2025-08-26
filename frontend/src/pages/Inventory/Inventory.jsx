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
  const [showStockUpdateModal, setShowStockUpdateModal] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
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
    setShowStockUpdateModal(true);
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
    <div className="inventory">
      <div className="inventory-header">
        <div>
          <h1 className="inventory-title">Inventory</h1>
        </div>
        <div className="inventory-actions">
          <button className="add-item-btn" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            Add Item
          </button>
          <button className="stock-in-btn" onClick={() => setShowStockInModal(true)}>
            <Package size={16} />
            Stock In
          </button>
        </div>
      </div>

      <div className="inventory-filters">
        <input
          type="text"
          placeholder="Search inventory items..."
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
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="">All Stock Levels</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
          <option value="normal">Normal Stock</option>
        </select>
      </div>

      <div className="inventory-table">
        <div className="table-header">
          <h2 className="table-title">Inventory Items</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Stock Level</th>
              <th>Unit Cost</th>
              <th>Total Value</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item._id}>
                <td>
                  <div className="item-name">{item.name}</div>
                  {item.description && (
                    <div className="item-description">{item.description}</div>
                  )}
                </td>
                <td>
                  <span className="item-category">{item.category}</span>
                </td>
                <td>
                  <div className="stock-level">
                    <span className={`stock-badge ${getStockStatus(item)}`}>
                      {item.currentStock} {item.unit}
                    </span>
                    {item.currentStock <= item.reorderPoint && (
                      <span className="low-stock-warning">Low Stock</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="unit-cost">Nrs {(item.unitCost || 0).toFixed(2)}</div>
                </td>
                <td>
                  <div className="total-value">Nrs {((item.currentStock || 0) * (item.unitCost || 0)).toFixed(2)}</div>
                </td>
                <td>
                  <div className="last-updated">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <div className="item-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditItem(item)}
                      title="Edit item"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleUpdateStock(item)}
                      title="Update stock"
                    >
                      <Package size={16} />
                    </button>
                    {hasPermission('inventory', 'delete') && (
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteItem(item._id)}
                        title="Delete item"
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

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <h3>No inventory items found</h3>
          <p>
            {searchTerm || categoryFilter || stockFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first inventory item'
            }
          </p>
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

      {showStockInModal && (
        <StockInModal
          onClose={() => setShowStockInModal(false)}
          onSave={() => {
            fetchInventoryItems();
            setShowStockInModal(false);
          }}
        />
      )}

      {showStockUpdateModal && (
        <StockUpdateModal
          item={selectedItem}
          onClose={() => setShowStockUpdateModal(false)}
          onSave={() => {
            fetchInventoryItems();
            setShowStockUpdateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Inventory;
