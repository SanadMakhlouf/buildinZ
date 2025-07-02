import React, { useState, useEffect, useCallback } from 'react';
import Toast from '../../components/Toast';
import './ProductsPage.css';

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

  // Sample product data
  const sampleProducts = [
    {
      id: 1,
      name: 'دريل كهربائي احترافي',
      nameEn: 'Professional Electric Drill',
      price: 299,
      originalPrice: 399,
      category: 'tools',
      categoryName: 'أدوات',
      image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500',
      rating: 4.5,
      reviews: 128,
      description: 'دريل كهربائي قوي ومتين مع مجموعة من الرؤوس المتنوعة. مصمم للاستخدام المهني والمنزلي مع ضمان الجودة والأداء العالي.',
      features: ['قوة 800 واط', 'سرعة متغيرة', 'مقبض مريح', 'ضمان سنتين', 'مقاوم للغبار', 'إضاءة LED مدمجة'],
      inStock: true,
      stock: 25,
      brand: 'BuildPro',
      discount: 25,
      weight: '1.2 كغم',
      dimensions: '25 × 8 × 20 سم'
    },
    {
      id: 2,
      name: 'طقم مفاتيح شاملة',
      nameEn: 'Complete Wrench Set',
      price: 149,
      originalPrice: 199,
      category: 'tools',
      categoryName: 'أدوات',
      image: 'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=500',
      rating: 4.8,
      reviews: 89,
      description: 'طقم مفاتيح كامل من الستانلس ستيل عالي الجودة. يشمل جميع الأحجام المطلوبة للاستخدام المهني والمنزلي.',
      features: ['32 قطعة', 'ستانلس ستيل', 'حقيبة تنظيم', 'مقاومة للصدأ', 'مقابض مريحة', 'ضمان مدى الحياة'],
      inStock: true,
      stock: 40,
      brand: 'ToolMaster',
      discount: 25,
      weight: '2.5 كغم',
      dimensions: '35 × 25 × 5 سم'
    },
    {
      id: 3,
      name: 'مواد بناء - أسمنت',
      nameEn: 'Construction Materials - Cement',
      price: 45,
      originalPrice: 50,
      category: 'materials',
      categoryName: 'مواد البناء',
      image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=500',
      rating: 4.3,
      reviews: 234,
      description: 'أسمنت عالي الجودة مناسب لجميع أعمال البناء والإنشاءات. يوفر قوة تحمل عالية وثبات في جميع الظروف الجوية.',
      features: ['كيس 50 كغم', 'جودة عالية', 'سريع التماسك', 'مقاوم للعوامل الجوية', 'مطابق للمواصفات', 'توصيل مجاني'],
      inStock: true,
      stock: 100,
      brand: 'CementPro',
      discount: 10,
      weight: '50 كغم',
      dimensions: '60 × 40 × 15 سم'
    },
    {
      id: 4,
      name: 'دهان داخلي فاخر',
      nameEn: 'Premium Interior Paint',
      price: 89,
      originalPrice: 120,
      category: 'paint',
      categoryName: 'دهانات',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500',
      rating: 4.7,
      reviews: 156,
      description: 'دهان داخلي عالي الجودة بألوان متنوعة وتغطية ممتازة. مصنوع من مواد صديقة للبيئة وآمنة للاستخدام المنزلي.',
      features: ['4 لتر', 'قابل للغسيل', 'بدون رائحة', 'تغطية 40 متر مربع', 'سريع الجفاف', '12 لون متاح'],
      inStock: true,
      stock: 60,
      brand: 'ColorMax',
      discount: 26,
      weight: '4.2 كغم',
      dimensions: '20 × 20 × 25 سم'
    },
    {
      id: 5,
      name: 'مجموعة براغي متنوعة',
      nameEn: 'Assorted Screws Set',
      price: 35,
      originalPrice: 45,
      category: 'hardware',
      categoryName: 'أجهزة',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
      rating: 4.4,
      reviews: 92,
      description: 'مجموعة شاملة من البراغي بأحجام وأنواع مختلفة. مناسبة لجميع أعمال التركيب والصيانة المنزلية والمهنية.',
      features: ['200 قطعة', 'أحجام متنوعة', 'معدن مقاوم للصدأ', 'علبة تنظيم', 'جودة عالية', 'سهولة الاستخدام'],
      inStock: true,
      stock: 75,
      brand: 'FastenPro',
      discount: 22,
      weight: '0.8 كغم',
      dimensions: '15 × 10 × 8 سم'
    },
    {
      id: 6,
      name: 'منشار كهربائي دائري',
      nameEn: 'Circular Electric Saw',
      price: 449,
      originalPrice: 599,
      category: 'tools',
      categoryName: 'أدوات',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500',
      rating: 4.6,
      reviews: 67,
      description: 'منشار كهربائي دائري قوي للقطع الدقيق في الخشب والمعادن. مزود بنظام أمان متقدم وتحكم دقيق في السرعة.',
      features: ['1200 واط', 'شفرة 190mm', 'قاعدة قابلة للتعديل', 'نظام أمان متقدم', 'كابل 3 متر', 'حقيبة حمل'],
      inStock: true,
      stock: 15,
      brand: 'CutMaster',
      discount: 25,
      weight: '3.8 كغم',
      dimensions: '35 × 25 × 20 سم'
    },
    {
      id: 7,
      name: 'بلاط سيراميك فاخر',
      nameEn: 'Premium Ceramic Tiles',
      price: 25,
      originalPrice: 35,
      category: 'materials',
      categoryName: 'مواد البناء',
      image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=500',
      rating: 4.5,
      reviews: 203,
      description: 'بلاط سيراميك عالي الجودة بتصاميم عصرية ومتنوعة. مقاوم للماء والبقع مع سهولة في التنظيف والصيانة.',
      features: ['60x60 سم', 'مقاوم للماء', 'سهل التنظيف', 'متوفر بألوان متعددة', 'مقاوم للخدش', 'ضمان 10 سنوات'],
      inStock: true,
      stock: 200,
      brand: 'TilePro',
      discount: 29,
      weight: '1.5 كغم/قطعة',
      dimensions: '60 × 60 × 1 سم'
    },
    {
      id: 8,
      name: 'مولد كهرباء محمول',
      nameEn: 'Portable Generator',
      price: 899,
      originalPrice: 1199,
      category: 'electrical',
      categoryName: 'كهربائيات',
      image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500',
      rating: 4.8,
      reviews: 45,
      description: 'مولد كهرباء محمول وموثوق لجميع احتياجاتك. مناسب للاستخدام المنزلي والتجاري مع تشغيل هادئ وكفاءة عالية.',
      features: ['3000 واط', 'تشغيل هادئ', 'خزان 15 لتر', 'بدء كهربائي', '4 مخارج كهرباء', 'عجلات للنقل'],
      inStock: true,
      stock: 8,
      brand: 'PowerGen',
      discount: 25,
      weight: '45 كغم',
      dimensions: '60 × 45 × 50 سم'
    }
  ];

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

  // Initialize data
  useEffect(() => {
    // Remove artificial delay - load immediately
    setProducts(sampleProducts);
    setFilteredProducts(sampleProducts);
    
    const uniqueCategories = [...new Set(sampleProducts.map(p => p.category))];
    setCategories(uniqueCategories.map(cat => ({
      id: cat,
      name: sampleProducts.find(p => p.category === cat)?.categoryName || cat
    })));
    
    setIsLoading(false);
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'ar');
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, priceRange, sortBy]);

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

  // Handle checkout submission
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    
    if (isProcessing) return;
    setIsProcessing(true);

    const formData = new FormData(e.target);
    const customerData = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      city: formData.get('city'),
      notes: formData.get('notes')
    };

    // Process order immediately
    const orderNumber = `ORD-${Date.now()}`;
    const orderDate = new Date().toLocaleDateString('ar-SA');
    
    setOrderData({
      orderNumber,
      orderDate,
      customer: customerData,
      items: [...cart],
      total: cartTotal
    });

    setCart([]);
    setShowCheckout(false);
    setOrderSuccess(true);
    setIsProcessing(false);
    
    showToast('تم تأكيد طلبك بنجاح! ستصلك رسالة تأكيد قريباً', 'success');
  };

  // Quick buy function
  const handleQuickBuy = useCallback((product) => {
    if (isProcessing) return;
    
    addToCart(product);
    // Instant cart display
    setShowCart(true);
  }, [addToCart, isProcessing]);

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
                    <div className="category-filters">
                      <button
                        className={selectedCategory === 'all' ? 'active' : ''}
                        onClick={() => setSelectedCategory('all')}
                      >
                        جميع المنتجات
                      </button>
                      {categories.map(category => (
                        <button
                          key={category.id}
                          className={selectedCategory === category.id ? 'active' : ''}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
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
                  <div className="form-group">
                    <label>الاسم الكامل *</label>
                    <input type="text" name="name" required placeholder="أدخل اسمك الكامل" />
                  </div>
                  <div className="form-group">
                    <label>البريد الإلكتروني *</label>
                    <input type="email" name="email" required placeholder="مثال: example@example.com" />
                  </div>
                  <div className="form-group">
                    <label>رقم الهاتف *</label>
                    <input type="tel" name="phone" required placeholder="05xxxxxxxx" />
                  </div>
                  <div className="form-group">
                    <label>العنوان *</label>
                    <input type="text" name="address" required placeholder="أدخل عنوانك بالتفصيل" />
                  </div>
                  <div className="form-group">
                    <label>المدينة *</label>
                    <input type="text" name="city" required placeholder="أدخل اسم المدينة" />
                  </div>
                  <div className="form-group">
                    <label>ملاحظات إضافية</label>
                    <textarea name="notes" placeholder="يمكنك إضافة ملاحظات إضافية عن الطلب"></textarea>
                  </div>
                  
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

      {/* Enhanced Order Success Modal */}
      {orderSuccess && orderData && (
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
                <p>شكراً لك، سيتم التواصل معك قريباً لتأكيد التفاصيل</p>
              </div>

              <div className="order-success-content">
                <div className="order-details">
                  <div className="order-number">
                    <strong>رقم الطلب: {orderData.orderNumber}</strong>
                  </div>
                  <div className="order-date">
                    تاريخ الطلب: {orderData.orderDate}
                  </div>
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
        )}
    </div>
  );
};

export default ProductsPage; 