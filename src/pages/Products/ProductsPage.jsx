import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar,
  faSpinner,
  faExclamationTriangle,
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);

  const navigate = useNavigate();

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
      
      if (responseData.success && responseData.data && Array.isArray(responseData.data.products)) {
        const productsArray = responseData.data.products;
        
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
                  'https://via.placeholder.com/300x300?text=No+Image'),
          stockQuantity: product.stock_quantity || 0,
          dimensions: product.dimensions || '',
          specifications: product.specifications || '',
          rating: 4.8 // Since API doesn't provide ratings, using a standard value
        }));
        
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
        
        // Extract unique categories from API data
        const uniqueCategories = [...new Set(productsArray
          .filter(p => p.category && p.category.name)
          .map(p => ({ id: p.category.id, name: p.category.name }))
        )];
        const categoriesWithAll = [{ id: '', name: 'All' }, ...uniqueCategories];
        setCategories(categoriesWithAll);
        
        // Extract unique vendors from API data
        const uniqueVendors = [...new Set(productsArray
          .filter(p => p.vendor_profile && p.vendor_profile.business_name)
          .map(p => ({ id: p.vendor_profile.id, name: p.vendor_profile.business_name }))
        )];
        setVendors(uniqueVendors);
        
      } else {
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

  // Filter products
  useEffect(() => {
    if (!Array.isArray(products) || products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Category filter
    if (selectedCategory && selectedCategory !== '') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Vendor filter
    if (selectedVendors.length > 0) {
      filtered = filtered.filter(product => selectedVendors.includes(product.vendorId));
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Sorting
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
      default: // popular
        filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(filtered);
  }, [products, sortBy, selectedCategory, selectedVendors, priceRange]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle vendor filter change
  const handleVendorChange = (vendorId) => {
    setSelectedVendors(prev => {
      if (prev.includes(vendorId)) {
        return prev.filter(id => id !== vendorId);
      } else {
        return [...prev, vendorId];
      }
    });
  };

  // Product card component
  const ProductCard = ({ product }) => {
    const handleImageError = (e) => {
      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
    };
    
    const handleCardClick = () => {
      navigate(`/products/${product.id}`);
    };
    
    return (
      <div className="product-card" onClick={handleCardClick}>
        <div className="product-image-container">
          <div className="rating-badge">
            <FontAwesomeIcon icon={faStar} className="rating-star" />
            {product.rating}
          </div>
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-image" 
            onError={handleImageError} 
          />
        </div>
        
        <div className="product-info">
          <h3 className="product-title">{product.name}</h3>
          
          {product.dimensions && (
            <div className="product-specs">{product.dimensions} • Natural finish</div>
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
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
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
          <button className="retry-btn" onClick={fetchProducts}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        {/* Header */}
        <div className="marketplace-header">
          <h1>Shop Marketplace</h1>
          <p>Premium materials and décor for your projects</p>
        </div>

        {/* Top Controls */}
        <div className="top-controls">
          <div className="sort-dropdown">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="popular">Sort by: Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="main-layout">
          {/* Sidebar */}
          <div className="sidebar">
            <h2>Filters</h2>
            
            {/* Categories */}
            <div className="filter-group">
              <h3>Categories</h3>
              <div className="filter-options">
                <div className="filter-option">
                  <input type="checkbox" id="wood-timber" />
                  <label htmlFor="wood-timber">Wood & Timber</label>
                </div>
                <div className="filter-option">
                  <input type="checkbox" id="tiles-marble" />
                  <label htmlFor="tiles-marble">Tiles & Marble</label>
                </div>
                <div className="filter-option">
                  <input type="checkbox" id="paint-coatings" />
                  <label htmlFor="paint-coatings">Paint & Coatings</label>
                </div>
                <div className="filter-option">
                  <input type="checkbox" id="lighting" />
                  <label htmlFor="lighting">Lighting</label>
                </div>
                <div className="filter-option">
                  <input type="checkbox" id="decor-items" />
                  <label htmlFor="decor-items">Décor Items</label>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <h3>Price Range</h3>
              <div className="price-range-container">
                <div className="price-slider">
                  <div 
                    className="price-track" 
                    style={{
                      left: `${(priceRange.min / 1000) * 100}%`,
                      width: `${((priceRange.max - priceRange.min) / 1000) * 100}%`
                    }}
                  ></div>
                </div>
                <div className="price-inputs">
                  <span className="price-label">AED {priceRange.min}</span>
                  <span className="price-label">AED {priceRange.max}+</span>
                </div>
              </div>
            </div>

            {/* Vendors */}
            {vendors.length > 0 && (
              <div className="filter-group">
                <h3>Vendors</h3>
                <div className="filter-options">
                  {vendors.map(vendor => (
                    <div className="filter-option" key={vendor.id}>
                      <input
                        type="checkbox"
                        id={`vendor-${vendor.id}`}
                        checked={selectedVendors.includes(vendor.id)}
                        onChange={() => handleVendorChange(vendor.id)}
                      />
                      <label htmlFor={`vendor-${vendor.id}`}>{vendor.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="apply-filters-btn">
              Apply Filters
            </button>
          </div>
          
          {/* Products Content */}
          <div className="products-content">
            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <h3>No products found</h3>
                <p>Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 