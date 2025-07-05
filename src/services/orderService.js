import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API || '/api';

// Create axios instance with authentication
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Log outgoing requests for debugging
  console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data);
  
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use((response) => {
  console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
  return response;
}, (error) => {
  console.error('[API Response Error]', error.response?.status || 'No status', 
    error.response?.data || error.message || 'Unknown error');
  return Promise.reject(error);
});

export const orderService = {
  /**
   * Create a new order
   * @param {Object} orderData - Order data including items, shipping info, etc.
   * @returns {Promise} - Promise with order response
   */
  async createOrder(orderData) {
    try {
      console.log('[createOrder] Sending order data:', orderData);
      
      // Check if the API endpoint is correctly configured
      if (!API_BASE_URL) {
        console.error('[createOrder] API_BASE_URL is not configured');
        throw new Error('API endpoint not configured');
      }
      
      const response = await axiosInstance.post('/orders', orderData);
      
      // Handle empty response data but successful status code
      if (response.status === 200 && !response.data) {
        console.warn('[createOrder] Server returned 200 OK but empty response body');
        
        // Return a minimal success response without creating a fake order
        return {
          success: true,
          message: 'Order was created successfully, but the server returned no details.'
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('[createOrder] Error:', error);
      
      // Check for specific error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('[createOrder] Response error:', error.response.status, error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('[createOrder] Request error (no response):', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('[createOrder] Request setup error:', error.message);
      }
      
      throw error;
    }
  },

  /**
   * Get a specific order by ID
   * @param {string|number} orderId - The order ID
   * @returns {Promise} - Promise with order details
   */
  async getOrder(orderId) {
    try {
      console.log(`[getOrder] Fetching order: ${orderId}`);
      const response = await axiosInstance.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`[getOrder] Error fetching order ${orderId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get current user's orders
   * @returns {Promise} - Promise with user's orders
   */
  async getUserOrders() {
    try {
      console.log('[getUserOrders] Fetching user orders');
      const response = await axiosInstance.get('/my-orders');
      
      // Handle potential different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('[getUserOrders] Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('[getUserOrders] Error:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Update an existing order status (for admin or vendor)
   * @param {string|number} orderId - The order ID
   * @param {string} status - New status
   * @returns {Promise} - Promise with updated order
   */
  async updateOrderStatus(orderId, status) {
    try {
      console.log(`[updateOrderStatus] Updating order ${orderId} to status: ${status}`);
      const response = await axiosInstance.put(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`[updateOrderStatus] Error updating order ${orderId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Cancel an order
   * @param {string|number} orderId - The order ID
   * @returns {Promise} - Promise with canceled order
   */
  async cancelOrder(orderId) {
    try {
      console.log(`[cancelOrder] Canceling order: ${orderId}`);
      const response = await axiosInstance.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`[cancelOrder] Error canceling order ${orderId}:`, error.response?.data || error.message);
      throw error;
    }
  }
};

export default orderService; 