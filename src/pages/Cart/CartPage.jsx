import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';
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
  const { t } = useTranslation();
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
      <div className="cart-page">
        <Helmet>
          <title>{t('cart.title')} | BuildingZ</title>
          <meta name="description" content={t('cart.cartDescription')} />
          <meta name="robots" content="noindex, nofollow" />
          <link rel="canonical" href="https://buildingzuae.com/cart" />
        </Helmet>
        <div className="cart-container">
          <div className="cart-empty">
            <div className="cart-empty-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <h2>{t('cart.empty')}</h2>
            <p>{t('cart.emptyDesc')}</p>
            <Link to="/products" className="cart-continue-btn">
              <FontAwesomeIcon icon={faArrowRight} />
              {t('cart.browseProducts')}
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
    <div className="cart-page">
      <Helmet>
        <title>{t('cart.cartTitleWithItems', { count: cartTotal.items })}</title>
        <meta name="description" content={t('cart.cartDescriptionWithItems', { count: cartTotal.items })} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://buildingzuae.com/cart" />
      </Helmet>
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <h1>{t('cart.title')}</h1>
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
                  
                  
                  
                  {item.stockQuantity && item.stockQuantity <= 5 && (
                    <span className="cart-item-stock-warning">
                      {t('cart.stockWarning', { count: item.stockQuantity })}
                    </span>
                  )}
                </div>
                
                {/* Price & Controls */}
                <div className="cart-item-actions">
                  <div className="cart-item-price">
                    <span className="price-value">{item.price.toFixed(0)}</span>
                    <span className="price-currency">{t('cart.currency')}</span>
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
                    title={t('cart.removeFromCart')}
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
                {t('cart.clearCart')}
              </button>
            )}
          </div>
          
          {/* Summary */}
          <div className="cart-summary">
            <h2>{t('cart.orderSummary')}</h2>
            
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>{t('cart.subtotalItems')} ({cartTotal.items} {t('cart.items')})</span>
                <span>{cartTotal.price.toFixed(2)} {t('cart.currency')}</span>
              </div>
              
              <div className="cart-summary-row">
                <span>{t('cart.shipping')}</span>
                <span className="free-shipping">{t('cart.freeShipping')}</span>
              </div>
            </div>
            
            <div className="cart-summary-total">
              <span>{t('cart.total')}</span>
              <span className="total-price">{cartTotal.price.toFixed(2)} {t('cart.currency')}</span>
            </div>
            
            <button className="cart-checkout-btn" onClick={handleCheckout}>
              {t('cart.checkout')}
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            
            <Link to="/products" className="cart-continue-shopping">
              {t('cart.continueShopping')}
            </Link>
            
            {/* Trust Badges */}
            <div className="cart-trust-badges">
              <div className="trust-badge">
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>{t('trust.securePayment')}</span>
              </div>
              <div className="trust-badge">
                <FontAwesomeIcon icon={faTruck} />
                <span>{t('trust.fastShipping')}</span>
              </div>
              <div className="trust-badge">
                <FontAwesomeIcon icon={faCreditCard} />
                <span>{t('trust.multiplePayment')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
