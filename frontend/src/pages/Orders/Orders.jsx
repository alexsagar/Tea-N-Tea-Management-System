import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  Plus, Edit, Trash2, Eye, Clock, CheckCircle, XCircle, Printer
} from 'lucide-react';
import OrderModal from './OrderModal';
import './Orders.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Orders = () => {
  // --- Date filter state ---
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { hasPermission } = useAuth();
  const { socket } = useSocket();

  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
  const orderTypes = ['dine-in', 'takeaway', 'delivery'];

  // Fetch orders whenever date changes
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [selectedDate]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    if (socket) {
      socket.on('new-order', (order) => {
        setOrders(prev => [order, ...prev]);
      });
      socket.on('order-status-update', (updatedOrder) => {
        setOrders(prev => prev.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        ));
      });
      return () => {
        socket.off('new-order');
        socket.off('order-status-update');
      };
    }
  }, [socket]);

  //to recalculate
  const calculateOrderTotals = async (items, shopId) => {
  let subtotal = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findOne({ _id: item.menuItem, shopId });
    if (!menuItem) throw new Error(`Menu item ${item.menuItem} not found`);
    subtotal += menuItem.price * item.quantity;
  }

  const tax = 0; // as per your request, no tax
  const total = subtotal + tax;

  return { subtotal, tax, total };
};


  // Fetch orders for the selected date
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/orders`, {
        params: { date: selectedDate }
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    if (typeFilter) {
      filtered = filtered.filter(order => order.orderType === typeFilter);
    }
    setFilteredOrders(filtered);
  };

  const handleAddOrder = () => {
    setSelectedOrder(null);
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleSaveOrder = () => {
  fetchOrders();  // refetch from backend
  setShowModal(false);
};


  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
        status: newStatus
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await axios.delete(`${API_BASE}/orders/${orderId}`);
        fetchOrders();
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  const handlePrintKOT = (order) => {
    // Print Kitchen Order Ticket
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - ${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .order-info { margin: 15px 0; }
            .items { margin: 15px 0; }
            .item { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>KITCHEN ORDER TICKET</h2>
            <p>Order: ${order.orderNumber}</p>
            <p>Table: ${order.table?.number || 'N/A'}</p>
            <p>Type: ${order.orderType}</p>
          </div>
          <div class="order-info">
            <p>Customer: ${order.customer?.name || 'Walk-in'}</p>
            <p>Time: ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div class="items">
            <h3>Items:</h3>
            ${order.items.map(item => `
              <div class="item">
                ${item.quantity}x ${item.menuItem.name}
                ${item.specialInstructions ? `<br>Note: ${item.specialInstructions}` : ''}
              </div>
            `).join('')}
          </div>
          ${order.notes ? `<div><strong>Order Notes:</strong> ${order.notes}</div>` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#f97316',
      ready: '#10b981',
      served: '#059669',
      completed: '#059669',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      preparing: Clock,
      ready: CheckCircle,
      served: CheckCircle,
      completed: CheckCircle,
      cancelled: XCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon size={16} />;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Order Management</h1>
          <p>Manage customer orders, track status, and generate KOTs</p>
        </div>
        {hasPermission('orders', 'create') && (
          <button className="btn btn-primary" onClick={handleAddOrder}>
            <Plus size={20} />
            New Order
          </button>
        )}
      </div>

      {/* --- Filters Row (Date picker + Search) --- */}
      <div className="order-filters-row">
        <div className="order-date-picker">
          <label htmlFor="order-date" className="date-label">Order Date:</label>
          <input
            type="date"
            id="order-date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
        <input
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="orders-filters">
        <div className="filter-controls">
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              {orderTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-item">
          <span className="stat-value">{filteredOrders.length}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredOrders.filter(order => ['pending', 'confirmed', 'preparing'].includes(order.status)).length}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {filteredOrders.filter(order => order.status === 'completed').length}
          </span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
 Nrs {filteredOrders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0)
        .toFixed(2)
     }          </span>
          <span className="stat-label">Total Value</span>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <Clock size={64} />
          <h3>No orders found</h3>
          <p>
            {searchTerm || statusFilter || typeFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start by creating your first order'
            }
          </p>
          {hasPermission('orders', 'create') && !searchTerm && !statusFilter && !typeFilter && (
            <button className="btn btn-primary" onClick={handleAddOrder}>
              <Plus size={20} className="first-order" />
              Create First Order
            </button>
          )}
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id}>
                  <td>
                    <div className="order-number">{order.orderNumber}</div>
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">
                        {order.customer?.name || 'Walk-in Customer'}
                      </div>
                      {order.table && (
                        <div className="table-info">Table {order.table.number}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`order-type ${order.orderType}`}>
                      {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="items-summary">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </td>
                  <td>
                    <div className="order-total">Nrs {order.total.toFixed(2)}</div>
                  </td>
                  <td>
                    <div className="status-container">
                      <span
                        className="status-badge"
                        style={{ color: getStatusColor(order.status) }}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {hasPermission('orders', 'update') && order.status !== 'cancelled' && order.status !== 'completed' && (
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="status-select"
                        >
                          {statuses.filter(s => s !== 'cancelled').map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="time-info">
                      <div className="order-time">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                      <div className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="order-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={() => handleEditOrder(order)}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="action-btn print-btn"
                        onClick={() => handlePrintKOT(order)}
                        title="Print KOT"
                      >
                        <Printer size={16} />
                      </button>
                      {hasPermission('orders', 'update') && (
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEditOrder(order)}
                          title="Edit order"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {hasPermission('orders', 'delete') && order.status !== 'completed' && (
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleCancelOrder(order._id)}
                          title="Cancel order"
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
        <OrderModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchOrders();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Orders;
