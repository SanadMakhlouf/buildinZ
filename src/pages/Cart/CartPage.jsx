import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faPlus, 
  faMinus, 
  faShoppingCart, 
  faArrowLeft,
  faShoppingBag,
  faHeart,
  faTruck,
  faTag,
  faTimes,
  faStar,
  faBolt,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';
import config from '../../config/apiConfig';
import './CartPage.css';
import '../../pages/Home/HomePage.css';

const CartPage = () => {
  const { 
    cart, 
    cartTotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();
  
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Helper functions from HomePage
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/')) {
      return `${config.BACKEND_URL}${imagePath}`;
    }
    return `${config.BACKEND_URL}/${imagePath}`;
  };

  const getRandomRating = (productId) => {
    // Deterministic random based on product ID
    const seed = productId * 0.618;
    return (4.6 + (seed % 0.4)).toFixed(1);
  };

  const getRandomReviewCount = (productId) => {
    // Deterministic random based on product ID
    const seed = productId * 0.314;
    return Math.floor(10 + (seed % 490));
  };

  const formatReviewCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("ar-SA", {
      day: "numeric",
      month: "long",
    });
  };

  const slugify = (text = "", fallback = "") => {
    const base = text && text.toString().trim();
    const cleaned = base
      ? base
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^-\w\u0600-\u06FF]+/g, "")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "")
      : "";
    return cleaned || fallback;
  };

  const toggleWishlist = (product) => {
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
      window.dispatchEvent(new Event("wishlistUpdated"));
      return updated;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch(`${config.BACKEND_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Handle both direct array and nested products structure
            const productsArray = Array.isArray(data.data) 
              ? data.data 
              : (data.data.products || []);
            
            // Filter out products already in cart and unavailable products
            const cartProductIds = cart.map(item => item.id);
            const filtered = productsArray
              .filter(product => {
                const productId = product.id;
                const stockQty = product.stock_quantity || product.stockQuantity || 0;
                return !cartProductIds.includes(productId) &&
                       stockQty > 0 &&
                       stockQty !== null;
              })
              .slice(0, 12); // Get 12 related products
            
            // Format products to match expected structure
            const formatted = filtered.map(product => ({
              id: product.id,
              name: product.name,
              price: parseFloat(product.price) || 0,
              originalPrice: product.original_price ? parseFloat(product.original_price) : null,
              image: product.primary_image_url || product.image || (product.image_urls?.length > 0 ? product.image_urls[0] : null),
              images: product.image_urls || [],
              rating: product.reviews?.length > 0
                ? product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length
                : 0,
              reviewCount: product.reviews?.length || 0,
              stockQuantity: product.stock_quantity || product.stockQuantity || 0,
              label: product.label || null,
              vendor: product.vendor || '',
              category: product.category?.name || product.category || ''
            }));
            
            setRelatedProducts(formatted);
          }
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (cart.length > 0) {
      fetchRelatedProducts();
    }
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="cart-page empty">
        <div className="container">
          <div className="empty-cart-message">
            <div className="empty-cart-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <h2>سلة التسوق فارغة</h2>
            <p>لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.</p>
            <Link to="/products" className="continue-shopping-btn">
              <FontAwesomeIcon icon={faArrowLeft} />
              استمر في التسوق
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleApplyPromo = () => {
    // TODO: Implement promo code logic
    setShowPromoInput(false);
  };

  const calculateDiscount = (originalPrice, currentPrice) => {
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const getDeliveryTime = () => {
    // Random delivery time for demo
    const hours = Math.floor(Math.random() * 2) + 1;
    const minutes = Math.floor(Math.random() * 60);
    return `${hours} ساعة و ${minutes} دقيقة`;
  };

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch(`${config.BACKEND_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Handle both direct array and nested products structure
            const productsArray = Array.isArray(data.data) 
              ? data.data 
              : (data.data.products || []);
            
            // Filter out products already in cart and unavailable products
            const cartProductIds = cart.map(item => item.id);
            const filtered = productsArray
              .filter(product => {
                const productId = product.id;
                const stockQty = product.stock_quantity || product.stockQuantity || 0;
                return !cartProductIds.includes(productId) &&
                       stockQty > 0 &&
                       stockQty !== null;
              })
              .slice(0, 12); // Get 12 related products
            
            // Format products to match expected structure
            const formatted = filtered.map(product => ({
              id: product.id,
              name: product.name,
              price: parseFloat(product.price) || 0,
              originalPrice: product.original_price ? parseFloat(product.original_price) : null,
              image: product.primary_image_url || product.image || (product.image_urls?.length > 0 ? product.image_urls[0] : null),
              images: product.image_urls || [],
              rating: product.reviews?.length > 0
                ? product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length
                : 0,
              reviewCount: product.reviews?.length || 0,
              stockQuantity: product.stock_quantity || product.stockQuantity || 0,
              label: product.label || null,
              vendor: product.vendor || '',
              category: product.category?.name || product.category || ''
            }));
            
            setRelatedProducts(formatted);
          }
        }
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (cart.length > 0) {
      fetchRelatedProducts();
    }
  }, [cart]);

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-page-header">
          <h1>عربة التسوق ({cartTotal.items} منتج)</h1>
        </div>
        
        <div className="cart-page-content">
          {/* Right Column - Cart Items */}
          <div className="cart-items-container">
            {cart.map(item => {
              const originalPrice = item.originalPrice || item.price * 1.4;
              const discount = calculateDiscount(originalPrice, item.price);
              
              return (
                <div className="cart-item-card" key={item.id}>
                  <div className="cart-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="no-image"></div>
                    )}
                  </div>
                  
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">{item.name}</h3>
                    
                    <div className="cart-item-delivery">
                      <span className="delivery-time">
                        اطلب في غضون {getDeliveryTime()} احصل عليها اليوم
                      </span>
                    </div>
                    
                    <div className="cart-item-seller">
                      يتم البيع عبر {item.vendor || 'نون'}
                    </div>
                    
                   
                    
                    <div className="cart-item-actions">
                      
                     
                    </div>
                  </div>
                  
                  <div className="cart-item-pricing">
                    <div className="price-section">
                      <div className="current-price">{item.price.toFixed(0)} د.إ</div>
                     
                    </div>
                    
                    <div className="delivery-type">
                      <span className="delivery-tag express">إكسبرس</span>
                    </div>
                    
                    
                    
                    <div className="quantity-section">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button 
                          className="quantity-btn" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Left Column - Order Summary */}
          <div className="cart-summary">
            <h2>ملخص الطلب</h2>
            
            <div className="promo-section">
              {!showPromoInput ? (
                <div className="promo-input-wrapper">
                  <input
                    type="text"
                    placeholder="ادخل الكود"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="promo-input"
                  />
                  <button 
                    className="apply-promo-btn"
                    onClick={handleApplyPromo}
                  >
                    تطبيق
                  </button>
                </div>
              ) : (
                <div className="promo-applied">
                  <span>تم تطبيق الكود</span>
                  <button onClick={() => setShowPromoInput(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              )}
              <Link to="#" className="view-offers-link">
                <FontAwesomeIcon icon={faTag} />
                مشاهدة العروض المتاحة
              </Link>
            </div>
            
            <div className="summary-section">
              <div className="summary-row">
                <span className="summary-label">المجموع الفرعي ({cartTotal.items} منتجات)</span>
                <span className="summary-value">{cartTotal.price.toFixed(2)} د.إ</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">رسوم الشحن one</span>
                <span className="summary-value free">مجاناً</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">رسوم سوبر مول</span>
                <span className="summary-value free">مجاناً</span>
              </div>
              
              <div className="summary-row total-row">
                <span className="summary-label">المجموع (شامل ضريبة القيمة المضافة)</span>
                <span className="summary-value">{(cartTotal.price * 1.05).toFixed(2)} د.إ</span>
              </div>
            </div>
            
            <div className="payment-plans">
              <div className="payment-plans-header">
                <span>خطط الدفع الشهرية تبدأ من 250 د.إ</span>
              </div>
              <Link to="#" className="payment-plans-link">عرض المزيد من التفاصيل</Link>
            </div>
            
            <div className="checkout-actions">
              <button onClick={handleCheckout} className="checkout-btn">
                صفحة الدفع
              </button>
            </div>
            
            <div className="credit-card-offer">
              <p>
                استمتع برصيد مسترجع 5% باستخدام بطاقة المشرق نون الائتمانية. تطبق الشروط والأحكام.
              </p>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="cart-related-products">
            <div className="cart-related-products-header">
              <h2>منتجات ذات صلة</h2>
            </div>
            <div className="noon-services-grid">
              {relatedProducts.map((product) => {
                const imageUrl = product.image ? getImageUrl(product.image) : null;
                const discount =
                  product.originalPrice &&
                  product.price &&
                  product.originalPrice > product.price
                    ? Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={product.id}
                    className="homepage-product-card"
                    onClick={() =>
                      navigate(
                        `/products/${product.id}/${slugify(
                          product.name,
                          `product-${product.id}`
                        )}`
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

                      {/* Label Badge */}
                      {product.label && (
                        <span className="product-badge product-label-badge">
                          {product.label}
                        </span>
                      )}

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <span className="product-badge discount-badge">
                          {discount}%
                        </span>
                      )}

                      {/* Wishlist Button */}
                      <button
                        className={`product-wishlist-btn ${
                          isInWishlist(product.id) ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        title={
                          isInWishlist(product.id)
                            ? "إزالة من المفضلة"
                            : "إضافة للمفضلة"
                        }
                      >
                        <FontAwesomeIcon icon={faHeart} />
                      </button>

                      {/* Add to Cart Button - Bottom Left */}
                      <button
                        className="homepage-product-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          const cartProduct = {
                            id: product.id,
                            name: product.name,
                            price: parseFloat(product.price),
                            image: imageUrl || null,
                            vendor: product.vendor || '',
                            stockQuantity: product.stockQuantity || 0,
                            category: product.category || ''
                          };
                          addToCart(cartProduct, 1);
                          const button = e.currentTarget;
                          if (button) {
                            button.classList.add('clicked');
                            setTimeout(() => {
                              button.classList.remove('clicked');
                            }, 600);
                          }
                        }}
                        title="إضافة إلى السلة"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>

                    <div className="homepage-product-details">
                      <h3 className="product-name">
                        {product.name || "منتج بدون اسم"}
                      </h3>

                      {/* Rating Section */}
                      <div className="product-rating-section">
                        <span className="rating-value">
                          {product.reviewCount === 0 || !product.reviewCount
                            ? getRandomRating(product.id)
                            : (product.rating || 0).toFixed(1)}
                        </span>
                        <FontAwesomeIcon
                          icon={faStar}
                          className="rating-star"
                        />
                        <span className="review-count">
                          ({formatReviewCount(
                            product.reviewCount === 0 || !product.reviewCount
                              ? getRandomReviewCount(product.id)
                              : product.reviewCount || 0
                          )})
                        </span>
                      </div>

                      {/* Price Section */}
                      <div className="product-price-section">
                        <div className="product-price">
                          {product.originalPrice &&
                            product.price &&
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
                            {(product.price || 0).toLocaleString("en-US", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                          </span>
                          {discount > 0 && (
                            <span className="discount-percentage">
                              {discount}%
                            </span>
                          )}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
