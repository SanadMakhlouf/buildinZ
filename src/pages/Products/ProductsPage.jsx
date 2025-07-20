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
  const [visibleProducts, setVisibleProducts] = useState(12);

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
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
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
            onClick={(e) => {
              e.stopPropagation();
              // Add to cart logic here
              console.log('Added to cart:', product.id);
            }}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            أضف للسلة
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
        <div className="products-content">
          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <>
              <div 
                className="products-grid" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(5, 1fr)', 
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
              <p>Try again later</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage; 