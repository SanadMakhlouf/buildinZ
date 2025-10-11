import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faSave, 
  faEnvelope, 
  faMobile,
  faShoppingCart,
  faTruck,
  faUserCog,
  faCheckDouble,
  faBullhorn,
  faSpinner,
  faCheck,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import notificationService from '../../services/notificationService';
import './NotificationPreferencesPage.css';

const NotificationPreferencesPage = () => {
  const [preferences, setPreferences] = useState({
    order_confirmation_email: true,
    order_confirmation_push: true,
    order_status_email: true,
    order_status_push: true,
    handyman_assigned_email: true,
    handyman_assigned_push: true,
    service_completed_email: true,
    service_completed_push: true,
    marketing_email: false,
    marketing_push: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', null
  const [testNotificationLoading, setTestNotificationLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getPreferences();
      
      if (response.success && response.preferences) {
        setPreferences(response.preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear save status when user makes changes
    setSaveStatus(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus(null);
      
      const response = await notificationService.updatePreferences(preferences);
      
      if (response.success) {
        setSaveStatus('success');
        // Update preferences with server response
        if (response.preferences) {
          setPreferences(response.preferences);
        }
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      setTestNotificationLoading(true);
      await notificationService.sendTestNotification();
      alert('تم إرسال إشعار تجريبي بنجاح!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      alert('حدث خطأ أثناء إرسال الإشعار التجريبي');
    } finally {
      setTestNotificationLoading(false);
    }
  };

  const preferenceCategories = [
    {
      title: 'إشعارات الطلبات',
      icon: faShoppingCart,
      color: '#007bff',
      preferences: [
        {
          key: 'order_confirmation',
          title: 'تأكيد الطلب',
          description: 'إشعار عند تأكيد طلبك الجديد'
        },
        {
          key: 'order_status',
          title: 'حالة الطلب',
          description: 'إشعار عند تغيير حالة الطلب أو الشحن'
        }
      ]
    },
    {
      title: 'إشعارات الخدمات',
      icon: faUserCog,
      color: '#6f42c1',
      preferences: [
        {
          key: 'handyman_assigned',
          title: 'تعيين فني',
          description: 'إشعار عند تعيين فني لطلب الخدمة'
        },
        {
          key: 'service_completed',
          title: 'اكتمال الخدمة',
          description: 'إشعار عند اكتمال الخدمة المطلوبة'
        }
      ]
    },
    {
      title: 'الإشعارات التسويقية',
      icon: faBullhorn,
      color: '#fd7e14',
      preferences: [
        {
          key: 'marketing',
          title: 'العروض والتسويق',
          description: 'إشعارات حول العروض الخاصة والمنتجات الجديدة'
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="preferences-page">
        <div className="container">
          <div className="loading-state">
            <FontAwesomeIcon icon={faSpinner} spin />
            <p>جاري تحميل الإعدادات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="preferences-page">
      <div className="container">
        {/* Header */}
        <div className="preferences-header">
          <h1>
            <FontAwesomeIcon icon={faBell} />
            إعدادات الإشعارات
          </h1>
          <p>اختر كيف تريد تلقي الإشعارات والتحديثات</p>
        </div>

        {/* Save Status */}
        {saveStatus && (
          <div className={`save-status ${saveStatus}`}>
            <FontAwesomeIcon 
              icon={saveStatus === 'success' ? faCheck : faExclamationTriangle} 
            />
            <span>
              {saveStatus === 'success' 
                ? 'تم حفظ الإعدادات بنجاح' 
                : 'حدث خطأ أثناء حفظ الإعدادات'
              }
            </span>
          </div>
        )}

        {/* Preferences Form */}
        <div className="preferences-form">
          {preferenceCategories.map((category) => (
            <div key={category.title} className="preference-category">
              <div className="category-header">
                <div className="category-icon" style={{ color: category.color }}>
                  <FontAwesomeIcon icon={category.icon} />
                </div>
                <h2>{category.title}</h2>
              </div>

              <div className="category-preferences">
                {category.preferences.map((pref) => (
                  <div key={pref.key} className="preference-item">
                    <div className="preference-info">
                      <h3>{pref.title}</h3>
                      <p>{pref.description}</p>
                    </div>

                    <div className="preference-controls">
                      <div className="control-group">
                        <label className="control-label">
                          <FontAwesomeIcon icon={faEnvelope} />
                          البريد الإلكتروني
                        </label>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences[`${pref.key}_email`]}
                            onChange={(e) => 
                              handlePreferenceChange(`${pref.key}_email`, e.target.checked)
                            }
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>

                      <div className="control-group">
                        <label className="control-label">
                          <FontAwesomeIcon icon={faMobile} />
                          الإشعارات المباشرة
                        </label>
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={preferences[`${pref.key}_push`]}
                            onChange={(e) => 
                              handlePreferenceChange(`${pref.key}_push`, e.target.checked)
                            }
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Actions */}
          <div className="preferences-actions">
            <button
              className="test-notification-btn"
              onClick={handleSendTestNotification}
              disabled={testNotificationLoading}
            >
              {testNotificationLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faBell} />
                  إرسال إشعار تجريبي
                </>
              )}
            </button>

            <button
              className="save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} />
                  حفظ الإعدادات
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <h3>معلومات مهمة</h3>
          <ul>
            <li>يمكنك تغيير هذه الإعدادات في أي وقت</li>
            <li>الإشعارات المباشرة تتطلب السماح بالإشعارات في المتصفح</li>
            <li>إشعارات البريد الإلكتروني ستُرسل إلى عنوان بريدك المسجل</li>
            <li>يمكنك إلغاء الاشتراك من الإشعارات التسويقية في أي وقت</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesPage;
