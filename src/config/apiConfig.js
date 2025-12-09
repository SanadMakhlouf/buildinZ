/**
 * API Configuration
 * Centralized configuration for all API endpoints and base URLs
 */

// Environment-based configuration
const config = {
  // API Base URLs
  API_BASE_URL: process.env.REACT_APP_BACKEND_API || 'http://localhost:8000/api',
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000',
  
  // Specific API endpoints
  endpoints: {
    // Categories
    categories: '/api/categories',
    
    // Orders
    orders: '/api/orders',
    orderById: (id) => `/api/orders/${id}`,
    
    // Payments
    payments: {
      verify: '/api/payments/verify'
    },
    
    // Service Builder
    serviceBuilder: '/service-builder',
    
    // Storage
    storage: '/storage'
  },
  
  // Utility functions
  utils: {
    // Get full API URL
    getApiUrl: (endpoint) => `${config.API_BASE_URL}${endpoint}`,
    
    // Get backend URL
    getBackendUrl: (endpoint) => `${config.BACKEND_URL}${endpoint}`,
    
    // Get image URL
    getImageUrl: (imagePath) => {
      if (!imagePath) {
        console.log('getImageUrl: No image path provided');
        return '';
      }
      if (imagePath.startsWith('http')) {
        console.log('getImageUrl: Already a full URL:', imagePath);
        return imagePath;
      }
      const result = `${config.BACKEND_URL}${config.endpoints.storage}/${imagePath}`;
      console.log('getImageUrl: Constructed URL:', {
        imagePath,
        backendUrl: config.BACKEND_URL,
        storageEndpoint: config.endpoints.storage,
        result
      });
      return result;
    }
  }
};

export default config;

