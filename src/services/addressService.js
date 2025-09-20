import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API || 'http://127.0.0.1:8000/api';

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
  return Promise.reject(error);
});

export const addressService = {
  // Get all addresses for the authenticated user
  async getAllAddresses() {
    try {
      const response = await axiosInstance.get('/addresses');
      return response.data?.data || [];
    } catch (error) {
      console.error('Get addresses error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get a specific address by ID
  async getAddressById(id) {
    try {
      const response = await axiosInstance.get(`/addresses/${id}`);
      return response.data?.data || null;
    } catch (error) {
      console.error(`Get address ${id} error:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Create a new address
  async createAddress(addressData) {
    try {
      const response = await axiosInstance.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error('Create address error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update an existing address
  async updateAddress(id, addressData) {
    try {
      const response = await axiosInstance.put(`/addresses/${id}`, addressData);
      return response.data;
    } catch (error) {
      console.error(`Update address ${id} error:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Delete an address
  async deleteAddress(id) {
    try {
      const response = await axiosInstance.delete(`/addresses/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Delete address ${id} error:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Set an address as default
  async setDefaultAddress(id) {
    try {
      const response = await axiosInstance.put(`/addresses/${id}/default`);
      return response.data;
    } catch (error) {
      console.error(`Set default address ${id} error:`, error.response?.data || error.message);
      throw error;
    }
  },

  // Validate an address using Google Maps (if available)
  async validateAddress(address) {
    try {
      const response = await axiosInstance.post('/addresses/validate', { address });
      return response.data;
    } catch (error) {
      console.error('Validate address error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get current location using browser's geolocation API
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported, using fallback location');
        return resolve(this.getFallbackLocation());
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Try to reverse geocode using Google Maps API
            if (window.google && window.google.maps) {
              const geocoder = new window.google.maps.Geocoder();
              
              geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  const addressResult = results[0];
                  
                  // Format address data
                  const addressData = {
                    formatted_address: addressResult.formatted_address,
                    address_components: addressResult.address_components,
                    place_id: addressResult.place_id,
                    latitude,
                    longitude
                  };
                  
                  resolve(addressData);
                } else {
                  // If geocoding fails, still return coordinates
                  resolve({
                    latitude,
                    longitude,
                    formatted_address: `Latitude: ${latitude}, Longitude: ${longitude}`
                  });
                }
              });
            } else {
              // If Google Maps is not available, just return coordinates
              resolve({
                latitude,
                longitude,
                formatted_address: `Latitude: ${latitude}, Longitude: ${longitude}`
              });
            }
          } catch (error) {
            console.error('Error processing location:', error);
            console.warn('Using fallback location due to processing error');
            resolve(this.getFallbackLocation());
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          console.warn('Using fallback location due to geolocation error');
          resolve(this.getFallbackLocation());
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  // Provide a fallback location for testing or when geolocation fails
  getFallbackLocation() {
    // Default location (Dubai)
    return {
      latitude: 25.2048,
      longitude: 55.2708,
      formatted_address: "دبي، الإمارات العربية المتحدة",
      place_id: "ChIJRcbZaklDXz4RYlEphFBu5r0",
      address_components: [
        {
          long_name: "دبي",
          short_name: "دبي",
          types: ["locality", "political"]
        },
        {
          long_name: "دبي",
          short_name: "دبي",
          types: ["administrative_area_level_1", "political"]
        },
        {
          long_name: "الإمارات العربية المتحدة",
          short_name: "AE",
          types: ["country", "political"]
        }
      ]
    };
  },

  // Create an address from current location
  async createAddressFromCurrentLocation(name = 'موقعي الحالي') {
    try {
      const locationData = await this.getCurrentLocation();
      
      // Try to validate the address if we have a formatted address
      let validatedData = locationData;
      if (locationData.formatted_address) {
        try {
          const validationResult = await this.validateAddress(locationData.formatted_address);
          if (validationResult.success) {
            validatedData = {
              ...validatedData,
              ...validationResult.data
            };
          }
        } catch (validationError) {
          console.warn('Address validation failed, proceeding with original data:', validationError);
        }
      }
      
      // Prepare address data for creation
      const addressData = {
        name,
        address_line1: validatedData.formatted_address || `${validatedData.latitude}, ${validatedData.longitude}`,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        place_id: validatedData.place_id,
        is_default: false // Don't set as default automatically
      };
      
      // Extract emirate from structured address or address components
      if (validatedData.structured_address) {
        // Try to use administrative_area as the emirate
        addressData.city = validatedData.structured_address.administrative_area || 
                         validatedData.structured_address.city || '';
      } else if (validatedData.address_components) {
        // First try to extract emirate from administrative_area_level_1
        const adminComponent = validatedData.address_components.find(
          comp => comp.types.includes('administrative_area_level_1')
        );
        
        if (adminComponent) {
          addressData.city = adminComponent.long_name;
        } else {
          // Try to extract from locality if administrative_area is not available
          const cityComponent = validatedData.address_components.find(
            comp => comp.types.includes('locality')
          );
          
          if (cityComponent) {
            addressData.city = cityComponent.long_name;
          }
        }
      }
      
      // If this is the fallback location (Dubai), ensure emirate is set to Dubai
      if (validatedData.latitude === 25.2048 && validatedData.longitude === 55.2708) {
        addressData.city = 'دبي';
      }
      
      // Create the address
      const response = await this.createAddress(addressData);
      return response;
    } catch (error) {
      console.error('Error creating address from current location:', error);
      throw error;
    }
  },
  
  // Get default address or create one from current location if none exists
  async getOrCreateDefaultAddress() {
    try {
      // First try to get the default address
      const addresses = await this.getAllAddresses();
      const defaultAddress = addresses.find(addr => addr.is_default);
      
      if (defaultAddress) {
        return defaultAddress;
      }
      
      try {
        // If no default address exists, try to create one from current location
        const locationResponse = await this.createAddressFromCurrentLocation();
        
        if (locationResponse.success && locationResponse.data) {
          // Set as default
          await this.setDefaultAddress(locationResponse.data.id);
          
          // Get updated addresses
          const updatedAddresses = await this.getAllAddresses();
          return updatedAddresses.find(addr => addr.is_default);
        }
      } catch (locationError) {
        // If location fails, return null instead of throwing
        console.warn('Could not create address from location:', locationError);
        return null;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting or creating default address:', error);
      return null; // Return null instead of throwing to prevent app crashes
    }
  }
};

export default addressService; 