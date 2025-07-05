import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API || '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor to add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  async login(email, password, rememberMe = false) {
    try {
      const response = await axiosInstance.post('/login', {
        email,
        password,
        device_name: navigator.userAgent
      });

      // Store token and user info
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      // Optional: Set remember me functionality
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  async signup(userData) {
    try {
      const response = await axiosInstance.post('/register', {
        name: userData.fullName,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.confirmPassword,
        role: 'customer'
      });

      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
  },

  getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default authService; 