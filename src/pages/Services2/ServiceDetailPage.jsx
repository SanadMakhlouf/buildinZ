import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faHeart, 
  faSearch, 
  faPlus,
  faLayerGroup,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import serviceBuilderService from '../../services/serviceBuilderService';
import placeholderImage from '../../assets/images/hero-bg.png';
import './ServiceDetailPage.css';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await serviceBuilderService.getServiceById(id);
      if (response.success) {
        setService(response.service); // Changed from response.data to response.service
        // Initialize field values
        const initialValues = {};
        if (response.service.fields) {
          response.service.fields.forEach(field => {
            if (field.type === 'number') {
              initialValues[field.id] = { value: '', type: field.type };
            } else if (field.options && field.options.length > 0) {
              initialValues[field.id] = { option_id: null, type: field.type };
            }
          });
        }
        setFieldValues(initialValues);
      } else {
        setError(response.message || 'فشل في تحميل تفاصيل الخدمة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء تحميل تفاصيل الخدمة');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldValueChange = (fieldId, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: { value, type: 'number' }
    }));
  };

  const handleOptionSelect = (fieldId, optionId) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: { option_id: optionId, type: 'option' }
    }));
  };

  const handleProductSelect = (productId, quantity = 1) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.product_id === productId);
      if (existing) {
        return prev.map(p => 
          p.product_id === productId 
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      } else {
        return [...prev, { product_id: productId, quantity }];
      }
    });
  };

  const handleProductQuantityChange = (productId, quantity) => {
    if (quantity <= 0) {
      setSelectedProducts(prev => prev.filter(p => p.product_id !== productId));
    } else {
      setSelectedProducts(prev => 
        prev.map(p => 
          p.product_id === productId 
            ? { ...p, quantity }
            : p
        )
      );
    }
  };

  const handleCalculatePrice = async () => {
    try {
      setCalculating(true);
      setCalculationError(null);

      const field_values = Object.entries(fieldValues)
        .filter(([_, value]) => value.value !== null && value.value !== '')
        .map(([fieldId, value]) => ({
          field_id: parseInt(fieldId),
          ...value
        }));

      const calculationData = {
        service_id: parseInt(id),
        field_values,
        products: selectedProducts
      };

      const response = await serviceBuilderService.calculatePrice(calculationData);

      if (response.success) {
        setCalculation(response.calculation); // Changed from response.data to response.calculation
      } else {
        setCalculationError(response.message || 'فشل في حساب السعر');
      }
    } catch (err) {
      setCalculationError('حدث خطأ أثناء حساب السعر');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);

      const field_values = Object.entries(fieldValues)
        .filter(([_, value]) => value.value !== null && value.value !== '')
        .map(([fieldId, value]) => ({
          field_id: parseInt(fieldId),
          ...value
        }));

      const orderData = {
        service_id: parseInt(id),
        customer_name: orderFormData.name,
        customer_email: orderFormData.email,
        customer_phone: orderFormData.phone,
        field_values,
        products: selectedProducts,
        notes: orderFormData.notes
      };

      const response = await serviceBuilderService.submitOrder(orderData);

      if (response.success) {
        setOrderSuccess(true);
        setShowOrderForm(false);
      } else {
        setCalculationError(response.message || 'فشل في إرسال الطلب');
      }
    } catch (err) {
      setCalculationError('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const getProductsByCategory = () => {
    if (!service) return {};
    
    const grouped = {};
    
    // Handle products with tags
    if (service.productsByTag) {
      service.productsByTag.forEach(tagGroup => {
        const category = tagGroup.tag.name;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(...tagGroup.products);
      });
    }
    
    // Handle products without tags
    if (service.productsWithoutTags && service.productsWithoutTags.length > 0) {
      const category = 'منتجات إضافية';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(...service.productsWithoutTags);
    }
    
    return grouped;
  };

  const getSelectedProduct = (productId) => {
    return selectedProducts.find(p => p.product_id === productId);
  };

  const getTotalPrice = () => {
    if (!calculation) return 0;
    return calculation.total || 0; // Changed from calculation.total_price to calculation.total
  };

  const getSelectedProductsCount = () => {
    return selectedProducts.reduce((total, product) => total + product.quantity, 0);
  };

  if (loading) {
    return (
      <div className="service-detail-page">
        <div className="loading-container">
          <FontAwesomeIcon icon={faLayerGroup} spin />
          <p>جاري تحميل تفاصيل الخدمة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-detail-page">
        <div className="error-container">
          <FontAwesomeIcon icon={faLayerGroup} />
          <p>{error}</p>
          <button className="retry-button" onClick={fetchServiceDetails}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="service-detail-page">
        <div className="order-success">
          <div className="success-icon">
            <FontAwesomeIcon icon={faHeart} />
          </div>
          <h2>تم إرسال طلبك بنجاح!</h2>
          <p>سنقوم بالتواصل معك قريباً لتأكيد الطلب</p>
          <p>رقم الطلب: {Date.now()}</p>
          <div className="success-actions">
            <button 
              className="primary-button" 
              onClick={() => navigate('/services2')}
            >
              العودة للخدمات
            </button>
          </div>
        </div>
      </div>
    );
  }

  const productsByCategory = getProductsByCategory();
  const categories = Object.keys(productsByCategory);

  return (
    <div className="service-detail-page">
      {/* Header */}
      <div className="service-header">
        <div className="header-content">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faArrowLeft} />
              رجوع
            </button>
            <div className="step-indicator">
              <span className="step-text">الخطوة 1 من 3</span>
            </div>
            <h1>{service?.name}</h1>
            <p className="service-description">{service?.description}</p>
          </div>
          <div className="header-right">
            <button className="favorite-button">
              <FontAwesomeIcon icon={faHeart} />
            </button>
          </div>
        </div>
      </div>

      <div className="service-content">
        {/* Main Content */}
        <div className="service-main">
          {/* Category Filters */}
          <div className="category-filters">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                جميع الخيارات
              </button>
              {categories.map(category => (
                <button 
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Fields Section */}
          {service?.fields && service.fields.length > 0 && (
            <div className="fields-section">
              <h2>اختر الخيارات المناسبة</h2>
              <div className="fields-container">
                {service.fields.map(field => (
                  <div key={field.id} className="field-item">
                    <h3>
                      {field.required && <span className="required">*</span>}
                      {field.label}
                    </h3>
                    {field.description && (
                      <p className="field-description">{field.description}</p>
                    )}
                    
                    {field.type === 'number' ? (
                      <div className="number-input-container">
                        <input
                          type="number"
                          className="number-input"
                          placeholder={`أدخل ${field.label}`}
                          min={field.min_value}
                          max={field.max_value}
                          step={field.step}
                          value={fieldValues[field.id]?.value || ''}
                          onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        />
                        {field.unit && <span className="unit-label">{field.unit}</span>}
                      </div>
                    ) : field.options && field.options.length > 0 ? (
                      <div className="field-options">
                        {field.options.map(option => (
                          <div
                            key={option.id}
                            className={`option-card ${fieldValues[field.id]?.option_id === option.id ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect(field.id, option.id)}
                          >
                            {option.image_path ? (
                              <div className="option-image">
                                <img 
                                  src={serviceBuilderService.getImageUrl(option.image_path)} 
                                  alt={option.label}
                                  onError={(e) => e.target.style.display = 'none'}
                                />
                              </div>
                            ) : (
                              <div className="option-placeholder">
                                <FontAwesomeIcon icon={faImage} />
                              </div>
                            )}
                            <div className="option-content">
                              <h4>{option.label}</h4>
                              {option.price_modifier && (
                                <span className="price-adjustment">
                                  {option.price_modifier > 0 ? '+' : ''}{option.price_modifier} د.ك
                                </span>
                              )}
                            </div>
                            {fieldValues[field.id]?.option_id === option.id && (
                              <div className="selected-indicator">
                                <FontAwesomeIcon icon={faPlus} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-options">
                        لا توجد خيارات متاحة لهذا الحقل
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {service && (service.productsByTag || service.productsWithoutTags) && (
            <div className="products-section">
              <h2>اختر المنتجات</h2>
              {Object.entries(productsByCategory).map(([category, products]) => (
                <div key={category} className="products-by-category">
                  <h3 className="category-title">{category}</h3>
                  <div className="products-grid">
                    {products.map(product => {
                      const selectedProduct = getSelectedProduct(product.id);
                      return (
                        <div key={product.id} className="product-card">
                          {product.image_path ? (
                            <div className="product-image">
                              <img 
                                src={serviceBuilderService.getImageUrl(product.image_path)} 
                                alt={product.name}
                                onError={(e) => e.target.style.display = 'none'}
                              />
                            </div>
                          ) : (
                            <div className="product-placeholder">
                              <FontAwesomeIcon icon={faImage} />
                            </div>
                          )}
                          <div className="product-content">
                            <h4>{product.name}</h4>
                            <div className="product-price">{product.unit_price} د.ك</div>
                            {product.description && (
                              <p className="product-description">{product.description}</p>
                            )}
                          </div>
                          <div className="product-actions">
                            {selectedProduct ? (
                              <div className="quantity-selector">
                                <label>الكمية:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={selectedProduct.quantity}
                                  onChange={(e) => handleProductQuantityChange(product.id, parseInt(e.target.value))}
                                />
                              </div>
                            ) : (
                              <button 
                                className="add-product-btn"
                                onClick={() => handleProductSelect(product.id, 1)}
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
                </div>
              ))}
            </div>
          )}

          {/* Calculate Button */}
          <div className="calculate-section">
            <button 
              className="calculate-button"
              onClick={handleCalculatePrice}
              disabled={calculating}
            >
              {calculating ? 'جاري الحساب...' : 'احسب السعر'}
            </button>
            {calculationError && (
              <div className="calculation-error">
                <FontAwesomeIcon icon={faLayerGroup} />
                {calculationError}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="service-sidebar">
          {/* Service Preview */}
          <div className="service-preview">
            {service?.preview_image ? (
              <img 
                src={serviceBuilderService.getImageUrl(service.preview_image)} 
                alt={service.name}
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <div className="service-placeholder">
                <FontAwesomeIcon icon={faLayerGroup} />
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="booking-summary">
            <h3>تفاصيل الحجز</h3>
            <div className="summary-item">
              <span className="summary-label">الخدمة:</span>
              <span className="summary-value">{service?.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">المنتجات المختارة:</span>
              <span className="summary-value">{getSelectedProductsCount()}</span>
            </div>
            {calculation && (
              <div className="summary-item">
                <span className="summary-label">السعر الإجمالي:</span>
                <span className="summary-value price">{getTotalPrice()} د.ك</span>
              </div>
            )}
          </div>

          {/* Payment Summary */}
          <div className="payment-summary">
            <h3>ملخص الدفع</h3>
            <div className="price-total">
              <span>المجموع:</span>
              <span>{getTotalPrice()} د.ك</span>
            </div>
            <button 
              className="order-button"
              onClick={() => setShowOrderForm(true)}
              disabled={!calculation}
            >
              إرسال الطلب
            </button>
          </div>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="order-form-overlay">
          <div className="order-form-container">
            <div className="order-form-header">
              <h2>إرسال الطلب</h2>
              <button 
                className="close-button"
                onClick={() => setShowOrderForm(false)}
              >
                ×
              </button>
            </div>
            <form className="order-form" onSubmit={(e) => { e.preventDefault(); handleSubmitOrder(); }}>
              <div className="form-group">
                <label>الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={orderFormData.name}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  value={orderFormData.phone}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={orderFormData.email}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>ملاحظات إضافية</label>
                <textarea
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowOrderForm(false)}
                >
                  إلغاء
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={submitting}
                >
                  {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage; 