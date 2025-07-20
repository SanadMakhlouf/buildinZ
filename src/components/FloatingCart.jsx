import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const { 
    cart, 
    cartTotal, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity 
  } = useCart();
  
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    toggleCart(); // Close the cart
    navigate('/checkout');
  };

  return (
    <div className={`floating-cart ${isCartOpen ? 'open' : ''}`}>
      <div className="cart-toggle" onClick={toggleCart}>
        <FontAwesomeIcon icon={faShoppingCart} />
        <span className="cart-count">{cartTotal.items}</span>
      </div>
      
      <div className="cart-content">
        <div className="cart-header">
          <h3>سلة التسوق</h3>
          <button className="close-cart" onClick={toggleCart}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>سلة التسوق فارغة</p>
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
                    <span>{item.price.toFixed(0)} درهم</span>
                    {item.quantity > 1 && (
                      <span className="item-total">
                        المجموع: {(item.price * item.quantity).toFixed(0)} درهم
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
              <span>المجموع:</span>
              <span>{cartTotal.price.toFixed(0)} درهم</span>
            </div>
            <div className="cart-actions">
              <Link to="/cart" className="view-cart-btn" onClick={toggleCart}>
                عرض السلة
              </Link>
              <button className="checkout-btn" onClick={handleCheckout}>
                <FontAwesomeIcon icon={faShoppingBag} />
                إتمام الشراء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingCart; 