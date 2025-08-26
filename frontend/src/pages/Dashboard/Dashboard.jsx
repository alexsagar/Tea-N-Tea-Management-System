import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import './Dashboard.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalInventory: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeStaff: 0,
    previousPeriodRevenue: 0,
    revenueChange: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, [dateRange]);

  // Add socket event listeners for real-time updates
  useEffect(() => {
    if (socket) {
      // Listen for new orders
      socket.on('new-order', (newOrder) => {
        // Check if the new order falls within the current date range
        const orderDate = new Date(newOrder.createdAt).toISOString().split('T')[0];
        if (orderDate >= dateRange.startDate && orderDate <= dateRange.endDate) {
          // Refresh dashboard data to show real-time updates
          fetchDashboardData();
        }
      });

      // Listen for order status updates
      socket.on('order-status-update', (updatedOrder) => {
        // Refresh dashboard data if the updated order affects current stats
        fetchDashboardData();
      });

      // Listen for order cancellations
      socket.on('order-cancelled', (cancelledOrder) => {
        // Refresh dashboard data if the cancelled order affects current stats
        fetchDashboardData();
      });

      // Cleanup socket listeners
      return () => {
        socket.off('new-order');
        socket.off('order-status-update');
        socket.off('order-cancelled');
      };
    }
  }, [socket, dateRange]);

  // Fallback: Refresh data every 30 seconds if socket is not connected
  useEffect(() => {
    if (!socket) {
      const interval = setInterval(() => {
        console.log('Socket not connected, refreshing dashboard data...');
        fetchDashboardData();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [socket]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch data for selected date range
      const [ordersRes, inventoryRes, customersRes, staffRes] = await Promise.all([
        axios.get(`${API_BASE}/orders`, { 
          params: { 
            startDate: dateRange.startDate, 
            endDate: dateRange.endDate 
          } 
        }),
        axios.get(`${API_BASE}/inventory/alerts/low-stock`),
        axios.get(`${API_BASE}/customers`),
        axios.get(`${API_BASE}/staff`)
      ]);

      const orders = ordersRes.data.orders || [];
      const inventory = inventoryRes.data || [];
      const customers = customersRes.data || [];
      const staff = staffRes.data || [];

      // Filter out cancelled orders and only count completed orders for revenue
      const activeOrders = orders.filter(order => order.status !== 'cancelled');
      const completedOrdersForRevenue = orders.filter(order => order.status === 'completed');

      // Calculate revenue and stats for selected period (only from completed orders)
      const periodRevenue = completedOrdersForRevenue.reduce((sum, order) => {
        const orderTotal = order.total || 0;
        console.log(`Order ${order.orderNumber}: total = ${orderTotal}, status = ${order.status}`);
        return sum + orderTotal;
      }, 0);

      console.log('Dashboard Debug Info:', {
        totalOrders: orders.length,
        activeOrders: activeOrders.length,
        periodRevenue,
        sampleOrder: activeOrders[0] || 'No orders',
        dateRange
      });

      // Additional debugging
      console.log('API Response Debug:', {
        ordersResponse: ordersRes.data,
        ordersArray: orders,
        dateRangeParams: { startDate: dateRange.startDate, endDate: dateRange.endDate },
        apiUrl: `${API_BASE}/orders`
      });
      const pendingOrders = activeOrders.filter(order =>
        ['pending', 'confirmed', 'preparing'].includes(order.status)
      ).length;
      const completedOrders = activeOrders.filter(order =>
        order.status === 'completed'
      ).length;

      // Calculate previous period for comparison
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const periodLength = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      const previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - periodLength);
      const previousEndDate = new Date(startDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);

      // Fetch previous period data for comparison
      const previousOrdersRes = await axios.get(`${API_BASE}/orders`, {
        params: {
          startDate: previousStartDate.toISOString().split('T')[0],
          endDate: previousEndDate.toISOString().split('T')[0]
        }
      });

      const previousOrders = previousOrdersRes.data.orders || [];
      const previousActiveOrders = previousOrders.filter(order => order.status !== 'cancelled');
      const previousCompletedOrders = previousOrders.filter(order => order.status === 'completed');
      const previousPeriodRevenue = previousCompletedOrders.reduce((sum, order) => sum + (order.total ?? 0), 0);

      // Calculate revenue change percentage
      const revenueChange = previousPeriodRevenue > 0 
        ? ((periodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
        : 0;

      setStats({
        totalOrders: activeOrders.length,
        totalCustomers: customers.length,
        totalRevenue: periodRevenue,
        totalInventory: inventory.length,
        pendingOrders,
        completedOrders,
        activeStaff: staff.filter(s => s.isActive).length,
        previousPeriodRevenue,
        revenueChange
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRevenueChangeIcon = () => {
    if (stats.revenueChange > 0) {
      return <TrendingUp size={16} className="trend-up" />;
    } else if (stats.revenueChange < 0) {
      return <TrendingDown size={16} className="trend-down" />;
    }
    return null;
  };

  const getRevenueChangeColor = () => {
    if (stats.revenueChange > 0) return 'var(--success)';
    if (stats.revenueChange < 0) return 'var(--destructive)';
    return 'var(--muted-foreground)';
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
        <h1 className="dashboard-title">Dashboard Management</h1>
        <p className="dashboard-subtitle">what's happening at your tea shop for the selected period.</p>
        
        {/* Date Range Picker */}
        <div className="date-range-picker">
          <div className="date-input-group">
            <label htmlFor="startDate">
              <Calendar size={16} />
              From Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              max={dateRange.endDate}
            />
          </div>
          
          <div className="date-input-group">
            <label htmlFor="endDate">
              <Calendar size={16} />
              To Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              min={dateRange.startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <button 
            className="reset-date-btn"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              setDateRange({ startDate: today, endDate: today });
            }}
          >
            Today
          </button>

          <button 
            className="reset-date-btn"
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              setDateRange({ startDate: thirtyDaysAgo, endDate: today });
            }}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Orders</div>
            <div className="stat-icon">📋</div>
          </div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Customers</div>
            <div className="stat-icon">👥</div>
          </div>
          <div className="stat-value">{stats.totalCustomers}</div>
        </div>

        <div className="stat-card revenue-card">
          <div className="stat-header">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-icon">💰</div>
          </div>
          <div className="stat-value">Nrs {(stats.totalRevenue || 0).toFixed(2)}</div>
          {stats.revenueChange !== 0 && (
            <div className="revenue-change" style={{ color: getRevenueChangeColor() }}>
              {getRevenueChangeIcon()}
              <span>
                {stats.revenueChange > 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}%
              </span>
              <span className="change-label">
                vs previous {dateRange.startDate === dateRange.endDate ? 'day' : 'period'}
              </span>
            </div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-title">Inventory Items</div>
            <div className="stat-icon">📦</div>
          </div>
          <div className="stat-value">{stats.totalInventory}</div>
        </div>
      </div>

      <div className="dashboard-actions-grid">
        <Link to="/orders" className="dashboard-action-btn">
          <div className="icon">📋</div>
          <h3 className="label">Manage Orders</h3>
        </Link>
        <Link to="/inventory" className="dashboard-action-btn">
          <div className="icon">📦</div>
          <h3 className="label">Inventory</h3>
        </Link>
        <Link to="/menu" className="dashboard-action-btn">
          <div className="icon">🍽️</div>
          <h3 className="label">Menu Items</h3>
        </Link>
        <Link to="/customers" className="dashboard-action-btn">
          <div className="icon">👥</div>
          <h3 className="label">Customers</h3>
        </Link>
        <Link to="/tables" className="dashboard-action-btn">
          <div className="icon">🪑</div>
          <h3 className="label">Tables</h3>
        </Link>
        <Link to="/staff" className="dashboard-action-btn">
          <div className="icon">👨‍💼</div>
          <h3 className="label">Staff</h3>
        </Link>
      </div>

      <div className="recent-activity">
        <div className="activity-header">
          <h2 className="activity-title">Recent Activity</h2>
        </div>
        <ul className="activity-list">
          {recentOrders.slice(0, 5).map((order, index) => (
            <li key={index} className="activity-item">
              <div className="activity-icon">📋</div>
              <div className="activity-content">
                <div className="activity-message">New order #{order.orderNumber} received</div>
                <div className="activity-time">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
