import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faHeart, 
  faCheck,
  faPlus,
  faMinus,
  faSpinner,
  faExclamationTriangle,
  faMoneyBill,
  faCreditCard,
  faUniversity,
  faImage,
  faChevronLeft,
  faChevronRight,
  faCalendar,
  faClock,
  faUpload,
  faTrash,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import serviceBuilderService from '../../services/serviceBuilderService';
import AddressManager from '../../components/Profile/AddressManager';
import './ServiceDetailPage.css';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Service State
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Image Gallery State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Form State
  const [fieldValues, setFieldValues] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState({});
  
  // Calculation State
  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  
  // Booking State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState('summary');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Fetch service details
  const fetchServiceDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceBuilderService.getServiceById(id);
      
      if (response.success) {
        setService(response.service);
        initializeFieldValues(response.service.fields);
      } else {
        setError(response.message || 'Failed to load service details');
      }
    } catch (err) {
      console.error('Error fetching service:', err);
      setError('حدث خطأ أثناء تحميل تفاصيل الخدمة');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchServiceDetails();
  }, [fetchServiceDetails]);

  // Initialize field values based on field types
  const initializeFieldValues = (fields) => {
    if (!fields) return;
    
    const initialValues = {};
    fields.forEach(field => {
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'date':
        case 'time':
          initialValues[field.id] = '';
          break;
        case 'number':
          initialValues[field.id] = field.min_value || '';
          break;
        case 'select':
        case 'radio':
          const defaultOption = field.options?.find(opt => opt.is_default);
          initialValues[field.id] = defaultOption?.id || null;
          break;
        case 'checkbox':
          initialValues[field.id] = [];
          break;
        case 'file':
          initialValues[field.id] = null;
          break;
        default:
          initialValues[field.id] = null;
      }
    });
    setFieldValues(initialValues);
  };

  // Handle field changes
  const handleFieldChange = (fieldId, value, fieldType) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Handle checkbox toggle
  const handleCheckboxToggle = (fieldId, optionId) => {
    setFieldValues(prev => {
      const currentValues = prev[fieldId] || [];
      const isSelected = currentValues.includes(optionId);
      
      return {
        ...prev,
        [fieldId]: isSelected
          ? currentValues.filter(id => id !== optionId)
          : [...currentValues, optionId]
      };
    });
  };

  // Handle file upload
  const handleFileUpload = (fieldId, file) => {
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldId]: file
      }));
    setFieldValues(prev => ({
      ...prev,
        [fieldId]: file.name
    }));
    }
  };

  // Handle product selection
  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.product_id === productId);
      if (existing) {
        return prev.filter(p => p.product_id !== productId);
      } else {
        return [...prev, { product_id: productId, quantity: 1 }];
      }
    });
  };

  const handleProductQuantityChange = (productId, quantity) => {
    const qty = parseInt(quantity) || 1;
    if (qty < 1) {
      setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
    } else {
      setSelectedProducts(prev => 
        prev.map(p => 
          p.product_id === productId ? { ...p, quantity: qty } : p
        )
      );
    }
  };

  // Image gallery navigation
  const nextImage = () => {
    if (service?.images) {
      setCurrentImageIndex((prev) => 
        prev === service.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (service?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? service.images.length - 1 : prev - 1
      );
    }
  };

  // Calculate price or proceed directly to booking
  const handleCalculatePrice = async () => {
    // If service doesn't require pricing, skip calculation and go to booking
    if (service?.requires_pricing === false) {
      setShowBookingModal(true);
      setBookingStep('details'); // Skip summary, go directly to details
      return;
    }

    try {
      setCalculating(true);
      setCalculationError(null);

      // Prepare field values for API
      const formattedFieldValues = Object.entries(fieldValues)
        .map(([fieldId, value]) => {
          const field = service.fields.find(f => f.id === parseInt(fieldId));
          if (!field) return null;

          switch (field.type) {
            case 'select':
            case 'radio':
              return value ? {
          field_id: parseInt(fieldId),
                option_id: value,
                type: 'option'
              } : null;
            case 'checkbox':
              return Array.isArray(value) && value.length > 0 ? {
                field_id: parseInt(fieldId),
                option_ids: value,
                type: 'checkbox'
              } : null;
            case 'number':
              return value ? {
                field_id: parseInt(fieldId),
                value: parseFloat(value),
                type: 'number'
              } : null;
            case 'text':
            case 'textarea':
            case 'date':
            case 'time':
              return value ? {
                field_id: parseInt(fieldId),
                value: value,
                type: field.type
              } : null;
            default:
              return null;
          }
        })
        .filter(v => v !== null);

      const calculationData = {
        service_id: parseInt(id),
        field_values: formattedFieldValues,
        products: selectedProducts
      };

      const response = await serviceBuilderService.calculatePrice(calculationData);

      if (response.success) {
        setCalculation(response.calculation);
        setShowBookingModal(true);
        setBookingStep('summary');
      } else {
        setCalculationError(response.message || 'فشل في حساب السعر');
      }
    } catch (err) {
      console.error('Calculation error:', err);
      setCalculationError('حدث خطأ أثناء حساب السعر');
    } finally {
      setCalculating(false);
    }
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.email) {
      setBookingError('يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، البريد الإلكتروني)');
      return;
    }

    try {
      setSubmitting(true);
      setBookingError(null);

      // Format field values for submission
      const formattedFieldValues = Object.entries(fieldValues)
        .map(([fieldId, value]) => {
          const field = service.fields.find(f => f.id === parseInt(fieldId));
          if (!field || !value) return null;

          switch (field.type) {
            case 'select':
            case 'radio':
              return { 
                field_id: parseInt(fieldId), 
                option_id: value,
                value: field.options?.find(opt => opt.id === value)?.value || value.toString()
              };
            case 'checkbox':
              return Array.isArray(value) && value.length > 0
                ? { 
                    field_id: parseInt(fieldId), 
                    option_id: value[0], // Send first selected option id for compatibility
                    value: value.map(v => field.options?.find(opt => opt.id === v)?.value || v).join(', ')
                  }
                : null;
            default:
              return { 
                field_id: parseInt(fieldId), 
                value: value.toString() 
              };
          }
        })
        .filter(v => v !== null);

      const orderData = {
        service_id: parseInt(id),
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        field_values: formattedFieldValues,
        products: selectedProducts,
        notes: customerInfo.notes || undefined,
        payment_method: paymentMethod
      };

      // Only include shipping_address if an address is selected
      if (selectedAddress) {
        orderData.shipping_address = {
          name: selectedAddress.name || customerInfo.name,
          street: selectedAddress.street || selectedAddress.address_line1,
          city: selectedAddress.city,
          state: selectedAddress.state || selectedAddress.city,
          country: selectedAddress.country || 'UAE',
          phone: selectedAddress.phone || customerInfo.phone
        };
      }

      console.log('Submitting order:', orderData);

      const response = await serviceBuilderService.submitOrder(orderData);

      if (response.success) {
        setOrderData(response);
        setOrderSuccess(true);
        setShowBookingModal(false);
      } else {
        setBookingError(response.message || 'فشل في إرسال الطلب');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setBookingError(err.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  // Validation
  const isFormValid = () => {
    if (!service?.fields) return true;
    
    return service.fields.every(field => {
      if (!field.required) return true;
      
      const value = fieldValues[field.id];
      
      switch (field.type) {
        case 'checkbox':
          return Array.isArray(value) && value.length > 0;
        case 'text':
        case 'textarea':
        case 'date':
        case 'time':
        case 'number':
          return value !== '' && value !== null && value !== undefined;
        case 'select':
        case 'radio':
          return value !== null && value !== undefined;
        default:
          return true;
      }
    });
  };

  // Render field based on type
  const renderField = (field) => {
    const value = fieldValues[field.id];

    switch (field.type) {
      case 'text':
        return (
          <div className="field-input-wrapper">
            <input
              type="text"
              className="field-input"
              placeholder={`أدخل ${field.label}`}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value, 'text')}
              required={field.required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div className="field-input-wrapper">
            <textarea
              className="field-textarea"
              placeholder={`أدخل ${field.label}`}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value, 'textarea')}
              required={field.required}
              rows={4}
            />
          </div>
        );

      case 'number':
        return (
          <div className="field-input-wrapper field-number-wrapper">
            <input
              type="number"
              className="field-input field-number"
              placeholder={`أدخل ${field.label}`}
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value, 'number')}
              min={field.min_value}
              max={field.max_value}
              step={field.step || 1}
              required={field.required}
            />
            {field.unit && <span className="field-unit">{field.unit}</span>}
          </div>
        );

      case 'date':
        return (
          <div className="field-input-wrapper field-date-wrapper">
            <FontAwesomeIcon icon={faCalendar} className="field-icon" />
            <input
              type="date"
              className="field-input field-date"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value, 'date')}
              required={field.required}
            />
          </div>
        );

      case 'time':
        return (
          <div className="field-input-wrapper field-time-wrapper">
            <FontAwesomeIcon icon={faClock} className="field-icon" />
            <input
              type="time"
              className="field-input field-time"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value, 'time')}
              required={field.required}
            />
          </div>
        );

      case 'file':
        return (
          <div className="field-file-wrapper">
            <label className="field-file-label">
              <FontAwesomeIcon icon={faUpload} />
              <span>{value || `اختر ${field.label}`}</span>
              <input
                type="file"
                className="field-file-input"
                onChange={(e) => handleFileUpload(field.id, e.target.files[0])}
                required={field.required}
              />
            </label>
            {value && (
              <button
                className="field-file-remove"
                onClick={() => {
                  setFieldValues(prev => ({ ...prev, [field.id]: null }));
                  setUploadedFiles(prev => {
                    const newFiles = { ...prev };
                    delete newFiles[field.id];
                    return newFiles;
                  });
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        );

      case 'select':
        // If options have images, render as cards (smart detection)
        const hasImages = field.options?.some(opt => opt.image_url);
        
        if (hasImages) {
          return (
            <div className="field-options-grid">
              {field.options?.map(option => (
                <div
                  key={option.id}
                  className={`option-card ${value === option.id ? 'selected' : ''}`}
                  onClick={() => handleFieldChange(field.id, option.id, 'select')}
                >
                  {option.image_url && (
                    <div className="option-image-container">
                      <img src={option.image_url} alt={option.label} />
                    </div>
                  )}
                  <div className="option-content">
                    <h4 className="option-label">{option.label}</h4>
                    {option.price_modifier !== 0 && (
                      <span className="option-price">
                        {option.price_modifier > 0 ? '+' : ''}{option.price_modifier} درهم
                      </span>
                    )}
                  </div>
                  <div className="option-check">
                    {value === option.id && <FontAwesomeIcon icon={faCheck} />}
                  </div>
                </div>
              ))}
            </div>
          );
        }
        
        // Otherwise, render as dropdown
        return (
          <div className="field-select-wrapper">
            <select
              className="field-select"
              value={value || ''}
              onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value), 'select')}
              required={field.required}
            >
              <option value="">اختر {field.label}</option>
              {field.options?.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                  {option.price_modifier !== 0 && ` (${option.price_modifier > 0 ? '+' : ''}${option.price_modifier} درهم)`}
                </option>
              ))}
            </select>
          </div>
        );

      case 'radio':
        return (
          <div className="field-options-grid">
            {field.options?.map(option => (
              <div
                key={option.id}
                className={`option-card ${value === option.id ? 'selected' : ''} ${!option.image_url ? 'option-card-compact' : ''}`}
                onClick={() => handleFieldChange(field.id, option.id, 'radio')}
              >
                {option.image_url && (
                  <div className="option-image-container">
                    <img src={option.image_url} alt={option.label} />
                  </div>
                )}
                <div className="option-content">
                  <h4 className="option-label">{option.label}</h4>
                  {option.price_modifier !== 0 && (
                    <span className="option-price">
                      {option.price_modifier > 0 ? '+' : ''}{option.price_modifier} درهم
                    </span>
                  )}
                </div>
                <div className="option-check">
                  {value === option.id && <FontAwesomeIcon icon={faCheck} />}
                </div>
              </div>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="field-options-grid">
            {field.options?.map(option => {
              const isSelected = Array.isArray(value) && value.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={`option-card ${isSelected ? 'selected' : ''} ${!option.image_url ? 'option-card-compact' : ''}`}
                  onClick={() => handleCheckboxToggle(field.id, option.id)}
                >
                  {option.image_url && (
                    <div className="option-image-container">
                      <img src={option.image_url} alt={option.label} />
                    </div>
                  )}
                  <div className="option-content">
                    <h4 className="option-label">{option.label}</h4>
                    {option.price_modifier !== 0 && (
                      <span className="option-price">
                        {option.price_modifier > 0 ? '+' : ''}{option.price_modifier} درهم
                      </span>
                    )}
                  </div>
                  <div className="option-check">
                    {isSelected && <FontAwesomeIcon icon={faCheck} />}
                  </div>
                </div>
              );
            })}
          </div>
        );

      default:
        return <p className="field-unsupported">نوع الحقل غير مدعوم: {field.type}</p>;
    }
  };

  if (loading) {
    return (
      <div className="service-detail-page loading-state">
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>جاري تحميل تفاصيل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-detail-page error-state">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h2>{error}</h2>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={fetchServiceDetails}>
            إعادة المحاولة
          </button>
            <button className="btn btn-secondary" onClick={() => navigate('/services')}>
              العودة للخدمات
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="service-detail-page success-state">
        <div className="success-container">
          <div className="success-icon">
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <h2>تم إرسال طلبك بنجاح!</h2>
          <p>سنقوم بالتواصل معك قريباً لتأكيد الطلب</p>
          {orderData?.order_id && (
            <div className="order-info">
              <p className="order-number">رقم الطلب: <strong>{orderData.order_id}</strong></p>
              {orderData.order_details?.total_amount && (
                <p className="order-total">المبلغ الإجمالي: <strong>{orderData.order_details.total_amount} درهم</strong></p>
              )}
            </div>
          )}
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/services')}>
              العودة للخدمات
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/profile')}>
              عرض طلباتي
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      {/* Header */}
      <header className="service-header">
        <div className="container">
          <button className="btn-back" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faArrowLeft} />
            <span>رجوع</span>
            </button>
          
          <div className="service-header-content">
            <div className="service-title-section">
            <h1>{service?.name}</h1>
              {service?.description && <p className="service-description">{service.description}</p>}
              {service?.category && (
                <div className="service-category-badge">
                  {service.category.name}
          </div>
              )}
          </div>
            
            {service?.requires_pricing !== false && (
              <div className="service-price-section">
                <div className="base-price">
                  <span className="label">السعر الأساسي</span>
                  <span className="price">{service?.base_price} <small>درهم</small></span>
        </div>
      </div>
            )}
          </div>
        </div>
      </header>

        {/* Main Content */}
      <div className="container">
        <div className="service-layout">
          {/* Left Column - Image Gallery */}
          <aside className="service-gallery-section">
            {service?.images && service.images.length > 0 ? (
              <div className="image-gallery">
                <div className="gallery-main">
                  <img 
                    src={service.images[currentImageIndex]?.url} 
                    alt={service.name}
                    className="main-image"
                  />
                  {service.images.length > 1 && (
                    <>
                      <button className="gallery-nav gallery-prev" onClick={prevImage}>
                        <FontAwesomeIcon icon={faChevronRight} />
              </button>
                      <button className="gallery-nav gallery-next" onClick={nextImage}>
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                      <div className="gallery-indicator">
                        {currentImageIndex + 1} / {service.images.length}
                      </div>
                    </>
                  )}
                </div>
                
                {service.images.length > 1 && (
                  <div className="gallery-thumbnails">
                    {service.images.map((image, index) => (
                <button 
                        key={image.id}
                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img src={image.url} alt={`${service.name} ${index + 1}`} />
                </button>
              ))}
            </div>
                )}
          </div>
            ) : (
              <div className="image-placeholder">
                <FontAwesomeIcon icon={faImage} />
                <p>لا توجد صور متاحة</p>
              </div>
            )}
          </aside>

          {/* Right Column - Form */}
          <main className="service-form-section">
            {/* Dynamic Fields */}
            {service?.fields && service.fields.length > 0 && (
              <section className="form-section">
                <h2 className="section-title">تخصيص الخدمة</h2>
                <div className="fields-container">
                  {service.fields.map(field => (
                    <div key={field.id} className={`field-group field-type-${field.type}`}>
                      <label className="field-label">
                        {field.label}
                        {field.required && <span className="required">*</span>}
                      </label>
                      {renderField(field)}
                            </div>
                          ))}
                        </div>
              </section>
            )}

            {/* Products */}
            {service?.enable_products && service?.products && service.products.length > 0 && (
              <section className="form-section">
                <h2 className="section-title">منتجات إضافية</h2>
                    <div className="products-grid">
                  {service.products.map(product => {
                    const selectedProduct = selectedProducts.find(p => p.product_id === product.id);
                    const isSelected = !!selectedProduct;
                    
                        return (
                      <div 
                        key={product.id} 
                        className={`product-card ${isSelected ? 'selected' : ''}`}
                      >
                        {product.image_url && (
                              <div className="product-image">
                            <img src={product.image_url} alt={product.name} />
                              </div>
                            )}
                        
                        <div className="product-info">
                              <h4>{product.name}</h4>
                          {product.description && <p>{product.description}</p>}
                          <div className="product-price">{product.price} درهم</div>
                            </div>
                        
                            <div className="product-actions">
                          {isSelected ? (
                            <div className="quantity-control">
                              <button 
                                className="qty-btn"
                                onClick={() => handleProductQuantityChange(product.id, selectedProduct.quantity - 1)}
                              >
                                <FontAwesomeIcon icon={faMinus} />
                              </button>
                                  <input
                                    type="number"
                                className="qty-input"
                                    value={selectedProduct.quantity}
                                onChange={(e) => handleProductQuantityChange(product.id, e.target.value)}
                                min="1"
                              />
                              <button 
                                className="qty-btn"
                                onClick={() => handleProductQuantityChange(product.id, selectedProduct.quantity + 1)}
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </button>
                                </div>
                              ) : (
                                <button 
                              className="btn btn-outline btn-sm"
                              onClick={() => handleProductToggle(product.id)}
                                >
                                  <FontAwesomeIcon icon={faPlus} />
                                  إضافة
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
              </section>
            )}

          {/* Calculate Button */}
            <div className="form-actions">
            {calculationError && (
                <div className="alert alert-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{calculationError}</span>
              </div>
            )}
              
              <button 
                className="btn btn-primary btn-lg btn-calculate"
                onClick={handleCalculatePrice}
                disabled={calculating || !isFormValid()}
              >
                {calculating ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    جاري الحساب...
                  </>
                ) : service?.requires_pricing === false ? (
                  <>
                    احجز الآن
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </>
                ) : (
                  <>
                    احسب السعر واحجز
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </>
                )}
              </button>
            </div>
          </main>
              </div>
              </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-container modal-booking">
            <button className="modal-close" onClick={() => setShowBookingModal(false)}>
              <FontAwesomeIcon icon={faTimes} />
              </button>
            
            {/* Steps Progress */}
              <div className="booking-steps">
              <div className={`step ${bookingStep === 'summary' ? 'active' : bookingStep !== 'summary' ? 'completed' : ''}`}>
                <div className="step-circle">1</div>
                  <span>ملخص الطلب</span>
                </div>
                <div className={`step ${bookingStep === 'details' ? 'active' : bookingStep === 'payment' ? 'completed' : ''}`}>
                <div className="step-circle">2</div>
                <span>بياناتك</span>
                </div>
                <div className={`step ${bookingStep === 'payment' ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                  <span>الدفع</span>
                </div>
              </div>

              {bookingError && (
              <div className="alert alert-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>{bookingError}</span>
                </div>
              )}

            {/* Step 1: Summary */}
              {bookingStep === 'summary' && (
              <div className="modal-content">
                <h2>ملخص الطلب</h2>
                
                <div className="order-summary">
                  <div className="summary-section">
                    <h3>تفاصيل الخدمة</h3>
                    <div className="summary-row">
                      <span>الخدمة:</span>
                      <strong>{service?.name}</strong>
                    </div>
                    {calculation && (
                      <div className="summary-row">
                        <span>السعر الأساسي:</span>
                        <strong>{calculation.base_price || service?.base_price} درهم</strong>
                      </div>
                    )}
                  </div>

                  {calculation?.field_adjustments > 0 && (
                    <div className="summary-section">
                      <h3>التعديلات</h3>
                      <div className="summary-row">
                        <span>تعديلات الخيارات:</span>
                        <strong className="text-primary">+{calculation.field_adjustments} درهم</strong>
                      </div>
                    </div>
                  )}

                  {selectedProducts.length > 0 && (
                    <div className="summary-section">
                      <h3>المنتجات المضافة</h3>
                      {selectedProducts.map(sp => {
                        const product = service?.products?.find(p => p.id === sp.product_id);
                        return product ? (
                          <div key={sp.product_id} className="summary-row">
                            <span>{product.name} × {sp.quantity}</span>
                            <strong>{product.price * sp.quantity} درهم</strong>
                            </div>
                        ) : null;
                        })}
                    </div>
                  )}

                  {calculation && (
                    <div className="summary-total">
                          <span>المجموع الإجمالي:</span>
                      <strong>{calculation.total || calculation.total_price || 0} درهم</strong>
                    </div>
                  )}
                </div>

                <button className="btn btn-primary btn-lg" onClick={() => setBookingStep('details')}>
                  متابعة
                  <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                </div>
              )}

              {/* Step 2: Customer Details */}
              {bookingStep === 'details' && (
              <div className="modal-content">
                <h2>معلومات التواصل</h2>
                    
                <div className="form-grid">
                    <div className="form-group">
                    <label>الاسم الكامل <span className="required">*</span></label>
                      <input
                        type="text"
                      className="form-input"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="أدخل اسمك الكامل"
                      required
                      />
                    </div>
                    
                    <div className="form-group">
                    <label>رقم الهاتف <span className="required">*</span></label>
                      <input
                        type="tel"
                      className="form-input"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="05xxxxxxxx"
                        required
                      />
                    </div>
                    
                  <div className="form-group full-width">
                    <label>البريد الإلكتروني <span className="required">*</span></label>
                      <input
                        type="email"
                      className="form-input"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>عنوان الخدمة <span className="optional">(اختياري)</span></label>
                    <AddressManager
                      checkoutMode={true}
                      onAddressSelect={setSelectedAddress}
                      selectedAddressId={selectedAddress?.id}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>ملاحظات إضافية</label>
                    <textarea
                      className="form-textarea"
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="أي تفاصيل أو متطلبات خاصة..."
                      rows={3}
                    />
                  </div>
                  </div>

                <div className="modal-actions">
                  {service?.requires_pricing !== false && (
                    <button className="btn btn-secondary" onClick={() => setBookingStep('summary')}>
                      السابق
                    </button>
                  )}
                  <button 
                    className="btn btn-primary"
                    onClick={() => setBookingStep('payment')}
                    disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.email}
                  >
                    متابعة
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {bookingStep === 'payment' && (
              <div className="modal-content">
                <h2>طريقة الدفع</h2>
                    
                    <div className="payment-methods">
                      <div 
                        className={`payment-method ${paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                      >
                    <FontAwesomeIcon icon={faMoneyBill} className="payment-icon" />
                    <div className="payment-info">
                          <h4>الدفع عند الاستلام</h4>
                      <p>ادفع نقداً عند وصول فريق العمل</p>
                        </div>
                    {paymentMethod === 'cash_on_delivery' && (
                      <FontAwesomeIcon icon={faCheck} className="payment-check" />
                    )}
                      </div>
                      
                      <div 
                        className={`payment-method ${paymentMethod === 'credit_card' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('credit_card')}
                      >
                    <FontAwesomeIcon icon={faCreditCard} className="payment-icon" />
                    <div className="payment-info">
                          <h4>بطاقة ائتمان</h4>
                      <p>ادفع الآن عبر البطاقة بشكل آمن</p>
                        </div>
                    {paymentMethod === 'credit_card' && (
                      <FontAwesomeIcon icon={faCheck} className="payment-check" />
                    )}
                      </div>
                      
                      <div 
                        className={`payment-method ${paymentMethod === 'bank_transfer' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('bank_transfer')}
                      >
                    <FontAwesomeIcon icon={faUniversity} className="payment-icon" />
                    <div className="payment-info">
                          <h4>تحويل بنكي</h4>
                      <p>قم بتحويل المبلغ للحساب البنكي</p>
                        </div>
                    {paymentMethod === 'bank_transfer' && (
                      <FontAwesomeIcon icon={faCheck} className="payment-check" />
                    )}
                    </div>
                  </div>

                  <div className="final-summary">
                  <h3>تأكيد نهائي</h3>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>الخدمة:</span>
                      <span>{service?.name}</span>
                    </div>
                    {selectedAddress && (
                      <div className="summary-row">
                        <span>العنوان:</span>
                        <span>{selectedAddress.address_line1 || selectedAddress.street}, {selectedAddress.city}</span>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>طريقة الدفع:</span>
                      <span>
                        {paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 
                         paymentMethod === 'credit_card' ? 'بطاقة ائتمان' : 
                         paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'الدفع عند الاستلام'}
                      </span>
                    </div>
                    {calculation && (
                      <div className="summary-row total">
                        <span>المجموع الإجمالي:</span>
                        <span>{calculation.total || 0} درهم</span>
                      </div>
                    )}
                  </div>
                  </div>

                <div className="modal-actions">
                  <button className="btn btn-secondary" onClick={() => setBookingStep('details')}>
                      السابق
                    </button>
                    <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleSubmitOrder}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                        جاري الإرسال...
                        </>
                      ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} />
                        تأكيد الطلب
                      </>
                      )}
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage; 
