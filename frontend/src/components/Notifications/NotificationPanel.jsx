import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { X } from 'lucide-react';
import './NoticationPanel.css';

const NotificationPanel = () => {
  const { notifications, removeNotification } = useSocket();

  const activeNotifications = notifications.slice(0, 3); // Show only 3 at a time

  return (
    <div className="notification-panel">
      {activeNotifications.map(notification => (
        <div key={notification.id} className={`toast toast-${notification.type}`}>
          <div className="toast-content">
            <div className="toast-message">{notification.message}</div>
            <div className="toast-time">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <button 
            className="toast-close"
            onClick={() => removeNotification(notification.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;