import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      
      // Simulate API call
      setTimeout(() => {
        console.log('Signup form submitted:', formData);
        setIsLoading(false);
        navigate('/login');
      }, 2500);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
  };

  const handleFacebookSignup = () => {
    console.log('Facebook signup clicked');
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
        return '#e74c3c';
      case 2:
        return '#f39c12';
      case 3:
        return '#2ecc71';
      case 4:
        return '#27ae60';
      default:
        return '#ddd';
    }
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
              <i className="fas fa-user-plus"></i>
            </motion.div>
            
            <h2 className="welcome-title">
              انضم إلى عائلة <span className="highlight">BuildingZ</span>
            </h2>
            
            <p className="welcome-description">
              أنشئ حسابك الآن واستمتع بأفضل خدمات الصيانة والإصلاح في الإمارات
            </p>

            <div className="welcome-features">
              {[
                { icon: "fa-rocket", text: "بداية سريعة وسهلة" },
                { icon: "fa-gift", text: "عروض حصرية للأعضاء الجدد" },
                { icon: "fa-users", text: "انضم إلى آلاف العملاء الراضين" }
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

            <div className="welcome-benefits">
              <h3 className="benefits-title">ما تحصل عليه:</h3>
              <div className="benefits-grid">
                {[
                  { icon: "fa-star", text: "خدمات مميزة" },
                  { icon: "fa-clock", text: "استجابة سريعة" },
                  { icon: "fa-shield-alt", text: "ضمان الجودة" },
                  { icon: "fa-headset", text: "دعم 24/7" }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="benefit-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  >
                    <i className={`fas ${benefit.icon}`}></i>
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Signup Form */}
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
              <h1 className="form-title">إنشاء حساب جديد</h1>
              <p className="form-subtitle">أنشئ حسابك للوصول إلى جميع خدماتنا المميزة</p>
            </motion.div>

            {/* Social Signup Buttons */}
            <motion.div 
              className="social-login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <button className="social-btn google-btn" onClick={handleGoogleSignup}>
                <i className="fab fa-google"></i>
                <span>إنشاء حساب مع Google</span>
              </button>
              <button className="social-btn facebook-btn" onClick={handleFacebookSignup}>
                <i className="fab fa-facebook-f"></i>
                <span>إنشاء حساب مع Facebook</span>
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
                <label htmlFor="fullName">
                  <i className="fas fa-user"></i>
                  الاسم الكامل
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={errors.fullName ? 'error' : ''}
                    placeholder="أدخل اسمك الكامل"
                  />
                  <div className="input-icon">
                    <i className="fas fa-user"></i>
                  </div>
                </div>
                {errors.fullName && (
                  <motion.span 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.fullName}
                  </motion.span>
                )}
              </div>

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
                    placeholder="أدخل كلمة مرور قوية"
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

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <i className="fas fa-lock"></i>
                  تأكيد كلمة المرور
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="أعد إدخال كلمة المرور"
                  />
                  <div className="input-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <div className="password-match">
                    <i className="fas fa-check-circle"></i>
                    <span>كلمات المرور متطابقة</span>
                  </div>
                )}
                {errors.confirmPassword && (
                  <motion.span 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.confirmPassword}
                  </motion.span>
                )}
              </div>

              <div className="form-group terms-group">
                <label className="terms-checkbox">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    أوافق على 
                    <Link to="/terms" className="terms-link"> الشروط والأحكام </Link>
                    و
                    <Link to="/privacy" className="terms-link"> سياسة الخصوصية</Link>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <motion.span 
                    className="error-message"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <i className="fas fa-exclamation-circle"></i>
                    {errors.agreeTerms}
                  </motion.span>
                )}
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
                    <span>جاري إنشاء الحساب...</span>
                  </div>
                ) : (
                  <div className="btn-content">
                    <span>إنشاء حساب جديد</span>
                    <i className="fas fa-user-plus"></i>
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
                لديك حساب بالفعل؟ 
                <Link to="/login" className="switch-link">
                  تسجيل الدخول
                  <i className="fas fa-sign-in-alt"></i>
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage; 