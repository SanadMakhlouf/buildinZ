import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faCheck, 
  faCheckDouble, 
  faTrash, 
  faFilter,
  faSearch,
  faTimes,
  faExternalLinkAlt,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import notificationService from '../../services/notificationService';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    loadNotifications(1, true);
  }, [filter]);

  const loadNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const response = await notificationService.getUserNotifications({
        page: pageNum,
        limit: 20,
        type: filter
      });

      if (response.success) {
        const newNotifications = response.data || [];
        
        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setTotalCount(response.meta?.total || 0);
        setUnreadCount(response.meta?.unread_count || 0);
        setHasMore(newNotifications.length === 20);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setBulkActionLoading(true);
      await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: new Date().toISOString()
        }))
      );
      
      setUnreadCount(0);
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setTotalCount(prev => prev - 1);
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
      try {
        setBulkActionLoading(true);
        await notificationService.clearAllNotifications();
        
        setNotifications([]);
        setTotalCount(0);
        setUnreadCount(0);
        setSelectedNotifications([]);
      } catch (error) {
        console.error('Error clearing all notifications:', error);
      } finally {
        setBulkActionLoading(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;
    
    if (window.confirm(`هل أنت متأكد من حذف ${selectedNotifications.length} إشعار؟`)) {
      try {
        setBulkActionLoading(true);
        
        // Delete selected notifications
        await Promise.all(
          selectedNotifications.map(id => notificationService.deleteNotification(id))
        );
        
        // Update local state
        const deletedUnreadCount = notifications
          .filter(n => selectedNotifications.includes(n.id) && !n.is_read)
          .length;
          
        setNotifications(prev => 
          prev.filter(n => !selectedNotifications.includes(n.id))
        );
        
        setUnreadCount(prev => Math.max(0, prev - deletedUnreadCount));
        setTotalCount(prev => prev - selectedNotifications.length);
        setSelectedNotifications([]);
      } catch (error) {
        console.error('Error deleting selected notifications:', error);
      } finally {
        setBulkActionLoading(false);
      }
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      setBulkActionLoading(true);
      
      // Mark selected notifications as read
      await Promise.all(
        selectedNotifications.map(id => notificationService.markAsRead(id))
      );
      
      // Update local state
      const markedUnreadCount = notifications
        .filter(n => selectedNotifications.includes(n.id) && !n.is_read)
        .length;
        
      setNotifications(prev => 
        prev.map(notification => 
          selectedNotifications.includes(notification.id)
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - markedUnreadCount));
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error marking selected notifications as read:', error);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
    
    if (notification.data?.action_url) {
      window.open(notification.data.action_url, '_blank');
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.id));
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      notification.data?.title?.toLowerCase().includes(searchLower) ||
      notification.data?.message?.toLowerCase().includes(searchLower)
    );
  });

  const loadMore = () => {
    if (!loading && hasMore) {
      loadNotifications(page + 1, false);
    }
  };

  return (
    <div className="notifications-page">
      <div className="container">
        {/* Header */}
        <div className="notifications-header">
          <div className="header-title">
            <h1>
              <FontAwesomeIcon icon={faBell} />
              الإشعارات
            </h1>
            <div className="notifications-stats">
              <span className="total-count">المجموع: {totalCount}</span>
              {unreadCount > 0 && (
                <span className="unread-count">غير مقروء: {unreadCount}</span>
              )}
            </div>
          </div>

          <div className="header-actions">
            {unreadCount > 0 && (
              <button 
                className="action-btn mark-all-btn"
                onClick={handleMarkAllAsRead}
                disabled={bulkActionLoading}
              >
                <FontAwesomeIcon icon={faCheckDouble} />
                تحديد الكل كمقروء
              </button>
            )}
            
            <button 
              className="action-btn danger-btn"
              onClick={handleClearAll}
              disabled={bulkActionLoading}
            >
              <FontAwesomeIcon icon={faTrash} />
              حذف الكل
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="notifications-controls">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              الكل ({totalCount})
            </button>
            <button 
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              غير مقروء ({unreadCount})
            </button>
            <button 
              className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              مقروء ({totalCount - unreadCount})
            </button>
          </div>

          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="البحث في الإشعارات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bulk-actions">
            <div className="bulk-info">
              تم تحديد {selectedNotifications.length} إشعار
            </div>
            <div className="bulk-buttons">
              <button 
                className="bulk-btn"
                onClick={handleBulkMarkAsRead}
                disabled={bulkActionLoading}
              >
                <FontAwesomeIcon icon={faCheck} />
                تحديد كمقروء
              </button>
              <button 
                className="bulk-btn danger"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
              >
                <FontAwesomeIcon icon={faTrash} />
                حذف
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="notifications-content">
          {loading && notifications.length === 0 ? (
            <div className="loading-state">
              <FontAwesomeIcon icon={faSpinner} spin />
              <p>جاري تحميل الإشعارات...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon icon={faBell} />
              <h3>لا توجد إشعارات</h3>
              <p>
                {searchQuery 
                  ? 'لم يتم العثور على إشعارات تطابق البحث'
                  : 'لا توجد إشعارات في الوقت الحالي'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="notifications-list">
                <div className="list-header">
                  <label className="select-all-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                      onChange={handleSelectAll}
                    />
                    <span>تحديد الكل</span>
                  </label>
                </div>

                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? 'unread' : ''} ${
                      selectedNotifications.includes(notification.id) ? 'selected' : ''
                    }`}
                  >
                    <div className="notification-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => handleSelectNotification(notification.id)}
                      />
                    </div>

                    <div className="notification-icon">
                      <FontAwesomeIcon 
                        icon={notificationService.getNotificationIcon(notification.data?.type)}
                        style={{ color: notificationService.getNotificationColor(notification.data?.type) }}
                      />
                    </div>

                    <div 
                      className="notification-content"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="notification-title">
                        {notification.data?.title || 'إشعار جديد'}
                        {notification.data?.action_url && (
                          <FontAwesomeIcon icon={faExternalLinkAlt} className="external-link" />
                        )}
                      </div>
                      <div className="notification-message">
                        {notification.data?.message}
                      </div>
                      <div className="notification-meta">
                        <span className="notification-time">
                          {notificationService.formatTime(notification.created_at)}
                        </span>
                        {notification.data?.type && (
                          <span className="notification-type">
                            {notification.data.type}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="notification-actions">
                      {!notification.is_read && (
                        <button
                          className="action-btn-sm mark-read"
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="تحديد كمقروء"
                        >
                          <FontAwesomeIcon icon={faCheck} />
                        </button>
                      )}
                      
                      <button
                        className="action-btn-sm delete"
                        onClick={() => handleDeleteNotification(notification.id)}
                        title="حذف"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>

                    {!notification.is_read && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="load-more-section">
                  <button 
                    className="load-more-btn"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        جاري التحميل...
                      </>
                    ) : (
                      'تحميل المزيد'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
