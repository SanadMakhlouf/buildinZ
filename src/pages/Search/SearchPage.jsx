import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './SearchPage.css';
import productService from '../../services/productService';
import { searchServices } from '../../services/serviceService';

// Define a base64 encoded placeholder image to avoid external requests
const PLACEHOLDER_IMAGE_SMALL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjOTk5OTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        // Search for products and services in parallel
        const [productsResponse, servicesData] = await Promise.all([
          productService.searchProducts(query),
          searchServices(query)
        ]);
        
        // Extract products from the response based on the API structure
        let productsData = [];
        if (productsResponse && productsResponse.data) {
          // Handle different response structures
          if (Array.isArray(productsResponse.data)) {
            productsData = productsResponse.data;
          } else if (productsResponse.data.products) {
            productsData = productsResponse.data.products;
          }
        }
        
        setProducts(productsData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchSearchResults();
    } else {
      setIsLoading(false);
    }
  }, [query]);

  // Format price with currency
  const formatPrice = (price) => {
    try {
      if (price === null || price === undefined) {
        return 'SAR 0.00';
      }
      
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      
      if (isNaN(numericPrice)) {
        return 'SAR 0.00';
      }
      
      return `SAR ${numericPrice.toFixed(2)}`;
    } catch (error) {
      return 'SAR 0.00';
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1 className="search-title">نتائج البحث عن: <span className="highlight">{query}</span></h1>
          <div className="search-stats">
            تم العثور على {products.length + services.length} نتيجة
          </div>
        </div>

        {isLoading ? (
          <div className="search-loading">
            <div className="spinner"></div>
            <p>جاري البحث...</p>
          </div>
        ) : (
          <>
            {products.length === 0 && services.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h2>لم يتم العثور على نتائج</h2>
                <p>حاول استخدام كلمات مفتاحية مختلفة أو تصفح الفئات</p>
                <div className="search-actions">
                  <Link to="/products" className="browse-btn">تصفح المنتجات</Link>
                  <Link to="/services" className="browse-btn">تصفح الخدمات</Link>
                </div>
              </div>
            ) : (
              <div className="search-results">
                {services.length > 0 && (
                  <div className="search-section">
                    <h2 className="section-title">الخدمات</h2>
                    <div className="services-grid">
                      {services.map(service => (
                        <Link to={`/services/${service.categoryId}/${service.id}`} key={service.id} className="service-card">
                          <div className="service-image">
                            <img src={service.image} alt={service.name} />
                          </div>
                          <div className="service-content">
                            <h3 className="service-title">{service.name}</h3>
                            <p className="service-category">{service.categoryName}</p>
                            <div className="service-price">
                              <span className="price-value">{service.price} درهم</span>
                              {service.discountedPrice && (
                                <span className="original-price">{service.originalPrice} درهم</span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {products.length > 0 && (
                  <div className="search-section">
                    <h2 className="section-title">المنتجات</h2>
                    <div className="products-grid">
                      {products.map(product => (
                        <Link to={`/products/${product.id}`} key={product.id} className="product-card">
                          <div className="product-image">
                            <img 
                              src={product.primary_image_url || 
                                (product.images && product.images.length > 0 ? 
                                  product.images[0] : 
                                  PLACEHOLDER_IMAGE_SMALL)} 
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = PLACEHOLDER_IMAGE_SMALL;
                              }}
                            />
                            {product.discountPercentage > 0 && (
                              <div className="discount-badge">{product.discountPercentage}% خصم</div>
                            )}
                          </div>
                          <div className="product-content">
                            <h3 className="product-title">{product.name}</h3>
                            <p className="product-category">
                              {product.category?.name || product.category || ''}
                            </p>
                            <div className="product-price">
                              <span className="price-value">
                                {formatPrice(product.price)}
                              </span>
                              {product.discountPercentage > 0 && (
                                <span className="original-price">
                                  {Math.round(product.price / (1 - product.discountPercentage / 100))} درهم
                                </span>
                              )}
                            </div>
                            {product.rating && (
                              <div className="product-rating">
                                <i className="fas fa-star"></i>
                                <span>{product.rating}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 