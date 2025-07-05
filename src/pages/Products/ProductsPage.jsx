import React, { useState, useEffect, useCallback } from 'react';
import './ProductsPage.css';
import orderService from '../../services/orderService';
import authService from '../../services/authService';
import productService from '../../services/productService';

// Add this function at the top of the file, outside the component
const logDebug = (message, data) => {
  console.log(`[ProductsPage] ${message}`, data);
};

const ProductsPage = () => {
  // State for products and filtering
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  // Add to cart function
  const handleAddToCart = (product) => {
    setIsAddingToCart(true);
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Update quantity if already in cart
      const updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
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
    
    setCart(updatedCart);
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
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

  // Render cart modal
  const renderCartModal = () => {
    // Cart modal implementation
    return null; // Placeholder
  };

  // Render checkout modal
  const renderCheckoutModal = () => {
    // Checkout modal implementation
    return null; // Placeholder
  };

  // Render order success modal
  const renderOrderSuccessModal = () => {
    // Order success modal implementation
    return null; // Placeholder
  };

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
                  <div className="product-card" key={product.id}>
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
                        onClick={() => handleAddToCart(product)}
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