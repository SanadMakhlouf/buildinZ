import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faTimes, 
  faCheck, 
  faCheckDouble,
  faTrash,
  faEllipsisV,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import notificationService from '../services/notificationService';
import './NotificationDropdown.css';

const NotificationDropdown = ({ isOpen, onClose, onToggle }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dropdownRef = useRef(null);

  // Define loadNotifications function first
  const loadNotifications = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const response = await notificationService.getUserNotifications({
        page: pageNum,
        limit: 10,
        type: 'all'
      });

      if (response.success) {
        const newNotifications = response.data || [];
        
        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setUnreadCount(response.meta?.unread_count || 0);
        setHasMore(newNotifications.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications(1, true);
    }
  }, [isOpen, loadNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if it was unread
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id, { stopPropagation: () => {} });
    }
    
    // Navigate to action URL if available
    if (notification.data?.action_url) {
      window.location.href = notification.data.action_url;
    }
    
    onClose();
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <div className="notification-header">
        <h3>الإشعارات</h3>
        <div className="notification-actions">
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
              title="تحديد الكل كمقروء"
            >
              <FontAwesomeIcon icon={faCheckDouble} />
            </button>
          )}
          <button 
            className="close-dropdown-btn"
            onClick={onClose}
            title="إغلاق"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      <div className="notification-content">
        {loading && notifications.length === 0 ? (
          <div className="notification-loading">
            <div className="loading-spinner"></div>
            <p>جاري تحميل الإشعارات...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            <FontAwesomeIcon icon={faBell} className="no-notifications-icon" />
            <p>لا توجد إشعارات</p>
          </div>
        ) : (
          <>
            <div className="notification-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    <FontAwesomeIcon 
                      icon={notificationService.getNotificationIcon(notification.data?.type)}
                      style={{ color: notificationService.getNotificationColor(notification.data?.type) }}
                    />
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.data?.title || 'إشعار جديد'}
                    </div>
                    <div className="notification-message">
                      {notification.data?.message}
                    </div>
                    <div className="notification-time">
                      {notificationService.formatTime(notification.created_at)}
                    </div>
                  </div>
                  
                  <div className="notification-actions">
                    {!notification.is_read && (
                      <button
                        className="mark-read-btn"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        title="تحديد كمقروء"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}
                    
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      title="حذف"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    
                    {notification.data?.action_url && (
                      <FontAwesomeIcon 
                        icon={faExternalLinkAlt} 
                        className="action-indicator"
                        title="انقر للعرض"
                      />
                    )}
                  </div>
                  
                  {!notification.is_read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))}
            </div>
            
            {hasMore && (
              <div className="notification-footer">
                <button 
                  className="load-more-btn"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="notification-bottom">
        <Link 
          to="/notifications" 
          className="view-all-btn"
          onClick={onClose}
        >
          عرض جميع الإشعارات
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
