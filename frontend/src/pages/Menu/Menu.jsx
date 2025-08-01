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
  EyeOff,
  Coffee
} from 'lucide-react';
import MenuItemModal from './MenuItemModal';
import './Menu.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { hasPermission } = useAuth();

  const categories = ['tea', 'coffee', 'snacks', 'desserts', 'beverages'];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [menuItems, searchTerm, selectedCategory]);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_BASE}/menu`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
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

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await axios.delete(`${API_BASE}/menu/${itemId}`);
        fetchMenuItems();
      } catch (error) {
        console.error('Error deleting menu item:', error);
      }
    }
  };

  const handleToggleAvailability = async (itemId, currentAvailability) => {
    try {
      await axios.patch(`${API_BASE}/menu/${itemId}/availability`, {
        isAvailable: !currentAvailability
      });
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleModalSave = () => {
    fetchMenuItems();
    handleModalClose();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      tea: '🍵',
      coffee: '☕',
      snacks: '🍪',
      desserts: '🍰',
      beverages: '🥤'
    };
    return icons[category] || '🍽️';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="menu-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Menu Management</h1>
          <p>Manage your tea shop menu items, prices, and availability</p>
        </div>
        {hasPermission('menu', 'create') && (
          <button className="btn btn-primary" onClick={handleAddItem}>
            <Plus size={20} />
            Add Menu Item
          </button>
        )}
      </div>

      <div className="menu-filters">
        <div className="search-bar">
          <div className="search-input-wrapper">
           
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="menu-stats">
        <div className="stat-item">
          <span className="stat-value">{filteredItems.length}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredItems.filter(item => item.isAvailable).length}
          </span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredItems.filter(item => !item.isAvailable).length}
          </span>
          <span className="stat-label">Unavailable</span>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="empty-state">
          <Coffee size={64} />
          <h3>No menu items found</h3>
          <p>
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first menu item'
            }
          </p>
          {hasPermission('menu', 'create') && !searchTerm && !selectedCategory && (
            <button className="btn btn-primary" onClick={handleAddItem}>
              <Plus size={20}  className="plus-icon"/>
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map(item => (
            <div key={item._id} className={`menu-card ${!item.isAvailable ? 'unavailable' : ''}`}>
              <div className="menu-card-header">
                <div className="category-badge">
                  <span className="category-icon">{getCategoryIcon(item.category)}</span>
                  <span className="category-name">{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                </div>
                <div className="availability-badge">
                  {item.isAvailable ? (
                    <span className="available">Available</span>
                  ) : (
                    <span className="unavailable">Unavailable</span>
                  )}
                </div>
              </div>

              <div className="menu-card-content">
                <h3 className="item-name">{item.name}</h3>
                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}
                
                <div className="item-pricing">
                  <div className="price-info">
                    <span className="price">Nrs{item.price.toFixed(2)}</span>
                    <span className="cost">Cost: Nrs{item.cost.toFixed(2)}</span>
                  </div>
                  <div className="profit-margin">
                    Margin: {(((item.price - item.cost) / item.price) * 100).toFixed(1)}%
                  </div>
                </div>

                {item.preparationTime && (
                  <div className="prep-time">
                    <span>Prep time: {item.preparationTime} min</span>
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div className="item-tags">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="menu-card-actions">
                {hasPermission('menu', 'update') && (
                  <>
                    <button
                      className="action-btn toggle-btn"
                      onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                      title={item.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                    >
                      {item.isAvailable ? <EyeOff size={16} /> : <Eye size={16} />}
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
                {hasPermission('menu', 'delete') && (
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteItem(item._id)}
                    title="Delete item"
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
        <MenuItemModal
          item={selectedItem}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default Menu;
