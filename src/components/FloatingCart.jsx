import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faTimes, 
  faTrash, 
  faPlus, 
  faMinus,
  faShoppingBag
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import './FloatingCart.css';

const FloatingCart = () => {
  const { t } = useTranslation();
  const { 
    cart, 
    cartTotal, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity 
  } = useCart();
  
  const navigate = useNavigate();
  
  const handleViewCart = () => {
    toggleCart(); // Close the cart
    navigate('/cart');
  };

  return (
    <div className={`floating-cart ${isCartOpen ? 'open' : ''}`}>
      <div className="cart-toggle" onClick={toggleCart}>
        <FontAwesomeIcon icon={faShoppingCart} />
        <span className="cart-count">{cartTotal.items}</span>
      </div>
      
      <div className="cart-content">
        <div className="cart-header">
          <h3>{t('cart.title')}</h3>
          <button className="close-cart" onClick={toggleCart}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>{t('cart.empty')}</p>
            </div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="no-image"></div>
                  )}
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <div className="item-price">
                    <span>{item.price.toFixed(0)} {t('cart.currency')}</span>
                    {item.quantity > 1 && (
                      <span className="item-total">
                        {t('cart.subtotal')}: {(item.price * item.quantity).toFixed(0)} {t('cart.currency')}
                      </span>
                    )}
                  </div>
                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                    <button 
                      className="remove-item" 
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>{t('cart.totalLabel')}</span>
              <span>{cartTotal.price.toFixed(0)} {t('cart.currency')}</span>
            </div>
            <div className="cart-actions">
              <button className="checkout-btn" onClick={handleViewCart}>
                <FontAwesomeIcon icon={faShoppingBag} />
                {t('cart.viewCart')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingCart; 