import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, faQuestionCircle, faBook, faVideo,
  faEnvelope, faPhone, faChevronDown, faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import './HelpPage.css';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'بدء الاستخدام',
      icon: faBook,
      articles: [
        {
          id: 1,
          title: 'كيفية إنشاء حساب جديد',
          content: 'لإنشاء حساب جديد، اضغط على زر "تسجيل الدخول" في أعلى الصفحة، ثم اختر "إنشاء حساب جديد" واملأ المعلومات المطلوبة.'
        },
        {
          id: 2,
          title: 'كيفية البحث عن خدمة',
          content: 'يمكنك البحث عن الخدمات باستخدام شريط البحث في الصفحة الرئيسية أو تصفح الفئات المختلفة المتاحة.'
        },
        {
          id: 3,
          title: 'كيفية طلب خدمة',
          content: 'بعد اختيار الخدمة المطلوبة، اضغط على "اطلب الآن" واملأ تفاصيل الطلب ثم أكد الطلب.'
        }
      ]
    },
    {
      id: 'orders',
      title: 'الطلبات',
      icon: faQuestionCircle,
      articles: [
        {
          id: 4,
          title: 'كيفية تتبع طلبي',
          content: 'يمكنك تتبع حالة طلبك من خلال صفحة "طلباتي" في الملف الشخصي.'
        },
        {
          id: 5,
          title: 'كيفية إلغاء طلب',
          content: 'يمكنك إلغاء الطلب من صفحة تفاصيل الطلب قبل أن يبدأ التنفيذ.'
        },
        {
          id: 6,
          title: 'كيفية تعديل طلب',
          content: 'يمكنك تعديل تفاصيل الطلب من صفحة الطلب قبل أن يتم قبوله من قبل مقدم الخدمة.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'المدفوعات',
      icon: faQuestionCircle,
      articles: [
        {
          id: 7,
          title: 'طرق الدفع المتاحة',
          content: 'نقبل الدفع نقداً عند الاستلام، وبطاقات الائتمان والخصم، والتحويل البنكي.'
        },
        {
          id: 8,
          title: 'كيفية استرداد المبلغ',
          content: 'في حالة إلغاء الطلب أو وجود مشكلة، سيتم استرداد المبلغ خلال 5-7 أيام عمل.'
        }
      ]
    },
    {
      id: 'account',
      title: 'الحساب',
      icon: faQuestionCircle,
      articles: [
        {
          id: 9,
          title: 'كيفية تحديث معلوماتي',
          content: 'يمكنك تحديث معلوماتك الشخصية من صفحة الملف الشخصي.'
        },
        {
          id: 10,
          title: 'كيفية تغيير كلمة المرور',
          content: 'اذهب إلى إعدادات الحساب واختر "تغيير كلمة المرور" ثم اتبع التعليمات.'
        }
      ]
    }
  ];

  const filteredArticles = helpCategories.flatMap(category => 
    category.articles.filter(article => 
      article.title.includes(searchQuery) || 
      article.content.includes(searchQuery)
    )
  );

  return (
    <div className="help-page">
      <div className="help-hero">
        <div className="help-hero-content">
          <h1>مركز المساعدة</h1>
          
          
        </div>
      </div>

      <div className="help-container">
        <div className="help-content">
          {searchQuery ? (
            <div className="search-results">
              <h2>نتائج البحث</h2>
              {filteredArticles.length > 0 ? (
                <div className="articles-list">
                  {filteredArticles.map(article => (
                    <div key={article.id} className="article-card">
                      <h3>{article.title}</h3>
                      <p>{article.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>لم يتم العثور على نتائج</p>
                </div>
              )}
            </div>
          ) : (
            <div className="help-categories">
              {helpCategories.map(category => (
                <div key={category.id} className="help-category">
                  <div 
                    className="category-header"
                    onClick={() => toggleSection(category.id)}
                  >
                    <div className="category-title">
                      <FontAwesomeIcon icon={category.icon} />
                      <h2>{category.title}</h2>
                    </div>
                    <FontAwesomeIcon 
                      icon={expandedSections[category.id] ? faChevronUp : faChevronDown} 
                    />
                  </div>
                  
                  {expandedSections[category.id] && (
                    <div className="category-articles">
                      {category.articles.map(article => (
                        <div key={article.id} className="article-item">
                          <h3>{article.title}</h3>
                          <p>{article.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="help-contact">
            <h2>لا تجد ما تبحث عنه؟</h2>
            <p>تواصل معنا وسنكون سعداء بمساعدتك</p>
            <div className="help-contact-buttons">
              <a href="/contact" className="help-contact-btn">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>اتصل بنا</span>
              </a>
              <a href="tel:+971XXXXXXXXX" className="help-contact-btn">
                <FontAwesomeIcon icon={faPhone} />
                <span>اتصل الآن</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
