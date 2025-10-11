import axios from 'axios';
import config from '../config/apiConfig';

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
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

  async signup(userData, autoLogin = true) {
    try {
      const response = await axiosInstance.post('/register', {
        name: userData.fullName,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.confirmPassword,
        role: 'customer'
      });

      // Auto-login after successful signup
      if (autoLogin && response.data.success) {
        try {
          const loginResponse = await this.login(userData.email, userData.password);
          return {
            ...response.data,
            autoLogin: true,
            loginData: loginResponse
          };
        } catch (loginError) {
          console.warn('Auto-login failed after signup:', loginError);
          // Return signup response even if auto-login fails
          return {
            ...response.data,
            autoLogin: false,
            loginError: loginError.message
          };
        }
      }

      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    }
  },

  async requestPasswordReset(email) {
    try {
      const response = await axiosInstance.post('/forgot-password', {
        email
      });
      
      return response.data;
    } catch (error) {
      console.error('Password reset request error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  async resetPassword(token, email, password, passwordConfirmation) {
    try {
      const response = await axiosInstance.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      
      return response.data;
    } catch (error) {
      console.error('Password reset error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMe');
    
    // Clear any pending requests by updating the axios instance
    delete axiosInstance.defaults.headers.common['Authorization'];
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