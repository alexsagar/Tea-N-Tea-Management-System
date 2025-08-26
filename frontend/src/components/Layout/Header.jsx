import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Bell, LogOut, User, Menu as MenuIcon } from 'lucide-react';
import axios from 'axios';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Header.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Header = ({ onToggleSidebar }) => {
  const { user, logout, token } = useAuth();
  const { notifications } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [shop, setShop] = useState(null);

  // Fetch shop info if logged in
  useEffect(() => {
    const fetchShop = async () => {
      if (!user?.shopId) return;
      try {
        // Assuming you have a GET /api/shops/:shopId endpoint, or use settings endpoint
        // You might need to adjust this based on your backend
        const res = await axios.get(`${API_URL}/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShop(res.data.shop || { name: "Tea Shop", shopId: user.shopId });
      } catch {
        setShop({ name: "Tea Shop", shopId: user.shopId });
      }
    };
    fetchShop();
  }, [user, token]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn" onClick={onToggleSidebar}>
          <MenuIcon size={20} />
        </button>
        <div className="header-shop-title">
          <h1 className="page-title">
            {shop?.name || "Tea Shop Management"}
          </h1>
          <span className="shop-id-label">
            {shop?.shopId && <>Shop ID: <b>{shop.shopId}</b></>}
          </span>
        </div>
      </div>

      <div className="header-right">
        <div className="notification-wrapper">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                <span className="notification-count">{notifications.length}</span>
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">No notifications</div>
                ) : (
                  notifications.slice(0, 5).map(notification => (
                    <div key={notification.id} className={`notification-item ${notification.type}`}>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <ThemeToggle />
        
        <div className="user-wrapper">
          <button 
            className="user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user?.name}</span>
          </button>
          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-details">
                  <div className="name">{user?.name}</div>
                  <div className="role">{user?.role}</div>
                  <div className="email">{user?.email}</div>
                  {shop?.name && (
                    <div className="shop">
                      <span>Shop: {shop.name}</span>
                    </div>
                  )}
                  {shop?.shopId && (
                    <div className="shop">
                      <span>Shop ID: {shop.shopId}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="user-actions">
                <button className="dropdown-item">
                  <User size={16} />
                  Profile
                </button>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
