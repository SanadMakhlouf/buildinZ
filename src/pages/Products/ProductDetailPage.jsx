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
import { useTranslation } from "react-i18next";
import { getDeliveryDate, formatDeliveryDate } from "../../utils/deliveryUtils";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { t } = useTranslation();
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
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
          const p = response.data.data.product;
          setProduct(p);
          const vars = p.variants || [];
          const firstInStock = vars.find(
            (v) => (v.stock_quantity ?? v.stockQuantity ?? 0) > 0
          );
          setSelectedVariant(firstInStock || null);
          if (p.image_urls && p.image_urls.length > 0) {
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
    if (!product) return;
    const maxFromStock = selectedVariant
      ? (selectedVariant.stock_quantity ?? selectedVariant.stockQuantity ?? 0)
      : (product?.stock_quantity ?? 0);
    const mode = selectedVariant?.availability_mode ?? product?.availability_mode ?? "quantity";
    const max = mode === "quantity" ? maxFromStock : Number.POSITIVE_INFINITY;
    if (quantity < max) setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    const stock = selectedVariant
      ? (selectedVariant.stock_quantity ?? selectedVariant.stockQuantity ?? 0)
      : (product?.stock_quantity ?? 0);
    const mode = selectedVariant?.availability_mode ?? product?.availability_mode ?? "quantity";
    const apiAvailable =
      product?.is_available_for_purchase ??
      product?.is_available ??
      (product?.availability_status === "available" ? true : undefined);
    const isAvailable =
      mode === "availability" ? (apiAvailable ?? stock > 0) : stock > 0;
    if (product && isAvailable) {
      const price = selectedVariant
        ? parseFloat(selectedVariant.price)
        : parseFloat(product.price);
      const image =
        product.primary_image_url ||
        (product.image_urls && product.image_urls.length > 0
          ? product.image_urls[0]
          : null);
      const variantImage = selectedVariant?.images?.[0];
      const cartProduct = {
        id: selectedVariant ? `p${product.id}v${selectedVariant.id}` : product.id,
        productId: product.id,
        variantId: selectedVariant?.id,
        name: product.name,
        price,
        image: variantImage || image,
        vendor: product.vendor_profile?.business_name || "",
        stockQuantity: mode === "quantity" ? stock : undefined,
        category: product.category?.name || "",
        variantAttributes: selectedVariant?.attributes || selectedVariant?.variant_attributes,
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
    return tomorrow.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
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

  const variants = product.variants || [];
  const effectivePrice = selectedVariant
    ? parseFloat(selectedVariant.price)
    : parseFloat(product.price);
  const effectiveStock = selectedVariant
    ? (selectedVariant.stock_quantity ?? selectedVariant.stockQuantity ?? 0)
    : (product.stock_quantity ?? 0);
  const availabilityMode =
    selectedVariant?.availability_mode ??
    product.availability_mode ??
    "quantity";
  const apiAvailable =
    product.is_available_for_purchase ??
    product.is_available ??
    (product.availability_status === "available" ? true : undefined);
  const effectiveAvailable =
    availabilityMode === "availability"
      ? (apiAvailable ?? effectiveStock > 0)
      : effectiveStock > 0;
  const variantImages =
    selectedVariant &&
    selectedVariant.images &&
    Array.isArray(selectedVariant.images) &&
    selectedVariant.images.length > 0
      ? selectedVariant.images
      : null;
  const availableImages = variantImages
    ? variantImages
    : product.image_urls && product.image_urls.length > 0
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

  const displayRating = averageRating || 0;
  const displayReviewCount = product.reviews?.length || 0;

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
      "availability": effectiveAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
    <div className="pdp-page">
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
        <meta property="product:availability" content={effectiveAvailable ? "in stock" : "out of stock"} />
        
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

            {/* Variant Selector */}
            {variants.length > 0 && (
              <div className="pdp-variants">
                {variants.map((v) => {
                  const attrs = v.attributes || v.variant_attributes || {};
                  const color = v.color ?? attrs.color;
                  const size = v.size ?? attrs.size;
                  const label = [color, size].filter(Boolean).join(" / ") || `خيار ${v.id}`;
                  const isSelected = selectedVariant?.id === v.id;
                  const outOfStock = (v.stock_quantity ?? v.stockQuantity ?? 0) <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`pdp-variant-btn ${isSelected ? "active" : ""} ${outOfStock ? "out-of-stock" : ""}`}
                      onClick={() => {
                        if (!outOfStock) {
                          setSelectedVariant(v);
                          setSelectedImage(0);
                        }
                      }}
                      disabled={outOfStock}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Price */}
            <div className="pdp-price-section">
              <div className="pdp-price-main">
                <span className="pdp-price-value">
                  {effectivePrice.toLocaleString("en-US")}
                </span>
                <span className="pdp-price-currency">درهم</span>
              </div>
              {discount > 0 && (
                <div className="pdp-price-old">
                  <span className="pdp-original-price">
                    {parseFloat(product.original_price).toLocaleString('en-US')} درهم
                  </span>
                  <span className="pdp-savings">
                    وفر {(parseFloat(product.original_price) - parseFloat(product.price)).toLocaleString('en-US')} درهم
                  </span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className={`pdp-stock ${effectiveAvailable ? 'in-stock' : 'out-of-stock'}`}>
              {effectiveAvailable ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>متوفر في المخزون</span>
                  {availabilityMode === "quantity" && (
                    <>
                      <span className="pdp-stock-quantity">
                        ({effectiveStock} قطعة متوفرة)
                      </span>
                      {effectiveStock <= 10 && (
                        <span className="pdp-low-stock">
                          (كمية محدودة)
                        </span>
                      )}
                    </>
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
              {formatDeliveryDate(getDeliveryDate(product)) && (
                <div className="pdp-delivery-date">
                  <FontAwesomeIcon icon={faTruck} />
                  <span>
                    {t('home.getItBy')}{" "}
                    {formatDeliveryDate(getDeliveryDate(product))}
                  </span>
                </div>
              )}
              {product.is_free_delivery && (
                <div className="pdp-free-delivery">
                  <FontAwesomeIcon icon={faTruck} />
                  <span>توصيل مجاني</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {effectiveAvailable && (
              <div className="pdp-actions">
                <div className="pdp-quantity">
                  <span className="pdp-quantity-label">الكمية:</span>
                  <div className="pdp-quantity-controls">
                    <button onClick={decreaseQuantity} disabled={quantity <= 1}>
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="pdp-quantity-value">{quantity}</span>
                    <button
                      onClick={increaseQuantity}
                      disabled={availabilityMode === "quantity" ? quantity >= effectiveStock : false}
                    >
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
                  navigate('/cart');
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
                    <span className={`pdp-info-value ${effectiveAvailable ? 'stock-available' : 'stock-unavailable'}`}>
                      {effectiveAvailable
                        ? availabilityMode === "quantity"
                          ? `${effectiveStock} قطعة متوفرة`
                          : "متوفر"
                        : "غير متوفر"}
                    </span>
                  </div>

                  {/* Measurement Details - Size only */}
                  {product.measurement_details && typeof product.measurement_details === 'object' && Object.keys(product.measurement_details).length > 0 && (
                    Object.entries(product.measurement_details)
                      .filter(([key]) => key.toLowerCase().includes('size'))
                      .map(([key, value]) => (
                        <div key={key} className="pdp-info-item">
                          <span className="pdp-info-label">
                            {key === 'top_size' ? 'حجم السطح' :
                             key === 'size' ? 'الحجم' :
                             'الحجم'}
                          </span>
                          <span className="pdp-info-value">{value}</span>
                        </div>
                      ))
                  )}

                  {/* Dimensions fallback */}
                  {product.dimensions && !product.measurement_details && (
                    <div className="pdp-info-item">
                      <span className="pdp-info-label">الأبعاد</span>
                      <span className="pdp-info-value">{product.dimensions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="pdp-specs-content">
                {/* Measurement Details - Size only */}
                {product.measurement_details && typeof product.measurement_details === 'object' && Object.keys(product.measurement_details).length > 0 && (
                  Object.entries(product.measurement_details)
                    .filter(([key]) => key.toLowerCase().includes('size'))
                    .length > 0 && (
                    <div className="pdp-specs-section">
                      <h4 className="pdp-specs-section-title">الحجم</h4>
                      <div className="pdp-specs-grid">
                        {Object.entries(product.measurement_details)
                          .filter(([key]) => key.toLowerCase().includes('size'))
                          .map(([key, value]) => (
                            <div key={key} className="pdp-spec-item">
                              <span className="pdp-spec-key">
                                {key === 'top_size' ? 'حجم السطح' :
                                 key === 'size' ? 'الحجم' :
                                 'الحجم'}
                              </span>
                              <span className="pdp-spec-value">{value}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}

                {/* Specifications */}
                {product.specifications ? (
                  <div className="pdp-specs-section">
                    {product.measurement_details && Object.keys(product.measurement_details).length > 0 && (
                      <h4 className="pdp-specs-section-title">المواصفات الفنية</h4>
                    )}
                    {typeof product.specifications === 'object' ? (
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
                    )}
                  </div>
                ) : (
                  !product.measurement_details && (
                    <p className="pdp-no-content">لا توجد مواصفات متاحة لهذا المنتج.</p>
                  )
                )}

                {/* Dimensions fallback */}
                {product.dimensions && !product.measurement_details && (
                  <div className="pdp-specs-section">
                    <h4 className="pdp-specs-section-title">الأبعاد</h4>
                    <div className="pdp-specs-grid">
                      <div className="pdp-spec-item">
                        <span className="pdp-spec-key">الأبعاد</span>
                        <span className="pdp-spec-value">{product.dimensions}</span>
                      </div>
                    </div>
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
