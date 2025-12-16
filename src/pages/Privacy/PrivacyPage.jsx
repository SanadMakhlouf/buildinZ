import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faDatabase, 
  faCookie, 
  faLock, 
  faEye, 
  faCheckCircle,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import './PrivacyPage.css';

const PrivacyPage = () => {
  const [activeSection, setActiveSection] = useState('privacy');
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const privacyData = {
    privacy: {
      title: 'سياسة الخصوصية',
      icon: faShieldAlt,
      lastUpdated: 'ديسمبر 2024',
      sections: [
        {
          id: 'introduction',
          title: 'مقدمة',
          content: `في BuildingZ، نأخذ خصوصيتك على محمل الجد. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وكشف وحماية معلوماتك عند استخدام منصتنا. نحن ملتزمون بحماية بياناتك الشخصية وضمان الشفافية في ممارساتنا المتعلقة بالبيانات.`
        },
        {
          id: 'information-collection',
          title: 'المعلومات التي نجمعها',
          content: `نجمع المعلومات التي تقدمها لنا مباشرة، مثل عند إنشاء حساب أو إجراء حجز أو الاتصال بنا. يتضمن ذلك:`,
          items: [
            'المعلومات الشخصية (الاسم، البريد الإلكتروني، رقم الهاتف)',
            'بيانات الموقع (العنوان، إحداثيات GPS)',
            'معلومات الدفع (يتم معالجتها بأمان)',
            'تفضيلات الخدمة والسجل',
            'سجلات الاتصال',
            'معلومات الجهاز والاستخدام'
          ]
        },
        {
          id: 'how-we-use',
          title: 'كيف نستخدم معلوماتك',
          content: `نستخدم معلوماتك لتقديم وتحسين خدماتنا:`,
          items: [
            'معالجة الحجوزات والمعاملات',
            'تقديم دعم العملاء',
            'إرسال الإشعارات المهمة',
            'تحسين منصتنا وخدماتنا',
            'ضمان الأمان ومنع الاحتيال',
            'الامتثال للالتزامات القانونية'
          ]
        },
        {
          id: 'data-sharing',
          title: 'مشاركة المعلومات',
          content: `لا نبيع معلوماتك الشخصية. قد نشارك بياناتك فقط في هذه الحالات:`,
          items: [
            'مع مقدمي الخدمات لإكمال حجوزاتك',
            'مع معالجات الدفع للمعاملات',
            'مع شركائنا الموردين الموثوق بهم',
            'عندما يتطلب القانون أو الإجراءات القانونية',
            'لحماية حقوقنا وسلامتنا',
            'في حالة نقل الأعمال'
          ]
        },
        {
          id: 'data-security',
          title: 'أمان البيانات',
          content: `نطبق تدابير أمنية شاملة لحماية معلوماتك:`,
          items: [
            'التشفير من طرف إلى طرف للبيانات الحساسة',
            'بنية الخوادم الآمنة',
            'عمليات التدقيق الأمني والتحديثات المنتظمة',
            'ضوابط الوصول والمصادقة',
            'أنظمة النسخ الاحتياطي والاستعادة',
            'تدريب الموظفين على حماية البيانات'
          ]
        },
        {
          id: 'your-rights',
          title: 'حقوقك',
          content: `لديك عدة حقوق فيما يتعلق ببياناتك الشخصية:`,
          items: [
            'الوصول إلى معلوماتك الشخصية',
            'تصحيح البيانات غير الدقيقة',
            'حذف حسابك وبياناتك',
            'تصدير بياناتك',
            'تقييد المعالجة',
            'الاعتراض على استخدامات معينة',
            'سحب الموافقة'
          ]
        }
      ]
    },
    userData: {
      title: 'إدارة بيانات المستخدم',
      icon: faDatabase,
      lastUpdated: 'ديسمبر 2024',
      sections: [
        {
          id: 'data-types',
          title: 'أنواع البيانات التي نخزنها',
          content: `نخزن فئات مختلفة من بيانات المستخدم لتقديم خدماتنا:`,
          items: [
            'معلومات الحساب: اسم المستخدم، البريد الإلكتروني، تفاصيل الملف الشخصي',
            'بيانات الخدمة: الحجوزات، التفضيلات، سجل الخدمات',
            'بيانات الموقع: العناوين، مواقع الخدمة، إحداثيات GPS',
            'بيانات الاتصال: الرسائل، تذاكر الدعم، الملاحظات',
            'بيانات الاستخدام: تفاعلات التطبيق، استخدام الميزات، مقاييس الأداء',
            'بيانات الجهاز: نوع الجهاز، نظام التشغيل، إصدار التطبيق'
          ]
        },
        {
          id: 'data-retention',
          title: 'الاحتفاظ بالبيانات',
          content: `نحتفظ ببياناتك لفترات محددة بناءً على نوع المعلومات:`,
          items: [
            'بيانات الحساب: حتى حذف الحساب أو 3 سنوات من عدم النشاط',
            'سجلات المعاملات: 7 سنوات للامتثال القانوني والضريبي',
            'سجلات الاتصال: سنتان لضمان الجودة',
            'تحليلات الاستخدام: 18 شهرًا في شكل مجهول',
            'بيانات الموقع: حتى تعطيل خدمات الموقع',
            'بيانات التسويق: حتى إلغاء الاشتراك أو الاعتراض'
          ]
        },
        {
          id: 'data-processing',
          title: 'أنشطة معالجة البيانات',
          content: `نعالج بياناتك لأغراض مشروعة مختلفة:`,
          items: [
            'تقديم الخدمة: ربطك بمقدمي الخدمات',
            'ضمان الجودة: مراقبة وتحسين جودة الخدمة',
            'التحليلات: فهم أنماط الاستخدام والتفضيلات',
            'التخصيص: تخصيص تجربة التطبيق',
            'الأمان: اكتشاف ومنع الأنشطة الاحتيالية',
            'الامتثال: تلبية المتطلبات القانونية والتنظيمية'
          ]
        },
        {
          id: 'data-portability',
          title: 'قابلية نقل البيانات',
          content: `يمكنك طلب نسخة من بياناتك بتنسيق قابل للنقل:`,
          items: [
            'معلومات الملف الشخصي والحساب الكاملة',
            'سجل الخدمة وسجلات الحجز',
            'العناوين المحفوظة والتفضيلات',
            'سجل الاتصال',
            'إحصائيات الاستخدام (حيثما ينطبق)',
            'البيانات بتنسيقات شائعة (JSON، CSV، PDF)'
          ]
        }
      ]
    },
    cookies: {
      title: 'سياسة ملفات تعريف الارتباط',
      icon: faCookie,
      lastUpdated: 'ديسمبر 2024',
      sections: [
        {
          id: 'what-are-cookies',
          title: 'ما هي ملفات تعريف الارتباط',
          content: `ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة منصتنا. تساعدنا في توفير تجربة مستخدم أفضل وتحليل كيفية استخدام خدماتنا.`
        },
        {
          id: 'types-of-cookies',
          title: 'أنواع ملفات تعريف الارتباط التي نستخدمها',
          content: `نستخدم أنواعًا مختلفة من ملفات تعريف الارتباط لأغراض مختلفة:`,
          items: [
            'ملفات تعريف الارتباط الأساسية: مطلوبة للوظائف الأساسية للمنصة',
            'ملفات تعريف الارتباط للأداء: تساعدنا في تحليل وتحسين الأداء',
            'ملفات تعريف الارتباط الوظيفية: تتذكر تفضيلاتك وإعداداتك',
            'ملفات تعريف الارتباط التحليلية: فهم كيفية استخدامك لمنصتنا',
            'ملفات تعريف الارتباط التسويقية: تقديم إعلانات ذات صلة',
            'ملفات تعريف الارتباط لوسائل التواصل الاجتماعي: تمكين ميزات المشاركة الاجتماعية'
          ]
        },
        {
          id: 'cookie-management',
          title: 'إدارة ملفات تعريف الارتباط',
          content: `لديك سيطرة على إعدادات ملفات تعريف الارتباط:`,
          items: [
            'إعدادات المتصفح: تعطيل ملفات تعريف الارتباط في متصفحك',
            'تفضيلات ملفات تعريف الارتباط: إدارة التفضيلات في تطبيقنا',
            'ملفات تعريف الارتباط لجهات خارجية: التحكم في ملفات تعريف الارتباط لخدمات خارجية',
            'أدوات إلغاء الاشتراك: استخدام آليات إلغاء الاشتراك في الصناعة',
            'مسح ملفات تعريف الارتباط: حذف ملفات تعريف الارتباط الموجودة في أي وقت',
            'التحكم الانتقائي: اختيار الأنواع المسموح بها'
          ]
        },
        {
          id: 'third-party-cookies',
          title: 'ملفات تعريف الارتباط لجهات خارجية',
          content: `يتم تعيين بعض ملفات تعريف الارتباط بواسطة خدمات خارجية نستخدمها:`,
          items: [
            'Google Analytics: إحصائيات استخدام الموقع',
            'معالجات الدفع: معالجة المعاملات الآمنة',
            'وسائل التواصل الاجتماعي: وظائف المشاركة وتسجيل الدخول',
            'دعم العملاء: أدوات الدردشة والملاحظات',
            'تسليم المحتوى: أوقات تحميل أسرع',
            'خدمات الأمان: اكتشاف الاحتيال والوقاية'
          ]
        }
      ]
    }
  };

  const currentData = privacyData[activeSection];

  return (
    <div className="privacy-page">
      {/* Header */}
      <div className="privacy-hero">
        <div className="privacy-container">
          <div className="privacy-hero-content">
            <h1>الخصوصية وحماية البيانات</h1>
            <p>نحن ملتزمون بحماية خصوصيتك وبياناتك</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="privacy-nav">
        <div className="privacy-container">
          <div className="nav-tabs">
            {Object.entries(privacyData).map(([key, data]) => (
              <button
                key={key}
                className={`nav-tab ${activeSection === key ? 'active' : ''}`}
                onClick={() => setActiveSection(key)}
              >
                <FontAwesomeIcon icon={data.icon} />
                <span>{data.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="privacy-content">
        <div className="privacy-container">
          <div className="privacy-header-info">
            <div className="header-icon">
              <FontAwesomeIcon icon={currentData.icon} />
            </div>
            <div>
              <h2>{currentData.title}</h2>
              <p className="last-updated">آخر تحديث: {currentData.lastUpdated}</p>
            </div>
          </div>

          <div className="privacy-sections">
            {currentData.sections.map((section) => (
              <div key={section.id} className="privacy-section-card">
                <div className="section-header">
                  <h3>{section.title}</h3>
                  {section.items && (
                    <button
                      className="expand-toggle"
                      onClick={() => toggleExpanded(section.id)}
                      aria-label={expandedItems[section.id] ? 'إغلاق' : 'فتح'}
                    >
                      <FontAwesomeIcon 
                        icon={expandedItems[section.id] ? faChevronUp : faChevronDown} 
                      />
                    </button>
                  )}
                </div>
                
                <div className="section-content">
                  <p>{section.content}</p>
                  
                  {section.items && (
                    <div className={`items-list ${expandedItems[section.id] ? 'expanded' : ''}`}>
                      <ul>
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="privacy-contact">
            <div className="contact-card">
              <div className="contact-header">
                <FontAwesomeIcon icon={faLock} />
                <h3>أسئلة أو استفسارات؟</h3>
              </div>
              <p>
                إذا كان لديك أي أسئلة حول هذه السياسة أو ممارساتنا المتعلقة بالبيانات، 
                لا تتردد في الاتصال بنا.
              </p>
              <div className="contact-methods">
                <div className="contact-method">
                  <strong>البريد الإلكتروني:</strong> privacy@buildingzuae.com
                </div>
                <div className="contact-method">
                  <strong>الهاتف:</strong> +971 XX XXX XXXX
                </div>
                <div className="contact-method">
                  <strong>العنوان:</strong> أبو ظبي، الإمارات العربية المتحدة
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;