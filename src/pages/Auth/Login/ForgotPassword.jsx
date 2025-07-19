import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../../../services/authService';
import './LoginPage.css';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    
    // Clear errors when user starts typing
    if (errors.email) {
      setErrors({});
    }
    // Clear API error
    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setApiError(null);
      
      try {
        const response = await authService.requestPasswordReset(email);
        
        // Always show success message even if email doesn't exist (for security)
        if (response.success) {
          setResetSent(true);
        } else {
          // This should not happen based on API docs, but handle just in case
          setApiError(response.message || 'حدث خطأ أثناء إرسال طلب إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.');
        }
      } catch (error) {
        // Handle validation errors
        if (error.response?.data?.code === 'VALIDATION_ERROR') {
          const validationErrors = error.response.data.errors || {};
          if (validationErrors.email) {
            setErrors({
              email: validationErrors.email[0]
            });
          } else {
            setApiError(error.response.data.message || 'بيانات غير صالحة. يرجى التحقق من البريد الإلكتروني المدخل.');
          }
        } else {
          // For security reasons, don't expose if user doesn't exist
          // Just show generic error or success message
          setResetSent(true);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">
      {/* Simple Background */}
      <div className="auth-bg"></div>

      {/* Top Navigation */}
      <motion.nav 
        className="auth-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="auth-logo">
          <span className="logo-text">BuildingZ</span>
        </Link>
        <Link to="/login" className="back-link">
          العودة لتسجيل الدخول
        </Link>
      </motion.nav>

      {/* Main Content */}
      <div className="auth-main">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            {resetSent ? (
              <motion.div 
                className="reset-success"
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2>تم إرسال رابط إعادة التعيين</h2>
                <p>لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد الخاص بك واتباع التعليمات.</p>
                <p className="reset-note">ملاحظة: الرابط صالح لمدة 60 دقيقة فقط.</p>
                <Link to="/login" className="return-login-btn">
                  العودة لتسجيل الدخول
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="auth-header">
                  <h1>استعادة كلمة المرور</h1>
                  <p>أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور</p>
                </div>

                {/* API Error Message */}
                <AnimatePresence>
                  {apiError && (
                    <motion.div 
                      className="api-error-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {apiError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="input-group">
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="البريد الإلكتروني"
                      className={errors.email ? 'error' : ''}
                      autoComplete="email"
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.span 
                          className="error-text"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {errors.email}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <motion.button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري إرسال الطلب...
                      </>
                    ) : (
                      'إرسال رابط إعادة التعيين'
                    )}
                  </motion.button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                  <span>تذكرت كلمة المرور؟</span>
                  <Link to="/login" className="switch-link">تسجيل الدخول</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword; 