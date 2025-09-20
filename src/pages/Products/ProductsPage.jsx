import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faSpinner,
  faExclamationTriangle,
  faShoppingCart,
  faSearch,
  faTimes,
  faFilter
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import './ProductsPage.css';
// Import FontAwesome CSS for category icons
import 'font-awesome/css/font-awesome.min.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(12);
  const [gridColumns, setGridColumns] = useState('repeat(5, 1fr)');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Handle responsive grid
  useLayoutEffect(() => {
    function updateGridColumns() {
      if (window.innerWidth <= 480) {
        setGridColumns('1fr'); // 1 column on mobile
      } else if (window.innerWidth <= 768) {
        setGridColumns('repeat(2, 1fr)'); // 2 columns on tablet
      } else {
        setGridColumns('repeat(5, 1fr)'); // 5 columns on desktop
      }
    }

    updateGridColumns();
    window.addEventListener('resize', updateGridColumns);
    return () => window.removeEventListener('resize', updateGridColumns);
  }, []);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim() !== '') {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        fetchProducts(searchTerm, selectedCategory);
      }, 500); // 500ms debounce
    } else if (searchTerm === '' && products.length > 0) {
      // Apply only category filter when search is cleared
      if (selectedCategory) {
        filterProductsByCategory(products, selectedCategory);
      } else {
        setFilteredProducts(products);
      }
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Handle category selection
  useEffect(() => {
    if (selectedCategory) {
      if (searchTerm) {
        // If there's a search term, fetch with both filters
        fetchProducts(searchTerm, selectedCategory);
      } else {
        // If no search term, just filter the existing products
        filterProductsByCategory(products, selectedCategory);
      }
    } else if (searchTerm) {
      // If category is cleared but search term exists
      fetchProducts(searchTerm);
    } else {
      // If both filters are cleared
      setFilteredProducts(products);
    }
  }, [selectedCategory]);

  // Filter products by category
  const filterProductsByCategory = (productsList, categoryId) => {
    if (!categoryId) {
      setFilteredProducts(productsList);
      return;
    }

    // Simple direct filtering by category ID
    const filtered = productsList.filter(product => product.categoryId === categoryId);
    setFilteredProducts(filtered);
    setVisibleProducts(12); // Reset pagination when filtering
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        // Get all categories (both parents and children) as a flat list
        const categoriesData = responseData.data;
        
        // Sort by sort_order
        categoriesData.sort((a, b) => a.sort_order - b.sort_order);
        
        setCategories(categoriesData);
      } else {
        // Fallback: Extract categories from products if API fails
        console.log('Falling back to extracting categories from products');
        extractCategoriesFromProducts();
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback: Extract categories from products if API fails
      extractCategoriesFromProducts();
    } finally {
      setLoadingCategories(false);
    }
  };

  // Extract categories from products as fallback
  const extractCategoriesFromProducts = () => {
    if (products.length === 0) return;
    
    const uniqueCategories = [...new Map(
      products
        .filter(p => p.category && p.categoryId)
        .map(p => [p.categoryId, { id: p.categoryId, name: p.category }])
    ).values()];
    
    setCategories(uniqueCategories);
  };

  const fetchProducts = async (search = '', category = '') => {
    try {
      setLoading(true);
      let url = 'http://127.0.0.1:8000/api/products';
      
      // Add query parameters
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      
      // Append parameters to URL if any exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const responseData = await response.json();
      
      if (responseData.success && responseData.data && Array.isArray(responseData.data.products)) {
        const productsArray = responseData.data.products;
        console.log('API returned products:', productsArray.length);
        
        // Transform products to match the component's expected format
        const formattedProducts = productsArray.map(product => ({
          id: product.id,
          name: product.name,
          vendor: product.vendor_profile?.business_name || '',
          vendorId: product.vendor_profile?.id || '',
          category: product.category?.name || '',
          categoryId: product.category?.id || '',
          price: parseFloat(product.price),
          description: product.description || '',
          image: product.primary_image_url || 
                 (product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : 
                  null),
          stockQuantity: product.stock_quantity || 0,
          dimensions: product.dimensions || '',
          specifications: product.specifications || '',
          rating: 4.8 // Since API doesn't provide ratings, using a standard value
        }));
        
        console.log('Formatted products:', formattedProducts.length);
        
        // Store all products in state
        if (!search && !category) {
        setProducts(formattedProducts);
        }
        
        // Update filtered products
        setFilteredProducts(formattedProducts);
        setVisibleProducts(12); // Reset pagination when searching
        
        // Extract categories from products if we haven't loaded them yet
        if (categories.length === 0) {
          extractCategoriesFromProducts();
        }
      } else {
        if (!search && !category) {
        setProducts([]);
        }
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      if (!search && !category) {
      setProducts([]);
      }
      setFilteredProducts([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  // Handle search focus
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  // Handle search blur
  const handleSearchBlur = () => {
    // Small delay to allow click events to process
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  };

  // Handle search clear
  const handleClearSearch = () => {
    setSearchTerm('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle search icon click
  const handleSearchIconClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(''); // Deselect if already selected
    } else {
      setSelectedCategory(categoryId);
    }
  };

  // Load more products
  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 12);
  };

  // Product card component
  const ProductCard = ({ product }) => {
    const handleImageError = (e) => {
      // Remove image on error instead of showing placeholder
      e.target.style.display = 'none';
    };
    
    const handleCardClick = () => {
      navigate(`/products/${product.id}`);
    };
    
    const handleAddToCart = (e) => {
      e.stopPropagation(); // Prevent card click
      addToCart(product, 1);
    };
    
    // Format dimensions for display
    const formatDimensions = (dimensions) => {
      if (!dimensions) return '';
      if (typeof dimensions === 'object') {
        const { length, width, height } = dimensions;
        return `${length || 0} × ${width || 0} × ${height || 0} cm`;
      }
      return dimensions;
    };
    
    return (
      <div className="product-card" onClick={handleCardClick}>
        <div className="product-image-container">
          <div className="rating-badge">
            <FontAwesomeIcon icon={faStar} className="rating-star" />
            {product.rating}
          </div>
          {product.image && (
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-image" 
            onError={handleImageError} 
          />
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          
          {product.dimensions && (
            <div className="product-specs">{formatDimensions(product.dimensions)}</div>
          )}
          
          <div className="product-price-container">
          <div className="product-price">
              AED {product.price.toFixed(0)}
              {product.dimensions && <span className="price-unit">/m²</span>}
            </div>
            {product.vendor && (
              <div className="vendor-name">Sold by {product.vendor}</div>
            )}
          </div>
          
          <button 
            className="add-to-cart-btn"
            onClick={handleAddToCart}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            أضف للسلة
          </button>
        </div>
      </div>
    );
  };

  if (loading && !isSearching) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="products-page">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h2>Failed to load products</h2>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => fetchProducts()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Search Bar */}
        <div className={`search-bar-container ${isSearchFocused ? 'focused' : ''}`}>
          <div className="search-input-wrapper">
            <div className="search-icon" onClick={handleSearchIconClick}>
              {isSearching ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faSearch} />
              )}
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="بحث عن المنتجات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            {searchTerm && (
              <div className="search-clear" onClick={handleClearSearch}>
                <FontAwesomeIcon icon={faTimes} />
              </div>
            )}
          </div>
          {isSearchFocused && searchTerm && (
            <div className="search-status">
              {isSearching ? 'جاري البحث...' : `تم العثور على ${filteredProducts.length} منتج`}
            </div>
          )}
        </div>

        {/* Categories Filter */}
        <div className="categories-filter">
          <div className="categories-header">
            <FontAwesomeIcon icon={faFilter} />
            <span>تصفية حسب الفئة</span>
            </div>
          <div className="categories-list">
            {loadingCategories ? (
              <div className="categories-loading">
                <FontAwesomeIcon icon={faSpinner} spin />
                <span>جاري تحميل الفئات...</span>
              </div>
            ) : categories.length > 0 ? (
              <>
                <button 
                  className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
                  onClick={() => handleCategorySelect('')}
                >
                  الكل
                </button>
                {categories.map(category => (
                  <button 
                    key={category.id} 
                    className={`category-btn ${selectedCategory === category.id ? 'active' : ''} ${category.parent_id ? 'subcategory-btn' : 'parent-category'}`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {category.icon && <i className={category.icon}></i>}
                    {category.name}
                  </button>
                ))}
              </>
            ) : (
              <div className="no-categories">لا توجد فئات متاحة</div>
            )}
                </div>
              </div>

        <div className="products-content">
          {/* Products Grid */}
          {loading && isSearching ? (
            <div className="loading-container">
              <FontAwesomeIcon icon={faSpinner} spin size="3x" />
              <p>Searching products...</p>
                </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div 
                className="products-grid" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: gridColumns, 
                  gap: '1rem' 
                }}
              >
                {filteredProducts.slice(0, visibleProducts).map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {visibleProducts < filteredProducts.length && (
                <div className="load-more-container">
                  <button className="load-more-btn" onClick={loadMoreProducts}>
                    Load More Products
                </button>
              </div>
            )}
            </>
          ) : (
            <div className="no-products">
              <h3>No products found</h3>
              <p>{searchTerm ? `No results for "${searchTerm}"` : 'Try again later'}</p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 