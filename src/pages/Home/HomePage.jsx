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

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      text: "جربت خدمة تركيب من BuildingZ وكان الفني محترف ووصل في الوقت المحدد!",
      name: "خالد",
      location: "دبي"
    },
    {
      id: 2,
      text: "أطلب من التطبيق خدمات تنظيف بشكل أسبوعي. جودة ممتازة وسهولة في التعامل.",
      name: "مريم",
      location: "أبوظبي"
    },
    {
      id: 3,
      text: "كل شيء تم إلكترونيًا وبسهولة، فريق الدعم ساعدني فوراً لما واجهت مشكلة بسيطة.",
      name: "أحمد",
      location: "الشارقة"
    }
  ];

  // Stats data
  const stats = [
    { id: 1, icon: "fa-check", value: "15,000+", label: "خدمة منفذة بنجاح" },
    { id: 2, icon: "fa-tools", value: "300+", label: "فني ومزود خدمة نشط" },
    { id: 3, icon: "fa-city", value: "100%", label: "تغطية شاملة لكل الإمارات" },
    { id: 4, icon: "fa-star", value: "4.8/5", label: "معدل رضا العملاء" }
  ];

  return (
    <div className="homepage">
      {/* Hero Section with Parallax */}
      <section className="hero-section">
        <div className="hero-parallax"></div>
        <div className="hero-particles"></div>
        <div className="container">
          <animated.div className="hero-content" style={heroAnimation}>
            <h1 className="hero-title">
              أنجز كل خدماتك المنزلية والتجارية بسهولة مع <animated.span className="highlight">BuildingZ</animated.span>
            </h1>
            <animated.p className="hero-description">
              نحن المنصة الأولى في الإمارات التي تتيح لك حجز خدمات موثوقة مثل التنظيف، الصيانة، التركيبات، وغيرها بضغطة زر.
            </animated.p>
            <animated.div className="hero-buttons">
              <Link to="/services" className="primary-btn">
                <span className="btn-text">احجز الآن</span>
                <span className="btn-icon"><i className="fas fa-arrow-left"></i></span>
              </Link>
              <Link to="/services" className="secondary-btn">
                <span className="btn-text">تصفح الخدمات</span>
              </Link>
            </animated.div>
          </animated.div>
        </div>
        <div className="hero-wave"></div>
      </section>

      {/* Value Cards Section */}
      <section className="value-cards-section">
        <div className="container">
          <div className="value-cards-grid">
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-th-large"></i>
              </div>
              <h3 className="value-title">خدمات متنوعة</h3>
              <p className="value-description">
                خدمات شاملة للمنازل، المكاتب، الشركات، والمتاجر — كلها في تطبيق واحد.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-bolt"></i>
              </div>
              <h3 className="value-title">حجز سريع وسهل</h3>
              <p className="value-description">
                اختر خدمتك والموقع والتاريخ، وسنقوم بالباقي.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <h3 className="value-title">إدارة كاملة للخدمة</h3>
              <p className="value-description">
                تابع الطلبات، قيّم مزود الخدمة، وتواصل بسهولة من خلال التطبيق.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">BuildingZ – <span className="highlight">خدمات موثوقة لحياة أسهل</span></h2>
              <p className="about-description">
                BuildingZ هي منصتك الذكية لإتمام جميع احتياجاتك اليومية أو التجارية داخل الإمارات. نقدم خدمات فعالة وسريعة عبر تطبيق سهل الاستخدام. هدفنا أن نجعل تجربة حجز الخدمة سلسة، شفافة، وموثوقة — بدون مكالمات مزعجة، ولا انتظار.
              </p>
              
              <h3 className="about-subtitle">لماذا BuildingZ؟</h3>
              <ul className="about-features">
                <li><i className="fas fa-headset"></i> فريق خدمة عملاء متواجد دائمًا</li>
                <li><i className="fas fa-user-check"></i> مزودو خدمات تم التحقق منهم</li>
                <li><i className="fas fa-heart"></i> رضا العملاء هو أولويتنا</li>
                <li><i className="fas fa-mobile-alt"></i> واجهة استخدام سهلة وسريعة</li>
              </ul>
              
              <Link to="/about" className="about-btn">
                اعرف أكثر
                <i className="fas fa-arrow-left"></i>
              </Link>
            </div>
            <div className="about-image">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d87f426b11-8b49fa125e5694bcb57a.png" alt="BuildingZ App" />
              <div className="about-image-shape"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map(stat => (
              <div className="stat-card" key={stat.id}>
                <div className="stat-icon">
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div>
            <h2 className="section-title">الأقسام الرئيسية <span className="highlight">للخدمات</span></h2>
            <p className="section-description">
              اختر نوع الخدمة التي تحتاجها
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
          
          <div className="categories-action">
            <Link to="/services" className="view-all-btn">
              استعرض كل الخدمات
              <i className="fas fa-arrow-left"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="app-download-section">
        <div className="container">
          <div className="app-download-content">
            <div className="app-download-text">
              <h2 className="app-title">كل خدماتك في جيبك!</h2>
              <p className="app-description">
                حمّل تطبيق BuildingZ وتمتع بتجربة حجز خالية من التعقيد.
              </p>
              <div className="app-features">
                <div className="app-feature">
                  <i className="fas fa-check-circle"></i>
                  <span>واجهة سهلة الاستخدام</span>
                </div>
                <div className="app-feature">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>تتبع الخدمة لحظة بلحظة</span>
                </div>
                <div className="app-feature">
                  <i className="fas fa-bell"></i>
                  <span>إشعارات فورية</span>
                </div>
                <div className="app-feature">
                  <i className="fas fa-star"></i>
                  <span>تقييمات موثوقة</span>
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

      {/* Clients Section */}
      <section className="clients-section">
        <div className="container">
          <h2 className="section-title">الشركاء <span className="highlight">والعملاء</span></h2>
          <p className="section-description">نفتخر بخدمة عملائنا في مختلف القطاعات</p>
          
          <div className="clients-grid">
            <div className="client-type">
              <div className="client-icon"><i className="fas fa-home"></i></div>
              <h3>الأفراد والعائلات</h3>
            </div>
            <div className="client-type">
              <div className="client-icon"><i className="fas fa-building"></i></div>
              <h3>الشركات والمكاتب</h3>
            </div>
            <div className="client-type">
              <div className="client-icon"><i className="fas fa-landmark"></i></div>
              <h3>الفلل والمباني</h3>
            </div>
            <div className="client-type">
              <div className="client-icon"><i className="fas fa-store"></i></div>
              <h3>متاجر البيع بالتجزئة</h3>
            </div>
            <div className="client-type">
              <div className="client-icon"><i className="fas fa-city"></i></div>
              <h3>المشاريع العقارية</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">آراء <span className="highlight">العملاء</span></h2>
          <div className="testimonials-grid">
            {testimonials.map(testimonial => (
              <div className="testimonial-card" key={testimonial.id}>
                <div className="testimonial-quote">
                  <i className="fas fa-quote-right"></i>
                </div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Additions Section */}
      <section className="latest-section">
        <div className="container">
          <h2 className="section-title">الإضافات <span className="highlight">الجديدة</span></h2>
          <p className="section-description">جديد في BuildingZ؟ جرّب هذه الخدمات المضافة حديثاً</p>
          
          <div className="latest-grid">
            <div className="latest-card">
              <div className="latest-icon">
                <i className="fas fa-couch"></i>
              </div>
              <h3>تنظيف المجالس والسجاد</h3>
            </div>
            <div className="latest-card">
              <div className="latest-icon">
                <i className="fas fa-spray-can"></i>
              </div>
              <h3>خدمات تعقيم ومكافحة الحشرات</h3>
            </div>
            <div className="latest-card">
              <div className="latest-icon">
                <i className="fas fa-video"></i>
              </div>
              <h3>تركيب كاميرات المراقبة</h3>
            </div>
            <div className="latest-card">
              <div className="latest-icon">
                <i className="fas fa-wind"></i>
              </div>
              <h3>صيانة أجهزة التكييف المركزية</h3>
            </div>
          </div>
          
          <div className="latest-actions">
            <Link to="/services" className="primary-btn">
              <span className="btn-text">اطلب الآن</span>
              <span className="btn-icon"><i className="fas fa-arrow-left"></i></span>
            </Link>
            <Link to="/services" className="secondary-btn">
              <span className="btn-text">استعرض الجديد</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-content">
            <div className="contact-text">
              <h2 className="contact-title">تواصل <span className="highlight">معنا</span></h2>
              <p className="contact-description">
                هل لديك سؤال؟ فريقنا هنا لخدمتك على مدار الساعة.
              </p>
              
              <div className="contact-info">
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div className="contact-detail">
                    <h3>الهاتف / واتساب</h3>
                    <p>+971 50 123 4567</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div className="contact-detail">
                    <h3>البريد الإلكتروني</h3>
                    <p>support@buildinz.com</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="contact-detail">
                    <h3>ساعات العمل</h3>
                    <p>طوال أيام الأسبوع – 24/7</p>
                  </div>
                </div>
              </div>
              
              <Link to="/contact" className="contact-btn">
                تواصل معنا الآن
                <i className="fas fa-arrow-left"></i>
              </Link>
            </div>
            
            <div className="contact-image">
              <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d87f426b11-8b49fa125e5694bcb57a.png" alt="Customer Support" />
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

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <h2>BuildingZ</h2>
              <p>نحن نضع بين يديك كل خدماتك اليومية في تطبيق واحد.</p>
            </div>
            
            <div className="footer-links">
              <div className="footer-link-group">
                <h3>روابط سريعة</h3>
                <ul>
                  <li><Link to="/">الرئيسية</Link></li>
                  <li><Link to="/services">الخدمات</Link></li>
                  <li><Link to="/about">من نحن</Link></li>
                  <li><Link to="/contact">تواصل معنا</Link></li>
                </ul>
              </div>
              
              <div className="footer-link-group">
                <h3>التطبيق</h3>
                <ul>
                  <li><a href="#">حمل التطبيق</a></li>
                  <li><Link to="/privacy">سياسة الخصوصية</Link></li>
                  <li><Link to="/terms">الشروط والأحكام</Link></li>
                </ul>
              </div>
              
              <div className="footer-link-group">
                <h3>تواصل معنا</h3>
                <ul>
                  <li><a href="tel:+97150123456">+971 50 123 4567</a></li>
                  <li><a href="mailto:support@buildinz.com">support@buildinz.com</a></li>
                </ul>
                <div className="footer-social">
                  <a href="#"><i className="fab fa-facebook-f"></i></a>
                  <a href="#"><i className="fab fa-twitter"></i></a>
                  <a href="#"><i className="fab fa-instagram"></i></a>
                  <a href="#"><i className="fab fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 BuildingZ. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 