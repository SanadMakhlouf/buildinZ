import axios from 'axios';

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
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

const productService = {
  /**
   * Get all products
   * @param {Object} filters - Optional filters like category, price range, etc.
   * @returns {Promise} - Promise with products data
   */
  async getProducts(filters = {}) {
    try {
      console.log('[getProducts] Fetching products with filters:', filters);
      
      // Convert filters to query params
      const params = new URLSearchParams();
      
      if (filters.category) {
        params.append('category', filters.category);
      }
      
      if (filters.minPrice) {
        params.append('minPrice', filters.minPrice);
      }
      
      if (filters.maxPrice) {
        params.append('maxPrice', filters.maxPrice);
      }
      
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      if (filters.sort) {
        params.append('sort', filters.sort);
      }
      
      if (filters.page) {
        params.append('page', filters.page);
      }
      
      if (filters.limit) {
        params.append('limit', filters.limit);
      }
      
      const queryString = params.toString();
      const url = `/products${queryString ? `?${queryString}` : ''}`;
      
      const response = await axiosInstance.get(url);
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // If the response is an object with products inside
        return response.data.products || response.data.items || response.data.data || [];
      } else {
        console.warn('[getProducts] Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('[getProducts] Error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get product by ID
   * @param {string|number} productId - Product ID
   * @returns {Promise} - Promise with product data
   */
  async getProductById(productId) {
    try {
      console.log(`[getProductById] Fetching product: ${productId}`);
      const response = await axiosInstance.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`[getProductById] Error fetching product ${productId}:`, error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get product categories
   * @returns {Promise} - Promise with categories data
   */
  async getCategories() {
    try {
      console.log('[getCategories] Fetching product categories');
      const response = await axiosInstance.get('/categories');
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else {
        console.warn('[getCategories] Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('[getCategories] Error:', error.response?.data || error.message);
      return [];
    }
  },

  /**
   * Search products
   * @param {string} query - Search query
   * @returns {Promise} - Promise with search results
   */
  async searchProducts(query) {
    try {
      console.log(`[searchProducts] Searching for: ${query}`);
      const response = await axiosInstance.get(`/products/search?q=${encodeURIComponent(query)}`);
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        return response.data.products || response.data.items || response.data.data || [];
      } else {
        console.warn('[searchProducts] Unexpected response format:', response.data);
        return [];
      }
    } catch (error) {
      console.error('[searchProducts] Error:', error.response?.data || error.message);
      return [];
    }
  }
};

export default productService; 