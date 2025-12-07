import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../../config/apiConfig';
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
  faLock,
  faExternalLinkAlt,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../../context/CartContext';
import AddressManager from '../../components/Profile/AddressManager';
import authService from '../../services/authService';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, cartTotal, clearCart } = useCart();
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failure', null
  const [secondsToRedirect, setSecondsToRedirect] = useState(3);
  const [existingOrderId, setExistingOrderId] = useState(null);
  const [loadingExistingOrder, setLoadingExistingOrder] = useState(false);
  
  // Check for order_id parameter (for retrying payment)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('order_id');
    
    if (orderId) {
      setExistingOrderId(orderId);
      fetchExistingOrder(orderId);
    }
  }, [location]);
  
  // Fetch existing order details if order_id is provided
  const fetchExistingOrder = async (orderId) => {
    if (!authService.isAuthenticated()) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    
    setLoadingExistingOrder(true);
    
    try {
      const response = await fetch(`${config.BACKEND_URL}/api/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Set order data
        setOrderData(data.data.order);
        
        // Pre-fill form with order data
        if (data.data.order.shipping_address) {
          // Find matching address in address manager
          // This will be handled by the AddressManager component
        }
        
        if (data.data.order.payment_method) {
          setPaymentMethod(data.data.order.payment_method);
        }
        
        if (data.data.order.notes) {
          setNotes(data.data.order.notes);
        }
      } else {
        setError('لم نتمكن من العثور على الطلب المطلوب');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('حدث خطأ أثناء جلب بيانات الطلب');
    } finally {
      setLoadingExistingOrder(false);
    }
  };
  
  // Check for payment success/failure from URL params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');
    
    if (location.pathname === '/payment/success' && sessionId) {
      setPaymentStatus('success');
      // Fetch order details by session ID if needed
      // For now, we'll just show a success message
    } else if (location.pathname === '/payment/failure' && sessionId) {
      setPaymentStatus('failure');
    }
  }, [location]);
  
  // Don't redirect automatically - show auth prompt instead
  // useEffect removed - we'll show auth prompt in the UI
  
  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderSuccess && !paymentStatus) {
      navigate('/cart');
    }
  }, [cart, navigate, orderSuccess, paymentStatus]);
  
  // Countdown timer for payment redirect
  useEffect(() => {
    let timer;
    if (redirectingToPayment && secondsToRedirect > 0) {
      timer = setTimeout(() => {
        setSecondsToRedirect(seconds => seconds - 1);
      }, 1000);
    } else if (redirectingToPayment && secondsToRedirect === 0 && paymentLink) {
      window.location.href = paymentLink;
    }
    
    return () => clearTimeout(timer);
  }, [redirectingToPayment, secondsToRedirect, paymentLink]);
  
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
        country: selectedAddress.country || 'AE',
        phone: selectedAddress.phone || undefined,
        name: selectedAddress.name
      };
      
      // Create order payload
      const orderPayload = {
        items: orderItems,
        total_amount: cartTotal.price,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined
      };
      
      // If we have an existing order ID, add it to the payload
      if (existingOrderId) {
        orderPayload.order_id = existingOrderId;
      }
      
      console.log('Sending order with token:', localStorage.getItem('token'));
      console.log('Order payload:', orderPayload);
      
      // Send order to API
      const response = await fetch(`${config.BACKEND_URL}/api/orders`, {
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
      
      // Set order data first for both payment methods
      setOrderData(data.data.order);
      setOrderSuccess(true);
      
      // Store order data in localStorage for the success page to access
      localStorage.setItem('lastOrderData', JSON.stringify(data.data.order));
      
      // Check if payment link is returned (for credit card payments)
      if (paymentMethod === 'credit_card' && (data.data.payment_link || data.data.order.payment_link)) {
        const paymentUrl = data.data.payment_link || data.data.order.payment_link;
        setPaymentLink(paymentUrl);
        
        // Show payment redirection message
        setRedirectingToPayment(true);
        
        // Clear cart after successful order
        clearCart();
        
        return;
      }
      
      // For non-credit card payments, show success directly
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
  
  // Handle manual redirect to payment
  const handleManualRedirect = () => {
    if (paymentLink) {
      window.location.href = paymentLink;
    }
  };
  
  // Payment Success Page
  if (paymentStatus === 'success') {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="payment-result payment-success">
            <div className="payment-icon success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h1>تم الدفع بنجاح!</h1>
            <p>تم استلام الدفع الخاص بك وتأكيد طلبك.</p>
            <p>سيتم إرسال تأكيد الطلب إلى بريدك الإلكتروني.</p>
            
            <div className="payment-actions">
              <button 
                className="view-orders-btn" 
                onClick={() => navigate('/profile')}
              >
                عرض طلباتي
              </button>
              
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
  
  // Payment Failure Page
  if (paymentStatus === 'failure') {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="payment-result payment-failure">
            <div className="payment-icon failure-icon">
              <FontAwesomeIcon icon={faTimes} />
            </div>
            <h1>فشل عملية الدفع</h1>
            <p>لم يتم استكمال عملية الدفع بنجاح.</p>
            <p>يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.</p>
            
            <div className="payment-actions">
              <button 
                className="retry-payment-btn" 
                onClick={() => navigate('/checkout')}
              >
                <FontAwesomeIcon icon={faCreditCard} />
                إعادة المحاولة
              </button>
              
              <button 
                className="view-orders-btn" 
                onClick={() => navigate('/profile')}
              >
                عرض طلباتي
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // If redirecting to payment
  if (redirectingToPayment && paymentLink) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="payment-redirect">
            <div className="payment-icon">
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
            <h1>تم إنشاء الطلب بنجاح!</h1>
            <p>رقم الطلب: <strong>{orderData.order_number}</strong></p>
            <p>سيتم تحويلك إلى صفحة الدفع خلال <strong>{secondsToRedirect}</strong> ثواني...</p>
            
            <div className="redirect-spinner">
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
            
            <div className="manual-redirect">
              <button 
                className="payment-link-btn" 
                onClick={handleManualRedirect}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} />
                الدفع الآن
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
                  <span>{paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 
                         paymentMethod === 'credit_card' ? 'بطاقة ائتمان' : 
                         paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 
                         'الدفع عند الاستلام'}</span>
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
  
  // Show authentication prompt if not logged in
  if (!authService.isAuthenticated()) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-auth-required">
            <div className="auth-prompt-card">
              <div className="auth-icon-large">
                <FontAwesomeIcon icon={faLock} />
              </div>
              
              <h1>تسجيل الدخول مطلوب</h1>
              
              <div className="auth-info-box">
                <div className="info-item">
                  <FontAwesomeIcon icon={faShoppingBag} />
                  <div className="info-text">
                    <strong>لإتمام عملية الشراء</strong>
                    <p>يجب تسجيل الدخول لإنشاء الطلب ومعالجة الدفع</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <FontAwesomeIcon icon={faCheck} />
                  <div className="info-text">
                    <strong>عربة التسوق الخاصة بك آمنة</strong>
                    <p>لا تقلق، لن نفقد أي منتجات من سلة التسوق الخاصة بك</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <FontAwesomeIcon icon={faShoppingBag} />
                  <div className="info-text">
                    <strong>عملية سريعة وسهلة</strong>
                    <p>سجل الدخول أو أنشئ حساباً جديداً في ثوانٍ</p>
                  </div>
                </div>
              </div>

              {cart.length > 0 && (
                <div className="cart-preview">
                  <h3>سلة التسوق الخاصة بك ({cartTotal.items} منتج)</h3>
                  <div className="cart-items-preview">
                    {cart.slice(0, 3).map(item => (
                      <div key={item.id} className="cart-preview-item">
                        <div className="preview-item-image">
                          {item.image ? (
                            <img src={item.image} alt={item.name} />
                          ) : (
                            <FontAwesomeIcon icon={faShoppingBag} />
                          )}
                        </div>
                        <div className="preview-item-info">
                          <span className="preview-item-name">{item.name}</span>
                          <span className="preview-item-quantity">{item.quantity} × {item.price.toFixed(0)} درهم</span>
                        </div>
                      </div>
                    ))}
                    {cart.length > 3 && (
                      <div className="more-items">
                        + {cart.length - 3} منتج آخر
                      </div>
                    )}
                  </div>
                  <div className="cart-total-preview">
                    <span>المجموع الكلي:</span>
                    <span className="total-amount">{(cartTotal.price * 1.05).toFixed(0)} درهم</span>
                  </div>
                </div>
              )}
              
              <div className="auth-actions">
                <button 
                  className="login-btn-primary" 
                  onClick={() => navigate('/login?redirect=/checkout')}
                >
                  <FontAwesomeIcon icon={faLock} />
                  تسجيل الدخول
                </button>
                
                <button 
                  className="signup-btn-secondary" 
                  onClick={() => navigate('/signup?redirect=/checkout')}
                >
                  إنشاء حساب جديد
                </button>
              </div>
              
              <div className="auth-footer">
                <p>لا تقلق، سلة التسوق الخاصة بك آمنة وسيتم حفظها تلقائياً</p>
              </div>
            </div>
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
                    <span className="payment-note">
                      (سيتم تحويلك إلى صفحة الدفع الآمنة)
                    </span>
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