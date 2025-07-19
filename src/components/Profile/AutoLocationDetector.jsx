import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faCheckCircle, 
  faInfoCircle, 
  faExclamationTriangle, 
  faRedoAlt,
  faMapMarkerAlt,
  faMapPin
} from '@fortawesome/free-solid-svg-icons';
import addressService from '../../services/addressService';
import './AutoLocationDetector.css';

const AutoLocationDetector = ({ onAddressCreated }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [isFallbackLocation, setIsFallbackLocation] = useState(false);

  // Function to detect and save current location
  const detectAndSaveLocation = async () => {
    setIsDetecting(true);
    setStatus('detecting');
    setError(null);
    setErrorCode(null);
    setIsFallbackLocation(false);

    try {
      // First check if we already have a default address
      const addresses = await addressService.getAllAddresses();
      const defaultAddress = addresses.find(addr => addr.is_default);
      
      if (defaultAddress) {
        setStatus('exists');
        
        // Still call onAddressCreated with the existing default address
        if (onAddressCreated) {
          onAddressCreated(defaultAddress);
        }
        
        return;
      }
      
      // Create address from current location
      setStatus('creating');
      
      try {
        const response = await addressService.createAddressFromCurrentLocation('موقعي الحالي');
        
        if (response && response.success && response.data) {
          // Set as default
          await addressService.setDefaultAddress(response.data.id);
          
          // Check if this is a fallback location (Dubai)
          const isFallback = response.data.latitude === 25.2048 && response.data.longitude === 55.2708;
          setIsFallbackLocation(isFallback);
          
          setStatus('success');
          
          // Call the callback with the created address
          if (onAddressCreated) {
            onAddressCreated(response.data);
          }
        } else {
          throw new Error('Failed to create address');
        }
      } catch (locationError) {
        console.error('Error in location detection:', locationError);
        setErrorCode(locationError.code || 'UNKNOWN_ERROR');
        setError(locationError.message || 'حدث خطأ أثناء تحديد الموقع');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error in auto location detection:', error);
      setErrorCode(error.code || 'UNKNOWN_ERROR');
      setError(error.message || 'حدث خطأ أثناء تحديد الموقع');
      setStatus('error');
    } finally {
      setIsDetecting(false);
    }
  };

  // Detect location on component mount
  useEffect(() => {
    detectAndSaveLocation();
  }, []);

  // Get error message based on error code
  const getErrorMessage = () => {
    switch (errorCode) {
      case 'PERMISSION_DENIED':
        return 'تم رفض إذن الموقع. يرجى تمكين الوصول إلى الموقع في إعدادات المتصفح.';
      case 'POSITION_UNAVAILABLE':
        return 'موقعك الحالي غير متاح. يرجى المحاولة مرة أخرى لاحقًا.';
      case 'TIMEOUT':
        return 'انتهت مهلة طلب الموقع. يرجى المحاولة مرة أخرى.';
      case 'GEOLOCATION_NOT_SUPPORTED':
        return 'متصفحك لا يدعم تحديد الموقع.';
      default:
        return error || 'حدث خطأ أثناء تحديد الموقع';
    }
  };

  // Handle manual address entry
  const handleManualEntry = () => {
    if (onAddressCreated) {
      onAddressCreated({});
    }
  };

  // Render different content based on status
  const renderContent = () => {
    switch (status) {
      case 'detecting':
        return (
          <div className="auto-location-status detecting">
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>جاري تحديد موقعك...</span>
          </div>
        );
      
      case 'creating':
        return (
          <div className="auto-location-status creating">
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>جاري حفظ موقعك...</span>
          </div>
        );
      
      case 'success':
        return (
          <div className={`auto-location-status success ${isFallbackLocation ? 'fallback' : ''}`}>
            <FontAwesomeIcon icon={isFallbackLocation ? faMapPin : faCheckCircle} />
            <span>
              {isFallbackLocation 
                ? 'تم استخدام موقع افتراضي (إمارة دبي). يمكنك تعديله لاحقًا.' 
                : 'تم تحديد موقعك بنجاح'}
            </span>
          </div>
        );
      
      case 'exists':
        return (
          <div className="auto-location-status exists">
            <FontAwesomeIcon icon={faInfoCircle} />
            <span>تم العثور على عنوان افتراضي مسبقاً</span>
          </div>
        );
      
      case 'error':
        return (
          <div className="auto-location-status error">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>{getErrorMessage()}</span>
            <div className="error-actions">
              <button 
                onClick={detectAndSaveLocation} 
                disabled={isDetecting}
                className="retry-btn"
              >
                {isDetecting ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faRedoAlt} />
                )}
                إعادة المحاولة
              </button>
              <button 
                onClick={handleManualEntry}
                className="manual-entry-btn"
              >
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                إدخال العنوان يدويًا
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="auto-location-detector"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {renderContent()}
    </motion.div>
  );
};

export default AutoLocationDetector; 