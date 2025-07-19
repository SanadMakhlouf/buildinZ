import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faSearch, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import './FAQPage.css';

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedItems, setExpandedItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [animateSection, setAnimateSection] = useState(false);

  // FAQ Categories
  const categories = [
    { id: 'general', name: 'أسئلة عامة' },
    { id: 'services', name: 'الخدمات' },
    { id: 'booking', name: 'الحجز والمواعيد' },
    { id: 'payment', name: 'الدفع والأسعار' },
    { id: 'providers', name: 'مزودي الخدمة' },
    { id: 'account', name: 'الحساب والتسجيل' }
  ];

  // FAQ Data
  const faqData = {
    general: [
      {
        question: 'ما هي Buildinz؟',
        answer: 'Buildinz هي منصة رقمية تربط بين العملاء ومقدمي الخدمات المنزلية والمهنية في دولة الإمارات العربية المتحدة. نحن نوفر خدمات متنوعة مثل الصيانة، الإصلاح، التنظيف، وغيرها من الخدمات المنزلية بطريقة سهلة وموثوقة.'
      },
      {
        question: 'في أي مناطق تتوفر خدمات Buildinz؟',
        answer: 'تتوفر خدمات Buildinz حالياً في جميع إمارات دولة الإمارات العربية المتحدة، بما في ذلك دبي، أبوظبي، الشارقة، عجمان، رأس الخيمة، الفجيرة، وأم القيوين.'
      },
      {
        question: 'ما هي ساعات عمل خدمة العملاء؟',
        answer: 'يمكنك التواصل مع فريق خدمة العملاء لدينا من الأحد إلى الخميس من الساعة 8 صباحاً حتى 8 مساءً، وفي أيام الجمعة والسبت من الساعة 9 صباحاً حتى 5 مساءً.'
      },
      {
        question: 'هل يمكنني إلغاء طلب الخدمة؟',
        answer: 'نعم، يمكنك إلغاء طلب الخدمة قبل 24 ساعة من الموعد المحدد بدون أي رسوم. أما الإلغاء قبل 12 ساعة من الموعد فيترتب عليه رسوم بنسبة 50% من قيمة الخدمة. وفي حالة الإلغاء قبل أقل من 6 ساعات، قد يتم تطبيق رسوم كاملة.'
      }
    ],
    services: [
      {
        question: 'ما هي أنواع الخدمات التي توفرها Buildinz؟',
        answer: 'توفر Buildinz مجموعة واسعة من الخدمات المنزلية والمهنية، بما في ذلك: خدمات التنظيف، الصيانة العامة، السباكة، الكهرباء، تكييف الهواء، النجارة، الطلاء، تنسيق الحدائق، مكافحة الحشرات، وغيرها الكثير.'
      },
      {
        question: 'هل يمكنني طلب خدمة طارئة؟',
        answer: 'نعم، نوفر خدمات طوارئ على مدار الساعة لبعض الخدمات الأساسية مثل السباكة والكهرباء وتكييف الهواء. قد تطبق رسوم إضافية للخدمات الطارئة خارج ساعات العمل العادية.'
      },
      {
        question: 'هل تقدمون ضمانات على الخدمات؟',
        answer: 'نعم، جميع الخدمات المقدمة عبر منصة Buildinz تأتي مع ضمان لمدة 30 يوماً. إذا واجهت أي مشكلة في الخدمة المقدمة، يرجى التواصل مع فريق خدمة العملاء وسنعمل على حلها في أقرب وقت ممكن.'
      },
      {
        question: 'كيف يتم تحديد جودة الخدمة؟',
        answer: 'نحن نعتمد على نظام تقييم صارم لمزودي الخدمة، ونراقب باستمرار تقييمات العملاء وملاحظاتهم. كما نقوم بفحص وتدريب جميع مزودي الخدمة قبل انضمامهم إلى منصتنا.'
      }
    ],
    booking: [
      {
        question: 'كيف يمكنني حجز خدمة؟',
        answer: 'يمكنك حجز خدمة بسهولة من خلال موقعنا الإلكتروني أو تطبيق الهاتف المحمول. ما عليك سوى اختيار نوع الخدمة، وتحديد موقعك، واختيار التاريخ والوقت المناسبين، ثم إكمال عملية الدفع.'
      },
      {
        question: 'هل يمكنني تحديد وقت محدد للخدمة؟',
        answer: 'نعم، يمكنك اختيار فترة زمنية محددة (صباحاً، ظهراً، مساءً) أو وقت محدد للخدمة حسب توفر مزودي الخدمة.'
      },
      {
        question: 'هل يمكنني تغيير موعد الخدمة؟',
        answer: 'نعم، يمكنك تغيير موعد الخدمة قبل 24 ساعة من الموعد المحدد بدون أي رسوم إضافية. للتغييرات التي تتم قبل أقل من 24 ساعة، قد تطبق رسوم إعادة جدولة.'
      },
      {
        question: 'ماذا يحدث إذا تأخر مزود الخدمة؟',
        answer: 'نحن نلتزم بالمواعيد المحددة. إذا كان هناك أي تأخير متوقع، سيتم إبلاغك مسبقاً. في حالة تأخر مزود الخدمة لأكثر من 30 دقيقة دون إشعار، يمكنك الحصول على خصم على الخدمة.'
      }
    ],
    payment: [
      {
        question: 'ما هي طرق الدفع المتاحة؟',
        answer: 'نقبل مجموعة متنوعة من طرق الدفع، بما في ذلك: بطاقات الائتمان والخصم (فيزا، ماستركارد، أمريكان إكسبرس)، الدفع عند الاستلام (لبعض الخدمات)، المحافظ الإلكترونية (Apple Pay، Google Pay)، والتحويل المصرفي (للخدمات الكبيرة).'
      },
      {
        question: 'هل الأسعار تشمل ضريبة القيمة المضافة؟',
        answer: 'نعم، جميع الأسعار المعروضة على منصتنا تشمل ضريبة القيمة المضافة (5%).'
      },
      {
        question: 'هل هناك رسوم إضافية غير معلنة؟',
        answer: 'لا، نحن نلتزم بالشفافية التامة في التسعير. جميع الرسوم والتكاليف يتم عرضها بوضوح قبل تأكيد الحجز. قد تكون هناك تكاليف إضافية فقط إذا تطلبت الخدمة مواد أو عمل إضافي لم يكن مشمولاً في الطلب الأصلي، وسيتم إبلاغك بها قبل المتابعة.'
      },
      {
        question: 'هل يمكنني الحصول على فاتورة ضريبية؟',
        answer: 'نعم، يتم إصدار فاتورة ضريبية لجميع الخدمات المقدمة عبر منصتنا. يمكنك تنزيلها من حسابك أو طلبها من خدمة العملاء.'
      }
    ],
    providers: [
      {
        question: 'كيف يتم اختيار مزودي الخدمة؟',
        answer: 'يخضع جميع مزودي الخدمة لعملية تدقيق صارمة تشمل: التحقق من الهوية والوثائق، التحقق من الخبرات والمؤهلات، فحص الخلفية الجنائية، واختبارات المهارات العملية. كما نقوم بتدريبهم على معايير الجودة والسلامة.'
      },
      {
        question: 'هل مزودو الخدمة مؤمن عليهم؟',
        answer: 'نعم، جميع مزودي الخدمة على منصتنا مؤمن عليهم. في حالة وقوع أي ضرر أثناء تقديم الخدمة، سيتم تغطيته من خلال بوليصة التأمين الخاصة بنا.'
      },
      {
        question: 'هل يمكنني طلب نفس مزود الخدمة مرة أخرى؟',
        answer: 'نعم، إذا كنت راضياً عن خدمة مزود معين، يمكنك طلبه مرة أخرى عند حجز الخدمة التالية، شريطة توفره في الوقت المطلوب.'
      },
      {
        question: 'كيف يمكنني الانضمام كمزود خدمة؟',
        answer: 'إذا كنت ترغب في الانضمام إلى شبكة مزودي الخدمة لدينا، يرجى زيارة صفحة "انضم إلينا" على موقعنا وتعبئة النموذج المطلوب. سيتواصل معك فريقنا لإكمال عملية التسجيل والتحقق.'
      }
    ],
    account: [
      {
        question: 'كيف يمكنني إنشاء حساب؟',
        answer: 'يمكنك إنشاء حساب بسهولة من خلال النقر على "تسجيل" في الموقع أو التطبيق. ستحتاج إلى تقديم بريدك الإلكتروني ورقم هاتفك وإنشاء كلمة مرور. يمكنك أيضاً التسجيل باستخدام حسابات Google أو Facebook.'
      },
      {
        question: 'هل يمكنني استخدام الخدمة بدون إنشاء حساب؟',
        answer: 'يمكنك تصفح الخدمات والأسعار بدون إنشاء حساب، ولكن لحجز خدمة، ستحتاج إلى إنشاء حساب أو تسجيل الدخول.'
      },
      {
        question: 'كيف يمكنني تغيير معلوماتي الشخصية؟',
        answer: 'يمكنك تغيير معلوماتك الشخصية بسهولة من خلال الذهاب إلى صفحة "الملف الشخصي" في حسابك. هناك يمكنك تحديث بياناتك الشخصية، وتغيير كلمة المرور، وإدارة طرق الدفع، وغيرها.'
      },
      {
        question: 'كيف يمكنني حذف حسابي؟',
        answer: 'إذا كنت ترغب في حذف حسابك، يرجى التواصل مع خدمة العملاء. سيقوم فريقنا بمساعدتك في عملية حذف الحساب بعد التأكد من عدم وجود طلبات نشطة أو معلقة.'
      }
    ]
  };

  // Initialize animation on component mount
  useEffect(() => {
    setTimeout(() => {
      setAnimateSection(true);
    }, 300);
  }, []);

  // Filter FAQs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFaqs([]);
      return;
    }

    const results = [];
    Object.keys(faqData).forEach(category => {
      const matchingFaqs = faqData[category].filter(
        faq => faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
               faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (matchingFaqs.length > 0) {
        results.push(...matchingFaqs.map(faq => ({ ...faq, category })));
      }
    });

    setFilteredFaqs(results);
  }, [searchTerm]);

  // Toggle FAQ item expansion
  const toggleItem = (categoryId, index) => {
    const key = `${categoryId}-${index}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Check if an item is expanded
  const isExpanded = (categoryId, index) => {
    const key = `${categoryId}-${index}`;
    return expandedItems[key] || false;
  };

  return (
    <div className="faq-page">
      {/* Hero Section */}
      <section className={`faq-hero ${animateSection ? 'animate' : ''}`}>
        <div className="faq-container">
          <h1>الأسئلة الشائعة</h1>
          <p className="faq-hero-subtitle">كل ما تحتاج معرفته عن خدمات Buildinz</p>
          
          {/* Search Bar */}
          <div className="faq-search">
            <FontAwesomeIcon icon={faSearch} className="faq-search-icon" />
            <input
              type="text"
              placeholder="ابحث عن سؤالك هنا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="faq-search-input"
            />
            {searchTerm && (
              <button 
                className="faq-search-clear" 
                onClick={() => setSearchTerm('')}
                aria-label="مسح البحث"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      <section className={`faq-content ${animateSection ? 'animate' : ''}`}>
        <div className="faq-container">
          {/* Search Results */}
          {searchTerm.trim() !== '' && (
            <div className="faq-search-results">
              <h2>نتائج البحث ({filteredFaqs.length})</h2>
              {filteredFaqs.length > 0 ? (
                <div className="faq-search-list">
                  {filteredFaqs.map((faq, index) => (
                    <div className="faq-item" key={`search-${index}`}>
                      <div 
                        className={`faq-question ${isExpanded('search', index) ? 'active' : ''}`}
                        onClick={() => toggleItem('search', index)}
                      >
                        <h3>
                          <FontAwesomeIcon icon={faQuestionCircle} className="faq-question-icon" />
                          {faq.question}
                        </h3>
                        <FontAwesomeIcon 
                          icon={isExpanded('search', index) ? faChevronUp : faChevronDown} 
                          className="faq-toggle-icon"
                        />
                      </div>
                      {isExpanded('search', index) && (
                        <div className="faq-answer">
                          <p>{faq.answer}</p>
                          <div className="faq-category-tag">
                            {categories.find(cat => cat.id === faq.category)?.name}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="faq-no-results">
                  <p>لم يتم العثور على نتائج مطابقة لـ "{searchTerm}"</p>
                  <p>حاول استخدام كلمات مختلفة أو تواصل مع خدمة العملاء للمساعدة</p>
                </div>
              )}
            </div>
          )}

          {/* FAQ Categories and Items */}
          {searchTerm.trim() === '' && (
            <>
              <div className="faq-categories">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`faq-category-btn ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              <div className="faq-list">
                {faqData[activeCategory].map((faq, index) => (
                  <div 
                    className={`faq-item ${isExpanded(activeCategory, index) ? 'expanded' : ''}`} 
                    key={`${activeCategory}-${index}`}
                  >
                    <div 
                      className={`faq-question ${isExpanded(activeCategory, index) ? 'active' : ''}`}
                      onClick={() => toggleItem(activeCategory, index)}
                    >
                      <h3>
                        <FontAwesomeIcon icon={faQuestionCircle} className="faq-question-icon" />
                        {faq.question}
                      </h3>
                      <FontAwesomeIcon 
                        icon={isExpanded(activeCategory, index) ? faChevronUp : faChevronDown} 
                        className="faq-toggle-icon"
                      />
                    </div>
                    {isExpanded(activeCategory, index) && (
                      <div className="faq-answer">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Contact Section */}
          <div className="faq-contact">
            <h2>لم تجد إجابة لسؤالك؟</h2>
            <p>فريق خدمة العملاء لدينا جاهز لمساعدتك</p>
            <div className="faq-contact-buttons">
              <a href="/contact" className="faq-btn faq-btn-primary">تواصل معنا</a>
              <a href="tel:+971800123456" className="faq-btn faq-btn-secondary">اتصل بنا: 800-123456</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage; 