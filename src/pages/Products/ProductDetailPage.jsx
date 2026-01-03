import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faExclamationTriangle,
  faShoppingCart,
  faStar,
  faHeart,
  faStore,
  faCheckCircle,
  faTruck,
  faBox,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
  faPlus,
  faMinus,
  faBolt,
  faShieldAlt,
  faUndo,
  faCreditCard,
  faTag,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartOutline } from "@fortawesome/free-regular-svg-icons";
import { useCart } from "../../context/CartContext";
import productService from "../../services/productService";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState({});
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

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

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getProductById(productId);

        if (response.data && response.data.success) {
          setProduct(response.data.data.product);
          if (
            response.data.data.product.image_urls &&
            response.data.data.product.image_urls.length > 0
          ) {
            setSelectedImage(0);
          }
        } else {
          throw new Error("Failed to fetch product details");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message || "فشل في تحميل تفاصيل المنتج");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Check wishlist status
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wishlist");
      if (saved) {
        const wishlist = JSON.parse(saved);
        setIsWishlisted(wishlist.some(item => item.id === parseInt(productId)));
      }
    } catch {
      // ignore
    }
  }, [productId]);

  const handleImageError = (index) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  const increaseQuantity = () => {
    if (product && product.stock_quantity && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (product && product.stock_quantity > 0) {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image:
          product.primary_image_url ||
          (product.image_urls && product.image_urls.length > 0
            ? product.image_urls[0]
            : null),
        vendor: product.vendor_profile?.business_name || "",
        stockQuantity: product.stock_quantity || 0,
        category: product.category?.name || "",
      };

      addToCart(cartProduct, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleToggleWishlist = () => {
    try {
      const saved = localStorage.getItem("wishlist");
      let wishlist = saved ? JSON.parse(saved) : [];
      
      if (isWishlisted) {
        wishlist = wishlist.filter(item => item.id !== product.id);
      } else {
        wishlist.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.primary_image_url || (product.image_urls?.[0] || null),
          label: product.label || null,
        });
      }
      
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      window.dispatchEvent(new Event("wishlistUpdated"));
      setIsWishlisted(!isWishlisted);
    } catch {
      // ignore
    }
  };

  const calculateAverageRating = useCallback(() => {
    if (!product || !product.reviews || product.reviews.length === 0) return 0;
    const sum = product.reviews.reduce(
      (acc, review) => acc + (review.rating || 0),
      0
    );
    return sum / product.reviews.length;
  }, [product]);

  const averageRating = product ? calculateAverageRating() : 0;

  const nextImage = () => {
    if (product && availableImages.length > 0) {
      setSelectedImage((prev) => (prev + 1) % availableImages.length);
    }
  };

  const prevImage = () => {
    if (product && availableImages.length > 0) {
      setSelectedImage(
        (prev) => (prev - 1 + availableImages.length) % availableImages.length
      );
    }
  };

  const getDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString("ar-SA", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const getRandomRating = (id) => {
    const seed = id * 0.618;
    return (4.2 + (seed % 0.8)).toFixed(1);
  };

  const getRandomReviewCount = (id) => {
    const seed = id * 0.314;
    return Math.floor(15 + (seed % 485));
  };

  if (loading) {
    return (
      <div className="pdp-page">
        <div className="pdp-loading">
          <div className="pdp-loading-spinner">
            <FontAwesomeIcon icon={faSpinner} spin />
          </div>
          <p>جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pdp-page">
        <div className="pdp-error">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <h2>عذراً، حدث خطأ</h2>
          <p>{error || "لم يتم العثور على المنتج"}</p>
          <button onClick={() => navigate("/products")}>
            <FontAwesomeIcon icon={faArrowRight} />
            العودة للمنتجات
          </button>
        </div>
      </div>
    );
  }

  const availableImages =
    product.image_urls && product.image_urls.length > 0
      ? product.image_urls
      : product.primary_image_url
      ? [product.primary_image_url]
      : [];

  const discount =
    product.original_price &&
    parseFloat(product.original_price) > parseFloat(product.price)
      ? Math.round(
          ((parseFloat(product.original_price) - parseFloat(product.price)) /
            parseFloat(product.original_price)) *
            100
        )
      : 0;

  const displayRating = averageRating > 0 ? averageRating : getRandomRating(product.id);
  const displayReviewCount = product.reviews?.length > 0 ? product.reviews.length : getRandomReviewCount(product.id);

  // SEO Data
  const pageTitle = `${product.name} - ${product.category?.name || "منتج"} | BuildingZ`;
  const pageDescription = product.description 
    ? product.description.substring(0, 160) 
    : `اشتري ${product.name} من BuildingZ. أفضل الأسعار مع توصيل سريع في الإمارات.`;
  const pageUrl = `https://buildingzuae.com/products/${product.id}/${slugify(product.name, `product-${product.id}`)}`;
  const productImage = availableImages.length > 0 ? availableImages[0] : 'https://buildingzuae.com/og-image.jpg';
  const keywords = `${product.name}, ${product.category?.name || ''}, شراء ${product.name}, ${product.vendor?.name || ''}, مواد بناء, BuildingZ`;

  // JSON-LD Product Schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - متوفر في BuildingZ`,
    "image": availableImages,
    "sku": product.sku || product.id.toString(),
    "brand": {
      "@type": "Brand",
      "name": product.vendor?.name || "BuildingZ"
    },
    "offers": {
      "@type": "Offer",
      "url": pageUrl,
      "priceCurrency": "AED",
      "price": parseFloat(product.price),
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": product.vendor?.name || "BuildingZ UAE"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": displayRating,
      "reviewCount": displayReviewCount,
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  // JSON-LD Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": "https://buildingzuae.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "المنتجات",
        "item": "https://buildingzuae.com/products"
      },
      ...(product.category ? [{
        "@type": "ListItem",
        "position": 3,
        "name": product.category.name,
        "item": `https://buildingzuae.com/products?category=${product.category.id}`
      }] : []),
      {
        "@type": "ListItem",
        "position": product.category ? 4 : 3,
        "name": product.name
      }
    ]
  };

  return (
    <div className="pdp-page" dir="rtl">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="title" content={pageTitle} />
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        
        {/* Canonical */}
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={productImage} />
        <meta property="og:site_name" content="BuildingZ UAE" />
        <meta property="og:locale" content="ar_AE" />
        
        {/* Product OG Tags */}
        <meta property="product:price:amount" content={product.price} />
        <meta property="product:price:currency" content="AED" />
        <meta property="product:availability" content={product.stock_quantity > 0 ? "in stock" : "out of stock"} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={productImage} />
        
        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Breadcrumbs */}
      <div className="pdp-breadcrumbs">
        <div className="pdp-container">
          <button className="pdp-back-btn" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowRight} />
            رجوع
          </button>
          <div className="pdp-breadcrumb-trail">
            <span onClick={() => navigate("/")}>الرئيسية</span>
            <span className="separator">/</span>
            <span onClick={() => navigate("/products")}>المنتجات</span>
            {product.category && (
              <>
                <span className="separator">/</span>
                <span>{product.category.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pdp-container">
        <div className="pdp-main-content">
          {/* Images Section */}
          <div className="pdp-images-section">
            <div className="pdp-main-image">
              {discount > 0 && (
                <div className="pdp-discount-badge">
                  خصم {discount}%
                </div>
              )}
              
              <button
                className={`pdp-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleToggleWishlist}
                aria-label={isWishlisted ? "إزالة من المفضلة" : "إضافة للمفضلة"}
              >
                <FontAwesomeIcon icon={isWishlisted ? faHeart : faHeartOutline} />
              </button>

              {availableImages.length > 0 && !imageError[selectedImage] ? (
                <img
                  src={availableImages[selectedImage]}
                  alt={product.name}
                  onError={() => handleImageError(selectedImage)}
                />
              ) : (
                <div className="pdp-image-placeholder">
                  <FontAwesomeIcon icon={faBox} />
                  <span>لا توجد صورة</span>
                </div>
              )}

              {availableImages.length > 1 && (
                <>
                  <button className="pdp-image-nav pdp-image-nav-prev" onClick={prevImage}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                  <button className="pdp-image-nav pdp-image-nav-next" onClick={nextImage}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                </>
              )}
            </div>

            {availableImages.length > 1 && (
              <div className="pdp-thumbnails">
                {availableImages.map((url, index) => (
                  <button
                    key={index}
                    className={`pdp-thumbnail ${selectedImage === index ? 'active' : ''} ${imageError[index] ? 'error' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    {!imageError[index] ? (
                      <img
                        src={url}
                        alt={`${product.name} - ${index + 1}`}
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faBox} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="pdp-info-section">
           

            {/* Title */}
            <h1 className="pdp-title">{product.name}</h1>

            {/* Rating */}
            <div className="pdp-rating">
              <div className="pdp-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    className={star <= Math.round(parseFloat(displayRating)) ? 'filled' : ''}
                  />
                ))}
              </div>
              <span className="pdp-rating-value">{displayRating}</span>
              <span className="pdp-rating-count">({displayReviewCount} تقييم)</span>
            </div>

            {/* Price */}
            <div className="pdp-price-section">
              <div className="pdp-price-main">
                <span className="pdp-price-value">
                  {parseFloat(product.price)}
                </span>
                <span className="pdp-price-currency">درهم</span>
              </div>
              {discount > 0 && (
                <div className="pdp-price-old">
                  <span className="pdp-original-price">
                    {parseFloat(product.original_price).toLocaleString('ar-SA')} درهم
                  </span>
                  <span className="pdp-savings">
                    وفر {(parseFloat(product.original_price) - parseFloat(product.price)).toLocaleString('ar-SA')} درهم
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className={`pdp-stock ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock_quantity > 0 ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>متوفر في المخزون</span>
                  {product.stock_quantity <= 10 && (
                    <span className="pdp-low-stock">
                      (باقي {product.stock_quantity} فقط)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>غير متوفر حالياً</span>
                </>
              )}
            </div>

            {/* Delivery Info */}
            <div className="pdp-delivery-info">
              
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock_quantity > 0 && (
              <div className="pdp-actions">
                <div className="pdp-quantity">
                  <span className="pdp-quantity-label">الكمية:</span>
                  <div className="pdp-quantity-controls">
                    <button onClick={decreaseQuantity} disabled={quantity <= 1}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="pdp-quantity-value">{quantity}</span>
                    <button onClick={increaseQuantity} disabled={quantity >= product.stock_quantity}>
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>

                <button
                  className={`pdp-add-to-cart ${addedToCart ? 'added' : ''}`}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? (
                    <>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      تمت الإضافة!
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faShoppingCart} />
                      أضف إلى السلة
                    </>
                  )}
                </button>

                <button className="pdp-buy-now" onClick={() => {
                  handleAddToCart();
                  navigate('/checkout');
                }}>
                  <FontAwesomeIcon icon={faShoppingBag} />
                  اشتري الآن
                </button>
              </div>
            )}

            {/* Features */}
            <div className="pdp-features">
              <div className="pdp-feature">
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>ضمان الجودة</span>
              </div>
              <div className="pdp-feature">
                <FontAwesomeIcon icon={faUndo} />
                <span>إرجاع سهل</span>
              </div>
              <div className="pdp-feature">
                <FontAwesomeIcon icon={faCreditCard} />
                <span>دفع آمن</span>
              </div>
              <div className="pdp-feature">
                <FontAwesomeIcon icon={faTruck} />
                <span>شحن سريع</span>
              </div>
            </div>

            {/* Payment Options */}
           
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="pdp-details-section">
          <div className="pdp-tabs">
            <button 
              className={`pdp-tab ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              تفاصيل المنتج
            </button>
            <button 
              className={`pdp-tab ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              المواصفات
            </button>
            <button 
              className={`pdp-tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              التقييمات ({displayReviewCount})
            </button>
          </div>

          <div className="pdp-tab-content">
            {activeTab === 'details' && (
              <div className="pdp-details-content">
                {product.description ? (
                  <p className="pdp-description">{product.description}</p>
                ) : (
                  <p className="pdp-no-content">لا يوجد وصف متاح لهذا المنتج.</p>
                )}

                <div className="pdp-info-grid">
                  {product.sku && (
                    <div className="pdp-info-item">
                      <span className="pdp-info-label">رقم المنتج</span>
                      <span className="pdp-info-value">{product.sku}</span>
                    </div>
                  )}
                  {product.category && (
                    <div className="pdp-info-item">
                      <span className="pdp-info-label">الفئة</span>
                      <span className="pdp-info-value">{product.category.name}</span>
                    </div>
                  )}
                  
                  <div className="pdp-info-item">
                    <span className="pdp-info-label">التوفر</span>
                    <span className={`pdp-info-value ${product.stock_quantity > 0 ? 'stock-available' : 'stock-unavailable'}`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} قطعة متوفرة` : 'غير متوفر'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="pdp-specs-content">
                {product.specifications ? (
                  typeof product.specifications === 'object' ? (
                    <div className="pdp-specs-grid">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="pdp-spec-item">
                          <span className="pdp-spec-key">{key}</span>
                          <span className="pdp-spec-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>{product.specifications}</p>
                  )
                ) : (
                  <p className="pdp-no-content">لا توجد مواصفات متاحة لهذا المنتج.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="pdp-reviews-content">
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="pdp-reviews-list">
                    {product.reviews.map((review, index) => (
                      <div key={index} className="pdp-review-item">
                        <div className="pdp-review-header">
                          <div className="pdp-review-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FontAwesomeIcon
                                key={star}
                                icon={faStar}
                                className={star <= review.rating ? 'filled' : ''}
                              />
                            ))}
                          </div>
                          <span className="pdp-review-author">{review.user_name || 'مستخدم'}</span>
                        </div>
                        {review.comment && (
                          <p className="pdp-review-comment">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="pdp-no-reviews">
                    <FontAwesomeIcon icon={faStar} />
                    <p>لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
