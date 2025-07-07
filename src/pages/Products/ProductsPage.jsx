import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './ProductsPage.css';
import orderService from '../../services/orderService';
import authService from '../../services/authService';
import productService from '../../services/productService';

// Add this function at the top of the file, outside the component
const logDebug = (message, data) => {
  console.log(`[ProductsPage] ${message}`, data);
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams(); // Get productId from URL params
  
  // State for products and filtering
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for product modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  
  // State for shopping cart
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // State for checkout
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  
  // State for checkout form
  const [checkoutFormData, setCheckoutFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });
  
  // State for form validation
  const [formErrors, setFormErrors] = useState({});
  
  // State for toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
    
    // Hide toast after 3 seconds
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle product click to open modal
  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    // Update URL with product ID without reloading page
    navigate(`/products/${product.id}`, { replace: true });
  }, [navigate]);

  // Close product modal
  const handleCloseProductModal = useCallback(() => {
    setShowProductModal(false);
    setSelectedProduct(null);
    // Reset URL to products page
    navigate('/products', { replace: true });
  }, [navigate]);

  // Add to cart function
  const handleAddToCart = (product) => {
    setIsAddingToCart(true);
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    let updatedCart;
    if (existingItem) {
      // Update quantity if already in cart
      updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
    } else {
      // Add new item to cart
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    
    // Save to state and localStorage
    setCart(updatedCart);
    localStorage.setItem('buildingz_cart', JSON.stringify(updatedCart));
    
    showToast(`تمت إضافة ${product.name} إلى سلة التسوق`, 'success');
    setIsAddingToCart(false);
  };

  // Update cart item quantity
  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    );
    
    // Save to state and localStorage
    setCart(updatedCart);
    localStorage.setItem('buildingz_cart', JSON.stringify(updatedCart));
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    
    // Save to state and localStorage
    setCart(updatedCart);
    localStorage.setItem('buildingz_cart', JSON.stringify(updatedCart));
    
    showToast('تم حذف المنتج من السلة', 'info');
  };

  // Handle checkout form input changes
  const handleCheckoutInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutFormData({
      ...checkoutFormData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  // Validate checkout form
  const validateCheckoutForm = () => {
    const errors = {};
    
    if (!checkoutFormData.name.trim()) {
      errors.name = 'الاسم مطلوب';
    }
    
    if (!checkoutFormData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(checkoutFormData.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!checkoutFormData.phone.trim()) {
      errors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^(05|5)[0-9]{8}$/.test(checkoutFormData.phone.replace(/\s/g, ''))) {
      errors.phone = 'رقم الهاتف غير صحيح';
    }
    
    if (!checkoutFormData.address.trim()) {
      errors.address = 'العنوان مطلوب';
    }
    
    if (!checkoutFormData.city.trim()) {
      errors.city = 'المدينة مطلوبة';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle checkout submission
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    if (isProcessing) return;
    
    // Validate form
    if (!validateCheckoutForm()) {
      showToast('يرجى تصحيح الأخطاء في النموذج', 'error');
      return;
    }
    
    setIsProcessing(true);
    logDebug('Processing checkout submission');

    try {
      // Prepare order data
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));
      
      const orderRequest = {
        items: orderItems,
        customer_info: {
          name: checkoutFormData.name,
          email: checkoutFormData.email,
          phone: checkoutFormData.phone,
          address: checkoutFormData.address,
          city: checkoutFormData.city,
          notes: checkoutFormData.notes || ''
        },
        total_amount: cartTotal,
        payment_method: 'cash_on_delivery' // Default payment method
      };
      
      // If user is logged in, we don't need to send customer info again
      if (currentUser) {
        delete orderRequest.customer_info;
      }
      
      logDebug('Sending order request', orderRequest);
      
      // Send order to API
      const response = await orderService.createOrder(orderRequest);
      logDebug('Order API response', response);
      
      // Check if we have a valid response
      if (!response) {
        logDebug('Empty response received');
        throw new Error('لم يتم استلام رد من الخادم. يرجى المحاولة مرة أخرى.');
      }
      
      // Generate a temporary order ID if none was provided
      const orderId = response.data?.id || `ORD-${Date.now()}`;
      
      // Process successful order - handle both data field and direct response formats
      setOrderData({
        orderNumber: orderId,
        orderDate: new Date().toLocaleDateString('ar-SA'),
        customer: checkoutFormData,
        items: [...cart],
        total: cartTotal,
        status: response.data?.status || 'pending',
        message: response.message || 'تم إنشاء الطلب بنجاح',
        apiResponse: response // Store the full response for debugging
      });

      setCart([]);
      setShowCheckout(false);
      setOrderSuccess(true);
      showToast(response.message || 'تم تأكيد طلبك بنجاح! ستصلك رسالة تأكيد قريباً', 'success');
      
    } catch (error) {
      logDebug('Order submission error', error);
      
      // Check if it's a network error
      if (error.message && error.message.includes('Network Error')) {
        showToast('خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.', 'error');
      } else {
        showToast(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick buy function
  const handleQuickBuy = useCallback((product) => {
    if (isProcessing) return;
    
    // Add to cart first
    handleAddToCart(product);
    
    // Then open checkout
    setShowCheckout(true);
  }, [isProcessing]);

  // Get category display name
  const getCategoryDisplayName = (categoryId) => {
    if (!categoryId) return 'غير مصنف';
    
    // If categoryId is already a string name, return it
    if (typeof categoryId === 'string' && !categoryId.match(/^[0-9]+$/)) {
      return categoryId;
    }
    
    // Try to find category in categories array
    const category = categories.find(cat => 
      cat.id === categoryId || 
      cat._id === categoryId || 
      cat.id === parseInt(categoryId) || 
      cat._id === parseInt(categoryId)
    );
    
    if (category) {
      // Return category name if found
      return category.name || category.title || category.label || categoryId;
    }
    
    // Return categoryId as fallback
    return categoryId.toString();
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Render category filters
  const renderCategoryFilters = () => {
    return (
      <div className="category-filters">
        <button
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => handleCategoryChange('all')}
        >
          جميع المنتجات
        </button>
        
        {categories.map((category, index) => (
          <button
            key={index}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => handleCategoryChange(category)}
          >
            {typeof category === 'object' ? category.name || 'غير مصنف' : category}
          </button>
        ))}
      </div>
    );
  };

  // Render error state
  const renderError = () => {
    return (
      <div className="error-container">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <h3>عذراً، حدث خطأ</h3>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          <i className="fas fa-redo"></i> إعادة المحاولة
        </button>
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <div className="empty-state">
        <i className="fas fa-search"></i>
        <h3>لم يتم العثور على منتجات</h3>
        <p>جرب البحث بكلمات مختلفة أو تصفح جميع الفئات</p>
      </div>
    );
  };

  // Render product modal
  const renderProductModal = () => {
    if (!selectedProduct) return null;
    
    return (
      <div className="modal-backdrop" onClick={handleCloseProductModal}>
        <div className="product-modal-container" onClick={e => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={handleCloseProductModal}>
            <i className="fas fa-times"></i>
          </button>
          
          <div className="modal-content-wrapper">
            <div className="modal-image-section">
              <img src={selectedProduct.image} alt={selectedProduct.name} />
              {selectedProduct.discount > 0 && (
                <div className="modal-discount-badge">
                  خصم {selectedProduct.discount}%
                </div>
              )}
            </div>
            
            <div className="modal-details-section">
              <div className="product-header">
                <div className="product-brand-tag">
                  {selectedProduct.vendor || 'BuildingZ'}
                </div>
                <h2 className="product-title">{selectedProduct.name}</h2>
                
                <div className="product-rating-detailed">
                  <div className="stars-container">
                    {Array.from({ length: Math.floor(selectedProduct.rating || 0) }).map((_, i) => (
                      <i key={i} className="fas fa-star filled"></i>
                    ))}
                    {selectedProduct.rating % 1 >= 0.5 && <i className="fas fa-star-half-alt filled"></i>}
                    {Array.from({ length: Math.floor(5 - (selectedProduct.rating || 0)) }).map((_, i) => (
                      <i key={i} className="far fa-star"></i>
                    ))}
                    <span className="rating-details">
                      {selectedProduct.rating || 0} ({selectedProduct.reviews || 0} تقييم)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="product-description-section">
                <h4>الوصف</h4>
                <p className="product-description-text">
                  {selectedProduct.description || 'لا يوجد وصف متاح لهذا المنتج.'}
                </p>
              </div>
              
              {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                <div className="product-specifications">
                  <h4>المواصفات</h4>
                  <div className="specs-grid">
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <span className="spec-label">{key}</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="product-pricing-section">
                <h4>السعر</h4>
                <div className="price-container">
                  <span className="current-price-large">
                    {selectedProduct.price} درهم
                  </span>
                  {selectedProduct.originalPrice && (
                    <span className="original-price-large">
                      {selectedProduct.originalPrice} درهم
                    </span>
                  )}
                  <div className={`stock-info ${selectedProduct.stock > 0 ? 'stock-available' : 'stock-unavailable'}`}>
                    {selectedProduct.stock > 0 
                      ? <><i className="fas fa-check-circle"></i> متوفر في المخزون</>
                      : <><i className="fas fa-times-circle"></i> غير متوفر حالياً</>
                    }
                  </div>
                </div>
              </div>
              
              <div className="modal-actions-section">
                <button 
                  className="primary-action-btn"
                  onClick={() => handleAddToCart(selectedProduct)}
                  disabled={selectedProduct.stock <= 0 || isAddingToCart}
                >
                  <i className="fas fa-cart-plus"></i>
                  أضف إلى السلة
                </button>
                
                <button 
                  className="secondary-action-btn"
                  onClick={() => handleQuickBuy(selectedProduct)}
                  disabled={selectedProduct.stock <= 0 || isProcessing}
                >
                  <i className="fas fa-bolt"></i>
                  شراء سريع
                </button>
                
                <button className="wishlist-action-btn">
                  <i className="far fa-heart"></i>
                </button>
              </div>
              
              <div className="shipping-benefits">
                <div className="benefit-item">
                  <i className="fas fa-truck"></i>
                  <span>توصيل سريع</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>ضمان جودة</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-exchange-alt"></i>
                  <span>استبدال سهل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render cart modal
  const renderCartModal = () => {
    if (!showCart) return null;
    
    return (
      <div className="modal-backdrop" onClick={() => setShowCart(false)}>
        <div className="cart-modal-container" onClick={e => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setShowCart(false)}>
            <i className="fas fa-times"></i>
          </button>
          
          <div className="cart-modal-header">
            <h2>سلة التسوق</h2>
            <span className="cart-item-count">{cart.length} منتج</span>
          </div>
          
          {cart.length > 0 ? (
            <>
              <div className="cart-items-container">
                {cart.map(item => (
                  <div className="cart-item" key={item.id}>
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <div className="cart-item-price">{item.price} درهم</div>
                    </div>
                    <div className="cart-item-quantity">
                      <button 
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <i className="fas fa-minus"></i>
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    <div className="cart-item-subtotal">
                      {(item.price * item.quantity).toFixed(2)} درهم
                    </div>
                    <button 
                      className="remove-item-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="cart-total">
                  <span>المجموع:</span>
                  <span>{cartTotal.toFixed(2)} درهم</span>
                </div>
                
                <div className="cart-actions">
                  <button 
                    className="checkout-btn"
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                  >
                    إتمام الشراء
                  </button>
                  <button 
                    className="continue-shopping-btn"
                    onClick={() => setShowCart(false)}
                  >
                    مواصلة التسوق
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <div className="empty-cart-icon">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <h3>سلة التسوق فارغة</h3>
              <p>لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.</p>
              <button 
                className="continue-shopping-btn"
                onClick={() => setShowCart(false)}
              >
                تصفح المنتجات
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render checkout modal
  const renderCheckoutModal = () => {
    if (!showCheckout) return null;
    
    return (
      <div className="modal-backdrop" onClick={() => setShowCheckout(false)}>
        <div className="checkout-modal-container" onClick={e => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setShowCheckout(false)}>
            <i className="fas fa-times"></i>
          </button>
          
          <div className="checkout-modal-header">
            <h2>إتمام الطلب</h2>
          </div>
          
          <div className="checkout-content">
            <div className="checkout-form-container">
              <form onSubmit={handleCheckoutSubmit}>
                <div className="form-group">
                  <label htmlFor="name">الاسم الكامل</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={checkoutFormData.name}
                    onChange={handleCheckoutInputChange}
                    placeholder="أدخل الاسم الكامل"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">البريد الإلكتروني</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={checkoutFormData.email}
                    onChange={handleCheckoutInputChange}
                    placeholder="أدخل البريد الإلكتروني"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">رقم الهاتف</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={checkoutFormData.phone}
                    onChange={handleCheckoutInputChange}
                    placeholder="أدخل رقم الهاتف"
                    className={formErrors.phone ? 'error' : ''}
                  />
                  {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">العنوان</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={checkoutFormData.address}
                    onChange={handleCheckoutInputChange}
                    placeholder="أدخل العنوان"
                    className={formErrors.address ? 'error' : ''}
                  />
                  {formErrors.address && <div className="error-message">{formErrors.address}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="city">المدينة</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={checkoutFormData.city}
                    onChange={handleCheckoutInputChange}
                    placeholder="أدخل المدينة"
                    className={formErrors.city ? 'error' : ''}
                  />
                  {formErrors.city && <div className="error-message">{formErrors.city}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">ملاحظات إضافية (اختياري)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={checkoutFormData.notes}
                    onChange={handleCheckoutInputChange}
                    placeholder="أي ملاحظات خاصة بالطلب"
                    rows="3"
                  ></textarea>
                </div>
                
                <div className="payment-methods">
                  <h3>طريقة الدفع</h3>
                  <div className="payment-options">
                    <div className="payment-option selected">
                      <input
                        type="radio"
                        id="cash_on_delivery"
                        name="payment_method"
                        value="cash_on_delivery"
                        defaultChecked
                      />
                      <label htmlFor="cash_on_delivery">
                        <i className="fas fa-money-bill-wave"></i>
                        الدفع عند الاستلام
                      </label>
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="submit-order-btn"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner"></span>
                      جاري معالجة الطلب...
                    </>
                  ) : (
                    'تأكيد الطلب'
                  )}
                </button>
              </form>
            </div>
            
            <div className="order-summary">
              <h3>ملخص الطلب</h3>
              <div className="order-items-summary">
                {cart.map(item => (
                  <div className="order-item" key={item.id}>
                    <div className="order-item-details">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x{item.quantity}</span>
                    </div>
                    <span className="item-price">
                      {(item.price * item.quantity).toFixed(2)} درهم
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="order-totals">
                <div className="subtotal-row">
                  <span>المجموع الفرعي:</span>
                  <span>{cartTotal.toFixed(2)} درهم</span>
                </div>
                <div className="shipping-row">
                  <span>تكلفة الشحن:</span>
                  <span>0.00 درهم</span>
                </div>
                <div className="total-row">
                  <span>المجموع الكلي:</span>
                  <span>{cartTotal.toFixed(2)} درهم</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render order success modal
  const renderOrderSuccessModal = () => {
    if (!orderSuccess) return null;
    
    return (
      <div className="modal-backdrop">
        <div className="success-modal-container">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          
          <h2>تم تأكيد طلبك بنجاح!</h2>
          
          <div className="order-details">
            <div className="order-info-row">
              <span>رقم الطلب:</span>
              <span>{orderData?.orderNumber || 'N/A'}</span>
            </div>
            <div className="order-info-row">
              <span>تاريخ الطلب:</span>
              <span>{orderData?.orderDate || new Date().toLocaleDateString('ar-SA')}</span>
            </div>
            <div className="order-info-row">
              <span>حالة الطلب:</span>
              <span className="status-badge">
                {orderData?.status || 'قيد المعالجة'}
              </span>
            </div>
            <div className="order-info-row">
              <span>المبلغ الإجمالي:</span>
              <span>{orderData?.total?.toFixed(2) || cartTotal.toFixed(2)} درهم</span>
            </div>
          </div>
          
          <p className="success-message">
            {orderData?.message || 'سيتم التواصل معك قريبًا لتأكيد تفاصيل الطلب والشحن.'}
          </p>
          
          <div className="success-actions">
            <button 
              className="continue-shopping-btn"
              onClick={() => {
                setOrderSuccess(false);
                setOrderData(null);
                navigate('/products');
              }}
            >
              العودة للتسوق
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Check for product ID in URL
  useEffect(() => {
    const loadProductFromId = async () => {
      // If we have a productId from URL params
      if (productId) {
        logDebug('Product ID found in URL', productId);
        
        if (products.length > 0) {
          // Try to find the product in our loaded products
          const product = products.find(p => p.id.toString() === productId.toString());
          
          if (product) {
            logDebug('Found product in loaded products', product);
            setSelectedProduct(product);
            setShowProductModal(true);
          } else {
            // Product not found in loaded products, try to fetch it directly
            try {
              logDebug('Fetching product by ID', productId);
              const fetchedProduct = await productService.getProductById(productId);
              
              if (fetchedProduct) {
                logDebug('Successfully fetched product by ID', fetchedProduct);
                setSelectedProduct(fetchedProduct);
                setShowProductModal(true);
              } else {
                logDebug('Product not found by ID', productId);
                showToast('لم يتم العثور على المنتج المطلوب', 'error');
              }
            } catch (error) {
              console.error('Error fetching product by ID:', error);
              showToast('حدث خطأ أثناء تحميل المنتج', 'error');
            }
          }
        }
      }
    };

    loadProductFromId();
  }, [productId, products]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch products from API
        const productsData = await productService.getProducts();
        logDebug('Products fetched from API', productsData);
        
        if (!productsData || productsData.length === 0) {
          setError('لم يتم العثور على منتجات. يرجى المحاولة مرة أخرى لاحقًا.');
          setProducts([]);
          setFilteredProducts([]);
          return;
        }
        
        // Transform data if needed to match our expected format
        const formattedProducts = productsData.map(product => {
          // Handle image path
          let imagePath = 'https://via.placeholder.com/150?text=No+Image';
          if (product.images && product.images.length > 0) {
            imagePath = product.images[0];
          } else if (product.image) {
            imagePath = product.image;
          }
          
          // Handle category
          let categoryName = 'غير مصنف';
          let categoryId = null;
          
          if (product.category) {
            if (typeof product.category === 'object') {
              categoryName = product.category.name || 'غير مصنف';
              categoryId = product.category.id || product.category._id;
            } else {
              categoryName = product.category.toString();
              categoryId = product.category;
            }
          } else if (product.category_id) {
            categoryId = product.category_id;
          }
          
          return {
            id: product.id || product._id,
            name: product.name || 'منتج بدون اسم',
            price: parseFloat(product.price) || 0,
            description: product.description || 'لا يوجد وصف متاح',
            image: imagePath,
            category: categoryName,
            categoryId: categoryId,
            stock: product.stock_quantity || 0,
            rating: parseFloat(product.rating) || 0,
            reviews: parseInt(product.reviews) || 0,
            sku: product.sku || '',
            weight: product.weight || '',
            dimensions: product.dimensions || {},
            specifications: product.specifications || {},
            vendor: product.vendor_profile?.business_name || 'غير محدد'
          };
        });
        
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
        
        // Extract unique categories from the formatted products
        const uniqueCategories = [...new Set(
          formattedProducts
            .map(product => product.category)
            .filter(Boolean)
        )];
        setCategories(uniqueCategories);
        
        // After loading products, check if we need to show a specific product (from URL)
        if (productId && formattedProducts.length > 0) {
          const product = formattedProducts.find(p => p.id.toString() === productId.toString());
          if (product) {
            setSelectedProduct(product);
            setShowProductModal(true);
          }
        }
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('فشل في تحميل المنتجات. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [productId]);
  
  // Fetch current user if logged in
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          
          // Pre-fill checkout form with user data if available
          setCheckoutFormData(prevState => ({
            ...prevState,
            name: user.name || prevState.name,
            email: user.email || prevState.email,
            phone: user.phone || prevState.phone,
            address: user.address || prevState.address,
            city: user.city || prevState.city
          }));
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    getCurrentUser();
  }, []);

  // Calculate cart total when cart changes
  useEffect(() => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(total);
  }, [cart]);

  // Filter products
  useEffect(() => {
    let results = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredProducts(results);
  }, [selectedCategory, searchTerm, products]);

  // Add this useEffect to load cart from localStorage
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('buildingz_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
          logDebug('Cart loaded from localStorage', parsedCart);
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('buildingz_cart');
      }
    }
  }, []);

  // Render products page content
  return (
    <div className="products-page">
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جاري تحميل المنتجات...</p>
        </div>
      ) : error ? (
        renderError()
      ) : (
        <div className="products-container">
          <div className="products-header">
            <h1>منتجاتنا</h1>
            <div className="products-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
              <button
                className="cart-btn"
                onClick={() => setShowCart(true)}
              >
                <i className="fas fa-shopping-cart"></i>
                <span className="cart-count">{cart.length}</span>
              </button>
            </div>
          </div>

          <div className="products-content">
            <div className="products-sidebar">
              <div className="filter-container">
                <h2>تصفية النتائج</h2>
                <div className="filter-group">
                  <h3>الفئات</h3>
                  {renderCategoryFilters()}
                </div>
              </div>
            </div>

            <div className="products-grid">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div 
                    className="product-card" 
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <div className="product-price">
                        <span className="current-price">{product.price} درهم</span>
                        {product.originalPrice && (
                          <span className="original-price">{product.originalPrice} درهم</span>
                        )}
                      </div>
                      <div className="product-rating">
                        {Array.from({ length: Math.floor(product.rating || 0) }).map((_, i) => (
                          <i key={i} className="fas fa-star"></i>
                        ))}
                        {product.rating % 1 >= 0.5 && <i className="fas fa-star-half-alt"></i>}
                        {Array.from({ length: Math.floor(5 - (product.rating || 0)) }).map((_, i) => (
                          <i key={i} className="far fa-star"></i>
                        ))}
                        <span>{product.reviews || 0} تقييم</span>
                      </div>
                      <button
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent opening modal when clicking the button
                          handleAddToCart(product);
                        }}
                        disabled={isAddingToCart}
                      >
                        <i className="fas fa-cart-plus"></i>
                        أضف إلى السلة
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                renderEmptyState()
              )}
            </div>
          </div>
          
          {/* Product Detail Modal */}
          {showProductModal && renderProductModal()}
          
          {/* Shopping Cart Modal */}
          {showCart && renderCartModal()}
          
          {/* Checkout Modal */}
          {showCheckout && renderCheckoutModal()}
          
          {/* Order Success Modal */}
          {orderSuccess && renderOrderSuccessModal()}
          
          {/* Toast Notification */}
          {toast.show && (
            <div className={`toast ${toast.type}`}>
              <span>{toast.message}</span>
              <button onClick={() => setToast({ ...toast, show: false })}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage; 