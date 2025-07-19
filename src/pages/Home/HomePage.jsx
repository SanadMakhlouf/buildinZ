import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, faSearch, faClock, faCheckCircle, 
  faShieldAlt, faUserFriends, faStar, faHandshake,
  faAppleAlt, faPlay, faArrowRight, faTools,
  faHome, faWrench, faPaintRoller, faBolt, faWater,
  faUserCheck, faMoneyBillWave, faHeadset, faQuoteRight,
  faChevronDown, faChevronUp, faCheck, faPhone, faEnvelope,
  faCouch, faArrowLeft, faArrowRight as faArrowRightSolid,
  faMapMarkerAlt as faMapMarkerAltSolid
} from '@fortawesome/free-solid-svg-icons';
import { 
  faApple, faGooglePlay, faFacebookF, faTwitter, 
  faInstagram, faLinkedinIn, faWhatsapp 
} from '@fortawesome/free-brands-svg-icons';
import './HomePage.css';
import addressService from '../../services/addressService';
import mockupImage from '../../assets/app-mockup';
// Import hero background image
import heroBgImage from '../../assets/images/hero-bg.png';

const HomePage = () => {
  // State variables
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState(null);
  const [isFallbackLocation, setIsFallbackLocation] = useState(false);
  
  // Interactive state variables
  const [activeFeature, setActiveFeature] = useState(null);
  const [animateHero, setAnimateHero] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [email, setEmail] = useState('');
  
  const navigate = useNavigate();
  
  // Refs for scroll animations
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const ctaRef = useRef(null);
  const appDownloadRef = useRef(null);
  const heroRef = useRef(null);
  const finalSectionRef = useRef(null);
  
  // Initialize animations and effects
  useEffect(() => {
    // Trigger hero animation after a short delay
    setTimeout(() => {
      setAnimateHero(true);
    }, 500);
    
    // Hide scroll indicator when user scrolls
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowScrollIndicator(false);
      } else {
        setShowScrollIndicator(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Setup intersection observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const elements = entry.target.querySelectorAll('.fade-in, .stagger-item');
          elements.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('visible');
            }, index * 100);
          });
        }
      });
    }, observerOptions);
    
    // Observe all sections with animations
    const animatedSections = document.querySelectorAll('.feature-section, .testimonials-section, .how-it-works-section, .cta-section, .app-download-section, .final-section');
    animatedSections.forEach(section => {
      observer.observe(section);
    });
    
    // Detect user location
    detectUserLocation();
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Detect user location
  const detectUserLocation = async () => {
    setIsDetectingLocation(true);
    setLocationStatus('جاري تحديد موقعك...');
    
    try {
      const locationData = await addressService.getCurrentLocation();
      
      // Check if this is a fallback location (Dubai)
      const isFallback = locationData.latitude === 25.2048 && locationData.longitude === 55.2708;
      setIsFallbackLocation(isFallback);
      
      if (isFallback) {
        setLocationStatus('تم استخدام موقع افتراضي (إمارة دبي)');
      } else {
        setLocationStatus(locationData.formatted_address || 'تم تحديد موقعك بنجاح');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      
      // Get a more specific error message based on the error code
      let errorMessage = 'لم نتمكن من تحديد موقعك. يرجى المحاولة مرة أخرى.';
      
      if (error.code) {
        switch (error.code) {
          case 'PERMISSION_DENIED':
            errorMessage = 'تم رفض إذن الموقع. يرجى تمكين الوصول إلى الموقع في إعدادات المتصفح.';
            break;
          case 'POSITION_UNAVAILABLE':
            errorMessage = 'موقعك الحالي غير متاح. تم استخدام موقع افتراضي.';
            setIsFallbackLocation(true);
            break;
          case 'TIMEOUT':
            errorMessage = 'انتهت مهلة طلب الموقع. يرجى المحاولة مرة أخرى.';
            break;
          case 'GEOLOCATION_NOT_SUPPORTED':
            errorMessage = 'متصفحك لا يدعم تحديد الموقع.';
            break;
        }
      }
      
      setLocationStatus(errorMessage);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/services');
  };
  
  // Handle newsletter subscription
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Here you would typically call an API to subscribe the user
      console.log('Newsletter subscription:', email);
      setEmail('');
      // Show success message (you can add a toast notification here)
      alert('تم الاشتراك بنجاح في النشرة الإخبارية!');
    }
  };
  
  // Scroll to section
  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Feature hover handler
  const handleFeatureHover = (index) => {
    setActiveFeature(index);
  };
  
  // Navigate testimonials
  const navigateTestimonials = (direction) => {
    if (direction === 'next') {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    } else {
      setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
    }
  };
  
  // Features data
  const features = [
    {
      icon: faCheckCircle,
      title: "خدمات مضمونة",
      description: "خدمات مضمونة، مدعومة بتقييمات عملاء حقيقيين"
    },
    {
      icon: faMoneyBillWave,
      title: "أسعار واضحة",
      description: "أسعار واضحة دون مفاجآت"
    },
    {
      icon: faUserCheck,
      title: "فريق محترف",
      description: "فريق محترف ومدرّب بعناية"
    },
    {
      icon: faHeadset,
      title: "دعم فني متواصل",
      description: "دعم فني متواصل على مدار الساعة"
    }
  ];
  
  // Steps data
  const steps = [
    {
      number: 1,
      title: "اختر الخدمة",
      description: "تصفح مجموعة واسعة من الخدمات واختر ما يناسب احتياجاتك",
      icon: faSearch
    },
    {
      number: 2,
      title: "حدد الوقت والمكان",
      description: "اختر الوقت المناسب لك وأدخل موقعك",
      icon: faClock
    },
    {
      number: 3,
      title: "استمتع بالخدمة",
      description: "سيصل الفني المختص في الموعد المحدد لإنجاز المهمة باحترافية",
      icon: faHandshake
    }
  ];
  
  // Testimonials data
  const testimonials = [
    {
      text: "تجربة رائعة مع Buildinz! وصل الفني في الموعد المحدد تماماً وأنجز العمل باحترافية عالية. سأستخدم الخدمة مرة أخرى بالتأكيد.",
      name: "أحمد محمد",
      location: "دبي",
      rating: 5
    },
    {
      text: "سهولة في الحجز ودقة في المواعيد وجودة ممتازة في العمل. أنصح بشدة بخدمات Buildinz لأي شخص يبحث عن خدمات منزلية موثوقة.",
      name: "سارة عبدالله",
      location: "أبوظبي",
      rating: 5
    },
    {
      text: "الأسعار شفافة تماماً والخدمة ممتازة. لم أعد أقلق بشأن الصيانة المنزلية بعد اكتشافي لـ Buildinz.",
      name: "خالد العلي",
      location: "الشارقة",
      rating: 4
    }
  ];
  
  // App features data
  const appFeatures = [
    "سهولة الحجز والدفع",
    "تتبع الفني في الوقت الفعلي",
    "إشعارات فورية"
  ];
  
  return (
    <div className="homepage">
      {/* Hero Section - KEEP INTACT but with enhancements */}
      <section className="hero-section" ref={heroRef} style={{
        background: `linear-gradient(rgba(10, 50, 89, 0.8), rgba(10, 50, 89, 0.8)), url(${heroBgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="container">
          <div className={`hero-content ${animateHero ? 'visible' : ''}`}>
            <div className="hero-location">
              <h3 className="location-heading">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                الموقع الحالي
              </h3>
              
              <div className={`location-status ${isDetectingLocation ? 'detecting' : ''} ${locationStatus && !isDetectingLocation ? (isFallbackLocation ? 'fallback' : 'success') : ''}`}>
                <FontAwesomeIcon icon={isDetectingLocation ? faClock : (isFallbackLocation ? faMapMarkerAlt : faCheckCircle)} spin={isDetectingLocation} />
                <span>{locationStatus || 'يرجى السماح بالوصول إلى موقعك'}</span>
                
                {!isDetectingLocation && (
                  <button onClick={detectUserLocation} disabled={isDetectingLocation}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    تحديث الموقع
                  </button>
                )}
              </div>
            </div>
            
            <h1 className="hero-title">مرحباً بك في Buildinz – حيث تبدأ الراحة وتنتهي المهام</h1>
            <p className="hero-description">
              هل تبحث عن طريقة سهلة، سريعة وموثوقة لإنجاز الأعمال في منزلك أو مكان عملك؟
              مع Buildinz، لم يعد الأمر معقداً. نحن هنا لنقدم لك حلاً شاملاً لكل ما تحتاجه.
            </p>
            
            <div className="hero-search-form">
              <form onSubmit={handleSearch}>
                <div className="search-input-container">
                  <FontAwesomeIcon icon={faSearch} className="search-icon" />
                  <input 
                    type="text" 
                    className="hero-search-input" 
                    placeholder="ما الخدمة التي تبحث عنها؟" 
                  />
                  <button type="submit" className="search-button">
                    بحث <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </form>
            </div>
            
            <div className="popular-searches">
              <span className="popular-label">الأكثر بحثاً:</span>
              <div className="popular-tags">
                <button>تنظيف المنزل</button>
                <button>صيانة التكييف</button>
                <button>سباكة</button>
                <button>كهرباء</button>
              </div>
            </div>
            
            <div className="hero-buttons">
              <Link to="/services" className="primary-btn">
                <FontAwesomeIcon icon={faSearch} className="btn-icon" />
                استكشف الخدمات
              </Link>
              <Link to="/signup" className="secondary-btn">
                <FontAwesomeIcon icon={faUserFriends} className="btn-icon" />
                انضم إلينا
              </Link>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">500+</span>
                <span className="stat-label">خدمة متاحة</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">10,000+</span>
                <span className="stat-label">عميل سعيد</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">4.8/5</span>
                <span className="stat-label">تقييم العملاء</span>
              </div>
            </div>
          </div>
          

        </div>
        
        {/* Scroll indicator */}
        {showScrollIndicator && (
          <div className="scroll-indicator" onClick={() => scrollToSection(featuresRef)}>
            <span>اكتشف المزيد</span>
            <FontAwesomeIcon icon={faChevronDown} bounce />
          </div>
        )}
      </section>
      
      {/* Features Section */}
      <section className="feature-section" ref={featuresRef}>
        <div className="feature-container">
          <div className="section-title fade-in">
            <h2>كل ما تحتاجه في مكان واحد</h2>
            <p>لا داعي للبحث الطويل أو الاتصالات المملة. فقط اختر الخدمة، حدّد الوقت والمكان، ونحن نتكفّل بالباقي.</p>
          </div>
          
          <div className="feature-grid">
            {features.map((feature, index) => (
              <div 
                className="feature-card stagger-item" 
                key={index}
                onMouseEnter={() => handleFeatureHover(index)}
                onMouseLeave={() => handleFeatureHover(null)}
              >
                <div className={`feature-icon ${activeFeature === index ? 'active' : ''}`}>
                  <FontAwesomeIcon icon={feature.icon} style={{ '--i': index }} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section - Vertical Timeline */}
      <section className="how-it-works-section" ref={howItWorksRef}>
        <div className="steps-container">
          <div className="section-title fade-in">
            <h2>كيف تعمل Buildinz؟</h2>
            <p>من أول نقرة إلى إنجاز المهمة، Buildinz تضمن لك تجربة خالية من المتاعب.</p>
          </div>
          
          <div className="steps-list">
            {steps.map((step) => (
              <div className="step-item stagger-item" key={step.number}>
                <div className="step-number">{step.number}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                <div className="step-image">
                  <FontAwesomeIcon icon={step.icon} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="testimonials-section" ref={testimonialsRef}>
        <div className="testimonial-container">
          <div className="section-title fade-in">
            <h2>ماذا يقول عملاؤنا؟</h2>
            <p>آراء عملائنا هي أفضل شهادة على جودة خدماتنا</p>
          </div>
          
          <div className="testimonial-grid">
            {testimonials.map((testimonial, index) => (
              <div 
                className={`testimonial-card stagger-item ${index === activeTestimonial ? 'active' : ''}`} 
                key={index}
              >
                <div className="testimonial-rating">
                  {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon 
                      key={i} 
                      icon={faStar} 
                      className={i < testimonial.rating ? 'star-filled' : 'star-empty'} 
                    />
                  ))}
                </div>
                <p className="testimonial-text">
                  {testimonial.text}
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <FontAwesomeIcon icon={faUserFriends} />
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Testimonial navigation controls for mobile */}
          <div className="testimonial-controls">
            <button 
              className="testimonial-control-btn" 
              onClick={() => navigateTestimonials('prev')}
              aria-label="Previous testimonial"
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
            <button 
              className="testimonial-control-btn" 
              onClick={() => navigateTestimonials('next')}
              aria-label="Next testimonial"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          </div>
        </div>
      </section>
      
      {/* App Download Section */}
      <section className="app-download-section" ref={appDownloadRef}>
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
        
        <div className="app-download-container">
          <div className="app-content fade-in">
            <h2>حمل التطبيق واطلب في أي وقت</h2>
            <p>جرب سهولة الحجز والتتبع من خلال تطبيق Buildinz الجديد كلياً.</p>
            <div className="app-buttons">
              <a href="#" className="app-button">
                <FontAwesomeIcon icon={faApple} />
                <span>App Store</span>
              </a>
              <a href="#" className="app-button">
                <FontAwesomeIcon icon={faGooglePlay} />
                <span>Google Play</span>
              </a>
            </div>
            
            <div className="app-features">
              {appFeatures.map((feature, index) => (
                <div className="app-feature" key={index}>
                  <FontAwesomeIcon icon={faCheck} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="app-image fade-in">
            <img src={mockupImage} alt="Buildinz App" />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section" ref={ctaRef}>
        <div className="cta-container">
          <div className="cta-content fade-in">
            <h2>جاهز تخفف عن نفسك؟</h2>
            <p>سجّل الآن وابدأ أول تجربة لك معنا – ولن تكون الأخيرة. نحن نهتم بكل التفاصيل، لتستمتع أنت براحة البال.</p>
            <Link to="/signup" className="cta-button">
              ابدأ الآن <FontAwesomeIcon icon={faArrowRightSolid} />
            </Link>
            
            <div className="cta-contact">
              <div className="contact-item">
                <FontAwesomeIcon icon={faPhone} />
                <span>+971 XX XXX XXXX</span>
              </div>
              <div className="contact-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>info@buildinz.com</span>
              </div>
            </div>
          </div>
        </div>
        
        <button className="back-to-top" onClick={() => scrollToSection(heroRef)}>
          <FontAwesomeIcon icon={faChevronUp} />
        </button>
      </section>
      
      {/* Final Message Section - IMPROVED */}
      <section className="final-section" ref={finalSectionRef}>
        <div className="container">
          <div className="section-title fade-in">
            <FontAwesomeIcon icon={faCouch} className="relaxation-icon" />
            <h2>الراحة تبدأ هنا</h2>
            <p>
              سواء كنت في المنزل أو في المكتب، Buildinz هي الطريقة الذكية لإنجاز الأمور بسرعة وبجودة عالية.
              استمتع بتجربة سلسة، واضحة، ومريحة – كما يجب أن تكون.
            </p>
            <Link to="/services" className="final-cta-button">
              <FontAwesomeIcon icon={faSearch} />
              ابدأ رحلتك معنا
            </Link>
            <h3>Buildinz – خلّي كل شي أسهل.</h3>
          </div>
        </div>
      </section>

      {/* Footer Section - NEW */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* About Section */}
            <div className="footer-section footer-about">
              <div className="footer-logo">
                <FontAwesomeIcon icon={faTools} />
                Buildinz
              </div>
              <p>
                منصة شاملة تربط بين العملاء ومقدمي الخدمات المنزلية والمهنية في دولة الإمارات العربية المتحدة.
                نحن نضمن لك خدمة عالية الجودة وتجربة مريحة وآمنة.
              </p>
              <div className="footer-social">
                <a href="#" className="social-link" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
                <a href="#" className="social-link" aria-label="WhatsApp">
                  <FontAwesomeIcon icon={faWhatsapp} />
                </a>
              </div>
              <div className="footer-certificates">
                <span className="certificate-badge">مرخص تجارياً</span>
                <span className="certificate-badge">معتمد</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section footer-links">
              <h3>روابط سريعة</h3>
              <ul>
                <li><Link to="/services">الخدمات</Link></li>
                <li><Link to="/about">من نحن</Link></li>
                <li><Link to="/how-it-works">كيف نعمل</Link></li>
                <li><Link to="/pricing">الأسعار</Link></li>
                <li><Link to="/become-provider">انضم كمقدم خدمة</Link></li>
                <li><Link to="/careers">الوظائف</Link></li>
                <li><Link to="/blog">المدونة</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="footer-section footer-links">
              <h3>الدعم والمساعدة</h3>
              <ul>
                <li><Link to="/help">مركز المساعدة</Link></li>
                <li><Link to="/faq">الأسئلة الشائعة</Link></li>
                <li><Link to="/contact">تواصل معنا</Link></li>
                <li><Link to="/feedback">تقييم الخدمة</Link></li>
                <li><Link to="/report-issue">بلاغ مشكلة</Link></li>
                <li><Link to="/safety">الأمان والسلامة</Link></li>
                <li><Link to="/insurance">التأمين</Link></li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div className="footer-section footer-contact">
              <h3>تواصل معنا</h3>
              <div className="contact-info">
                <FontAwesomeIcon icon={faPhone} />
                <span>+971 XX XXX XXXX</span>
              </div>
              <div className="contact-info">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>info@buildinz.com</span>
              </div>
              <div className="contact-info">
                <FontAwesomeIcon icon={faMapMarkerAltSolid} />
                <span>دبي، الإمارات العربية المتحدة</span>
              </div>
              
              <div className="footer-newsletter">
                <h3>النشرة الإخبارية</h3>
                <p>اشترك لتحصل على آخر العروض والأخبار</p>
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input"
                    required
                  />
                  <button type="submit" className="newsletter-btn">
                    اشتراك
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2024 Buildinz. جميع الحقوق محفوظة.</p>
            <div className="footer-bottom-links">
              <Link to="/privacy">سياسة الخصوصية</Link>
              <Link to="/terms">الشروط والأحكام</Link>
              <Link to="/cookies">سياسة ملفات تعريف الارتباط</Link>
              <Link to="/accessibility">إمكانية الوصول</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 