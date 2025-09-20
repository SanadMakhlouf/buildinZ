import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, faUsers, faHandshake, faLightbulb, 
  faStar, faTrophy, faChartLine, faGlobe, faCheck
} from '@fortawesome/free-solid-svg-icons';
import './AboutPage.css';

const AboutPage = () => {
  const [animateSection, setAnimateSection] = useState({
    hero: false,
    mission: false,
    values: false,
    team: false,
    stats: false,
    journey: false
  });

  useEffect(() => {
    // Animate hero section immediately
    setAnimateSection(prev => ({ ...prev, hero: true }));
    
    // Set up intersection observer for scroll animations
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
    
    // Observe all sections
    document.querySelectorAll('.about-section').forEach(section => {
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, []);

  // Team members data
  const teamMembers = [
    {
      name: "أحمد الهاشمي",
      position: "المؤسس والرئيس التنفيذي",
      bio: "خبرة أكثر من 15 عاماً في مجال تطوير الأعمال وريادة المشاريع التقنية",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "سارة المنصوري",
      position: "مديرة العمليات",
      bio: "متخصصة في تحسين تجربة العملاء وتطوير العمليات التشغيلية",
      image: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "محمد العتيبي",
      position: "رئيس قسم التكنولوجيا",
      bio: "مهندس برمجيات مع خبرة واسعة في تطوير المنصات الرقمية",
      image: "https://randomuser.me/api/portraits/men/75.jpg"
    },
    {
      name: "نورة الشامسي",
      position: "مديرة التسويق",
      bio: "خبيرة في التسويق الرقمي واستراتيجيات النمو للشركات الناشئة",
      image: "https://randomuser.me/api/portraits/women/63.jpg"
    }
  ];

  // Company values
  const values = [
    { icon: faUsers, title: "العميل أولاً", description: "نضع رضا العملاء في قلب كل ما نقوم به" },
    { icon: faHandshake, title: "النزاهة", description: "نلتزم بأعلى معايير الشفافية والصدق" },
    { icon: faLightbulb, title: "الابتكار", description: "نسعى دائماً لإيجاد حلول مبتكرة لتحديات العملاء" },
    { icon: faStar, title: "التميز", description: "نسعى للتميز في كل جانب من جوانب خدماتنا" }
  ];

  // Company milestones
  const milestones = [
    { year: 2018, title: "تأسيس الشركة", description: "بدأت Buildinz كفكرة لتسهيل الوصول إلى خدمات الصيانة المنزلية" },
    { year: 2019, title: "إطلاق المنصة", description: "إطلاق النسخة الأولى من منصة Buildinz في دبي" },
    { year: 2020, title: "توسع الخدمات", description: "توسعنا لتغطية جميع إمارات الدولة مع إضافة 200+ خدمة جديدة" },
    { year: 2021, title: "تمويل السلسلة أ", description: "حصلنا على تمويل بقيمة 5 مليون دولار لدعم النمو والتوسع" },
    { year: 2022, title: "إطلاق تطبيق الجوال", description: "إطلاق تطبيقات iOS وAndroid لتحسين تجربة المستخدم" },
    { year: 2023, title: "التوسع الإقليمي", description: "بدء التوسع في أسواق الخليج الأخرى" }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className={`about-hero ${animateSection.hero ? 'animate' : ''}`}>
        <div className="about-hero-overlay"></div>
        <div className="about-container">
          <h1>عن Buildinz</h1>
          <p className="about-hero-subtitle">نبني مستقبلاً أفضل للخدمات المنزلية</p>
          <div className="about-hero-content">
            <p>
              منذ تأسيسها في عام 2018، تسعى Buildinz لتغيير طريقة حصول الناس على خدمات الصيانة والإصلاح المنزلية في دولة الإمارات العربية المتحدة.
              نحن نؤمن بأن كل شخص يستحق خدمة سريعة، موثوقة، وبأسعار معقولة عندما يتعلق الأمر بمنزله.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section id="mission" className={`about-section about-mission ${animateSection.mission ? 'animate' : ''}`}>
        <div className="about-container">
          <h2 className="about-section-title">رؤيتنا ومهمتنا</h2>
          <div className="about-mission-grid">
            <div className="about-mission-item">
              <div className="about-section-icon">
                <FontAwesomeIcon icon={faLightbulb} />
              </div>
              <h3>رؤيتنا</h3>
              <p>
                أن نصبح المنصة الرائدة في مجال الخدمات المنزلية في الشرق الأوسط، مع توفير تجربة سلسة وموثوقة لكل من العملاء ومقدمي الخدمات.
              </p>
            </div>
            <div className="about-mission-item">
              <div className="about-section-icon">
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <h3>مهمتنا</h3>
              <p>
                تمكين الناس من العيش في منازل آمنة ومريحة من خلال توفير وصول سهل وموثوق به إلى أفضل المهنيين في مجال الخدمات المنزلية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className={`about-section about-values ${animateSection.values ? 'animate' : ''}`}>
        <div className="about-container">
          <h2 className="about-section-title">قيمنا</h2>
          <div className="about-values-grid">
            {values.map((value, index) => (
              <div className="about-value-card" key={index} style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="about-value-icon">
                  <FontAwesomeIcon icon={value.icon} />
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className={`about-section about-stats ${animateSection.stats ? 'animate' : ''}`}>
        <div className="about-container">
          <div className="about-stats-grid">
            <div className="about-stat-item">
              <div className="about-stat-number">10,000+</div>
              <div className="about-stat-label">عميل سعيد</div>
            </div>
            <div className="about-stat-item">
              <div className="about-stat-number">500+</div>
              <div className="about-stat-label">مزود خدمة</div>
            </div>
            <div className="about-stat-item">
              <div className="about-stat-number">50+</div>
              <div className="about-stat-label">خدمة مختلفة</div>
            </div>
            <div className="about-stat-item">
              <div className="about-stat-number">7</div>
              <div className="about-stat-label">إمارات مغطاة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className={`about-section about-team ${animateSection.team ? 'animate' : ''}`}>
        <div className="about-container">
          <h2 className="about-section-title">فريقنا</h2>
          <p className="about-section-subtitle">
            يتكون فريقنا من خبراء متحمسين ملتزمين بتحويل قطاع الخدمات المنزلية
          </p>
          <div className="about-team-grid">
            {teamMembers.map((member, index) => (
              <div className="about-team-card" key={index} style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="about-team-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <h4>{member.position}</h4>
                <p>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section id="journey" className={`about-section about-journey ${animateSection.journey ? 'animate' : ''}`}>
        <div className="about-container">
          <h2 className="about-section-title">رحلتنا</h2>
          <div className="about-timeline">
            {milestones.map((milestone, index) => (
              <div className="about-timeline-item" key={index} style={{ animationDelay: `${index * 0.3}s` }}>
                <div className="about-timeline-point"></div>
                <div className="about-timeline-content">
                  <div className="about-timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-container">
          <h2>انضم إلينا في رحلتنا</h2>
          <p>
            سواء كنت تبحث عن خدمة منزلية موثوقة أو كنت محترفًا يبحث عن فرص جديدة، Buildinz هي المكان المناسب لك.
          </p>
          <div className="about-cta-buttons">
            <a href="/services" className="about-btn about-btn-primary">استكشف خدماتنا</a>
            <a href="/services2/categories" className="about-btn about-btn-secondary">تصفح الفئات</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 