import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, faUsers, faHandshake, faLightbulb, 
  faStar, faTrophy, faChartLine, faGlobe, faCheck,
  faShieldAlt, faAward, faHeart, faRocket, faBullseye,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
  const [animateSection, setAnimateSection] = useState({
    hero: false,
    about: false,
    values: false,
    mission: false,
    cta: false
  });

  useEffect(() => {
    setAnimateSection(prev => ({ ...prev, hero: true }));
    
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          setAnimateSection(prev => ({ ...prev, [sectionId]: true }));
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.about-section').forEach(section => {
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, []);

  const values = [
    {
      icon: faShieldAlt,
      title: 'الجودة والموثوقية',
      description: 'نلتزم بأعلى معايير الجودة في جميع خدماتنا، ونضمن لك نتائج متميزة تدوم طويلاً.'
    },
    {
      icon: faHandshake,
      title: 'الشفافية والثقة',
      description: 'نؤمن بالشفافية الكاملة في التعامل مع عملائنا، مع تقديم معلومات واضحة ودقيقة عن كل خطوة.'
    },
    {
      icon: faUsers,
      title: 'خدمة العملاء المتميزة',
      description: 'فريقنا متاح دائماً لمساعدتك، ونقدم دعمًا مستمرًا لضمان رضاك التام عن خدماتنا.'
    },
    {
      icon: faRocket,
      title: 'الابتكار والتطوير',
      description: 'نواكب أحدث التقنيات والاتجاهات في المجال لنقدم لك حلولاً مبتكرة وعصرية.'
    }
  ];

  const stats = [
    { number: '500+', label: 'مشروع منجز' },
    { number: '1000+', label: 'عميل راضٍ' },
    { number: '50+', label: 'فني محترف' },
    { number: '5+', label: 'سنوات خبرة' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className={`about-hero ${animateSection.hero ? 'animate' : ''}`}>
        <div className="about-hero-overlay"></div>
        <div className="about-container">
          <h1 className="about-hero-title">من نحن</h1>
          <p className="about-hero-subtitle">شركة BuildingZ - شريكك الموثوق في البناء والتشطيب</p>
        </div>
      </section>

      {/* About Us Content Section */}
      <section id="about" className={`about-section about-content ${animateSection.about ? 'animate' : ''}`}>
        <div className="about-container">
          <div className="about-content-wrapper">
            <div className="about-text">
              <h2>نبذة عن BuildingZ</h2>
              <p>
                BuildingZ هي شركة رائدة متخصصة في تقديم حلول شاملة في مجال البناء والتشطيب والخدمات الهندسية في دولة الإمارات العربية المتحدة. نحن نقدم مجموعة واسعة من الخدمات التي تغطي جميع احتياجاتك من التصميم إلى التنفيذ والتشطيب النهائي.
              </p>
              <p>
                نسعى جاهدين لتقديم أعلى مستويات الجودة والشفافية لعملائنا، مع التركيز على توفير كل ما يحتاجه العميل في مكان واحد دون الحاجة للبحث بين مقدمي خدمات مختلفين. هدفنا هو تبسيط عملية البناء والتشطيب وجعلها تجربة سلسة ومريحة.
              </p>
              <p className="about-tagline">
                <FontAwesomeIcon icon={faLightbulb} /> بضغطة زر بيتك يتشطب
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="about-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div className="stat-card" key={index}>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className={`about-section about-values ${animateSection.values ? 'animate' : ''}`}>
        <div className="about-container">
          <div className="section-header">
            <h2 className="section-title">قيمنا ومبادئنا</h2>
            <p className="section-subtitle">ما يميزنا ويجعلنا الخيار الأمثل لك</p>
          </div>
          
          <div className="values-grid">
            {values.map((value, index) => (
              <div className="value-card" key={index}>
                <div className="value-icon">
                  <FontAwesomeIcon icon={value.icon} />
                </div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className={`about-section about-mission ${animateSection.mission ? 'animate' : ''}`}>
        <div className="about-container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>رؤيتنا ورسالتنا</h2>
              <div className="mission-item">
                <FontAwesomeIcon icon={faRocket} className="mission-icon" />
                <div>
                  <h3>رؤيتنا</h3>
                  <p>أن نكون الشركة الرائدة في مجال البناء والتشطيب في دولة الإمارات، من خلال تقديم حلول مبتكرة وخدمات متميزة تلبي جميع احتياجات عملائنا.</p>
                </div>
              </div>
              <div className="mission-item">
                <FontAwesomeIcon icon={faBullseye} className="mission-icon" />
                <div>
                  <h3>رسالتنا</h3>
                  <p>تقديم خدمات بناء وتشطيب عالية الجودة بأسعار عادلة، مع ضمان الشفافية الكاملة والالتزام بالمواعيد. نهدف إلى جعل عملية البناء والتشطيب تجربة سهلة ومريحة لعملائنا من خلال توفير جميع الخدمات في مكان واحد.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`about-cta ${animateSection.cta ? 'animate' : ''}`}>
        <div className="about-container">
          <h2>ابدأ مشروعك معنا اليوم</h2>
          <p className="cta-text">نقدم لك جميع الخدمات التي تحتاجها في مكان واحد</p>
          <div className="about-cta-buttons">
            <Link to="/services2/categories" className="about-btn about-btn-primary">
              استكشف خدماتنا
            </Link>
            <Link to="/contact" className="about-btn about-btn-secondary">
              تواصل معنا
            </Link>
          </div>
          <div className="contact-info">
            <a href="https://www.instagram.com/buildingzuae/" target="_blank" rel="noopener noreferrer" className="contact-link">
              <FontAwesomeIcon icon={faGlobe} />
              @buildingzuae
            </a>
            <a href="mailto:info@buildingzuae.com" className="contact-link">
              <FontAwesomeIcon icon={faEnvelope} />
              info@buildingzuae.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;