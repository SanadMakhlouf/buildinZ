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
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import '../styles/LocationModal.css';
import { 
  getSavedAddresses, 
  saveAddress, 
  deleteAddress, 
  setDefaultAddress, 
  getDefaultAddress,
  formatAddress
} from '../utils/addressUtils';

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
      setSavedAddresses(getSavedAddresses());
      
      // Check if there's a default address
      const defaultAddress = getDefaultAddress();
      if (defaultAddress && defaultAddress.geometry && defaultAddress.geometry.location) {
        setMapCenter({
          lat: parseFloat(defaultAddress.geometry.location.lat),
          lng: parseFloat(defaultAddress.geometry.location.lng)
        });
      }
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
                }
              });
            }
          }
          
          setMapCenter(newCenter);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("لم نتمكن من تحديد موقعك. يرجى السماح بالوصول إلى الموقع أو إدخال العنوان يدويًا.");
        }
      );
    } else {
      alert("متصفحك لا يدعم تحديد الموقع.");
    }
  };

  const handleSaveAddress = () => {
    if (!selectedLocation) return;
    
    setIsSaving(true);
    
    // Create address object
    const addressData = {
      ...selectedLocation,
      name: addressName || 'العنوان الرئيسي',
      type: addressType,
      displayAddress: formatAddress(selectedLocation.address_components)
    };
    
    // Save address
    if (editingAddress) {
      // Update existing address
      const updatedAddresses = savedAddresses.map(addr => 
        addr.id === editingAddress.id ? { ...addr, ...addressData } : addr
      );
      setSavedAddresses(updatedAddresses);
      localStorage.setItem('savedAddresses', JSON.stringify(updatedAddresses));
    } else {
      // Add new address
      const updatedAddresses = saveAddress(addressData);
      setSavedAddresses(updatedAddresses);
    }
    
    // Reset form
    setAddressName('');
    setAddressType('home');
    setEditingAddress(null);
    setIsSaving(false);
    setView('saved');
  };

  const handleDeleteAddress = (id) => {
    const updatedAddresses = deleteAddress(id);
    setSavedAddresses(updatedAddresses);
  };

  const handleSetDefaultAddress = (id) => {
    const updatedAddresses = setDefaultAddress(id);
    setSavedAddresses(updatedAddresses);
  };

  const handleSelectSavedAddress = (address) => {
    handleSetDefaultAddress(address.id);
    onSelectLocation(address.displayAddress || address.formatted_address);
    onClose();
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressName(address.name);
    setAddressType(address.type || 'home');
    
    // Set map center to address location
    if (address.geometry && address.geometry.location) {
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

  const handleConfirmLocation = () => {
    if (!selectedLocation) return;
    
    const displayAddress = formatAddress(selectedLocation.address_components) || selectedLocation.formatted_address;
    onSelectLocation(displayAddress);
    onClose();
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
          />
        </div>
        <button 
          className="current-location-button"
          onClick={handleGetCurrentLocation}
        >
          <FontAwesomeIcon icon={faLocationDot} />
          <span>حدد موقعي</span>
        </button>
      </div>
      
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
        {loadingMap && mapsLoaded && (
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
            <span>{selectedLocation.formatted_address}</span>
          </div>
          
          <div className="save-address-form">
            <div className="form-group">
              <label>اسم العنوان</label>
              <input
                type="text"
                placeholder="مثال: المنزل، العمل..."
                value={addressName}
                onChange={(e) => setAddressName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>نوع العنوان</label>
              <div className="address-type-options">
                <button 
                  className={`type-option ${addressType === 'home' ? 'active' : ''}`}
                  onClick={() => setAddressType('home')}
                >
                  <FontAwesomeIcon icon={faHome} />
                  <span>منزل</span>
                </button>
                <button 
                  className={`type-option ${addressType === 'work' ? 'active' : ''}`}
                  onClick={() => setAddressType('work')}
                >
                  <FontAwesomeIcon icon={faBuilding} />
                  <span>عمل</span>
                </button>
                <button 
                  className={`type-option ${addressType === 'other' ? 'active' : ''}`}
                  onClick={() => setAddressType('other')}
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
        >
          العناوين المحفوظة
        </button>
        
        <div className="primary-actions">
          <button 
            className="save-button"
            onClick={handleSaveAddress}
            disabled={!selectedLocation || isSaving}
          >
            {editingAddress ? 'تحديث العنوان' : 'حفظ العنوان'}
          </button>
          <button 
            className="confirm-location-button"
            onClick={handleConfirmLocation}
            disabled={!selectedLocation}
          >
            تأكيد الموقع
          </button>
        </div>
      </div>
    </>
  );

  const renderSavedAddressesView = () => (
    <>
      <div className="saved-addresses-container">
        {savedAddresses.length === 0 ? (
          <div className="no-addresses">
            <FontAwesomeIcon icon={faLocationDot} className="no-address-icon" />
            <p>لا توجد عناوين محفوظة</p>
            <button 
              className="add-address-button"
              onClick={() => setView('map')}
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
                  className={`address-item ${address.isDefault ? 'default' : ''}`}
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
                        {address.isDefault && (
                          <span className="default-badge">الافتراضي</span>
                        )}
                      </div>
                      <div className="address-text">
                        {address.displayAddress || address.formatted_address}
                      </div>
                    </div>
                  </div>
                  <div className="address-actions">
                    {!address.isDefault && (
                      <button 
                        className="action-btn set-default-btn"
                        onClick={() => handleSetDefaultAddress(address.id)}
                        title="تعيين كافتراضي"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEditAddress(address)}
                      title="تعديل"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteAddress(address.id)}
                      title="حذف"
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
          <button className="close-button" onClick={onClose}>
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