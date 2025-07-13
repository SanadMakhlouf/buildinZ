import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './ProductsPage.css';
import orderService from '../../services/orderService';
import authService from '../../services/authService';
import productService from '../../services/productService';
import SkeletonLoader from '../../components/SkeletonLoader';

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { productId } = useParams();
  
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
  
  // State for filters
  const [brandFilter, setBrandFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // State for toast notifications
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
    
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Handle product click to open modal
  const handleProductClick = useCallback((product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    navigate(`/products/${product.id}`, { replace: true });
  }, [navigate]);

  // Close product modal
  const handleCloseProductModal = useCallback(() => {
    setShowProductModal(false);
    setSelectedProduct(null);
    navigate('/products', { replace: true });
  }, [navigate]);

  // Add to cart function
  const handleAddToCart = (product, event) => {
    event.stopPropagation();
    
    const existingItem = cart.find(item => item.id === product.id);
    
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('buildingz_cart', JSON.stringify(updatedCart));
    
    showToast(`Added ${product.name} to cart`);
  };

  // Toggle wishlist item
  const toggleWishlist = (productId, event) => {
    event.stopPropagation();
    
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter(id => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
    
    localStorage.setItem('buildingz_wishlist', JSON.stringify(wishlist));
  };

  // Handle filter changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    applyFilters(category, brandFilter, sizeFilter, priceRange, searchTerm, sortBy);
  };

  const handleBrandChange = (brand) => {
    setBrandFilter(brand);
    setCurrentPage(1);
    applyFilters(selectedCategory, brand, sizeFilter, priceRange, searchTerm, sortBy);
  };

  const handleSizeChange = (size) => {
    setSizeFilter(size);
    setCurrentPage(1);
    applyFilters(selectedCategory, brandFilter, size, priceRange, searchTerm, sortBy);
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
    setCurrentPage(1);
    applyFilters(selectedCategory, brandFilter, sizeFilter, range, searchTerm, sortBy);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    applyFilters(selectedCategory, brandFilter, sizeFilter, priceRange, searchTerm, sort);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    applyFilters(selectedCategory, brandFilter, sizeFilter, priceRange, value, sortBy);
  };

  // Apply all filters
  const applyFilters = (category, brand, size, price, search, sort) => {
    let filtered = [...products];
    
    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(product => product.categoryId == category);
    }
    
    // Apply brand filter
    if (brand !== 'all') {
      filtered = filtered.filter(product => product.brand === brand);
    }
    
    // Apply size filter
    if (size !== 'all') {
      filtered = filtered.filter(product => product.sizes && product.sizes.includes(size));
    }
    
    // Apply price range filter
    filtered = filtered.filter(product => 
      product.price >= price.min && product.price <= price.max
    );
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) || 
        (product.description && product.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    switch (sort) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default: // featured
        // Keep original order or apply custom featured logic
        break;
    }
    
    setFilteredProducts(filtered);
    setTotalProducts(filtered.length);
  };

  // Handle pagination
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Toggle mobile filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Format price with currency
  const formatPrice = (price) => {
    // Convert price to number if it's a string
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Check if price is a valid number
    if (isNaN(numericPrice)) {
      return '0.00 SAR';
    }
    
    return `${numericPrice.toFixed(2)} SAR`;
  };

  // Render star rating
  const renderStarRating = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="product-rating">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star"></i>
        ))}
        {halfStar && <i className="fas fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star"></i>
        ))}
        <span>({rating})</span>
      </div>
    );
  };

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await productService.getProducts();
        const categoriesData = await productService.getCategories();
        
        if (productsData && Array.isArray(productsData)) {
          // Add sample data for demonstration if needed
          const enhancedProducts = productsData.map(product => ({
            ...product,
            rating: product.rating || Math.random() * 5,
            brand: product.brand || 'Generic Brand',
            sizes: product.sizes || ['S', 'M', 'L', 'XL'],
            createdAt: product.createdAt || new Date().toISOString()
          }));
          
          setProducts(enhancedProducts);
          setFilteredProducts(enhancedProducts);
          setTotalProducts(enhancedProducts.length);
        } else {
          setError('Failed to load products');
        }
        
        if (categoriesData && Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
        
        // Load cart from localStorage
        const savedCart = localStorage.getItem('buildingz_cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
        
        // Load wishlist from localStorage
        const savedWishlist = localStorage.getItem('buildingz_wishlist');
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Load specific product if productId is in URL
  useEffect(() => {
    const loadProductFromId = async () => {
      if (productId) {
        try {
          const product = await productService.getProductById(productId);
          if (product) {
            setSelectedProduct(product);
            setShowProductModal(true);
          }
        } catch (err) {
          console.error('Error loading product:', err);
        }
      }
    };
    
    loadProductFromId();
  }, [productId]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="products-page">
        <div className="products-header">
          <div className="container">
            <h1>Products</h1>
          </div>
        </div>
        <div className="container">
          <div className="products-content">
            <div className="products-sidebar skeleton-sidebar">
              <SkeletonLoader type="sidebar" />
            </div>
            <div className="products-grid">
              {[...Array(6)].map((_, index) => (
                <SkeletonLoader key={index} type="product-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              <i className="fas fa-redo"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (filteredProducts.length === 0) {
    return (
      <div className="products-page">
        <div className="products-header">
          <div className="container">
            <h1>Products</h1>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button className="search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="products-content">
            <div className={`products-sidebar ${showFilters ? 'show' : ''}`}>
              {renderCategoryFilters()}
            </div>
            <div className="empty-state">
              <i className="fas fa-box-open"></i>
              <h2>No products found</h2>
              <p>Try adjusting your filters or search term</p>
              <button onClick={() => {
                setSelectedCategory('all');
                setBrandFilter('all');
                setSizeFilter('all');
                setPriceRange({ min: 0, max: 1000 });
                setSearchTerm('');
                setSortBy('featured');
                applyFilters('all', 'all', 'all', { min: 0, max: 1000 }, '', 'featured');
              }} className="reset-filters-btn">
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render category filters
  const renderCategoryFilters = () => {
    // Get unique brands from products
    const brands = ['all', ...new Set(products.map(product => product.brand))];
    
    // Get unique sizes from products
    const sizes = ['all', ...new Set(products.flatMap(product => product.sizes || []))];
    
    return (
      <div className="filter-container">
        <div className="filter-header">
          <h2>Filters</h2>
          <button className="close-filters-btn" onClick={toggleFilters}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="filter-group">
          <h3>Categories</h3>
      <div className="category-filters">
        <button
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => handleCategoryChange('all')}
        >
              All Categories
        </button>
            {categories.map(category => (
          <button
                key={category.id} 
                className={selectedCategory == category.id ? 'active' : ''} 
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.icon} {category.name}
          </button>
        ))}
      </div>
        </div>
        
        <div className="filter-group">
          <h3>Brand</h3>
          <div className="brand-filters">
            {brands.map(brand => (
              <div key={brand} className="filter-checkbox">
                <input 
                  type="radio" 
                  id={`brand-${brand}`} 
                  name="brand" 
                  checked={brandFilter === brand} 
                  onChange={() => handleBrandChange(brand)}
                />
                <label htmlFor={`brand-${brand}`}>{brand === 'all' ? 'All Brands' : brand}</label>
        </div>
            ))}
          </div>
        </div>
        
        <div className="filter-group">
          <h3>Size</h3>
          <div className="size-filters">
            {sizes.map(size => (
        <button 
                key={size} 
                className={sizeFilter === size ? 'size-btn active' : 'size-btn'} 
                onClick={() => handleSizeChange(size)}
        >
                {size === 'all' ? 'All' : size}
        </button>
            ))}
      </div>
        </div>
        
        <div className="filter-group">
          <h3>Price Range</h3>
          <div className="price-range-slider">
            <div className="price-inputs">
              <div className="price-input">
                <label>Min</label>
                <input 
                  type="number" 
                  value={priceRange.min} 
                  onChange={(e) => handlePriceRangeChange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="price-input">
                <label>Max</label>
                <input 
                  type="number" 
                  value={priceRange.max} 
                  onChange={(e) => handlePriceRangeChange({ ...priceRange, max: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1000" 
              value={priceRange.max} 
              onChange={(e) => handlePriceRangeChange({ ...priceRange, max: parseInt(e.target.value) })}
              className="range-slider"
            />
          </div>
        </div>
        
        <button className="apply-filters-btn" onClick={() => toggleFilters()}>
          Apply Filters
        </button>
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
              <img src={selectedProduct.image || 'https://via.placeholder.com/400?text=No+Image'} alt={selectedProduct.name} />
              {selectedProduct.discount_percent > 0 && (
                <div className="modal-discount-badge">
                  {selectedProduct.discount_percent}% OFF
                </div>
              )}
            </div>
            
            <div className="modal-details-section">
              <div className="product-header">
                <div className="product-brand-tag">
                  {selectedProduct.brand || 'Generic Brand'}
                </div>
                <button 
                  className={`wishlist-action-btn ${wishlist.includes(selectedProduct.id) ? 'active' : ''}`}
                  onClick={(e) => toggleWishlist(selectedProduct.id, e)}
                >
                  <i className={wishlist.includes(selectedProduct.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                </button>
              </div>
              
                <h2 className="product-title">{selectedProduct.name}</h2>
                
                <div className="product-rating-detailed">
                  <div className="stars-container">
                  {renderStarRating(selectedProduct.rating || 0)}
                  </div>
                <div className="rating-details">
                  <span>{selectedProduct.reviews || 0} reviews</span>
                </div>
              </div>
              
              <div className="product-description-section">
                <h4>Description</h4>
                <div className="product-description-text">
                  {selectedProduct.description || 'No description available.'}
                </div>
              </div>
              
              {selectedProduct.specifications && (
                <div className="product-specifications">
                  <h4>Specifications</h4>
                  <div className="specs-grid">
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      <div className="spec-item" key={key}>
                        <span className="spec-label">{key}</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="product-pricing-section">
                <h4>Price</h4>
                <div className="price-container">
                  <span className="current-price-large">
                    {formatPrice(selectedProduct.price)}
                  </span>
                  {selectedProduct.original_price && selectedProduct.original_price > selectedProduct.price && (
                    <span className="original-price-large">
                      {formatPrice(selectedProduct.original_price)}
                    </span>
                  )}
                  </div>
                
                <div className="stock-info">
                  {selectedProduct.stock > 0 ? (
                    <span className="stock-available">In Stock ({selectedProduct.stock} available)</span>
                  ) : (
                    <span className="stock-unavailable">Out of Stock</span>
                  )}
                </div>
              </div>
              
              <div className="modal-actions-section">
                <button 
                  className="primary-action-btn"
                  onClick={(e) => handleAddToCart(selectedProduct, e)}
                  disabled={selectedProduct.stock <= 0}
                >
                  <i className="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button className="secondary-action-btn">
                  <i className="fas fa-bolt"></i> Buy Now
                </button>
              </div>
              
              <div className="shipping-benefits">
                <div className="benefit-item">
                  <i className="fas fa-truck"></i>
                  <span>Free Shipping</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-undo"></i>
                  <span>30-Day Returns</span>
                </div>
                <div className="benefit-item">
                  <i className="fas fa-shield-alt"></i>
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render main product page
  return (
    <div className="products-page">
      {/* Header section with search and cart */}
          <div className="products-header">
        <div className="container">
          <h1>Products</h1>
            <div className="products-actions">
              <div className="search-container">
                <input
                  type="text"
                placeholder="Search products..."
                  value={searchTerm}
                onChange={handleSearchChange}
                />
                <button className="search-btn">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            <button className="cart-btn" onClick={() => setShowCart(true)}>
                <i className="fas fa-shopping-cart"></i>
              {cart.length > 0 && <span className="cart-count">{cart.length}</span>}
              </button>
          </div>
            </div>
          </div>

      {/* Main content section */}
      <div className="container">
        <div className="products-toolbar">
          <button className="filter-toggle-btn" onClick={toggleFilters}>
            <i className="fas fa-filter"></i> Filters
          </button>
          <div className="sort-container">
            <label htmlFor="sort-select">Sort by:</label>
            <select 
              id="sort-select" 
              value={sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Best Rating</option>
              <option value="newest">Newest</option>
            </select>
                </div>
          <div className="products-count">
            Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, totalProducts)} of {totalProducts} products
              </div>
            </div>

        <div className="products-content">
          {/* Sidebar filters */}
          <div className={`products-sidebar ${showFilters ? 'show' : ''}`}>
            {renderCategoryFilters()}
          </div>
          
          {/* Products grid */}
            <div className="products-grid">
            {currentProducts.map(product => (
                  <div 
                    key={product.id}
                className="product-card" 
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="product-image">
                  <img src={product.image || 'https://via.placeholder.com/300?text=No+Image'} alt={product.name} />
                  {product.discount_percent > 0 && (
                    <div className="discount-badge">
                      {product.discount_percent}% OFF
                    </div>
                  )}
                  <button 
                    className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                    onClick={(e) => toggleWishlist(product.id, e)}
                  >
                    <i className={wishlist.includes(product.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                  </button>
                    </div>
                    <div className="product-info">
                  <div className="product-brand">{product.brand || 'Generic Brand'}</div>
                      <h3>{product.name}</h3>
                      <div className="product-price">
                    <span className="current-price">{formatPrice(product.price)}</span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="original-price">{formatPrice(product.original_price)}</span>
                        )}
                      </div>
                  {renderStarRating(product.rating || 0)}
                      <button
                        className="add-to-cart-btn"
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={product.stock <= 0}
                  >
                    <i className="fas fa-shopping-cart"></i> 
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
            ))}
            </div>
          </div>
          
        {/* Pagination */}
        {totalProducts > productsPerPage && (
          <div className="pagination">
            <button 
              className="pagination-btn" 
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            {[...Array(Math.ceil(totalProducts / productsPerPage))].map((_, i) => {
              // Show limited page numbers with ellipsis
              if (
                i === 0 || 
                i === Math.ceil(totalProducts / productsPerPage) - 1 ||
                (i >= currentPage - 2 && i <= currentPage + 2)
              ) {
                return (
                  <button
                    key={i}
                    className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </button>
                );
              } else if (
                i === currentPage - 3 || 
                i === currentPage + 3
              ) {
                return <span key={i} className="pagination-ellipsis">...</span>;
              }
              return null;
            })}
            
            <button 
              className="pagination-btn" 
              disabled={currentPage === Math.ceil(totalProducts / productsPerPage)}
              onClick={() => paginate(currentPage + 1)}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
      
      {/* Toast notification */}
          {toast.show && (
            <div className={`toast ${toast.type}`}>
              <span>{toast.message}</span>
          <button onClick={() => setToast({ show: false, message: '', type: '' })}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
      
      {/* Product modal */}
      {showProductModal && renderProductModal()}
      
      {/* Best seller tag for demonstration */}
      <div className="best-seller-tag">Best Seller</div>
      <div className="time-limited-tag">23:04h • 100% Left</div>
    </div>
  );
};

export default ProductsPage; 