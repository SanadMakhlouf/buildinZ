import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import debounce from 'lodash/debounce';
import './ProductsPage.css';
import productService from '../../services/productService';
import axios from 'axios';

// Define a base64 encoded placeholder image to avoid external requests
const PLACEHOLDER_IMAGE_SMALL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjOTk5OTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
const PLACEHOLDER_IMAGE_LARGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjRweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjOTk5OTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { productId } = useParams();
  
  // State management
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Product detail state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [productError, setProductError] = useState(null);
  
  // Additional states for product detail
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Initialize filters from URL params
  const [filters, setFilters] = useState({
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 15,
    sort: searchParams.get('sort') || 'newest',
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || ''
  });

  // Cart state
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Load cart and wishlist from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('buildingz_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
      }
    }
    
    const savedWishlist = localStorage.getItem('buildingz_wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Error parsing wishlist from localStorage:', e);
      }
    }
  }, []);

  // Fetch products with current filters
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await productService.getProducts(filters);
      
      if (response.data && response.data.products) {
        setProducts(response.data.products);
        setTotalProducts(response.data.total || response.data.products.length);
      } else if (Array.isArray(response.data)) {
        setProducts(response.data);
        setTotalProducts(response.data.length);
      }
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      showToast('حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى لاحقًا.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Fetch a single product by ID
  const fetchProductById = useCallback(async (id) => {
    if (!id) return;
    
    try {
      setIsProductLoading(true);
      setProductError(null);
      
      const response = await productService.getProductById(id);
      
      if (response.data && response.data.success) {
        // Extract product from the nested structure
        const productData = response.data.data.product;
        setSelectedProduct(productData);
        // Reset states when loading a new product
        setActiveImageIndex(0);
        setQuantity(1);
        setActiveTab('description');
      } else {
        setProductError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setProductError('Failed to load product details. Please try again later.');
      showToast('حدث خطأ أثناء تحميل تفاصيل المنتج. يرجى المحاولة مرة أخرى لاحقًا.', 'error');
    } finally {
      setIsProductLoading(false);
    }
  }, []);

  // Fetch categories directly from the API
  const fetchCategories = useCallback(async () => {
    try {
      setIsCategoriesLoading(true);
      const API_BASE_URL = process.env.REACT_APP_BACKEND_API || 'http://localhost:8000/api';
      const response = await axios.get(`${API_BASE_URL}/categories`);
      
      if (response.data && response.data.data) {
        setCategories(response.data.data);
      } else if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setIsCategoriesLoading(false);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    // If we have a productId, fetch that specific product
    if (productId) {
      fetchProductById(productId);
    } else {
      // Otherwise fetch the product list
      fetchProducts();
      fetchCategories();
    }
  }, [productId, fetchProductById, fetchProducts, fetchCategories]);

  // Update URL when filters change
  useEffect(() => {
    // Only update search params if we're on the products listing page
    if (!productId) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all' && key !== 'limit') {
          params.set(key, value);
        }
      });
      setSearchParams(params);
    }
  }, [filters, setSearchParams, productId]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }));
      }, 500),
    []
  );

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    if (name === 'page' && (value < 1 || value > totalPages)) {
      return;
    }
    
    const updatedFilters = { 
      ...filters, 
      [name]: value,
      // Reset to page 1 when changing other filters
      page: name !== 'page' ? 1 : value
    };
    
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    
    setSearchParams(params);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    handleFilterChange('category', categoryId);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    handleFilterChange('sort', e.target.value);
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    handleFilterChange('page', page);
  };

  // Filter handlers
  const handleSearchChange = (e) => {
    const { value } = e.target;
    debouncedSearch(value);
  };

  // Reset all filters
  const resetFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 15,
      sort: 'newest',
      category: '',
      search: '',
      price_min: '',
      price_max: ''
    };
    
    setFilters(defaultFilters);
    setSearchParams(new URLSearchParams());
  };

  // Add to cart function
  const handleAddToCart = (product, quantity = 1, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!product || quantity <= 0) return;
    
    const existingItem = cart.find(item => item.id === product.id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('buildingz_cart', JSON.stringify(updatedCart));
    
    showToast(`${product.name} تمت الإضافة إلى السلة (الكمية: ${quantity})`, 'success');
  };

  // Toggle wishlist item
  const toggleWishlist = (productId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    let updatedWishlist;
    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(id => id !== productId);
      showToast('تمت إزالة من المفضلة');
    } else {
      updatedWishlist = [...wishlist, productId];
      showToast('تمت الإضافة إلى المفضلة');
    }
    
    setWishlist(updatedWishlist);
    localStorage.setItem('buildingz_wishlist', JSON.stringify(updatedWishlist));
  };

  // Arabic text translations
  const translations = {
    products: "المنتجات",
    search: "بحث",
    filters: "الفلاتر",
    categories: "الفئات",
    allCategories: "جميع الفئات",
    price: "السعر",
    sort: "ترتيب",
    sortOptions: {
      newest: "الأحدث",
      priceAsc: "السعر: من الأقل إلى الأعلى",
      priceDesc: "السعر: من الأعلى إلى الأقل",
      nameAsc: "الاسم: أ-ي",
      nameDesc: "الاسم: ي-أ"
    },
    inStock: "متوفر",
    outOfStock: "غير متوفر",
    addToCart: "أضف إلى السلة",
    addedToCart: "تمت الإضافة إلى السلة",
    viewCart: "عرض السلة",
    description: "الوصف",
    specifications: "المواصفات",
    reviews: "التقييمات",
    noReviews: "لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!",
    relatedProducts: "منتجات ذات صلة",
    noRelatedProducts: "لا توجد منتجات ذات صلة في الوقت الحالي.",
    soldBy: "يباع بواسطة",
    sku: "رمز المنتج",
    quantity: "الكمية",
    freeShipping: "شحن مجاني",
    freeShippingDesc: "على الطلبات التي تزيد عن 500 ريال",
    easyReturns: "إرجاع سهل",
    easyReturnsDesc: "سياسة إرجاع لمدة 30 يوم",
    secureCheckout: "دفع آمن",
    secureCheckoutDesc: "تشفير SSL",
    limitedStock: "كمية محدودة",
    featured: "مميز",
    backToProducts: "العودة إلى المنتجات",
    loading: "جاري التحميل...",
    error: "حدث خطأ",
    productNotFound: "المنتج غير موجود",
    tryAgain: "حاول مرة أخرى",
    onlyLeft: "فقط {count} متبقية",
    noProductsFound: "لم يتم العثور على منتجات",
    noProductsDesc: "حاول تغيير معايير البحث أو الفلاتر",
    currency: "ريال",
    resetFilters: "إعادة ضبط الفلاتر",
    dimensions: "الأبعاد"
  };

  // Handle price range change
  const handlePriceChange = (e) => {
    const value = e.target.value;
    handleFilterChange('price_max', value);
  };

  // Format price with Arabic numerals
  const formatPrice = (price) => {
    if (!price) return "0 ريال";
    
    // Convert to Arabic numerals
    const arabicPrice = price.toString().replace(/\d/g, d => {
      return ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'][d];
    });
    
    return `${arabicPrice} ريال`;
  };
  
  // Handle back button click
  const handleBackToProducts = () => {
    navigate('/products');
  };

  // Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalProducts / filters.limit);
  const paginationRange = useMemo(() => {
    const range = [];
    const maxButtons = 5;
    let start = Math.max(1, filters.page - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }, [filters.page, totalPages, filters.limit, totalProducts]);

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Handle image gallery
  const handleImageClick = (index) => {
    setActiveImageIndex(index);
  };
  
  // Handle quantity selector
  const increaseQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (selectedProduct && !isNaN(value) && value >= 1 && value <= selectedProduct.stock_quantity) {
      setQuantity(value);
    }
  };
  
  // Handle tabs
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
  
  // Add to cart with quantity
  const handleAddToCartWithQuantity = () => {
    if (selectedProduct) {
      handleAddToCart(selectedProduct, quantity);
    }
  };

  // Render product detail view
  const renderProductDetail = () => {
    if (isProductLoading) {
      return (
        <div className="product-detail-loading">
          <div className="spinner"></div>
          <p>{translations.loading}</p>
        </div>
      );
    }

    if (productError) {
      return (
        <div className="product-detail-error">
          <i className="fas fa-exclamation-circle"></i>
          <h2>{translations.error}</h2>
          <p>{productError}</p>
          <button onClick={handleBackToProducts}>{translations.backToProducts}</button>
        </div>
      );
    }

    if (!selectedProduct) {
      return (
        <div className="product-detail-error">
          <i className="fas fa-exclamation-circle"></i>
          <h2>{translations.productNotFound}</h2>
          <p>{translations.productNotFound}</p>
          <button onClick={handleBackToProducts}>{translations.backToProducts}</button>
        </div>
      );
    }

    // Determine if product is in wishlist
    const isInWishlist = wishlist.includes(selectedProduct.id);
    
    // Calculate rating if available
    const reviews = selectedProduct.reviews || [];
    const hasReviews = reviews.length > 0;
    const averageRating = hasReviews 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    
    // Set up image gallery
    const imageUrls = selectedProduct.image_urls || 
      (selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : []);
    
    // Related products would be fetched here in a real implementation
    const relatedProducts = [];

    return (
      <div className="product-detail-container">
        {/* Back button */}
        <button className="back-to-products" onClick={handleBackToProducts}>
          <i className="fas fa-arrow-left rtl-flip"></i>
          {translations.backToProducts}
        </button>
        
        {/* Breadcrumb Navigation */}
        <div className="product-breadcrumbs">
          <span onClick={() => navigate('/products')}>{translations.products}</span>
          {selectedProduct.category && (
            <>
              <i className="fas fa-chevron-left breadcrumb-separator"></i>
              <span onClick={() => navigate(`/products?category=${selectedProduct.category.id}`)}>
                {selectedProduct.category.name}
              </span>
            </>
          )}
          <i className="fas fa-chevron-left breadcrumb-separator"></i>
          <span className="current">{selectedProduct.name}</span>
        </div>
        
        <div className="product-detail-content">
          {/* Product Images Gallery */}
          <div className="product-detail-images">
            <div className="product-detail-main-image">
              <img 
                src={imageUrls[activeImageIndex] || PLACEHOLDER_IMAGE_LARGE} 
                alt={selectedProduct.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER_IMAGE_LARGE;
                }}
              />
              {selectedProduct.is_featured && (
                <div className="product-badge featured">{translations.featured}</div>
              )}
              {selectedProduct.stock_quantity <= 5 && selectedProduct.stock_quantity > 0 && (
                <div className="product-badge limited">{translations.limitedStock}</div>
              )}
            </div>
            
            {imageUrls.length > 1 && (
              <div className="product-detail-thumbnails">
                {imageUrls.map((image, index) => (
                  <div 
                    key={index} 
                    className={`product-thumbnail ${activeImageIndex === index ? 'active' : ''}`}
                    onClick={() => handleImageClick(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${selectedProduct.name} - Image ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = PLACEHOLDER_IMAGE_SMALL;
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Information */}
          <div className="product-detail-info">
            <div className="product-detail-header">
              {selectedProduct.category && (
                <div className="product-detail-category">
                  {selectedProduct.category.name}
                </div>
              )}
              
              <h1 className="product-detail-title">{selectedProduct.name}</h1>
              
              <div className="product-detail-meta">
                {selectedProduct.sku && (
                  <div className="product-detail-sku">
                    <span className="meta-label">{translations.sku}:</span>
                    <span className="meta-value">{selectedProduct.sku}</span>
                  </div>
                )}
                
                {hasReviews && (
                  <div className="product-detail-rating">
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i 
                          key={star}
                          className={`${star <= Math.round(averageRating) ? 'fas' : 'far'} fa-star`}
                        ></i>
                      ))}
                    </div>
                    <span className="rating-count">
                      ({reviews.length})
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="product-detail-price-section">
              <div className="product-detail-price">
                <span className="product-detail-current-price">
                  {formatPrice(selectedProduct.price)}
                </span>
                {selectedProduct.original_price && (
                  <span className="product-detail-original-price">
                    {formatPrice(selectedProduct.original_price)}
                  </span>
                )}
              </div>
              
              <div className="product-detail-stock">
                {selectedProduct.stock_quantity > 0 ? (
                  <span className="in-stock">
                    <i className="fas fa-check-circle"></i> {translations.inStock}
                    {selectedProduct.stock_quantity <= 10 && (
                      <span className="stock-count"> ({translations.onlyLeft.replace('{count}', selectedProduct.stock_quantity)})</span>
                    )}
                  </span>
                ) : (
                  <span className="out-of-stock">
                    <i className="fas fa-times-circle"></i> {translations.outOfStock}
                  </span>
                )}
              </div>
            </div>
            
            {selectedProduct.description && (
              <div className="product-detail-description">
                <h3>{translations.description}</h3>
                <p>{selectedProduct.description}</p>
              </div>
            )}
            
            {/* Vendor Information */}
            {selectedProduct.vendor_profile && (
              <div className="product-detail-vendor-section">
                <h3>{translations.soldBy}</h3>
                <div className="vendor-info">
                  <div className="vendor-name">
                    <i className="fas fa-store"></i>
                    {selectedProduct.vendor_profile.business_name}
                    {selectedProduct.vendor_profile.is_verified && (
                      <i className="fas fa-check-circle verified-icon"></i>
                    )}
                  </div>
                  {selectedProduct.vendor_profile.business_description && (
                    <p className="vendor-description">
                      {selectedProduct.vendor_profile.business_description}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Specifications */}
            {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
              <div className="product-detail-specs">
                <h3>{translations.specifications}</h3>
                <div className="specs-list">
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <span className="spec-name">{key}</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Dimensions */}
            {selectedProduct.dimensions && (
              <div className="product-detail-dimensions">
                <h3>{translations.dimensions}</h3>
                <div className="dimensions-list">
                  {Object.entries(selectedProduct.dimensions).map(([key, value]) => (
                    <div key={key} className="dimension-item">
                      <span className="dimension-name">{key}</span>
                      <span className="dimension-value">{value} سم</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity Selector and Add to Cart */}
            <div className="product-detail-purchase">
              <div className="quantity-selector">
                <button 
                  className="quantity-btn minus" 
                  onClick={decreaseQuantity}
                  disabled={!selectedProduct.stock_quantity || selectedProduct.stock_quantity <= 0 || quantity <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedProduct.stock_quantity || 1} 
                  value={quantity}
                  onChange={handleQuantityChange}
                  disabled={!selectedProduct.stock_quantity || selectedProduct.stock_quantity <= 0}
                />
                <button 
                  className="quantity-btn plus"
                  onClick={increaseQuantity}
                  disabled={!selectedProduct.stock_quantity || selectedProduct.stock_quantity <= 0 || quantity >= selectedProduct.stock_quantity}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              
              <div className="product-detail-actions">
                <button 
                  className="product-detail-add-to-cart" 
                  onClick={handleAddToCartWithQuantity}
                  disabled={!selectedProduct.stock_quantity || selectedProduct.stock_quantity <= 0}
                >
                  <i className="fas fa-shopping-cart"></i> 
                  {selectedProduct.stock_quantity > 0 ? translations.addToCart : translations.outOfStock}
                </button>
                
                <button 
                  className={`product-detail-wishlist ${isInWishlist ? 'active' : ''}`}
                  onClick={() => toggleWishlist(selectedProduct.id)}
                >
                  <i className={isInWishlist ? 'fas fa-heart' : 'far fa-heart'}></i>
                </button>
              </div>
            </div>
            
            {/* Shipping and Returns */}
            <div className="product-detail-shipping-info">
              <div className="shipping-item">
                <i className="fas fa-truck"></i>
                <div className="shipping-text">
                  <h4>{translations.freeShipping}</h4>
                  <p>{translations.freeShippingDesc}</p>
                </div>
              </div>
              <div className="shipping-item">
                <i className="fas fa-undo"></i>
                <div className="shipping-text">
                  <h4>{translations.easyReturns}</h4>
                  <p>{translations.easyReturnsDesc}</p>
                </div>
              </div>
              <div className="shipping-item">
                <i className="fas fa-shield-alt"></i>
                <div className="shipping-text">
                  <h4>{translations.secureCheckout}</h4>
                  <p>{translations.secureCheckoutDesc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs - Description, Specifications, Reviews */}
        <div className="product-detail-tabs">
          <div className="tabs-header">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => handleTabClick('description')}
            >
              {translations.description}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => handleTabClick('specifications')}
            >
              {translations.specifications}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => handleTabClick('reviews')}
            >
              {translations.reviews}
            </button>
          </div>
          
          <div className={`tab-content ${activeTab === 'description' ? 'active' : ''}`}>
            {selectedProduct.description ? (
              <p>{selectedProduct.description}</p>
            ) : (
              <p>لا يوجد وصف مفصل متاح لهذا المنتج.</p>
            )}
          </div>
          
          <div className={`tab-content ${activeTab === 'specifications' ? 'active' : ''}`}>
            {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 ? (
              <div className="specs-list">
                {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-name">{key}</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>لا توجد مواصفات متاحة لهذا المنتج.</p>
            )}
          </div>
          
          <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`}>
            {hasReviews ? (
              <div className="reviews-list">
                {reviews.map((review, index) => (
                  <div key={index} className="review-item">
                    <div className="review-header">
                      <div className="review-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i 
                            key={star}
                            className={`${star <= review.rating ? 'fas' : 'far'} fa-star`}
                          ></i>
                        ))}
                      </div>
                      <div className="review-author">{review.user?.name || 'مجهول'}</div>
                      <div className="review-date">
                        {new Date(review.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                    <p className="review-content">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>{translations.noReviews}</p>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        <div className="related-products-section">
          <h2>{translations.relatedProducts}</h2>
          <div className="related-products">
            {relatedProducts.length > 0 ? (
              relatedProducts.map(product => (
                <div key={product.id} className="related-product-card">
                  {/* Related product content */}
                </div>
              ))
            ) : (
              <p>{translations.noRelatedProducts}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render product cards
  const renderProductCard = (product) => {
    const isInWishlist = wishlist.includes(product.id);
    
    return (
      <div 
        key={product.id} 
        className="product-card"
        onClick={() => handleProductClick(product.id)}
      >
        <div className="product-image">
          <img
            src={product.primary_image_url || (product.images && product.images[0]) || PLACEHOLDER_IMAGE_SMALL}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_IMAGE_SMALL;
            }}
          />
          <button
            className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
            onClick={(e) => toggleWishlist(product.id, e)}
            aria-label={isInWishlist ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          >
            <i className={isInWishlist ? 'fas fa-heart' : 'far fa-heart'}></i>
          </button>
        </div>
        <div className="product-info">
          {product.category && (
            <div className="product-category">{product.category.name}</div>
          )}
          <h3>{product.name}</h3>
          <div className="product-price">
            <span className="current-price">{formatPrice(product.price)}</span>
          </div>
          <div className="product-actions">
            <button
              className="add-to-cart-btn"
              onClick={(e) => handleAddToCart(product, 1, e)}
              disabled={!product.stock_quantity || product.stock_quantity <= 0}
            >
              <i className="fas fa-shopping-cart"></i>
              {product.stock_quantity > 0 ? translations.addToCart : translations.outOfStock}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render main component
  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>المنتجات</h1>
          <div className="search-container">
            <input
              type="text"
              placeholder="بحث..."
              value={filters.search}
              onChange={handleSearchChange}
            />
            <i className="fas fa-search"></i>
          </div>
        </div>
        
        {productId ? (
          renderProductDetail()
        ) : (
          <div className="products-content">
            {/* Filters sidebar */}
            <div className={`products-sidebar ${showFilters ? 'show' : ''}`}>
              <div className="filter-header">
                <h3>{translations.filters}</h3>
                <button className="close-filters" onClick={() => setShowFilters(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              {/* Categories filter */}
              <div className="filter-section">
                <h4>{translations.categories}</h4>
                <div className="category-filters">
                  <div className="category-item">
                    <input 
                      type="radio" 
                      id="all-categories" 
                      name="category" 
                      value=""
                      checked={!filters.category}
                      onChange={() => handleCategoryChange('')}
                    />
                    <label htmlFor="all-categories">{translations.allCategories}</label>
                  </div>
                  {categories.map(category => (
                    <div key={category.id} className="category-item">
                      <input 
                        type="radio" 
                        id={`category-${category.id}`}
                        name="category"
                        value={category.id}
                        checked={filters.category === category.id.toString()}
                        onChange={() => handleCategoryChange(category.id.toString())}
                      />
                      <label htmlFor={`category-${category.id}`}>{category.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price filter */}
              <div className="filter-section">
                <h4>{translations.price}</h4>
                <div className="price-range">
                  <input 
                    type="range" 
                    min="0" 
                    max="10000" 
                    value={filters.price_max || 10000}
                    onChange={handlePriceChange}
                  />
                  <div className="price-range-labels">
                    <span>0 {translations.currency}</span>
                    <span>{filters.price_max || 10000} {translations.currency}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products grid */}
            <div className="products-main">
              <div className="filter-toggle-container">
                <button 
                  className="filter-toggle-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className="fas fa-filter"></i> {translations.filters}
                </button>
              </div>
              
              <div className="products-grid">
                {isLoading ? (
                  // Loading skeletons
                  Array(6).fill().map((_, index) => (
                    <div key={index} className="product-card skeleton">
                      <div className="product-image skeleton-box"></div>
                      <div className="product-info">
                        <div className="title skeleton-box"></div>
                        <div className="price skeleton-box"></div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  // Error state
                  <div className="error-state">
                    <i className="fas fa-exclamation-circle"></i>
                    <h3>{error}</h3>
                    <p>{translations.tryAgain}</p>
                    <button onClick={fetchProducts}>{translations.tryAgain}</button>
                  </div>
                ) : products.length === 0 ? (
                  // Empty state
                  <div className="empty-state">
                    <i className="fas fa-box-open"></i>
                    <h3>{translations.noProductsFound}</h3>
                    <p>{translations.noProductsDesc}</p>
                    <button onClick={resetFilters}>{translations.resetFilters}</button>
                  </div>
                ) : (
                  // Products grid
                  products.map(product => renderProductCard(product))
                )}
              </div>
              
              {/* Pagination */}
              {!isLoading && !error && products.length > 0 && totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page <= 1}
                  >
                    <i className="fas fa-chevron-right rtl-flip"></i>
                  </button>
                  
                  {paginationRange.map(page => (
                    <button 
                      key={page}
                      className={`pagination-btn ${page === filters.page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    className="pagination-btn" 
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= totalPages}
                  >
                    <i className="fas fa-chevron-left rtl-flip"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Floating cart button */}
        <button className="floating-cart-btn" onClick={() => navigate('/cart')}>
          <i className="fas fa-shopping-cart"></i>
          {cart.length > 0 && (
            <span className="cart-count">{cart.length}</span>
          )}
        </button>
        
        {/* Toast notification */}
        {toast.show && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
            <button onClick={() => setToast({ show: false, message: '', type: '' })}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage; 