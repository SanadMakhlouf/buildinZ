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
        return {
          success: false,
          results: { services: [], categories: [], products: [] },
          total_results: 0,
          message: 'Search query is required'
        };
      }

      const searchQuery = query.trim();
      const type = options.type || 'all';
      const limit = options.limit || 20;

      // Try global search endpoint first
      try {
        const params = new URLSearchParams();
        params.append('q', searchQuery);
        params.append('type', type);
        if (limit >= 1 && limit <= 100) {
          params.append('limit', limit);
        }
        
        console.log('Search API call:', `/search?${params.toString()}`);
        const response = await axiosInstance.get(`/search?${params.toString()}`);
        console.log('Search API response:', response.data);
        
        // Handle different response formats
        if (response.data) {
          // If response already has the expected format
          if (response.data.success !== undefined && response.data.success) {
            return response.data;
          }
          // If response is the data directly
          if (response.data.results || response.data.services || response.data.categories || response.data.products) {
            return {
              success: true,
              results: response.data.results || response.data,
              total_results: response.data.total_results || response.data.total || 0
            };
          }
        }
      } catch (globalSearchError) {
        // If global search fails (500 error), fallback to individual endpoints
        console.warn('Global search failed, using fallback method:', globalSearchError.response?.status);
      }

      // Fallback: Search individual endpoints
      console.log('Using fallback search method');
      const results = {
        services: [],
        categories: [],
        products: []
      };

      // Search products
      if (type === 'all' || type === 'products') {
        try {
          const productsParams = new URLSearchParams();
          productsParams.append('search', searchQuery);
          productsParams.append('limit', limit);
          const productsResponse = await axiosInstance.get(`/products?${productsParams.toString()}`);
          if (productsResponse.data && productsResponse.data.success && productsResponse.data.data) {
            results.products = Array.isArray(productsResponse.data.data.products) 
              ? productsResponse.data.data.products 
              : (Array.isArray(productsResponse.data.data) ? productsResponse.data.data : []);
          }
        } catch (err) {
          console.error('Error searching products:', err);
        }
      }

      // Search services
      if (type === 'all' || type === 'services') {
        try {
          const servicesParams = new URLSearchParams();
          servicesParams.append('search', searchQuery);
          servicesParams.append('limit', limit);
          const servicesResponse = await axiosInstance.get(`/services?${servicesParams.toString()}`);
          if (servicesResponse.data && servicesResponse.data.success && servicesResponse.data.data) {
            results.services = Array.isArray(servicesResponse.data.data.services)
              ? servicesResponse.data.data.services
              : (Array.isArray(servicesResponse.data.data) ? servicesResponse.data.data : []);
          }
        } catch (err) {
          console.error('Error searching services:', err);
        }
      }

      // Search categories (filter client-side since there's no search param)
      if (type === 'all' || type === 'categories') {
        try {
          const categoriesResponse = await axiosInstance.get('/categories');
          if (categoriesResponse.data && categoriesResponse.data.success && categoriesResponse.data.data) {
            const allCategories = Array.isArray(categoriesResponse.data.data.categories)
              ? categoriesResponse.data.data.categories
              : (Array.isArray(categoriesResponse.data.data) ? categoriesResponse.data.data : []);
            
            // Filter categories by search query (case-insensitive)
            const searchLower = searchQuery.toLowerCase();
            results.categories = allCategories.filter(cat => {
              const name = (cat.name || '').toLowerCase();
              const description = (cat.description || '').toLowerCase();
              return name.includes(searchLower) || description.includes(searchLower);
            }).slice(0, limit);
          }
        } catch (err) {
          console.error('Error searching categories:', err);
        }
      }

      const total = results.services.length + results.categories.length + results.products.length;
      console.log('Fallback search results:', results);

      return {
        success: true,
        results: results,
        total_results: total
      };
    } catch (error) {
      console.error('Error performing search:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Return empty results instead of throwing
      return {
        success: false,
        results: { services: [], categories: [], products: [] },
        total_results: 0,
        error: error.message,
        status: error.response?.status
      };
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
