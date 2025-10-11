import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import NotificationDropdown from './NotificationDropdown';
import notificationService from '../services/notificationService';
import './NotificationBell.css';

const NotificationBell = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Memoize the load function to prevent unnecessary re-renders
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.unread_count || 0);
      }
    } catch (error) {
      // Silently fail - user might not be authenticated or API might not be available
      console.debug('Could not load unread count:', error.message);
      setUnreadCount(0);
    }
  }, []);

  // Load unread count on component mount
  useEffect(() => {
    loadUnreadCount();
    
    // Set up polling for real-time updates (every 60 seconds to reduce load)
    const interval = setInterval(loadUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const handleDropdownToggle = useCallback(() => {
    setIsDropdownOpen(prev => {
      if (!prev) {
        // Refresh unread count when opening
        loadUnreadCount();
      }
      return !prev;
    });
  }, [loadUnreadCount]);

  // Don't render if user is not authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  return (
    <div className="notification-bell-wrapper">
      <button 
        className={`notification-bell ${isDropdownOpen ? 'active' : ''}`}
        onClick={handleDropdownToggle}
        aria-label="الإشعارات"
        title="الإشعارات"
      >
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        isOpen={isDropdownOpen}
        onClose={closeDropdown}
        onToggle={handleDropdownToggle}
      />
    </div>
  );
};

export default NotificationBell;
