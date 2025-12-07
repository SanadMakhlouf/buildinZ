import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, faUsers, faHandshake, faLightbulb, 
  faStar, faTrophy, faChartLine, faGlobe, faCheck,
  faPaintRoller, faWindowMaximize, faDoorOpen,
  faHome, faKitchenSet, faCog, faCamera, faShieldAlt,
  faClipboardCheck, faFileContract, faCalculator, faCheckCircle,
  faEnvelope, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
  const [animateSection, setAnimateSection] = useState({
    hero: false,
    about: false,
    services: false,
    consultant: false,
    thirdParty: false
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

  const services = [
    {
      icon: faPaintRoller,
      titleAr: 'الأصباغ',
      titleEn: 'Painting Services',
      descAr: 'خدمات دهانات داخلية وخارجية بجودة عالية، مع اختيار ألوان وخامات تناسب التصميم، وتنفيذ احترافي يضمن ثبات اللون ومظهر فاخر.',
      descEn: 'High-quality interior and exterior painting, with color and material selection to match the design, and professional execution ensuring long-lasting color and a luxurious finish.'
    },
    {
      icon: faLayerGroup,
      titleAr: 'الستائر',
      titleEn: 'Curtains',
      descAr: 'خدمة تصميم وتركيب جميع أنواع الستائر مع توفر كل المستلزمات، تركيب دقيق وانسيابي يتناسب مع ديكور المكان.',
      descEn: 'Design and installation of all types of curtains, with all necessary materials available, ensuring precise and smooth fitting that complements the decor.'
    },
    {
      icon: faDoorOpen,
      titleAr: 'الأبواب',
      titleEn: 'Doors',
      descAr: 'نقدّم مجموعة من الأبواب الداخلية والخارجية بتصاميم عصرية وفاخرة، تجمع بين المتانة والجمال، وتُنفّذ بدقة عالية لتضفي لمسة من الأناقة والخصوصية على كل مساحة في الفيلا.',
      descEn: 'We offer modern and luxurious interior and exterior doors, combining durability and beauty, with precise installation that adds elegance and privacy to every space.'
    },
    {
      icon: faWindowMaximize,
      titleAr: 'النوافذ',
      titleEn: 'Windows',
      descAr: 'نوفر نوافذ عالية الجودة بتصاميم أنيقة، مع عزل ممتاز للصوت والحرارة، وخيارات متعددة من المواد والتشطيبات لإضاءة طبيعية وإطلالة راقية.',
      descEn: 'We provide high-quality windows with elegant designs, excellent sound and heat insulation, and various materials and finishes, offering natural light and a premium view.'
    },
    {
      icon: faHome,
      titleAr: 'البراغولا والمظلات',
      titleEn: 'Pergolas & Shades',
      descAr: 'تصميم وتنفيذ براغولا ومظلات فاخرة تجمع بين الجمال والمتانة، لتوفير جلسات خارجية أنيقة ومريحة طوال العام.',
      descEn: 'Design and installation of elegant, durable pergolas and shades for stylish and comfortable outdoor spaces all year round.'
    },
    {
      icon: faKitchenSet,
      titleAr: 'المطابخ',
      titleEn: 'Kitchens',
      descAr: 'نصمم مطابخ عصرية تجمع بين الأناقة والوظيفة، بخامات فاخرة وتشطيبات دقيقة تعكس ذوقك وتمنحك تجربة مريحة كل يوم.',
      descEn: 'We design modern kitchens that combine elegance and functionality, using premium materials and fine finishes to reflect your style and provide a comfortable daily experience.'
    },
    {
      icon: faCog,
      titleAr: 'المنزل الذكي',
      titleEn: 'Smart Home',
      descAr: 'نوفّر أنظمة منزل ذكي للتحكم في الإضاءة، التكييف، الستائر، والأمان بسهولة عبر الهاتف أو الأوامر الصوتية، لتعيش راحة وأمان بتقنيات عصرية.',
      descEn: 'We provide smart home systems to control lighting, AC, curtains, and security through your phone or voice commands — offering modern comfort and safety.'
    },
    {
      icon: faCamera,
      titleAr: 'كاميرات وإنترنت',
      titleEn: 'Cameras & Internet',
      descAr: 'نقدّم أنظمة مراقبة وشبكات إنترنت متكاملة بتقنيات حديثة لأمان عالي واتصال مستقر في كل أنحاء الفيلا، مع تركيب احترافي وتصميم يناسب احتياجاتك اليومية.',
      descEn: 'We provide integrated surveillance and internet systems with modern technology, ensuring high security and stable connectivity throughout the villa, with professional installation and design tailored to your daily needs.'
    }
  ];

  const thirdPartyServices = [
    {
      icon: faClipboardCheck,
      titleAr: 'التقييم والمراجعة كطرف ثالث',
      titleEn: 'Evaluation and Review as a Third Party',
      descAr: 'نوفر خدمات تقييم ومراجعة محايدة كمستشار مستقل، لضمان التزام المشاريع بالمواصفات والمعايير المعتمدة، مع التحقق من جودة التنفيذ في جميع مراحله.',
      descEn: 'We provide neutral evaluation and review services as an independent consultant to ensure that projects comply with approved specifications and standards, while verifying the quality of execution at every stage.',
      features: [
        'مراجعة دقيقة ومحايدة للمشاريع',
        'ضمان الالتزام بالمواصفات والمعايير',
        'التأكد من جودة التنفيذ في كل التفاصيل'
      ]
    },
    {
      icon: faFileContract,
      titleAr: 'مراجعة العقود والمخططات',
      titleEn: 'Contract and Drawing Review',
      descAr: 'نساعد عملاءنا في فحص ومراجعة العقود الهندسية والمخططات التنفيذية بدقة عالية، لضمان الشفافية الكاملة وتفادي أي ثغرات تعاقدية قد تؤثر على سير المشروع أو جودة تنفيذه.',
      descEn: 'We assist our clients in thoroughly examining and reviewing engineering contracts and execution drawings to ensure full transparency and avoid any contractual gaps that could affect the project\'s progress or execution quality.',
      features: [
        'تدقيق شامل للعقود والمستندات الهندسية',
        'ضمان وضوح البنود وحماية حقوق العميل',
        'تقليل المخاطر المحتملة أثناء التنفيذ'
      ]
    },
    {
      icon: faCalculator,
      titleAr: 'تحليل وتدقيق جداول الكميات',
      titleEn: 'Bill of Quantities Analysis and Audit',
      descAr: 'نراجع جداول الكميات بدقة للتأكد من صحة الحسابات ومطابقتها للمخططات، لضبط التكاليف وتقليل الهدر.',
      descEn: 'We accurately review BOQs to ensure correct calculations and alignment with drawings, helping control costs and reduce waste.'
    },
    {
      icon: faCheckCircle,
      titleAr: 'إعداد السناك ليست',
      titleEn: 'Snag List Preparation',
      descAr: 'نقوم بإعداد تقارير مفصلة بالملاحظات والعيوب النهائية قبل استلام المشروع، بناءً على زيارة ميدانية من المهندسين المختصين لضمان تسليم الأعمال خالية من العيوب.',
      descEn: 'We prepare detailed reports of final observations and defects before project handover, based on on-site visits by specialized engineers, ensuring the work is delivered defect-free.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className={`about-hero ${animateSection.hero ? 'animate' : ''}`}>
        <div className="about-hero-overlay"></div>
        <div className="about-container">
          <h1 className="about-hero-title-ar">مـــــــــــــــن نــــــــــــــــــحن</h1>
        </div>
      </section>

      {/* About Us Content Section */}
      <section id="about" className={`about-section about-content ${animateSection.about ? 'animate' : ''}`}>
        <div className="about-container">
          <div className="about-content-wrapper">
            <div className="about-text-ar">
              <h2>BuildingZ شركة رائدة تقدم حلولاً مبتكرة في مجال البناء والخدمات الهندسية</h2>
              <p>
                نحن نسعى لتقديم أعلى مستويات الجودة والشفافية لعملائنا، مع التركيز على تقديم كل ما يحتاجه العميل في مكان واحد دون الحاجة للبحث بين مقدمي خدمات مختلفين.
              </p>
              <p className="about-tagline">بضغطة زر بيتك يتشطب</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section id="services" className={`about-section about-services ${animateSection.services ? 'animate' : ''}`}>
        <div className="about-container">
          <div className="section-header">
            <h2 className="section-title-ar">خـــــــــدمـــــــــاتـــــــنــــــا</h2>
          </div>
          
          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-card" key={index}>
                <div className="service-icon">
                  <FontAwesomeIcon icon={service.icon} />
                </div>
                <h3 className="service-title-ar">{service.titleAr}</h3>
                <p className="service-desc-ar">{service.descAr}</p>
              </div>
            ))}
          </div>

          <div className="services-cta">
            <p className="cta-text-ar">يمكنك الحصول على كل هذه الخدمات بسهولة من خلال موقع</p>
            <a href="https://buildingzuae.com" className="cta-link">BUILDINGZUAE.COM</a>
          </div>
        </div>
      </section>

      {/* Third Party Consultant Section */}
      <section id="consultant" className={`about-section about-consultant ${animateSection.consultant ? 'animate' : ''}`}>
        <div className="about-container">
          <div className="section-header">
            <h2 className="section-title-ar">الاستشاري الطرف الثالث</h2>
          </div>

          <div className="consultant-services-grid">
            {thirdPartyServices.map((service, index) => (
              <div className="consultant-card" key={index}>
                <div className="consultant-icon">
                  <FontAwesomeIcon icon={service.icon} />
                </div>
                <h3 className="consultant-title-ar">{service.titleAr}</h3>
                <p className="consultant-desc-ar">{service.descAr}</p>
                {service.features && (
                  <div className="consultant-features">
                    <h4>مميزات الخدمة:</h4>
                    <ul>
                      {service.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section id="additional" className={`about-section about-additional ${animateSection.thirdParty ? 'animate' : ''}`}>
        <div className="about-container">
          <div className="additional-services">
            <div className="additional-service-item">
              <h3 className="service-title-ar">تغيير الاستخدام من سكني إلى تجاري</h3>
              <p className="service-desc-ar">نُعد الدراسات الفنية والمعمارية اللازمة لتغيير نشاط العقار من سكني إلى تجاري، مع تقديم الدعم الفني في الإجراءات النظامية.</p>
            </div>
            <div className="additional-service-item">
              <h3 className="service-title-ar">تقنين المباني المخالفة</h3>
              <p className="service-desc-ar">نساعد في دراسة وتقديم الحلول لتقنين أوضاع المباني المخالفة بالتنسيق مع الجهات المختصة، وفق الأنظمة واللوائح المعمول بها. في أبو ظبي والعين</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-container">
          <h2>كل هذه الخدمات في تطبيق واحد</h2>
          <div className="app-badges">
            <div className="app-badge">
              <h3>BUILDINGZ</h3>
            </div>
          </div>
          <p className="cta-text-ar">نقدّم دعمًا ضمان رضاك واستمرارية جودة كل الخدمات المقدمة.</p>
          <div className="contact-info">
            <a href="https://instagram.com/buildingzuae" className="contact-link">
              <FontAwesomeIcon icon={faGlobe} />
              @BUILDINGZUAE
            </a>
            <a href="mailto:info@buildingzuae.com" className="contact-link">
              <FontAwesomeIcon icon={faEnvelope} />
              INFO@BUILDINGZUAE.COM
            </a>
          </div>
          <div className="about-cta-buttons">
            <Link to="/services2/categories" className="about-btn about-btn-primary">استكشف خدماتنا</Link>
            <Link to="/services" className="about-btn about-btn-secondary">تصفح الفئات</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
