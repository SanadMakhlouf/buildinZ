import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faCreditCard, 
  faClipboardList,
  faHome,
  faCircleXmark,
  faSpinner,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import './PaymentPages.css';

const PaymentFailurePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderNumber, setOrderNumber] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('لم تتم عملية الدفع بنجاح');
  
  useEffect(() => {
    // Get session ID and order ID from URL parameters
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const errorMsg = searchParams.get('error');
    
    if (errorMsg) {
      setErrorMessage(decodeURIComponent(errorMsg));
    }
    
    if (sessionId) {
      // Verify payment status (even though we're on failure page)
      verifyPayment(sessionId, orderId);
    } else {
      // No session ID, try to get order info from localStorage
      tryGetOrderFromStorage();
    }
  }, [location]);
  
  const verifyPayment = (sessionId, orderId) => {
    setIsLoading(true);
    
    // Call API to verify payment
    fetch('http://127.0.0.1:8000/api/payments/verify', {
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
        // If payment actually succeeded, redirect to success page
        navigate('/payment/success?session_id=' + sessionId);
      } else {
        // Payment failed - get error message
        if (data.message) {
          setErrorMessage(data.message);
        }
        
        // Try to get order info
        if (data.data && data.data.order) {
          setOrderData(data.data.order);
          setOrderNumber(data.data.order.order_number);
        } else {
          tryGetOrderFromStorage();
        }
      }
    })
    .catch(error => {
      console.error('Error verifying payment:', error);
      setIsLoading(false);
      tryGetOrderFromStorage();
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
  
  const handleRetryPayment = () => {
    if (orderData && orderData.id) {
      // If we have order ID, redirect to checkout with order ID
      navigate(`/checkout?order_id=${orderData.id}`);
    } else {
      // Otherwise just go to checkout
      navigate('/checkout');
    }
  };
  
  const handleViewOrders = () => {
    navigate('/profile');
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="payment-page failure-page">
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
    <div className="payment-page failure-page">
      <div className="container">
        <div className="payment-card">
          <div className="failure-checkmark">
            <FontAwesomeIcon icon={faCircleXmark} className="failure-icon-header" />
          </div>
          
          <h1>فشل عملية الدفع</h1>
          <h2>{errorMessage}</h2>
          
          {orderNumber && (
            <div className="order-info">
              <p>رقم الطلب: <strong>{orderNumber}</strong></p>
            </div>
          )}
          
          <div className="failure-message">
            <p>لم نتمكن من معالجة عملية الدفع الخاصة بك.</p>
            <p>يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.</p>
            <p>إذا استمرت المشكلة، يرجى التواصل مع خدمة العملاء.</p>
          </div>
          
          <div className="payment-actions">
            <button 
              className="action-button primary" 
              onClick={handleRetryPayment}
            >
              <FontAwesomeIcon icon={faCreditCard} />
              إعادة المحاولة
            </button>
            
            <button 
              className="action-button secondary" 
              onClick={handleViewOrders}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              عرض طلباتي
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

export default PaymentFailurePage; 