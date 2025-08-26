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
    <div className="tables">
      <div className="tables-header">
        <div>
          <h1 className="tables-title">Tables</h1>
        </div>
        <button className="add-table-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add Table
        </button>
      </div>

      <div className="tables-filters">
        <input
          type="text"
          placeholder="Search tables..."
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
          <option value="available">Available</option>
          <option value="occupied">Occupied</option>
          <option value="reserved">Reserved</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="tables-grid">
        {filteredTables.map(table => (
          <div key={table._id} className="table-card">
            <div className="table-header">
              <h3 className="table-name">Table {table.number}</h3>
              <span className={`table-status ${table.status}`}>
                {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
              </span>
            </div>
            <div className="table-content">
              <div className="table-info">
                <div className="table-capacity">
                  <span className="capacity-label">Capacity:</span>
                  <span className="capacity-value">{table.capacity} people</span>
                </div>
                {table.location && (
                  <div className="table-location">
                    <span className="location-label">Location:</span>
                    <span className="location-value">{table.location}</span>
                  </div>
                )}
                {table.description && (
                  <div className="table-description">
                    <span className="description-label">Description:</span>
                    <span className="description-value">{table.description}</span>
                  </div>
                )}
              </div>
              <div className="table-actions">
                <button
                  className="action-btn edit"
                  onClick={() => handleEditTable(table)}
                  title="Edit table"
                >
                  <Edit size={16} />
                </button>
                {hasPermission('tables', 'delete') && (
                  <button
                    className="action-btn delete"
                    onClick={() => handleDeleteTable(table._id)}
                    title="Delete table"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTables.length === 0 && (
        <div className="empty-state">
          <h3>No tables found</h3>
          <p>
            {searchTerm || statusFilter
              ? 'Try adjusting your search or filter criteria'
              : 'Start by adding your first table'
            }
          </p>
        </div>
      )}

      {showModal && (
        <TableModal
          table={selectedTable}
          onClose={() => setShowModal(false)}
          onSave={() => {
            fetchTables();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Tables;
