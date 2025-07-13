import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

import './HomePage.css';
import buildingzData from '../../data/json/buildingzData.json';
import SkeletonLoader from '../../components/SkeletonLoader';

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Loading management
  useEffect(() => {
    // Simulate loading time for assets and data
    const loadingTimer = setTimeout(() => {
      setContentReady(true);
      
      // Force the loading to complete after a set time
      const forceCompleteTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1500); // Force completion after 1.5 seconds
      
      return () => clearTimeout(forceCompleteTimer);
    }, 100);

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

  // Handle loading completion - this can be triggered by the skeleton loader
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  // Group categories by type
  const serviceGroups = [
    {
      title: "التنظيف العام",
      services: [
        { id: 101, name: "تنظيف المنزل", icon: "🧹", image: "/images/services/home-cleaning.jpg" },
        { id: 102, name: "تنظيف الأثاث", icon: "🛋️", image: "/images/services/furniture-cleaning.jpg" },
        { id: 103, name: "تنظيف السجاد", icon: "🧶", image: "/images/services/carpet-cleaning.jpg" },
        { id: 104, name: "تنظيف المكيفات", icon: "❄️", image: "/images/services/ac-cleaning.jpg" },
        { id: 105, name: "تنظيف الغسيل والكي", icon: "👕", image: "/images/services/laundry-cleaning.jpg" }
      ]
    },
    {
      title: "صالون وسبا في المنزل",
      services: [
        { id: 201, name: "صالون نسائي", icon: "💇‍♀️", image: "/images/services/women-salon.jpg" },
        { id: 202, name: "سبا نسائي", icon: "💆‍♀️", image: "/images/services/women-spa.jpg" },
        { id: 203, name: "صالون رجالي", icon: "💇‍♂️", image: "/images/services/men-salon.jpg" },
        { id: 204, name: "سبا رجالي", icon: "💆‍♂️", image: "/images/services/men-spa.jpg" },
        { id: 205, name: "العناية بالشعر", icon: "✂️", image: "/images/services/hair-care.jpg" }
      ]
    },
    {
      title: "الصيانة والتركيب",
      services: [
        { id: 301, name: "الصيانة العامة", icon: "🔧", image: "/images/services/handyman.jpg" },
        { id: 302, name: "دهان المنزل", icon: "🎨", image: "/images/services/home-painting.jpg" }
      ]
    },
    {
      title: "الرعاية الصحية في المنزل",
      services: [
        { id: 401, name: "فحوصات منزلية", icon: "🩺", image: "/images/services/lab-tests.jpg" },
        { id: 402, name: "العلاج الطبيعي", icon: "🧠", image: "/images/services/physiotherapy.jpg" },
        { id: 403, name: "استشارات طبية", icon: "👨‍⚕️", image: "/images/services/doctor-consultation.jpg" },
        { id: 404, name: "فحوصات PCR", icon: "🧪", image: "/images/services/pcr-test.jpg" },
        { id: 405, name: "رعاية التمريض", icon: "👩‍⚕️", image: "/images/services/nurse-care.jpg" }
      ]
    }
  ];

  // Features for "Why Choose Us" section
  const features = [
    {
      id: 1,
      title: "أفضل المحترفين",
      description: "فنيونا من أفضل المحترفين في مجالاتهم، بمعدل تقييم 4.8/5 من العملاء.",
      icon: "⭐"
    },
    {
      id: 2,
      title: "توفر بنفس اليوم",
      description: "احجز خدمتك في أي وقت، وحتى في نفس اليوم، بكل سهولة.",
      icon: "🕒"
    },
    {
      id: 3,
      title: "جودة وقيمة مضمونة",
      description: "خدماتنا ذات جودة عالية وبأسعار تنافسية، مع ضمان رضا العميل.",
      icon: "✅"
    },
    {
      id: 4,
      title: "تطبيق سهل الاستخدام",
      description: "تطبيقنا سهل الاستخدام ويوفر كل ما تحتاجه من خدمات منزلية.",
      icon: "📱"
    }
  ];

  return (
    <>
      {/* Loading Screen */}
      <SkeletonLoader 
        isLoading={isLoading} 
        onComplete={handleLoadingComplete}
      />
      
      {/* Main Homepage Content */}
      {!isLoading && (
        <div className="homepage">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="container">
              <div className="hero-content">
                <h1 className="hero-title">
                  أنجز كل خدماتك المنزلية والتجارية بسهولة مع{' '}
                  <span className="highlight">BuildingZ</span>
                </h1>
                
                <p className="hero-description">
                  نحن المنصة الأولى في الإمارات التي تتيح لك حجز خدمات موثوقة مثل التنظيف، الصيانة، التركيبات، وغيرها بضغطة زر.
                </p>
                
                {/* Search Input */}
                <form className="hero-search-form" onSubmit={handleSearchSubmit}>
                  <div className="search-input-container">
                    <input
                      type="text"
                      className="hero-search-input"
                      placeholder="ابحث عن خدمة..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="search-button">
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </form>

                <div className="hero-buttons">
                  <Link to="/services" className="primary-btn">
                    <i className="fas fa-tools btn-icon"></i>
                    استكشف الخدمات
                  </Link>
                  <Link to="/products" className="secondary-btn">
                    <i className="fas fa-box-open btn-icon"></i>
                    تصفح المنتجات
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Service Categories Section */}
          {serviceGroups.map((group, index) => (
            <section key={index} className="service-category-section">
              <div className="container">
                <div className="section-header">
                  <h2 className="section-title">{group.title}</h2>
                  <div className="section-actions">
                    <Link to={`/services?category=${encodeURIComponent(group.title)}`} className="see-all-link">
                      عرض الكل <i className="fas fa-arrow-left"></i>
                    </Link>
                  </div>
                </div>
                
                <div className="services-grid">
                  {group.services.map(service => (
                    <Link to={`/services?id=${service.id}`} key={service.id} className="service-card">
                      <div className="service-image">
                        <div className="service-icon">{service.icon}</div>
                      </div>
                      <h3 className="service-name">{service.name}</h3>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          ))}

          {/* Why Choose Us Section */}
          <section className="why-choose-us-section">
            <div className="container">
              <h2 className="section-title">هناك العديد من الأسباب لاختيار BuildingZ!</h2>
              <p className="section-description">إليك أهم ما يميزنا</p>
              
              <div className="features-grid">
                {features.map(feature => (
                  <div key={feature.id} className="feature-card" data-aos="fade-up">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="testimonials-section">
            <div className="container">
              <h2 className="section-title">ماذا يقول العملاء عن BuildingZ</h2>
              <p className="section-description">BuildingZ حاصل على تقييم 4.8 من 5 بناءً على 1525 تقييم</p>
              
              <div className="testimonials-grid">
                {testimonials.map(testimonial => (
                  <div key={testimonial.id} className="testimonial-card" data-aos="fade-up">
                    <div className="testimonial-stars">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className="fas fa-star"></i>
                      ))}
                    </div>
                    <p className="testimonial-text">{testimonial.text}</p>
                    <div className="testimonial-author">
                      <div className="author-name">{testimonial.name}</div>
                      <div className="author-location">{testimonial.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* App Download Section */}
          <section className="app-download-section">
            <div className="container">
              <div className="app-content">
                <div className="app-text">
                  <h2 className="section-title">إدارة جميع المهام بنقرة واحدة!</h2>
                  <p className="section-description">تتبع وإدارة مواعيدك، حجز الخدمات، ومتابعة الفنيين بكل سهولة.</p>
                  
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
                <div className="app-image">
                  <img src="/images/app-mockup.png" alt="BuildingZ App" className="app-mockup" />
                </div>
              </div>
            </div>
          </section>

          {/* Promise Section */}
          <section className="promise-section">
            <div className="container">
              <div className="promise-content">
                <div className="promise-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h2 className="promise-title">وعد BuildingZ - التميز في كل منزل</h2>
                <p className="promise-text">
                  في BuildingZ، نلتزم بأعلى معايير الخدمة المنزلية. فريقنا المدرب يقدم تجربة خدمة متميزة، مما يضمن أن منزلك في أيدٍ خبيرة. راحة بالك هي أولويتنا.
                </p>
              </div>
            </div>
          </section>

          {/* Footer CTA Section */}
          <section className="cta-section">
            <div className="container">
              <h2 className="cta-title">جاهز لتجربة أفضل خدمات منزلية؟</h2>
              <p className="cta-description">انضم إلى آلاف العملاء السعداء واحصل على خدمة استثنائية اليوم.</p>
              <Link to="/services" className="cta-button">
                احجز خدمة الآن <i className="fas fa-arrow-left"></i>
              </Link>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default HomePage; 