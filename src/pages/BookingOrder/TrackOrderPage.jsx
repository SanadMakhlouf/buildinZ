import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faSpinner,
  faExclamationTriangle,
  faEnvelope,
  faHashtag
} from '@fortawesome/free-solid-svg-icons';
import './TrackOrderPage.css';

const TrackOrderPage = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!orderNumber.trim()) {
      setError('يرجى إدخال رقم الطلب');
      return;
    }

    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    // Navigate to booking order detail page
    navigate(`/booking-order?order_number=${encodeURIComponent(orderNumber.trim())}&email=${encodeURIComponent(email.trim())}`);
  };

  return (
    <div className="track-order-page">
      <div className="container">
        <div className="track-order-card">
          <div className="track-order-header">
            <h1>تتبع طلبك</h1>
            <p>أدخل رقم الطلب والبريد الإلكتروني لعرض تفاصيل طلبك</p>
          </div>

          <form onSubmit={handleSubmit} className="track-order-form">
            {error && (
              <div className="error-message">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="order_number">
                <FontAwesomeIcon icon={faHashtag} />
                رقم الطلب
              </label>
              <input
                type="text"
                id="order_number"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="مثال: SB-CYH1JP172S"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <FontAwesomeIcon icon={faEnvelope} />
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className="track-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري البحث...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSearch} />
                  تتبع الطلب
                </>
              )}
            </button>
          </form>

          <div className="track-order-help">
            <h3>لم تجد رقم الطلب؟</h3>
            <p>يمكنك العثور على رقم الطلب في:</p>
            <ul>
              <li>البريد الإلكتروني التأكيدي الذي تم إرساله إليك</li>
              <li>صفحة الملف الشخصي في قسم "طلبات الخدم"</li>
              <li>رسالة SMS التأكيدية (إن وجدت)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
