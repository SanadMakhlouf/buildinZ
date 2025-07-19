import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faUserShield, 
  faCookie, 
  faDatabase, 
  faLock, 
  faEye, 
  faTrashAlt, 
  faEdit, 
  faDownload, 
  faShare,
  faChevronDown,
  faChevronUp,
  faExclamationTriangle,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './PrivacyPage.css';

const PrivacyPage = () => {
  const [activeSection, setActiveSection] = useState('privacy');
  const [expandedItems, setExpandedItems] = useState({});
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: true
          }));
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const privacyData = {
    privacy: {
      title: 'Privacy Policy',
      icon: faShieldAlt,
      lastUpdated: 'December 2024',
      sections: [
        {
          id: 'introduction',
          title: 'Introduction',
          content: `At BuildinZ, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. We are committed to protecting your personal data and ensuring transparency in our data practices.`
        },
        {
          id: 'information-collection',
          title: 'Information We Collect',
          content: `We collect information you provide directly to us, such as when you create an account, make a booking, or contact us. This includes:`,
          items: [
            'Personal identifiers (name, email, phone number)',
            'Location data (address, GPS coordinates)',
            'Payment information (processed securely)',
            'Service preferences and history',
            'Communication records',
            'Device and usage information'
          ]
        },
        {
          id: 'how-we-use',
          title: 'How We Use Your Information',
          content: `We use your information to provide and improve our services:`,
          items: [
            'Process bookings and transactions',
            'Provide customer support',
            'Send important notifications',
            'Improve our platform and services',
            'Ensure security and prevent fraud',
            'Comply with legal obligations'
          ]
        },
        {
          id: 'data-sharing',
          title: 'Information Sharing',
          content: `We do not sell your personal information. We may share your data only in these circumstances:`,
          items: [
            'With service providers to complete your bookings',
            'With payment processors for transactions',
            'With our trusted partners and vendors',
            'When required by law or legal process',
            'To protect our rights and safety',
            'In connection with business transfers'
          ]
        },
        {
          id: 'data-security',
          title: 'Data Security',
          content: `We implement comprehensive security measures to protect your information:`,
          items: [
            'End-to-end encryption for sensitive data',
            'Secure server infrastructure',
            'Regular security audits and updates',
            'Access controls and authentication',
            'Data backup and recovery systems',
            'Staff training on data protection'
          ]
        },
        {
          id: 'your-rights',
          title: 'Your Rights',
          content: `You have several rights regarding your personal data:`,
          items: [
            'Access your personal information',
            'Correct inaccurate data',
            'Delete your account and data',
            'Export your data',
            'Restrict processing',
            'Object to certain uses',
            'Withdraw consent'
          ]
        }
      ]
    },
    userData: {
      title: 'User Data Management',
      icon: faDatabase,
      lastUpdated: 'December 2024',
      sections: [
        {
          id: 'data-types',
          title: 'Types of Data We Store',
          content: `We store different categories of user data to provide our services:`,
          items: [
            'Account Information: Username, email, profile details',
            'Service Data: Bookings, preferences, service history',
            'Location Data: Addresses, service locations, GPS coordinates',
            'Communication Data: Messages, support tickets, feedback',
            'Usage Data: App interactions, feature usage, performance metrics',
            'Device Data: Device type, operating system, app version'
          ]
        },
        {
          id: 'data-retention',
          title: 'Data Retention',
          content: `We retain your data for specific periods based on the type of information:`,
          items: [
            'Account Data: Until account deletion or 3 years of inactivity',
            'Transaction Records: 7 years for legal and tax compliance',
            'Communication Logs: 2 years for quality assurance',
            'Usage Analytics: 18 months in anonymized form',
            'Location Data: Until you disable location services',
            'Marketing Data: Until you unsubscribe or object'
          ]
        },
        {
          id: 'data-processing',
          title: 'Data Processing Activities',
          content: `We process your data for various legitimate purposes:`,
          items: [
            'Service Delivery: Connecting you with service providers',
            'Quality Assurance: Monitoring and improving service quality',
            'Analytics: Understanding usage patterns and preferences',
            'Personalization: Customizing your app experience',
            'Security: Detecting and preventing fraudulent activities',
            'Compliance: Meeting legal and regulatory requirements'
          ]
        },
        {
          id: 'data-portability',
          title: 'Data Portability',
          content: `You can request a copy of your data in a portable format:`,
          items: [
            'Complete profile and account information',
            'Service history and booking records',
            'Saved addresses and preferences',
            'Communication history',
            'Usage statistics (where applicable)',
            'Data in common formats (JSON, CSV, PDF)'
          ]
        }
      ]
    },
    cookies: {
      title: 'Cookie Policy',
      icon: faCookie,
      lastUpdated: 'December 2024',
      sections: [
        {
          id: 'what-are-cookies',
          title: 'What Are Cookies',
          content: `Cookies are small text files stored on your device when you visit our platform. They help us provide a better user experience and analyze how our services are used.`
        },
        {
          id: 'types-of-cookies',
          title: 'Types of Cookies We Use',
          content: `We use different types of cookies for various purposes:`,
          items: [
            'Essential Cookies: Required for basic platform functionality',
            'Performance Cookies: Help us analyze and improve performance',
            'Functional Cookies: Remember your preferences and settings',
            'Analytics Cookies: Understand how you use our platform',
            'Marketing Cookies: Deliver relevant advertisements',
            'Social Media Cookies: Enable social sharing features'
          ]
        },
        {
          id: 'cookie-management',
          title: 'Managing Cookies',
          content: `You have control over cookie settings:`,
          items: [
            'Browser Settings: Disable cookies in your browser',
            'Cookie Preferences: Manage preferences in our app',
            'Third-party Cookies: Control external service cookies',
            'Opt-out Tools: Use industry opt-out mechanisms',
            'Clear Cookies: Delete existing cookies anytime',
            'Selective Control: Choose which types to allow'
          ]
        },
        {
          id: 'third-party-cookies',
          title: 'Third-Party Cookies',
          content: `Some cookies are set by third-party services we use:`,
          items: [
            'Google Analytics: Website usage statistics',
            'Payment Processors: Secure transaction processing',
            'Social Media: Sharing and login functionality',
            'Customer Support: Chat and feedback tools',
            'Content Delivery: Faster loading times',
            'Security Services: Fraud detection and prevention'
          ]
        }
      ]
    }
  };

  const currentData = privacyData[activeSection];

  return (
    <div className="privacy-page">
      {/* Header */}
      <div className="privacy-header">
        <div className="container">
          <div className="header-content animate-on-scroll" id="header">
            <h1 className={isVisible.header ? 'fade-in' : ''}>
              Legal & Privacy Center
            </h1>
            <p className={isVisible.header ? 'fade-in delay-1' : ''}>
              Your privacy and data protection rights explained
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="privacy-nav">
        <div className="container">
          <div className="nav-tabs animate-on-scroll" id="nav">
            {Object.entries(privacyData).map(([key, data]) => (
              <button
                key={key}
                className={`nav-tab ${activeSection === key ? 'active' : ''} ${isVisible.nav ? 'slide-up' : ''}`}
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
        <div className="container">
          <div className="content-wrapper">
            {/* Sidebar */}
            <div className="content-sidebar animate-on-scroll" id="sidebar">
              <div className={`sidebar-content ${isVisible.sidebar ? 'slide-right' : ''}`}>
                <div className="sidebar-header">
                  <FontAwesomeIcon icon={currentData.icon} />
                  <h3>{currentData.title}</h3>
                  <span className="last-updated">
                    Last updated: {currentData.lastUpdated}
                  </span>
                </div>
                
                <div className="section-nav">
                  {currentData.sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="section-link"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(section.id)?.scrollIntoView({ 
                          behavior: 'smooth' 
                        });
                      }}
                    >
                      {section.title}
                    </a>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h4>Quick Actions</h4>
                  <div className="action-buttons">
                    <button className="action-btn">
                      <FontAwesomeIcon icon={faDownload} />
                      Download Policy
                    </button>
                    <button className="action-btn">
                      <FontAwesomeIcon icon={faShare} />
                      Share
                    </button>
                    <button className="action-btn">
                      <FontAwesomeIcon icon={faEdit} />
                      Manage Preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
              {currentData.sections.map((section, index) => (
                <div
                  key={section.id}
                  id={section.id}
                  className={`content-section animate-on-scroll ${isVisible[section.id] ? 'fade-in-up' : ''}`}
                >
                  <div className="section-header">
                    <h2>{section.title}</h2>
                    {section.items && (
                      <button
                        className="expand-toggle"
                        onClick={() => toggleExpanded(section.id)}
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

              {/* Contact Section */}
              <div className="contact-section animate-on-scroll" id="contact">
                <div className={`contact-content ${isVisible.contact ? 'fade-in-up' : ''}`}>
                  <div className="contact-header">
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                    <h3>Questions or Concerns?</h3>
                  </div>
                  <p>
                    If you have any questions about this policy or our data practices, 
                    please don't hesitate to contact us.
                  </p>
                  <div className="contact-methods">
                    <div className="contact-method">
                      <strong>Email:</strong> privacy@buildinz.com
                    </div>
                    <div className="contact-method">
                      <strong>Phone:</strong> +971 (4) 123-4567
                    </div>
                    <div className="contact-method">
                      <strong>Address:</strong> Dubai, United Arab Emirates
                    </div>
                  </div>
                  <button className="contact-btn">
                    Contact Privacy Team
                  </button>
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