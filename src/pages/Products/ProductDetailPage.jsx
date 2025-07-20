import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faExclamationTriangle,
  faShoppingCart,
  faStar,
  faHeart,
  faShare,
  faCopy
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

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
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

  const handleImageError = (e) => {
    // Remove image on error instead of showing placeholder
    e.target.style.display = 'none';
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
    if (product) {
      // Format product for cart
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.primary_image_url || 
              (product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null),
        vendor: product.vendor_profile?.business_name || '',
        stockQuantity: product.stock_quantity || 0
      };
      
      addToCart(cartProduct, quantity);
    }
  };

  const handleAddToWishlist = () => {
    console.log('تمت إضافة المنتج للمفضلة:', product.id);
  };

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

  // Format dimensions for display
  const formatDimensions = (dimensions) => {
    if (!dimensions) return '';
    if (typeof dimensions === 'object') {
      const { length, width, height } = dimensions;
      return `${length || 0} × ${width || 0} × ${height || 0} سم`;
    }
    return dimensions;
  };

  // Format specifications for display
  const formatSpecifications = (specs) => {
    if (!specs) return null;
    if (typeof specs === 'object') {
      return (
        <ul className="specs-list">
          {Object.entries(specs).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      );
    }
    return <p>{specs}</p>;
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="spinner" />
          <p>جاري تحميل تفاصيل المنتج...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <h2>فشل في تحميل تفاصيل المنتج</h2>
          <p>{error || 'لم يتم العثور على المنتج'}</p>
          <button className="retry-btn" onClick={() => navigate('/products')}>
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

  return (
    <div className="product-detail-page">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <div className="container">
          <nav className="breadcrumb-nav">
            <span className="breadcrumb-link" onClick={() => navigate('/products')}>
              المنتجات
            </span>
            {product.category && (
              <>
                <span className="breadcrumb-separator">‹</span>
                <span className="breadcrumb-link">
                  {product.category.name}
                </span>
              </>
            )}
            <span className="breadcrumb-separator">‹</span>
            <span className="breadcrumb-current">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container">
        <div className="product-detail-container">
          <div className="product-detail-column">
            {/* Main Product Image */}
            <div className="product-images-section">
              <div className="images-container">
                {availableImages.length > 1 && (
                  <div className="image-thumbnails">
                    {availableImages.map((url, index) => (
                      <div 
                        key={`thumb-${index}`}
                        className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                        onClick={() => setSelectedImage(index)}
                      >
                        {url && (
                          <img 
                            src={url} 
                            alt={`${product.name} - عرض ${index + 1}`} 
                            onError={handleImageError} 
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="main-image-container">
                  <div className="main-image">
                    {availableImages.length > 0 && availableImages[selectedImage] && (
                      <img 
                        src={availableImages[selectedImage]} 
                        alt={product.name} 
                        onError={handleImageError}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="product-info-section">
              <div className="product-header">
                <h1 className="product-name">{product.name}</h1>
                {product.description && (
                  <div className="product-subtitle">{product.description}</div>
                )}
              </div>

              <div className="product-price-section">
                <div className="price-container">
                  <span className="price-amount">{parseFloat(product.price).toFixed(0)}</span>
                  <span className="currency">درهم</span>
                </div>
                <div className="price-note">السعر شامل ضريبة القيمة المضافة</div>
              </div>

              {/* Rating Section - Only show if reviews exist */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="rating-section">
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesomeIcon
                        key={`star-${star}`}
                        icon={faStar}
                        className={`star ${star <= 4 ? '' : 'empty'}`}
                      />
                    ))}
                  </div>
                  <span className="rating-count">({product.reviews.length} تقييم)</span>
                </div>
              )}

              {/* Product Options */}
              <div className="product-options">
                {product.specifications && (
                  <div className="option-group">
                    <span className="option-label">المواصفات</span>
                    <div className="option-value">
                      {formatSpecifications(product.specifications)}
                    </div>
                  </div>
                )}
                
                {product.dimensions && (
                  <div className="option-group">
                    <span className="option-label">الأبعاد</span>
                    <div className="option-value">
                      {formatDimensions(product.dimensions)}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                {product.stock_quantity > 0 ? (
                  <>
                    <div className="quantity-selector">
                      <span className="quantity-label">الكمية:</span>
                      <div className="quantity-controls">
                        <button 
                          className="quantity-btn" 
                          onClick={decreaseQuantity} 
                          disabled={quantity <= 1}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          value={quantity} 
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val > 0 && val <= product.stock_quantity) {
                              setQuantity(val);
                            }
                          }} 
                          min="1" 
                          max={product.stock_quantity}
                          className="quantity-input"
                        />
                        <button 
                          className="quantity-btn" 
                          onClick={increaseQuantity} 
                          disabled={quantity >= product.stock_quantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    
                    <button 
                      className="add-to-cart-btn"
                      onClick={handleAddToCart}
                    >
                      <FontAwesomeIcon icon={faShoppingCart} /> إضافة إلى السلة
                    </button>
                  </>
                ) : (
                  <button className="add-to-cart-btn" disabled>
                    غير متوفر في المخزون
                  </button>
                )}
                
                <div className="secondary-actions">
                
                </div>
              </div>

              {/* Social Share Widget */}
              <div className="social-share-widget">
                <h3 className="widget-title">مشاركة المنتج</h3>
                <div className="social-buttons">
                  <button 
                    className="social-btn facebook" 
                    onClick={() => handleSocialShare('facebook')}
                    title="مشاركة على فيسبوك"
                  >
                    <FontAwesomeIcon icon={faFacebook} />
                  </button>
                  <button 
                    className="social-btn twitter" 
                    onClick={() => handleSocialShare('twitter')}
                    title="مشاركة على تويتر"
                  >
                    <FontAwesomeIcon icon={faTwitter} />
                  </button>
                  <button 
                    className="social-btn whatsapp" 
                    onClick={() => handleSocialShare('whatsapp')}
                    title="مشاركة على واتساب"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} />
                  </button>
                  <button 
                    className="social-btn instagram" 
                    onClick={() => handleSocialShare('instagram')}
                    title="مشاركة على انستغرام"
                  >
                    <FontAwesomeIcon icon={faInstagram} />
                  </button>
                  <button 
                    className="social-btn telegram" 
                    onClick={() => handleSocialShare('telegram')}
                    title="مشاركة على تيليجرام"
                  >
                    <FontAwesomeIcon icon={faTelegram} />
                  </button>
                  <button 
                    className="social-btn copy" 
                    onClick={() => handleSocialShare('copy')}
                    title="نسخ الرابط"
                  >
                    <FontAwesomeIcon icon={faCopy} />
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="how-to-get">
                <h3>كيفية الحصول على المنتج</h3>
                {product.vendor_profile && (
                  <p>متوفر من {product.vendor_profile.business_name}</p>
                )}
                {product.stock_quantity > 0 && (
                  <p>متوفر في المخزون ({product.stock_quantity} قطعة)</p>
                )}
                {product.sku && (
                  <p>رقم المنتج: {product.sku}</p>
                )}
                <p>التوصيل متاح لجميع أنحاء دولة الإمارات العربية المتحدة</p>
                <p>خدمة عملاء متاحة 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 