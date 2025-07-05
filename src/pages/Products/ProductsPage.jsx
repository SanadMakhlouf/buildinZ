import React, { useState, useEffect, useCallback } from 'react';
import Toast from '../../components/Toast';
import './ProductsPage.css';
import { products as dummyProducts } from '../../data/dummyData';
import orderService from '../../services/orderService';
import authService from '../../services/authService';
import productService from '../../services/productService';

// Add this function at the top of the file, outside the component
const logDebug = (message, data) => {
  console.log(`[ProductsPage] ${message}`, data);
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkoutFormData, setCheckoutFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch products from API
        const productsData = await productService.getProducts();
        logDebug('Products fetched from API', productsData);
        
        // Transform data if needed to match our expected format
        const formattedProducts = productsData.map(product => ({
          id: product.id || product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          image: product.image || 'https://via.placeholder.com/150',
          category: product.category || 'uncategorized',
          stock: product.stock || 10,
          rating: product.rating || 4
        }));
        
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(formattedProducts.map(product => product.category))];
        setCategories(uniqueCategories);
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
        
        // Fallback to dummy data if API fails
        logDebug('Using fallback dummy data', dummyProducts);
        setProducts(dummyProducts);
        setFilteredProducts(dummyProducts);
        
        // Extract unique categories from dummy data
        const uniqueCategories = [...new Set(dummyProducts.map(product => product.category))];
        setCategories(uniqueCategories);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
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

  // Show toast notification
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  // Close modal with escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (selectedProduct) setSelectedProduct(null);
        if (showCheckout) setShowCheckout(false);
        if (showCart) setShowCart(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedProduct, showCheckout, showCart]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedProduct || showCheckout || showCart) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct, showCheckout, showCart]);

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

  // Calculate cart totals
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Add to cart with enhanced feedback
  const addToCart = useCallback((product, quantity = 1) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Remove artificial delay - instant response
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        const updatedCart = prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        showToast(`تم تحديث كمية ${product.name} في السلة`, 'success');
        return updatedCart;
      } else {
        showToast(`تم إضافة ${product.name} للسلة بنجاح`, 'success');
        return [...prevCart, { ...product, quantity }];
      }
    });
    setIsProcessing(false);
  }, [isProcessing, showToast]);

  // Remove from cart
  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.id === productId);
      if (item) {
        showToast(`تم حذف ${item.name} من السلة`, 'info');
      }
      return prevCart.filter(item => item.id !== productId);
    });
  }, [showToast]);

  // Update cart quantity
  const updateCartQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  // Toggle wishlist
  const toggleWishlist = useCallback((product) => {
    setWishlist(prevWishlist => {
      const isInWishlist = prevWishlist.some(item => item.id === product.id);
      if (isInWishlist) {
        showToast(`تم حذف ${product.name} من المفضلة`, 'info');
        return prevWishlist.filter(item => item.id !== product.id);
      } else {
        showToast(`تم إضافة ${product.name} للمفضلة`, 'success');
        return [...prevWishlist, product];
      }
    });
  }, [showToast]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  // Handle checkout form input changes
  const handleCheckoutInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  // Validate checkout form
  const validateCheckoutForm = () => {
    const errors = {};
    
    if (!checkoutFormData.name.trim()) {
      errors.name = 'الاسم الكامل مطلوب';
    }
    
    if (!checkoutFormData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutFormData.email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    if (!checkoutFormData.phone.trim()) {
      errors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^(\+?[0-9]{1,4}[-\s]?)?[0-9]{9,10}$/.test(checkoutFormData.phone.replace(/\s/g, ''))) {
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
    
    addToCart(product);
    // Instant cart display
    setShowCart(true);
  }, [addToCart, isProcessing]);

  // Enhanced Order Success Modal
  // Update the order success modal to show debugging information
  const renderOrderSuccessModal = () => {
    if (!orderSuccess || !orderData) return null;
    
    return (
      <div
        className="order-success-modal-backdrop"
        onClick={() => setOrderSuccess(false)}
      >
        <div
          className="order-success-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="order-success-header">
            <div className="order-success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>تم تأكيد طلبك بنجاح!</h3>
            <p>{orderData.message || 'شكراً لك، سيتم التواصل معك قريباً لتأكيد التفاصيل'}</p>
            {orderData.status === 'local_test' && (
              <div className="debug-note">
                <i className="fas fa-info-circle"></i>
                <span>هذا طلب اختباري محلي (API غير متصل)</span>
              </div>
            )}
          </div>

          <div className="order-success-content">
            <div className="order-details">
              <div className="order-number">
                <strong>رقم الطلب: {orderData.orderNumber}</strong>
              </div>
              <div className="order-date">
                تاريخ الطلب: {orderData.orderDate}
              </div>
              {orderData.status && (
                <div className="order-status">
                  الحالة: {orderData.status === 'pending' ? 'قيد المعالجة' : 
                          orderData.status === 'completed' ? 'مكتمل' : 
                          orderData.status === 'local_test' ? 'اختباري' : orderData.status}
                </div>
              )}
            </div>

            <div className="customer-info">
              <h4>بيانات العميل:</h4>
              <p><strong>الاسم:</strong> {orderData.customer.name}</p>
              <p><strong>البريد الإلكتروني:</strong> {orderData.customer.email}</p>
              <p><strong>رقم الهاتف:</strong> {orderData.customer.phone}</p>
              <p><strong>العنوان:</strong> {orderData.customer.address}, {orderData.customer.city}</p>
              {orderData.customer.notes && (
                <p><strong>ملاحظات:</strong> {orderData.customer.notes}</p>
              )}
            </div>

            <div className="order-summary">
              <h4>تفاصيل الطلب:</h4>
              {orderData.items.map(item => (
                <div key={item.id} className="order-item">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{item.price * item.quantity} درهم</span>
                </div>
              ))}
              <div className="order-total">
                <strong>المجموع الكلي: {orderData.total} درهم</strong>
              </div>
            </div>

            <div className="next-steps">
              <h4>الخطوات التالية:</h4>
              <ul>
                <li>
                  <i className="fas fa-phone"></i>
                  سيتم التواصل معك خلال 24 ساعة لتأكيد الطلب
                </li>
                <li>
                  <i className="fas fa-truck"></i>
                  التوصيل خلال 2-5 أيام عمل
                </li>
                <li>
                  <i className="fas fa-credit-card"></i>
                  الدفع عند الاستلام أو تحويل بنكي
                </li>
                <li>
                  <i className="fas fa-envelope"></i>
                  ستصلك رسالة تأكيد على البريد الإلكتروني
                </li>
              </ul>
            </div>

            {/* Add debug information in development mode */}
            {process.env.NODE_ENV === 'development' && (
              <div className="debug-info">
                <details>
                  <summary>معلومات التصحيح (للمطورين فقط)</summary>
                  <pre>{JSON.stringify(orderData, null, 2)}</pre>
                </details>
              </div>
            )}

            <div className="success-actions">
              <button
                className="continue-shopping-btn"
                onClick={() => {
                  setOrderSuccess(false);
                  setOrderData(null);
                }}
              >
                <i className="fas fa-shopping-bag"></i>
                متابعة التسوق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    logDebug('Category changed to', category);
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
        
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => handleCategoryChange(category)}
          >
            {getCategoryDisplayName(category)}
          </button>
        ))}
      </div>
    );
  };
  
  // Helper function to get category display name
  const getCategoryDisplayName = (categoryId) => {
    // Map of category IDs to display names
    const categoryNames = {
      'tools': 'أدوات',
      'materials': 'مواد البناء',
      'paint': 'دهانات',
      'hardware': 'أجهزة',
      'electrical': 'كهربائيات',
      'uncategorized': 'غير مصنف'
    };
    
    return categoryNames[categoryId] || categoryId;
  };

  if (isLoading) {
    return (
      <div className="products-page">
        <div className="products-loading">
          <div className="loading-spinner"></div>
          <h3>جاري تحميل المنتجات...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />

      {/* Header Section */}
      <section className="products-header">
        <div className="container">
          <div className="header-content">
            <div className="header-text">
              <h1>منتجاتنا</h1>
              <p>اكتشف مجموعتنا الواسعة من المنتجات عالية الجودة</p>
            </div>
            <div className="header-actions">
              <button
                className="cart-button"
                onClick={() => setShowCart(true)}
                title="عرض السلة"
              >
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Controls Section */}
      <div className="container">
        <div className="products-controls">
          <div className="controls-content">
            <div className="search-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="ابحث عن المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="fas fa-search"></i>
              </div>
              
              <button
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-filter"></i>
                فلاتر
              </button>
            </div>

            <div className="view-controls">
              <div className="view-mode-toggle">
                <button
                  className={viewMode === 'grid' ? 'active' : ''}
                  onClick={() => setViewMode('grid')}
                  title="عرض شبكي"
                >
                  <i className="fas fa-th"></i>
                </button>
                <button
                  className={viewMode === 'list' ? 'active' : ''}
                  onClick={() => setViewMode('list')}
                  title="عرض قائمة"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="rating">التقييم</option>
              </select>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="filters-panel">
                <div className="filters-content">
                  <div className="filter-group">
                    <h3>الفئات</h3>
                    {renderCategoryFilters()}
                  </div>

                  <div className="filter-group">
                    <h3>نطاق السعر</h3>
                    <div className="price-range">
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      />
                      <div className="price-labels">
                        <span>{priceRange[0]} درهم</span>
                        <span>{priceRange[1]} درهم</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Products Section */}
      <div className="products-section">
        <div className="container">
          <div className="products-header-info">
            <span className="results-count">
              {filteredProducts.length} منتج
              {selectedCategory !== 'all' && (
                <span className="category-filter-info">
                  في فئة {categories.find(cat => cat.id === selectedCategory)?.name}
                </span>
              )}
            </span>
          </div>

          <div className={`products-container ${viewMode}`}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className={`product-card ${viewMode}`}
                onClick={() => setSelectedProduct(product)}
                style={{ cursor: 'pointer' }}
              >
                  <div className="product-image">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      loading="lazy"
                    />
                    {product.discount > 0 && (
                      <div className="discount-badge">
                        -{product.discount}%
                      </div>
                    )}
                    <div className="product-actions">
                      <button
                        className="action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                        }}
                        title="عرض التفاصيل"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className={`action-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        title={isInWishlist(product.id) ? 'حذف من المفضلة' : 'أضف للمفضلة'}
                      >
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>

                  <div className="product-info">
                    <div className="product-brand">{product.brand}</div>
                    <h3 className="product-name">{product.name}</h3>
                    
                    <div className="product-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star ${i < Math.floor(product.rating) ? 'filled' : ''}`}
                          ></i>
                        ))}
                      </div>
                      <span className="rating-text">({product.reviews})</span>
                    </div>

                    <div className="product-price">
                      <span className="current-price">{product.price} درهم</span>
                      {product.originalPrice > product.price && (
                        <span className="original-price">{product.originalPrice} درهم</span>
                      )}
                    </div>

                    <div className="product-stock">
                      {product.inStock ? (
                        <span className="in-stock">متوفر ({product.stock})</span>
                      ) : (
                        <span className="out-of-stock">غير متوفر</span>
                      )}
                    </div>

                    <div className="product-actions-bottom">
                      <button
                        className="add-to-cart-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={!product.inStock || isProcessing}
                      >
                        <i className="fas fa-shopping-bag"></i>
                        <span>{isProcessing ? 'جاري الإضافة...' : 'أضف للسلة'}</span>
                      </button>
                      <button
                        className="quick-buy-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickBuy(product);
                        }}
                        disabled={!product.inStock || isProcessing}
                      >
                        <i className="fas fa-bolt"></i>
                        <span>شراء سريع</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <i className="fas fa-search"></i>
              <h3>لا توجد منتجات</h3>
              <p>لم نجد منتجات تطابق معايير البحث الخاصة بك</p>
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceRange([0, 1000]);
                }}
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <>
          <div
            className="cart-overlay"
            onClick={() => setShowCart(false)}
          />
          <div className="cart-sidebar">
              <div className="cart-header">
                <h3>سلة التسوق ({cartCount})</h3>
                <button onClick={() => setShowCart(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <i className="fas fa-shopping-cart"></i>
                    <p>سلة التسوق فارغة</p>
                    <button 
                      className="continue-shopping"
                      onClick={() => setShowCart(false)}
                    >
                      تصفح المنتجات
                    </button>
                  </div>
                ) : (
                  cart.map(item => (
                    <div 
                      key={item.id} 
                      className="cart-item"
                    >
                        <img src={item.image} alt={item.name} />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>{item.price} درهم</p>
                        </div>
                        <div className="quantity-controls">
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
                        <button
                          className="remove-item"
                          onClick={() => removeFromCart(item.id)}
                          title="حذف من السلة"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="cart-footer">
                  <div className="cart-total">
                    <strong>المجموع: {cartTotal} درهم</strong>
                  </div>
                  <button
                    className="checkout-btn"
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                  >
                    إتمام الشراء
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      {/* Enhanced Product Details Modal */}
      {selectedProduct && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="product-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
              <button
                className="modal-close-btn"
                onClick={() => setSelectedProduct(null)}
                title="إغلاق"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="modal-content-wrapper">
                <div className="modal-image-section">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    loading="lazy"
                  />
                  {selectedProduct.discount > 0 && (
                    <div className="modal-discount-badge">
                      -{selectedProduct.discount}%
                    </div>
                  )}
                </div>

                <div className="modal-details-section">
                  <div className="product-header">
                    <div className="product-brand-tag">{selectedProduct.brand}</div>
                    <h2 className="product-title">{selectedProduct.name}</h2>
                    
                    <div className="product-rating-detailed">
                      <div className="stars-container">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star ${i < Math.floor(selectedProduct.rating) ? 'filled' : ''}`}
                          ></i>
                        ))}
                      </div>
                      <span className="rating-details">
                        {selectedProduct.rating} من 5 ({selectedProduct.reviews} تقييم)
                      </span>
                    </div>
                  </div>

                  <div className="product-description-section">
                    <p className="product-description-text">{selectedProduct.description}</p>
                  </div>

                  <div className="product-specifications">
                    <h4>المواصفات:</h4>
                    <div className="specs-grid">
                      <div className="spec-item">
                        <span className="spec-label">الوزن:</span>
                        <span className="spec-value">{selectedProduct.weight}</span>
                      </div>
                      <div className="spec-item">
                        <span className="spec-label">الأبعاد:</span>
                        <span className="spec-value">{selectedProduct.dimensions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="product-features-section">
                    <h4>المميزات الرئيسية:</h4>
                    <ul className="features-list">
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index} className="feature-item">
                          <i className="fas fa-check-circle"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="product-pricing-section">
                    <div className="price-container">
                      <span className="current-price-large">{selectedProduct.price} درهم</span>
                      {selectedProduct.originalPrice > selectedProduct.price && (
                        <span className="original-price-large">{selectedProduct.originalPrice} درهم</span>
                      )}
                    </div>
                    
                    <div className="stock-info">
                      {selectedProduct.inStock ? (
                        <span className="stock-available">
                          <i className="fas fa-check-circle"></i>
                          متوفر في المخزن ({selectedProduct.stock} قطعة)
                        </span>
                      ) : (
                        <span className="stock-unavailable">
                          <i className="fas fa-times-circle"></i>
                          غير متوفر حالياً
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="modal-actions-section">
                    <button
                      className="primary-action-btn"
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={!selectedProduct.inStock || isProcessing}
                    >
                      <i className="fas fa-shopping-bag"></i>
                      <span>{isProcessing ? 'جاري الإضافة...' : 'أضف للسلة'}</span>
                    </button>
                    
                    <button
                      className="secondary-action-btn"
                      onClick={() => {
                        handleQuickBuy(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={!selectedProduct.inStock || isProcessing}
                    >
                      <i className="fas fa-bolt"></i>
                      <span>شراء سريع</span>
                    </button>
                    
                    <button
                      className={`wishlist-action-btn ${isInWishlist(selectedProduct.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(selectedProduct)}
                    >
                      <i className="fas fa-heart"></i>
                      <span>{isInWishlist(selectedProduct.id) ? 'في المفضلة' : 'أضف للمفضلة'}</span>
                    </button>
                  </div>

                  <div className="shipping-benefits">
                    <div className="benefit-item">
                      <i className="fas fa-truck"></i>
                      <span>توصيل مجاني للطلبات فوق 200 درهم</span>
                    </div>
                    <div className="benefit-item">
                      <i className="fas fa-shield-alt"></i>
                      <span>ضمان الجودة والاستبدال</span>
                    </div>
                    <div className="benefit-item">
                      <i className="fas fa-undo"></i>
                      <span>إمكانية الإرجاع خلال 30 يوم</span>
                    </div>
                    <div className="benefit-item">
                      <i className="fas fa-headset"></i>
                      <span>دعم فني على مدار الساعة</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Enhanced Checkout Modal */}
      {showCheckout && (
        <div
          className="checkout-modal-backdrop"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="checkout-modal"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="checkout-header">
                <h3>إتمام الشراء</h3>
                <button 
                  onClick={() => setShowCheckout(false)}
                  title="إغلاق"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="checkout-content">
                <div className="order-summary">
                  <h4>ملخص الطلب</h4>
                  {cart.map(item => (
                    <div key={item.id} className="order-item">
                      <span>{item.name} × {item.quantity}</span>
                      <span>{item.price * item.quantity} درهم</span>
                    </div>
                  ))}
                  <div className="order-total">
                    <strong>المجموع: {cartTotal} درهم</strong>
                  </div>
                </div>

                <form className="checkout-form" onSubmit={handleCheckoutSubmit}>
                  <div className={`form-group ${formErrors.name ? 'has-error' : ''}`}>
                    <label>الاسم الكامل *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={checkoutFormData.name}
                      onChange={handleCheckoutInputChange}
                      placeholder="أدخل اسمك الكامل" 
                    />
                    {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                  </div>
                  <div className={`form-group ${formErrors.email ? 'has-error' : ''}`}>
                    <label>البريد الإلكتروني *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={checkoutFormData.email}
                      onChange={handleCheckoutInputChange}
                      placeholder="مثال: example@example.com" 
                    />
                    {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                  </div>
                  <div className={`form-group ${formErrors.phone ? 'has-error' : ''}`}>
                    <label>رقم الهاتف *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={checkoutFormData.phone}
                      onChange={handleCheckoutInputChange}
                      placeholder="05xxxxxxxx" 
                    />
                    {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                  </div>
                  <div className={`form-group ${formErrors.address ? 'has-error' : ''}`}>
                    <label>العنوان *</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={checkoutFormData.address}
                      onChange={handleCheckoutInputChange}
                      placeholder="أدخل عنوانك بالتفصيل" 
                    />
                    {formErrors.address && <div className="error-message">{formErrors.address}</div>}
                  </div>
                  <div className={`form-group ${formErrors.city ? 'has-error' : ''}`}>
                    <label>المدينة *</label>
                    <input 
                      type="text" 
                      name="city" 
                      value={checkoutFormData.city}
                      onChange={handleCheckoutInputChange}
                      placeholder="أدخل اسم المدينة" 
                    />
                    {formErrors.city && <div className="error-message">{formErrors.city}</div>}
                  </div>
                  <div className="form-group">
                    <label>ملاحظات إضافية</label>
                    <textarea 
                      name="notes" 
                      value={checkoutFormData.notes}
                      onChange={handleCheckoutInputChange}
                      placeholder="يمكنك إضافة ملاحظات إضافية عن الطلب"
                    ></textarea>
                  </div>
                  
                  {currentUser && (
                    <div className="user-info-note">
                      <i className="fas fa-info-circle"></i>
                      <span>تم استخدام بياناتك المسجلة. يمكنك تعديلها إذا أردت.</span>
                    </div>
                  )}
                  
                  <div className="checkout-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowCheckout(false)}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="place-order-btn"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          جاري المعالجة...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check"></i>
                          تأكيد الطلب
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      {/* Use the new renderOrderSuccessModal function */}
      {renderOrderSuccessModal()}
    </div>
  );
};

export default ProductsPage; 