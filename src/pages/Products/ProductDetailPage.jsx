import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner,
  faExclamationTriangle,
  faShoppingCart,
  faStar,
  faHeart,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import productService from '../../services/productService';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  
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
    e.target.src = 'https://via.placeholder.com/500x500?text=صورة+غير+متوفرة';
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
    // TODO: Implement cart functionality
    console.log('تمت إضافة المنتج للسلة:', product.id, 'الكمية:', quantity);
  };

  const handleAddToWishlist = () => {
    // TODO: Implement wishlist functionality
    console.log('تمت إضافة المنتج للمفضلة:', product.id);
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
          {/* Left Side - Images */}
          <div className="product-images-section">
            {availableImages.length > 1 && (
              <div className="image-thumbnails">
                {availableImages.map((url, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={url} 
                      alt={`${product.name} - عرض ${index + 1}`} 
                      onError={handleImageError} 
                    />
                  </div>
                ))}
              </div>
            )}
            
            <div className="main-image-container">
              <div className="main-image">
                <img 
                  src={availableImages.length > 0 
                    ? availableImages[selectedImage] 
                    : 'https://via.placeholder.com/500x500?text=صورة+غير+متوفرة'} 
                  alt={product.name} 
                  onError={handleImageError}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Product Info */}
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
                      key={star}
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
                  <span className="option-label">اختر اللون</span>
                  <div className="option-value">{product.specifications}</div>
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
                <button className="secondary-btn" onClick={handleAddToWishlist}>
                  <FontAwesomeIcon icon={faHeart} /> إضافة للمفضلة
                </button>
                <button className="secondary-btn">
                  <FontAwesomeIcon icon={faShare} /> مشاركة المنتج
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
  );
};

export default ProductDetailPage; 