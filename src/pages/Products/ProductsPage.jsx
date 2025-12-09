import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  faChevronRight,
  faThLarge,
  faList,
  faSlidersH,
  faPercent,
  faPalette,
  faGem,
  faTruck,
  faTag
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
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    brand: false,
    price: true
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
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }
      
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        throw new Error('Failed to parse response from server');
      }
      
      if (responseData.success && responseData.data?.products) {
        const formattedProducts = responseData.data.products
          .filter(product => product && product.id) // Filter out invalid products
          .map(product => {
            try {
              return {
                id: product.id,
                name: product.name || '',
                vendor: product.vendor_profile?.business_name || '',
                vendorId: product.vendor_profile?.id || '',
                category: product.category?.name || '',
                categoryId: product.category?.id || '',
                price: parseFloat(product.price) || 0,
                originalPrice: product.original_price ? parseFloat(product.original_price) : null,
                description: product.description || '',
                image: product.primary_image_url || 
                       (Array.isArray(product.image_urls) && product.image_urls.length > 0 ? product.image_urls[0] : null),
                images: Array.isArray(product.image_urls) ? product.image_urls : [],
                stockQuantity: product.stock_quantity !== undefined ? product.stock_quantity : null,
                rating: Array.isArray(product.reviews) && product.reviews.length > 0 
                  ? product.reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / product.reviews.length 
                  : 0,
                reviewCount: Array.isArray(product.reviews) ? product.reviews.length : 0,
                sku: product.sku || ''
              };
            } catch (mapError) {
              console.error('Error mapping product:', mapError, product);
              return null;
            }
          })
          .filter(product => product !== null); // Remove any null products from mapping errors
        
        setProducts(formattedProducts);
      } else {
        setProducts([]);
      }
    } catch (err) {
      const errorMessage = err?.message || err?.toString() || 'حدث خطأ أثناء تحميل المنتجات';
      console.error('Error fetching products:', errorMessage, err);
      setError(errorMessage);
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
        let responseData;
        try {
          responseData = await response.json();
        } catch (parseError) {
          console.error('Error parsing categories response:', parseError);
          return;
        }
        
        if (responseData.success && responseData.data) {
          const mainCategories = responseData.data.filter(cat => !cat.parent_id);
          const sortedCategories = mainCategories.sort((a, b) => 
            (a.sort_order || 0) - (b.sort_order || 0)
          );
          setCategories(sortedCategories);
        }
      }
    } catch (err) {
      const errorMessage = err?.message || err?.toString() || 'Error fetching categories';
      console.error('Error fetching categories:', errorMessage, err);
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
    try {
      if (!Array.isArray(products)) {
        return [];
      }

      let filtered = [...products];

      // Search filter
      if (searchTerm && typeof searchTerm === 'string') {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p => {
          if (!p) return false;
          try {
            return (
              (p.name && typeof p.name === 'string' && p.name.toLowerCase().includes(term)) ||
              (p.description && typeof p.description === 'string' && p.description.toLowerCase().includes(term)) ||
              (p.category && typeof p.category === 'string' && p.category.toLowerCase().includes(term)) ||
              (p.vendor && typeof p.vendor === 'string' && p.vendor.toLowerCase().includes(term))
            );
          } catch (err) {
            console.error('Error in search filter:', err);
            return false;
          }
        });
      }

      // Category filter
      if (selectedCategory) {
        filtered = filtered.filter(p => {
          if (!p) return false;
          return p.categoryId?.toString() === selectedCategory.toString();
        });
      }

      // Brand filter
      if (Array.isArray(selectedBrands) && selectedBrands.length > 0) {
        filtered = filtered.filter(p => {
          if (!p || !p.vendor) return false;
          return selectedBrands.includes(p.vendor);
        });
      }

      // Price range filter
      if (priceRange.min) {
        const minPrice = parseFloat(priceRange.min);
        if (!isNaN(minPrice)) {
          filtered = filtered.filter(p => p && typeof p.price === 'number' && p.price >= minPrice);
        }
      }
      if (priceRange.max) {
        const maxPrice = parseFloat(priceRange.max);
        if (!isNaN(maxPrice)) {
          filtered = filtered.filter(p => p && typeof p.price === 'number' && p.price <= maxPrice);
        }
      }

      // Sort
      try {
        switch (sortBy) {
          case 'price-low':
            filtered.sort((a, b) => (a?.price || 0) - (b?.price || 0));
            break;
          case 'price-high':
            filtered.sort((a, b) => (b?.price || 0) - (a?.price || 0));
            break;
          case 'name':
            filtered.sort((a, b) => {
              const nameA = a?.name || '';
              const nameB = b?.name || '';
              return nameA.localeCompare(nameB);
            });
            break;
          case 'rating':
            filtered.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
            break;
          default:
            filtered.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
            break;
        }
      } catch (sortError) {
        console.error('Error sorting products:', sortError);
      }

      return filtered;
    } catch (err) {
      console.error('Error filtering products:', err);
      return [];
    }
  }, [products, searchTerm, selectedCategory, selectedBrands, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, productsPerPage]);

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
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    if (!product || !product.id) {
      return null;
    }

    const discount = product.originalPrice && product.price && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

    const getImageUrl = (imagePath) => {
      try {
        if (!imagePath) return null;
        if (typeof imagePath !== 'string') return null;
        if (imagePath.startsWith('http')) return imagePath;
        if (imagePath.startsWith('/')) return `${config.BACKEND_URL}${imagePath}`;
        return `${config.BACKEND_URL}/storage/${imagePath}`;
      } catch (err) {
        console.error('Error processing image URL:', err);
        return null;
      }
    };

    return (
      <div
        className={`product-card ${viewMode === 'list' ? 'list-view' : ''}`}
        onClick={() => navigate(`/products/${product.id}`)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="product-image-container">
          {product.image && !imageError ? (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="product-image"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="product-image-placeholder">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
          )}
          
          {/* Ad Label */}
          <span className="product-ad-label">Ad</span>
          
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="product-badge discount-badge">{discount}% OFF</span>
          )}
          
          {/* Deal Banner */}
          {discount > 0 && (
            <div className="product-deal-banner">Deal</div>
          )}
          
          {/* Out of Stock Badge */}
          {(product.stockQuantity === 0 || product.stockQuantity === null) && (
            <span className="product-badge out-of-stock-badge">نفذت الكمية</span>
          )}

          {/* Wishlist Button */}
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
        </div>

        <div className="product-details">
          <h3 className="product-name">{product.name || 'منتج بدون اسم'}</h3>

          {/* Price Section */}
          <div className="product-price-section">
            <div className="product-price">
              <span className="price-value">{(product.price || 0).toFixed(2)}</span>
              <span className="price-currency">درهم</span>
            </div>
            {product.originalPrice && product.price && product.originalPrice > product.price && (
              <>
                <span className="product-original-price">{product.originalPrice.toFixed(2)} درهم</span>
                {discount > 0 && (
                  <span className="product-discount-text">{discount}% OFF</span>
                )}
              </>
            )}
          </div>

          {/* Delivery Information */}
          <div className="product-delivery-info">
            <div className="delivery-free">
              <FontAwesomeIcon icon={faTruck} />
              <span>Free Delivery</span>
            </div>
            <div className="delivery-express">
              express Get it by {getDeliveryDate()}
            </div>
          </div>
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

  // Calculate delivery date (example: tomorrow or specific date)
  const getDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="products-page">
      {/* Breadcrumb */}
     

      {/* Page Header */}
     

      {/* Horizontal Filter Chips */}
      <div className="filter-chips-container">
        <div className="filter-chips-scroll">
          <button
            className={`filter-chip ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            <FontAwesomeIcon icon={faPercent} />
            <span>العروض</span>
            <FontAwesomeIcon icon={faChevronDown} className="chip-arrow" />
          </button>
          
          <button
            className="filter-chip"
            onClick={() => toggleFilter('category')}
          >
            <FontAwesomeIcon icon={faPalette} />
            <span>اللون</span>
            <FontAwesomeIcon icon={faChevronDown} className="chip-arrow" />
          </button>
          
          <button
            className="filter-chip"
            onClick={() => toggleFilter('brand')}
          >
            <FontAwesomeIcon icon={faGem} />
            <span>الماركة</span>
            <FontAwesomeIcon icon={faChevronDown} className="chip-arrow" />
          </button>

          {categories.slice(0, 8).map(category => (
            <button
              key={category.id}
              className={`filter-chip ${selectedCategory === category.id.toString() ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id.toString())}
            >
              <span>{category.name}</span>
            </button>
          ))}
        </div>
        <button className="filter-chips-scroll-btn scroll-right">
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      </div>

      {/* Main Content */}
      <div className="products-main-container">
        {/* Sidebar Filters - Hidden on desktop, shown on mobile */}
        <aside className={`products-sidebar ${showMobileFilters ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            <h2>
              <FontAwesomeIcon icon={faSlidersH} />
              الفلاتر
            </h2>
            <button
              className="sidebar-close-btn"
              onClick={() => setShowMobileFilters(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="sidebar-content">
            {/* Search */}
            <div className="filter-section">
              <div className="filter-search">
                <FontAwesomeIcon icon={faSearch} />
                <input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleFilter('category')}
              >
                <span>الفئات</span>
                <FontAwesomeIcon
                  icon={expandedFilters.category ? faChevronUp : faChevronDown}
                />
              </button>
              {expandedFilters.category && (
                <div className="filter-options">
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

            {/* Brands */}
            {brands.length > 0 && (
              <div className="filter-section">
                <button
                  className="filter-section-header"
                  onClick={() => toggleFilter('brand')}
                >
                  <span>الماركات</span>
                  <FontAwesomeIcon
                    icon={expandedFilters.brand ? faChevronUp : faChevronDown}
                  />
                </button>
                {expandedFilters.brand && (
                  <div className="filter-options">
                    {brands.map(brand => (
                      <label key={brand} className="filter-option checkbox">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandToggle(brand)}
                        />
                        <span>{brand}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price Range */}
            <div className="filter-section">
              <button
                className="filter-section-header"
                onClick={() => toggleFilter('price')}
              >
                <span>السعر</span>
                <FontAwesomeIcon
                  icon={expandedFilters.price ? faChevronUp : faChevronDown}
                />
              </button>
              {expandedFilters.price && (
                <div className="filter-options price-range">
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="من"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    />
                    <span>إلى</span>
                    <input
                      type="number"
                      placeholder="إلى"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Clear Filters */}
            {activeFiltersCount() > 0 && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                مسح جميع الفلاتر ({activeFiltersCount()})
              </button>
            )}
          </div>
        </aside>

        {/* Products Area */}
        <main className="products-content-area">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="toolbar-left">
              <button
                className="mobile-filters-btn"
                onClick={() => setShowMobileFilters(true)}
              >
                <FontAwesomeIcon icon={faFilter} />
                الفلاتر
                {activeFiltersCount() > 0 && (
                  <span className="filter-count-badge">{activeFiltersCount()}</span>
                )}
              </button>
            </div>

            <div className="toolbar-right">
              <div className="view-mode-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="عرض الشبكة"
                >
                  <FontAwesomeIcon icon={faThLarge} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="عرض القائمة"
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>

              <div className="sort-selector">
                <FontAwesomeIcon icon={faSort} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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

          {/* Products Grid/List */}
          {paginatedProducts.length > 0 ? (
            <>
              <div className={`products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {paginatedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="products-pagination">
                  <button
                    className="pagination-btn"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
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
                    className="pagination-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    التالي
                    <FontAwesomeIcon icon={faChevronLeft} />
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
                <button className="clear-filters-btn" onClick={clearFilters}>
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
