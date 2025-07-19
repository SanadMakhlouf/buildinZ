import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLocationDot,
  faSearch,
  faMapMarkerAlt,
  faSpinner,
  faPencilAlt,
  faCheck,
  faTimes,
  faPlus,
  faArrowDown,
  faExclamationTriangle,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import LocationModal from './LocationModal';
import {
  getDefaultAddress,
  formatAddress,
  validateAddress
} from '../utils/addressUtils';
import { isAuthenticated } from '../services/apiService';
import authService from '../services/authService';
import './LocationSelector.css';

const LocationSelector = ({ onLocationChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [displayAddress, setDisplayAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedAddress, setEditedAddress] = useState('');
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);
  
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);
  const editInputRef = useRef(null);
  
  // Load default address on mount
  useEffect(() => {
    const loadDefaultAddress = async () => {
      setIsLoading(true);
      setError(null);
      setAuthError(false);
      
      // Skip loading addresses if not authenticated
      if (!authService.isAuthenticated()) {
        setAuthError(true);
        setIsLoading(false);
        return;
      }
      
      try {
        const defaultAddress = await getDefaultAddress();
        if (defaultAddress) {
          setSelectedLocation(defaultAddress);
          
          // Format the address for display
          let displayAddr;
          if (defaultAddress.address_components) {
            displayAddr = formatAddress(defaultAddress.address_components);
          } else {
            // Format from API fields
            displayAddr = `${defaultAddress.address_line1}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.postal_code}`;
          }
          
          setDisplayAddress(displayAddr);
          
          if (onLocationChange) {
            onLocationChange(defaultAddress);
          }
        }
      } catch (error) {
        console.error('Error loading default address:', error);
        
        if (error.code === "UNAUTHENTICATED") {
          setAuthError(true);
        } else {
          setError('لم نتمكن من تحميل العنوان. يرجى المحاولة مرة أخرى.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDefaultAddress();
  }, [onLocationChange]);
  
  // Initialize map when expanded
  useEffect(() => {
    if (mapExpanded && mapRef.current && !mapLoaded && window.google && window.google.maps) {
      initializeMap();
    }
  }, [mapExpanded, mapLoaded]);
  
  // Focus input when editing
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);
  
  const initializeMap = () => {
    try {
      const defaultPosition = { lat: 25.276987, lng: 55.296249 }; // Dubai default
      let position = defaultPosition;
      
      // If we have a selected location with coordinates, use those
      if (selectedLocation) {
        if (selectedLocation.geometry && selectedLocation.geometry.location) {
          const lat = typeof selectedLocation.geometry.location.lat === 'function'
            ? selectedLocation.geometry.location.lat()
            : parseFloat(selectedLocation.geometry.location.lat);
          
          const lng = typeof selectedLocation.geometry.location.lng === 'function'
            ? selectedLocation.geometry.location.lng()
            : parseFloat(selectedLocation.geometry.location.lng);
          
          position = { lat, lng };
        } else if (selectedLocation.latitude && selectedLocation.longitude) {
          position = { 
            lat: parseFloat(selectedLocation.latitude), 
            lng: parseFloat(selectedLocation.longitude) 
          };
        }
      }
      
      // Create map
      const map = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        }
      });
      
      // Create marker
      const newMarker = new window.google.maps.Marker({
        position: position,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });
      
      // Initialize geocoder
      const geocoder = new window.google.maps.Geocoder();
      
      // Listen for marker drag events
      newMarker.addListener('dragend', () => {
        const position = newMarker.getPosition();
        
        // Reverse geocode the position
        geocoder.geocode({ location: position.toJSON() }, (results, status) => {
          if (status === 'OK' && results[0]) {
            updateLocationFromGeocode(results[0]);
          }
        });
      });
      
      // Listen for map click events
      map.addListener('click', (event) => {
        newMarker.setPosition(event.latLng);
        
        // Reverse geocode the position
        geocoder.geocode({ location: event.latLng.toJSON() }, (results, status) => {
          if (status === 'OK' && results[0]) {
            updateLocationFromGeocode(results[0]);
          }
        });
      });
      
      // Save references
      setMapInstance(map);
      setMarker(newMarker);
      geocoderRef.current = geocoder;
      setMapLoaded(true);
      setError(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('لم نتمكن من تحميل الخريطة. يرجى التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.');
      setMapLoaded(false);
    }
  };
  
  const updateLocationFromGeocode = (geocodeResult) => {
    try {
      const formattedAddress = formatAddress(geocodeResult.address_components);
      setSelectedLocation(geocodeResult);
      setDisplayAddress(formattedAddress || geocodeResult.formatted_address);
      setEditedAddress(formattedAddress || geocodeResult.formatted_address);
      
      if (onLocationChange) {
        onLocationChange(geocodeResult);
      }
      setError(null);
    } catch (error) {
      console.error('Error updating location from geocode:', error);
      setError('حدث خطأ أثناء تحديث الموقع. يرجى المحاولة مرة أخرى.');
    }
  };
  
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("متصفحك لا يدعم تحديد الموقع.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = { lat: latitude, lng: longitude };
        
        // Update map and marker
        if (mapInstance && marker) {
          mapInstance.setCenter(newPosition);
          marker.setPosition(newPosition);
          
          // Reverse geocode the position
          if (geocoderRef.current) {
            geocoderRef.current.geocode({ location: newPosition }, (results, status) => {
              if (status === 'OK' && results[0]) {
                updateLocationFromGeocode(results[0]);
              } else {
                setError('لم نتمكن من تحديد العنوان بناءً على الموقع. يرجى المحاولة مرة أخرى.');
              }
              setIsLoading(false);
            });
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("لم نتمكن من تحديد موقعك. يرجى السماح بالوصول إلى الموقع أو إدخال العنوان يدويًا.");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  
  const handleLocationSelect = (address) => {
    setDisplayAddress(address);
    setEditedAddress(address);
    setIsModalOpen(false);
    setError(null);
  };
  
  const handleEditToggle = () => {
    if (!authService.isAuthenticated() && !isEditing) {
      setAuthError(true);
      return;
    }
    
    if (isEditing) {
      // Save changes
      handleSaveEdit();
    } else {
      // Start editing
      setEditedAddress(displayAddress);
    }
    setIsEditing(!isEditing);
  };
  
  const handleSaveEdit = async () => {
    if (!editedAddress.trim()) {
      return;
    }
    
    if (!authService.isAuthenticated()) {
      setAuthError(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate the address
      const validationResult = await validateAddress(editedAddress);
      
      if (validationResult.success) {
        const validatedData = validationResult.data;
        
        // Update the display address
        setDisplayAddress(validatedData.formatted_address);
        
        // Update the selected location with validated data
        const updatedLocation = {
          ...selectedLocation,
          formatted_address: validatedData.formatted_address,
          place_id: validatedData.place_id,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          address_components: validatedData.address_components,
          address_line1: validatedData.structured_address.address_line1,
          city: validatedData.structured_address.city,
          state: validatedData.structured_address.state,
          postal_code: validatedData.structured_address.postal_code,
          country: validatedData.structured_address.country
        };
        
        setSelectedLocation(updatedLocation);
        
        // Update map and marker if available
        if (mapInstance && marker) {
          const position = { 
            lat: parseFloat(validatedData.latitude), 
            lng: parseFloat(validatedData.longitude) 
          };
          mapInstance.setCenter(position);
          marker.setPosition(position);
        }
        
        if (onLocationChange) {
          onLocationChange(updatedLocation);
        }
      } else {
        setError("لم نتمكن من التحقق من هذا العنوان. يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error validating address:", error);
      if (error.code === "UNAUTHENTICATED") {
        setAuthError(true);
      } else {
        setError("حدث خطأ أثناء التحقق من العنوان. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditCancel = () => {
    setEditedAddress(displayAddress);
    setIsEditing(false);
    setError(null);
  };
  
  const handleMapToggle = () => {
    setMapExpanded(!mapExpanded);
    // Clear error when toggling map
    if (!mapExpanded) {
      setError(null);
    }
  };
  
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    
    if (!editedAddress.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Validate the address
      const validationResult = await validateAddress(editedAddress);
      
      if (validationResult.success) {
        const validatedData = validationResult.data;
        
        // Update the display address
        setDisplayAddress(validatedData.formatted_address);
        setEditedAddress(validatedData.formatted_address);
        
        // Update the selected location with validated data
        const updatedLocation = {
          formatted_address: validatedData.formatted_address,
          place_id: validatedData.place_id,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          address_components: validatedData.address_components,
          address_line1: validatedData.structured_address.address_line1,
          city: validatedData.structured_address.city,
          state: validatedData.structured_address.state,
          postal_code: validatedData.structured_address.postal_code,
          country: validatedData.structured_address.country
        };
        
        setSelectedLocation(updatedLocation);
        
        // Update map and marker if available
        if (mapInstance && marker) {
          const position = { 
            lat: parseFloat(validatedData.latitude), 
            lng: parseFloat(validatedData.longitude) 
          };
          mapInstance.setCenter(position);
          marker.setPosition(position);
          mapInstance.setZoom(16);
        }
        
        if (onLocationChange) {
          onLocationChange(updatedLocation);
        }
      } else {
        setError("لم نتمكن من العثور على هذا العنوان. يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error searching address:", error);
      if (error.code === "UNAUTHENTICATED") {
        setAuthError(true);
      } else {
        setError("حدث خطأ أثناء البحث عن العنوان. يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRetry = () => {
    setError(null);
    setAuthError(false);
    
    if (!authService.isAuthenticated()) {
      // If not authenticated, show login prompt
      setAuthError(true);
      return;
    }
    
    if (mapExpanded && !mapLoaded) {
      initializeMap();
    } else {
      // Retry loading default address
      const loadDefaultAddress = async () => {
        setIsLoading(true);
        try {
          const defaultAddress = await getDefaultAddress();
          if (defaultAddress) {
            setSelectedLocation(defaultAddress);
            
            // Format the address for display
            let displayAddr;
            if (defaultAddress.address_components) {
              displayAddr = formatAddress(defaultAddress.address_components);
            } else {
              // Format from API fields
              displayAddr = `${defaultAddress.address_line1}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.postal_code}`;
            }
            
            setDisplayAddress(displayAddr);
            
            if (onLocationChange) {
              onLocationChange(defaultAddress);
            }
          }
        } catch (error) {
          console.error('Error loading default address:', error);
          if (error.code === "UNAUTHENTICATED") {
            setAuthError(true);
          } else {
            setError('لم نتمكن من تحميل العنوان. يرجى المحاولة مرة أخرى.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      loadDefaultAddress();
    }
  };
  
  const handleLogin = () => {
    // Redirect to login page with return URL
    window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
  };
  
  return (
    <div className="location-selector">
      <div className="location-header">
        <div className="location-icon">
          <FontAwesomeIcon icon={faLocationDot} />
        </div>
        
        {isEditing ? (
          <form className="location-edit-form" onSubmit={handleSearchAddress}>
            <input
              ref={editInputRef}
              type="text"
              className="location-edit-input"
              value={editedAddress}
              onChange={(e) => setEditedAddress(e.target.value)}
              placeholder="أدخل عنوانك..."
              disabled={isLoading}
            />
            <div className="location-edit-actions">
              {isLoading ? (
                <span className="loading-spinner">
                  <FontAwesomeIcon icon={faSpinner} spin />
                </span>
              ) : (
                <>
                  <button type="submit" className="location-edit-btn search-btn" title="بحث">
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                  <button type="button" className="location-edit-btn save-btn" onClick={handleEditToggle} title="حفظ">
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                  <button type="button" className="location-edit-btn cancel-btn" onClick={handleEditCancel} title="إلغاء">
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div className="location-display">
            <div className="location-text">
              {isLoading ? (
                <span className="loading-text">
                  <FontAwesomeIcon icon={faSpinner} spin /> جاري تحميل العنوان...
                </span>
              ) : authError ? (
                <span className="auth-error-text">
                  <FontAwesomeIcon icon={faLock} /> قم بتسجيل الدخول لتحديد موقعك
                </span>
              ) : error ? (
                <span className="error-text">
                  <FontAwesomeIcon icon={faExclamationTriangle} /> خطأ في تحميل العنوان
                </span>
              ) : (
                displayAddress || 'حدد موقعك'
              )}
            </div>
            <div className="location-actions">
              <button 
                className="location-action-btn" 
                onClick={handleEditToggle} 
                title="تعديل العنوان"
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faPencilAlt} />
              </button>
              <button 
                className="location-action-btn" 
                onClick={() => setIsModalOpen(true)} 
                title="اختيار من العناوين المحفوظة"
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <button 
                className={`location-action-btn map-toggle ${mapExpanded ? 'active' : ''}`}
                onClick={handleMapToggle}
                title={mapExpanded ? 'إخفاء الخريطة' : 'إظهار الخريطة'}
                disabled={isLoading}
              >
                <FontAwesomeIcon icon={faArrowDown} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="location-error">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
          <button className="retry-btn" onClick={handleRetry}>
            إعادة المحاولة
          </button>
        </div>
      )}
      
      {authError && (
        <div className="auth-error">
          <FontAwesomeIcon icon={faLock} /> قم بتسجيل الدخول لإدارة العناوين
          <button className="login-btn" onClick={handleLogin}>
            تسجيل الدخول
          </button>
        </div>
      )}
      
      {mapExpanded && (
        <div className="location-map-wrapper">
          <div className="location-map-container">
            <div ref={mapRef} className="location-map"></div>
            {(!mapLoaded || isLoading) && (
              <div className="map-loading">
                <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
                <p>جاري تحميل الخريطة...</p>
              </div>
            )}
          </div>
          
          <div className="location-map-actions">
            <button 
              className="map-action-btn current-location-btn" 
              onClick={handleGetCurrentLocation}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>موقعي الحالي</span>
            </button>
          </div>
        </div>
      )}
      
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectLocation={handleLocationSelect}
      />
    </div>
  );
};

export default LocationSelector; 