/**
 * Address utility functions for storing and retrieving addresses using the Address Management API
 */

import { addressApi, handleApiError } from '../services/apiService';
import authService from '../services/authService';

// Normalize location data from different sources
const normalizeLocation = (location) => {
  // If it's already in our format, return as is
  if (location.latitude && location.longitude) {
    return location;
  }
  
  // If it's a Google Maps place
  if (location.geometry && location.geometry.location) {
    const lat = typeof location.geometry.location.lat === 'function'
      ? location.geometry.location.lat()
      : location.geometry.location.lat;
    
    const lng = typeof location.geometry.location.lng === 'function'
      ? location.geometry.location.lng()
      : location.geometry.location.lng;
    
    return {
      ...location,
      latitude: lat,
      longitude: lng
    };
  }
  
  return location;
};

// Normalize address data for API
const normalizeAddressData = (addressData) => {
  const normalized = normalizeLocation(addressData);
  
  // Ensure we have all required fields
  return {
    name: normalized.name || 'العنوان الرئيسي',
    address_line1: normalized.address_line1 || '',
    city: normalized.city || '',
    state: normalized.state || '',
    postal_code: normalized.postal_code || '',
    country: normalized.country || '',
    latitude: normalized.latitude || 0,
    longitude: normalized.longitude || 0,
    place_id: normalized.place_id || '',
    is_default: normalized.isDefault || false,
    type: normalized.type || 'home'
  };
};

// Get all saved addresses
export const getSavedAddresses = async () => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw {
        code: "UNAUTHENTICATED",
        error: "Authentication required",
        message: "You must be authenticated to access this resource.",
        success: false
      };
    }
    
    const response = await addressApi.getAll();

    if (response.data && response.data.success) {
      return response.data.data || [];
    }

    return [];
  } catch (error) {
    console.error('Error getting saved addresses:', error);
    throw error;
  }
};

// Save a new address
export const saveAddress = async (addressData) => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw {
        code: "UNAUTHENTICATED",
        error: "Authentication required",
        message: "You must be authenticated to access this resource.",
        success: false
      };
    }
    
    // First validate the address if it's not already validated
    let validatedAddress = addressData;
    if (!addressData.address_components && addressData.formatted_address) {
      const validationResult = await validateAddress(addressData.formatted_address);
      if (validationResult.success) {
        validatedAddress = {
          ...addressData,
          ...validationResult.data
        };
      }
    }
    
    // Normalize address data
    const normalizedAddress = normalizeAddressData(validatedAddress);
    
    // Save to API
    const response = await addressApi.create(normalizedAddress);
    
    if (response.data && response.data.success) {
      // Get updated address list
      return await getSavedAddresses();
    }
    
    throw new Error(response.data?.message || 'Failed to save address');
  } catch (error) {
    console.error('Error saving address:', error);
    throw error;
  }
};

// Update an existing address
export const updateAddress = async (id, addressData) => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw {
        code: "UNAUTHENTICATED",
        error: "Authentication required",
        message: "You must be authenticated to access this resource.",
        success: false
      };
    }
    
    // First validate the address if it's not already validated
    let validatedAddress = addressData;
    if (!addressData.address_components && addressData.formatted_address) {
      const validationResult = await validateAddress(addressData.formatted_address);
      if (validationResult.success) {
        validatedAddress = {
          ...addressData,
          ...validationResult.data
        };
      }
    }
    
    // Normalize address data
    const normalizedAddress = normalizeAddressData(validatedAddress);
    
    // Update via API
    const response = await addressApi.update(id, normalizedAddress);
    
    if (response.data && response.data.success) {
      // Get updated address list
      return await getSavedAddresses();
    }
    
    throw new Error(response.data?.message || 'Failed to update address');
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

// Delete an address
export const deleteAddress = async (id) => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw {
        code: "UNAUTHENTICATED",
        error: "Authentication required",
        message: "You must be authenticated to access this resource.",
        success: false
      };
    }
    
    // Delete via API
    const response = await addressApi.delete(id);
    
    if (response.data && response.data.success) {
      // Get updated address list
      return await getSavedAddresses();
    }
    
    throw new Error(response.data?.message || 'Failed to delete address');
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

// Set an address as default
export const setDefaultAddress = async (id) => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw {
        code: "UNAUTHENTICATED",
        error: "Authentication required",
        message: "You must be authenticated to access this resource.",
        success: false
      };
    }
    
    // Set default via API
    const response = await addressApi.setDefault(id);
    
    if (response.data && response.data.success) {
      // Get updated address list
      return await getSavedAddresses();
    }
    
    throw new Error(response.data?.message || 'Failed to set default address');
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
};

// Get the default address
export const getDefaultAddress = async () => {
  try {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw {
        code: "UNAUTHENTICATED",
        error: "Authentication required",
        message: "You must be authenticated to access this resource.",
        success: false
      };
    }
    
    const addresses = await getSavedAddresses();
    
    // Find the default address
    const defaultAddress = addresses.find(address => address.is_default);
    
    return defaultAddress || null;
  } catch (error) {
    console.error('Error getting default address:', error);
    throw error;
  }
};

// Validate an address using the API
export const validateAddress = async (address) => {
  try {
    const response = await addressApi.validate(address);
    if (!response.data) {
      return { success: false, message: 'Failed to validate address' };
    }
    return response.data;
  } catch (error) {
    console.error('Error validating address:', error);
    return {
      success: false,
      message: handleApiError(error, 'Failed to validate address')
    };
  }
};

// Format address from address components
export const formatAddress = (addressComponents) => {
  try {
    if (!addressComponents || !Array.isArray(addressComponents)) {
      return '';
    }
    
    // Extract components
    const streetNumber = addressComponents.find(comp => comp.types.includes('street_number'))?.long_name || '';
    const route = addressComponents.find(comp => comp.types.includes('route'))?.long_name || '';
    const locality = addressComponents.find(comp => comp.types.includes('locality'))?.long_name || '';
    const area1 = addressComponents.find(comp => comp.types.includes('administrative_area_level_1'))?.long_name || '';
    const area2 = addressComponents.find(comp => comp.types.includes('administrative_area_level_2'))?.long_name || '';
    const country = addressComponents.find(comp => comp.types.includes('country'))?.long_name || '';
    const postalCode = addressComponents.find(comp => comp.types.includes('postal_code'))?.long_name || '';
    
    // Format address
    const streetAddress = [streetNumber, route].filter(Boolean).join(' ');
    const cityArea = [locality, area2].filter(Boolean).join(', ');
    const statePostal = [area1, postalCode].filter(Boolean).join(' ');
    
    // Combine all parts
    return [streetAddress, cityArea, statePostal, country].filter(Boolean).join(', ');
  } catch (error) {
    console.error('Error formatting address:', error);
    return '';
  }
}; 