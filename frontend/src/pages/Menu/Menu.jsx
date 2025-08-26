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
    <div className="menu">
      <div className="menu-header">
        <div>
          <h1 className="menu-title">Menu Items</h1>
        </div>
        <button className="add-item-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Menu Item
        </button>
      </div>

      <div className="menu-filters">
        <input
          type="text"
          placeholder="Search menu items..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item._id} className="menu-item-card">
            <div className="menu-item-image">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <span>🍽️</span>
              )}
            </div>
            <div className="menu-item-content">
              <h3 className="menu-item-name">{item.name}</h3>
              <p className="menu-item-description">{item.description}</p>
              <div className="menu-item-details">
                <span className="menu-item-price">Nrs {(item.price || 0).toFixed(2)}</span>
                <span className="menu-item-category">{item.category}</span>
              </div>
              <span className={`menu-item-status ${item.isAvailable ? 'available' : 'unavailable'}`}>
                {item.isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <div className="menu-item-actions">
                <button
                  className="action-btn edit"
                  onClick={() => handleEditItem(item)}
                  title="Edit item"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="action-btn edit"
                  onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                  title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}
                >
                  {item.isAvailable ? '🔄' : '✅'}
                </button>
                {hasPermission('menu', 'delete') && (
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteItem(item._id)}
                    title="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="empty-state">
          <h3>No menu items found</h3>
          <p>
            {searchTerm || selectedCategory
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first menu item'
            }
          </p>
        </div>
      )}

      {showModal && (
        <MenuItemModal
          item={selectedItem}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchMenuItems();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Menu;
