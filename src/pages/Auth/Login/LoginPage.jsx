import React, { useState, useEffect } from 'react';
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

  // Add floating particles animation
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'auth-particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      document.querySelector('.auth-bg').appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, 5000);
    };

    const interval = setInterval(createParticle, 300);
    return () => clearInterval(interval);
  }, []);

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
      }, 2000);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleFacebookLogin = () => {
    console.log('Facebook login clicked');
  };

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-bg-gradient"></div>
        <div className="auth-bg-pattern"></div>
      </div>

      {/* Logo and Navigation */}
      <motion.div 
        className="auth-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link to="/" className="auth-logo">
          <span className="logo-icon">🏗️</span>
          <span className="logo-text">BuildingZ</span>
        </Link>
        <Link to="/" className="back-home">
          <i className="fas fa-home"></i>
          العودة للرئيسية
        </Link>
      </motion.div>

      <div className="auth-container">
        {/* Left Side - Welcome Section */}
        <motion.div 
          className="auth-welcome"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="welcome-content">
            <motion.div 
              className="welcome-icon"
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <i className="fas fa-user-check"></i>
            </motion.div>
            
            <h2 className="welcome-title">
              مرحباً بعودتك إلى <span className="highlight">BuildingZ</span>
            </h2>
            
            <p className="welcome-description">
              سجل دخولك للوصول إلى جميع خدماتك المفضلة وإدارة طلباتك بسهولة
            </p>

            <div className="welcome-features">
              {[
                { icon: "fa-shield-alt", text: "حماية متقدمة لبياناتك" },
                { icon: "fa-clock", text: "وصول سريع وآمن" },
                { icon: "fa-mobile-alt", text: "متوافق مع جميع الأجهزة" }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="welcome-feature"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <div className="feature-icon">
                    <i className={`fas ${feature.icon}`}></i>
                  </div>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="welcome-stats">
              <div className="stat-item">
                <span className="stat-number">15K+</span>
                <span className="stat-label">عميل راضي</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">دعم متواصل</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div 
          className="auth-form-section"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="form-container">
            <motion.div 
              className="form-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="form-title">تسجيل الدخول</h1>
              <p className="form-subtitle">أدخل بيانات حسابك للمتابعة</p>
            </motion.div>

            {/* Social Login Buttons */}
            <motion.div 
              className="social-login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button className="social-btn google-btn" onClick={handleGoogleLogin}>
                <i className="fab fa-google"></i>
                <span>متابعة مع Google</span>
              </button>
              <button className="social-btn facebook-btn" onClick={handleFacebookLogin}>
                <i className="fab fa-facebook-f"></i>
                <span>متابعة مع Facebook</span>
              </button>
            </motion.div>

            <motion.div 
              className="divider"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span>أو</span>
            </motion.div>

            <motion.form 
              className="auth-form" 
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="form-group">
                <label htmlFor="email">
                  <i className="fas fa-envelope"></i>
                  البريد الإلكتروني
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="أدخل بريدك الإلكتروني"
                  />
                  <div className="input-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                </div>
                {errors.email && (
                  <motion.span 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.email}
                  </motion.span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <i className="fas fa-lock"></i>
                  كلمة المرور
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? 'error' : ''}
                    placeholder="أدخل كلمة المرور"
                  />
                  <div className="input-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <motion.span 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.password}
                  </motion.span>
                )}
              </div>

              <div className="form-options">
                <label className="remember-checkbox">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">تذكرني</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <motion.button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  <div className="btn-content">
                    <span>تسجيل الدخول</span>
                    <i className="fas fa-arrow-left"></i>
                  </div>
                )}
              </motion.button>
            </motion.form>

            <motion.div 
              className="form-footer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p>
                ليس لديك حساب؟ 
                <Link to="/signup" className="switch-link">
                  إنشاء حساب جديد
                  <i className="fas fa-user-plus"></i>
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage; 