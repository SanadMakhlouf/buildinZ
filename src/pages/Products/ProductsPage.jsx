import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faSort, 
  faTh, 
  faList, 
  faHeart,
  faShoppingCart,
  faEye,
  faStar,
  faStarHalfAlt,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faCheck,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [rating, setRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  const filtersRef = useRef(null);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const responseData = await response.json();
      
      // Check if response has the expected structure
      if (responseData.success && responseData.data && Array.isArray(responseData.data.products)) {
        const productsArray = responseData.data.products;
        
        // Transform products to match our component's expected format
        const formattedProducts = productsArray.map(product => ({
          id: product.id,
          name: product.name,
          brand: product.vendor_profile?.business_name || 'Unknown',
          category: product.category?.name || 'Uncategorized',
          price: parseFloat(product.price),
          originalPrice: parseFloat(product.price) * 1.2, // Example markup for original price
          rating: (Math.random() * 2 + 3).toFixed(1), // Random rating between 3-5 since it's not in the API
          reviews: Math.floor(Math.random() * 100), // Random review count
          image: product.primary_image_url || (product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300x300'),
          discount: Math.floor(Math.random() * 30), // Random discount
          inStock: product.stock_quantity > 0,
          isBestSeller: Math.random() > 0.8, // Random bestseller flag
          description: product.description
        }));
        
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      } else {
        console.error('Unexpected API response format:', responseData);
        setError('Unexpected API response format');
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(product => product.brand === selectedBrand);
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Rating filter
    if (rating > 0) {
      filtered = filtered.filter(product => parseFloat(product.rating) >= rating);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'discount':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      default:
        // Recommended: best sellers first, then by rating
        filtered.sort((a, b) => {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return parseFloat(b.rating) - parseFloat(a.rating);
        });
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, sortBy, selectedCategory, selectedBrand, priceRange, rating]);

  // Get unique categories and brands
  const categories = Array.isArray(products) ? [...new Set(products.map(p => p.category))] : [];
  const brands = Array.isArray(products) ? [...new Set(products.map(p => p.brand))] : [];

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Wishlist functions
  const toggleWishlist = (productId) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Cart functions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Rating stars component
  const StarRating = ({ rating = 0, size = 'sm' }) => {
    // Ensure rating is a number and between 0-5
    const numRating = parseFloat(rating) || 0;
    const safeRating = Math.max(0, Math.min(5, numRating));
    
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    
    return (
      <div className={`star-rating ${size}`}>
        {[...Array(5)].map((_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={
              i < fullStars 
                ? faStar 
                : i === fullStars && hasHalfStar 
                  ? faStarHalfAlt 
                  : faStar
            }
            className={
              i < fullStars || (i === fullStars && hasHalfStar)
                ? 'star-filled'
                : 'star-empty'
            }
          />
        ))}
        <span className="rating-text">({safeRating.toFixed(1)})</span>
      </div>
    );
  };

  // Product card component
  const ProductCard = ({ product }) => {
    // Handle image error
    const handleImageError = (e) => {
      e.target.src = 'https://via.placeholder.com/300x300?text=صورة+غير+متوفرة';
    };
    
    return (
      <div className={`product-card ${viewMode}`}>
        <div className="product-image-container">
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-image" 
            onError={handleImageError} 
          />
          {product.isBestSeller && <span className="best-seller-badge">الأكثر مبيعاً</span>}
          {product.discount > 0 && (
            <span className="discount-badge">خصم {product.discount}%</span>
          )}
          <div className="product-actions">
            <button 
              className={`action-btn wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(product.id);
              }}
              title="إضافة للمفضلة"
            >
              <FontAwesomeIcon icon={wishlist.includes(product.id) ? faHeart : faHeartOutline} />
            </button>
            <button 
              className="action-btn view-btn" 
              title="عرض سريع"
              onClick={(e) => e.preventDefault()}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button 
              className="action-btn cart-btn"
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              title="إضافة للسلة"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
            </button>
          </div>
        </div>
        
        <div className="product-info">
          <div className="product-brand">{product.brand}</div>
          <h3 className="product-name">{product.name}</h3>
          <StarRating rating={parseFloat(product.rating)} />
          <div className="product-price">
            <span className="current-price">{product.price} درهم</span>
            {product.originalPrice > product.price && (
              <span className="original-price">{product.originalPrice} درهم</span>
            )}
          </div>
          {!product.inStock && <div className="out-of-stock">غير متوفر</div>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="products-page">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h2>فشل تحميل المنتجات</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchProducts}>
            المحاولة مرة أخرى
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div className="container">
          <h1>المنتجات</h1>
          <p>اكتشف مجموعتنا الواسعة من المنتجات عالية الجودة</p>
        </div>
      </div>

      <div className="container">
        {/* Search and Filters Bar */}
        <div className="search-filters-bar">
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="البحث عن المنتجات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filters-controls">
            <button 
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FontAwesomeIcon icon={faFilter} />
              الفلاتر
            </button>
            
            <div className="sort-container">
              <FontAwesomeIcon icon={faSort} />
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recommended">الأكثر توصية</option>
                <option value="price-low">السعر: من الأقل إلى الأعلى</option>
                <option value="price-high">السعر: من الأعلى إلى الأقل</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="newest">الأحدث</option>
                <option value="discount">أعلى خصم</option>
              </select>
            </div>
            
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <FontAwesomeIcon icon={faTh} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <FontAwesomeIcon icon={faList} />
              </button>
            </div>
          </div>
        </div>

        <div className="products-layout">
          {/* Filters Sidebar - Moved to the right side for RTL layout */}
          <div className={`filters-sidebar ${showFilters ? 'show' : ''}`} ref={filtersRef}>
            <div className="filters-header">
              <h3>الفلاتر</h3>
              <button 
                className="close-filters"
                onClick={() => setShowFilters(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="filters-content">
              {/* Category Filter */}
              <div className="filter-group">
                <h4>الفئة</h4>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="">جميع الفئات</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="filter-group">
                <h4>العلامة التجارية</h4>
                <select 
                  value={selectedBrand} 
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="filter-select"
                >
                  <option value="">جميع العلامات</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="filter-group">
                <h4>نطاق السعر</h4>
                <div className="price-range">
                  <input
                    type="number"
                    placeholder="الحد الأدنى"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="price-input"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="الحد الأقصى"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="price-input"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="filter-group">
                <h4>الحد الأدنى للتقييم</h4>
                <div className="rating-filter">
                  {[4, 3, 2, 1].map(stars => (
                    <label key={stars} className="rating-option">
                      <input
                        type="radio"
                        name="rating"
                        value={stars}
                        checked={rating === stars}
                        onChange={(e) => setRating(Number(e.target.value))}
                      />
                      <StarRating rating={stars} />
                      <span>و أعلى</span>
                    </label>
                  ))}
                  <label className="rating-option">
                    <input
                      type="radio"
                      name="rating"
                      value={0}
                      checked={rating === 0}
                      onChange={(e) => setRating(Number(e.target.value))}
                    />
                    <span>جميع التقييمات</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedBrand('');
                  setPriceRange({ min: 0, max: 10000 });
                  setRating(0);
                  setSearchQuery('');
                }}
              >
                مسح جميع الفلاتر
              </button>
            </div>
          </div>
          
          {/* Products Content */}
          <div className="products-content">
            {/* Results Info */}
            <div className="results-info">
              <p>{filteredProducts.length} نتيجة لـ "{searchQuery || 'جميع المنتجات'}"</p>
            </div>

            {/* Products Grid */}
            {currentProducts.length > 0 ? (
              <div className={`products-grid ${viewMode}`}>
                {currentProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <h3>لم يتم العثور على منتجات</h3>
                <p>حاول تعديل الفلاتر أو مصطلحات البحث</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    pageNum === currentPage - 3 ||
                    pageNum === currentPage + 3
                  ) {
                    return <span key={pageNum} className="page-dots">...</span>;
                  }
                  return null;
                })}
                
                <button 
                  className="page-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 