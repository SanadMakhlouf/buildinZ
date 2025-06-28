import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
  };

  const validateForm = () => {
    const newErrors = {};
    
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        console.log('Login form submitted:', formData);
        setIsLoading(false);
        navigate('/services');
      }, 1500);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
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
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="auth-header">
            <h1>تسجيل الدخول</h1>
            <p>أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          {/* Social Login */}
          <button className="social-btn" onClick={handleGoogleLogin}>
            <i className="fab fa-google"></i>
            <span>متابعة مع Google</span>
          </button>

          <div className="divider">
            <span>أو</span>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
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
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>تذكرني</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                نسيت كلمة المرور؟
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
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="auth-footer">
            <span>ليس لديك حساب؟</span>
            <Link to="/signup" className="switch-link">إنشاء حساب جديد</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage; 