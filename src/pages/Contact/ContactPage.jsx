import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, faEnvelope, faMapMarkerAlt, faClock,
  faFacebookF, faTwitter, faInstagram, faLinkedinIn, faWhatsapp
} from '@fortawesome/free-solid-svg-icons';
import { 
  faFacebookF as faFacebookFBrand, 
  faTwitter as faTwitterBrand, 
  faInstagram as faInstagramBrand, 
  faLinkedinIn as faLinkedinInBrand, 
  faWhatsapp as faWhatsappBrand 
} from '@fortawesome/free-brands-svg-icons';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission
    alert('شكراً لتواصلك معنا! سنرد عليك قريباً.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1>تواصل معنا</h1>
          <p>نحن هنا لمساعدتك. لا تتردد في التواصل معنا</p>
        </div>
      </div>

      <div className="contact-container">
        <div className="contact-content">
          {/* Contact Info Cards */}
          <div className="contact-info-grid">
            <div className="contact-info-card">
              <div className="contact-info-icon">
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <h3>الهاتف</h3>
              <p>+971 XX XXX XXXX</p>
              <p>+971 XX XXX XXXX</p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <h3>البريد الإلكتروني</h3>
              <p>info@buildinz.com</p>
              <p>support@buildinz.com</p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h3>العنوان</h3>
              <p>دبي، الإمارات العربية المتحدة</p>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3>ساعات العمل</h3>
              <p>السبت - الخميس: 9:00 ص - 6:00 م</p>
              <p>الجمعة: مغلق</p>
            </div>
          </div>

          {/* Contact Form and Map */}
          <div className="contact-form-section">
            <div className="contact-form-wrapper">
              <h2>أرسل لنا رسالة</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>الاسم الكامل</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>
                  <div className="form-group">
                    <label>البريد الإلكتروني</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>رقم الهاتف</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+971 XX XXX XXXX"
                    />
                  </div>
                  <div className="form-group">
                    <label>الموضوع</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="موضوع الرسالة"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>الرسالة</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="اكتب رسالتك هنا..."
                  />
                </div>

                <button type="submit" className="contact-submit-btn">
                  إرسال الرسالة
                </button>
              </form>
            </div>

            <div className="contact-map-wrapper">
              <h2>موقعنا</h2>
              <div className="contact-map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.178509644294!2d55.2708!3d25.2048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDEyJzE3LjMiTiA1NcKwMTYnMTQuOSJF!5e0!3m2!1sen!2sae!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Buildinz Location"
                />
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="contact-social">
            <h3>تابعنا على</h3>
            <div className="social-links">
              <a href="#" aria-label="Facebook">
                <FontAwesomeIcon icon={faFacebookFBrand} />
              </a>
              <a href="#" aria-label="Twitter">
                <FontAwesomeIcon icon={faTwitterBrand} />
              </a>
              <a href="#" aria-label="Instagram">
                <FontAwesomeIcon icon={faInstagramBrand} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FontAwesomeIcon icon={faLinkedinInBrand} />
              </a>
              <a href="#" aria-label="WhatsApp">
                <FontAwesomeIcon icon={faWhatsappBrand} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
