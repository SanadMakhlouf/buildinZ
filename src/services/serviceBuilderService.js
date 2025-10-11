import axios from 'axios';
import config from '../config/apiConfig';

const SERVICE_BUILDER_URL = `${config.API_BASE_URL}/service-builder`;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: SERVICE_BUILDER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include auth token for admin routes
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('[API Response Error]', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      // Request made but no response
      console.error('[API No Response]', error.request);
    } else {
      // Request setup error
      console.error('[API Setup Error]', error.message);
    }
    return Promise.reject(error);
  }
);

const serviceBuilderService = {
  /**
   * Get all categories with subcategories
   * @returns {Promise} Promise with categories data
   */
  getAllCategories: async () => {
    try {
      const response = await axiosInstance.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get category details by ID
   * @param {number|string} id - Category ID or slug
   * @returns {Promise} Promise with category details including subcategories and services
   */
  getCategoryById: async (id) => {
    try {
      const response = await axiosInstance.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all services
   * @returns {Promise} Promise with services data
   */
  getAllServices: async () => {
    try {
      const response = await axiosInstance.get('/services');
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  /**
   * Get service details by ID
   * @param {number|string} id - Service ID or slug
   * @returns {Promise} Promise with service details
   */
  getServiceById: async (id) => {
    try {
      const response = await axiosInstance.get(`/services/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get all tags
   * @returns {Promise} Promise with tags data
   */
  getAllTags: async () => {
    try {
      const response = await axiosInstance.get('/tags');
      return response.data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  },

  /**
   * Calculate service price
   * @param {Object} calculationData - Data for price calculation
   * @returns {Promise} Promise with calculation results
   */
  calculatePrice: async (calculationData) => {
    try {
      const response = await axiosInstance.post('/calculate', calculationData);
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  },

  /**
   * Submit service order
   * @param {Object} orderData - Order data
   * @returns {Promise} Promise with order submission result
   */
  submitOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/submit-order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error submitting order:', error);
      throw error;
    }
  },

  /**
   * Get full image URL
   * @param {string} imagePath - Relative image path
   * @returns {string} Full image URL
   */
  getImageUrl: (imagePath) => {
    const result = config.utils.getImageUrl(imagePath);
    console.log('serviceBuilderService.getImageUrl:', {
      input: imagePath,
      output: result,
      backendUrl: config.BACKEND_URL
    });
    return result;
  }
};

export default serviceBuilderService; 