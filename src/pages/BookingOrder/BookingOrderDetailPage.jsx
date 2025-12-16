import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faCalendar,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCreditCard,
  faMoneyBill,
  faUniversity,
  faFileDownload,
  faImage,
  faShoppingBag,
  faTools,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import config from '../../config/apiConfig';
import './BookingOrderDetailPage.css';

const BookingOrderDetailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const orderNumber = searchParams.get('order_number');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!orderNumber || !email) {
      setError('يرجى توفير رقم الطلب والبريد الإلكتروني');
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [orderNumber, email]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `${config.API_BASE_URL}/service-builder/booking-order?order_number=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          setError('البريد الإلكتروني غير متطابق مع الطلب. يرجى التحقق من البريد الإلكتروني المستخدم في الطلب.');
        } else if (response.status === 404) {
          setError('الطلب غير موجود. يرجى التحقق من رقم الطلب.');
        } else {
          setError(data.message || 'حدث خطأ أثناء جلب بيانات الطلب');
        }
        return;
      }

      if (data.success) {
        setOrderData(data.data);
      } else {
        setError(data.message || 'فشل في جلب بيانات الطلب');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'قيد الانتظار', color: '#ffc107', icon: faSpinner },
      confirmed: { text: 'مؤكد', color: '#17a2b8', icon: faCheckCircle },
      processing: { text: 'قيد المعالجة', color: '#007bff', icon: faSpinner },
      completed: { text: 'مكتمل', color: '#28a745', icon: faCheckCircle },
      cancelled: { text: 'ملغي', color: '#dc3545', icon: faTimesCircle },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || statusMap.pending;
    return (
      <span className="status-badge" style={{ backgroundColor: statusInfo.color }}>
        <FontAwesomeIcon icon={statusInfo.icon} />
        {statusInfo.text}
      </span>
    );
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      cash_on_delivery: 'الدفع عند الاستلام',
      credit_card: 'بطاقة ائتمان',
      bank_transfer: 'تحويل بنكي',
    };
    return methods[method] || method;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Handle string paths
    if (typeof imagePath === 'string') {
      if (imagePath.startsWith('http')) return imagePath;
      return `${config.BACKEND_URL}${config.endpoints.storage}/${imagePath}`;
    }
    
    // Handle objects with url or path property
    if (typeof imagePath === 'object') {
      const url = imagePath.url || imagePath.path || imagePath.image_url || imagePath.image;
      if (url) {
        if (typeof url === 'string') {
          if (url.startsWith('http')) return url;
          return `${config.BACKEND_URL}${config.endpoints.storage}/${url}`;
        }
      }
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="booking-order-page">
        <div className="container">
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>جاري تحميل بيانات الطلب...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-order-page">
        <div className="container">
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <h2>خطأ</h2>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <FontAwesomeIcon icon={faArrowLeft} />
              العودة للصفحة الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  const order = orderData;
  const orderDetails = order.order_details || {};
  const customer = order.customer || {};
  const pricing = order.pricing || {};
  const payment = order.payment || {};
  const invoice = order.invoice || {};

  return (
    <div className="booking-order-page">
      <div className="container">
        <button className="back-button" onClick={() => navigate('/')}>
          <FontAwesomeIcon icon={faArrowLeft} />
          العودة
        </button>

        <div className="order-header">
          <h1>تفاصيل الطلب</h1>
          <div className="order-number-badge">
            رقم الطلب: <strong>{order.order_number}</strong>
          </div>
        </div>

        {/* Order Status */}
        <div className="order-status-section">
          {getStatusBadge(orderDetails.status)}
          {orderDetails.status_arabic && (
            <span className="status-ar">{orderDetails.status_arabic}</span>
          )}
        </div>

        {/* Service Information */}
        {order.service && (
          <div className="info-card">
            <h2>
              <FontAwesomeIcon icon={faTools} />
              معلومات الخدمة
            </h2>
            <div className="service-info">
              {order.service.images && order.service.images.length > 0 && (
                <div className="service-images">
                  {order.service.images.map((img, idx) => {
                    const imageUrl = img.url || getImageUrl(img);
                    if (!imageUrl) return null;
                    return (
                      <img
                        key={img.id || idx}
                        src={imageUrl}
                        alt={order.service.name}
                        className="service-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    );
                  })}
                </div>
              )}
              <div className="service-details">
                <h3>{order.service.name}</h3>
                {order.service.description && (
                  <p>{order.service.description}</p>
                )}
                {order.service.category && (
                  <p className="category">
                    <strong>الفئة:</strong> {order.service.category.name || order.service.category}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Information */}
        <div className="info-card">
          <h2>
            <FontAwesomeIcon icon={faUser} />
            معلومات العميل
          </h2>
          <div className="customer-info-grid">
            <div className="info-item">
              <FontAwesomeIcon icon={faUser} />
              <div>
                <label>الاسم</label>
                <p>{customer.name}</p>
              </div>
            </div>
            {customer.email && (
              <div className="info-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <div>
                  <label>البريد الإلكتروني</label>
                  <p>{customer.email}</p>
                </div>
              </div>
            )}
            {customer.phone && (
              <div className="info-item">
                <FontAwesomeIcon icon={faPhone} />
                <div>
                  <label>رقم الهاتف</label>
                  <p>{customer.phone}</p>
                </div>
              </div>
            )}
            {customer.emirate && (
              <div className="info-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <div>
                  <label>الإمارة</label>
                  <p>{customer.emirate}</p>
                </div>
              </div>
            )}
            {orderDetails.preferred_date_formatted && (
              <div className="info-item">
                <FontAwesomeIcon icon={faCalendar} />
                <div>
                  <label>التاريخ المفضل</label>
                  <p>{orderDetails.preferred_date_formatted}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Field Values */}
        {order.field_values && order.field_values.length > 0 && (
          <div className="info-card">
            <h2>الخيارات المختارة</h2>
            <div className="field-values-grid">
              {order.field_values.map((field, idx) => (
                <div key={field.field_id || idx} className="field-value-item">
                  <h4>{field.field_label}</h4>
                  {field.selected_option && (
                    <div className="field-option">
                      {field.selected_option.image_url && (() => {
                        const imageUrl = getImageUrl(field.selected_option.image_url);
                        return imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={field.selected_option.option_label}
                            className="option-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : null;
                      })()}
                      <p>{field.selected_option.option_label || field.value}</p>
                      {field.selected_option.price_modifier !== undefined && field.selected_option.price_modifier !== 0 && (
                        <span className="price-adjustment">
                          {field.selected_option.price_modifier > 0 ? '+' : ''}{field.selected_option.price_modifier} {pricing.currency || 'درهم'}
                        </span>
                      )}
                    </div>
                  )}
                  {!field.selected_option && field.value && (
                    <div className="field-value-text">
                      <p>{field.value} {field.field_unit || ''}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {order.products && order.products.length > 0 && (
          <div className="info-card">
            <h2>
              <FontAwesomeIcon icon={faShoppingBag} />
              المنتجات المطلوبة
            </h2>
            <div className="products-list">
              {order.products.map((product, idx) => (
                <div key={idx} className="product-item">
                  {product.image && (() => {
                    const imageUrl = getImageUrl(product.image);
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null;
                  })()}
                  <div className="product-details">
                    <h4>{product.name}</h4>
                    <p>الكمية: {product.quantity}</p>
                    {product.unit_price && (
                      <p>السعر: {product.unit_price} {pricing.currency || 'درهم'}</p>
                    )}
                    {product.total && (
                      <p className="product-total">
                        المجموع: {product.total} {pricing.currency || 'درهم'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files */}
        {order.uploaded_files && order.uploaded_files.length > 0 && (
          <div className="info-card">
            <h2>
              <FontAwesomeIcon icon={faFileDownload} />
              الملفات المرفقة
            </h2>
            <div className="files-list">
              {order.uploaded_files.map((file, idx) => (
                <a
                  key={idx}
                  href={file.download_url || getImageUrl(file.url) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="file-item"
                >
                  <FontAwesomeIcon icon={faImage} />
                  <span>{file.name || `ملف ${idx + 1}`}</span>
                  <FontAwesomeIcon icon={faFileDownload} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Pricing Breakdown */}
        {pricing && (
          <div className="info-card pricing-card">
            {pricing.total_amount === 0 ? (
              <div className="coming-soon-message">
                <FontAwesomeIcon icon={faCheckCircle} size="2x" />
                <h2>الطلب قيد المعالجة</h2>
                <p>سيتم التواصل معك قريباً لتأكيد الطلب وتحديد السعر النهائي</p>
              </div>
            ) : (
              <>
                <h2>تفاصيل التسعير</h2>
                <div className="pricing-breakdown">
                  {pricing.subtotal !== undefined && (
                    <div className="pricing-row">
                      <span>المجموع الفرعي:</span>
                      <span>{pricing.subtotal} {pricing.currency || 'درهم'}</span>
                    </div>
                  )}
                  {pricing.tax_amount !== undefined && pricing.tax_amount > 0 && (
                    <div className="pricing-row">
                      <span>الضريبة:</span>
                      <span>{pricing.tax_amount} {pricing.currency || 'درهم'}</span>
                    </div>
                  )}
                  {pricing.shipping_cost !== undefined && (
                    <div className="pricing-row">
                      <span>الشحن:</span>
                      <span>
                        {pricing.shipping_cost > 0
                          ? `${pricing.shipping_cost} ${pricing.currency || 'درهم'}`
                          : 'مجاني'}
                      </span>
                    </div>
                  )}
                  {pricing.discount_amount !== undefined && pricing.discount_amount > 0 && (
                    <div className="pricing-row discount">
                      <span>الخصم:</span>
                      <span>-{pricing.discount_amount} {pricing.currency || 'درهم'}</span>
                    </div>
                  )}
                  <div className="pricing-row total">
                    <span>المجموع الكلي:</span>
                    <span>{pricing.total_amount} {pricing.currency || 'درهم'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Payment Information */}
        {payment.method && (
          <div className="info-card">
            <h2>
              <FontAwesomeIcon
                icon={
                  payment.method === 'credit_card'
                    ? faCreditCard
                    : payment.method === 'bank_transfer'
                    ? faUniversity
                    : faMoneyBill
                }
              />
              معلومات الدفع
            </h2>
            <div className="payment-info">
              <div className="info-item">
                <label>طريقة الدفع:</label>
                <p>{getPaymentMethodText(payment.method)}</p>
              </div>
              <div className="info-item">
                <label>حالة الدفع:</label>
                <p>
                  {orderDetails.payment_status_arabic || (
                    orderDetails.payment_status === 'paid'
                      ? 'مدفوع'
                      : orderDetails.payment_status === 'pending'
                      ? 'قيد الانتظار'
                      : 'غير مدفوع'
                  )}
                </p>
              </div>
              {payment.link && payment.has_payment_link && orderDetails.payment_status !== 'paid' && (
                <a
                  href={payment.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary payment-link-btn"
                >
                  <FontAwesomeIcon icon={faCreditCard} />
                  إتمام الدفع الآن
                </a>
              )}
            </div>
          </div>
        )}

        {/* Addresses */}
        {(order.shipping_address || order.billing_address) && (
          <div className="info-card">
            <h2>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              العناوين
            </h2>
            <div className="addresses-grid">
              {order.shipping_address && (
                <div className="address-item">
                  <h4>عنوان الشحن</h4>
                  <p>{order.shipping_address.name}</p>
                  <p>
                    {order.shipping_address.street}, {order.shipping_address.city}
                    {order.shipping_address.state && `, ${order.shipping_address.state}`}
                  </p>
                  {order.shipping_address.phone && (
                    <p>
                      <FontAwesomeIcon icon={faPhone} /> {order.shipping_address.phone}
                    </p>
                  )}
                </div>
              )}
              {order.billing_address && (
                <div className="address-item">
                  <h4>عنوان الفوترة</h4>
                  <p>{order.billing_address.name}</p>
                  <p>
                    {order.billing_address.street}, {order.billing_address.city}
                    {order.billing_address.state && `, ${order.billing_address.state}`}
                  </p>
                  {order.billing_address.phone && (
                    <p>
                      <FontAwesomeIcon icon={faPhone} /> {order.billing_address.phone}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoice */}
        {invoice && (invoice.has_invoice || invoice.invoice_number || invoice.invoice_url) && (
          <div className="info-card">
            <h2>
              <FontAwesomeIcon icon={faFileDownload} />
              الفاتورة
            </h2>
            <div className="invoice-info">
              {invoice.invoice_number && (
                <p>
                  <strong>رقم الفاتورة:</strong> {invoice.invoice_number}
                </p>
              )}
              {invoice.invoice_generated_at && (
                <p>
                  <strong>تاريخ الإصدار:</strong> {new Date(invoice.invoice_generated_at).toLocaleDateString('ar-SA')}
                </p>
              )}
              {invoice.invoice_url && (
                <a
                  href={invoice.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <FontAwesomeIcon icon={faFileDownload} />
                  تحميل الفاتورة
                </a>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {orderDetails.notes && (
          <div className="info-card">
            <h2>ملاحظات</h2>
            <p>{orderDetails.notes}</p>
          </div>
        )}

        {/* Order Dates */}
        <div className="info-card">
          <h2>التواريخ</h2>
          <div className="dates-grid">
            {orderDetails.created_at_formatted && (
              <div className="date-item">
                <FontAwesomeIcon icon={faCalendar} />
                <div>
                  <label>تاريخ الطلب</label>
                  <p>{orderDetails.created_at_formatted}</p>
                </div>
              </div>
            )}
            {orderDetails.estimated_delivery_formatted && (
              <div className="date-item">
                <FontAwesomeIcon icon={faCalendar} />
                <div>
                  <label>تاريخ التسليم المتوقع</label>
                  <p>{orderDetails.estimated_delivery_formatted}</p>
                </div>
              </div>
            )}
            {orderDetails.preferred_date_formatted && (
              <div className="date-item">
                <FontAwesomeIcon icon={faCalendar} />
                <div>
                  <label>التاريخ المفضل للخدمة</label>
                  <p>{orderDetails.preferred_date_formatted}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingOrderDetailPage;
