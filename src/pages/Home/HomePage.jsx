import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1>BuildingZ</h1>
          <h2>حاسبة تكاليف البناء والتشطيب</h2>
          <p>الحل الأمثل لحساب تكاليف مشاريع البناء والتشطيب بدقة وسهولة</p>
          <div className="hero-buttons">
            <Link to="/services" className="primary-btn">ابدأ الحساب الآن</Link>
            <Link to="/about" className="secondary-btn">تعرف علينا</Link>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>مميزات الخدمة</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🧮</div>
            <h3>حساب دقيق</h3>
            <p>حساب تكاليف البناء والتشطيب بدقة عالية وفق أحدث الأسعار</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>تقارير مفصلة</h3>
            <p>الحصول على تقارير مفصلة لتكاليف المواد والعمالة</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛠️</div>
            <h3>خدمات متنوعة</h3>
            <p>أكثر من 50 خدمة في مجالات البناء والتشطيب المختلفة</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>سهولة الاستخدام</h3>
            <p>واجهة سهلة الاستخدام تناسب جميع المستخدمين</p>
          </div>
        </div>
      </div>

      <div className="services-preview-section">
        <h2>خدماتنا</h2>
        <div className="services-preview-grid">
          <div className="service-preview-card">
            <div className="service-icon">🎨</div>
            <h3>خدمات الدهان</h3>
            <p>حساب تكاليف دهان الجدران الداخلية والخارجية</p>
            <Link to="/services?category=1" className="service-link">استكشاف الخدمة</Link>
          </div>
          <div className="service-preview-card">
            <div className="service-icon">🏗️</div>
            <h3>خدمات الأرضيات</h3>
            <p>حساب تكاليف تركيب السيراميك والبلاط والباركيه</p>
            <Link to="/services?category=2" className="service-link">استكشاف الخدمة</Link>
          </div>
          <div className="service-preview-card">
            <div className="service-icon">⚡</div>
            <h3>خدمات الكهرباء</h3>
            <p>حساب تكاليف التمديدات والتركيبات الكهربائية</p>
            <Link to="/services?category=3" className="service-link">استكشاف الخدمة</Link>
          </div>
        </div>
        <div className="view-all-services">
          <Link to="/services" className="view-all-link">عرض جميع الخدمات</Link>
        </div>
      </div>

      <div className="cta-section">
        <h2>ابدأ الآن في حساب تكاليف مشروعك</h2>
        <p>احصل على تقدير دقيق لتكاليف مشروعك في دقائق معدودة</p>
        <Link to="/services" className="cta-button">ابدأ الحساب الآن</Link>
      </div>
    </div>
  );
};

export default HomePage; 