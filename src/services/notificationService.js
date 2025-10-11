import axios from 'axios';
import config from '../config/apiConfig';

// Create axios instance with authentication
const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('[Notification API Request Error]', error);
  return Promise.reject(error);
});

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('[Notification API Response Error]', {
        status: error.response.status,
        data: error.response.data
      });
      
      // Handle 401 Unauthorized - but only redirect if not already on login page
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // Only redirect if not already on login page to prevent infinite loops
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      console.error('[Notification API No Response]', error.request);
    } else {
      console.error('[Notification API Setup Error]', error.message);
    }
    return Promise.reject(error);
  }
);

const notificationService = {
  // ============= User Notifications API =============
  
  /**
   * Get all notifications for the authenticated user
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 15, max: 50)
   * @param {string} params.type - Filter type: 'all', 'unread', 'read' (default: 'all')
   * @returns {Promise} Promise with notifications data
   */
  async getUserNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type) queryParams.append('type', params.type);
      
      const response = await axiosInstance.get(`/notifications?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * @returns {Promise} Promise with unread count
   */
  async getUnreadCount() {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  },

  /**
   * Mark a specific notification as read
   * @param {string} notificationId - Notification UUID
   * @returns {Promise} Promise with success response
   */
  async markAsRead(notificationId) {
    try {
      const response = await axiosInstance.post('/notifications/mark-read', {
        notification_id: notificationId
      });
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * @returns {Promise} Promise with success response
   */
  async markAllAsRead() {
    try {
      const response = await axiosInstance.post('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a specific notification
   * @param {string} notificationId - Notification UUID
   * @returns {Promise} Promise with success response
   */
  async deleteNotification(notificationId) {
    try {
      const response = await axiosInstance.delete('/notifications/delete', {
        data: { notification_id: notificationId }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Clear all notifications
   * @returns {Promise} Promise with success response
   */
  async clearAllNotifications() {
    try {
      const response = await axiosInstance.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  },

  /**
   * Get notification preferences
   * @returns {Promise} Promise with preferences data
   */
  async getPreferences() {
    try {
      const response = await axiosInstance.get('/notifications/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Preference settings
   * @returns {Promise} Promise with updated preferences
   */
  async updatePreferences(preferences) {
    try {
      const response = await axiosInstance.put('/notifications/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  /**
   * Send test notification
   * @returns {Promise} Promise with success response
   */
  async sendTestNotification() {
    try {
      const response = await axiosInstance.post('/notifications/test');
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },

  // ============= Admin Notifications API =============

  /**
   * Get all admin notifications
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.type - Filter type
   * @param {number} params.user_id - Filter by user ID
   * @returns {Promise} Promise with admin notifications data
   */
  async getAdminNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type) queryParams.append('type', params.type);
      if (params.user_id) queryParams.append('user_id', params.user_id);
      
      const response = await axiosInstance.get(`/admin/notifications?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      throw error;
    }
  },

  /**
   * Create admin notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise} Promise with created notification
   */
  async createAdminNotification(notificationData) {
    try {
      const response = await axiosInstance.post('/admin/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error creating admin notification:', error);
      throw error;
    }
  },

  /**
   * Send notifications to specific users
   * @param {Object} notificationData - Notification data with user_ids or send_to_all
   * @returns {Promise} Promise with sent count
   */
  async sendToUsers(notificationData) {
    try {
      const response = await axiosInstance.post('/admin/notifications/send-to-users', notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending notifications to users:', error);
      throw error;
    }
  },

  /**
   * Mark admin notification as read
   * @param {number} notificationId - Notification ID
   * @returns {Promise} Promise with success response
   */
  async markAdminAsRead(notificationId) {
    try {
      const response = await axiosInstance.put(`/admin/notifications/${notificationId}/mark-read`);
      return response.data;
    } catch (error) {
      console.error('Error marking admin notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all admin notifications as read
   * @returns {Promise} Promise with success response
   */
  async markAllAdminAsRead() {
    try {
      const response = await axiosInstance.post('/admin/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      console.error('Error marking all admin notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete admin notification
   * @param {number} notificationId - Notification ID
   * @returns {Promise} Promise with success response
   */
  async deleteAdminNotification(notificationId) {
    try {
      const response = await axiosInstance.delete(`/admin/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting admin notification:', error);
      throw error;
    }
  },

  /**
   * Clear all admin notifications
   * @returns {Promise} Promise with success response
   */
  async clearAllAdminNotifications() {
    try {
      const response = await axiosInstance.delete('/admin/notifications/clear-all');
      return response.data;
    } catch (error) {
      console.error('Error clearing all admin notifications:', error);
      throw error;
    }
  },

  /**
   * Get notification statistics
   * @returns {Promise} Promise with statistics data
   */
  async getStatistics() {
    try {
      const response = await axiosInstance.get('/admin/notifications/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification statistics:', error);
      throw error;
    }
  },

  // ============= Utility Methods =============

  /**
   * Get notification type icon
   * @param {string} type - Notification type
   * @returns {string} FontAwesome icon class
   */
  getNotificationIcon(type) {
    const iconMap = {
      'info': 'fa-info-circle',
      'success': 'fa-check-circle',
      'warning': 'fa-exclamation-triangle',
      'error': 'fa-times-circle',
      'order_confirmation': 'fa-shopping-cart',
      'order_status': 'fa-truck',
      'handyman_assigned': 'fa-user-cog',
      'service_completed': 'fa-check-double',
      'marketing': 'fa-bullhorn',
      'default': 'fa-bell'
    };
    
    return iconMap[type] || iconMap.default;
  },

  /**
   * Get notification type color
   * @param {string} type - Notification type
   * @returns {string} CSS color value
   */
  getNotificationColor(type) {
    const colorMap = {
      'info': '#0A3259',
      'success': '#28a745',
      'warning': '#ffc107',
      'error': '#dc3545',
      'order_confirmation': '#007bff',
      'order_status': '#17a2b8',
      'handyman_assigned': '#6f42c1',
      'service_completed': '#28a745',
      'marketing': '#fd7e14',
      'default': '#6c757d'
    };
    
    return colorMap[type] || colorMap.default;
  },

  /**
   * Format notification time
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted time string
   */
  formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    
    return time.toLocaleDateString('ar-SA');
  }
};

export default notificationService;
