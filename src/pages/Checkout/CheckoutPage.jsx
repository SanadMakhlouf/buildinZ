import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faCheck, 
  faExclamationTriangle,
  faMapMarkerAlt,
  faCreditCard,
  faMoneyBill,
  faUniversity,
  faShoppingBag,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import AddressManager from '../../components/Profile/AddressManager';
import authService from '../../services/authService';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  
  // Check authentication
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // Redirect to login page with return URL
      navigate('/login?redirect=/checkout');
    }
  }, [navigate]);
  
  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      navigate('/cart');
    }
  }, [cart, navigate, orderSuccess]);
  
  // Handle address selection from AddressManager
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };
  
  // Handle payment method selection
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  // Handle order submission
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Check authentication again
    if (!authService.isAuthenticated()) {
      setError('يرجى تسجيل الدخول لإتمام الطلب');
      navigate('/login?redirect=/checkout');
      return;
    }
    
    if (!selectedAddress) {
      setError('يرجى اختيار عنوان للشحن');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Format order items
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));
      
      // Format shipping address
      const shippingAddress = {
        street: selectedAddress.street || selectedAddress.address_line1,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip_code || selectedAddress.zip,
        country: selectedAddress.country || 'AE'
      };
      
      // Create order payload
      const orderPayload = {
        items: orderItems,
        total_amount: cartTotal.price,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined
      };
      
      console.log('Sending order with token:', localStorage.getItem('token'));
      console.log('Order payload:', orderPayload);
      
      // Send order to API
      const response = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderPayload)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'فشل في إنشاء الطلب');
      }
      
      // Order created successfully
      setOrderSuccess(true);
      setOrderData(data.data.order);
      clearCart(); // Clear the cart after successful order
      
    } catch (err) {
      console.error('Error creating order:', err);
      
      if (err.message.includes('Unauthorized') || err.message.includes('Unauthenticated')) {
        setError('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
        setTimeout(() => {
          navigate('/login?redirect=/checkout');
        }, 2000);
      } else {
        setError(err.message || 'حدث خطأ أثناء إنشاء الطلب');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // If order was successful, show success page
  if (orderSuccess && orderData) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="order-success">
            <div className="success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h1>تم إنشاء الطلب بنجاح!</h1>
            <p>رقم الطلب: <strong>{orderData.order_number}</strong></p>
            <p>تم إرسال تأكيد الطلب إلى بريدك الإلكتروني.</p>
            
            <div className="order-summary">
              <h2>ملخص الطلب</h2>
              <div className="order-details">
                <div className="detail-row">
                  <span>حالة الطلب:</span>
                  <span className="status">{orderData.status === 'pending' ? 'قيد الانتظار' : orderData.status}</span>
                </div>
                <div className="detail-row">
                  <span>المبلغ الإجمالي:</span>
                  <span className="amount">{orderData.total_amount} درهم</span>
                </div>
                <div className="detail-row">
                  <span>طريقة الدفع:</span>
                  <span>{paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : paymentMethod}</span>
                </div>
                <div className="detail-row">
                  <span>حالة الدفع:</span>
                  <span>{orderData.payment_status === 'pending' ? 'قيد الانتظار' : orderData.payment_status}</span>
                </div>
              </div>
            </div>
            
            <div className="success-actions">
              <button 
                className="continue-shopping" 
                onClick={() => navigate('/products')}
              >
                <FontAwesomeIcon icon={faShoppingBag} />
                مواصلة التسوق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!authService.isAuthenticated()) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="auth-required">
            <div className="auth-icon">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <h2>يرجى تسجيل الدخول</h2>
            <p>يجب تسجيل الدخول لإتمام عملية الشراء</p>
            <button 
              className="login-btn" 
              onClick={() => navigate('/login?redirect=/checkout')}
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <h1>إتمام الشراء</h1>
        </div>
        
        <div className="checkout-content">
          <div className="checkout-main">
            {/* Address Selection Section */}
            <div className="checkout-section">
              <h2 className="section-title">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                عنوان الشحن
              </h2>
              
              <div className="address-selection">
                <AddressManager 
                  onAddressSelect={handleAddressSelect} 
                  selectedAddressId={selectedAddress?.id}
                  checkoutMode={true}
                />
              </div>
              
              {error && error.includes('عنوان') && (
                <div className="error-message">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {error}
                </div>
              )}
            </div>
            
            {/* Payment Method Section */}
            <div className="checkout-section">
              <h2 className="section-title">
                <FontAwesomeIcon icon={faCreditCard} />
                طريقة الدفع
              </h2>
              
              <div className="payment-methods">
                <div className="payment-method">
                  <input 
                    type="radio" 
                    id="cash_on_delivery" 
                    name="payment_method" 
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => handlePaymentMethodChange('cash_on_delivery')}
                  />
                  <label htmlFor="cash_on_delivery">
                    <FontAwesomeIcon icon={faMoneyBill} />
                    الدفع عند الاستلام
                  </label>
                </div>
                
                <div className="payment-method">
                  <input 
                    type="radio" 
                    id="credit_card" 
                    name="payment_method" 
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => handlePaymentMethodChange('credit_card')}
                  />
                  <label htmlFor="credit_card">
                    <FontAwesomeIcon icon={faCreditCard} />
                    بطاقة ائتمان
                  </label>
                </div>
                
                <div className="payment-method">
                  <input 
                    type="radio" 
                    id="bank_transfer" 
                    name="payment_method" 
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => handlePaymentMethodChange('bank_transfer')}
                  />
                  <label htmlFor="bank_transfer">
                    <FontAwesomeIcon icon={faUniversity} />
                    تحويل بنكي
                  </label>
                </div>
              </div>
            </div>
            
            {/* Order Notes Section */}
            <div className="checkout-section">
              <h2 className="section-title">ملاحظات الطلب</h2>
              
              <div className="order-notes">
                <textarea
                  placeholder="أضف أي ملاحظات خاصة بالطلب هنا (اختياري)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={4}
                />
                <div className="notes-counter">{notes.length}/500</div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="checkout-sidebar">
            <div className="order-summary">
              <h2>ملخص الطلب</h2>
              
              <div className="summary-items">
                {cart.map(item => (
                  <div className="summary-item" key={item.id}>
                    <div className="item-info">
                      <span className="item-quantity">{item.quantity} x</span>
                      <span className="item-name">{item.name}</span>
                    </div>
                    <div className="item-price">
                      {(item.price * item.quantity).toFixed(0)} درهم
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="summary-totals">
                <div className="total-row">
                  <span>المجموع الفرعي:</span>
                  <span>{cartTotal.price.toFixed(0)} درهم</span>
                </div>
                
                <div className="total-row">
                  <span>الشحن:</span>
                  <span>مجاني</span>
                </div>
                
                <div className="total-row">
                  <span>الضريبة (5%):</span>
                  <span>{(cartTotal.price * 0.05).toFixed(0)} درهم</span>
                </div>
                
                <div className="total-row grand-total">
                  <span>المجموع الكلي:</span>
                  <span>{(cartTotal.price * 1.05).toFixed(0)} درهم</span>
                </div>
              </div>
              
              <button 
                className="place-order-btn" 
                onClick={handleSubmitOrder}
                disabled={loading || !selectedAddress}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    جاري إنشاء الطلب...
                  </>
                ) : (
                  'إتمام الطلب'
                )}
              </button>
              
              {error && !error.includes('عنوان') && (
                <div className="error-message">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 