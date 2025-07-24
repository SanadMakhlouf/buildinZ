import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faExclamationTriangle, 
  faArrowRight, 
  faCheck, 
  faShoppingCart,
  faCalculator,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import serviceBuilderService from '../../services/serviceBuilderService';
import './ServiceDetailPage.css';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldValues, setFieldValues] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('fields');
  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    fetchServiceDetails();
  }, [id]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceBuilderService.getServiceById(id);
      
      if (response.success) {
        setService(response.service);
        
        // Initialize field values
        if (response.service.fields) {
          const initialFieldValues = response.service.fields.map(field => ({
            field_id: field.id,
            option_id: null,
            value: null
          }));
          setFieldValues(initialFieldValues);
        }
      } else {
        setError(response.message || 'Failed to fetch service details');
      }
    } catch (err) {
      setError('حدث خطأ أثناء جلب تفاصيل الخدمة. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldOptionSelect = (fieldId, optionId, value) => {
    setFieldValues(prevValues => {
      const newValues = [...prevValues];
      const fieldIndex = newValues.findIndex(field => field.field_id === fieldId);
      
      if (fieldIndex !== -1) {
        newValues[fieldIndex] = {
          ...newValues[fieldIndex],
          option_id: optionId,
          value: value
        };
      }
      
      return newValues;
    });
  };

  const handleProductSelect = (product) => {
    setSelectedProducts(prevProducts => {
      const existingProduct = prevProducts.find(p => p.product_id === product.id);
      
      if (existingProduct) {
        // If product already exists, remove it
        return prevProducts.filter(p => p.product_id !== product.id);
      } else {
        // Add product with quantity 1 (or min_quantity if specified)
        return [
          ...prevProducts,
          {
            product_id: product.id,
            quantity: product.min_quantity || 1
          }
        ];
      }
    });
  };

  const handleProductQuantityChange = (productId, quantity) => {
    setSelectedProducts(prevProducts => {
      return prevProducts.map(product => {
        if (product.product_id === productId) {
          return {
            ...product,
            quantity: parseInt(quantity)
          };
        }
        return product;
      });
    });
  };

  const isProductSelected = (productId) => {
    return selectedProducts.some(product => product.product_id === productId);
  };

  const getSelectedProductQuantity = (productId) => {
    const product = selectedProducts.find(p => p.product_id === productId);
    return product ? product.quantity : 0;
  };

  const handleCalculatePrice = async () => {
    // Validate required fields
    const requiredFields = service.fields.filter(field => field.is_required);
    const missingFields = requiredFields.filter(field => {
      const fieldValue = fieldValues.find(fv => fv.field_id === field.id);
      return !fieldValue || !fieldValue.option_id;
    });
    
    if (missingFields.length > 0) {
      setCalculationError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    try {
      setCalculating(true);
      setCalculationError(null);
      
      const calculationData = {
        service_id: service.id,
        field_values: fieldValues.filter(field => field.option_id),
        products: selectedProducts
      };
      
      const response = await serviceBuilderService.calculatePrice(calculationData);
      
      if (response.success) {
        setCalculation(response.calculation);
        setActiveTab('summary');
      } else {
        setCalculationError(response.message || 'Failed to calculate price');
      }
    } catch (err) {
      setCalculationError('حدث خطأ أثناء حساب السعر. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleOrderFormChange = (e) => {
    const { name, value } = e.target;
    setOrderFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const orderData = {
        service_id: service.id,
        ...orderFormData,
        field_values: fieldValues.filter(field => field.option_id),
        products: selectedProducts
      };
      
      const response = await serviceBuilderService.submitOrder(orderData);
      
      if (response.success) {
        setOrderSuccess(response);
      } else {
        setCalculationError(response.message || 'Failed to submit order');
      }
    } catch (err) {
      setCalculationError('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>جاري تحميل تفاصيل الخدمة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <p>{error}</p>
            <button onClick={fetchServiceDetails} className="retry-button">
              إعادة المحاولة
            </button>
            <button onClick={() => navigate('/services2')} className="back-button">
              <FontAwesomeIcon icon={faArrowRight} />
              العودة إلى الخدمات
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h2>تم إرسال طلبك بنجاح!</h2>
            <p>رقم الطلب: {orderSuccess.order_id}</p>
            {orderSuccess.estimated_delivery && (
              <p>موعد التسليم المتوقع: {orderSuccess.estimated_delivery}</p>
            )}
            <div className="success-actions">
              <button onClick={() => navigate('/services2')} className="primary-button">
                العودة إلى الخدمات
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="service-detail-page">
        <div className="container">
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <p>لم يتم العثور على الخدمة</p>
            <button onClick={() => navigate('/services2')} className="back-button">
              <FontAwesomeIcon icon={faArrowRight} />
              العودة إلى الخدمات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="service-detail-page">
      <div className="container">
        <div className="service-header">
          <button onClick={() => navigate('/services2')} className="back-button">
            <FontAwesomeIcon icon={faArrowRight} />
            العودة إلى الخدمات
          </button>
          <h1>{service.name}</h1>
          {service.description && <p className="service-description">{service.description}</p>}
        </div>

        <div className="service-content">
          <div className="service-main">
            <div className="service-tabs">
              <button 
                className={`tab-button ${activeTab === 'fields' ? 'active' : ''}`}
                onClick={() => setActiveTab('fields')}
              >
                الخيارات
              </button>
              <button 
                className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                المنتجات
              </button>
              {calculation && (
                <button 
                  className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  الملخص
                </button>
              )}
            </div>

            {activeTab === 'fields' && (
              <div className="service-fields">
                <h2>اختر الخيارات المناسبة</h2>
                
                {service.fields && service.fields.length > 0 ? (
                  <div className="fields-container">
                    {service.fields.map(field => (
                      <div key={field.id} className="field-item">
                        <h3>
                          {field.name}
                          {field.is_required && <span className="required">*</span>}
                        </h3>
                        {field.description && <p className="field-description">{field.description}</p>}
                        
                        <div className="field-options">
                          {field.options.map(option => {
                            const isSelected = fieldValues.some(
                              fv => fv.field_id === field.id && fv.option_id === option.id
                            );
                            
                            return (
                              <div 
                                key={option.id}
                                className={`option-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleFieldOptionSelect(field.id, option.id, option.name)}
                              >
                                <div className="option-content">
                                  <h4>{option.name}</h4>
                                  {option.price_adjustment > 0 && (
                                    <span className="price-adjustment">+{option.price_adjustment}</span>
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="selected-indicator">
                                    <FontAwesomeIcon icon={faCheck} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-fields">لا توجد خيارات متاحة لهذه الخدمة</p>
                )}

                <div className="fields-actions">
                  <button 
                    className="next-button"
                    onClick={() => setActiveTab('products')}
                  >
                    التالي: المنتجات
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="service-products">
                <h2>اختر المنتجات</h2>
                
                {/* Products with tags */}
                {service.productsByTag && service.productsByTag.length > 0 && (
                  <div className="products-by-tag">
                    {service.productsByTag.map(tagGroup => (
                      <div key={tagGroup.tag.id} className="tag-group">
                        <h3 className="tag-title" style={{ color: tagGroup.tag.color }}>
                          {tagGroup.tag.name}
                        </h3>
                        
                        <div className="products-grid">
                          {tagGroup.products.map(product => {
                            const isSelected = isProductSelected(product.id);
                            const quantity = getSelectedProductQuantity(product.id);
                            
                            return (
                              <div 
                                key={product.id}
                                className={`product-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleProductSelect(product)}
                              >
                                <div className="product-image">
                                  <img 
                                    src={serviceBuilderService.getImageUrl(product.image_path)} 
                                    alt={product.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/assets/images/placeholder.jpg';
                                    }}
                                  />
                                </div>
                                <div className="product-content">
                                  <h4>{product.name}</h4>
                                  <p className="product-price">{product.unit_price} درهم</p>
                                  {product.description && (
                                    <p className="product-description">{product.description}</p>
                                  )}
                                </div>
                                
                                {isSelected && (
                                  <div className="selected-indicator">
                                    <FontAwesomeIcon icon={faCheck} />
                                  </div>
                                )}
                                
                                {isSelected && product.quantity_toggle && (
                                  <div 
                                    className="quantity-selector"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <label>الكمية:</label>
                                    <input 
                                      type="number" 
                                      value={quantity}
                                      min={product.min_quantity || 1}
                                      max={product.max_quantity || 100}
                                      onChange={(e) => handleProductQuantityChange(product.id, e.target.value)}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Products without tags */}
                {service.productsWithoutTags && service.productsWithoutTags.length > 0 && (
                  <div className="products-without-tags">
                    <h3>منتجات إضافية</h3>
                    
                    <div className="products-grid">
                      {service.productsWithoutTags.map(product => {
                        const isSelected = isProductSelected(product.id);
                        const quantity = getSelectedProductQuantity(product.id);
                        
                        return (
                          <div 
                            key={product.id}
                            className={`product-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleProductSelect(product)}
                          >
                            <div className="product-image">
                              <img 
                                src={serviceBuilderService.getImageUrl(product.image_path)} 
                                alt={product.name}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/assets/images/placeholder.jpg';
                                }}
                              />
                            </div>
                            <div className="product-content">
                              <h4>{product.name}</h4>
                              <p className="product-price">{product.unit_price} درهم</p>
                              {product.description && (
                                <p className="product-description">{product.description}</p>
                              )}
                            </div>
                            
                            {isSelected && (
                              <div className="selected-indicator">
                                <FontAwesomeIcon icon={faCheck} />
                              </div>
                            )}
                            
                            {isSelected && product.quantity_toggle && (
                              <div 
                                className="quantity-selector"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <label>الكمية:</label>
                                <input 
                                  type="number" 
                                  value={quantity}
                                  min={product.min_quantity || 1}
                                  max={product.max_quantity || 100}
                                  onChange={(e) => handleProductQuantityChange(product.id, e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {(!service.productsByTag || service.productsByTag.length === 0) && 
                 (!service.productsWithoutTags || service.productsWithoutTags.length === 0) && (
                  <p className="no-products">لا توجد منتجات متاحة لهذه الخدمة</p>
                )}

                <div className="products-actions">
                  <button 
                    className="back-button"
                    onClick={() => setActiveTab('fields')}
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                    العودة إلى الخيارات
                  </button>
                  
                  <button 
                    className="calculate-button"
                    onClick={handleCalculatePrice}
                    disabled={calculating}
                  >
                    {calculating ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} spin />
                        جاري الحساب...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCalculator} />
                        حساب السعر
                      </>
                    )}
                  </button>
                </div>
                
                {calculationError && (
                  <div className="calculation-error">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <p>{calculationError}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && calculation && (
              <div className="service-summary">
                <h2>ملخص الطلب</h2>
                
                <div className="summary-content">
                  <div className="summary-section">
                    <h3>الخيارات المحددة</h3>
                    {calculation.fields && calculation.fields.length > 0 ? (
                      <div className="summary-fields">
                        {calculation.fields.map(field => (
                          <div key={field.id} className="summary-field-item">
                            <span className="field-name">{field.name}:</span>
                            <span className="field-value">{field.value}</span>
                            {field.price_adjustment > 0 && (
                              <span className="field-price">+{field.price_adjustment} درهم</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>لم يتم اختيار أي خيارات</p>
                    )}
                  </div>
                  
                  <div className="summary-section">
                    <h3>المنتجات المحددة</h3>
                    {calculation.products && calculation.products.length > 0 ? (
                      <div className="summary-products">
                        {calculation.products.map(product => (
                          <div key={product.id} className="summary-product-item">
                            <span className="product-name">{product.name}</span>
                            <span className="product-quantity">الكمية: {product.quantity}</span>
                            <span className="product-price">{product.total} درهم</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>لم يتم اختيار أي منتجات</p>
                    )}
                  </div>
                  
                  <div className="summary-totals">
                    <div className="total-row">
                      <span>المجموع الفرعي:</span>
                      <span>{calculation.subtotal} درهم</span>
                    </div>
                    
                    {calculation.field_adjustments > 0 && (
                      <div className="total-row">
                        <span>تعديلات الخيارات:</span>
                        <span>+{calculation.field_adjustments} درهم</span>
                      </div>
                    )}
                    
                    <div className="total-row grand-total">
                      <span>المجموع الكلي:</span>
                      <span>{calculation.total} درهم</span>
                    </div>
                  </div>
                </div>
                
                <div className="summary-actions">
                  <button 
                    className="back-button"
                    onClick={() => setActiveTab('products')}
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                    العودة إلى المنتجات
                  </button>
                  
                  <button 
                    className="order-button"
                    onClick={() => setShowOrderForm(true)}
                  >
                    <FontAwesomeIcon icon={faShoppingCart} />
                    طلب الخدمة
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="service-sidebar">
            <div className="service-preview">
              <img 
                src={serviceBuilderService.getImageUrl(service.preview_image)} 
                alt={service.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/images/placeholder.jpg';
                }}
              />
            </div>
            
            {calculation && (
              <div className="price-summary">
                <h3>ملخص السعر</h3>
                <div className="price-total">
                  <span>المجموع:</span>
                  <span>{calculation.total} درهم</span>
                </div>
                <button 
                  className="order-button"
                  onClick={() => setShowOrderForm(true)}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  طلب الخدمة
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showOrderForm && (
        <div className="order-form-overlay">
          <div className="order-form-container">
            <div className="order-form-header">
              <h2>إكمال الطلب</h2>
              <button 
                className="close-button"
                onClick={() => setShowOrderForm(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitOrder} className="order-form">
              <div className="form-group">
                <label htmlFor="customer_name">الاسم الكامل <span className="required">*</span></label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={orderFormData.customer_name}
                  onChange={handleOrderFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customer_email">البريد الإلكتروني <span className="required">*</span></label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  value={orderFormData.customer_email}
                  onChange={handleOrderFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customer_phone">رقم الهاتف <span className="required">*</span></label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  value={orderFormData.customer_phone}
                  onChange={handleOrderFormChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">ملاحظات إضافية</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={orderFormData.notes}
                  onChange={handleOrderFormChange}
                  rows="4"
                ></textarea>
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
                  {submitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      جاري إرسال الطلب...
                    </>
                  ) : (
                    'إرسال الطلب'
                  )}
                </button>
              </div>
              
              {calculationError && (
                <div className="form-error">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <p>{calculationError}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailPage; 