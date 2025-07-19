import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faShoppingCart, 
  faHeart,
  faStar,
  faStarHalfAlt,
  faSpinner,
  faExclamationTriangle,
  faCheck,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartOutline } from '@fortawesome/free-regular-svg-icons';
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
  const [inWishlist, setInWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await productService.getProductById(productId);
        
        if (response.data && response.data.success) {
          setProduct(response.data.data.product);
          // Set the first image as selected by default
          if (response.data.data.product.image_urls && response.data.data.product.image_urls.length > 0) {
            setSelectedImage(0);
          }
        } else {
          throw new Error('Failed to fetch product details');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Handle image error
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/500x500?text=صورة+غير+متوفرة';
  };

  // Toggle wishlist
  const toggleWishlist = () => {
    setInWishlist(!inWishlist);
    // TODO: Implement actual wishlist functionality with API
  };

  // Add to cart
  const handleAddToCart = () => {
    // TODO: Implement actual cart functionality with API
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  // Quantity handlers
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

  // Star rating component
  const StarRating = ({ rating = 0, size = 'md' }) => {
    // Ensure rating is a number and between 0-5
    const numRating = parseFloat(rating) || 0;
    const safeRating = Math.max(0, Math.min(5, numRating));
    
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    
    return (
      <div className={`star-rating ${size}`}>
        {[...Array(5)].map((_, i) => (
          <FontAwesomeIcon
            key={i}
            icon={
              i < fullStars 
                ? faStar 
                : i === fullStars && hasHalfStar 
                  ? faStarHalfAlt 
                  : faStar
            }
            className={
              i < fullStars || (i === fullStars && hasHalfStar)
                ? 'star-filled'
                : 'star-empty'
            }
          />
        ))}
        <span className="rating-text">({safeRating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
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
          <h2>فشل تحميل تفاصيل المنتج</h2>
          <p>{error || 'لم يتم العثور على المنتج'}</p>
          <button className="back-btn" onClick={() => navigate('/products')}>
            العودة إلى المنتجات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <button className="back-btn" onClick={() => navigate('/products')}>
            <FontAwesomeIcon icon={faArrowLeft} /> العودة إلى المنتجات
          </button>
          <div className="breadcrumb-path">
            <span onClick={() => navigate('/')}>الرئيسية</span> / 
            <span onClick={() => navigate('/products')}>المنتجات</span> / 
            <span onClick={() => navigate(`/products/category/${product.category?.slug}`)}>{product.category?.name}</span> / 
            <span className="current">{product.name}</span>
          </div>
        </div>

        <div className="product-detail-container">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.image_urls && product.image_urls.length > 0 
                  ? product.image_urls[selectedImage] 
                  : product.primary_image_url || 'https://via.placeholder.com/500x500?text=صورة+غير+متوفرة'} 
                alt={product.name} 
                onError={handleImageError}
              />
            </div>
            {product.image_urls && product.image_urls.length > 1 && (
              <div className="image-thumbnails">
                {product.image_urls.map((url, index) => (
                  <div 
                    key={index} 
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={url} alt={`${product.name} - صورة ${index + 1}`} onError={handleImageError} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-vendor">
              {product.vendor_profile?.business_name || 'Buildinz'}
            </div>
            <h1 className="product-name">{product.name}</h1>
            
            {/* Rating placeholder - since API doesn't provide ratings */}
            <div className="product-rating">
              <StarRating rating={4.5} />
              <span className="review-count">(0 تقييمات)</span>
            </div>
            
            <div className="product-price">
              <span className="current-price">{product.price} {product.currency || 'SAR'}</span>
            </div>
            
            {product.stock_quantity > 0 ? (
              <div className="in-stock">
                <FontAwesomeIcon icon={faCheck} /> متوفر في المخزون ({product.stock_quantity})
              </div>
            ) : (
              <div className="out-of-stock">
                <FontAwesomeIcon icon={faExclamationTriangle} /> غير متوفر في المخزون
              </div>
            )}
            
            <div className="product-description">
              <h3>الوصف</h3>
              <p>{product.description || 'لا يوجد وصف متاح لهذا المنتج.'}</p>
            </div>
            
            {/* Specifications if available */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="product-specifications">
                <h3>المواصفات</h3>
                <ul>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key}>
                      <span className="spec-name">{key}:</span>
                      <span className="spec-value">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Actions */}
            {product.stock_quantity > 0 && (
              <div className="product-actions">
                <div className="quantity-selector">
                  <button onClick={decreaseQuantity} disabled={quantity <= 1}>-</button>
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
                  />
                  <button onClick={increaseQuantity} disabled={quantity >= product.stock_quantity}>+</button>
                </div>
                
                <button 
                  className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} /> تمت الإضافة إلى السلة
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faShoppingCart} /> إضافة إلى السلة
                    </>
                  )}
                </button>
                
                <button 
                  className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                  onClick={toggleWishlist}
                >
                  <FontAwesomeIcon icon={inWishlist ? faHeart : faHeartOutline} />
                </button>
                
                <button className="share-btn">
                  <FontAwesomeIcon icon={faShare} />
                </button>
              </div>
            )}
            
            {/* Additional Info */}
            <div className="additional-info">
              <div className="info-item">
                <strong>SKU:</strong> {product.sku || 'N/A'}
              </div>
              <div className="info-item">
                <strong>الفئة:</strong> {product.category?.name || 'غير مصنف'}
              </div>
              {product.weight && (
                <div className="info-item">
                  <strong>الوزن:</strong> {product.weight}
                </div>
              )}
              {product.dimensions && (
                <div className="info-item">
                  <strong>الأبعاد:</strong> {product.dimensions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage; 