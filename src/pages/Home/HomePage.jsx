import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSpring, animated, useTrail, useChain, useSpringRef } from 'react-spring';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AOS from 'aos';
import 'aos/dist/aos.css';

import './HomePage.css';
import buildingzData from '../../data/json/buildingzData.json';
import LoadingScreen from '../../components/LoadingScreen';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const heroRef = useRef(null);
  const waveRef = useRef(null);
  const particlesRef = useRef(null);
  const goldLineRef = useRef(null);
  const { scrollY } = useScroll();

  // Loading management
  useEffect(() => {
    // Simulate loading time for assets and data
    const loadingTimer = setTimeout(() => {
      setContentReady(true);
    }, 100); // Allow content to be ready quickly, loading screen handles the timing

    return () => clearTimeout(loadingTimer);
  }, []);

  // Initialize AOS after loading
  useEffect(() => {
    if (contentReady) {
      AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-out-cubic',
      });
    }
  }, [contentReady]);

  // Handle loading completion
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // GSAP Animations
  useEffect(() => {
    if (!contentReady || isLoading) return;
    
    const ctx = gsap.context(() => {
      // Hero particles animation
      gsap.to('.particle', {
        y: -30,
        x: 20,
        rotation: 360,
        duration: 3,
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
        ease: 'power2.inOut'
      });

      // Gold line animation
      gsap.fromTo('.gold-line', 
        { 
          scaleX: 0,
          transformOrigin: 'left center'
        },
        {
          scaleX: 1,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.hero-section',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
          }
        }
      );

      // Floating elements
      gsap.to('.floating-shape', {
        y: -20,
        rotation: 180,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        stagger: 0.5
      });

      // Wave animation
      gsap.to('.hero-wave', {
        backgroundPosition: '100% 0',
        duration: 8,
        repeat: -1,
        ease: 'none'
      });

      // Morphing background
      gsap.to('.morphing-bg', {
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });

    }, heroRef);

    return () => ctx.revert();
  }, [contentReady, isLoading]);

  // React Spring animations
  const heroAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(50px) scale(0.9)' },
    to: { opacity: 1, transform: 'translateY(0) scale(1)' },
    config: { tension: 120, friction: 14 },
    delay: 300,
  });

  // Trail animation for hero buttons
  const trailRef = useSpringRef();
  const trail = useTrail(2, {
    ref: trailRef,
    from: { opacity: 0, transform: 'translateX(50px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: { tension: 400, friction: 40 }
  });

  useChain([trailRef], [1]);

  // Parallax transforms
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 360]);

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
    <>
      {/* Loading Screen */}
      <LoadingScreen 
        isLoading={isLoading} 
        onComplete={handleLoadingComplete}
      />
      
      {/* Main Homepage Content */}
      {!isLoading && (
        <div className="homepage" ref={heroRef}>
          {/* Hero Section with Advanced Effects */}
      <section className="hero-section">
        {/* Animated Background Elements */}
        <div className="hero-bg-effects">
          <div className="morphing-bg"></div>
          <div className="particle-field">
            {[...Array(15)].map((_, i) => (
              <div key={i} className={`particle particle-${i}`}></div>
            ))}
          </div>
          <div className="floating-shapes">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`floating-shape shape-${i}`}></div>
            ))}
          </div>
        </div>

        <motion.div className="hero-parallax" style={{ y: y1 }}></motion.div>
        
        {/* Gold Line Effect */}
        <div className="gold-line-container">
          <div className="gold-line" ref={goldLineRef}></div>
          <div className="gold-sparkles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`sparkle sparkle-${i}`}></div>
            ))}
          </div>
        </div>

        <div className="container">
          <animated.div className="hero-content" style={heroAnimation}>
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              أنجز كل خدماتك المنزلية والتجارية بسهولة مع{' '}
              <motion.span 
                className="highlight"
                whileHover={{ scale: 1.05, color: '#FFD700' }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                BuildingZ
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              نحن المنصة الأولى في الإمارات التي تتيح لك حجز خدمات موثوقة مثل التنظيف، الصيانة، التركيبات، وغيرها بضغطة زر.
            </motion.p>
            
            <div className="hero-buttons">
              {trail.map((style, index) => (
                <animated.div key={index} style={style}>
                  {index === 0 ? (
                    <Link to="/services" className="primary-btn glow-btn">
                      <span className="btn-text">احجز الآن</span>
                      <span className="btn-icon"><i className="fas fa-arrow-left"></i></span>
                      <div className="btn-ripple"></div>
                    </Link>
                  ) : (
                    <Link to="/services" className="secondary-btn glass-btn">
                      <span className="btn-text">تصفح الخدمات</span>
                    </Link>
                  )}
                </animated.div>
              ))}
            </div>
          </animated.div>
        </div>
        
        <motion.div 
          className="hero-wave" 
          ref={waveRef}
          style={{ y: y2 }}
        ></motion.div>
      </section>

      {/* Value Cards Section with Light Animations */}
      <section className="value-cards-section">
        <div className="container">
          <div className="value-cards-grid">
            {[
              {
                icon: "fa-th-large",
                title: "خدمات متنوعة",
                description: "خدمات شاملة للمنازل، المكاتب، الشركات، والمتاجر — كلها في تطبيق واحد."
              },
              {
                icon: "fa-bolt",
                title: "حجز سريع وسهل",
                description: "اختر خدمتك والموقع والتاريخ، وسنقوم بالباقي."
              },
              {
                icon: "fa-tasks",
                title: "إدارة كاملة للخدمة",
                description: "تابع الطلبات، قيّم مزود الخدمة، وتواصل بسهولة من خلال التطبيق."
              }
            ].map((card, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">
                  <i className={`fas ${card.icon}`}></i>
                </div>
                <h3 className="value-title">{card.title}</h3>
                <p className="value-description">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <h2 className="section-title">
                BuildingZ – <span className="highlight">خدمات موثوقة لحياة أسهل</span>
              </h2>
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
              <img 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d87f426b11-8b49fa125e5694bcb57a.png" 
                alt="BuildingZ App"
              />
              <div className="about-image-shape"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div 
                key={stat.id} 
                className="stat-card"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="stat-icon">
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section with Hover Effects */}
      <section className="categories-section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">الأقسام الرئيسية <span className="highlight">للخدمات</span></h2>
            <p className="section-description">اختر نوع الخدمة التي تحتاجها</p>
          </motion.div>
          
          <div className="categories-grid">
            {buildingzData.categories.map((category, index) => (
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
                {[
                  { icon: "fa-check-circle", text: "واجهة سهلة الاستخدام" },
                  { icon: "fa-map-marker-alt", text: "تتبع الخدمة لحظة بلحظة" },
                  { icon: "fa-bell", text: "إشعارات فورية" },
                  { icon: "fa-star", text: "تقييمات موثوقة" }
                ].map((feature, index) => (
                  <div key={index} className="app-feature">
                    <i className={`fas ${feature.icon}`}></i>
                    <span>{feature.text}</span>
                  </div>
                ))}
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
              <motion.div 
                className="phone-mockup"
                animate={{ 
                  y: [0, -10, 0]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="phone-screen">
                  <img src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d87f426b11-8b49fa125e5694bcb57a.png" alt="BuildingZ App" />
                </div>
                <div className="phone-notch"></div>
              </motion.div>
              <div className="phone-shadow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="clients-section">
        <div className="container">
          <h2 className="section-title">
            الشركاء <span className="highlight">والعملاء</span>
          </h2>
          <p className="section-description">
            نفتخر بخدمة عملائنا في مختلف القطاعات
          </p>
          
          <div className="clients-grid">
            {[
              { icon: "fa-home", title: "الأفراد والعائلات" },
              { icon: "fa-building", title: "الشركات والمكاتب" },
              { icon: "fa-landmark", title: "الفلل والمباني" },
              { icon: "fa-store", title: "متاجر البيع بالتجزئة" },
              { icon: "fa-city", title: "المشاريع العقارية" }
            ].map((client, index) => (
              <div key={index} className="client-type">
                <div className="client-icon">
                  <i className={`fas ${client.icon}`}></i>
                </div>
                <h3>{client.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">
            آراء <span className="highlight">العملاء</span>
          </h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="testimonial-card">
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
          <h2 className="section-title">
            الإضافات <span className="highlight">الجديدة</span>
          </h2>
          <p className="section-description">
            جديد في BuildingZ؟ جرّب هذه الخدمات المضافة حديثاً
          </p>
          
          <div className="latest-grid">
            {[
              { icon: "fa-couch", title: "تنظيف المجالس والسجاد" },
              { icon: "fa-spray-can", title: "خدمات تعقيم ومكافحة الحشرات" },
              { icon: "fa-video", title: "تركيب كاميرات المراقبة" },
              { icon: "fa-wind", title: "صيانة أجهزة التكييف المركزية" }
            ].map((latest, index) => (
              <div key={index} className="latest-card">
                <div className="latest-icon">
                  <i className={`fas ${latest.icon}`}></i>
                </div>
                <h3>{latest.title}</h3>
              </div>
            ))}
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
                {[
                  { icon: "fa-phone-alt", title: "الهاتف / واتساب", value: "+971 50 123 4567" },
                  { icon: "fa-envelope", title: "البريد الإلكتروني", value: "support@buildinz.com" },
                  { icon: "fa-clock", title: "ساعات العمل", value: "طوال أيام الأسبوع – 24/7" }
                ].map((contact, index) => (
                  <div key={index} className="contact-item">
                    <div className="contact-icon">
                      <i className={`fas ${contact.icon}`}></i>
                    </div>
                    <div className="contact-detail">
                      <h3>{contact.title}</h3>
                      <p>{contact.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link to="/contact" className="contact-btn">
                تواصل معنا الآن
                <i className="fas fa-arrow-left"></i>
              </Link>
            </div>
            
            <div className="contact-image">
              <img 
                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d87f426b11-8b49fa125e5694bcb57a.png" 
                alt="Customer Support"
              />
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
              {[
                {
                  title: "روابط سريعة",
                  links: [
                    { to: "/", text: "الرئيسية" },
                    { to: "/services", text: "الخدمات" },
                    { to: "/about", text: "من نحن" },
                    { to: "/contact", text: "تواصل معنا" }
                  ]
                },
                {
                  title: "التطبيق",
                  links: [
                    { href: "#", text: "حمل التطبيق" },
                    { to: "/privacy", text: "سياسة الخصوصية" },
                    { to: "/terms", text: "الشروط والأحكام" }
                  ]
                },
                {
                  title: "تواصل معنا",
                  links: [
                    { href: "tel:+97150123456", text: "+971 50 123 4567" },
                    { href: "mailto:support@buildinz.com", text: "support@buildinz.com" }
                  ]
                }
              ].map((group, groupIndex) => (
                <div key={groupIndex} className="footer-link-group">
                  <h3>{group.title}</h3>
                  <ul>
                    {group.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        {link.to ? (
                          <Link to={link.to}>{link.text}</Link>
                        ) : (
                          <a href={link.href}>{link.text}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                  {groupIndex === 2 && (
                    <div className="footer-social">
                      {['facebook-f', 'twitter', 'instagram', 'linkedin-in'].map((social, socialIndex) => (
                        <a key={socialIndex} href="#">
                          <i className={`fab fa-${social}`}></i>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 BuildingZ. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
        </div>
      )}
    </>
  );
};

export default HomePage; 