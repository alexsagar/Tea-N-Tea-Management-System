import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const navigate = useNavigate();

  // --- NEW: Date filter state ---
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().split('T')[0]
  );

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    lowStockItems: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeStaff: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, [selectedDate]);

const fetchDashboardData = async () => {
  setLoading(true);
  try {
    // Fetch data
    const [ordersRes, inventoryRes, customersRes, staffRes] = await Promise.all([
      axios.get(`${API_BASE}/orders`, { params: { date: selectedDate } }),
      axios.get(`${API_BASE}/inventory/alerts/low-stock`),
      axios.get(`${API_BASE}/customers`),
      axios.get(`${API_BASE}/staff`)
    ]);

    const orders = ordersRes.data.orders || [];
    const inventory = inventoryRes.data || [];
    const customers = customersRes.data || [];
    const staff = staffRes.data || [];

    // Filter out cancelled orders
    const activeOrders = orders.filter(order => order.status !== 'cancelled');

    // Calculate revenue and stats excluding cancelled
    const todayRevenue = activeOrders.reduce((sum, order) => sum + (order.total ?? 0), 0);
    const pendingOrders = activeOrders.filter(order =>
      ['pending', 'confirmed', 'preparing'].includes(order.status)
    ).length;
    const completedOrders = activeOrders.filter(order =>
      order.status === 'completed'
    ).length;

    setStats({
      totalSales: todayRevenue,
      totalOrders: activeOrders.length,
      totalCustomers: customers.length,
      lowStockItems: inventory.length,
      todayRevenue,
      pendingOrders,
      completedOrders,
      activeStaff: staff.filter(s => s.isActive).length
    });

    setRecentOrders(orders.slice(0, 5)); // Optionally, you might want to exclude cancelled here too if you want
    setLowStockItems(inventory.slice(0, 5));
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  } finally {
    setLoading(false);
  }
};


  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#f97316',
      ready: '#10b981',
      completed: '#059669',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening at your tea shop for the selected day.</p>
      </div>

      {/* --- DATE FILTER --- */}
      <div className="dashboard-date-row">
        <label htmlFor="dashboard-date" className="dashboard-date-label">Date:</label>
        <input
          type="date"
          id="dashboard-date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="dashboard-date-input"
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">Nrs {stats.todayRevenue.toFixed(2)}</div>
            <div className="stat-label">Revenue ({selectedDate})</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orders">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon customers">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon inventory">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.lowStockItems}</div>
            <div className="stat-label">Low Stock Items</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <div className="order-stats">
              <span className="pending-count">
                <Clock size={16} />
                {stats.pendingOrders} Pending
              </span>
              <span className="completed-count">
                <CheckCircle size={16} />
                {stats.completedOrders} Completed
              </span>
            </div>
          </div>
          <div className="card-content">
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={48} />
                <h3>No orders yet</h3>
                <p>Orders will appear here once customers start placing them.</p>
              </div>
            ) : (
              <div className="orders-list">
                {recentOrders.map(order => (
                  <div key={order._id} className="order-item">
                    <div className="order-info">
                      <div className="order-number">#{order.orderNumber}</div>
                      <div className="order-customer">
                        {order.customer?.name || 'Walk-in Customer'}
                      </div>
                      <div className="order-time">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="order-details">
                      <div className="order-total">Nrs {(order.total ?? 0).toFixed(2)}</div>
                      <div 
                        className="order-status"
                        style={{ color: getStatusColor(order.status) }}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Low Stock Alerts</h2>
            {stats.lowStockItems > 0 && (
              <span className="alert-badge">
                <AlertTriangle size={16} />
                {stats.lowStockItems} Items
              </span>
            )}
          </div>
          <div className="card-content">
            {lowStockItems.length === 0 ? (
              <div className="empty-state">
                <Package size={48} />
                <h3>All items in stock</h3>
                <p>No low stock alerts at the moment.</p>
              </div>
            ) : (
              <div className="stock-list">
                {lowStockItems.map(item => (
                  <div key={item._id} className="stock-item">
                    <div className="stock-info">
                      <div className="stock-name">{item.name}</div>
                      <div className="stock-category">{item.category}</div>
                    </div>
                    <div className="stock-levels">
                      <div className="current-stock">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="min-stock">
                        Min: {item.minStock} {item.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn primary" onClick={() => navigate('/orders')}>
            <ShoppingCart size={20} />
            New Order
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/inventory')}>
            <Package size={20} />
            Add Inventory
          </button>
          <button className="action-btn success" onClick={() => navigate('/customers')}>
            <Users size={20} />
            Add Customer
          </button>
          <button className="action-btn warning" onClick={() => navigate('/reports')}>
            <TrendingUp size={20} />
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
