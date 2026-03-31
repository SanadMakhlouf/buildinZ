import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import authService from '../../../services/authService';
import './LoginPage.css';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { t } = useTranslation();
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
      newErrors.email = t('auth.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.validation.emailInvalid');
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
          setApiError(response.message || t('forgotPassword.errors.sendFailed'));
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
            setApiError(error.response.data.message || t('forgotPassword.errors.invalidData'));
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
      <Helmet>
        <title>{t('forgotPassword.title')} | BuildingZ</title>
        <meta name="description" content={t('forgotPassword.subtitle')} />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://buildingzuae.com/forgot-password" />
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
        <Link to="/" className="auth-logo">
          <span className="logo-text">BuildingZ</span>
        </Link>
        <Link to="/login" className="back-link">
          {t('forgotPassword.backToLogin')}
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
                <h2>{t('forgotPassword.successTitle')}</h2>
                <p>{t('forgotPassword.successMessage')}</p>
                <p className="reset-note">{t('forgotPassword.note')}</p>
                <Link to="/login" className="return-login-btn">
                  {t('forgotPassword.backToLogin')}
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
                  <h1>{t('forgotPassword.title')}</h1>
                  <p>{t('forgotPassword.subtitle')}</p>
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
                      placeholder={t('forgotPassword.emailPlaceholder')}
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
                        {t('forgotPassword.sending')}
                      </>
                    ) : (
                      t('forgotPassword.submit')
                    )}
                  </motion.button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                  <span>{t('forgotPassword.remembered')}</span>
                  <Link to="/login" className="switch-link">{t('forgotPassword.login')}</Link>
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