import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEye, faEyeSlash, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import authService from '../services/authService';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [step, setStep] = useState(1); // 1: email, 2: password/form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [buttonClicked, setButtonClicked] = useState(false);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        agreeTerms: false
      });
      setErrors({});
      setApiError(null);
      setSuccessMessage(null);
      setMode(initialMode);
      setButtonClicked(false);
    }
  }, [isOpen, initialMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    if (apiError) {
      setApiError(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      agreeTerms: false
    });
    setErrors({});
    setApiError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const validateEmail = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'الاسم يجب أن يكون حرفين على الأقل';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'يجب الموافقة على الشروط والأحكام';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setButtonClicked(true);
    
    setTimeout(() => {
      if (step === 1) {
        if (validateEmail()) {
          setStep(2);
          setButtonClicked(false);
        } else {
          setButtonClicked(false);
        }
      }
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonClicked(true);
    
    if (mode === 'login') {
      if (validateLoginForm()) {
        setIsLoading(true);
        setApiError(null);
        
        try {
          await authService.login(formData.email, formData.password, false);
          
          // Success - close modal and reload
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 500);
        } catch (error) {
          const errorMessage = error.response?.data?.message || 
                             'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.';
          setApiError(errorMessage);
          setButtonClicked(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setButtonClicked(false);
      }
    } else {
      // Signup - same logic as SignupPage
      if (validateSignupForm()) {
        setIsLoading(true);
        setApiError(null);
        
        try {
          const signupData = {
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword
          };
          
          const response = await authService.signup(signupData, true);
          
          // Handle auto-login result
          if (response.autoLogin) {
            // User is now logged in automatically
            setTimeout(() => {
              onClose();
              window.location.reload();
            }, 500);
          } else {
            // Auto-login failed, show message
            setSuccessMessage('تم إنشاء الحساب بنجاح. يرجى تسجيل الدخول.');
            setButtonClicked(false);
            setTimeout(() => {
              setMode('login');
              resetForm();
            }, 2000);
          }
        } catch (error) {
          const errorData = error.response?.data;
          
          if (errorData?.code === 'VALIDATION_ERROR' && errorData?.errors) {
            const validationErrors = {};
            const fieldMapping = {
              'email': 'email',
              'password': 'password',
              'name': 'fullName',
              'fullName': 'fullName',
              'password_confirmation': 'confirmPassword',
              'confirmPassword': 'confirmPassword'
            };
            
            Object.keys(errorData.errors).forEach((apiField) => {
              const formField = fieldMapping[apiField] || apiField;
              const fieldErrors = errorData.errors[apiField];
              
              if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                validationErrors[formField] = fieldErrors[0];
              } else if (typeof fieldErrors === 'string') {
                validationErrors[formField] = fieldErrors;
              }
            });
            
            if (Object.keys(validationErrors).length > 0) {
              setErrors(validationErrors);
            }
            
            if (errorData.message) {
              setApiError(errorData.message);
            } else {
              setApiError('يرجى التحقق من البيانات المدخلة وإصلاح الأخطاء.');
            }
          } else {
            const errorMessage = errorData?.message || 
                               errorData?.error ||
                               'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.';
            setApiError(errorMessage);
          }
          setButtonClicked(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setButtonClicked(false);
      }
    }
  };

  const handleModeToggle = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="auth-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="auth-modal-content"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Close Button */}
          <motion.button 
            className="auth-modal-close" 
            onClick={onClose} 
            aria-label="إغلاق"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </motion.button>

          {/* Title */}
          <motion.h2 
            className="auth-modal-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            هلا! لنبدأ
          </motion.h2>

          {/* Mode Toggle Buttons */}
          <motion.div 
            className="auth-modal-toggle"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <button
              className={`toggle-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleModeToggle('login')}
            >
              تسجيل الدخول
            </button>
            <button
              className={`toggle-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => handleModeToggle('signup')}
            >
              إنشاء حساب
            </button>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                className="auth-modal-success"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {apiError && (
              <motion.div
                className="auth-modal-error"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {apiError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form 
              key={step}
              className="auth-modal-form" 
              onSubmit={step === 1 ? handleContinue : handleSubmit}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {step === 1 ? (
                <>
                  <motion.div 
                    className="auth-input-group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="يرجى إدخال البريد الإلكتروني"
                      className={errors.email ? 'error' : ''}
                      autoComplete="email"
                      dir="rtl"
                    />
                    {errors.email && (
                      <motion.span 
                        className="error-text"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.email}
                      </motion.span>
                    )}
                  </motion.div>

                  <motion.button
                    type="submit"
                    className={`auth-continue-btn ${buttonClicked ? 'clicked' : ''}`}
                    disabled={isLoading || !formData.email.trim()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(108, 117, 125, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        متابعة
                        <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
                      </>
                    )}
                  </motion.button>

                  {/* Privacy Policy Text */}
                  <motion.p 
                    className="auth-privacy-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    بالمتابعة، أؤكد أنني قد قرأت{' '}
                    <a href="/privacy" className="auth-privacy-link" onClick={(e) => e.stopPropagation()}>
                      سياسة الخصوصية
                    </a>
                  </motion.p>
                </>
              ) : (
                <>
                  {mode === 'signup' && (
                    <motion.div 
                      className="auth-input-group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                    >
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="الاسم الكامل"
                        className={errors.fullName ? 'error' : ''}
                        autoComplete="name"
                        dir="rtl"
                      />
                      {errors.fullName && (
                        <motion.span 
                          className="error-text"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {errors.fullName}
                        </motion.span>
                      )}
                    </motion.div>
                  )}

                  <motion.div 
                    className="auth-input-group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: mode === 'signup' ? 0.15 : 0.1, duration: 0.4 }}
                  >
                    <div className="password-input-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="كلمة المرور"
                        className={errors.password ? 'error' : ''}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        dir="rtl"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                      </button>
                    </div>
                    {errors.password && (
                      <motion.span 
                        className="error-text"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.password}
                      </motion.span>
                    )}
                  </motion.div>

                  {mode === 'signup' && (
                    <>
                      <motion.div 
                        className="auth-input-group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                      >
                        <div className="password-input-wrapper">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="تأكيد كلمة المرور"
                            className={errors.confirmPassword ? 'error' : ''}
                            autoComplete="new-password"
                            dir="rtl"
                          />
                          <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                          >
                            <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <motion.span 
                            className="error-text"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {errors.confirmPassword}
                          </motion.span>
                        )}
                      </motion.div>

                      <motion.div 
                        className="auth-terms-group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                      >
                        <label className="auth-checkbox-label">
                          <input
                            type="checkbox"
                            name="agreeTerms"
                            checked={formData.agreeTerms}
                            onChange={handleChange}
                          />
                          <span className="auth-checkbox-custom"></span>
                          <span className="auth-checkbox-text">
                            أوافق على <a href="/terms" className="auth-privacy-link">الشروط والأحكام</a> و <a href="/privacy" className="auth-privacy-link">سياسة الخصوصية</a>
                          </span>
                        </label>
                        {errors.agreeTerms && (
                          <motion.span 
                            className="error-text"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {errors.agreeTerms}
                          </motion.span>
                        )}
                      </motion.div>
                    </>
                  )}

                  <motion.button
                    type="submit"
                    className={`auth-continue-btn ${buttonClicked ? 'clicked' : ''}`}
                    disabled={isLoading}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: mode === 'signup' ? 0.3 : 0.2, duration: 0.4 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 6px 20px rgba(108, 117, 125, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        {mode === 'login' ? 'جاري تسجيل الدخول...' : 'جاري إنشاء الحساب...'}
                      </>
                    ) : (
                      <>
                        متابعة
                        <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    className="auth-back-btn"
                    onClick={() => {
                      setStep(1);
                      setButtonClicked(false);
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: mode === 'signup' ? 0.35 : 0.25, duration: 0.4 }}
                    whileHover={{ scale: 1.02, backgroundColor: "#f0f0f0" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    رجوع
                  </motion.button>
                </>
              )}
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
