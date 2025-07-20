import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrashAlt, 
  faSave, 
  faTimes, 
  faHome, 
  faBuilding, 
  faMapMarkerAlt, 
  faCheckCircle, 
  faCircle, 
  faSpinner, 
  faExclamationCircle, 
  faSearch, 
  faMapMarkedAlt, 
  faLocationArrow, 
  faExclamationTriangle,
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import { faCheckCircle as farCheckCircle, faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
import addressService from '../../services/addressService';
import AutoLocationDetector from './AutoLocationDetector';
import './AddressManager.css';

// Add UAE emirates list at the top of the file
const uaeEmirates = [
  "أبوظبي",
  "دبي",
  "الشارقة",
  "عجمان",
  "أم القيوين",
  "رأس الخيمة",
  "الفجيرة"
];

// Icons
const icons = {
  add: faPlus,
  edit: faEdit,
  delete: faTrashAlt,
  save: faSave,
  cancel: faTimes,
  home: faHome,
  work: faBuilding,
  other: faMapMarkerAlt,
  default: faCheckCircle,
  setDefault: farCircle,
  loading: faSpinner,
  error: faExclamationCircle,
  success: faCheckCircle,
  search: faSearch,
  location: faMapMarkedAlt,
  currentLocation: faLocationArrow,
  warning: faExclamationTriangle,
  phone: faPhone
};

const AddressManager = ({ checkoutMode = false, onAddressSelect = null, selectedAddressId = null }) => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    phone: '',
    delivery_instructions: '',
    is_default: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showAutoDetector, setShowAutoDetector] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);
  
  // Select default address for checkout mode
  useEffect(() => {
    if (checkoutMode && addresses.length > 0 && !selectedAddressId) {
      // Find default address or use the first one
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
      if (defaultAddress && onAddressSelect) {
        onAddressSelect(defaultAddress);
      }
    }
  }, [addresses, checkoutMode, onAddressSelect, selectedAddressId]);

  // Fetch all addresses from the API
  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await addressService.getAllAddresses();
      setAddresses(data);
    } catch (err) {
      setError('حدث خطأ أثناء جلب العناوين. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear validation error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'اسم العنوان مطلوب';
    }
    
    if (!formData.address_line1.trim()) {
      errors.address_line1 = 'العنوان مطلوب';
    }
    
    // Phone validation (optional field)
    if (formData.phone && !/^(\+?[0-9]{1,4}[-\s]?)?[0-9]{9,10}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'رقم الهاتف غير صحيح';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle address validation using Google Maps API (if available)
  const handleValidateAddress = async () => {
    if (!formData.address_line1) {
      setFormErrors({
        ...formErrors,
        address_line1: 'العنوان مطلوب للتحقق'
      });
      return;
    }

    setIsValidating(true);
    setValidationStatus(null);

    try {
      // Create a full address string for validation
      const addressString = [
        formData.address_line1,
        formData.address_line2,
        formData.city
      ].filter(Boolean).join(', ');

      const response = await addressService.validateAddress(addressString);
      
      if (response.success) {
        // Update form with validated data
        if (response.data.structured_address) {
          setFormData({
            ...formData,
            address_line1: response.data.structured_address.address_line1 || formData.address_line1,
            city: response.data.structured_address.city || formData.city
          });
        }
        
        setValidationStatus({
          success: true,
          message: 'تم التحقق من العنوان بنجاح'
        });
      } else {
        setValidationStatus({
          success: false,
          message: 'لم نتمكن من التحقق من العنوان، ولكن يمكنك المتابعة'
        });
      }
    } catch (err) {
      setValidationStatus({
        success: false,
        message: 'حدث خطأ أثناء التحقق من العنوان، ولكن يمكنك المتابعة'
      });
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  // Handle form submission for creating/updating addresses
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      let savedAddress;
      
      if (editingAddressId) {
        // Update existing address
        savedAddress = await addressService.updateAddress(editingAddressId, formData);
      } else {
        // Create new address
        savedAddress = await addressService.createAddress(formData);
      }
      
      // Reset form and fetch updated addresses
      resetForm();
      await fetchAddresses();
      
      // If in checkout mode, select the newly created/updated address
      if (checkoutMode && onAddressSelect && savedAddress) {
        onAddressSelect(savedAddress);
      }
    } catch (err) {
      // Handle API validation errors
      if (err.response?.data?.errors) {
        const apiErrors = {};
        Object.entries(err.response.data.errors).forEach(([key, messages]) => {
          apiErrors[key] = messages[0];
        });
        setFormErrors(apiErrors);
      } else {
        setError(editingAddressId 
          ? 'حدث خطأ أثناء تحديث العنوان. يرجى المحاولة مرة أخرى.' 
          : 'حدث خطأ أثناء إضافة العنوان. يرجى المحاولة مرة أخرى.');
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Show delete confirmation dialog
  const confirmDeleteAddress = (address) => {
    setAddressToDelete(address);
    setShowDeleteConfirm(true);
  };

  // Cancel delete operation
  const cancelDelete = () => {
    setAddressToDelete(null);
    setShowDeleteConfirm(false);
  };

  // Handle address deletion
  const handleDeleteAddress = async (id) => {
    setIsDeleting(true);
    setDeleteId(id);
    
    try {
      await addressService.deleteAddress(id);
      setAddresses(addresses.filter(address => address.id !== id));
      setShowDeleteConfirm(false);
      setAddressToDelete(null);
      
      // If deleted address was selected in checkout mode, select another address
      if (checkoutMode && onAddressSelect && selectedAddressId === id) {
        const remainingAddresses = addresses.filter(address => address.id !== id);
        if (remainingAddresses.length > 0) {
          const defaultAddress = remainingAddresses.find(addr => addr.is_default) || remainingAddresses[0];
          onAddressSelect(defaultAddress);
        } else {
          onAddressSelect(null);
        }
      }
    } catch (err) {
      setError('حدث خطأ أثناء حذف العنوان. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Handle setting an address as default
  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      setAddresses(addresses.map(address => ({
        ...address,
        is_default: address.id === id
      })));
    } catch (err) {
      setError('حدث خطأ أثناء تعيين العنوان الافتراضي. يرجى المحاولة مرة أخرى.');
      console.error(err);
    }
  };

  // Handle editing an address
  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setFormData({
      name: address.name || '',
      address_line1: address.address_line1 || '',
      address_line2: address.address_line2 || '',
      city: address.city || '',
      phone: address.phone || '',
      delivery_instructions: address.delivery_instructions || '',
      is_default: address.is_default || false
    });
    setShowAddForm(true);
    setFormErrors({});
    setValidationStatus(null);
    setShowAutoDetector(false);
  };

  // Reset form and form state
  const resetForm = () => {
    setFormData({
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      phone: '',
      delivery_instructions: '',
      is_default: false
    });
    setFormErrors({});
    setValidationStatus(null);
    setShowAddForm(false);
    setEditingAddressId(null);
    setShowAutoDetector(true);
  };

  // Get appropriate icon for address type
  const getAddressIcon = (name) => {
    const lowerName = name?.toLowerCase() || '';
    
    if (lowerName.includes('home') || lowerName.includes('منزل') || lowerName.includes('بيت')) {
      return icons.home;
    } else if (lowerName.includes('work') || lowerName.includes('office') || lowerName.includes('عمل') || lowerName.includes('مكتب')) {
      return icons.work;
    } else if (lowerName.includes('current') || lowerName.includes('موقعي الحالي')) {
      return icons.currentLocation;
    } else {
      return icons.other;
    }
  };

  // Handle address created from auto detector
  const handleAutoAddressCreated = (address) => {
    fetchAddresses();
    
    // If in checkout mode, select the newly created address
    if (checkoutMode && onAddressSelect && address) {
      onAddressSelect(address);
    }
  };

  // Handle using current location
  const handleUseCurrentLocation = async () => {
    setIsValidating(true);
    setValidationStatus(null);
    
    try {
      const locationData = await addressService.getCurrentLocation();
      
      // Check if this is a fallback location (Dubai)
      const isFallback = locationData.latitude === 25.2048 && locationData.longitude === 55.2708;
      
      // Update form with location data
      setFormData({
        ...formData,
        address_line1: locationData.formatted_address || `${locationData.latitude}, ${locationData.longitude}`,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        place_id: locationData.place_id || ''
      });
      
      // If we have address components, try to fill in the form fields
      if (locationData.address_components) {
        const components = locationData.address_components;
        
        // Try to extract emirate from address components
        let emirateName = '';
        
        // First try administrative_area_level_1 which should be the emirate
        const adminArea = components.find(comp => comp.types.includes('administrative_area_level_1'));
        if (adminArea) {
          emirateName = adminArea.long_name;
        }
        
        // If that fails, try locality which might be the emirate in some cases
        if (!emirateName) {
          const locality = components.find(comp => comp.types.includes('locality'));
          if (locality) {
            emirateName = locality.long_name;
          }
        }
        
        // Try to match with one of our UAE emirates
        if (emirateName) {
          // Check if the emirate name is in our list (exact match)
          const exactMatch = uaeEmirates.find(emirate => emirate === emirateName);
          
          if (!exactMatch) {
            // Try to find a partial match
            const partialMatch = uaeEmirates.find(emirate => 
              emirateName.includes(emirate) || emirate.includes(emirateName)
            );
            
            if (partialMatch) {
              emirateName = partialMatch;
            } else if (isFallback) {
              // If it's a fallback location, default to Dubai
              emirateName = 'دبي';
            }
          }
        } else if (isFallback) {
          // If it's a fallback location and no emirate was found, default to Dubai
          emirateName = 'دبي';
        }
        
        setFormData(prev => ({
          ...prev,
          city: emirateName
        }));
      } else if (isFallback) {
        // If it's a fallback location and no address components, default to Dubai
        setFormData(prev => ({
          ...prev,
          city: 'دبي'
        }));
      }
      
      setValidationStatus({
        success: true,
        message: isFallback ? 
          'تم استخدام موقع افتراضي (إمارة دبي). يمكنك تعديله إذا لزم الأمر.' : 
          'تم تحديد موقعك الحالي بنجاح'
      });
    } catch (err) {
      console.error('Error getting current location:', err);
      
      // Get a more specific error message based on the error code
      let errorMessage = 'لم نتمكن من تحديد موقعك الحالي. يرجى المحاولة مرة أخرى أو إدخال العنوان يدويًا.';
      
      if (err.code) {
        switch (err.code) {
          case 'PERMISSION_DENIED':
            errorMessage = 'تم رفض إذن الموقع. يرجى تمكين الوصول إلى الموقع في إعدادات المتصفح.';
            break;
          case 'POSITION_UNAVAILABLE':
            errorMessage = 'موقعك الحالي غير متاح. يرجى المحاولة مرة أخرى لاحقًا أو إدخال العنوان يدويًا.';
            break;
          case 'TIMEOUT':
            errorMessage = 'انتهت مهلة طلب الموقع. يرجى المحاولة مرة أخرى.';
            break;
          case 'GEOLOCATION_NOT_SUPPORTED':
            errorMessage = 'متصفحك لا يدعم تحديد الموقع. يرجى إدخال العنوان يدويًا.';
            break;
        }
      }
      
      setValidationStatus({
        success: false,
        message: errorMessage
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  // Handle address selection in checkout mode
  const handleAddressSelect = (address) => {
    if (checkoutMode && onAddressSelect) {
      onAddressSelect(address);
    }
  };

  // Render address list
  const renderAddressList = () => {
    if (isLoading) {
      return (
        <div className="addresses-loading">
          <FontAwesomeIcon icon={icons.loading} spin />
          <span>جاري تحميل العناوين...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="addresses-error">
          <FontAwesomeIcon icon={icons.error} />
          <span>{error}</span>
          <button onClick={fetchAddresses} className="retry-button">
            إعادة المحاولة
          </button>
        </div>
      );
    }

    if (addresses.length === 0) {
      return (
        <div className="no-addresses">
          <FontAwesomeIcon icon={icons.location} />
          <p>لا توجد عناوين محفوظة.</p>
          <button 
            className="add-address-btn"
            onClick={() => setShowAddForm(true)}
          >
            <FontAwesomeIcon icon={icons.add} />
            إضافة عنوان جديد
          </button>
        </div>
      );
    }

    return (
      <div className={`addresses-list ${checkoutMode ? 'checkout-mode' : ''}`}>
        {addresses.map(address => (
          <div 
            key={address.id} 
            className={`address-card ${address.is_default ? 'default' : ''} ${checkoutMode && selectedAddressId === address.id ? 'selected' : ''}`}
            onClick={checkoutMode ? () => handleAddressSelect(address) : undefined}
          >
            <div className="address-icon">
              <FontAwesomeIcon icon={getAddressIcon(address.name)} />
            </div>
            
            <div className="address-details">
              <div className="address-header">
                <h3>{address.name}</h3>
                {address.is_default && (
                  <span className="default-badge">
                    <FontAwesomeIcon icon={icons.default} />
                    افتراضي
                  </span>
                )}
              </div>
              
              <div className="address-content">
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}</p>
                {address.phone && (
                  <p className="address-phone">
                    <FontAwesomeIcon icon={icons.phone} />
                    {address.phone}
                  </p>
                )}
                {address.delivery_instructions && (
                  <p className="delivery-instructions">
                    <strong>تعليمات التوصيل:</strong> {address.delivery_instructions}
                  </p>
                )}
              </div>
            </div>
            
            {!checkoutMode && (
              <div className="address-actions">
                <button 
                  className="edit-btn"
                  onClick={() => handleEditAddress(address)}
                  title="تعديل العنوان"
                >
                  <FontAwesomeIcon icon={icons.edit} />
                </button>
                
                <button 
                  className="delete-btn"
                  onClick={() => confirmDeleteAddress(address)}
                  title="حذف العنوان"
                >
                  <FontAwesomeIcon icon={icons.delete} />
                </button>
                
                {!address.is_default && (
                  <button 
                    className="set-default-btn"
                    onClick={() => handleSetDefault(address.id)}
                    title="تعيين كعنوان افتراضي"
                  >
                    <FontAwesomeIcon icon={icons.setDefault} />
                  </button>
                )}
              </div>
            )}
            
            {checkoutMode && (
              <div className="checkout-select">
                <div className={`select-indicator ${selectedAddressId === address.id ? 'selected' : ''}`}>
                  <FontAwesomeIcon icon={selectedAddressId === address.id ? faCheckCircle : faCircle} />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {!checkoutMode && (
          <button 
            className="add-address-btn"
            onClick={() => setShowAddForm(true)}
          >
            <FontAwesomeIcon icon={icons.add} />
            إضافة عنوان جديد
          </button>
        )}
      </div>
    );
  };

  // Render address form
  const renderAddressForm = () => {
    return (
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="address-form-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="address-form-header">
              <h3>{editingAddressId ? 'تعديل العنوان' : 'إضافة عنوان جديد'}</h3>
              <button 
                className="close-form-btn"
                onClick={resetForm}
              >
                <FontAwesomeIcon icon={icons.cancel} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="address-form">
              <div className="form-group">
                <label htmlFor="name">اسم العنوان*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="مثل: المنزل، العمل، الخ"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="address_line1">العنوان*</label>
                <div className="address-input-container">
                  <input
                    type="text"
                    id="address_line1"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    placeholder="اسم الشارع، رقم المبنى"
                    className={formErrors.address_line1 ? 'error' : ''}
                  />
                  <button 
                    type="button"
                    className="current-location-btn"
                    onClick={handleUseCurrentLocation}
                    title="استخدام موقعي الحالي"
                  >
                    <FontAwesomeIcon icon={icons.currentLocation} />
                  </button>
                </div>
                {formErrors.address_line1 && <span className="error-message">{formErrors.address_line1}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="address_line2">تفاصيل إضافية</label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  placeholder="الطابق، رقم الشقة، المنطقة"
                  className={formErrors.address_line2 ? 'error' : ''}
                />
                {formErrors.address_line2 && <span className="error-message">{formErrors.address_line2}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="city">المدينة*</label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={formErrors.city ? 'error' : ''}
                >
                  <option value="">اختر المدينة</option>
                  {uaeEmirates.map(emirate => (
                    <option key={emirate} value={emirate}>{emirate}</option>
                  ))}
                </select>
                {formErrors.city && <span className="error-message">{formErrors.city}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">رقم الهاتف</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="رقم الهاتف للتواصل عند التوصيل"
                  className={formErrors.phone ? 'error' : ''}
                />
                {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="delivery_instructions">تعليمات التوصيل</label>
                <textarea
                  id="delivery_instructions"
                  name="delivery_instructions"
                  value={formData.delivery_instructions}
                  onChange={handleInputChange}
                  placeholder="أي تعليمات خاصة بالتوصيل"
                  rows="3"
                  className={formErrors.delivery_instructions ? 'error' : ''}
                ></textarea>
                {formErrors.delivery_instructions && <span className="error-message">{formErrors.delivery_instructions}</span>}
              </div>
              
              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="is_default"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                />
                <label htmlFor="is_default">تعيين كعنوان افتراضي</label>
              </div>
              
              <div className="address-validation">
                <button 
                  type="button" 
                  className="validate-btn"
                  onClick={handleValidateAddress}
                  disabled={isValidating || !formData.address_line1}
                >
                  {isValidating ? (
                    <>
                      <FontAwesomeIcon icon={icons.loading} spin />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={icons.search} />
                      التحقق من العنوان
                    </>
                  )}
                </button>
                
                {validationStatus && (
                  <div className={`validation-status ${validationStatus.success ? 'success' : 'warning'}`}>
                    <FontAwesomeIcon icon={validationStatus.success ? icons.success : icons.warning} />
                    <span>{validationStatus.message}</span>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  <FontAwesomeIcon icon={icons.cancel} />
                  إلغاء
                </button>
                
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <FontAwesomeIcon icon={icons.loading} spin />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={icons.save} />
                      {editingAddressId ? 'تحديث العنوان' : 'حفظ العنوان'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Render delete confirmation dialog
  const renderDeleteConfirmation = () => {
    if (!showDeleteConfirm || !addressToDelete) return null;
    
    return (
      <div className="delete-confirm-overlay">
        <div className="delete-confirm-dialog">
          <h3>تأكيد الحذف</h3>
          <p>هل أنت متأكد من حذف العنوان "{addressToDelete.name}"؟</p>
          
          <div className="confirm-actions">
            <button 
              className="cancel-btn"
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              إلغاء
            </button>
            
            <button 
              className="delete-btn"
              onClick={() => handleDeleteAddress(addressToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting && deleteId === addressToDelete.id ? (
                <>
                  <FontAwesomeIcon icon={icons.loading} spin />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={icons.delete} />
                  تأكيد الحذف
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="address-manager">
      {/* Auto Location Detector */}
      {showAutoDetector && !showAddForm && (
        <AutoLocationDetector onAddressCreated={handleAutoAddressCreated} />
      )}
      
      {/* Addresses List */}
      {renderAddressList()}
      
      {/* Add/Edit Address Form */}
      {renderAddressForm()}
      
      {/* Delete Confirmation Dialog */}
      {renderDeleteConfirmation()}
      
      {/* Add Address Button (for checkout mode) */}
      {checkoutMode && !showAddForm && (
        <button 
          className="add-address-btn checkout-add-btn"
          onClick={() => setShowAddForm(true)}
        >
          <FontAwesomeIcon icon={icons.add} />
          إضافة عنوان جديد
        </button>
      )}
    </div>
  );
};

export default AddressManager; 