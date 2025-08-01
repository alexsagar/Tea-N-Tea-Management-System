import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import SignupShop from './pages/Login/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import Menu from './pages/Menu/Menu';
import Orders from './pages/Orders/Orders';
import Inventory from './pages/Inventory/Inventory';
import Staff from './pages/Staff/Staff';
import Customers from './pages/Customers/Customers';
import Tables from './pages/Tables/Tables';
import Suppliers from './pages/Suppliers/Suppliers';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="app">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signupshop" element={<SignupShop />} />

              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Protected routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="menu" element={<Menu />} />
                        <Route path="orders" element={<Orders />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="staff" element={<Staff />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="tables" element={<Tables />} />
                        <Route path="suppliers" element={<Suppliers />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="settings" element={<Settings />} />
                        {/* Catch-all for unknown routes inside protected */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
