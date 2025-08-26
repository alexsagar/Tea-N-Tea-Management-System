import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  Plus, Edit, Trash2, Eye, Clock, CheckCircle, XCircle, Printer, ChevronDown,
  Calendar, DollarSign, TrendingUp, Package, Users
} from 'lucide-react';
import OrderModal from './OrderModal';
import './Orders.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Orders = () => {
  // --- Date filter state ---
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const { hasPermission } = useAuth();
  const { socket } = useSocket();

  const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];
  const orderTypes = ['dine-in', 'takeaway', 'delivery'];

  // Check if selected date is today
  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  };

  // Check if selected date is in the past
  const isPastDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    return selected < today;
  };

  // Calculate daily revenue
  const calculateDailyRevenue = () => {
    return orders
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => total + (order.total || 0), 0);
  };

  // Calculate daily order counts
  const calculateDailyStats = () => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => 
      ['served', 'completed'].includes(order.status)
    ).length;
    const cancelledOrders = orders.filter(order => 
      order.status === 'cancelled'
    ).length;
    const pendingOrders = orders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    ).length;

    return {
      total: totalOrders,
      completed: completedOrders,
      cancelled: cancelledOrders,
      pending: pendingOrders
    };
  };

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
        // Only add new orders if they're for today
        if (isToday()) {
          setOrders(prev => [order, ...prev]);
        }
      });
      socket.on('order-status-update', (updatedOrder) => {
        setOrders(prev => prev.map(order =>
          order._id === updatedOrder._id ? updatedOrder : order
        ));
      });
      socket.on('order-deleted', ({ orderId }) => {
        setOrders(prev => prev.filter(order => order._id !== orderId));
      });
      return () => {
        socket.off('new-order');
        socket.off('order-status-update');
        socket.off('order-deleted');
      };
    }
  }, [socket, selectedDate]);

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
    if (isPastDate()) {
      alert('Cannot add orders for past dates. Please select today\'s date.');
      return;
    }
    setSelectedOrder(null);
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    if (isPastDate()) {
      alert('Cannot edit orders for past dates. This view is for reference only.');
      return;
    }
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleSaveOrder = () => {
    fetchOrders();  // refetch from backend
    setShowModal(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (isPastDate()) {
      alert('Cannot update order status for past dates. This view is for reference only.');
      return;
    }

    if (!hasPermission('orders', 'update')) {
      alert('You do not have permission to update order status');
      return;
    }

    setUpdatingStatus(orderId);
    try {
      const response = await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
        status: newStatus
      });
      
      // Update the order in local state
      setOrders(prev => prev.map(order =>
        order._id === orderId ? response.data : order
      ));
      
      // Show success message
      console.log(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (isPastDate()) {
      alert('Cannot cancel orders for past dates. This view is for reference only.');
      return;
    }

    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await axios.delete(`${API_BASE}/orders/${orderId}`);
        fetchOrders();
      } catch (error) {
        console.error('Error cancelling order:', error);
      }
    }
  };

  const handlePermanentDelete = async (orderId) => {
    if (isPastDate()) {
      alert('Cannot delete orders for past dates. This view is for reference only.');
      return;
    }

    if (window.confirm('Are you sure you want to permanently delete this cancelled order? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_BASE}/orders/${orderId}/permanent`);
        
        // Remove the order from local state
        setOrders(prev => prev.filter(order => order._id !== orderId));
        
        // Show success message
        console.log('Order permanently deleted');
      } catch (error) {
        console.error('Error permanently deleting order:', error);
        alert('Failed to delete order. Please try again.');
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

  const renderStatusDropdown = (order) => {
    if (isPastDate()) {
      return (
        <span className={`order-status ${order.status}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      );
    }

    if (!hasPermission('orders', 'update')) {
      return (
        <span className={`order-status ${order.status}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      );
    }

    return (
      <div className="status-dropdown">
        <select
          className={`status-select status-${order.status}`}
          value={order.status}
          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
          disabled={updatingStatus === order._id}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="served">Served</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {updatingStatus === order._id && (
          <div className="status-loading">
            <div className="spinner-small"></div>
          </div>
        )}
      </div>
    );
  };

  const dailyStats = calculateDailyStats();
  const dailyRevenue = calculateDailyRevenue();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="orders">
      {/* Header with Date Picker */}
      <div className="orders-header">
        <div className="header-left">
          <h1 className="orders-title">Orders</h1>
          <div className="date-picker-container">
            <Calendar size={20} className="calendar-icon" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
              max={new Date().toISOString().split('T')[0]}
            />
            {!isToday() && (
              <button 
                className="today-btn"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              >
                Today
              </button>
            )}
          </div>
        </div>
        <button 
          className={`add-order-btn ${isPastDate() ? 'disabled' : ''}`} 
          onClick={handleAddOrder}
          disabled={isPastDate()}
          title={isPastDate() ? 'Cannot add orders for past dates' : 'Add new order'}
        >
          <Plus size={16} />
          Add Order
        </button>
      </div>

      {/* Daily Summary Cards */}
      <div className="daily-summary">
        <div className="summary-card revenue">
          <div className="card-icon">
            <DollarSign size={24} />
          </div>
          <div className="card-content">
            <h3>Daily Revenue</h3>
            <p className="card-value">Nrs {dailyRevenue.toFixed(2)}</p>
            <span className="card-date">{selectedDate}</span>
          </div>
        </div>
        
        <div className="summary-card orders">
          <div className="card-icon">
            <Package size={24} />
          </div>
          <div className="card-content">
            <h3>Total Orders</h3>
            <p className="card-value">{dailyStats.total}</p>
            <span className="card-date">{selectedDate}</span>
          </div>
        </div>
        
        <div className="summary-card completed">
          <div className="card-icon">
            <CheckCircle size={24} />
          </div>
          <div className="card-content">
            <h3>Completed</h3>
            <p className="card-value">{dailyStats.completed}</p>
            <span className="card-date">{selectedDate}</span>
          </div>
        </div>
        
        <div className="summary-card pending">
          <div className="card-icon">
            <Clock size={24} />
          </div>
          <div className="card-content">
            <h3>Pending</h3>
            <p className="card-value">{dailyStats.pending}</p>
            <span className="card-date">{selectedDate}</span>
          </div>
        </div>
      </div>

      {/* Date Warning for Past Dates */}
      {isPastDate() && (
        <div className="date-warning">
          <Clock size={16} />
          <span>Viewing orders for {selectedDate}. This is a read-only view for reference purposes.</span>
        </div>
      )}

      {/* Filters */}
      <div className="orders-filters">
        <input
          type="text"
          placeholder="Search orders..."
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
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="served">Served</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="dine-in">Dine-in</option>
          <option value="takeaway">Takeaway</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="orders-table">
        <div className="table-header">
          <h2 className="table-title">
            Order List - {selectedDate}
            {isToday() && <span className="today-badge">Today</span>}
          </h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td>
                  <div className="order-number">#{order.orderNumber}</div>
                  <div className="order-time">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td>
                  <div className="order-customer">
                    <div className="customer-name">{order.customer?.name || 'Walk-in'}</div>
                    {order.customer?.phone && (
                      <div className="customer-phone">{order.customer.phone}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="order-items">
                    <div className="items-count">{order.items.length} items</div>
                    <div className="items-preview">
                      {order.items.slice(0, 2).map(item => (
                        <span key={item._id} className="item-tag">
                          {item.menuItem?.name || item.name} x{item.quantity}
                        </span>
                      ))}
                      {order.items.length > 2 && (
                        <span className="item-more">+{order.items.length - 2} more</span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="order-total">Nrs {(order.total || 0).toFixed(2)}</div>
                </td>
                <td>
                  {renderStatusDropdown(order)}
                </td>
                <td>
                  <span className="order-type">{order.orderType || order.type}</span>
                </td>
                <td>
                  <div className="order-actions">
                    {!isPastDate() && (
                      <button
                        className="action-btn edit"
                        onClick={() => handleEditOrder(order)}
                        title="Edit order"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    <button
                      className="action-btn print"
                      onClick={() => handlePrintKOT(order)}
                      title="Print KOT"
                    >
                      <Printer size={16} />
                    </button>
                    {!isPastDate() && hasPermission('orders', 'delete') && (
                      order.status === 'cancelled' ? (
                        <button
                          className="action-btn delete permanent"
                          onClick={() => handlePermanentDelete(order._id)}
                          title="Permanently delete order"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          className="action-btn delete"
                          onClick={() => handleCancelOrder(order._id)}
                          title="Cancel order"
                        >
                          <Trash2 size={16} />
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="empty-state">
          <h3>No orders found</h3>
          <p>
            {searchTerm || statusFilter || typeFilter
              ? 'Try adjusting your search or filter criteria'
              : isPastDate()
                ? `No orders were placed on ${selectedDate}`
                : 'Start by adding your first order for today'
            }
          </p>
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
