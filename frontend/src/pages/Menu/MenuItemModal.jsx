import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import './MenuItemModal.css';

const API_BASE = import.meta.env.VITE_API_URL;

const CATEGORY_OPTIONS = [
  { value: 'tea', label: 'Tea' },
  { value: 'coffee', label: 'Coffee' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'beverages', label: 'Beverages' }
];

const UNIT_OPTIONS = [
  'ml', 'l', 'g', 'kg', 'pcs', 'tbsp', 'tsp'
];

const MenuItemModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'tea',
    price: '',
    cost: '',
    preparationTime: '',
    tags: [],
    isAvailable: true,
    nutritionInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    ingredients: []
  });

  const [newTag, setNewTag] = useState('');
  const [newIngredient, setNewIngredient] = useState({
    ingredient: '',
    quantity: '',
    unit: 'ml'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inventoryItems, setInventoryItems] = useState([]);

  useEffect(() => {
    fetchInventoryItems();
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'tea',
        price: item.price?.toString() || '',
        cost: item.cost?.toString() || '',
        preparationTime: item.preparationTime?.toString() || '',
        tags: item.tags || [],
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        nutritionInfo: {
          calories: item.nutritionInfo?.calories?.toString() || '',
          protein: item.nutritionInfo?.protein?.toString() || '',
          carbs: item.nutritionInfo?.carbs?.toString() || '',
          fat: item.nutritionInfo?.fat?.toString() || ''
        },
        ingredients: item.ingredients || []
      });
    }
  }, [item]);

  const fetchInventoryItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/inventory`);
      setInventoryItems(res.data);
    } catch (error) {
      setInventoryItems([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('nutrition.')) {
      const nutritionField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        nutritionInfo: {
          ...prev.nutritionInfo,
          [nutritionField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // ---------- INGREDIENTS (optional) -----------

  const handleNewIngredientChange = (e) => {
    const { name, value } = e.target;
    setNewIngredient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddIngredient = () => {
    if (
      newIngredient.ingredient &&
      newIngredient.quantity &&
      newIngredient.unit
    ) {
      setFormData(prev => ({
        ...prev,
        ingredients: [
          ...prev.ingredients,
          {
            ingredient: newIngredient.ingredient,
            quantity: parseFloat(newIngredient.quantity),
            unit: newIngredient.unit
          }
        ]
      }));
      setNewIngredient({ ingredient: '', quantity: '', unit: 'ml' });
    }
  };

  const handleRemoveIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, idx) => idx !== index)
    }));
  };

  // ---------- Submit -------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        preparationTime: formData.preparationTime
          ? parseInt(formData.preparationTime)
          : undefined,
        nutritionInfo: {
          calories: formData.nutritionInfo.calories
            ? parseFloat(formData.nutritionInfo.calories)
            : undefined,
          protein: formData.nutritionInfo.protein
            ? parseFloat(formData.nutritionInfo.protein)
            : undefined,
          carbs: formData.nutritionInfo.carbs
            ? parseFloat(formData.nutritionInfo.carbs)
            : undefined,
          fat: formData.nutritionInfo.fat
            ? parseFloat(formData.nutritionInfo.fat)
            : undefined
        }
      };

      if (item) {
        await axios.put(`${API_BASE}/menu/${item._id}`, submitData);
      } else {
        await axios.post(`${API_BASE}/menu`, submitData);
      }
      onSave();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getInventoryName = (id) => {
    const found = inventoryItems.find(inv => inv._id === id);
    return found ? found.name : id;
  };

  const getInventoryUnit = (id) => {
    const found = inventoryItems.find(inv => inv._id === id);
    return found ? found.unit : '';
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="menu-item-modal-overlay" onClick={handleOverlayClick}>
      <div className="menu-item-modal-content" onClick={handleModalContentClick}>
        <div className="menu-item-modal-header">
          <h2>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
          <button className="menu-item-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="menu-item-modal-form">
          {error && <div className="menu-item-error-message">{error}</div>}
          <div className="menu-item-form-row">
            {/* Name, Category, Price, Cost, Prep Time, Availability */}
            <div className="menu-item-form-group">
              <label htmlFor="name" className="menu-item-form-label">
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="menu-item-form-input"
                required
              />
            </div>
            <div className="menu-item-form-group">
              <label htmlFor="category" className="menu-item-form-label">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="menu-item-form-select"
                required
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="menu-item-form-group">
              <label htmlFor="price" className="menu-item-form-label">
                Price (Nrs) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="menu-item-form-input"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="menu-item-form-group">
              <label htmlFor="cost" className="menu-item-form-label">
                Cost (Nrs) *
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="menu-item-form-input"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="menu-item-form-group">
              <label htmlFor="preparationTime" className="menu-item-form-label">
                Preparation Time (minutes)
              </label>
              <input
                type="number"
                id="preparationTime"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleChange}
                className="menu-item-form-input"
                min="1"
              />
            </div>
            <div className="menu-item-form-group">
              <label className="menu-item-checkbox-label">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                Available for sale
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
            />
          </div>

          {/* TAGS */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tags-input">
              <div className="tag-list">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="add-tag">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="tag-input"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="add-tag-btn"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* INGREDIENTS SECTION */}
          <div className="ingredients-section">
            <h3>Ingredients (Optional & For Reference Only)</h3>
            <p style={{ fontSize: '12px', color: '#777', marginBottom: '5px' }}>
              * Ingredients are for record only. Inventory is <b>not auto-deducted</b> on sales/orders.
            </p>
            <div className="ingredients-list">
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} className="ingredient-row">
                  <span className="ingredient-name">{getInventoryName(ing.ingredient)}</span>
                  <span className="ingredient-qty">{ing.quantity} {ing.unit}</span>
                  <button
                    type="button"
                    className="ingredient-remove"
                    onClick={() => handleRemoveIngredient(idx)}
                    title="Remove ingredient"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="ingredient-add-row">
              <select
                name="ingredient"
                value={newIngredient.ingredient}
                onChange={handleNewIngredientChange}
                className="form-select"
              >
                <option value="">Select ingredient from inventory</option>
                {inventoryItems.map(inv => (
                  <option key={inv._id} value={inv._id}>
                    {inv.name} ({inv.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="quantity"
                placeholder="Qty"
                value={newIngredient.quantity}
                onChange={handleNewIngredientChange}
                min="0.01"
                step="0.01"
                className="form-input"
                style={{ width: 80 }}
              />
              <select
                name="unit"
                value={
                  newIngredient.ingredient
                    ? getInventoryUnit(newIngredient.ingredient)
                    : newIngredient.unit
                }
                onChange={handleNewIngredientChange}
                className="form-select"
                style={{ width: 80 }}
                disabled={!!newIngredient.ingredient}
              >
                {UNIT_OPTIONS.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="add-ingredient-btn"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* NUTRITION */}
          <div className="nutrition-section">
            <h3>Nutrition Information (Optional)</h3>
            <div className="nutrition-grid">
              <div className="form-group">
                <label htmlFor="calories" className="form-label">
                  Calories
                </label>
                <input
                  type="number"
                  id="calories"
                  name="nutrition.calories"
                  value={formData.nutritionInfo.calories}
                  onChange={handleChange}
                  className="form-input"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="protein" className="form-label">
                  Protein (g)
                </label>
                <input
                  type="number"
                  id="protein"
                  name="nutrition.protein"
                  value={formData.nutritionInfo.protein}
                  onChange={handleChange}
                  className="form-input"
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="carbs" className="form-label">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  id="carbs"
                  name="nutrition.carbs"
                  value={formData.nutritionInfo.carbs}
                  onChange={handleChange}
                  className="form-input"
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="fat" className="form-label">
                  Fat (g)
                </label>
                <input
                  type="number"
                  id="fat"
                  name="nutrition.fat"
                  value={formData.nutritionInfo.fat}
                  onChange={handleChange}
                  className="form-input"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="menu-item-modal-btn menu-item-modal-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="menu-item-modal-btn menu-item-modal-btn-primary" disabled={loading}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Save size={16} />
                  {item ? 'Update Item' : 'Add Item'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;
