import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import authService from '../../../services/authService';
import './SignupPage.css';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();

  // Password strength checker
  useEffect(() => {
    const checkPasswordStrength = (password) => {
      let strength = 0;
      if (password.length >= 6) strength++;
      if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
      if (password.match(/\d/)) strength++;
      if (password.match(/[^a-zA-Z\d]/)) strength++;
      return strength;
    };

    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

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
    // Clear API error
    if (apiError) {
      setApiError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'الاسم يجب أن يكون حرفين على الأقل';
    }
    
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setApiError(null);
      
      try {
        const response = await authService.signup(formData);
        
        // Successful signup
        navigate('/login');
      } catch (error) {
        // Handle signup errors
        const errorMessage = error.response?.data?.message || 
                             'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.';
        setApiError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Implement Google OAuth signup
    console.log('Google signup clicked');
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
        <Link to="/" className="back-link">
          العودة للرئيسية
        </Link>
      </motion.nav>

      {/* Main Content */}
      <div className="auth-main">
        <motion.div 
          className="auth-card signup-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="auth-header">
            <h1>إنشاء حساب جديد</h1>
            <p>أنشئ حسابك للوصول إلى جميع خدماتنا</p>
          </div>

          {/* API Error Message */}
          {apiError && (
            <div className="api-error-message">
              {apiError}
            </div>
          )}

          {/* Social Signup */}
          <button className="social-btn" onClick={handleGoogleSignup}>
            <i className="fab fa-google"></i>
            <span>إنشاء حساب مع Google</span>
          </button>

          <div className="divider">
            <span>أو</span>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="الاسم الكامل"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && (
                <span className="error-text">{errors.fullName}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="البريد الإلكتروني"
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="input-group">
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="كلمة المرور"
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ 
                        width: `${(passwordStrength / 4) * 100}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: getPasswordStrengthColor() }}>
                    قوة كلمة المرور: {getPasswordStrengthText()}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="error-text">{errors.password}</span>
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
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="input-group terms-group">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <span>أوافق على الشروط والأحكام</span>
              </label>
              {errors.agreeTerms && (
                <span className="error-text">{errors.agreeTerms}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري إنشاء الحساب...
                </>
              ) : (
                'إنشاء حساب'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <span>لديك حساب بالفعل؟</span>
            <Link to="/login" className="switch-link">تسجيل الدخول</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage; 