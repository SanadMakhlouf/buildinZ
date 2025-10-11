import axios from 'axios';
import authService from './authService';
import config from '../config/apiConfig';

console.log('Using API base URL:', config.API_BASE_URL);

// Create axios instance with base URL
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a timeout to prevent hanging requests
  timeout: 15000,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Using the same token name as authService
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle connection errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject({
        message: 'لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.',
        originalError: error
      });
    }
    
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Just clear the token but don't redirect (prevents refresh loops)
      localStorage.removeItem('token');
      console.warn('Authentication Error: Token cleared');
      
      // Return a standardized error format
      return Promise.reject({
        code: "UNAUTHENTICATED",
        error: "Authentication required",
        message: "You must be authenticated to access this resource.",
        success: false
      });
    }
    
    // Handle server errors (500)
    if (error.response && error.response.status >= 500) {
      console.error('Server Error:', error.response.data);
    }
    
    // Handle validation errors (422)
    if (error.response && error.response.status === 422) {
      console.warn('Validation Error:', error.response.data);
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

// Helper function to handle API errors
const handleApiError = (error, fallbackMessage = 'حدث خطأ. يرجى المحاولة مرة أخرى.') => {
  if (error.message) {
    return error.message;
  }
  return fallbackMessage;
};

// Check if user is authenticated - use authService's implementation
const isAuthenticated = () => authService.isAuthenticated();

// Address API endpoints with error handling
const addressApi = {
  // Get all addresses
  getAll: async () => {
    try {
      if (!isAuthenticated()) {
        return { 
          data: { 
            success: false, 
            data: [], 
            code: "UNAUTHENTICATED",
            error: "Authentication required",
            message: "You must be authenticated to access this resource."
          } 
        };
      }
      return await api.get('/addresses');
    } catch (error) {
      console.error('Error fetching addresses:', error);
      // Return empty success response to prevent app crashes
      return { 
        data: { 
          success: false, 
          data: [], 
          message: handleApiError(error) 
        } 
      };
    }
  },
  
  // Get address by ID
  getById: async (id) => {
    try {
      if (!isAuthenticated()) {
        throw {
          code: "UNAUTHENTICATED",
          error: "Authentication required",
          message: "You must be authenticated to access this resource.",
          success: false
        };
      }
      return await api.get(`/addresses/${id}`);
    } catch (error) {
      console.error(`Error fetching address ${id}:`, error);
      throw error;
    }
  },
  
  // Create new address
  create: async (addressData) => {
    try {
      if (!isAuthenticated()) {
        throw {
          code: "UNAUTHENTICATED",
          error: "Authentication required",
          message: "You must be authenticated to access this resource.",
          success: false
        };
      }
      return await api.post('/addresses', addressData);
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  },
  
  // Update address
  update: async (id, addressData) => {
    try {
      if (!isAuthenticated()) {
        throw {
          code: "UNAUTHENTICATED",
          error: "Authentication required",
          message: "You must be authenticated to access this resource.",
          success: false
        };
      }
      return await api.put(`/addresses/${id}`, addressData);
    } catch (error) {
      console.error(`Error updating address ${id}:`, error);
      throw error;
    }
  },
  
  // Delete address
  delete: async (id) => {
    try {
      if (!isAuthenticated()) {
        throw {
          code: "UNAUTHENTICATED",
          error: "Authentication required",
          message: "You must be authenticated to access this resource.",
          success: false
        };
      }
      return await api.delete(`/addresses/${id}`);
    } catch (error) {
      console.error(`Error deleting address ${id}:`, error);
      throw error;
    }
  },
  
  // Set default address
  setDefault: async (id) => {
    try {
      if (!isAuthenticated()) {
        throw {
          code: "UNAUTHENTICATED",
          error: "Authentication required",
          message: "You must be authenticated to access this resource.",
          success: false
        };
      }
      return await api.put(`/addresses/${id}/default`);
    } catch (error) {
      console.error(`Error setting default address ${id}:`, error);
      throw error;
    }
  },
  
  // Validate address
  validate: async (address) => {
    try {
      // Validation can work without authentication
      return await api.post('/addresses/validate', { address });
    } catch (error) {
      console.error('Error validating address:', error);
      throw error;
    }
  }
};

// Auth API endpoints
const authApi = {
  // Login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Register
  register: (userData) => api.post('/auth/register', userData),
  
  // Forgot password
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  
  // Reset password
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  
  // Get current user
  getCurrentUser: () => api.get('/auth/me')
};

// Services API endpoints
const servicesApi = {
  // Get all services
  getAll: (params) => api.get('/services', { params }),
  
  // Get service by ID
  getById: (id) => api.get(`/services/${id}`),
  
  // Get service categories
  getCategories: () => api.get('/services/categories')
};

// Products API endpoints
const productsApi = {
  // Get all products
  getAll: (params) => api.get('/products', { params }),
  
  // Get product by ID
  getById: (id) => api.get(`/products/${id}`)
};

// Bookings API endpoints
const bookingsApi = {
  // Get all bookings
  getAll: () => api.get('/bookings'),
  
  // Get booking by ID
  getById: (id) => api.get(`/bookings/${id}`),
  
  // Create new booking
  create: (bookingData) => api.post('/bookings', bookingData),
  
  // Cancel booking
  cancel: (id) => api.put(`/bookings/${id}/cancel`)
};

export {
  api as default,
  addressApi,
  authApi,
  servicesApi,
  productsApi,
  bookingsApi,
  handleApiError,
  isAuthenticated
}; 