import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faShieldAlt,
  faHandshake,
  faUsers,
  faRocket,
  faBuilding,
  faAward,
  faCheckCircle,
  faEnvelope,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import "./AboutPage.css";

const AboutPage = () => {
  const values = [
    {
      icon: faShieldAlt,
      title: "الجودة والموثوقية",
      description:
        "نلتزم بأعلى معايير الجودة في جميع خدماتنا، ونضمن لك نتائج متميزة تدوم طويلاً.",
    },
    {
      icon: faHandshake,
      title: "الشفافية والثقة",
      description:
        "نؤمن بالشفافية الكاملة في التعامل مع عملائنا، مع تقديم معلومات واضحة ودقيقة عن كل خطوة.",
    },
    {
      icon: faUsers,
      title: "خدمة العملاء المتميزة",
      description:
        "فريقنا متاح دائماً لمساعدتك، ونقدم دعمًا مستمرًا لضمان رضاك التام عن خدماتنا.",
    },
    {
      icon: faRocket,
      title: "الابتكار والتطوير",
      description:
        "نواكب أحدث التقنيات والاتجاهات في المجال لنقدم لك حلولاً مبتكرة وعصرية.",
    },
  ];

  const stats = [
    { number: "500+", label: "مشروع منجز" },
    { number: "1000+", label: "عميل راضٍ" },
    { number: "50+", label: "فني محترف" },
    { number: "5+", label: "سنوات خبرة" },
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="about-section-container">
          <div className="about-hero-content">
            <h1 className="about-hero-title">من نحن</h1>
            <p className="about-hero-subtitle">
              شركة BuildingZ - شريكك الموثوق في البناء والتشطيب
            </p>
          </div>
        </div>
      </section>

      {/* About Content Section */}
      <section className="about-content-section">
        <div className="about-section-container">
          <div className="about-text">
            <h2>نبذة عن BuildingZ</h2>
            <p>
              BuildingZ هي شركة رائدة متخصصة في تقديم حلول شاملة في مجال البناء
              والتشطيب والخدمات الهندسية في دولة الإمارات العربية المتحدة. نحن
              نقدم مجموعة واسعة من الخدمات التي تغطي جميع احتياجاتك من التصميم
              إلى التنفيذ والتشطيب النهائي.
            </p>
            <p>
              نسعى جاهدين لتقديم أعلى مستويات الجودة والشفافية لعملائنا، مع
              التركيز على توفير كل ما يحتاجه العميل في مكان واحد دون الحاجة
              للبحث بين مقدمي خدمات مختلفين. هدفنا هو تبسيط عملية البناء
              والتشطيب وجعلها تجربة سلسة ومريحة.
            </p>
            <div className="about-tagline">
              <FontAwesomeIcon icon={faLightbulb} />
              <span>بضغطة زر بيتك يتشطب</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats-section">
        <div className="about-section-container">
          <div className="about-stats-grid">
            {stats.map((stat, index) => (
              <div className="about-stat-card" key={index}>
                <div className="about-stat-number">{stat.number}</div>
                <div className="about-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values-section">
        <div className="about-section-container">
          <div className="about-section-header">
            <h2 className="about-section-title">قيمنا ومبادئنا</h2>
            <p className="about-section-subtitle">
              ما يميزنا ويجعلنا الخيار الأمثل لك
            </p>
          </div>

          <div className="about-values-grid">
            {values.map((value, index) => (
              <div className="about-value-card" key={index}>
                <div className="about-value-icon">
                  <FontAwesomeIcon icon={value.icon} />
                </div>
                <h3 className="about-value-title">{value.title}</h3>
                <p className="about-value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission-section">
        <div className="about-section-container">
          <div className="about-mission-content">
            <h2 className="about-mission-title">رؤيتنا ورسالتنا</h2>

            <div className="about-mission-item">
              <div className="about-mission-icon">
                <FontAwesomeIcon icon={faRocket} />
              </div>
              <div className="about-mission-text">
                <h3>رؤيتنا</h3>
                <p>
                  أن نكون الشركة الرائدة في مجال البناء والتشطيب في دولة
                  الإمارات، من خلال تقديم حلول مبتكرة وخدمات متميزة تلبي جميع
                  احتياجات عملائنا.
                </p>
              </div>
            </div>

            <div className="about-mission-item">
              <div className="about-mission-icon">
                <FontAwesomeIcon icon={faBuilding} />
              </div>
              <div className="about-mission-text">
                <h3>رسالتنا</h3>
                <p>
                  تقديم خدمات بناء وتشطيب عالية الجودة بأسعار عادلة، مع ضمان
                  الشفافية الكاملة والالتزام بالمواعيد. نهدف إلى جعل عملية
                  البناء والتشطيب تجربة سهلة ومريحة لعملائنا من خلال توفير جميع
                  الخدمات في مكان واحد.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="about-section-container">
          <h2 className="about-cta-title">ابدأ مشروعك معنا اليوم</h2>
          <p className="about-cta-text">
            نقدم لك جميع الخدمات التي تحتاجها في مكان واحد
          </p>

          <div className="about-cta-buttons">
            <Link
              to="/services2"
              className="about-cta-btn about-cta-btn-primary"
            >
              استكشف خدماتنا
            </Link>
            <Link
              to="/contact"
              className="about-cta-btn about-cta-btn-secondary"
            >
              تواصل معنا
            </Link>
          </div>

          <div className="about-contact-info">
            <a
              href="https://www.instagram.com/buildingzuae/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-contact-link"
            >
              <FontAwesomeIcon icon={faGlobe} />
              <span>@buildingzuae</span>
            </a>
            <a
              href="mailto:info@buildingzuae.com"
              className="about-contact-link"
            >
              <FontAwesomeIcon icon={faEnvelope} />
              <span>info@buildingzuae.com</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
