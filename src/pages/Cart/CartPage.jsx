import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faPlus, 
  faMinus, 
  faShoppingCart, 
  faArrowLeft,
  faArrowRight,
  faShieldAlt,
  faTruck,
  faCreditCard,
  faBox
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import './CartPage.css';

const CartPage = () => {
  const { 
    cart, 
    cartTotal, 
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();
  
  const navigate = useNavigate();

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className="cart-page" dir="rtl">
        <div className="cart-container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <h2>سلة التسوق فارغة</h2>
            <p>لم تقم بإضافة أي منتجات بعد</p>
            <Link to="/products" className="cart-continue-btn">
              <FontAwesomeIcon icon={faArrowRight} />
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page" dir="rtl">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <h1>سلة التسوق</h1>
          <span className="cart-count">{cartTotal.items} منتج</span>
        </div>
        
        <div className="cart-main-content">
          {/* Cart Items */}
          <div className="cart-items">
            {cart.map(item => (
              <div className="cart-item" key={item.id}>
                {/* Image */}
                <div 
                  className="cart-item-image"
                  onClick={() => navigate(`/products/${item.id}`)}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="cart-item-placeholder">
                      <FontAwesomeIcon icon={faBox} />
                    </div>
                  )}
                </div>
                
                {/* Details */}
                <div className="cart-item-info">
                  <h3 
                    className="cart-item-name"
                    onClick={() => navigate(`/products/${item.id}`)}
                  >
                    {item.name}
                  </h3>
                  
                  {item.vendor && (
                    <span className="cart-item-vendor">
                      البائع: {item.vendor}
                    </span>
                  )}
                  
                  {item.stockQuantity && item.stockQuantity <= 5 && (
                    <span className="cart-item-stock-warning">
                      باقي {item.stockQuantity} قطع فقط
                    </span>
                  )}
                </div>
                
                {/* Price & Controls */}
                <div className="cart-item-actions">
                  <div className="cart-item-price">
                    <span className="price-value">{item.price.toFixed(0)}</span>
                    <span className="price-currency">درهم</span>
                  </div>
                  
                  <div className="cart-item-quantity">
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.stockQuantity && item.quantity >= item.stockQuantity}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>
                  
                  <button 
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.id)}
                    title="إزالة من السلة"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Clear Cart */}
            {cart.length > 1 && (
              <button className="cart-clear-btn" onClick={clearCart}>
                <FontAwesomeIcon icon={faTrash} />
                إفراغ السلة
              </button>
            )}
          </div>
          
          {/* Summary */}
          <div className="cart-summary">
            <h2>ملخص الطلب</h2>
            
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>المجموع الفرعي ({cartTotal.items} منتج)</span>
                <span>{cartTotal.price.toFixed(2)} درهم</span>
              </div>
              
              <div className="cart-summary-row">
                <span>الشحن</span>
                <span className="free-shipping">مجاني</span>
              </div>
            </div>
            
            <div className="cart-summary-total">
              <span>الإجمالي</span>
              <span className="total-price">{cartTotal.price.toFixed(2)} درهم</span>
            </div>
            
            <button className="cart-checkout-btn" onClick={handleCheckout}>
              إتمام الطلب
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            
            <Link to="/products" className="cart-continue-shopping">
              متابعة التسوق
            </Link>
            
            {/* Trust Badges */}
            <div className="cart-trust-badges">
              <div className="trust-badge">
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>دفع آمن</span>
              </div>
              <div className="trust-badge">
                <FontAwesomeIcon icon={faTruck} />
                <span>شحن سريع</span>
              </div>
              <div className="trust-badge">
                <FontAwesomeIcon icon={faCreditCard} />
                <span>طرق دفع متعددة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
