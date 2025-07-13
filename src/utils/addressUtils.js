/**
 * Address utility functions for storing and retrieving addresses
 */

// Helper function to normalize location data
const normalizeLocation = (location) => {
  if (!location) return null;
  
  // Handle Google Maps location objects which might have lat/lng as functions
  if (typeof location === 'object') {
    const lat = typeof location.lat === 'function' ? location.lat() : parseFloat(location.lat);
    const lng = typeof location.lng === 'function' ? location.lng() : parseFloat(location.lng);
    return { lat, lng };
  }
  
  return location;
};

// Helper function to normalize address data before saving
const normalizeAddressData = (address) => {
  if (!address) return null;
  
  // Create a clean copy of the address object
  const normalizedAddress = { ...address };
  
  // Normalize geometry.location if it exists
  if (normalizedAddress.geometry && normalizedAddress.geometry.location) {
    normalizedAddress.geometry.location = normalizeLocation(normalizedAddress.geometry.location);
  }
  
  return normalizedAddress;
};

// Get saved addresses from local storage
export const getSavedAddresses = () => {
  try {
    const savedAddresses = localStorage.getItem('savedAddresses');
    return savedAddresses ? JSON.parse(savedAddresses) : [];
  } catch (error) {
    console.error('Error getting saved addresses:', error);
    return [];
  }
};

// Add a new address to saved addresses
export const saveAddress = (address) => {
  try {
    const savedAddresses = getSavedAddresses();
    
    // Normalize address data
    const normalizedAddress = normalizeAddressData(address);
    
    // Check if this address already exists
    const exists = savedAddresses.some(
      addr => addr.formatted_address === normalizedAddress.formatted_address
    );
    
    if (!exists) {
      // Add the new address with a unique ID
      const newAddress = {
        ...normalizedAddress,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isDefault: savedAddresses.length === 0 // First address is default
      };
      
      const updatedAddresses = [...savedAddresses, newAddress];
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
      return updatedAddresses;
    }
    
    return savedAddresses;
  } catch (error) {
    console.error('Error saving address:', error);
    return getSavedAddresses();
  }
};

// Update an existing address
export const updateAddress = (id, updatedAddress) => {
  try {
    const savedAddresses = getSavedAddresses();
    
    // Normalize address data
    const normalizedAddress = normalizeAddressData(updatedAddress);
    
    const updatedAddresses = savedAddresses.map(addr => 
      addr.id === id ? { ...addr, ...normalizedAddress } : addr
    );
    
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    return updatedAddresses;
  } catch (error) {
    console.error('Error updating address:', error);
    return getSavedAddresses();
  }
};

// Delete an address
export const deleteAddress = (id) => {
  try {
    const savedAddresses = getSavedAddresses();
    const updatedAddresses = savedAddresses.filter(addr => addr.id !== id);
    
    // If we deleted the default address, make the first one default
    if (savedAddresses.find(addr => addr.id === id)?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }
    
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    return updatedAddresses;
  } catch (error) {
    console.error('Error deleting address:', error);
    return getSavedAddresses();
  }
};

// Set an address as default
export const setDefaultAddress = (id) => {
  try {
    const savedAddresses = getSavedAddresses();
    const updatedAddresses = savedAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    
    localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    return updatedAddresses;
  } catch (error) {
    console.error('Error setting default address:', error);
    return getSavedAddresses();
  }
};

// Get the default address
export const getDefaultAddress = () => {
  try {
    const savedAddresses = getSavedAddresses();
    return savedAddresses.find(addr => addr.isDefault) || 
           (savedAddresses.length > 0 ? savedAddresses[0] : null);
  } catch (error) {
    console.error('Error getting default address:', error);
    return null;
  }
};

// Format address components for display
export const formatAddress = (addressComponents) => {
  if (!addressComponents) return '';
  
  // Extract relevant address components
  const city = addressComponents.find(component => 
    component.types.includes('locality') || 
    component.types.includes('administrative_area_level_1')
  )?.long_name || '';
  
  const area = addressComponents.find(component => 
    component.types.includes('sublocality') || 
    component.types.includes('neighborhood')
  )?.long_name || '';
  
  const street = addressComponents.find(component => 
    component.types.includes('route')
  )?.long_name || '';
  
  // Return formatted address
  if (city && area && street) {
    return `${area}، ${street}، ${city}`;
  } else if (city && area) {
    return `${area}، ${city}`;
  } else if (city) {
    return city;
  } else {
    return 'عنوان غير معروف';
  }
}; 