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
      
      console.log('[getProducts] Raw API response:', response.data);
      
      // Handle the specific API response structure
      let productsArray = [];
      
      if (Array.isArray(response.data)) {
        // Response is directly an array
        productsArray = response.data;
      } else if (response.data && response.data.data && response.data.data.products && Array.isArray(response.data.data.products.data)) {
        // Handle the specific nested structure: response.data.data.products.data
        productsArray = response.data.data.products.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Response has data field with array
        productsArray = response.data.data;
      } else if (response.data && Array.isArray(response.data.products)) {
        // Response has products field with array
        productsArray = response.data.products;
      } else if (response.data && typeof response.data === 'object') {
        // Response is an object, check if it has products inside
        if (response.data.products && Array.isArray(response.data.products)) {
          productsArray = response.data.products;
        } else if (response.data.items && Array.isArray(response.data.items)) {
          productsArray = response.data.items;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          productsArray = response.data.data;
        } else {
          // If response.data is an object but not in expected format, try to convert it
          console.warn('[getProducts] Unexpected response format, trying to extract products:', response.data);
          
          // Check if the response.data itself contains product-like objects
          const keys = Object.keys(response.data);
          if (keys.length > 0) {
            // Try to find a key that might contain products
            const productKey = keys.find(key => 
              key.toLowerCase().includes('product') || 
              key.toLowerCase().includes('item') ||
              key.toLowerCase().includes('data')
            );
            
            if (productKey && Array.isArray(response.data[productKey])) {
              productsArray = response.data[productKey];
            } else {
              // If no array found, return empty array
              console.warn('[getProducts] No products array found in response');
              productsArray = [];
            }
          } else {
            productsArray = [];
          }
        }
      } else {
        console.warn('[getProducts] Unexpected response format:', response.data);
        productsArray = [];
      }
      
      console.log('[getProducts] Extracted products array:', productsArray);
      return productsArray;
      
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