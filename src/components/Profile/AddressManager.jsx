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

const AddressManager = () => {
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
      if (editingAddressId) {
        // Update existing address
        await addressService.updateAddress(editingAddressId, formData);
      } else {
        // Create new address
        await addressService.createAddress(formData);
      }
      
      // Reset form and fetch updated addresses
      resetForm();
      fetchAddresses();
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
    setDeleteId(id);
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    
    try {
      await addressService.deleteAddress(id);
      // Fetch updated addresses
      fetchAddresses();
    } catch (err) {
      setError('حدث خطأ أثناء حذف العنوان. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
      setAddressToDelete(null);
    }
  };

  // Handle setting an address as default
  const handleSetDefault = async (id) => {
    try {
      await addressService.setDefaultAddress(id);
      // Fetch updated addresses
      fetchAddresses();
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
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Reset form and state
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
    setEditingAddressId(null);
    setShowAddForm(false);
    setFormErrors({});
    setValidationStatus(null);
  };

  // Get icon based on address type
  const getAddressIcon = (name) => {
    const lowerName = name?.toLowerCase() || '';
    
    if (lowerName.includes('home') || lowerName.includes('منزل')) {
      return icons.home;
    } else if (lowerName.includes('work') || lowerName.includes('office') || lowerName.includes('عمل') || lowerName.includes('مكتب')) {
      return icons.work;
    } else if (lowerName.includes('current') || lowerName.includes('موقعي الحالي')) {
      return icons.currentLocation;
    } else {
      return icons.other;
    }
  };

  // Handle when an address is created by the auto detector
  const handleAutoAddressCreated = (address) => {
    // Hide the auto detector after an address is created or found
    setShowAutoDetector(false);
    
    // Refresh the addresses list
    fetchAddresses();
  };

  // Handle getting current location for the form
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

  return (
    <div className="address-manager">
      <div className="address-manager-header">
        <h2>إدارة العناوين</h2>
        {!showAddForm && (
          <button 
            className="add-address-btn"
            onClick={() => setShowAddForm(true)}
          >
            <FontAwesomeIcon icon={icons.add} />
            إضافة عنوان جديد
          </button>
        )}
      </div>

      {error && (
        <div className="address-error">
          <FontAwesomeIcon icon={icons.error} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>إغلاق</button>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && addressToDelete && (
          <motion.div 
            className="delete-confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="delete-confirm-dialog"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="delete-confirm-header">
                <FontAwesomeIcon icon={icons.warning} />
                <h3>تأكيد الحذف</h3>
              </div>
              <div className="delete-confirm-content">
                <p>هل أنت متأكد من حذف هذا العنوان؟</p>
                <div className="address-preview">
                  <strong>{addressToDelete.name}</strong>
                  <p>{addressToDelete.address_line1}</p>
                  {addressToDelete.is_default && (
                    <span className="default-tag">العنوان الافتراضي</span>
                  )}
                </div>
                <p className="warning-text">لا يمكن التراجع عن هذا الإجراء.</p>
              </div>
              <div className="delete-confirm-actions">
                <button 
                  className="delete-confirm-btn"
                  onClick={() => handleDeleteAddress(addressToDelete.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <FontAwesomeIcon icon={icons.loading} spin />
                      جاري الحذف...
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={icons.delete} />
                      نعم، احذف العنوان
                    </>
                  )}
                </button>
                <button 
                  className="delete-cancel-btn"
                  onClick={cancelDelete}
                  disabled={isDeleting}
                >
                  <FontAwesomeIcon icon={icons.cancel} />
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Auto Location Detector */}
      {showAutoDetector && (
        <AutoLocationDetector onAddressCreated={handleAutoAddressCreated} />
      )}

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            className="address-form-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit} className="address-form">
              <h3>{editingAddressId ? 'تعديل العنوان' : 'إضافة عنوان جديد'}</h3>
              
              <div className="form-row">
                <div className={`form-group ${formErrors.name ? 'has-error' : ''}`}>
                  <label>اسم العنوان <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="مثال: المنزل، العمل..."
                    disabled={isSaving}
                  />
                  {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                </div>

                <div className={`form-group ${formErrors.phone ? 'has-error' : ''}`}>
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="رقم الهاتف (اختياري)"
                    disabled={isSaving}
                  />
                  {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                </div>
              </div>

              <div className={`form-group ${formErrors.address_line1 ? 'has-error' : ''}`}>
                <label>العنوان <span className="required">*</span></label>
                <div className="address-line1-container">
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleInputChange}
                    placeholder="أدخل العنوان"
                    disabled={isSaving || isValidating}
                  />
                  <div className="address-buttons">
                    <button 
                      type="button" 
                      className="current-location-btn"
                      onClick={handleUseCurrentLocation}
                      disabled={isSaving || isValidating}
                      title="استخدام موقعي الحالي"
                    >
                      {isValidating ? (
                        <FontAwesomeIcon icon={icons.loading} spin />
                      ) : (
                        <FontAwesomeIcon icon={icons.currentLocation} />
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="validate-btn"
                      onClick={handleValidateAddress}
                      disabled={isSaving || isValidating || !formData.address_line1}
                    >
                      {isValidating ? (
                        <FontAwesomeIcon icon={icons.loading} spin />
                      ) : (
                        <FontAwesomeIcon icon={icons.search} />
                      )}
                      تحقق
                    </button>
                  </div>
                </div>
                {formErrors.address_line1 && <div className="error-message">{formErrors.address_line1}</div>}
                
                {validationStatus && (
                  <div className={`validation-status ${validationStatus.success ? 'success' : 'warning'}`}>
                    <FontAwesomeIcon icon={validationStatus.success ? icons.success : icons.error} />
                    <span>{validationStatus.message}</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>العنوان التفصيلي</label>
                <input
                  type="text"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleInputChange}
                  placeholder="شقة، طابق، مبنى... (اختياري)"
                  disabled={isSaving}
                />
              </div>

              <div className="form-group">
                <label>الإمارة</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="city-select"
                >
                  <option value="">اختر الإمارة</option>
                  {uaeEmirates.map((emirate, index) => (
                    <option key={index} value={emirate}>{emirate}</option>
                  ))}
                </select>
                {formErrors.city && <div className="error-message">{formErrors.city}</div>}
              </div>

              <div className="form-group">
                <label>تعليمات التوصيل</label>
                <textarea
                  name="delivery_instructions"
                  value={formData.delivery_instructions}
                  onChange={handleInputChange}
                  placeholder="تعليمات إضافية للتوصيل (اختياري)"
                  disabled={isSaving}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleInputChange}
                    disabled={isSaving}
                  />
                  تعيين كعنوان افتراضي
                </label>
              </div>

              <div className="form-actions">
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
                      {editingAddressId ? 'تحديث العنوان' : 'إضافة العنوان'}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={resetForm}
                  disabled={isSaving}
                >
                  <FontAwesomeIcon icon={icons.cancel} />
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="addresses-list">
        {isLoading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={icons.loading} spin />
            <p>جاري تحميل العناوين...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="empty-addresses">
            <FontAwesomeIcon icon={icons.location} />
            <p>لا توجد عناوين محفوظة</p>
            {!showAddForm && (
              <button 
                className="add-address-btn"
                onClick={() => setShowAddForm(true)}
              >
                <FontAwesomeIcon icon={icons.add} />
                إضافة عنوان جديد
              </button>
            )}
          </div>
        ) : (
          <div className="address-cards">
            {addresses.map(address => (
              <motion.div 
                key={address.id} 
                className={`address-card ${address.is_default ? 'default' : ''}`}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="address-card-header">
                  <div className="address-name">
                    <FontAwesomeIcon icon={getAddressIcon(address.name)} />
                    <span>{address.name}</span>
                    {address.is_default && (
                      <span className="default-badge">افتراضي</span>
                    )}
                  </div>
                  <div className="address-actions">
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEditAddress(address)}
                      title="تعديل"
                    >
                      <FontAwesomeIcon icon={icons.edit} />
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => confirmDeleteAddress(address)}
                      disabled={isDeleting && deleteId === address.id}
                      title="حذف"
                    >
                      {isDeleting && deleteId === address.id ? (
                        <FontAwesomeIcon icon={icons.loading} spin />
                      ) : (
                        <FontAwesomeIcon icon={icons.delete} />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="address-details">
                  <p className="address-line">{address.address_line1}</p>
                  {address.address_line2 && <p className="address-line">{address.address_line2}</p>}
                  
                  {address.city && <p className="address-line">{address.city}</p>}
                  
                  {address.phone && <p className="address-phone"><FontAwesomeIcon icon={icons.phone} /> {address.phone}</p>}
                  
                  {address.delivery_instructions && (
                    <div className="delivery-instructions">
                      <p className="instructions-label">تعليمات التوصيل:</p>
                      <p>{address.delivery_instructions}</p>
                    </div>
                  )}
                </div>
                
                {!address.is_default && (
                  <button 
                    className="set-default-btn"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    <FontAwesomeIcon icon={icons.setDefault} />
                    تعيين كعنوان افتراضي
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressManager; 