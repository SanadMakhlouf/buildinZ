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
      
      // Handle 401 Unauthorized
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          // Only redirect if not already on login page to prevent infinite loops
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
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

const searchService = {
  /**
   * Search products using the new search endpoint
   * @param {string} query - Search query
   * @param {Object} options - Additional search options
   * @returns {Promise} Promise with search results
   */
  async searchProducts(query, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      // Add optional parameters
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.category) params.append('category', options.category);
      if (options.minPrice) params.append('min_price', options.minPrice);
      if (options.maxPrice) params.append('max_price', options.maxPrice);
      
      const response = await axiosInstance.get(`/search/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  /**
   * Search services using the new search endpoint
   * @param {string} query - Search query
   * @param {Object} options - Additional search options
   * @returns {Promise} Promise with search results
   */
  async searchServices(query, options = {}) {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      
      // Add optional parameters
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.categoryId) params.append('category_id', options.categoryId);
      if (options.subcategoryId) params.append('subcategory_id', options.subcategoryId);
      if (options.tags) params.append('tags', options.tags);
      
      const response = await axiosInstance.get(`/search/services?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  },

  /**
   * Unified search across products and services
   * @param {string} query - Search query
   * @param {string} type - Search type: 'all', 'products', 'services'
   * @param {Object} options - Additional search options
   * @returns {Promise} Promise with search results
   */
  async unifiedSearch(query, type = 'all', options = {}) {
    try {
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('type', type);
      
      // Add optional parameters
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      
      const response = await axiosInstance.get(`/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error performing unified search:', error);
      throw error;
    }
  },

  /**
   * Get search suggestions/autocomplete
   * @param {string} query - Partial search query
   * @returns {Promise} Promise with suggestions
   */
  async getSuggestions(query) {
    try {
      const response = await axiosInstance.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw error;
    }
  }
};

export default searchService;
