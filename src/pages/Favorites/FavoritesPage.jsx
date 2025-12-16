import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShoppingCart,
  faStar,
  faTruck,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../../context/CartContext";
import config from "../../config/apiConfig";
import "./FavoritesPage.css";

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsData, setProductsData] = useState({});

  useEffect(() => {
    // Fetch products data to get descriptions
    const fetchProductsData = async () => {
      try {
        const response = await fetch(`${config.BACKEND_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.products) {
            const productsMap = {};
            data.data.products.forEach((product) => {
              productsMap[product.id] = {
                description: product.description || "",
                rating: product.reviews?.length > 0
                  ? product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length
                  : 0,
                reviewCount: product.reviews?.length || 0,
                originalPrice: product.original_price ? parseFloat(product.original_price) : null,
              };
            });
            setProductsData(productsMap);
          }
        }
      } catch (error) {
        console.error("Error fetching products data:", error);
      }
    };

    fetchProductsData();

    // Load wishlist from localStorage
    const loadWishlist = () => {
      try {
        const saved = localStorage.getItem("wishlist");
        const savedWishlist = saved ? JSON.parse(saved) : [];
        setWishlist(savedWishlist);
      } catch (error) {
        console.error("Error loading wishlist:", error);
        setWishlist([]);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();

    // Listen for storage changes (when wishlist is updated from other pages)
    const handleStorageChange = (e) => {
      if (e.key === "wishlist") {
        loadWishlist();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom event (for same-tab updates)
    const handleWishlistUpdate = () => {
      loadWishlist();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
    };
  }, []);

  // Remove from wishlist
  const removeFromWishlist = (productId) => {
    setWishlist((prev) => {
      const updated = prev.filter((item) => item.id !== productId);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("wishlistUpdated"));
      return updated;
    });
  };

  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) return `${config.BACKEND_URL}${imagePath}`;
    return `${config.BACKEND_URL}/storage/${imagePath}`;
  };

  // Calculate delivery date
  const getDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
  };

  // Format review count
  const formatReviewCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-container">
          <div className="loading-container">
            <FontAwesomeIcon icon={faHeart} spin className="loading-icon" />
            <p>جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <div className="favorites-header">
          <h1>
            <FontAwesomeIcon icon={faHeart} className="header-icon" />
            المفضلة
          </h1>
          <p className="favorites-count">
            {wishlist.length} {wishlist.length === 1 ? "منتج" : "منتجات"}
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-favorites">
            <div className="empty-icon">
              <FontAwesomeIcon icon={faHeart} />
            </div>
            <h2>قائمة المفضلة فارغة</h2>
            <p>ابدأ بإضافة المنتجات التي تحبها إلى قائمة المفضلة</p>
            <button
              className="browse-products-btn"
              onClick={() => navigate("/products")}
            >
              تصفح المنتجات
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {wishlist.map((product) => {
              const imageUrl = getImageUrl(product.image);
              const originalPrice = productsData[product.id]?.originalPrice || product.originalPrice;
              const discount =
                originalPrice && product.price
                  ? Math.round(
                      ((originalPrice - product.price) / originalPrice) * 100
                    )
                  : 0;

              return (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() =>
                    navigate(
                      `/products/${product.id}/${product.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^-\w\u0600-\u06FF]+/g, "")}`
                    )
                  }
                >
                  <div className="product-image-container">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="product-image-placeholder">
                        <FontAwesomeIcon icon={faShoppingCart} />
                      </div>
                    )}

                    {/* Product Label */}
                    {product.label && (
                      <span className="product-badge product-label-badge">
                        {product.label}
                      </span>
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <span className="product-badge discount-badge">
                        {discount}% OFF
                      </span>
                    )}

                    {/* Remove from Wishlist Button */}
                    <button
                      className="product-wishlist-btn active"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(product.id);
                      }}
                      title="إزالة من المفضلة"
                    >
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                  </div>

                  <div className="product-details">
                    <h3 className="product-name">
                      {product.name || "منتج بدون اسم"}
                    </h3>
                    {productsData[product.id]?.description && (
                      <p className="product-description">
                        {productsData[product.id].description}
                      </p>
                    )}

                    {/* Rating Section */}
                    <div className="product-rating-section">
                      <span className="review-count">
                        ({formatReviewCount(productsData[product.id]?.reviewCount || 0)})
                      </span>
                      <span className="rating-value">
                        {(productsData[product.id]?.rating || 0).toFixed(1)}
                      </span>
                      <FontAwesomeIcon icon={faStar} className="rating-star" />
                    </div>

                    {/* Price Section */}
                    <div className="product-price-section">
                      {discount > 0 && (
                        <span className="discount-percentage">{discount}%</span>
                      )}
                      <div className="product-price">
                        {productsData[product.id]?.originalPrice &&
                          product.price &&
                          productsData[product.id].originalPrice > product.price && (
                            <span className="product-original-price">
                              {productsData[product.id].originalPrice.toLocaleString("en-US", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          )}
                        <span className="price-currency">درهم</span>
                        <span className="price-value">
                          {(product.price || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="product-delivery-info">
                      <div className="delivery-free">
                        <FontAwesomeIcon icon={faTruck} className="delivery-icon" />
                        <span>التوصيل مجانا</span>
                      </div>
                      <div className="delivery-express">
                        express Get it by {getDeliveryDate()}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      className="add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(
                          {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                          },
                          1
                        );
                      }}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} />
                      إضافة إلى السلة
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

