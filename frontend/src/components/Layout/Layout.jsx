import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationPanel from '../Notifications/NotificationPanel';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="content">
          {children}
        </main>
      </div>
      <NotificationPanel />
    </div>
  );
};

export default Layout;
