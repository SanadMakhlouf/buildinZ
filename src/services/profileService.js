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
      // Return empty array instead of throwing to handle gracefully
      return [];
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
      // Return empty array instead of throwing to handle gracefully
      return [];
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