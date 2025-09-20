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
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      
      // Check if we're on the profile page
      if (window.location.pathname === '/profile') {
        // Redirect to login with message
        window.location.href = '/login?redirect=/profile&message=تم تسجيل الخروج تلقائياً. يرجى تسجيل الدخول مرة أخرى.';
      }
      
      // Return standardized error format
      return Promise.reject({
        success: false,
        error: "Authentication required",
        message: "You must be authenticated to access this resource.",
        code: "UNAUTHENTICATED"
      });
    }
    
    return Promise.reject(error);
  }
);

export const profileService = {
  async getProfile() {
    try {
      const response = await axiosInstance.get('/user');
      return response.data; // Return the full response data to handle in the component
    } catch (error) {
      console.error('Get profile error:', error.response?.data || error.message);
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await axiosInstance.put('/profile', {
        name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        address: profileData.address,
        // Add other profile fields as needed
      });
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error.message);
      
      // Handle authentication errors
      if (error.code === 'UNAUTHENTICATED' || error.error === 'Authentication required') {
        throw error; // Re-throw auth errors to be handled by the component
      }
      
      throw error;
    }
  },

  async updateNotificationPreferences(preferences) {
    try {
      const response = await axiosInstance.put('/notification-preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Update notification preferences error:', error.response?.data || error.message);
      throw error;
    }
  },

  async getOrders() {
    try {
      const response = await axiosInstance.get('/my-orders');
      // Handle potential different response formats
      return Array.isArray(response.data) ? response.data : 
             Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Get orders error:', error.response?.data || error.message);
      
      // Handle authentication errors
      if (error.code === 'UNAUTHENTICATED' || error.error === 'Authentication required') {
        throw error; // Re-throw auth errors to be handled by the component
      }
      
      // Return empty array for other errors to handle gracefully
      return [];
    }
  },

  async cancelOrder(orderId) {
    try {
      const response = await axiosInstance.post(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Cancel order error:', error.response?.data || error.message);
      
      // Handle authentication errors
      if (error.code === 'UNAUTHENTICATED' || error.error === 'Authentication required') {
        throw error; // Re-throw auth errors to be handled by the component
      }
      
      throw error;
    }
  },

  async getServiceRequests() {
    try {
      const response = await axiosInstance.get('/my-service-requests');
      // Handle potential different response formats
      return Array.isArray(response.data) ? response.data : 
             Array.isArray(response.data.data) ? response.data.data : [];
    } catch (error) {
      console.error('Get service requests error:', error.response?.data || error.message);
      
      // Handle authentication errors
      if (error.code === 'UNAUTHENTICATED' || error.error === 'Authentication required') {
        throw error; // Re-throw auth errors to be handled by the component
      }
      
      // Return empty array for other errors to handle gracefully
      return [];
    }
  },
  
  async getServiceBuilderOrders() {
    try {
      const response = await axiosInstance.get('/my-service-orders');
      // Handle potential different response formats
      return Array.isArray(response.data.orders) ? response.data.orders : 
             Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Get service builder orders error:', error.response?.data || error.message);
      
      // Handle authentication errors
      if (error.code === 'UNAUTHENTICATED' || error.error === 'Authentication required') {
        throw error; // Re-throw auth errors to be handled by the component
      }
      
      // Return empty array for other errors to handle gracefully
      return [];
    }
  },
  
  async getServiceBuilderOrderDetails(orderId) {
    try {
      const response = await axiosInstance.get(`/my-service-orders/${orderId}`);
      return response.data.order;
    } catch (error) {
      console.error('Get service builder order details error:', error.response?.data || error.message);
      
      // Handle authentication errors
      if (error.code === 'UNAUTHENTICATED' || error.error === 'Authentication required') {
        throw error; // Re-throw auth errors to be handled by the component
      }
      
      throw error;
    }
  },

  async deleteAccount() {
    try {
      const response = await axiosInstance.delete('/account');
      return response.data;
    } catch (error) {
      console.error('Delete account error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default profileService; 