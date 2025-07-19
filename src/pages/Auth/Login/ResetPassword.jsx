import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../../../services/authService';
import './LoginPage.css';
import './ForgotPassword.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    token: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token and email from URL query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const email = queryParams.get('email');
    
    if (token && email) {
      setFormData(prev => ({
        ...prev,
        token,
        email
      }));
    } else {
      // If token or email is missing, show error
      setApiError('رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.');
    }
  }, [location]);

  // Password strength and requirements checker
  useEffect(() => {
    const password = formData.password;
    const reqs = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    setPasswordRequirements(reqs);
    
    // Calculate strength
    let strength = 0;
    if (reqs.length) strength++;
    if (reqs.uppercase && reqs.lowercase) strength++;
    if (reqs.number) strength++;
    if (reqs.special) strength++;
    
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    // Clear API error
    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!passwordRequirements.uppercase || !passwordRequirements.lowercase) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة';
    } else if (!passwordRequirements.number) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
    } else if (!passwordRequirements.special) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمات المرور غير متطابقة';
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
        const response = await authService.resetPassword(
          formData.token,
          formData.email,
          formData.password,
          formData.confirmPassword
        );
        
        if (response.success) {
          // Show success message
          setResetSuccess(true);
        } else {
          setApiError(response.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.');
        }
      } catch (error) {
        // Handle validation errors
        if (error.response?.data?.code === 'VALIDATION_ERROR') {
          const validationErrors = error.response.data.errors || {};
          const newErrors = {};
          
          if (validationErrors.token) {
            setApiError('رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.');
          } else if (validationErrors.email) {
            newErrors.email = validationErrors.email[0];
          } else if (validationErrors.password) {
            newErrors.password = validationErrors.password[0];
          }
          
          setErrors(newErrors);
        } else if (error.response?.data?.code === 'PASSWORD_RESET_FAILED') {
          setApiError('رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.');
        } else {
          setApiError('حدث خطأ أثناء إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'ضعيفة';
      case 2:
        return 'متوسطة';
      case 3:
        return 'قوية';
      case 4:
        return 'قوية جداً';
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return '#dc3545';
      case 2:
        return '#ffc107';
      case 3:
        return '#28a745';
      case 4:
        return '#20c997';
      default:
        return '#e9ecef';
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
            {resetSuccess ? (
              <motion.div 
                key="success"
                className="reset-success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2>تم إعادة تعيين كلمة المرور</h2>
                <p>تم إعادة تعيين كلمة المرور الخاصة بك بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.</p>
                <Link to="/login" className="return-login-btn">
                  تسجيل الدخول
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
                  <h1>إعادة تعيين كلمة المرور</h1>
                  <p>أدخل كلمة المرور الجديدة لحسابك</p>
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
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="البريد الإلكتروني"
                      readOnly
                      className="readonly-input"
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

                  <div className="input-group">
                    <div className="password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="كلمة المرور الجديدة"
                        className={errors.password ? 'error' : ''}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.span 
                          className="error-text"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {errors.password}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {formData.password && (
                      <>
                        <div className="password-strength">
                          <div className="strength-meter">
                            <div 
                              className="strength-meter-fill" 
                              style={{
                                width: `${(passwordStrength / 4) * 100}%`,
                                backgroundColor: getPasswordStrengthColor()
                              }}
                            ></div>
                          </div>
                          <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        
                        <div className="password-requirements">
                          <p>يجب أن تحتوي كلمة المرور على:</p>
                          <ul>
                            <li className={passwordRequirements.length ? 'met' : ''}>
                              <i className={`fas ${passwordRequirements.length ? 'fa-check' : 'fa-times'}`}></i>
                              8 أحرف على الأقل
                            </li>
                            <li className={(passwordRequirements.uppercase && passwordRequirements.lowercase) ? 'met' : ''}>
                              <i className={`fas ${(passwordRequirements.uppercase && passwordRequirements.lowercase) ? 'fa-check' : 'fa-times'}`}></i>
                              حروف كبيرة وصغيرة
                            </li>
                            <li className={passwordRequirements.number ? 'met' : ''}>
                              <i className={`fas ${passwordRequirements.number ? 'fa-check' : 'fa-times'}`}></i>
                              رقم واحد على الأقل
                            </li>
                            <li className={passwordRequirements.special ? 'met' : ''}>
                              <i className={`fas ${passwordRequirements.special ? 'fa-check' : 'fa-times'}`}></i>
                              رمز خاص واحد على الأقل (!@#$%^&*)
                            </li>
                          </ul>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="input-group">
                    <div className="password-input">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="تأكيد كلمة المرور"
                        className={errors.confirmPassword ? 'error' : ''}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.span 
                          className="error-text"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {errors.confirmPassword}
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
                        جاري إعادة التعيين...
                      </>
                    ) : (
                      'إعادة تعيين كلمة المرور'
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword; 