import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../../../services/authService';
import './SignupPage.css';

const SignupPage = () => {
  const { t } = useTranslation();
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
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      newErrors.fullName = t('auth.validation.fullNameRequired');
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = t('auth.validation.fullNameMin');
    }
    
    if (!formData.email) {
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.validation.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.validation.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.validation.passwordMin');
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.passwordsMismatch');
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = t('auth.validation.agreeTerms');
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
        const response = await authService.signup(formData, true);
        
        // Show success animation
        setSignupSuccess(true);
        
        // Handle auto-login result
        if (response.autoLogin) {
          // User is now logged in automatically
          // Get redirect path from URL parameters or use default
          const params = new URLSearchParams(location.search);
          const redirectPath = params.get('redirect') || '/';
          
          setTimeout(() => {
            navigate(redirectPath, { 
              state: { 
                message: t('signupPage.successAndLoggedIn'),
                type: 'success'
              } 
            });
          }, 2000);
        } else {
          // Auto-login failed, redirect to login page with redirect param
          const params = new URLSearchParams(location.search);
          const redirectPath = params.get('redirect') || '/';
          
          setTimeout(() => {
            navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`, { 
              state: { 
                message: t('signupPage.successPleaseLogin'),
                type: 'info'
              } 
            });
          }, 2000);
        }
      } catch (error) {
        // Handle signup errors with structured error response
        const errorData = error.response?.data;
        
        if (errorData?.code === 'VALIDATION_ERROR' && errorData?.errors) {
          // Handle validation errors - map field-specific errors
          const validationErrors = {};
          
          // Map API field names to form field names
          const fieldMapping = {
            'email': 'email',
            'password': 'password',
            'name': 'fullName',
            'fullName': 'fullName',
            'password_confirmation': 'confirmPassword',
            'confirmPassword': 'confirmPassword'
          };
          
          // Extract and map validation errors
          Object.keys(errorData.errors).forEach((apiField) => {
            const formField = fieldMapping[apiField] || apiField;
            const fieldErrors = errorData.errors[apiField];
            
            // Use the first error message for each field
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
              validationErrors[formField] = fieldErrors[0];
            } else if (typeof fieldErrors === 'string') {
              validationErrors[formField] = fieldErrors;
            }
          });
          
          // Set field-specific errors
          if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
          }
          
          // Set general error message if provided
          if (errorData.message) {
            setApiError(errorData.message);
          } else {
            setApiError(t('auth.validation.checkData'));
          }
        } else {
          // Handle other types of errors (network, server, etc.)
          const errorMessage = errorData?.message || 
                               errorData?.error ||
                             t('auth.errors.signupFailed');
        setApiError(errorMessage);
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
        return t('signupPage.passwordStrength.weak');
      case 2:
        return t('signupPage.passwordStrength.medium');
      case 3:
        return t('signupPage.passwordStrength.strong');
      case 4:
        return t('signupPage.passwordStrength.veryStrong');
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
      <Helmet>
        <title>{t('signupPage.title')} | BuildingZ</title>
        <meta name="description" content={t('signupPage.description')} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://buildingzuae.com/signup" />
      </Helmet>
      
      {/* Simple Background */}
      <div className="auth-bg"></div>

      {/* Top Navigation */}
      <motion.nav 
        className="auth-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
       
        <Link to="/" className="back-link">
          {t('signupPage.backToHome')}
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
          <AnimatePresence mode="wait">
            {signupSuccess ? (
              <motion.div 
                key="success"
                className="signup-success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2>{t('signupPage.successTitle')}</h2>
                <p>{t('signupPage.redirecting')}</p>
              </motion.div>
            ) : (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="auth-header">
                  <h1>{t('signupPage.title')}</h1>
                  <p>{t('signupPage.subtitle')}</p>
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
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder={t('signupPage.fullNamePlaceholder')}
                      className={errors.fullName ? 'error' : ''}
                      autoComplete="name"
                    />
                    <AnimatePresence>
                      {errors.fullName && (
                        <motion.span 
                          className="error-text"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {errors.fullName}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="input-group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('signupPage.emailPlaceholder')}
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

                  <div className="input-group">
                    <div className="password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t('signupPage.passwordPlaceholder')}
                        className={errors.password ? 'error' : ''}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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
                    )}
                  </div>

                  <div className="input-group">
                    <div className="password-input">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder={t('signupPage.confirmPasswordPlaceholder')}
                        className={errors.confirmPassword ? 'error' : ''}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
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

                  <div className="terms-group">
                    <label className="checkbox terms-checkbox">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                      />
                      <span>
                        {t('signupPage.agreeTerms')} <Link to="/terms" className="terms-link">{t('signupPage.terms')}</Link> {t('signupPage.and')} <Link to="/privacy" className="terms-link">{t('signupPage.privacyPolicy')}</Link>
                      </span>
                    </label>
                    <AnimatePresence>
                      {errors.agreeTerms && (
                        <motion.span 
                          className="error-text"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          {errors.agreeTerms}
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
                        {t('signupPage.creatingAccount')}
                      </>
                    ) : (
                      t('signupPage.submit')
                    )}
                  </motion.button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                  <span>{t('signupPage.hasAccount')}</span>
                  <Link to="/login" className="switch-link">{t('signupPage.login')}</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage; 