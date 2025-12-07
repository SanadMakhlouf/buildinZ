import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, faChevronRight, faArrowLeft, faArrowRight,
  faStar, faShoppingCart, faHeart, faPhone, faEnvelope,
  faMapMarkerAlt, faTools, faHome, faWrench, faPaintRoller,
  faBolt, faWater, faCouch, faHammer, faCog, faLeaf,
  faShieldAlt, faTruck, faHeadset, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { 
  faApple, faGooglePlay, faFacebookF, faTwitter, 
  faInstagram, faLinkedinIn, faWhatsapp 
} from '@fortawesome/free-brands-svg-icons';
import './HomePage.css';
import serviceBuilderService from '../../services/serviceBuilderService';

const HomePage = () => {
  const navigate = useNavigate();
  
  // State
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [email, setEmail] = useState('');
  
  // Refs
  const categoryScrollRef = useRef(null);
  const bannerIntervalRef = useRef(null);
  
  // Banner data - promotional banners
  const banners = [
    {
      id: 1,
      title: "خصم 20% على خدمات التكييف",
      subtitle: "صيانة وتركيب جميع أنواع التكييفات",
      image: "https://images.unsplash.com/photo-1631545806609-34facf43f1f0?w=1200",
      link: "/services2/categories",
      bgColor: "#0A3259"
    },
    {
      id: 2,
      title: "خدمات التصميم الداخلي",
      subtitle: "حوّل منزلك إلى تحفة فنية",
      image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200",
      link: "/services2/categories",
      bgColor: "#1a4d80"
    },
    {
      id: 3,
      title: "خدمات الصيانة الشاملة",
      subtitle: "سباكة - كهرباء - نجارة",
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200",
      link: "/services2/categories",
      bgColor: "#072441"
    }
  ];
  
  // Side banners
  const sideBanners = [
    {
      id: 1,
      title: "عروض حصرية",
      subtitle: "خصم حتى 30%",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
      link: "/services2/categories"
    },
    {
      id: 2,
      title: "خدمات جديدة",
      subtitle: "اكتشف المزيد",
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600",
      link: "/services2/categories"
    }
  ];
  
  // Default category icons mapping
  const categoryIcons = {
    'تكييف': faCog,
    'سباكة': faWater,
    'كهرباء': faBolt,
    'نجارة': faHammer,
    'دهان': faPaintRoller,
    'تصميم': faCouch,
    'صيانة': faWrench,
    'تنظيف': faLeaf,
    'default': faTools
  };
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await serviceBuilderService.getAllCategories();
        if (categoriesResponse?.data) {
          setCategories(categoriesResponse.data);
        }
        
        // Fetch services
        const servicesResponse = await serviceBuilderService.getAllServices();
        if (servicesResponse?.data) {
          setServices(servicesResponse.data.slice(0, 12)); // Get first 12 services
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Auto-rotate banners
  useEffect(() => {
    bannerIntervalRef.current = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    
    return () => {
      if (bannerIntervalRef.current) {
        clearInterval(bannerIntervalRef.current);
      }
    };
  }, [banners.length]);
  
  // Banner navigation
  const goToBanner = (index) => {
    setCurrentBanner(index);
    // Reset interval
    if (bannerIntervalRef.current) {
      clearInterval(bannerIntervalRef.current);
    }
    bannerIntervalRef.current = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
  };
  
  const nextBanner = () => {
    goToBanner((currentBanner + 1) % banners.length);
  };
  
  const prevBanner = () => {
    goToBanner((currentBanner - 1 + banners.length) % banners.length);
  };
  
  // Category scroll
  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  // Get category icon
  const getCategoryIcon = (categoryName) => {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName?.includes(key)) {
        return icon;
      }
    }
    return categoryIcons.default;
  };
  
  // Get image URL helper
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/300x200?text=Buildinz';
    if (imagePath.startsWith('http')) return imagePath;
    return serviceBuilderService.getImageUrl(imagePath);
  };
  
  // Newsletter handler
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert('تم الاشتراك بنجاح في النشرة الإخبارية!');
      setEmail('');
    }
  };

  // Features data
  const features = [
    { icon: faShieldAlt, title: "ضمان الجودة", description: "خدمات مضمونة 100%" },
    { icon: faTruck, title: "خدمة سريعة", description: "وصول في نفس اليوم" },
    { icon: faHeadset, title: "دعم 24/7", description: "خدمة عملاء متواصلة" },
    { icon: faCheckCircle, title: "فنيون محترفون", description: "خبرة عالية وموثوقة" }
  ];
  
  return (
    <div className="noon-homepage">
      {/* Main Hero Section */}
      <section className="noon-hero-section">
        <div className="noon-hero-container">
          {/* Main Banner Carousel */}
          <div className="noon-main-banner">
            <div className="noon-banner-wrapper">
              {banners.map((banner, index) => (
                <div 
                  key={banner.id}
                  className={`noon-banner-slide ${index === currentBanner ? 'active' : ''}`}
                  style={{ backgroundColor: banner.bgColor }}
                >
                  <div className="noon-banner-content">
                    <h2>{banner.title}</h2>
                    <p>{banner.subtitle}</p>
                    <Link to={banner.link} className="noon-banner-btn">
                      اكتشف المزيد
                    </Link>
                  </div>
                  <div className="noon-banner-image">
                    <img src={banner.image} alt={banner.title} />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Banner Navigation */}
            <button className="noon-banner-nav noon-banner-prev" onClick={prevBanner}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            <button className="noon-banner-nav noon-banner-next" onClick={nextBanner}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            
            {/* Banner Dots */}
            <div className="noon-banner-dots">
              {banners.map((_, index) => (
                <button 
                  key={index}
                  className={`noon-banner-dot ${index === currentBanner ? 'active' : ''}`}
                  onClick={() => goToBanner(index)}
                />
              ))}
            </div>
          </div>
          
          {/* Side Banners */}
          <div className="noon-side-banners">
            {sideBanners.map(banner => (
              <Link 
                key={banner.id} 
                to={banner.link} 
                className="noon-side-banner"
              >
                <img src={banner.image} alt={banner.title} />
                <div className="noon-side-banner-overlay">
                  <h3>{banner.title}</h3>
                  <p>{banner.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="noon-categories-section">
        <div className="noon-section-container">
          <div className="noon-categories-wrapper">
            <button 
              className="noon-scroll-btn noon-scroll-right"
              onClick={() => scrollCategories('left')}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
            
            <div className="noon-categories-scroll" ref={categoryScrollRef}>
              {loading ? (
                // Skeleton loaders
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="noon-category-item skeleton">
                    <div className="noon-category-icon skeleton-circle"></div>
                    <div className="skeleton-text"></div>
                  </div>
                ))
              ) : (
                categories.map(category => (
                  <Link 
                    key={category.id}
                    to={`/services2/categories/${category.id}`}
                    className="noon-category-item"
                  >
                    <div className="noon-category-icon">
                      {category.image ? (
                        <img src={getImageUrl(category.image)} alt={category.name} />
                      ) : (
                        <FontAwesomeIcon icon={getCategoryIcon(category.name)} />
                      )}
                    </div>
                    <span className="noon-category-name">{category.name}</span>
                  </Link>
                ))
              )}
            </div>
            
            <button 
              className="noon-scroll-btn noon-scroll-left"
              onClick={() => scrollCategories('right')}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </div>
        </div>
      </section>
      
      {/* Features Strip */}
      <section className="noon-features-strip">
        <div className="noon-section-container">
          <div className="noon-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="noon-feature-item">
                <FontAwesomeIcon icon={feature.icon} className="noon-feature-icon" />
                <div className="noon-feature-text">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Services Section */}
      <section className="noon-services-section">
        <div className="noon-section-container">
          <div className="noon-section-header">
            <h2>الخدمات الأكثر طلباً</h2>
            <Link to="/services2/categories" className="noon-view-all">
              عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
          </div>
          
          <div className="noon-services-grid">
            {loading ? (
              // Skeleton loaders
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="noon-service-card skeleton">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text short"></div>
                  </div>
                </div>
              ))
            ) : (
              services.slice(0, 8).map(service => (
                <Link 
                  key={service.id}
                  to={`/services2/service/${service.id}`}
                  className="noon-service-card"
                >
                  <div className="noon-service-image">
                    <img 
                      src={getImageUrl(service.image)} 
                      alt={service.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Buildinz';
                      }}
                    />
                    {service.discount && (
                      <span className="noon-service-badge">خصم {service.discount}%</span>
                    )}
                  </div>
                  <div className="noon-service-content">
                    <h3 className="noon-service-name">{service.name}</h3>
                    <p className="noon-service-desc">
                      {service.description?.substring(0, 60)}...
                    </p>
                    <div className="noon-service-footer">
                      {service.base_price && (
                        <span className="noon-service-price">
                          يبدأ من {service.base_price} درهم
                        </span>
                      )}
                      <div className="noon-service-rating">
                        <FontAwesomeIcon icon={faStar} />
                        <span>{service.rating || '4.8'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Promotional Banner */}
      <section className="noon-promo-section">
        <div className="noon-section-container">
          <div className="noon-promo-banner">
            <div className="noon-promo-content">
              <h2>بضغطة زر بيتك يتشطب</h2>
              <p>اكتشف مجموعة واسعة من خدمات البناء والصيانة والتصميم الداخلي</p>
              <Link to="/services2/categories" className="noon-promo-btn">
                استكشف الخدمات
              </Link>
            </div>
            <div className="noon-promo-image">
              <img 
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600" 
                alt="خدمات البناء"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* More Services Grid */}
      {services.length > 8 && (
        <section className="noon-services-section">
          <div className="noon-section-container">
            <div className="noon-section-header">
              <h2>المزيد من الخدمات</h2>
              <Link to="/services2/categories" className="noon-view-all">
                عرض الكل <FontAwesomeIcon icon={faArrowLeft} />
              </Link>
            </div>
            
            <div className="noon-services-grid">
              {services.slice(8, 12).map(service => (
                <Link 
                  key={service.id}
                  to={`/services2/service/${service.id}`}
                  className="noon-service-card"
                >
                  <div className="noon-service-image">
                    <img 
                      src={getImageUrl(service.image)} 
                      alt={service.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=Buildinz';
                      }}
                    />
                  </div>
                  <div className="noon-service-content">
                    <h3 className="noon-service-name">{service.name}</h3>
                    <p className="noon-service-desc">
                      {service.description?.substring(0, 60)}...
                    </p>
                    <div className="noon-service-footer">
                      {service.base_price && (
                        <span className="noon-service-price">
                          يبدأ من {service.base_price} درهم
                        </span>
                      )}
                      <div className="noon-service-rating">
                        <FontAwesomeIcon icon={faStar} />
                        <span>{service.rating || '4.8'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* Categories Grid Section */}
      <section className="noon-categories-grid-section">
        <div className="noon-section-container">
          <div className="noon-section-header">
            <h2>تصفح حسب الفئة</h2>
          </div>
          
          <div className="noon-categories-grid">
            {categories.slice(0, 6).map(category => (
              <Link 
                key={category.id}
                to={`/services2/categories/${category.id}`}
                className="noon-category-card"
              >
                <div className="noon-category-card-image">
                  {category.image ? (
                    <img src={getImageUrl(category.image)} alt={category.name} />
                  ) : (
                    <div className="noon-category-card-icon">
                      <FontAwesomeIcon icon={getCategoryIcon(category.name)} />
                    </div>
                  )}
                </div>
                <div className="noon-category-card-content">
                  <h3>{category.name}</h3>
                  <span className="noon-category-count">
                    {category.services_count || category.subcategories?.length || 0} خدمة
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* App Download Section */}
      <section className="noon-app-section">
        <div className="noon-section-container">
          <div className="noon-app-content">
            <div className="noon-app-text">
              <h2>حمّل التطبيق</h2>
              <p>احصل على تجربة أفضل مع تطبيق Buildinz للهاتف المحمول</p>
              <div className="noon-app-buttons">
                <a href="#" className="noon-app-btn">
                  <FontAwesomeIcon icon={faApple} />
                  <div>
                    <span>حمّل من</span>
                    <strong>App Store</strong>
                  </div>
                </a>
                <a href="#" className="noon-app-btn">
                  <FontAwesomeIcon icon={faGooglePlay} />
                  <div>
                    <span>حمّل من</span>
                    <strong>Google Play</strong>
                  </div>
                </a>
              </div>
            </div>
            <div className="noon-app-image">
              <img 
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400" 
                alt="تطبيق Buildinz"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="noon-footer">
        <div className="noon-footer-container">
          <div className="noon-footer-content">
            {/* About Section */}
            <div className="noon-footer-section noon-footer-about">
              <div className="noon-footer-logo">
                <FontAwesomeIcon icon={faTools} />
                Buildinz
              </div>
              <p>
                منصة شاملة تربط بين العملاء ومقدمي الخدمات المنزلية والمهنية في دولة الإمارات العربية المتحدة.
              </p>
              <div className="noon-footer-social">
                <a href="#" aria-label="Facebook">
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
                <a href="#" aria-label="Twitter">
                  <FontAwesomeIcon icon={faTwitter} />
                </a>
                <a href="#" aria-label="Instagram">
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
                <a href="#" aria-label="LinkedIn">
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
                <a href="#" aria-label="WhatsApp">
                  <FontAwesomeIcon icon={faWhatsapp} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="noon-footer-section noon-footer-links">
              <h3>روابط سريعة</h3>
              <ul>
                <li><Link to="/services2/categories">الخدمات</Link></li>
                <li><Link to="/about">من نحن</Link></li>
                <li><Link to="/faq">الأسئلة الشائعة</Link></li>
                <li><Link to="/contact">تواصل معنا</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div className="noon-footer-section noon-footer-links">
              <h3>الدعم</h3>
              <ul>
                <li><Link to="/help">مركز المساعدة</Link></li>
                <li><Link to="/privacy">سياسة الخصوصية</Link></li>
                <li><Link to="/terms">الشروط والأحكام</Link></li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div className="noon-footer-section noon-footer-contact">
              <h3>تواصل معنا</h3>
              <div className="noon-contact-info">
                <FontAwesomeIcon icon={faPhone} />
                <span>+971 XX XXX XXXX</span>
              </div>
              <div className="noon-contact-info">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>info@buildinz.com</span>
              </div>
              <div className="noon-contact-info">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>دبي، الإمارات</span>
              </div>
              
              <div className="noon-newsletter">
                <h4>النشرة الإخبارية</h4>
                <form onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit">اشتراك</button>
                </form>
              </div>
            </div>
          </div>

          <div className="noon-footer-bottom">
            <p>&copy; 2024 Buildinz. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
