import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLocationDot, 
  faTimes, 
  faSearch, 
  faPlus, 
  faTrash, 
  faHome, 
  faBuilding, 
  faCheck, 
  faEdit,
  faMapMarkerAlt,
  faSpinner,
  faExclamationTriangle,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import '../styles/LocationModal.css';
import { 
  getSavedAddresses, 
  saveAddress, 
  deleteAddress, 
  setDefaultAddress, 
  getDefaultAddress,
  formatAddress,
  validateAddress,
  updateAddress
} from '../utils/addressUtils';
import authService from '../services/authService';

const LocationModal = ({ isOpen, onClose, onSelectLocation }) => {
  const [view, setView] = useState('map'); // 'map' or 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 25.276987, lng: 55.296249 }); // Dubai default
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressName, setAddressName] = useState('');
  const [addressType, setAddressType] = useState('home');
  const [isSaving, setIsSaving] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);
  
  const modalRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchBoxRef = useRef(null);
  const geocoderRef = useRef(null);

  // Check if Google Maps API is loaded
  useEffect(() => {
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
        return true;
      }
      return false;
    };

    // If already loaded
    if (checkGoogleMapsLoaded()) {
      return;
    }

    // Set up a listener for the googleMapsLoaded flag
    const checkInterval = setInterval(() => {
      if (checkGoogleMapsLoaded()) {
        clearInterval(checkInterval);
      }
    }, 100);

    // Clean up
    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  // Load saved addresses
  useEffect(() => {
    if (isOpen) {
      const loadAddresses = async () => {
        setIsLoading(true);
        setAuthError(false);
        setError(null);
        
        // Skip loading addresses if not authenticated
        if (!authService.isAuthenticated()) {
          setAuthError(true);
          setIsLoading(false);
          return;
        }
        
        try {
          const addresses = await getSavedAddresses();
          setSavedAddresses(addresses);
          
          // Check if there's a default address
          const defaultAddress = await getDefaultAddress();
          if (defaultAddress && defaultAddress.latitude && defaultAddress.longitude) {
            setMapCenter({
              lat: parseFloat(defaultAddress.latitude),
              lng: parseFloat(defaultAddress.longitude)
            });
          }
        } catch (error) {
          console.error('Error loading addresses:', error);
          if (error.code === "UNAUTHENTICATED") {
            setAuthError(true);
          } else {
            setError('لم نتمكن من تحميل العناوين. يرجى المحاولة مرة أخرى.');
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      loadAddresses();
    }
  }, [isOpen]);

  // Initialize Google Maps
  useEffect(() => {
    if (!isOpen || !mapsLoaded || !mapRef.current) return;

    setLoadingMap(true);

    try {
      // Create map instance
      const mapOptions = {
        center: mapCenter,
        zoom: 15,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_TOP
        }
      };
      
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;
      
      // Create marker
      const marker = new window.google.maps.Marker({
        position: mapCenter,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP
      });
      markerRef.current = marker;
      
      // Initialize geocoder
      const geocoder = new window.google.maps.Geocoder();
      geocoderRef.current = geocoder;
      
      // Initialize search box
      const searchInput = document.getElementById('location-search-input');
      if (searchInput) {
        const searchBox = new window.google.maps.places.SearchBox(searchInput);
        searchBoxRef.current = searchBox;
        
        // Bias search results to current map viewport
        map.addListener('bounds_changed', () => {
          searchBox.setBounds(map.getBounds());
        });
        
        // Listen for search box selections
        searchBox.addListener('places_changed', () => {
          const places = searchBox.getPlaces();
          if (places.length === 0) return;
          
          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;
          
          // Set marker and center map
          marker.setPosition(place.geometry.location);
          map.setCenter(place.geometry.location);
          map.setZoom(17);
          
          // Update selected location
          setSelectedLocation(place);
        });
      }
      
      // Listen for marker drag events
      marker.addListener('dragend', () => {
        const position = marker.getPosition();
        map.setCenter(position);
        
        // Reverse geocode the position
        geocoder.geocode({ location: position.toJSON() }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setSelectedLocation(results[0]);
          }
        });
      });
      
      // Listen for map click events
      map.addListener('click', (event) => {
        marker.setPosition(event.latLng);
        
        // Reverse geocode the position
        geocoder.geocode({ location: event.latLng.toJSON() }, (results, status) => {
          if (status === 'OK' && results[0]) {
            setSelectedLocation(results[0]);
          }
        });
      });
      
      // Initial reverse geocoding
      geocoder.geocode({ location: mapCenter }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setSelectedLocation(results[0]);
        }
        setLoadingMap(false);
      });
      
      return () => {
        // Cleanup
        if (markerRef.current) {
          window.google.maps.event.clearInstanceListeners(markerRef.current);
        }
        if (mapInstanceRef.current) {
          window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        }
        if (searchBoxRef.current) {
          window.google.maps.event.clearInstanceListeners(searchBoxRef.current);
        }
      };
    } catch (error) {
      console.error("Error initializing Google Maps:", error);
      setLoadingMap(false);
      setError('لم نتمكن من تحميل الخريطة. يرجى المحاولة مرة أخرى.');
    }
  }, [isOpen, mapCenter, mapsLoaded]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle getting user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCenter = { lat: latitude, lng: longitude };
          
          // Update map and marker
          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setCenter(newCenter);
            markerRef.current.setPosition(newCenter);
            
            // Reverse geocode the position
            if (geocoderRef.current) {
              geocoderRef.current.geocode({ location: newCenter }, (results, status) => {
                if (status === 'OK' && results[0]) {
                  setSelectedLocation(results[0]);
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
          
          setMapCenter(newCenter);
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
    } else {
      setError("متصفحك لا يدعم تحديد الموقع.");
    }
  };

  const handleSaveAddress = async () => {
    if (!selectedLocation) return;
    
    // Check authentication
    if (!authService.isAuthenticated()) {
      setAuthError(true);
      return;
    }
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Create address object
      const addressData = {
        ...selectedLocation,
        name: addressName || 'العنوان الرئيسي',
        type: addressType,
        displayAddress: formatAddress(selectedLocation.address_components),
        isDefault: editingAddress ? editingAddress.is_default : false
      };
      
      // Save address
      if (editingAddress) {
        // Update existing address
        const updatedAddresses = await updateAddress(editingAddress.id, addressData);
        if (updatedAddresses) {
          setSavedAddresses(updatedAddresses);
          
          // Reset form
          setAddressName('');
          setAddressType('home');
          setEditingAddress(null);
          setView('saved');
        }
      } else {
        // Add new address
        const updatedAddresses = await saveAddress(addressData);
        if (updatedAddresses) {
          setSavedAddresses(updatedAddresses);
          
          // Reset form
          setAddressName('');
          setAddressType('home');
          setEditingAddress(null);
          setView('saved');
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      if (error.code === "UNAUTHENTICATED") {
        setAuthError(true);
      } else {
        setError('حدث خطأ أثناء حفظ العنوان. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!authService.isAuthenticated()) {
      setAuthError(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAddresses = await deleteAddress(id);
      setSavedAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error deleting address:', error);
      if (error.code === "UNAUTHENTICATED") {
        setAuthError(true);
      } else {
        setError('حدث خطأ أثناء حذف العنوان. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    if (!authService.isAuthenticated()) {
      setAuthError(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAddresses = await setDefaultAddress(id);
      setSavedAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error setting default address:', error);
      if (error.code === "UNAUTHENTICATED") {
        setAuthError(true);
      } else {
        setError('حدث خطأ أثناء تعيين العنوان الافتراضي. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSavedAddress = async (address) => {
    if (!authService.isAuthenticated()) {
      setAuthError(true);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await handleSetDefaultAddress(address.id);
      
      // Format the address for display
      let displayAddr;
      if (address.address_components) {
        displayAddr = formatAddress(address.address_components);
      } else {
        displayAddr = `${address.address_line1}, ${address.city}, ${address.state} ${address.postal_code}`;
      }
      
      onSelectLocation(displayAddr);
      onClose();
    } catch (error) {
      console.error('Error selecting address:', error);
      if (error.code === "UNAUTHENTICATED") {
        setAuthError(true);
      }
      setIsLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    if (!authService.isAuthenticated()) {
      setAuthError(true);
      return;
    }
    
    setEditingAddress(address);
    setAddressName(address.name);
    setAddressType(address.type || 'home');
    
    // Set map center to address location
    if (address.latitude && address.longitude) {
      setMapCenter({
        lat: parseFloat(address.latitude),
        lng: parseFloat(address.longitude)
      });
    } else if (address.geometry && address.geometry.location) {
      const lat = typeof address.geometry.location.lat === 'function' 
        ? address.geometry.location.lat() 
        : parseFloat(address.geometry.location.lat);
      
      const lng = typeof address.geometry.location.lng === 'function' 
        ? address.geometry.location.lng() 
        : parseFloat(address.geometry.location.lng);
      
      setMapCenter({ lat, lng });
    }
    
    setSelectedLocation(address);
    setView('map');
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // If we have a Google Maps place object, format the address
      let displayAddress;
      if (selectedLocation.address_components) {
        displayAddress = formatAddress(selectedLocation.address_components) || selectedLocation.formatted_address;
      } else {
        // Try to validate the address first
        try {
          const fullAddress = `${selectedLocation.address_line1}, ${selectedLocation.city}, ${selectedLocation.state} ${selectedLocation.postal_code}`;
          const validationResult = await validateAddress(fullAddress);
          
          if (validationResult.success) {
            displayAddress = validationResult.data.formatted_address;
          } else {
            displayAddress = fullAddress;
          }
        } catch (error) {
          displayAddress = `${selectedLocation.address_line1}, ${selectedLocation.city}, ${selectedLocation.state} ${selectedLocation.postal_code}`;
        }
      }
      
      onSelectLocation(displayAddress);
      onClose();
    } catch (error) {
      console.error('Error confirming location:', error);
      setError('حدث خطأ أثناء تأكيد الموقع. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = () => {
    // Redirect to login page with return URL
    window.location.href = `/login?returnUrl=${encodeURIComponent(window.location.pathname)}`;
  };

  const renderMapView = () => (
    <>
      <div className="location-search-container">
        <div className="location-search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            id="location-search-input"
            type="text"
            className="location-search-input"
            placeholder="ابحث عن منطقة، شارع، معلم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isLoading || isSaving}
          />
        </div>
        <button 
          className="current-location-button"
          onClick={handleGetCurrentLocation}
          disabled={isLoading || isSaving}
        >
          {isLoading ? (
            <FontAwesomeIcon icon={faSpinner} spin />
          ) : (
            <>
              <FontAwesomeIcon icon={faLocationDot} />
              <span>حدد موقعي</span>
            </>
          )}
        </button>
      </div>
      
      {error && (
        <div className="modal-error">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      )}
      
      {authError && (
        <div className="modal-auth-error">
          <FontAwesomeIcon icon={faLock} /> قم بتسجيل الدخول لإدارة العناوين
          <button className="modal-login-btn" onClick={handleLogin}>
            تسجيل الدخول
          </button>
        </div>
      )}
      
      <div className="location-map-container">
        <div className="map-instruction">
          حرك الخريطة لتحديد الموقع بدقة
        </div>
        {!mapsLoaded && (
          <div className="map-loading">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>جاري تحميل الخريطة...</p>
          </div>
        )}
        <div ref={mapRef} className="google-map"></div>
        {(loadingMap || isLoading) && mapsLoaded && (
          <div className="map-loading">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>جاري تحميل الخريطة...</p>
          </div>
        )}
      </div>
      
      {selectedLocation && (
        <div className="location-details">
          <div className="selected-address">
            <FontAwesomeIcon icon={faLocationDot} className="address-icon" />
            <span>
              {selectedLocation.formatted_address || 
               `${selectedLocation.address_line1 || ''}, ${selectedLocation.city || ''}, ${selectedLocation.state || ''} ${selectedLocation.postal_code || ''}`}
            </span>
          </div>
          
          <div className="save-address-form">
            <div className="form-group">
              <label>اسم العنوان</label>
              <input
                type="text"
                placeholder="مثال: المنزل، العمل..."
                value={addressName}
                onChange={(e) => setAddressName(e.target.value)}
                disabled={isLoading || isSaving || authError}
              />
            </div>
            
            <div className="form-group">
              <label>نوع العنوان</label>
              <div className="address-type-options">
                <button 
                  className={`type-option ${addressType === 'home' ? 'active' : ''}`}
                  onClick={() => setAddressType('home')}
                  disabled={isLoading || isSaving || authError}
                >
                  <FontAwesomeIcon icon={faHome} />
                  <span>منزل</span>
                </button>
                <button 
                  className={`type-option ${addressType === 'work' ? 'active' : ''}`}
                  onClick={() => setAddressType('work')}
                  disabled={isLoading || isSaving || authError}
                >
                  <FontAwesomeIcon icon={faBuilding} />
                  <span>عمل</span>
                </button>
                <button 
                  className={`type-option ${addressType === 'other' ? 'active' : ''}`}
                  onClick={() => setAddressType('other')}
                  disabled={isLoading || isSaving || authError}
                >
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>آخر</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="modal-actions">
        <button 
          className="secondary-button"
          onClick={() => setView('saved')}
          disabled={isLoading || isSaving}
        >
          العناوين المحفوظة
        </button>
        
        <div className="primary-actions">
          <button 
            className="save-button"
            onClick={handleSaveAddress}
            disabled={!selectedLocation || isLoading || isSaving || authError}
          >
            {isSaving ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              editingAddress ? 'تحديث العنوان' : 'حفظ العنوان'
            )}
          </button>
          <button 
            className="confirm-location-button"
            onClick={handleConfirmLocation}
            disabled={!selectedLocation || isLoading || isSaving}
          >
            {isLoading ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              'تأكيد الموقع'
            )}
          </button>
        </div>
      </div>
    </>
  );

  const renderSavedAddressesView = () => (
    <>
      <div className="saved-addresses-container">
        {authError ? (
          <div className="modal-auth-error center">
            <FontAwesomeIcon icon={faLock} size="2x" />
            <p>قم بتسجيل الدخول لعرض العناوين المحفوظة</p>
            <button className="modal-login-btn" onClick={handleLogin}>
              تسجيل الدخول
            </button>
          </div>
        ) : isLoading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
            <p>جاري تحميل العناوين...</p>
          </div>
        ) : error ? (
          <div className="modal-error center">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <p>{error}</p>
            <button className="retry-btn" onClick={() => window.location.reload()}>
              إعادة المحاولة
            </button>
          </div>
        ) : savedAddresses.length === 0 ? (
          <div className="no-addresses">
            <FontAwesomeIcon icon={faLocationDot} className="no-address-icon" />
            <p>لا توجد عناوين محفوظة</p>
            <button 
              className="add-address-button"
              onClick={() => setView('map')}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>إضافة عنوان جديد</span>
            </button>
          </div>
        ) : (
          <>
            <div className="addresses-list">
              {savedAddresses.map((address) => (
                <div 
                  key={address.id} 
                  className={`address-item ${address.is_default ? 'default' : ''}`}
                >
                  <div 
                    className="address-content"
                    onClick={() => handleSelectSavedAddress(address)}
                  >
                    <div className="address-icon-container">
                      <FontAwesomeIcon 
                        icon={
                          address.type === 'work' ? faBuilding : 
                          address.type === 'other' ? faLocationDot : 
                          faHome
                        } 
                        className="address-type-icon" 
                      />
                    </div>
                    <div className="address-info">
                      <div className="address-name">
                        {address.name}
                        {address.is_default && (
                          <span className="default-badge">الافتراضي</span>
                        )}
                      </div>
                      <div className="address-text">
                        {address.displayAddress || 
                         `${address.address_line1}, ${address.city}, ${address.state} ${address.postal_code}`}
                      </div>
                    </div>
                  </div>
                  <div className="address-actions">
                    {!address.is_default && (
                      <button 
                        className="action-btn set-default-btn"
                        onClick={() => handleSetDefaultAddress(address.id)}
                        title="تعيين كافتراضي"
                        disabled={isLoading}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditAddress(address)}
                      title="تعديل"
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteAddress(address.id)}
                      title="حذف"
                      disabled={isLoading}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button 
              className="add-address-button"
              onClick={() => {
                setEditingAddress(null);
                setAddressName('');
                setAddressType('home');
                setView('map');
              }}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>إضافة عنوان جديد</span>
            </button>
          </>
        )}
      </div>
      
      <div className="modal-actions">
        <button 
          className="secondary-button"
          onClick={() => setView('map')}
          disabled={isLoading}
        >
          العودة إلى الخريطة
        </button>
      </div>
    </>
  );

  if (!isOpen) return null;

  return (
    <div className="location-modal-overlay">
      <div className="location-modal" ref={modalRef}>
        <div className="location-modal-header">
          <h2>
            {view === 'map' ? 'تحديد العنوان' : 'العناوين المحفوظة'}
          </h2>
          <button className="close-button" onClick={onClose} disabled={isLoading || isSaving}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="location-modal-content">
          {view === 'map' ? renderMapView() : renderSavedAddressesView()}
        </div>
      </div>
    </div>
  );
};

export default LocationModal; 