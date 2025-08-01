import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  RotateCcw,
  MapPin,
  Users,
  Clock,
  Table as TableIcon
} from 'lucide-react';
import TableModal from './TableModal';
import './Tables.css';

const API_BASE = import.meta.env.VITE_API_URL;

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const { hasPermission } = useAuth();
  const { socket } = useSocket();

  const statuses = ['available', 'occupied', 'reserved', 'maintenance'];
  const locations = ['indoor', 'outdoor', 'private'];

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    filterTables();
  }, [tables, searchTerm, statusFilter, locationFilter]);

  useEffect(() => {
    if (socket) {
      socket.on('table-status-update', (updatedTable) => {
        setTables(prev => prev.map(table => 
          table._id === updatedTable._id ? updatedTable : table
        ));
      });

      return () => {
        socket.off('table-status-update');
      };
    }
  }, [socket]);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tables`);
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTables = () => {
    let filtered = tables;

    if (searchTerm) {
      filtered = filtered.filter(table =>
        table.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(table => table.status === statusFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(table => table.location === locationFilter);
    }

    setFilteredTables(filtered);
  };

  const handleAddTable = () => {
    setSelectedTable(null);
    setShowModal(true);
  };

  const handleEditTable = (table) => {
    setSelectedTable(table);
    setShowModal(true);
  };

  const handleUpdateStatus = async (tableId, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/tables/${tableId}/status`, { status: newStatus });
      fetchTables();
    } catch (error) {
      console.error('Error updating table status:', error);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await axios.delete(`${API_BASE}/tables/${tableId}`);
        fetchTables();
      } catch (error) {
        console.error('Error deleting table:', error);
      }
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTable(null);
  };

  const handleModalSave = () => {
    fetchTables();
    handleModalClose();
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#10b981',
      occupied: '#ef4444',
      reserved: '#f59e0b',
      maintenance: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const calculateStats = () => {
    const totalTables = filteredTables.length;
    const availableTables = filteredTables.filter(t => t.status === 'available').length;
    const occupiedTables = filteredTables.filter(t => t.status === 'occupied').length;
    const reservedTables = filteredTables.filter(t => t.status === 'reserved').length;

    return { totalTables, availableTables, occupiedTables, reservedTables };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" aria-label="Loading"></div>
      </div>
    );
  }

  return (
    <div className="tables-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Table Management</h1>
          <p>Manage restaurant tables, reservations, and seating arrangements</p>
        </div>
        {hasPermission('tables', 'create') && (
          <button className="btn btn-primary" onClick={handleAddTable}>
            <Plus size={20} />
            Add Table
          </button>
        )}
      </div>

      <div className="tables-filters">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search tables"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by status"
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
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-select"
              aria-label="Filter by location"
            >
              <option value="">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {location.charAt(0).toUpperCase() + location.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="tables-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.totalTables}</span>
          <span className="stat-label">Total Tables</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.availableTables}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.occupiedTables}</span>
          <span className="stat-label">Occupied</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.reservedTables}</span>
          <span className="stat-label">Reserved</span>
        </div>
      </div>

      {filteredTables.length === 0 ? (
        <div className="empty-state">
          <TableIcon size={64} />
          <h3>No tables found</h3>
          <p>
            {searchTerm || statusFilter || locationFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first table'
            }
          </p>
          {hasPermission('tables', 'create') && !searchTerm && !statusFilter && !locationFilter && (
            <button className="btn btn-primary" onClick={handleAddTable}>
              <Plus size={20} className="first-table"/>
              Add First Table
            </button>
          )}
        </div>
      ) : (
        <div className="tables-grid">
          {filteredTables.map(table => (
            <div key={table._id} className={`table-card ${table.status}`}>
              <div className="table-card-header">
                <div className="table-info">
                  <div className={`table-icon ${table.status}`} style={{ backgroundColor: getStatusColor(table.status) }}>
                    {table.number}
                  </div>
                  <div className="table-details">
                    <h3>Table {table.number}</h3>
                    <div className="table-capacity">
                      Capacity: {table.capacity} people
                    </div>
                  </div>
                </div>
                <span className={`status-badge ${table.status}`}>
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </span>
              </div>

              <div className="table-card-content">
                <div className="table-meta">
                  <div className="meta-item">
                    <MapPin size={16} />
                    <span className="location-badge">{table.location.charAt(0).toUpperCase() + table.location.slice(1)}</span>
                  </div>
                  
                  <div className="meta-item">
                    <Users size={16} />
                    <span>Seats {table.capacity}</span>
                  </div>

                  <div className="meta-item">
                    <Clock size={16} />
                    <span>
                      Last cleaned: {table.lastCleaned ? new Date(table.lastCleaned).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {table.currentOrder && (
                  <div className="order-info">
                    <div className="order-number">
                      Order: #{table.currentOrder.orderNumber}
                    </div>
                    <div className="order-total">
                      Total: ${table.currentOrder.total?.toFixed(2)}
                    </div>
                  </div>
                )}

                {table.reservation && (
                  <div className="reservation-info">
                    <div className="reservation-customer">
                      Reserved for: {table.reservation.customer?.name}
                    </div>
                    <div className="reservation-time">
                      Time: {new Date(table.reservation.reservationTime).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div className="table-card-actions">
                {hasPermission('tables', 'update') && (
                  <>
                    <button
                      className="action-btn status-btn"
                      onClick={() => {
                        const nextStatus = table.status === 'available' ? 'maintenance' : 'available';
                        handleUpdateStatus(table._id, nextStatus);
                      }}
                      title="Toggle status"
                      aria-label="Toggle status"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEditTable(table)}
                      title="Edit table"
                      aria-label="Edit table"
                    >
                      <Edit size={16} />
                    </button>
                  </>
                )}
                {hasPermission('tables', 'delete') && (
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteTable(table._id)}
                    title="Delete table"
                    aria-label="Delete table"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TableModal
          table={selectedTable}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

export default Tables;
