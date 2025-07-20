import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrash, 
  faPlus, 
  faMinus, 
  faShoppingCart, 
  faArrowLeft,
  faShoppingBag
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

  if (cart.length === 0) {
    return (
      <div className="cart-page empty">
        <div className="container">
          <div className="empty-cart-message">
            <div className="empty-cart-icon">
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <h2>سلة التسوق فارغة</h2>
            <p>لم تقم بإضافة أي منتجات إلى سلة التسوق بعد.</p>
            <Link to="/products" className="continue-shopping-btn">
              <FontAwesomeIcon icon={faArrowLeft} />
              استمر في التسوق
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
      <div className="container">
        <div className="cart-page-header">
          <h1>سلة التسوق</h1>
          <span className="item-count">{cartTotal.items} منتج</span>
        </div>
        
        <div className="cart-page-content">
          <div className="cart-items-container">
            <div className="cart-items-header">
              <div className="product-col">المنتج</div>
              <div className="price-col">السعر</div>
              <div className="quantity-col">الكمية</div>
              <div className="total-col">المجموع</div>
              <div className="actions-col"></div>
            </div>
            
            <div className="cart-items-list">
              {cart.map(item => (
                <div className="cart-item-row" key={item.id}>
                  <div className="product-col">
                    <div className="product-info">
                      <div className="product-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="no-image"></div>
                        )}
                      </div>
                      <div className="product-details">
                        <h3>{item.name}</h3>
                        {item.vendor && <p className="vendor">البائع: {item.vendor}</p>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="price-col">
                    <div className="price">{item.price.toFixed(0)} درهم</div>
                  </div>
                  
                  <div className="quantity-col">
                    <div className="quantity-controls">
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="total-col">
                    <div className="total">{(item.price * item.quantity).toFixed(0)} درهم</div>
                  </div>
                  
                  <div className="actions-col">
                    <button 
                      className="remove-btn" 
                      onClick={() => removeFromCart(item.id)}
                      title="إزالة من السلة"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-actions">
              <button className="clear-cart-btn" onClick={clearCart}>
                إفراغ السلة
              </button>
              <Link to="/products" className="continue-shopping-btn">
                <FontAwesomeIcon icon={faArrowLeft} />
                استمر في التسوق
              </Link>
            </div>
          </div>
          
          <div className="cart-summary">
            <h2>ملخص الطلب</h2>
            
            <div className="summary-row">
              <span>المجموع الفرعي:</span>
              <span>{cartTotal.price.toFixed(0)} درهم</span>
            </div>
            
            <div className="summary-row">
              <span>الشحن:</span>
              <span>مجاني</span>
            </div>
            
            <div className="summary-row">
              <span>الضريبة (5%):</span>
              <span>{(cartTotal.price * 0.05).toFixed(0)} درهم</span>
            </div>
            
            <div className="summary-row total">
              <span>المجموع الكلي:</span>
              <span>{(cartTotal.price * 1.05).toFixed(0)} درهم</span>
            </div>
            
            <div className="checkout-actions">
              <button onClick={handleCheckout} className="checkout-btn">
                <FontAwesomeIcon icon={faShoppingBag} />
                المتابعة إلى الدفع
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 