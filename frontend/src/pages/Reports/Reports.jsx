import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp,
  DollarSign,
  Package,
  Users
} from 'lucide-react';
import './Reports.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'sales', label: 'Sales Reports', icon: DollarSign },
    { id: 'products', label: 'Product Performance', icon: Package },
    { id: 'customers', label: 'Customer Reports', icon: Users },
    { id: 'inventory', label: 'Inventory Reports', icon: Package },
    { id: 'financial', label: 'Financial Reports', icon: TrendingUp }
  ];

  useEffect(() => {
    fetchReportData();
  }, [activeTab, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/reports/${activeTab}`, {
        params: dateRange
      });
      
      console.log(`Reports Debug - ${activeTab}:`, {
        dateRange,
        responseData: response.data,
        totalSales: response.data?.totalSales,
        salesByCategory: response.data?.salesByCategory
      });
      
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting PDF...');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting Excel...');
  };

  // -- Renderers for each report tab --

  const renderSalesReport = () => {
    if (!reportData) return null;

    const totalSales = reportData.totalSales?.total || 0;
    const totalOrders = reportData.totalSales?.count || 0;
    const avgOrderValue = totalOrders ? totalSales / totalOrders : 0;

    return (
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <DollarSign size={24} />
            </div>
            <div className="report-title">Sales Overview</div>
          </div>
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-item">
                <div className="metric-value">Nrs {(totalSales || 0).toFixed(2)}</div>
                <div className="metric-label">Total Revenue</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{totalOrders || 0}</div>
                <div className="metric-label">Total Orders</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">Nrs {(avgOrderValue || 0).toFixed(2)}</div>
                <div className="metric-label">Average Order Value</div>
              </div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <BarChart3 size={24} />
            </div>
            <div className="report-title">Daily Sales Trend</div>
          </div>
          <div className="report-content">
            <div className="chart-placeholder">
              <div className="chart-placeholder-icon">
                <BarChart3 size={48} />
              </div>
              <div className="chart-placeholder-text">
                Chart visualization would be implemented here
              </div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <Package size={24} />
            </div>
            <div className="report-title">Sales by Category</div>
          </div>
          <div className="report-content">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Revenue</th>
                  <th>Quantity Sold</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {reportData.salesByCategory?.map((category, idx) => (
                  <tr key={idx}>
                    <td style={{ textTransform: 'capitalize' }}>{category._id}</td>
                    <td>Nrs{(category.total || 0).toFixed(2)}</td>
                    <td>{category.quantity || 0}</td>
                    <td>{totalSales ? (((category.total || 0) / totalSales) * 100).toFixed(1) : '0.0'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <DollarSign size={24} />
            </div>
            <div className="report-title">Sales by Payment Method</div>
          </div>
          <div className="report-content">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {reportData.salesByPayment?.map((payment, idx) => (
                  <tr key={idx}>
                    <td style={{ textTransform: 'capitalize' }}>{payment._id}</td>
                    <td>Nrs{(payment.total || 0).toFixed(2)}</td>
                    <td>{payment.count || 0}</td>
                    <td>{totalSales ? (((payment.total || 0) / totalSales) * 100).toFixed(1) : '0.0'}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderProductReport = () => {
    if (!reportData || !Array.isArray(reportData)) return null;

    return (
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <Package size={24} />
            </div>
            <div className="report-title">Top Performing Products</div>
          </div>
          <div className="report-content">
            <div className="chart-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                    <th>Average Price</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((product, idx) => (
                    <tr key={idx}>
                      <td>{product.name}</td>
                      <td>{product.totalQuantity || 0}</td>
                      <td>Nrs{(product.totalRevenue || 0).toFixed(2)}</td>
                      <td>Nrs{(product.avgPrice || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const renderCustomerReport = () => {
    if (!reportData) return null;

    return (
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <Users size={24} />
            </div>
            <div className="report-title">Customer Insights</div>
          </div>
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-item">
                <div className="metric-value">{reportData.topCustomers?.length || 0}</div>
                <div className="metric-label">Total Customers</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{reportData.customerAcquisition?.length || 0}</div>
                <div className="metric-label">New This Month</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <Users size={24} />
            </div>
            <div className="report-title">Top Customers by Spending</div>
          </div>
          <div className="report-content">
            <div className="chart-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Total Spent</th>
                    <th>Visit Count</th>
                    <th>Loyalty Points</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topCustomers?.map((customer, idx) => (
                    <tr key={idx}>
                      <td>{customer.name}</td>
                      <td>Nrs{(customer.totalSpent || 0).toFixed(2)}</td>
                      <td>{customer.visitCount || 0}</td>
                      <td>{customer.loyaltyPoints || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData) return null;

    return (
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <Package size={24} />
            </div>
            <div className="report-title">Inventory Overview</div>
          </div>
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-item">
                <div className="metric-value">{reportData.inventoryLevels?.length || 0}</div>
                <div className="metric-label">Total Items</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{reportData.lowStockItems?.length || 0}</div>
                <div className="metric-label">Low Stock Items</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">Nrs{reportData.totalValue?.toFixed(2) || '0.00'}</div>
                <div className="metric-label">Total Inventory Value</div>
              </div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <Package size={24} />
            </div>
            <div className="report-title">Current Inventory Levels</div>
          </div>
          <div className="report-content">
            <div className="chart-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Current Stock</th>
                    <th>Min Stock</th>
                    <th>Value</th>
                    <th>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.inventoryLevels?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td>{item.currentStock || 0} {item.unit}</td>
                      <td>{item.minStock || 0} {item.unit}</td>
                      <td>Nrs{((item.currentStock || 0) * (item.costPerUnit || 0)).toFixed(2)}</td>
                      <td>{item.supplier?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {reportData.lowStockItems?.length > 0 && (
          <div className="report-card">
            <div className="report-header">
              <div className="report-icon">
                <Package size={24} />
              </div>
              <div className="report-title">Low Stock Alerts</div>
            </div>
            <div className="report-content">
              <div className="chart-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Current Stock</th>
                      <th>Min Stock</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.lowStockItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td style={{ color: '#ef4444', fontWeight: '600' }}>
                          {item.currentStock} {item.unit}
                        </td>
                        <td>{item.minStock} {item.unit}</td>
                        <td>
                          <span style={{ 
                            color: item.currentStock === 0 ? '#ef4444' : '#f59e0b',
                            fontWeight: '500'
                          }}>
                            {item.currentStock === 0 ? 'Out of Stock' : 'Low Stock'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!reportData) return null;

    return (
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <TrendingUp size={24} />
            </div>
            <div className="report-title">Financial Overview</div>
          </div>
          <div className="report-content">
            <div className="report-metrics">
              <div className="metric-item">
                <div className="metric-value">Nrs{reportData.summary?.totalRevenue?.toFixed(2) || '0.00'}</div>
                <div className="metric-label">Total Revenue</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">Nrs{reportData.summary?.totalTax?.toFixed(2) || '0.00'}</div>
                <div className="metric-label">Total Tax</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">Nrs{reportData.summary?.totalDiscount?.toFixed(2) || '0.00'}</div>
                <div className="metric-label">Total Discounts</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{reportData.summary?.orderCount || 0}</div>
                <div className="metric-label">Total Orders</div>
              </div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <TrendingUp size={24} />
            </div>
            <div className="report-title">Monthly Revenue Trend</div>
          </div>
          <div className="report-content">
            <div className="chart-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Revenue</th>
                    <th>Orders</th>
                    <th>Average Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthlyRevenue?.map((month, idx) => (
                    <tr key={idx}>
                      <td>{month._id}</td>
                      <td>Nrs{(month.revenue || 0).toFixed(2)}</td>
                      <td>{month.orders || 0}</td>
                      <td>Nrs{(month.orders ? ((month.revenue || 0) / month.orders) : 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="empty-data">
          <BarChart3 size={48} />
          <h3>No Data Available</h3>
          <p>No data found for the selected date range.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'sales':
        return renderSalesReport();
      case 'products':
        return renderProductReport();
      case 'customers':
        return renderCustomerReport();
      case 'inventory':
        return renderInventoryReport();
      case 'financial':
        return renderFinancialReport();
      default:
        return null;
    }
  };

  return (
    <div className="reports">
      <div className="reports-header">
        <h1 className="reports-title">Reports & Analytics</h1>
        <p className="reports-subtitle">Comprehensive business insights and performance metrics</p>
        <button 
          className="generate-btn"
          onClick={fetchReportData}
          style={{ marginTop: '1rem' }}
        >
          🔄 Refresh Data
        </button>
      </div>

      <div className="reports-nav">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`report-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="icon" size={20} />
              <span className="label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label className="filter-label">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="filter-input"
          />
        </div>
        <button className="generate-btn" onClick={fetchReportData}>
          Generate Report
        </button>
      </div>

      {renderReportContent()}

      {reportData && (
        <div className="export-section">
          <div className="export-header">
            <h3 className="export-title">Export Options</h3>
            <p className="export-description">Download your reports in various formats for further analysis.</p>
          </div>
          <div className="export-actions">
            <button className="export-btn export-btn-secondary" onClick={handleExportPDF}>
              <FileText size={16} />
              Export PDF
            </button>
            <button className="export-btn export-btn-primary" onClick={handleExportExcel}>
              <Download size={16} />
              Export Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
