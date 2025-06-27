import React from 'react';
import { Link } from 'react-router-dom';
import { useSpring, animated } from 'react-spring';
import { motion } from 'framer-motion';
import './HomePage.css';
import buildingzData from '../../data/json/buildingzData.json';

const HomePage = () => {
  // Hero section animations with react-spring
  const heroAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(30px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 120, friction: 14 },
    delay: 300,
  });

  // Floating animation for hero elements
  const floatAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: { transform: 'translateY(0px)' }, // Disabled floating animation
    config: { tension: 50, friction: 10 },
    delay: 1000,
  });

  // Variants for staggered animations with framer-motion
  const containerVariants = {
    hidden: { opacity: 1 }, // Changed from 0 to 1 to ensure visibility
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 0, opacity: 1 }, // Changed to ensure visibility
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="homepage">
      {/* Hero Section with Parallax */}
      <section className="hero-section">
        <div className="hero-parallax"></div>
        <div className="hero-particles"></div>
        <div className="container">
          <animated.div className="hero-content" style={heroAnimation}>
            <h1 className="hero-title">
              حاسبة تكاليف <animated.span className="highlight">البناء</animated.span><br/>
              <animated.span className="highlight">والتشطيب</animated.span>
            </h1>
            <animated.p className="hero-description">
              الحل الأمثل لحساب تكاليف مشاريع البناء والتشطيب بدقة وسهولة.<br/>
              احصل على تقديرات فورية وشفافة.
            </animated.p>
            <animated.div className="hero-buttons">
              <Link to="/services" className="primary-btn">
                <span className="btn-text">ابدأ الحساب الآن</span>
                <span className="btn-icon"><i className="fas fa-arrow-left"></i></span>
              </Link>
              <Link to="/about" className="secondary-btn">
                <span className="btn-text">تعرف علينا</span>
              </Link>
            </animated.div>
          </animated.div>
        </div>
        <div className="hero-wave"></div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div>
            <h2 className="section-title">خدماتنا <span className="highlight">المتنوعة</span></h2>
            <p className="section-description">
              نقدم مجموعة واسعة من الخدمات لتلبية احتياجات مشروعك بدقة وكفاءة.
            </p>
          </div>
          
          <div className="categories-grid">
            {buildingzData.categories.map((category) => (
              <Link to={`/services/${category.id}`} className="category-card" key={category.id}>
                <div className="category-icon">
                  <span>{category.icon}</span>
                </div>
                <h3 className="category-title">{category.name}</h3>
                <p className="category-description">
                  {category.subcategories.length} خدمة متاحة
                </p>
                <div className="category-arrow">
                  <i className="fas fa-arrow-left"></i>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-section">
        <div className="container">
          <div>
            <h2 className="section-title">لماذا تختار <span className="highlight">BuildingZ</span>؟</h2>
            <p className="section-description">
              نحن نقدم مجموعة من الميزات المصممة لتبسيط مشاريع البناء الخاصة بك من البداية إلى النهاية.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">
                  <i className="fas fa-calculator"></i>
                </div>
              </div>
              <h3 className="feature-title">تقديرات دقيقة</h3>
              <p className="feature-description">
                احصل على تفاصيل تكلفة دقيقة لمشروعك مع حاسبتنا المتقدمة.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">
                  <i className="fas fa-file-invoice-dollar"></i>
                </div>
              </div>
              <h3 className="feature-title">عروض أسعار شفافة</h3>
              <p className="feature-description">
                قارن عروض الأسعار بسهولة واختر الخيار الأنسب لميزانيتك.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">
                  <i className="fas fa-users-gear"></i>
                </div>
              </div>
              <h3 className="feature-title">مقدمو خدمة معتمدون</h3>
              <p className="feature-description">
                تواصل مع أفضل المهنيين والمقاولين في منطقتك.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
              <h3 className="feature-title">تتبع المشاريع</h3>
              <p className="feature-description">
                راقب تقدم مشروعك من خلال لوحة تحكم سهلة الاستخدام.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div>
            <h2 className="section-title">كيف يعمل؟</h2>
            <p className="section-description">ثلاث خطوات بسيطة لتحقيق مشروع أحلامك.</p>
          </div>
          
          <div className="steps-container">
            <div className="steps-image">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d87f426b11-8b49fa125e5694bcb57a.png" alt="Team collaborating over blueprint" />
            </div>
            
            <div className="steps-content">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-details">
                  <h3 className="step-title">صف مشروعك</h3>
                  <p className="step-description">
                    أدخل تفاصيل مشروعك، من المساحة إلى المواد، في حاسبتنا البديهية.
                  </p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-details">
                  <h3 className="step-title">احصل على تقديرات</h3>
                  <p className="step-description">
                    استلم تقديرات فورية للتكلفة وقائمة بمقدمي الخدمات المؤهلين.
                  </p>
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-details">
                  <h3 className="step-title">اختر وابدأ</h3>
                  <p className="step-description">
                    قارن بين المحترفين، اختر الأفضل لمشروعك، وابدأ العمل بثقة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="app-download-section">
        <div className="container">
          <div className="app-download-content">
            <div className="app-download-text">
              <h2 className="app-title">حمّل تطبيق BuildingZ</h2>
              <p className="app-description">
                احصل على تقديرات البناء والتشطيب في أي وقت وأي مكان. تطبيقنا متاح الآن على متجر آبل وجوجل بلاي.
              </p>
              <div className="app-features">
                <div className="app-feature">
                  <i className="fas fa-bolt"></i>
                  <span>حاسبة فورية</span>
                </div>
                <div className="app-feature">
                  <i className="fas fa-bell"></i>
                  <span>إشعارات مباشرة</span>
                </div>
                <div className="app-feature">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>تتبع المقاولين</span>
                </div>
              </div>
              <div className="app-buttons">
                <a href="#" className="app-store-btn">
                  <i className="fab fa-apple"></i>
                  <div className="btn-text">
                    <span className="small-text">تحميل من</span>
                    <span className="big-text">App Store</span>
                  </div>
                </a>
                <a href="#" className="play-store-btn">
                  <i className="fab fa-google-play"></i>
                  <div className="btn-text">
                    <span className="small-text">تحميل من</span>
                    <span className="big-text">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
            <div className="app-download-image">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d87f426b11-8b49fa125e5694bcb57a.png" alt="BuildingZ App" />
                </div>
                <div className="phone-notch"></div>
              </div>
              <div className="phone-shadow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div>
            <h2 className="cta-title">جاهز لبدء مشروعك؟</h2>
            <p className="cta-description">انضم إلى الآلاف من العملاء الراضين الذين يستخدمون BuildingZ لتحقيق مشاريعهم بنجاح.</p>
            <Link to="/services" className="cta-button">
              ابدأ مشروعك الآن
              <i className="fas fa-arrow-left"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 