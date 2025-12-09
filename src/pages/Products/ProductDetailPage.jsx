import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faExclamationTriangle,
  faShoppingCart,
  faStar,
  faHeart,
  faCopy,
  faStore,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faCheckCircle,
  faTruck,
  faBox,
  faRuler,
  faWeight,
  faLayerGroup,
  faArrowLeft,
  faChevronLeft,
  faChevronRight,
  faInfoCircle,
  faTag,
  faPlus,
  faMinus
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebook, 
  faTwitter, 
  faInstagram,
  faWhatsapp,
  faTelegram
} from '@fortawesome/free-brands-svg-icons';
import { useCart } from '../../context/CartContext';
import productService from '../../services/productService';
import './ProductDetailPage.css';

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

  const slugify = (text = '', fallback = '') => {
    const base = text && text.toString().trim();
    const cleaned = base
      ? base
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^-\w\u0600-\u06FF]+/g, '')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '')
      : '';
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
          if (response.data.data.product.image_urls && response.data.data.product.image_urls.length > 0) {
            setSelectedImage(0);
          }
        } else {
          throw new Error('Failed to fetch product details');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'فشل في تحميل تفاصيل المنتج');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleImageError = (index) => {
    setImageError(prev => ({ ...prev, [index]: true }));
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

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      if (product && product.stock_quantity && val <= product.stock_quantity) {
        setQuantity(val);
      } else if (!product?.stock_quantity || val <= product.stock_quantity) {
        setQuantity(val);
      }
    }
  };

  const handleAddToCart = () => {
    if (product && product.stock_quantity > 0) {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.primary_image_url || 
              (product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null),
        vendor: product.vendor_profile?.business_name || '',
        stockQuantity: product.stock_quantity || 0,
        category: product.category?.name || ''
      };
      
      addToCart(cartProduct, quantity);
    }
  };

  const handleAddToWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist API call
  };

  const calculateAverageRating = useCallback(() => {
    if (!product || !product.reviews || product.reviews.length === 0) return 0;
    const sum = product.reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
    return sum / product.reviews.length;
  }, [product]);

  const averageRating = product ? calculateAverageRating() : 0;

  const handleSocialShare = (platform) => {
    const productUrl = window.location.href;
    const productTitle = product.name;
    const productDescription = product.description || '';

    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productTitle)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${productTitle} - ${productUrl}`)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productTitle)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(`${productTitle} - ${productUrl}`);
        alert('تم نسخ رابط المنتج! يمكنك مشاركته على Instagram');
        return;
      case 'copy':
        navigator.clipboard.writeText(productUrl);
        alert('تم نسخ رابط المنتج!');
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const formatDimensions = (dimensions) => {
    if (!dimensions) return '';
    if (typeof dimensions === 'object') {
      const { length, width, height } = dimensions;
      return `${length || 0} × ${width || 0} × ${height || 0} سم`;
    }
    if (typeof dimensions === 'string') {
      return dimensions;
    }
    return String(dimensions);
  };

  const formatSpecifications = (specs) => {
    if (!specs) return null;
    if (typeof specs === 'object') {
      return (
        <div className="specs-grid">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="spec-item">
              <span className="spec-key">{key}:</span>
              <span className="spec-value">{value}</span>
            </div>
          ))}
        </div>
      );
    }
    return <p className="specs-text">{specs}</p>;
  };

  const nextImage = () => {
    if (product && availableImages.length > 0) {
      setSelectedImage((prev) => (prev + 1) % availableImages.length);
    }
  };

  const prevImage = () => {
    if (product && availableImages.length > 0) {
      setSelectedImage((prev) => (prev - 1 + availableImages.length) % availableImages.length);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-loading">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="product-error">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h2>فشل في تحميل تفاصيل المنتج</h2>
          <p>{error || 'لم يتم العثور على المنتج'}</p>
          <button className="retry-button" onClick={() => navigate('/products')}>
            العودة إلى المنتجات
          </button>
        </div>
      </div>
    );
  }

  const availableImages = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : product.primary_image_url 
      ? [product.primary_image_url] 
      : [];

  // SEO Data
  const pageTitle = `${product.name} - ${product.category?.name || 'منتج'} - BuildingZ`;
  const pageDescription = product.description || `اشتري ${product.name} من BuildingZ`;
  const pageUrl = `${window.location.origin}/products/${product.id}/${slugify(
    product.name,
    `product-${product.id}`
  )}`;
  const productImage = availableImages.length > 0 ? availableImages[0] : null;

  return (
    <div className="product-detail-page">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${product.name}, ${product.category?.name || ''}, BuildingZ, منتجات`} />
        
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={pageUrl} />
        {productImage && <meta property="og:image" content={productImage} />}
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {productImage && <meta name="twitter:image" content={productImage} />}
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": availableImages,
            "sku": product.sku,
            "offers": {
              "@type": "Offer",
              "url": pageUrl,
              "priceCurrency": "AED",
              "price": product.price,
              "availability": product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "itemCondition": "https://schema.org/NewCondition"
            },
            "brand": product.vendor_profile?.business_name || "BuildingZ",
            "category": product.category?.name
          })}
        </script>
      </Helmet>

      {/* Breadcrumbs */}
      <div className="product-breadcrumbs">
        <div className="product-container">
          <nav className="breadcrumb-nav">
            <button className="breadcrumb-back" onClick={() => navigate('/products')}>
              <FontAwesomeIcon icon={faArrowLeft} />
              <span>العودة</span>
            </button>
            <button className="breadcrumb-link" onClick={() => navigate('/products')}>
              المنتجات
            </button>
            {product.category && (
              <>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-link">{product.category.name}</span>
              </>
            )}
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current" title={product.name}>{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="product-container">
        <div className="product-detail-layout">
          {/* Left Column - Images */}
          <div className="product-images-column">
            <div className="product-image-main">
              {availableImages.length > 0 && availableImages[selectedImage] && !imageError[selectedImage] ? (
                <>
                  <img 
                    src={availableImages[selectedImage]} 
                    alt={product.name}
                    className="main-product-image"
                  />
                  {availableImages.length > 1 && (
                    <>
                      <button 
                        className="image-nav-button prev"
                        onClick={prevImage}
                        aria-label="Previous image"
                      >
                        <FontAwesomeIcon icon={faChevronRight} />
                      </button>
                      <button 
                        className="image-nav-button next"
                        onClick={nextImage}
                        aria-label="Next image"
                      >
                        <FontAwesomeIcon icon={faChevronLeft} />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="image-placeholder">
                  <FontAwesomeIcon icon={faBox} size="4x" />
                  <p>لا توجد صورة متاحة</p>
                </div>
              )}
              
            </div>

            {availableImages.length > 1 && (
              <div className="product-image-thumbnails">
                {availableImages.map((url, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''} ${imageError[index] ? 'error' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    {!imageError[index] && url ? (
                      <img 
                        src={url} 
                        alt={`${product.name} - عرض ${index + 1}`}
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <FontAwesomeIcon icon={faBox} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="product-info-column">
            {/* Product Header */}
            <div className="product-header-section">
              <div className="product-title-row">
                <h1 className="product-title">{product.name}</h1>
                <button
                  className={`wishlist-icon-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={handleAddToWishlist}
                  title={isWishlisted ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                >
                  <FontAwesomeIcon icon={faHeart} />
                </button>
              </div>
              
              {product.description && (
                <p className="product-description">{product.description}</p>
              )}

              {/* Rating */}
              {product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 && averageRating > 0 && (
                <div className="product-rating-display">
                  <div className="rating-stars-large">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesomeIcon
                        key={star}
                        icon={faStar}
                        className={`star ${star <= Math.round(averageRating) ? 'filled' : 'empty'}`}
                      />
                    ))}
                  </div>
                  <span className="rating-value-large">{averageRating.toFixed(1)}</span>
                  <span className="rating-count-large">
                    ({product.reviews.length} {product.reviews.length === 1 ? 'تقييم' : 'تقييم'})
                  </span>
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="product-price-display">
              <div className="price-main">
                <span className="price-value">{parseFloat(product.price).toFixed(2)}</span>
                <span className="price-currency">درهم</span>
              </div>
              <div className="price-note">
                <FontAwesomeIcon icon={faInfoCircle} />
                السعر شامل ضريبة القيمة المضافة
              </div>
            </div>

            {/* Stock Status */}
            <div className={`stock-status ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
              <FontAwesomeIcon icon={product.stock_quantity > 0 ? faCheckCircle : faExclamationTriangle} />
              <span>
                {product.stock_quantity > 0 
                  ? `متوفر في المخزون (${product.stock_quantity} قطعة)` 
                  : 'غير متوفر في المخزون'}
              </span>
            </div>

            {/* Quick Info */}
            <div className="product-quick-info">
              {product.category && (
                <div className="quick-info-item">
                  <FontAwesomeIcon icon={faLayerGroup} />
                  <span>الفئة: <strong>{product.category.name}</strong></span>
                </div>
              )}
              {product.vendor_profile?.business_name && (
                <div className="quick-info-item">
                  <FontAwesomeIcon icon={faStore} />
                  <span>البائع: <strong>{product.vendor_profile.business_name}</strong></span>
                </div>
              )}
              {product.sku && (
                <div className="quick-info-item">
                  <FontAwesomeIcon icon={faTag} />
                  <span>رقم المنتج: <strong>{product.sku}</strong></span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {product.stock_quantity > 0 ? (
              <div className="product-actions">
                <div className="quantity-section">
                  <label className="quantity-label">الكمية:</label>
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn decrease"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                      max={product.stock_quantity}
                      className="quantity-input"
                    />
                    <button
                      className="quantity-btn increase"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock_quantity}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                </div>

                <button
                  className="add-to-cart-button"
                  onClick={handleAddToCart}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  <span>إضافة إلى السلة</span>
                </button>
              </div>
            ) : (
              <button className="add-to-cart-button" disabled>
                <FontAwesomeIcon icon={faShoppingCart} />
                <span>غير متوفر</span>
              </button>
            )}

            {/* Share Section */}
            <div className="product-share-section">
              <span className="share-label">مشاركة:</span>
              <div className="share-buttons">
                <button
                  className="share-btn facebook"
                  onClick={() => handleSocialShare('facebook')}
                  title="مشاركة على فيسبوك"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                </button>
                <button
                  className="share-btn twitter"
                  onClick={() => handleSocialShare('twitter')}
                  title="مشاركة على تويتر"
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </button>
                <button
                  className="share-btn whatsapp"
                  onClick={() => handleSocialShare('whatsapp')}
                  title="مشاركة على واتساب"
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                </button>
                <button
                  className="share-btn telegram"
                  onClick={() => handleSocialShare('telegram')}
                  title="مشاركة على تيليجرام"
                >
                  <FontAwesomeIcon icon={faTelegram} />
                </button>
                <button
                  className="share-btn copy"
                  onClick={() => handleSocialShare('copy')}
                  title="نسخ الرابط"
                >
                  <FontAwesomeIcon icon={faCopy} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="product-details-section">
          <div className="details-tabs">
            <button className="tab-button active">تفاصيل المنتج</button>
            <button className="tab-button">المواصفات</button>
            <button className="tab-button">التقييمات ({product.reviews && Array.isArray(product.reviews) ? product.reviews.length : 0})</button>
          </div>

          <div className="details-content">
            {/* Product Details Grid */}
            <div className="details-grid">
              {product.sku && (
                <div className="detail-card">
                  <FontAwesomeIcon icon={faBox} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">رقم المنتج</span>
                    <span className="detail-value">{product.sku}</span>
                  </div>
                </div>
              )}
              
              {product.stock_quantity !== null && product.stock_quantity !== undefined && (
                <div className="detail-card">
                  <FontAwesomeIcon icon={faTruck} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">المخزون</span>
                    <span className={`detail-value ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} قطعة` : 'غير متوفر'}
                    </span>
                  </div>
                </div>
              )}
              
              {product.weight && (
                <div className="detail-card">
                  <FontAwesomeIcon icon={faWeight} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">الوزن</span>
                    <span className="detail-value">{product.weight} كجم</span>
                  </div>
                </div>
              )}
              
              {product.dimensions && (
                <div className="detail-card">
                  <FontAwesomeIcon icon={faRuler} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">الأبعاد</span>
                    <span className="detail-value">{formatDimensions(product.dimensions)}</span>
                  </div>
                </div>
              )}
              
              {product.category && (
                <div className="detail-card">
                  <FontAwesomeIcon icon={faLayerGroup} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">الفئة</span>
                    <span className="detail-value">{product.category.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Specifications */}
            {product.specifications && (
              <div className="specifications-box">
                <h3 className="specs-title">المواصفات</h3>
                {formatSpecifications(product.specifications)}
              </div>
            )}
            
            {!product.specifications && product.description && (
              <div className="specifications-box">
                <h3 className="specs-title">الوصف</h3>
                <p className="specs-text">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Section */}
        {product.vendor_profile && (
          <div className="vendor-section">
            <h2 className="section-title">
              <FontAwesomeIcon icon={faStore} />
              معلومات البائع
            </h2>
            <div className="vendor-card">
              <div className="vendor-header">
                <h3 className="vendor-name">
                  {product.vendor_profile.business_name}
                  {product.vendor_profile.is_verified && (
                    <span className="verified-badge" title="بائع موثق">
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </span>
                  )}
                </h3>
                {product.vendor_profile.business_description && (
                  <p className="vendor-description">{product.vendor_profile.business_description}</p>
                )}
              </div>
              
              <div className="vendor-info-grid">
                {product.vendor_profile.business_address && (
                  <div className="vendor-info-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span>{product.vendor_profile.business_address}</span>
                  </div>
                )}
                
                {product.vendor_profile.business_phone && (
                  <div className="vendor-info-item">
                    <FontAwesomeIcon icon={faPhone} />
                    <a href={`tel:${product.vendor_profile.business_phone}`}>
                      {product.vendor_profile.business_phone}
                    </a>
                  </div>
                )}
                
              {product.vendor_profile.user?.email && (
                <div className="vendor-info-item">
                  <FontAwesomeIcon icon={faEnvelope} />
                  <a href={`mailto:${product.vendor_profile.user.email}`}>
                    {product.vendor_profile.user.email}
                  </a>
                </div>
              )}
              
              {product.vendor_profile.license_number && (
                <div className="vendor-info-item">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>رقم الترخيص: <strong>{product.vendor_profile.license_number}</strong></span>
                </div>
              )}
              
              {product.vendor_profile.tax_id && (
                <div className="vendor-info-item">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  <span>الرقم الضريبي: <strong>{product.vendor_profile.tax_id}</strong></span>
                </div>
              )}
              
              {product.vendor_profile.services_offered && product.vendor_profile.services_offered.length > 0 && (
                <div className="vendor-info-item full-width">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                    <span style={{ fontWeight: 600, color: '#0A3259' }}>الخدمات المقدمة:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {product.vendor_profile.services_offered.map((service, index) => (
                        <span key={index} style={{ 
                          background: '#f9fafb', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '8px', 
                          fontSize: '0.9rem',
                          border: '1px solid #e5e7eb'
                        }}>
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="section-title">
            <FontAwesomeIcon icon={faStar} />
            التقييمات ({product.reviews && Array.isArray(product.reviews) ? product.reviews.length : 0})
          </h2>
          
          {product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 ? (
            <div className="reviews-list">
              {product.reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.user?.name || review.name || 'مستخدم'}</span>
                      {review.rating && (
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <FontAwesomeIcon
                              key={star}
                              icon={faStar}
                              className={`star ${star <= (review.rating || 0) ? 'filled' : 'empty'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {review.created_at && (
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    )}
                  </div>
                  {review.comment && (
                    <p className="review-comment">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <FontAwesomeIcon icon={faStar} size="3x" />
              <p>لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيم!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
