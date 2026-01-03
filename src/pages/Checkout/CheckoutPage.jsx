import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
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
  faTimes,
  faArrowRight,
  faShieldAlt,
  faTruck
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
  const [paymentStatus, setPaymentStatus] = useState(null);
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
        setOrderData(data.data.order);
        
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
    } else if (location.pathname === '/payment/failure' && sessionId) {
      setPaymentStatus('failure');
    }
  }, [location]);
  
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
  
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setError(null);
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
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
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name
      }));
      
      const shippingAddress = {
        street: selectedAddress.street || selectedAddress.address_line1,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip: selectedAddress.zip_code || selectedAddress.zip,
        country: selectedAddress.country || 'AE',
        phone: selectedAddress.phone || undefined,
        name: selectedAddress.name
      };
      
      const orderPayload = {
        items: orderItems,
        total_amount: cartTotal.price,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined
      };
      
      if (existingOrderId) {
        orderPayload.order_id = existingOrderId;
      }
      
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
      
      setOrderData(data.data.order);
      setOrderSuccess(true);
      localStorage.setItem('lastOrderData', JSON.stringify(data.data.order));
      
      if (paymentMethod === 'credit_card' && (data.data.payment_link || data.data.order.payment_link)) {
        const paymentUrl = data.data.payment_link || data.data.order.payment_link;
        setPaymentLink(paymentUrl);
        setRedirectingToPayment(true);
        clearCart();
        return;
      }
      
      clearCart();
      
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
  
  const handleManualRedirect = () => {
    if (paymentLink) {
      window.location.href = paymentLink;
    }
  };
  
  // Payment Success Page
  if (paymentStatus === 'success') {
    return (
      <div className="checkout-page" dir="rtl">
        <div className="checkout-container">
          <div className="checkout-result checkout-success">
            <div className="result-icon success">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h1>تم الدفع بنجاح!</h1>
            <p>تم استلام الدفع الخاص بك وتأكيد طلبك.</p>
            <div className="result-actions">
              <button className="btn-primary" onClick={() => navigate('/profile')}>
                عرض طلباتي
              </button>
              <button className="btn-secondary" onClick={() => navigate('/products')}>
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
      <div className="checkout-page" dir="rtl">
        <div className="checkout-container">
          <div className="checkout-result checkout-failure">
            <div className="result-icon failure">
              <FontAwesomeIcon icon={faTimes} />
            </div>
            <h1>فشل عملية الدفع</h1>
            <p>لم يتم استكمال عملية الدفع. يمكنك المحاولة مرة أخرى.</p>
            <div className="result-actions">
              <button className="btn-primary" onClick={() => navigate('/checkout')}>
                <FontAwesomeIcon icon={faCreditCard} />
                إعادة المحاولة
              </button>
              <button className="btn-secondary" onClick={() => navigate('/profile')}>
                عرض طلباتي
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Payment Redirect
  if (redirectingToPayment && paymentLink) {
    return (
      <div className="checkout-page" dir="rtl">
        <div className="checkout-container">
          <div className="checkout-redirect">
            <div className="result-icon processing">
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
            <h1>تم إنشاء الطلب بنجاح!</h1>
            <p>رقم الطلب: <strong>{orderData.order_number}</strong></p>
            <p>سيتم تحويلك إلى صفحة الدفع خلال <strong>{secondsToRedirect}</strong> ثواني...</p>
            <div className="redirect-spinner">
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
            <button className="btn-primary" onClick={handleManualRedirect}>
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              الدفع الآن
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Order Success
  if (orderSuccess && orderData) {
    return (
      <div className="checkout-page" dir="rtl">
        <div className="checkout-container">
          <div className="checkout-result checkout-success">
            <div className="result-icon success">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h1>تم إنشاء الطلب بنجاح!</h1>
            <p>رقم الطلب: <strong>{orderData.order_number}</strong></p>
            
            <div className="order-details-card">
              <div className="detail-row">
                <span>حالة الطلب</span>
                <span className="status-badge pending">قيد الانتظار</span>
              </div>
              <div className="detail-row">
                <span>المبلغ الإجمالي</span>
                <span className="amount">{orderData.total_amount} درهم</span>
              </div>
              <div className="detail-row">
                <span>طريقة الدفع</span>
                <span>
                  {paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 
                   paymentMethod === 'credit_card' ? 'بطاقة ائتمان' : 
                   paymentMethod === 'bank_transfer' ? 'تحويل بنكي' : 'الدفع عند الاستلام'}
                </span>
              </div>
            </div>
            
            <div className="result-actions">
              <button className="btn-primary" onClick={() => navigate('/products')}>
                <FontAwesomeIcon icon={faShoppingBag} />
                مواصلة التسوق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Auth Required
  if (!authService.isAuthenticated()) {
    return (
      <div className="checkout-page" dir="rtl">
        <div className="checkout-container">
          <div className="checkout-auth">
            <div className="auth-icon">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <h1>تسجيل الدخول مطلوب</h1>
            <p>يجب تسجيل الدخول لإتمام عملية الشراء</p>
            
            {cart.length > 0 && (
              <div className="auth-cart-preview">
                <span className="cart-badge">{cartTotal.items} منتج</span>
                <span className="cart-total">{cartTotal.price.toFixed(0)} درهم</span>
              </div>
            )}
            
            <div className="auth-buttons">
              <button className="btn-primary" onClick={() => navigate('/login?redirect=/checkout')}>
                <FontAwesomeIcon icon={faLock} />
                تسجيل الدخول
              </button>
              <button className="btn-secondary" onClick={() => navigate('/signup?redirect=/checkout')}>
                إنشاء حساب جديد
              </button>
            </div>
            
            <p className="auth-note">سلة التسوق محفوظة ولن تفقد منتجاتك</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="checkout-page" dir="rtl">
      <Helmet>
        <title>إتمام الشراء | BuildingZ</title>
        <meta name="description" content="أكمل عملية الشراء في BuildingZ - دفع آمن وتوصيل سريع" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://buildingzuae.com/checkout" />
      </Helmet>
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <button className="back-btn" onClick={() => navigate('/cart')}>
            <FontAwesomeIcon icon={faArrowRight} />
            رجوع
          </button>
          <h1>إتمام الشراء</h1>
        </div>
        
        <div className="checkout-layout">
          {/* Main Form */}
          <div className="checkout-form">
            {/* Step 1: Address */}
            <div className="checkout-step">
              <div className="step-header">
                <div className="step-number">1</div>
                <h2>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  عنوان الشحن
                </h2>
              </div>
              <div className="step-content">
                <AddressManager 
                  onAddressSelect={handleAddressSelect} 
                  selectedAddressId={selectedAddress?.id}
                  checkoutMode={true}
                />
              </div>
            </div>
            
            {/* Step 2: Payment */}
            <div className="checkout-step">
              <div className="step-header">
                <div className="step-number">2</div>
                <h2>
                  <FontAwesomeIcon icon={faCreditCard} />
                  طريقة الدفع
                </h2>
              </div>
              <div className="step-content">
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cash_on_delivery"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => handlePaymentMethodChange('cash_on_delivery')}
                    />
                    <FontAwesomeIcon icon={faMoneyBill} />
                    <span>الدفع عند الاستلام</span>
                  </label>
                  
                  <label className={`payment-option ${paymentMethod === 'credit_card' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={() => handlePaymentMethodChange('credit_card')}
                    />
                    <FontAwesomeIcon icon={faCreditCard} />
                    <div>
                      <span>بطاقة ائتمان</span>
                      <small>سيتم تحويلك لصفحة الدفع الآمنة</small>
                    </div>
                  </label>
                  
                  <label className={`payment-option ${paymentMethod === 'bank_transfer' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => handlePaymentMethodChange('bank_transfer')}
                    />
                    <FontAwesomeIcon icon={faUniversity} />
                    <span>تحويل بنكي</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Step 3: Notes (Optional) */}
            <div className="checkout-step">
              <div className="step-header">
                <div className="step-number">3</div>
                <h2>ملاحظات (اختياري)</h2>
              </div>
              <div className="step-content">
                <textarea
                  className="notes-input"
                  placeholder="أضف أي ملاحظات خاصة بالطلب..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {/* Summary Sidebar */}
          <div className="checkout-summary">
            <h2>ملخص الطلب</h2>
            
            <div className="summary-items">
              {cart.map(item => (
                <div className="summary-item" key={item.id}>
                  <span className="item-qty">{item.quantity}×</span>
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">{(item.price * item.quantity).toFixed(0)} د.إ</span>
                </div>
              ))}
            </div>
            
            <div className="summary-totals">
              <div className="total-row">
                <span>المجموع الفرعي</span>
                <span>{cartTotal.price.toFixed(0)} درهم</span>
              </div>
              <div className="total-row">
                <span>الشحن</span>
                <span className="free">مجاني</span>
              </div>
              <div className="total-row grand">
                <span>الإجمالي</span>
                <span>{cartTotal.price.toFixed(0)} درهم</span>
              </div>
            </div>
            
            {error && (
              <div className="checkout-error">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {error}
              </div>
            )}
            
            <button 
              className="submit-order-btn"
              onClick={handleSubmitOrder}
              disabled={loading || !selectedAddress}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري الإرسال...
                </>
              ) : (
                'تأكيد الطلب'
              )}
            </button>
            
            {!selectedAddress && (
              <p className="select-address-hint">يرجى اختيار عنوان الشحن أولاً</p>
            )}
            
            <div className="trust-badges">
              <div className="badge">
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>دفع آمن</span>
              </div>
              <div className="badge">
                <FontAwesomeIcon icon={faTruck} />
                <span>شحن سريع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
