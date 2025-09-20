import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API || 'http://127.0.0.1:8000/api';

// Create axios instance with authentication
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
        window.location.href = '/login';
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

const productService = {
  async getProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.size) queryParams.append('size', filters.size);
      if (filters.minPrice) queryParams.append('min_price', filters.minPrice);
      if (filters.maxPrice) queryParams.append('max_price', filters.maxPrice);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sort) queryParams.append('sort', filters.sort);
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      
      const response = await axiosInstance.get(`/products?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProductById(productId) {
    try {
      // Make sure productId is properly formatted
      const id = parseInt(productId);
      if (isNaN(id)) {
        throw new Error('Invalid product ID');
      }
      
      const response = await axiosInstance.get(`/products/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching product ${productId}:`, error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const response = await axiosInstance.get('/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async searchProducts(query) {
    try {
      const response = await axiosInstance.get(`/products/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default productService; 