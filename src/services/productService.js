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
      
      console.log('[getProducts] Making API request to:', url);
      const response = await axiosInstance.get(url);
      
      console.log('[getProducts] Raw API response:', response);
      
      // Handle the specific API response structure
      let productsArray = [];
      
      // First check if response exists and has data
      if (!response || !response.data) {
        console.error('[getProducts] Empty response or missing data');
        return [];
      }
      
      // Log the response structure to help with debugging
      console.log('[getProducts] Response structure:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        nestedDataExists: response.data && !!response.data.data,
        nestedDataType: response.data && typeof response.data.data,
        productsExists: response.data && response.data.data && !!response.data.data.products,
        productsDataExists: response.data && response.data.data && response.data.data.products && !!response.data.data.products.data
      });
      
      // Try to extract products from various possible response structures
      if (Array.isArray(response.data)) {
        // Response is directly an array of products
        productsArray = response.data;
        console.log('[getProducts] Found products directly in response.data array');
      } 
      else if (response.data && response.data.data && response.data.data.products && Array.isArray(response.data.data.products.data)) {
        // Handle the specific nested structure: response.data.data.products.data
        productsArray = response.data.data.products.data;
        console.log('[getProducts] Found products in response.data.data.products.data');
      }
      else if (response.data && response.data.data && Array.isArray(response.data.data.products)) {
        // Handle the structure: response.data.data.products (array)
        productsArray = response.data.data.products;
        console.log('[getProducts] Found products in response.data.data.products array');
      }
      else if (response.data && Array.isArray(response.data.data)) {
        // Response has data field with array
        productsArray = response.data.data;
        console.log('[getProducts] Found products in response.data.data array');
      } 
      else if (response.data && Array.isArray(response.data.products)) {
        // Response has products field with array
        productsArray = response.data.products;
        console.log('[getProducts] Found products in response.data.products array');
      } 
      else if (response.data && typeof response.data === 'object') {
        // Response is an object, check if it has products inside
        if (response.data.products && Array.isArray(response.data.products)) {
          productsArray = response.data.products;
          console.log('[getProducts] Found products in response.data.products object property');
        } 
        else if (response.data.items && Array.isArray(response.data.items)) {
          productsArray = response.data.items;
          console.log('[getProducts] Found products in response.data.items');
        } 
        else if (response.data.data && Array.isArray(response.data.data)) {
          productsArray = response.data.data;
          console.log('[getProducts] Found products in response.data.data object property');
        }
        else if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
          // Handle case where data is an object with product properties
          console.log('[getProducts] response.data.data is an object, checking for products property');
          
          if (response.data.data.products) {
            if (Array.isArray(response.data.data.products)) {
              productsArray = response.data.data.products;
              console.log('[getProducts] Found products in response.data.data.products');
            } 
            else if (typeof response.data.data.products === 'object' && response.data.data.products.data) {
              productsArray = response.data.data.products.data;
              console.log('[getProducts] Found products in response.data.data.products.data');
            }
          }
        }
        else {
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
              console.log(`[getProducts] Found products in response.data.${productKey}`);
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
      
      // Validate that we have an array of products
      if (!Array.isArray(productsArray)) {
        console.error('[getProducts] Extracted productsArray is not an array:', productsArray);
        return [];
      }
      
      console.log(`[getProducts] Successfully extracted ${productsArray.length} products`);
      return productsArray;
      
    } catch (error) {
      console.error('[getProducts] Error:', error);
      console.error('Error details:', error.response?.data || error.message);
      return [];
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
      
      console.log(`[getProductById] Raw API response:`, response);
      
      // Handle different response formats
      let productData = null;
      
      if (!response || !response.data) {
        console.error('[getProductById] Empty response or missing data');
        return null;
      }
      
      // Try to extract product from various possible response structures
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        if (response.data.id || response.data._id) {
          // Direct product object
          productData = response.data;
          console.log('[getProductById] Found product directly in response.data');
        } else if (response.data.data && typeof response.data.data === 'object') {
          // Nested in data field
          productData = response.data.data;
          console.log('[getProductById] Found product in response.data.data');
        } else if (response.data.product && typeof response.data.product === 'object') {
          // Nested in product field
          productData = response.data.product;
          console.log('[getProductById] Found product in response.data.product');
        }
      }
      
      // If we couldn't find the product in the response
      if (!productData) {
        console.warn(`[getProductById] Product ${productId} not found in API response`);
        return null;
      }
      
      // Format the product data to match our application's expected format
      const formattedProduct = {
        id: productData.id || productData._id,
        name: productData.name || 'منتج بدون اسم',
        price: parseFloat(productData.price) || 0,
        description: productData.description || 'لا يوجد وصف متاح',
        image: productData.image || (productData.images && productData.images.length > 0 ? productData.images[0] : 'https://via.placeholder.com/150?text=No+Image'),
        category: typeof productData.category === 'object' ? productData.category.name : productData.category,
        categoryId: typeof productData.category === 'object' ? (productData.category.id || productData.category._id) : productData.category_id,
        stock: productData.stock_quantity || 0,
        rating: parseFloat(productData.rating) || 0,
        reviews: parseInt(productData.reviews) || 0,
        sku: productData.sku || '',
        weight: productData.weight || '',
        dimensions: productData.dimensions || {},
        specifications: productData.specifications || {},
        vendor: productData.vendor_profile?.business_name || 'غير محدد'
      };
      
      console.log(`[getProductById] Successfully formatted product data:`, formattedProduct);
      return formattedProduct;
    } catch (error) {
      console.error(`[getProductById] Error fetching product ${productId}:`, error);
      
      // Check if it's a 404 Not Found error
      if (error.response && error.response.status === 404) {
        console.warn(`[getProductById] Product ${productId} not found (404)`);
        return null;
      }
      
      // For other errors, throw the error
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
      } else if (response.data && response.data.data && Array.isArray(response.data.data.categories)) {
        return response.data.data.categories;
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
      } else if (response.data && response.data.data && Array.isArray(response.data.data.products)) {
        return response.data.data.products;
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