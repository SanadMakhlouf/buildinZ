import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './SearchPage.css';
import searchService from '../../services/searchService';

// Define a base64 encoded placeholder image to avoid external requests
const PLACEHOLDER_IMAGE_SMALL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjOTk5OTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        // Use the new global search API
        const searchResponse = await searchService.search(query, { type: 'all', limit: 20 });
        
        if (searchResponse && searchResponse.success) {
          const { results } = searchResponse;
          
          // Extract data from API response
          setServices(results.services || []);
          setCategories(results.categories || []);
          setProducts(results.products || []);
          setTotalResults(searchResponse.total_results || 0);
        } else {
          setServices([]);
          setCategories([]);
          setProducts([]);
          setTotalResults(0);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setServices([]);
        setCategories([]);
        setProducts([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (query && query.length >= 2) {
      fetchSearchResults();
    } else {
      setIsLoading(false);
      setServices([]);
      setCategories([]);
      setProducts([]);
      setTotalResults(0);
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
            تم العثور على {totalResults} نتيجة
          </div>
        </div>

        {isLoading ? (
          <div className="search-loading">
            <div className="spinner"></div>
            <p>جاري البحث...</p>
          </div>
        ) : (
          <>
            {totalResults === 0 ? (
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
                {/* Categories Section */}
                {categories.length > 0 && (
                  <div className="search-section">
                    <h2 className="section-title">الفئات ({categories.length})</h2>
                    <div className="categories-grid">
                      {categories.map(category => {
                        const slug = category.slug || (category.name ? category.name.toLowerCase().replace(/\s+/g, '-') : 'category');
                        return (
                        <Link to={`/services2/categories/${category.id}-${slug}`} key={category.id} className="category-card">
                          <div className="category-image">
                            <img 
                              src={category.image_path || PLACEHOLDER_IMAGE_SMALL} 
                              alt={category.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PLACEHOLDER_IMAGE_SMALL;
                              }}
                            />
                          </div>
                          <div className="category-content">
                            <h3 className="category-title">{category.name}</h3>
                            {category.description && (
                              <p className="category-description">{category.description}</p>
                            )}
                            <div className="category-count">
                              {category.services_count} خدمة
                            </div>
                          </div>
                        </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Services Section */}
                {services.length > 0 && (
                  <div className="search-section">
                    <h2 className="section-title">الخدمات ({services.length})</h2>
                    <div className="services-grid">
                      {services.map(service => {
                        const slug = service.slug || (service.name ? service.name.toLowerCase().replace(/\s+/g, '-') : 'service');
                        return (
                        <Link to={`/services2/${service.id}-${slug}`} key={service.id} className="service-card">
                          <div className="service-image">
                            <img 
                              src={service.preview_image_path || PLACEHOLDER_IMAGE_SMALL} 
                              alt={service.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PLACEHOLDER_IMAGE_SMALL;
                              }}
                            />
                          </div>
                          <div className="service-content">
                            <h3 className="service-title">{service.name}</h3>
                            {service.category && (
                              <p className="service-category">{service.category.name}</p>
                            )}
                            {service.description && (
                              <p className="service-description">{service.description.substring(0, 100)}...</p>
                            )}
                            {service.base_price > 0 && (
                              <div className="service-price">
                                <span className="price-value">{service.base_price} درهم</span>
                              </div>
                            )}
                          </div>
                        </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Products Section */}
                {products.length > 0 && (
                  <div className="search-section">
                    <h2 className="section-title">المنتجات ({products.length})</h2>
                    <div className="products-grid">
                      {products.map(product => (
                        <Link to={`/products/${product.id}`} key={product.id} className="product-card">
                          <div className="product-image">
                            <img 
                              src={product.image || PLACEHOLDER_IMAGE_SMALL} 
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = PLACEHOLDER_IMAGE_SMALL;
                              }}
                            />
                          </div>
                          <div className="product-content">
                            <h3 className="product-title">{product.name}</h3>
                            {product.description && (
                              <p className="product-description">{product.description.substring(0, 80)}...</p>
                            )}
                            <div className="product-price">
                              <span className="price-value">{product.price} درهم</span>
                              {product.unit && <span className="product-unit">/ {product.unit}</span>}
                            </div>
                            {product.tags && product.tags.length > 0 && (
                              <div className="product-tags">
                                {product.tags.slice(0, 2).map(tag => (
                                  <span key={tag.id} className="tag">{tag.name}</span>
                                ))}
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