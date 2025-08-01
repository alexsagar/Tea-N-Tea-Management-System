import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import './OrderModal.css';

const API_BASE = import.meta.env.VITE_API_URL;

const OrderModal = ({ order, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customer: '',
    table: '',
    orderType: 'dine-in',
    items: [],
    paymentMethod: 'cash',
    notes: ''
  });
  const [menuItems, setMenuItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 useEffect(() => {
  fetchData();
  
  if (order) {
    setFormData({
      customer: order.customer?._id || '',
      table: order.table?._id || '',
      orderType: order.orderType || 'dine-in',
      items: order.items
        ? order.items.map(item => ({
            menuItem: typeof item.menuItem === 'object' ? item.menuItem._id : item.menuItem,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions || ''
          }))
        : [],
      paymentMethod: order.paymentMethod || 'cash',
      notes: order.notes || ''
    });
  }
}, [order]);


  const fetchData = async () => {
    try {
      const [menuRes, customersRes, tablesRes] = await Promise.all([
        axios.get(`${API_BASE}/menu`),
        axios.get(`${API_BASE}/customers`),
        axios.get(`${API_BASE}/tables`)
      ]);
      setMenuItems(menuRes.data);
      setCustomers(customersRes.data);
      setTables(tablesRes.data.filter(table => table.status === 'available'));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { menuItem: '', quantity: 1, specialInstructions: '' }]
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const menuItem = menuItems.find(m => m._id === item.menuItem);
      return total + (menuItem ? menuItem.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.items.length === 0) {
      setError('Please add at least one item to the order');
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        customer: formData.customer || undefined,
        table: formData.table || undefined
      };

      if (order) {
        await axios.put(`${API_BASE}/orders/${order._id}`, submitData);
      } else {
        await axios.post(`${API_BASE}/orders`, submitData);
      }

      onSave();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content order-modal">
        <div className="modal-header">
          <h2>{order ? 'Edit Order' : 'New Order'}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="customer" className="form-label">Customer</label>
              <select
                id="customer"
                name="customer"
                value={formData.customer}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="orderType" className="form-label">Order Type *</label>
              <select
                id="orderType"
                name="orderType"
                value={formData.orderType}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="dine-in">Dine In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {formData.orderType === 'dine-in' && (
              <div className="form-group">
                <label htmlFor="table" className="form-label">Table</label>
                <select
                  id="table"
                  name="table"
                  value={formData.table}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Table</option>
                  {tables.map(table => (
                    <option key={table._id} value={table._id}>
                      Table {table.number} (Capacity: {table.capacity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="paymentMethod" className="form-label">Payment Method *</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="qr">QR Code</option>
                <option value="online">Online</option>
              </select>
            </div>
          </div>

          {/* ORDER ITEMS SECTION */}
          <div className="items-section">
            <div className="section-header">
              <h3>Order Items</h3>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleAddItem}
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="empty-items">
                <p>No items added yet. Click "Add Item" to start building the order.</p>
              </div>
            ) : (
              <div className="items-list">
                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="order-item-row compact-form">
                      <div className="form-group">
                        <label className="form-label">Menu Item *</label>
                        <select
                          value={item.menuItem}
                          onChange={e => handleItemChange(index, 'menuItem', e.target.value)}
                          className="form-select"
                          required
                        >
                          <option value="">Select Item</option>
                          {menuItems.filter(m => m.isAvailable).map(menuItem => (
                            <option key={menuItem._id} value={menuItem._id}>
                              {menuItem.name} - Nrs{menuItem.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Quantity *</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          className="form-input"
                          min="1"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Special Instructions</label>
                        <input
                          type="text"
                          value={item.specialInstructions}
                          onChange={e => handleItemChange(index, 'specialInstructions', e.target.value)}
                          className="form-input"
                          placeholder="e.g., Extra sugar, No ice"
                        />
                      </div>
                      <div className="item-total price-label">
                        Nrs{(() => {
                          const menuItem = menuItems.find(m => m._id === item.menuItem);
                          return menuItem ? (menuItem.price * item.quantity).toFixed(2) : '0.00';
                        })()}
                      </div>
                      <button
                        type="button"
                        className="remove-item-btn"
                        onClick={() => handleRemoveItem(index)}
                        title="Remove item"
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">Order Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Any special instructions for the order..."
            />
          </div>

          <div className="order-summary">
  <div className="summary-row total">
    <span>Total:</span>
    <span>Nrs{calculateTotal().toFixed(2)}</span>
  </div>
</div>


          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  <Save size={16} />
                  {order ? 'Update Order' : 'Create Order'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;
