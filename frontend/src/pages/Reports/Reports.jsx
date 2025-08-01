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
      <>
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-value">${totalSales.toFixed(2)}</div>
            <div className="summary-label">Total Revenue</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{totalOrders}</div>
            <div className="summary-label">Total Orders</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">${avgOrderValue.toFixed(2)}</div>
            <div className="summary-label">Average Order Value</div>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Daily Sales Trend</h3>
          <div className="chart-wrapper">
            <BarChart3 size={48} color="#d1d5db" />
            <p style={{ marginLeft: 16, color: '#6b7280' }}>
              Chart visualization would be implemented here
            </p>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Sales by Category</h3>
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
                  <td>${category.total.toFixed(2)}</td>
                  <td>{category.quantity}</td>
                  <td>{((category.total / totalSales) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Sales by Payment Method</h3>
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
                  <td>${payment.total.toFixed(2)}</td>
                  <td>{payment.count}</td>
                  <td>{((payment.total / totalSales) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderProductReport = () => {
  if (!reportData || !Array.isArray(reportData)) return null; // <- ADD THIS GUARD

  return (
    <div className="chart-container">
      <h3 className="chart-title">Top Performing Products</h3>
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
              <td>{product.totalQuantity}</td>
              <td>Nrs{product.totalRevenue.toFixed(2)}</td>
              <td>Nrs{product.avgPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


  const renderCustomerReport = () => {
    if (!reportData) return null;

    return (
      <>
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-value">{reportData.topCustomers?.length || 0}</div>
            <div className="summary-label">Total Customers</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{reportData.customerAcquisition?.length || 0}</div>
            <div className="summary-label">New This Month</div>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Top Customers by Spending</h3>
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
                  <td>Nrs{customer.totalSpent.toFixed(2)}</td>
                  <td>{customer.visitCount}</td>
                  <td>{customer.loyaltyPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData) return null;

    return (
      <>
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-value">{reportData.inventoryLevels?.length || 0}</div>
            <div className="summary-label">Total Items</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{reportData.lowStockItems?.length || 0}</div>
            <div className="summary-label">Low Stock Items</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">Nrs{reportData.totalValue?.toFixed(2) || '0.00'}</div>
            <div className="summary-label">Total Inventory Value</div>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Current Inventory Levels</h3>
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
                  <td>{item.currentStock} {item.unit}</td>
                  <td>{item.minStock} {item.unit}</td>
                  <td>Nrs{(item.currentStock * item.costPerUnit).toFixed(2)}</td>
                  <td>{item.supplier?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reportData.lowStockItems?.length > 0 && (
          <div className="chart-container">
            <h3 className="chart-title">Low Stock Alerts</h3>
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
        )}
      </>
    );
  };

  const renderFinancialReport = () => {
    if (!reportData) return null;

    return (
      <>
        <div className="report-summary">
          <div className="summary-card">
            <div className="summary-value">Nrs{reportData.summary?.totalRevenue?.toFixed(2) || '0.00'}</div>
            <div className="summary-label">Total Revenue</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">Nrs{reportData.summary?.totalTax?.toFixed(2) || '0.00'}</div>
            <div className="summary-label">Total Tax</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">Nrs{reportData.summary?.totalDiscount?.toFixed(2) || '0.00'}</div>
            <div className="summary-label">Total Discounts</div>
          </div>
          <div className="summary-card">
            <div className="summary-value">{reportData.summary?.orderCount || 0}</div>
            <div className="summary-label">Total Orders</div>
          </div>
        </div>

        <div className="chart-container">
          <h3 className="chart-title">Monthly Revenue Trend</h3>
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
                  <td>Nrs{month.revenue.toFixed(2)}</td>
                  <td>{month.orders}</td>
                  <td>Nrs{(month.revenue / month.orders).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
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
    <div className="reports-page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Comprehensive business insights and performance metrics</p>
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
        <button className="btn btn-primary" onClick={fetchReportData}>
         
          Generate Report
        </button>
      </div>

      <div className="reports-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="report-content">
        {renderReportContent()}

        {reportData && (
          <div className="export-actions">
            <button className="btn btn-secondary" onClick={handleExportPDF}>
              <FileText size={16} />
              Export PDF
            </button>
            <button className="btn btn-secondary" onClick={handleExportExcel}>
              <Download size={16} />
              Export Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
