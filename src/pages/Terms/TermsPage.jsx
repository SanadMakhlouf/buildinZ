import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import './TermsPage.css';

const TermsPage = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const termsSections = [
    {
      id: 'acceptance',
      title: 'قبول الشروط',
      content: 'باستخدامك لمنصة Buildinz، فإنك تقبل وتوافق على الالتزام بجميع الشروط والأحكام المذكورة هنا. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الموقع.'
    },
    {
      id: 'services',
      title: 'الخدمات',
      content: 'توفر Buildinz منصة ربط بين العملاء ومقدمي الخدمات. نحن لا نقدم الخدمات مباشرة، بل نسهل التواصل بين الأطراف. نحن غير مسؤولين عن جودة الخدمات المقدمة من قبل مقدمي الخدمات.'
    },
    {
      id: 'user-account',
      title: 'حساب المستخدم',
      content: 'أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور. يجب عليك إبلاغنا فوراً عن أي استخدام غير مصرح به لحسابك.'
    },
    {
      id: 'orders',
      title: 'الطلبات والدفع',
      content: 'جميع الطلبات تخضع للقبول من قبل مقدم الخدمة. الأسعار المعروضة قد تتغير دون إشعار. الدفع يتم وفقاً للطرق المتاحة على الموقع.'
    },
    {
      id: 'cancellation',
      title: 'الإلغاء والاسترداد',
      content: 'يمكن إلغاء الطلبات وفقاً لسياسة الإلغاء المحددة لكل خدمة. الاسترداد يتم وفقاً لسياسة الاسترداد الخاصة بنا.'
    },
    {
      id: 'liability',
      title: 'المسؤولية',
      content: 'Buildinz لا تتحمل أي مسؤولية عن الأضرار الناتجة عن استخدام الخدمات المقدمة من قبل مقدمي الخدمات. نحن نعمل كوسيط فقط.'
    },
    {
      id: 'intellectual-property',
      title: 'الملكية الفكرية',
      content: 'جميع المحتويات الموجودة على الموقع، بما في ذلك النصوص والصور والشعارات، محمية بحقوق الطبع والنشر وهي ملك لـ Buildinz أو مقدمي المحتوى.'
    },
    {
      id: 'modifications',
      title: 'تعديل الشروط',
      content: 'نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت. سيتم إشعار المستخدمين بأي تغييرات جوهرية.'
    },
    {
      id: 'contact',
      title: 'التواصل',
      content: 'لأي استفسارات حول الشروط والأحكام، يرجى التواصل معنا عبر البريد الإلكتروني: legal@buildinz.com'
    }
  ];

  return (
    <div className="terms-page">
      <div className="terms-hero">
        <div className="terms-hero-content">
          <h1>الشروط والأحكام</h1>
          <p>يرجى قراءة الشروط والأحكام بعناية قبل استخدام منصة Buildinz</p>
          <p className="terms-last-updated">آخر تحديث: ديسمبر 2024</p>
        </div>
      </div>

      <div className="terms-container">
        <div className="terms-content">
          <div className="terms-intro">
            <p>
              مرحباً بك في Buildinz. باستخدامك لهذا الموقع، فإنك توافق على الالتزام بالشروط والأحكام التالية. 
              يرجى قراءتها بعناية قبل استخدام خدماتنا.
            </p>
          </div>

          <div className="terms-sections">
            {termsSections.map((section, index) => (
              <div key={section.id} className="terms-section">
                <div 
                  className="terms-section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="section-number">{index + 1}</div>
                  <h2>{section.title}</h2>
                  <FontAwesomeIcon 
                    icon={expandedSections[section.id] ? faChevronUp : faChevronDown}
                    className="section-toggle"
                  />
                </div>
                
                {expandedSections[section.id] && (
                  <div className="terms-section-content">
                    <p>{section.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="terms-footer">
            <p>
              إذا كان لديك أي أسئلة حول هذه الشروط والأحكام، يرجى 
              <a href="/contact"> التواصل معنا</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
