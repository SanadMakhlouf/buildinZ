import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import profileService from '../../services/profileService';
import authService from '../../services/authService';
import './ProfilePage.css';

// Icons for the sidebar and profile sections
const icons = {
  profile: "fas fa-user",
  orders: "fas fa-shopping-cart",
  services: "fas fa-tools",
  notifications: "fas fa-bell",
  settings: "fas fa-cog",
  logout: "fas fa-sign-out-alt",
  edit: "fas fa-edit",
  save: "fas fa-save",
  cancel: "fas fa-times",
  delete: "fas fa-trash-alt",
  phone: "fas fa-phone",
  email: "fas fa-envelope",
  role: "fas fa-user-tag",
  address: "fas fa-map-marker-alt",
  error: "fas fa-exclamation-circle"
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    address: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [orders, setOrders] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await profileService.getProfile();
      
      // Handle the new API response format
      const userData = response.data?.user || response;
      
      setProfileData({
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.roles?.[0]?.name || 'customer',
        address: userData.address || ''
      });

      const userOrders = await profileService.getOrders();
      setOrders(userOrders);

      const userServiceRequests = await profileService.getServiceRequests();
      setServiceRequests(userServiceRequests);
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'الاسم الكامل مطلوب';
        } else if (value.trim().length < 3) {
          error = 'الاسم الكامل يجب أن يكون على الأقل 3 أحرف';
        } else if (value.trim().length > 50) {
          error = 'الاسم الكامل يجب أن لا يتجاوز 50 حرف';
        } else if (!/^[\u0600-\u06FF\s\w]+$/.test(value)) {
          error = 'الاسم الكامل يجب أن يحتوي على أحرف فقط';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          error = 'البريد الإلكتروني مطلوب';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'البريد الإلكتروني غير صحيح';
        }
        break;
      
      case 'phone':
        if (value.trim() && !/^(\+?[0-9]{1,4}[-\s]?)?[0-9]{9,10}$/.test(value.replace(/\s/g, ''))) {
          error = 'رقم الهاتف غير صحيح';
        }
        break;
      
      case 'address':
        if (value.trim() && value.trim().length > 200) {
          error = 'العنوان يجب أن لا يتجاوز 200 حرف';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const errors = {};
    
    Object.keys(profileData).forEach(key => {
      const error = validateField(key, profileData[key]);
      if (error) {
        errors[key] = error;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark field as touched
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on change
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setFormTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleUpdateProfile = async () => {
    // Validate all fields before submission
    const isValid = validateForm();
    
    if (!isValid) {
      // Mark all fields as touched to show all errors
      const touchedFields = {};
      Object.keys(profileData).forEach(key => {
        touchedFields[key] = true;
      });
      setFormTouched(touchedFields);
      
      return;
    }
    
    try {
      setIsLoading(true);
      await profileService.updateProfile(profileData);
      setEditMode(false);
      // Show success message
      alert('تم تحديث الملف الشخصي بنجاح');
      
      // Reset form touched state
      setFormTouched({});
    } catch (err) {
      // Handle API validation errors
      if (err.response?.data?.errors) {
        const apiErrors = {};
        Object.keys(err.response.data.errors).forEach(key => {
          apiErrors[key] = err.response.data.errors[key][0];
        });
        setValidationErrors(apiErrors);
      } else {
        setError('حدث خطأ أثناء تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm('هل أنت متأكد من رغبتك في حذف الحساب؟ هذا الإجراء لا يمكن التراجع عنه.');
    
    if (confirmDelete) {
      try {
        await profileService.deleteAccount();
        authService.logout();
        navigate('/');
      } catch (err) {
        setError('حدث خطأ أثناء حذف الحساب. يرجى المحاولة مرة أخرى.');
        console.error(err);
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const renderProfileTab = () => (
    <div className="profile-section">
      <h2>معلومات الملف الشخصي</h2>
      {editMode ? (
        <motion.div 
          className="edit-profile-form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`input-group ${validationErrors.fullName && formTouched.fullName ? 'has-error' : ''}`}>
            <label>
              <i className={icons.profile}></i> الاسم الكامل <span className="required">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={profileData.fullName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="أدخل الاسم الكامل"
            />
            {validationErrors.fullName && formTouched.fullName && (
              <div className="error-message">
                <i className={icons.error}></i> {validationErrors.fullName}
              </div>
            )}
          </div>
          <div className={`input-group ${validationErrors.email && formTouched.email ? 'has-error' : ''}`}>
            <label>
              <i className={icons.email}></i> البريد الإلكتروني <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              disabled
              placeholder="البريد الإلكتروني"
            />
            {validationErrors.email && formTouched.email && (
              <div className="error-message">
                <i className={icons.error}></i> {validationErrors.email}
              </div>
            )}
          </div>
          <div className={`input-group ${validationErrors.phone && formTouched.phone ? 'has-error' : ''}`}>
            <label>
              <i className={icons.phone}></i> رقم الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="أدخل رقم الهاتف"
            />
            {validationErrors.phone && formTouched.phone && (
              <div className="error-message">
                <i className={icons.error}></i> {validationErrors.phone}
              </div>
            )}
          </div>
          <div className={`input-group ${validationErrors.address && formTouched.address ? 'has-error' : ''}`}>
            <label>
              <i className={icons.address}></i> العنوان
            </label>
            <input
              type="text"
              name="address"
              value={profileData.address}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="أدخل العنوان"
            />
            {validationErrors.address && formTouched.address && (
              <div className="error-message">
                <i className={icons.error}></i> {validationErrors.address}
              </div>
            )}
          </div>
          <div className="form-note">
            <span className="required">*</span> الحقول المطلوبة
          </div>
          <div className="profile-actions">
            <button 
              className="save-btn" 
              onClick={handleUpdateProfile}
              disabled={isLoading || Object.keys(validationErrors).some(key => validationErrors[key] && formTouched[key])}
            >
              <i className={icons.save}></i>
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button 
              className="cancel-btn" 
              onClick={() => {
                setEditMode(false);
                setValidationErrors({});
                setFormTouched({});
              }}
            >
              <i className={icons.cancel}></i>
              إلغاء
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="profile-details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p><strong><i className={icons.profile}></i> الاسم:</strong> {profileData.fullName}</p>
          <p><strong><i className={icons.email}></i> البريد الإلكتروني:</strong> {profileData.email}</p>
          <p><strong><i className={icons.phone}></i> رقم الهاتف:</strong> {profileData.phone || 'غير محدد'}</p>
          <p><strong><i className={icons.address}></i> العنوان:</strong> {profileData.address || 'غير محدد'}</p>
          <p><strong><i className={icons.role}></i> الدور:</strong> {profileData.role === 'admin' ? 'مدير' : 'عميل'}</p>
          <div className="profile-actions">
            <button 
              className="edit-btn" 
              onClick={() => setEditMode(true)}
            >
              <i className={icons.edit}></i>
              تعديل الملف الشخصي
            </button>
            <button 
              className="delete-account-btn" 
              onClick={handleDeleteAccount}
            >
              <i className={icons.delete}></i>
              حذف الحساب
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderOrdersTab = () => (
    <div className="orders-section">
      <h2>طلباتي</h2>
      {orders.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <i className="fas fa-shopping-basket" style={{ fontSize: '3rem', color: '#DAA520', marginBottom: '1rem' }}></i>
          <p>لا توجد طلبات حتى الآن</p>
          <button 
            className="edit-btn" 
            onClick={() => navigate('/products')}
            style={{ marginTop: '1rem' }}
          >
            تصفح المنتجات
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className="orders-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {orders.map(order => (
            <motion.div 
              key={order.id} 
              className="order-item"
              whileHover={{ y: -5 }}
            >
              <div className="order-header">
                <span>رقم الطلب: #{order.id}</span>
                <span className={`order-status ${order.status.toLowerCase()}`}>
                  {order.status === 'pending' ? 'قيد الانتظار' : 
                   order.status === 'completed' ? 'مكتمل' : 'ملغي'}
                </span>
              </div>
              <div className="order-details">
                <p>التاريخ: {new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
                <p>المبلغ الإجمالي: {order.total_amount} ر.س</p>
                <p>عدد المنتجات: {order.items_count || '1'}</p>
                <p>طريقة الدفع: {order.payment_method || 'الدفع عند الاستلام'}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  const renderServiceRequestsTab = () => (
    <div className="service-requests-section">
      <h2>طلبات الخدمة</h2>
      {serviceRequests.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <i className="fas fa-tools" style={{ fontSize: '3rem', color: '#DAA520', marginBottom: '1rem' }}></i>
          <p>لا توجد طلبات خدمة حتى الآن</p>
          <button 
            className="edit-btn" 
            onClick={() => navigate('/services')}
            style={{ marginTop: '1rem' }}
          >
            تصفح الخدمات
          </button>
        </motion.div>
      ) : (
        <motion.div 
          className="service-requests-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {serviceRequests.map(request => (
            <motion.div 
              key={request.id} 
              className="service-request-item"
              whileHover={{ y: -5 }}
            >
              <div className="request-header">
                <span>رقم الطلب: #{request.id}</span>
                <span className={`request-status ${request.status.toLowerCase()}`}>
                  {request.status === 'pending' ? 'قيد الانتظار' : 
                   request.status === 'completed' ? 'مكتمل' : 'ملغي'}
                </span>
              </div>
              <div className="request-details">
                <p>التاريخ: {new Date(request.created_at).toLocaleDateString('ar-SA')}</p>
                <p>الخدمة: {request.service_name}</p>
                <p>المبلغ: {request.amount} ر.س</p>
                <p>الحالة: {request.status}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="notifications-section">
      <h2>الإشعارات</h2>
      <div className="empty-state">
        <i className="fas fa-bell" style={{ fontSize: '3rem', color: '#DAA520', marginBottom: '1rem' }}></i>
        <p>لا توجد إشعارات جديدة</p>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="settings-section">
      <h2>الإعدادات</h2>
      <div className="settings-form">
        <div className="settings-group">
          <h3>تفضيلات الإشعارات</h3>
          <div className="checkbox-group">
            <label>
              <input type="checkbox" defaultChecked /> إشعارات البريد الإلكتروني
            </label>
          </div>
          <div className="checkbox-group">
            <label>
              <input type="checkbox" defaultChecked /> إشعارات تحديث الطلبات
            </label>
          </div>
          <div className="checkbox-group">
            <label>
              <input type="checkbox" defaultChecked /> إشعارات العروض والتخفيضات
            </label>
          </div>
        </div>
        
        <div className="settings-group">
          <h3>الأمان</h3>
          <button className="edit-btn">تغيير كلمة المرور</button>
        </div>
        
        <div className="settings-group">
          <h3>الحساب</h3>
          <button className="delete-account-btn" onClick={handleDeleteAccount}>
            <i className={icons.delete}></i> حذف الحساب
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'orders':
        return renderOrdersTab();
      case 'services':
        return renderServiceRequestsTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderProfileTab();
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle" style={{ fontSize: '3rem', color: '#dc3545', marginBottom: '1rem' }}></i>
        <p>{error}</p>
        <button onClick={fetchProfileData}>إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="profile-container">
        <div className="profile-sidebar">
          <div 
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className={icons.profile}></i>
            <span>الملف الشخصي</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className={icons.orders}></i>
            <span>طلباتي</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <i className={icons.services}></i>
            <span>طلبات الخدمة</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <i className={icons.notifications}></i>
            <span>الإشعارات</span>
          </div>
          <div 
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className={icons.settings}></i>
            <span>الإعدادات</span>
          </div>
          <div 
            className="sidebar-item"
            onClick={handleLogout}
          >
            <i className={icons.logout}></i>
            <span>تسجيل الخروج</span>
          </div>
        </div>
        <div className="profile-content">
          {renderContent()}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;