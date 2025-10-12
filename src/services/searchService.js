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
   * Global search across services, categories, and products
   * @param {string} query - Search query (supports Arabic and English)
   * @param {Object} options - Search options
   * @param {string} options.type - Type of results: 'all', 'services', 'categories', 'products' (default: 'all')
   * @param {number} options.limit - Maximum results per type (1-100, default: 10)
   * @returns {Promise} Promise with search results
   */
  async search(query, options = {}) {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query is required');
      }

      const params = new URLSearchParams();
      params.append('q', query);
      
      // Add type parameter (all, services, categories, products)
      const type = options.type || 'all';
      params.append('type', type);
      
      // Add limit parameter (1-100)
      const limit = options.limit || 10;
      if (limit >= 1 && limit <= 100) {
        params.append('limit', limit);
      }
      
      const response = await axiosInstance.get(`/search?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  },

  /**
   * Search only services
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Promise} Promise with service results
   */
  async searchServices(query, limit = 10) {
    try {
      const response = await this.search(query, { type: 'services', limit });
      return {
        success: response.success,
        services: response.results?.services || [],
        total: response.results?.services?.length || 0
      };
    } catch (error) {
      console.error('Error searching services:', error);
      throw error;
    }
  },

  /**
   * Search only categories
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Promise} Promise with category results
   */
  async searchCategories(query, limit = 10) {
    try {
      const response = await this.search(query, { type: 'categories', limit });
      return {
        success: response.success,
        categories: response.results?.categories || [],
        total: response.results?.categories?.length || 0
      };
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  },

  /**
   * Search only products
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Promise} Promise with product results
   */
  async searchProducts(query, limit = 10) {
    try {
      const response = await this.search(query, { type: 'products', limit });
      return {
        success: response.success,
        products: response.results?.products || [],
        total: response.results?.products?.length || 0
      };
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  /**
   * Get search suggestions for autocomplete (with debouncing recommended)
   * @param {string} query - Partial search query (minimum 2 characters recommended)
   * @param {number} limit - Maximum suggestions per type (default: 5)
   * @returns {Promise} Promise with suggestions
   */
  async getSuggestions(query, limit = 5) {
    try {
      if (!query || query.length < 2) {
        return {
          success: true,
          results: { services: [], categories: [], products: [] },
          total_results: 0
        };
      }
      
      return await this.search(query, { type: 'all', limit });
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return {
        success: false,
        results: { services: [], categories: [], products: [] },
        total_results: 0
      };
    }
  }
};

export default searchService;
