import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faShoppingBag, 
  faClipboardList,
  faHome,
  faCircleCheck,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './PaymentPages.css';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationError, setVerificationError] = useState(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  
  useEffect(() => {
    // Get session ID and order ID from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    
    if (sessionId) {
      // Call API to verify payment
      verifyPayment(sessionId, orderId);
    } else {
      // No session ID, try to get order info from localStorage
      tryGetOrderFromStorage();
    }
  }, [location]);
  
  const verifyPayment = (sessionId, orderId) => {
    setIsLoading(true);
    setVerificationError(null);
    
    // Call API to verify payment
    fetch('http://localhost:8000/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        session_id: sessionId,
        order_id: orderId
      })
    })
    .then(response => response.json())
    .then(data => {
      setIsLoading(false);
      
      if (data.success) {
        // Payment successful
        setPaymentVerified(true);
        if (data.data && data.data.order) {
          setOrderData(data.data.order);
          setOrderNumber(data.data.order.order_number);
          
          // Update stored order data
          localStorage.setItem('lastOrderData', JSON.stringify(data.data.order));
        } else {
          // If API doesn't return order details, try to get from localStorage
          tryGetOrderFromStorage();
        }
      } else {
        // Payment failed or incomplete
        setVerificationError(data.message || 'فشل في التحقق من حالة الدفع');
        tryGetOrderFromStorage(); // Still try to show order info
      }
    })
    .catch(error => {
      console.error('Error verifying payment:', error);
      setIsLoading(false);
      setVerificationError('حدث خطأ أثناء التحقق من حالة الدفع');
      tryGetOrderFromStorage(); // Still try to show order info
    });
  };
  
  const tryGetOrderFromStorage = () => {
    // Try to get order info from localStorage
    const storedOrderData = localStorage.getItem('lastOrderData');
    if (storedOrderData) {
      try {
        const orderData = JSON.parse(storedOrderData);
        setOrderData(orderData);
        setOrderNumber(orderData.order_number);
      } catch (e) {
        console.error('Error parsing order data:', e);
      }
    }
    
    setIsLoading(false);
  };
  
  const handleViewOrders = () => {
    navigate('/profile');
  };
  
  const handleContinueShopping = () => {
    navigate('/products');
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="payment-page success-page">
        <div className="container">
          <div className="payment-card">
            <div className="loading-spinner">
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
            <h2>جاري التحقق من حالة الدفع...</h2>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="payment-page success-page">
      <div className="container">
        <div className="payment-card">
          <div className="success-checkmark">
            <FontAwesomeIcon icon={faCircleCheck} className="success-icon-header" />
          </div>
          
          <h1>شكراً لك!</h1>
          <h2>تم استلام طلبك بنجاح</h2>
          
          {verificationError && (
            <div className="verification-error">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <p>{verificationError}</p>
              <p>سنقوم بالتحقق من حالة الدفع يدوياً وتحديث طلبك.</p>
            </div>
          )}
          
          {orderNumber && (
            <div className="order-info">
              <p>رقم الطلب: <strong>{orderNumber}</strong></p>
              {paymentVerified && (
                <div className="payment-verified">
                  <FontAwesomeIcon icon={faCheck} />
                  تم تأكيد الدفع
                </div>
              )}
            </div>
          )}
          
          <div className="success-message">
            <p>تم استلام طلبك وسيتم معالجته في أقرب وقت.</p>
            <p>سيتم إرسال تفاصيل الطلب والشحن إلى بريدك الإلكتروني.</p>
          </div>
          
          <div className="payment-actions">
            <button 
              className="action-button primary" 
              onClick={handleViewOrders}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              عرض طلباتي
            </button>
            
            <button 
              className="action-button secondary" 
              onClick={handleContinueShopping}
            >
              <FontAwesomeIcon icon={faShoppingBag} />
              مواصلة التسوق
            </button>
            
            <button 
              className="action-button tertiary" 
              onClick={handleGoHome}
            >
              <FontAwesomeIcon icon={faHome} />
              الصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 