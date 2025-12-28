import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faShoppingBag,
  faStar,
  faHeart,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import "./SearchPage.css";
import searchService from "../../services/searchService";
import config from "../../config/apiConfig";
import serviceBuilderService from "../../services/serviceBuilderService";

// Define a base64 encoded placeholder image to avoid external requests
const PLACEHOLDER_IMAGE_SMALL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMThweCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmaWxsPSIjOTk5OTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [serviceProducts, setServiceProducts] = useState({}); // Map serviceId -> products[]
  const [loadingServiceProducts, setLoadingServiceProducts] = useState({});
  const [totalResults, setTotalResults] = useState(0);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        console.log("Searching for query:", query);
        // Use the new global search API
        const searchResponse = await searchService.search(query, {
          type: "all",
          limit: 20,
        });

        console.log("Search response:", searchResponse);

        if (searchResponse && searchResponse.success) {
          const results = searchResponse.results || searchResponse.data || {};

          // Extract data from API response - handle different response formats
          let servicesList = results.services || searchResponse.services || [];
          let categoriesList =
            results.categories || searchResponse.categories || [];
          let productsList = results.products || searchResponse.products || [];

          // Format products to match expected structure
          productsList = productsList.map((product) => {
            return {
              id: product.id,
              name: product.name || "",
              price: parseFloat(product.price) || 0,
              originalPrice: product.original_price
                ? parseFloat(product.original_price)
                : null,
              description: product.description || "",
              image:
                product.primary_image_url ||
                (Array.isArray(product.image_urls) &&
                product.image_urls.length > 0
                  ? product.image_urls[0]
                  : product.image || null),
              images: Array.isArray(product.image_urls)
                ? product.image_urls
                : [],
              category: product.category?.name || product.category || "",
              categoryId: product.category?.id || product.category_id || "",
              vendor:
                product.vendor_profile?.business_name || product.vendor || "",
              rating: product.rating || 0,
              reviewCount:
                product.review_count ||
                (Array.isArray(product.reviews) ? product.reviews.length : 0),
              label: product.label || null,
              stockQuantity:
                product.stock_quantity !== undefined
                  ? product.stock_quantity
                  : null,
            };
          });

          console.log("Extracted results:", {
            servicesList,
            categoriesList,
            productsList,
          });

          setServices(servicesList);
          setCategories(categoriesList);
          setProducts(productsList);

          // Fetch products for each service
          if (servicesList.length > 0) {
            fetchServiceProducts(servicesList);
          }

          const total =
            servicesList.length + categoriesList.length + productsList.length;
          setTotalResults(
            searchResponse.total_results || searchResponse.total || total
          );
        } else {
          console.log("Search response not successful:", searchResponse);
          setServices([]);
          setCategories([]);
          setProducts([]);
          setTotalResults(0);
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        setServices([]);
        setCategories([]);
        setProducts([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (query && query.trim().length >= 1) {
      fetchSearchResults();
    } else {
      setIsLoading(false);
      setServices([]);
      setCategories([]);
      setProducts([]);
      setTotalResults(0);
    }
  }, [query]);

  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `${config.BACKEND_URL}${imagePath}`;
    return `${config.BACKEND_URL}/storage/${imagePath}`;
  };

  // Get service image helper
  const getServiceImage = (service) => {
    return (
      service.main_image?.url ||
      service.preview_image_path ||
      service.preview_image_url ||
      service.image_path ||
      service.image ||
      null
    );
  };

  // Fetch products for services
  const fetchServiceProducts = async (servicesList) => {
    const productsMap = {};
    const loadingMap = {};

    // Initialize loading state
    servicesList.forEach((service) => {
      loadingMap[service.id] = true;
    });
    setLoadingServiceProducts(loadingMap);

    // Fetch products for each service
    const fetchPromises = servicesList.map(async (service) => {
      try {
        const serviceDetails = await serviceBuilderService.getServiceById(
          service.id
        );
        if (
          serviceDetails &&
          serviceDetails.success &&
          serviceDetails.service
        ) {
          const serviceData = serviceDetails.service;
          // Combine products from different sources
          const allProducts = [
            ...(serviceData.products || []),
            ...(serviceData.productsByTag?.flatMap(
              (tagGroup) => tagGroup.products || []
            ) || []),
            ...(serviceData.productsWithoutTags || []),
          ];
          productsMap[service.id] = allProducts;
        } else {
          productsMap[service.id] = [];
        }
      } catch (error) {
        console.error(
          `Error fetching products for service ${service.id}:`,
          error
        );
        productsMap[service.id] = [];
      } finally {
        loadingMap[service.id] = false;
      }
    });

    await Promise.all(fetchPromises);
    setServiceProducts(productsMap);
    setLoadingServiceProducts(loadingMap);
  };

  // Format price with currency
  const formatPrice = (price) => {
    try {
      if (price === null || price === undefined) {
        return "SAR 0.00";
      }

      const numericPrice =
        typeof price === "string" ? parseFloat(price) : price;

      if (isNaN(numericPrice)) {
        return "SAR 0.00";
      }

      return `SAR ${numericPrice.toFixed(2)}`;
    } catch (error) {
      return "SAR 0.00";
    }
  };

  // Calculate delivery date (example: tomorrow or specific date)
  const getDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
  };

  // Toggle wishlist function
  const toggleWishlist = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setWishlist((prev) => {
      const isInWishlist = prev.some((item) => item.id === product.id);
      let updated;
      if (isInWishlist) {
        updated = prev.filter((item) => item.id !== product.id);
      } else {
        updated = [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            label: product.label,
          },
        ];
      }
      localStorage.setItem("wishlist", JSON.stringify(updated));
      // Dispatch custom event to notify other components (like FavoritesPage)
      window.dispatchEvent(new Event("wishlistUpdated"));
      return updated;
    });
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1 className="search-title">
            نتائج البحث عن: <span className="highlight">{query}</span>
          </h1>
          <div className="search-stats">تم العثور على {totalResults} نتيجة</div>
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
                  <Link to="/products" className="browse-btn">
                    تصفح المنتجات
                  </Link>
                  <Link to="/services" className="browse-btn">
                    تصفح الخدمات
                  </Link>
                </div>
              </div>
            ) : (
              <div className="search-results">
                {/* Categories Section */}
                {categories.length > 0 && (
                  <div className="search-section">
                    <h2 className="section-title">
                      الفئات ({categories.length})
                    </h2>
                    <div className="categories-grid">
                      {categories.map((category) => {
                        const slug =
                          category.slug ||
                          (category.name
                            ? category.name.toLowerCase().replace(/\s+/g, "-")
                            : "category");
                        return (
                          <Link
                            to={`/services2/categories/${category.id}-${slug}`}
                            key={category.id}
                            className="category-card"
                          >
                            <div className="category-image">
                              {category.image_path || category.image ? (
                                <img
                                  src={getImageUrl(
                                    category.image_path || category.image
                                  )}
                                  alt={category.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = PLACEHOLDER_IMAGE_SMALL;
                                  }}
                                />
                              ) : (
                                <div className="service-image-placeholder">
                                  <FontAwesomeIcon icon={faShoppingBag} />
                                </div>
                              )}
                            </div>
                            <div className="category-content">
                              <h3 className="category-title">
                                {category.name}
                              </h3>
                              {category.description && (
                                <p className="category-description">
                                  {category.description}
                                </p>
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
                    <h2 className="section-title">
                      الخدمات ({services.length})
                    </h2>
                    {services.map((service) => {
                      const slug =
                        service.slug ||
                        (service.name
                          ? service.name.toLowerCase().replace(/\s+/g, "-")
                          : "service");
                      const serviceProductsList =
                        serviceProducts[service.id] || [];
                      const isLoadingProducts =
                        loadingServiceProducts[service.id];

                      return (
                        <div key={service.id} className="service-with-products">
                          <Link
                            to={`/services2/${service.id}-${slug}`}
                            className="service-card"
                          >
                            <div className="service-image">
                              {getServiceImage(service) ? (
                                <img
                                  src={serviceBuilderService.getImageUrl(
                                    getServiceImage(service)
                                  )}
                                  alt={service.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = PLACEHOLDER_IMAGE_SMALL;
                                  }}
                                />
                              ) : (
                                <div className="service-image-placeholder">
                                  <FontAwesomeIcon icon={faShoppingBag} />
                                </div>
                              )}
                            </div>
                            <div className="service-content">
                              <h3 className="service-title">{service.name}</h3>
                              {service.category && (
                                <p className="service-category">
                                  {service.category.name}
                                </p>
                              )}
                              {service.description && (
                                <p className="service-description">
                                  {service.description.substring(0, 100)}...
                                </p>
                              )}
                              {service.base_price > 0 && (
                                <div className="service-price">
                                  <span className="price-value">
                                    {service.base_price} درهم
                                  </span>
                                </div>
                              )}
                            </div>
                          </Link>

                          {/* Service Products */}
                          {isLoadingProducts ? (
                            <div className="service-products-loading">
                              <p>جاري تحميل المنتجات...</p>
                            </div>
                          ) : serviceProductsList.length > 0 ? (
                            <div className="service-products-section">
                              <h3 className="service-products-title">
                                منتجات {service.name}
                              </h3>
                              <div className="products-grid">
                                {serviceProductsList.map((product) => {
                                  const productImage =
                                    product.image_url ||
                                    product.image_path ||
                                    product.image ||
                                    null;
                                  const productPrice =
                                    product.unit_price || product.price || 0;

                                  return (
                                    <Link
                                      to={`/products/${product.id}`}
                                      key={product.id}
                                      className="product-card"
                                    >
                                      <div className="product-image-container">
                                        {productImage ? (
                                          <img
                                            src={
                                              productImage.startsWith("http")
                                                ? productImage
                                                : serviceBuilderService.getImageUrl(
                                                    productImage
                                                  )
                                            }
                                            alt={product.name}
                                            className="product-image"
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src =
                                                PLACEHOLDER_IMAGE_SMALL;
                                            }}
                                          />
                                        ) : (
                                          <div className="product-image-placeholder">
                                            <FontAwesomeIcon
                                              icon={faShoppingBag}
                                            />
                                          </div>
                                        )}
                                      </div>
                                      <div className="product-details">
                                        <h4 className="product-name">
                                          {product.name}
                                        </h4>
                                        {product.description && (
                                          <p className="product-description">
                                            {product.description.substring(
                                              0,
                                              60
                                            )}
                                            {product.description.length > 60
                                              ? "..."
                                              : ""}
                                          </p>
                                        )}
                                        <div className="product-price-section">
                                          <span className="price-value">
                                            {productPrice.toLocaleString(
                                              "en-US"
                                            )}
                                          </span>
                                          <span className="price-currency">
                                            {" "}
                                            درهم
                                          </span>
                                        </div>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Products Section */}
                {products.length > 0 && (
                  <div className="search-section">
                    <h2 className="section-title">
                      المنتجات ({products.length})
                    </h2>
                    <div className="products-grid">
                      {products.map((product) => (
                        <Link
                          to={`/products/${product.id}`}
                          key={product.id}
                          className="product-card"
                        >
                          <div className="product-image-container">
                            {product.image ? (
                              <img
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = PLACEHOLDER_IMAGE_SMALL;
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <div className="product-image-placeholder">
                                <FontAwesomeIcon icon={faShoppingCart} />
                              </div>
                            )}

                            {/* Product Label Badge */}
                            {product.label && (
                              <span className="product-badge product-label-badge">
                                {product.label}
                              </span>
                            )}

                            {/* Discount Badge */}
                            {product.originalPrice &&
                              product.originalPrice > product.price && (
                                <span className="product-badge discount-badge">
                                  {Math.round(
                                    ((product.originalPrice - product.price) /
                                      product.originalPrice) *
                                      100
                                  )}
                                  % OFF
                                </span>
                              )}

                            {/* Out of Stock Badge */}
                            {(product.stockQuantity === 0 ||
                              product.stockQuantity === null) && (
                              <span className="product-badge out-of-stock-badge">
                                نفذت الكمية
                              </span>
                            )}

                            {/* Wishlist Button */}
                            <button
                              className={`product-wishlist-btn ${
                                isInWishlist(product.id) ? "active" : ""
                              }`}
                              onClick={(e) => toggleWishlist(product, e)}
                              title={
                                isInWishlist(product.id)
                                  ? "إزالة من المفضلة"
                                  : "إضافة للمفضلة"
                              }
                            >
                              <FontAwesomeIcon icon={faHeart} />
                            </button>
                          </div>
                          <div className="product-content">
                            <h3 className="product-title">{product.name}</h3>
                            {product.description && (
                              <p className="product-description">
                                {product.description.substring(0, 80)}...
                              </p>
                            )}

                            {/* Rating Section */}
                            {(product.rating > 0 ||
                              product.reviewCount > 0) && (
                              <div className="product-rating-section">
                                <span className="review-count">
                                  ({product.reviewCount || 0})
                                </span>
                                <span className="rating-value">
                                  {(product.rating || 0).toFixed(1)}
                                </span>
                                <FontAwesomeIcon
                                  icon={faStar}
                                  className="rating-star"
                                />
                              </div>
                            )}

                            <div className="product-price-section">
                              <div className="product-price">
                                {product.originalPrice &&
                                  product.originalPrice > product.price && (
                                    <span className="product-original-price">
                                      {product.originalPrice.toLocaleString(
                                        "en-US",
                                        {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0,
                                        }
                                      )}
                                    </span>
                                  )}
                                <span className="price-currency">درهم</span>
                                <span className="price-value">
                                  {(product.price || 0).toLocaleString(
                                    "en-US",
                                    {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }
                                  )}
                                </span>
                              </div>
                            </div>
                            {/* Delivery Information */}
                            <div className="product-delivery-info">
                              <div className="delivery-availability">
                                <FontAwesomeIcon
                                  icon={faShoppingBag}
                                  className="delivery-icon"
                                />
                                <span>بتخلص بسرعة</span>
                              </div>
                              <div className="delivery-express">
                                <FontAwesomeIcon
                                  icon={faBolt}
                                  className="delivery-lightning-icon"
                                />
                                <span>يوصلك في {getDeliveryDate()}</span>
                              </div>
                            </div>
                            {product.tags && product.tags.length > 0 && (
                              <div className="product-tags">
                                {product.tags.slice(0, 2).map((tag) => (
                                  <span key={tag.id} className="tag">
                                    {tag.name}
                                  </span>
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
