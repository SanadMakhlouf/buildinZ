import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [viewMode, setViewMode] = useState('grid'); // grid or list

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
      description: 'دريل كهربائي قوي ومتين مع مجموعة من الرؤوس المتنوعة',
      features: ['قوة 800 واط', 'سرعة متغيرة', 'مقبض مريح', 'ضمان سنتين'],
      inStock: true,
      stock: 25,
      brand: 'BuildPro',
      discount: 25
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
      description: 'طقم مفاتيح كامل من الستانلس ستيل عالي الجودة',
      features: ['32 قطعة', 'ستانلس ستيل', 'حقيبة تنظيم', 'مقاومة للصدأ'],
      inStock: true,
      stock: 40,
      brand: 'ToolMaster',
      discount: 25
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
      description: 'أسمنت عالي الجودة مناسب لجميع أعمال البناء',
      features: ['كيس 50 كغم', 'جودة عالية', 'سريع التماسك', 'مقاوم للعوامل الجوية'],
      inStock: true,
      stock: 100,
      brand: 'CementPro',
      discount: 10
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
      description: 'دهان داخلي عالي الجودة بألوان متنوعة وتغطية ممتازة',
      features: ['4 لتر', 'قابل للغسيل', 'بدون رائحة', 'تغطية 40 متر مربع'],
      inStock: true,
      stock: 60,
      brand: 'ColorMax',
      discount: 26
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
      description: 'مجموعة شاملة من البراغي بأحجام وأنواع مختلفة',
      features: ['200 قطعة', 'أحجام متنوعة', 'معدن مقاوم للصدأ', 'علبة تنظيم'],
      inStock: true,
      stock: 75,
      brand: 'FastenPro',
      discount: 22
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
      description: 'منشار كهربائي دائري قوي للقطع الدقيق',
      features: ['1200 واط', 'شفرة 190mm', 'قاعدة قابلة للتعديل', 'نظام أمان متقدم'],
      inStock: true,
      stock: 15,
      brand: 'CutMaster',
      discount: 25
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
      description: 'بلاط سيراميك عالي الجودة بتصاميم عصرية',
      features: ['60x60 سم', 'مقاوم للماء', 'سهل التنظيف', 'متوفر بألوان متعددة'],
      inStock: true,
      stock: 200,
      brand: 'TilePro',
      discount: 29
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
      description: 'مولد كهرباء محمول وموثوق لجميع احتياجاتك',
      features: ['3000 واط', 'تشغيل هادئ', 'خزان 15 لتر', 'بدء كهربائي'],
      inStock: true,
      stock: 8,
      brand: 'PowerGen',
      discount: 25
    }
  ];

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  // Initialize data
  useEffect(() => {
    const timer = setTimeout(() => {
      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
      
      const uniqueCategories = [...new Set(sampleProducts.map(p => p.category))];
      setCategories(uniqueCategories.map(cat => ({
        id: cat,
        name: sampleProducts.find(p => p.category === cat)?.categoryName || cat
      })));
      
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [sampleProducts]);

  // Filter products
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

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
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchTerm, priceRange, sortBy]);

  // Cart functions
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        showToast(`تم زيادة كمية ${product.name} في السلة`, 'success');
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      showToast(`تم إضافة ${product.name} إلى السلة بنجاح!`, 'success');
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    const product = cart.find(item => item.id === productId);
    if (product) {
      showToast(`تم حذف ${product.name} من السلة`, 'info');
    }
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Wishlist functions
  const toggleWishlist = (product) => {
    setWishlist(prevWishlist => {
      const isInWishlist = prevWishlist.some(item => item.id === product.id);
      if (isInWishlist) {
        showToast(`تم حذف ${product.name} من المفضلة`, 'info');
        return prevWishlist.filter(item => item.id !== product.id);
      }
      showToast(`تم إضافة ${product.name} إلى المفضلة`, 'success');
      return [...prevWishlist, product];
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Handle checkout submission
  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const customerData = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      paymentMethod: formData.get('paymentMethod')
    };

    // Simulate order processing
    setOrderData({
      orderNumber: `BZ-${Date.now()}`,
      customer: customerData,
      items: [...cart],
      total: cartTotal,
      date: new Date().toLocaleDateString('ar-AE')
    });

    // Clear cart and show success
    setCart([]);
    setShowCheckout(false);
    setOrderSuccess(true);
    showToast('تم تأكيد طلبك بنجاح! سيتم التواصل معك قريباً', 'success');
  };

  // Calculate totals
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="products-loading">
        <div className="loading-spinner"></div>
        <p>جاري تحميل المنتجات...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="container">
          <div className="header-content">
            <div className="header-text">
              <h1>متجر BuildingZ</h1>
              <p>أفضل المنتجات لمشاريع البناء والتشييد</p>
            </div>
            <div className="header-actions">
              <button 
                className="cart-button"
                onClick={() => setShowCart(true)}
              >
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="products-controls">
        <div className="container">
          <div className="controls-content">
            <div className="search-section">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="ابحث عن المنتجات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className="fas fa-filter"></i>
                فلترة
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
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">ترتيب حسب الاسم</option>
                <option value="price-low">السعر: من الأقل للأعلى</option>
                <option value="price-high">السعر: من الأعلى للأقل</option>
                <option value="rating">التقييم</option>
              </select>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                className="filters-panel"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
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
              <motion.div
                key={product.id}
                className={`product-card ${viewMode}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: viewMode === 'grid' ? -5 : 0 }}
                onClick={() => setSelectedProduct(product)}
              >
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
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
                      disabled={!product.inStock}
                    >
                      <i className="fas fa-shopping-bag"></i>
                      <span>أضف للسلة</span>
                    </button>
                    <button
                      className="quick-buy-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                        setShowCart(true);
                      }}
                      disabled={!product.inStock}
                    >
                      <i className="fas fa-bolt"></i>
                      <span>شراء سريع</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <p>لا توجد منتجات تطابق البحث</p>
            </div>
          )}
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              className="cart-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
            />
            <motion.div
              className="cart-sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
            >
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
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>{item.price} درهم</p>
                      </div>
                      <div className="quantity-controls">
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>
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
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div
              className="product-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <button
                className="close-modal"
                onClick={() => setSelectedProduct(null)}
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="modal-content">
                <div className="modal-image">
                  <img src={selectedProduct.image} alt={selectedProduct.name} />
                  {selectedProduct.discount > 0 && (
                    <div className="discount-badge">
                      -{selectedProduct.discount}%
                    </div>
                  )}
                </div>

                <div className="modal-details">
                  <div className="product-brand">{selectedProduct.brand}</div>
                  <h2>{selectedProduct.name}</h2>
                  <p className="product-description">{selectedProduct.description}</p>

                  <div className="product-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${i < Math.floor(selectedProduct.rating) ? 'filled' : ''}`}
                        ></i>
                      ))}
                    </div>
                    <span>{selectedProduct.rating} ({selectedProduct.reviews} تقييم)</span>
                  </div>

                  <div className="product-features">
                    <h4>المميزات:</h4>
                    <ul>
                      {selectedProduct.features.map((feature, index) => (
                        <li key={index}>
                          <i className="fas fa-check"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="product-price">
                    <span className="current-price">{selectedProduct.price} درهم</span>
                    {selectedProduct.originalPrice > selectedProduct.price && (
                      <span className="original-price">{selectedProduct.originalPrice} درهم</span>
                    )}
                  </div>

                  <div className="product-actions">
                    <button
                      className="add-to-cart-btn primary"
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={!selectedProduct.inStock}
                    >
                      <i className="fas fa-shopping-bag"></i>
                      أضف للسلة
                    </button>
                    <button
                      className={`wishlist-btn ${isInWishlist(selectedProduct.id) ? 'active' : ''}`}
                      onClick={() => toggleWishlist(selectedProduct)}
                    >
                      <i className="fas fa-heart"></i>
                      {isInWishlist(selectedProduct.id) ? 'في المفضلة' : 'أضف للمفضلة'}
                    </button>
                  </div>

                  <div className="shipping-info">
                    <div className="info-item">
                      <i className="fas fa-truck"></i>
                      <span>توصيل مجاني للطلبات فوق 200 درهم</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-shield-alt"></i>
                      <span>ضمان الجودة والاستبدال</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-undo"></i>
                      <span>إمكانية الإرجاع خلال 30 يوم</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
            />
            <motion.div
              className="checkout-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="checkout-header">
                <h3>إتمام الشراء</h3>
                <button onClick={() => setShowCheckout(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="checkout-content">
                <div className="order-summary">
                  <h4>ملخص الطلب</h4>
                  {cart.map(item => (
                    <div key={item.id} className="order-item">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{item.price * item.quantity} درهم</span>
                    </div>
                  ))}
                  <div className="order-total">
                    <strong>المجموع: {cartTotal} درهم</strong>
                  </div>
                </div>

                <form className="checkout-form" onSubmit={handleCheckoutSubmit}>
                  <div className="form-group">
                    <label>الاسم الكامل</label>
                    <input type="text" name="name" required placeholder="أدخل اسمك الكامل" />
                  </div>
                  <div className="form-group">
                    <label>رقم الهاتف</label>
                    <input type="tel" name="phone" required placeholder="مثال: +971501234567" />
                  </div>
                  <div className="form-group">
                    <label>العنوان</label>
                    <textarea name="address" required placeholder="أدخل عنوانك التفصيلي"></textarea>
                  </div>
                  <div className="form-group">
                    <label>طريقة الدفع</label>
                    <select name="paymentMethod" required>
                      <option value="">اختر طريقة الدفع</option>
                      <option value="cash">الدفع عند الاستلام</option>
                      <option value="card">بطاقة ائتمان</option>
                      <option value="bank">تحويل بنكي</option>
                    </select>
                  </div>
                  <div className="checkout-actions">
                    <button type="button" onClick={() => setShowCheckout(false)} className="cancel-btn">
                      إلغاء
                    </button>
                    <button type="submit" className="place-order-btn">
                      <i className="fas fa-check"></i>
                      تأكيد الطلب
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Success Modal */}
      <AnimatePresence>
        {orderSuccess && orderData && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOrderSuccess(false)}
            />
            <motion.div
              className="success-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="success-header">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3>تم تأكيد طلبك بنجاح!</h3>
                <button onClick={() => setOrderSuccess(false)} className="close-modal">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="success-content">
                <div className="order-details">
                  <div className="order-number">
                    <strong>رقم الطلب: {orderData.orderNumber}</strong>
                  </div>
                  <div className="order-date">
                    تاريخ الطلب: {orderData.date}
                  </div>
                </div>

                <div className="customer-info">
                  <h4>بيانات العميل:</h4>
                  <p><strong>الاسم:</strong> {orderData.customer.name}</p>
                  <p><strong>الهاتف:</strong> {orderData.customer.phone}</p>
                  <p><strong>العنوان:</strong> {orderData.customer.address}</p>
                  <p><strong>طريقة الدفع:</strong> {orderData.customer.paymentMethod === 'cash' ? 'الدفع عند الاستلام' : orderData.customer.paymentMethod === 'card' ? 'بطاقة ائتمان' : 'تحويل بنكي'}</p>
                </div>

                <div className="order-items">
                  <h4>المنتجات المطلوبة:</h4>
                  {orderData.items.map(item => (
                    <div key={item.id} className="order-item">
                      <span>{item.name} x{item.quantity}</span>
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
                    <li><i className="fas fa-phone"></i> سيتم التواصل معك خلال 30 دقيقة لتأكيد الطلب</li>
                    <li><i className="fas fa-truck"></i> سيتم توصيل طلبك خلال 2-3 أيام عمل</li>
                    <li><i className="fas fa-headset"></i> يمكنك التواصل معنا على الرقم: +971501234567</li>
                  </ul>
                </div>

                <div className="success-actions">
                  <button onClick={() => setOrderSuccess(false)} className="continue-shopping-btn">
                    <i className="fas fa-shopping-bag"></i>
                    متابعة التسوق
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default ProductsPage; 