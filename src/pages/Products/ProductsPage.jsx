import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faExclamationTriangle,
  faShoppingCart,
  faChevronDown,
  faChevronUp,
  faHeart,
  faFilter,
  faTimes,
  faSearch,
  faStar,
  faSort,
  faCheck,
  faArrowRight,
  faArrowLeft,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import config from '../../config/apiConfig';
import './ProductsPage.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  // State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    brand: false,
    price: false
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${config.BACKEND_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const responseData = await response.json();
      
      if (responseData.success && responseData.data?.products) {
        const formattedProducts = responseData.data.products.map(product => ({
          id: product.id,
          name: product.name,
          vendor: product.vendor_profile?.business_name || '',
          vendorId: product.vendor_profile?.id || '',
          category: product.category?.name || '',
          categoryId: product.category?.id || '',
          price: parseFloat(product.price) || 0,
          originalPrice: product.original_price ? parseFloat(product.original_price) : null,
          description: product.description || '',
          image: product.primary_image_url || 
                 (product.image_urls?.length > 0 ? product.image_urls[0] : null),
          images: product.image_urls || [],
          stockQuantity: product.stock_quantity || 0,
          rating: product.reviews?.length > 0 
            ? product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length 
            : 0,
          reviewCount: product.reviews?.length || 0,
          sku: product.sku || ''
        }));
        
        setProducts(formattedProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/categories`);
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success && responseData.data) {
          const sortedCategories = [...responseData.data].sort((a, b) => 
            (a.sort_order || 0) - (b.sort_order || 0)
          );
          setCategories(sortedCategories);
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Get unique brands
  const brands = useMemo(() => {
    const brandSet = new Set();
    products.forEach(product => {
      if (product.vendor) {
        brandSet.add(product.vendor);
      }
    });
    return Array.from(brandSet).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.vendor.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.vendor));
    }

    // Price range filter
    if (priceRange.min) {
      filtered = filtered.filter(p => p.price >= parseFloat(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(p => p.price <= parseFloat(priceRange.max));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Popular/default - keep original order or sort by rating
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedBrands, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBrands, priceRange, sortBy]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'popular') params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [searchTerm, selectedCategory, sortBy, setSearchParams]);

  // Handlers
  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
    setSortBy('popular');
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (selectedCategory) count++;
    if (selectedBrands.length > 0) count++;
    if (priceRange.min || priceRange.max) count++;
    return count;
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Product Card Component
  const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const availableImages = product.images && product.images.length > 0 
      ? product.images 
      : product.image 
        ? [product.image] 
        : [];

    const discount = product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    const handleImageError = (index) => {
      setImageError(prev => ({ ...prev, [index]: true }));
    };

    const nextImage = (e) => {
      e.stopPropagation();
      if (availableImages.length > 1) {
        setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
      }
    };

    const prevImage = (e) => {
      e.stopPropagation();
      if (availableImages.length > 1) {
        setCurrentImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
      }
    };

    const currentImage = availableImages[currentImageIndex];

    return (
      <div
        className="product-card"
        onClick={() => navigate(`/products/${product.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="product-image-wrapper">
          {currentImage && !imageError[currentImageIndex] ? (
            <>
              <img
                src={currentImage}
                alt={product.name}
                className="product-image"
                onError={() => handleImageError(currentImageIndex)}
              />
              {availableImages.length > 1 && (
                <>
                  <button
                    className="product-carousel-btn product-carousel-prev"
                    onClick={prevImage}
                    title="الصورة السابقة"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                  <button
                    className="product-carousel-btn product-carousel-next"
                    onClick={nextImage}
                    title="الصورة التالية"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <div className="product-carousel-indicators">
                    {availableImages.map((_, index) => (
                      <button
                        key={index}
                        className={`carousel-indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        aria-label={`صورة ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="product-image-placeholder">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
          )}
          
          {discount > 0 && (
            <div className="product-discount-badge">
              {discount}%
            </div>
          )}

          <button
            className="product-wishlist-btn"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement wishlist
            }}
            title="إضافة للمفضلة"
          >
            <FontAwesomeIcon icon={faHeart} />
          </button>

          {product.stockQuantity > 0 && (
            <button
              className={`product-cart-btn ${isHovered ? 'show' : ''}`}
              onClick={(e) => handleAddToCart(e, product)}
              title="إضافة للسلة"
            >
              <FontAwesomeIcon icon={faShoppingCart} />
            </button>
          )}
        </div>

        <div className="product-info">
          {product.rating > 0 && (
            <div className="product-rating">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className={`star ${star <= Math.round(product.rating) ? 'filled' : ''}`}
                  />
                ))}
              </div>
              <span className="rating-value">{product.rating.toFixed(1)}</span>
              {product.reviewCount > 0 && (
                <span className="rating-count">({product.reviewCount})</span>
              )}
            </div>
          )}

          <h3 className="product-title">{product.name}</h3>

          {product.vendor && (
            <div className="product-vendor">{product.vendor}</div>
          )}

          <div className="product-price-container">
            <div className="product-price">
              <span className="price-value">{product.price.toFixed(2)}</span>
              <span className="price-currency">درهم</span>
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="product-original-price">
                {product.originalPrice.toFixed(2)} درهم
              </div>
            )}
          </div>

          {product.stockQuantity === 0 && (
            <div className="product-out-of-stock">غير متوفر</div>
          )}
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="products-page">
        <div className="products-loading">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && products.length === 0) {
    return (
      <div className="products-page">
        <div className="products-error">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h2>فشل تحميل المنتجات</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchProducts}>
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
        <div className="products-header-content">
          <div className="products-header-title">
            <h1>المنتجات</h1>
            <p className="products-count">{filteredProducts.length} منتج متاح</p>
          </div>
          
          <div className="products-header-search">
            <div className="search-input-wrapper">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="search-clear"
                  onClick={() => setSearchTerm('')}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="products-content">
        {/* Sidebar Filters */}
        <aside className={`products-sidebar ${showMobileFilters ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h2>الفلاتر</h2>
            <button
              className="sidebar-close"
              onClick={() => setShowMobileFilters(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="sidebar-content">
            {/* Categories Filter */}
            <div className="filter-group">
              <button
                className="filter-group-header"
                onClick={() => toggleFilter('category')}
              >
                <span>الفئات</span>
                <FontAwesomeIcon
                  icon={expandedFilters.category ? faChevronUp : faChevronDown}
                />
              </button>
              {expandedFilters.category && (
                <div className="filter-group-content">
                  <label className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === ''}
                      onChange={() => setSelectedCategory('')}
                    />
                    <span>الكل</span>
                  </label>
                  {categories.map(category => (
                    <label key={category.id} className="filter-option">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.id.toString()}
                        onChange={() => setSelectedCategory(category.id.toString())}
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Brands Filter */}
            {brands.length > 0 && (
              <div className="filter-group">
                <button
                  className="filter-group-header"
                  onClick={() => toggleFilter('brand')}
                >
                  <span>الماركات</span>
                  <FontAwesomeIcon
                    icon={expandedFilters.brand ? faChevronUp : faChevronDown}
                  />
                </button>
                {expandedFilters.brand && (
                  <div className="filter-group-content">
                    <div className="brand-search-wrapper">
                      <FontAwesomeIcon icon={faSearch} />
                      <input
                        type="text"
                        placeholder="ابحث عن ماركة..."
                        className="brand-search-input"
                      />
                    </div>
                    <div className="filter-checkbox-list">
                      {brands.slice(0, 10).map(brand => (
                        <label key={brand} className="filter-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={() => handleBrandToggle(brand)}
                          />
                          <span>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Filter */}
            <div className="filter-group">
              <button
                className="filter-group-header"
                onClick={() => toggleFilter('price')}
              >
                <span>السعر</span>
                <FontAwesomeIcon
                  icon={expandedFilters.price ? faChevronUp : faChevronDown}
                />
              </button>
              {expandedFilters.price && (
                <div className="filter-group-content">
                  <div className="price-range-inputs">
                    <input
                      type="number"
                      placeholder="من"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="price-input"
                    />
                    <span>إلى</span>
                    <input
                      type="number"
                      placeholder="إلى"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="price-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {activeFiltersCount() > 0 && (
              <button className="clear-filters-button" onClick={clearFilters}>
                مسح جميع الفلاتر
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <main className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <button
                className="mobile-filters-button"
                onClick={() => setShowMobileFilters(true)}
              >
                <FontAwesomeIcon icon={faFilter} />
                الفلاتر
                {activeFiltersCount() > 0 && (
                  <span className="filter-badge">{activeFiltersCount()}</span>
                )}
              </button>
            </div>

            <div className="toolbar-right">
              <div className="sort-wrapper">
                <FontAwesomeIcon icon={faSort} className="sort-icon" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="popular">الأكثر رواجاً</option>
                  <option value="price-low">السعر: من الأقل للأعلى</option>
                  <option value="price-high">السعر: من الأعلى للأقل</option>
                  <option value="rating">الأعلى تقييماً</option>
                  <option value="name">الاسم: أ - ي</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {paginatedProducts.length > 0 ? (
            <>
              <div className="products-grid">
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="products-pagination">
                  <button
                    className="pagination-button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                    السابق
                  </button>

                  <div className="pagination-numbers">
                    {[...Array(totalPages)].map((_, idx) => {
                      const page = idx + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="pagination-ellipsis">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    className="pagination-button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    التالي
                    <FontAwesomeIcon icon={faArrowLeft} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="products-empty">
              <FontAwesomeIcon icon={faSearch} size="3x" />
              <h3>لم يتم العثور على منتجات</h3>
              <p>حاول تعديل الفلاتر أو البحث عن منتج آخر</p>
              {activeFiltersCount() > 0 && (
                <button className="clear-filters-button" onClick={clearFilters}>
                  مسح جميع الفلاتر
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
