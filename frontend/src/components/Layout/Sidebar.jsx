import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Menu, 
  ShoppingCart, 
  Package, 
  Users, 
  UserCheck, 
  Table, 
  Truck, 
  BarChart3, 
  Settings
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const { user, shop } = useAuth(); // Make sure you provide shop in AuthContext
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', permission: null },
    { path: '/menu', icon: Menu, label: 'Menu', permission: 'menu.read' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders', permission: 'orders.read' },
    { path: '/inventory', icon: Package, label: 'Inventory', permission: 'inventory.read' },
    { path: '/staff', icon: UserCheck, label: 'Staff', permission: 'staff.read' },
    { path: '/customers', icon: Users, label: 'Customers', permission: 'customers.read' },
    { path: '/tables', icon: Table, label: 'Tables', permission: 'tables.read' },
    { path: '/suppliers', icon: Truck, label: 'Suppliers', permission: 'suppliers.read' },
    { path: '/reports', icon: BarChart3, label: 'Reports', permission: 'reports.read' },
    { path: '/settings', icon: Settings, label: 'Settings', permission: 'settings.read' }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true;
    const [module, action] = item.permission.split('.');
    return user?.permissions?.some(
      perm => perm.module === module && (perm.actions?.includes(action) || perm[action])
    ) || user?.role === 'admin';
  });

  // Show shop info if available (prefer shop.name/shopId, else fallback to user.shopId)
  const shopName = shop?.name || 'Tea Shop';
  const shopId = shop?.shopId || user?.shopId;

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo" title={!isOpen && shopName ? `${shopName} (ID: ${shopId})` : undefined}>
          <span className="logo-icon">🍵</span>
          {isOpen && (
            <span className="logo-text">
              {shopName}
              <span className="shop-id-badge">{shopId ? ` (${shopId})` : ''}</span>
            </span>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={!isOpen ? item.label : ''}
            >
              <Icon size={20} className="nav-icon" />
              {isOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {isOpen && (
        <div className="sidebar-footer">
          <div className="shop-meta">
            <div className="shop-meta-label">Shop ID:</div>
            <div className="shop-meta-value">{shopId || 'N/A'}</div>
          </div>
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
