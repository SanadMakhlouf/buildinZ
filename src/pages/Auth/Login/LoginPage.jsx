import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../../../services/authService';
import './LoginPage.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Check for redirect parameters and location state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const redirectMessage = params.get('message');
    const redirectPath = params.get('redirect');
    
    // Handle URL parameters
    if (redirectMessage) {
      setApiError(redirectMessage);
    }

    // Handle location state (from signup page)
    if (location.state?.message) {
      if (location.state.type === 'success' || location.state.type === 'info') {
        setSuccessMessage(location.state.message);
      } else {
        setApiError(location.state.message);
      }
    }

    // If user is already logged in, redirect to the requested page or home
    if (authService.isAuthenticated()) {
      navigate(redirectPath || '/');
    }
  }, [location, navigate]);

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
    // Clear API error and success message
    if (apiError) {
      setApiError(null);
    }
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setApiError(null);
      
      try {
        const response = await authService.login(
          formData.email, 
          formData.password, 
          formData.rememberMe
        );
        
        // Show success animation
        setLoginSuccess(true);
        
        // Get the redirect path from URL parameters or use default
        const params = new URLSearchParams(location.search);
        const redirectPath = params.get('redirect') || '/services';
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(redirectPath);
        }, 1000);
      } catch (error) {
        // Handle login errors
        const errorMessage = error.response?.data?.message || 
                             t('auth.errors.loginFailed');
        setApiError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <Helmet>
        <title>{t('loginPage.title')} | BuildingZ</title>
        <meta name="description" content={t('loginPage.description')} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://buildingzuae.com/login" />
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
          {t('loginPage.backToHome')}
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
            {loginSuccess ? (
              <motion.div 
                key="success"
                className="login-success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h2>{t('loginPage.successTitle')}</h2>
                <p>{t('loginPage.redirecting')}</p>
              </motion.div>
            ) : (
              <motion.div
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="auth-header">
                  <h1>{t('loginPage.title')}</h1>
                  <p>{t('loginPage.subtitle')}</p>
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

                {/* Success Message */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.div 
                      className="api-success-message"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {successMessage}
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
                      placeholder={t('loginPage.emailPlaceholder')}
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
                        placeholder={t('loginPage.passwordPlaceholder')}
                        className={errors.password ? 'error' : ''}
                        autoComplete="current-password"
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
                  </div>

                  <div className="form-options">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <span className="checkmark"></span>
                      {t('loginPage.rememberMe')}
                    </label>
                    <Link to="/forgot-password" className="forgot-link">
                      {t('loginPage.forgotPassword')}
                    </Link>
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        {t('loginPage.loggingIn')}
                      </>
                    ) : t('loginPage.submit')}
                  </button>

                  <p className="auth-divider">{t('loginPage.or')}</p>

                  <button
                    type="button"
                    className="google-signin-btn"
                    onClick={async () => {
                      setApiError(null);
                      setIsLoading(true);
                      try {
                        await authService.initiateGoogleLogin();
                      } catch (err) {
                        setApiError(err.message || t('auth.errors.googleFailed'));
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading}
                  >
                    <i className="fab fa-google"></i>
                    {t('loginPage.loginWithGoogle')}
                  </button>
                </form>

                <div className="auth-footer">
                  <p>{t('loginPage.noAccount')} <Link to="/signup">{t('loginPage.createAccount')}</Link></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage; 