import React from "react";
import { motion } from "framer-motion";
import "./ServiceDetail.css";

const ServiceDetail = ({ subcategory, onServiceSelect, onBackClick }) => {
  if (!subcategory) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="service-detail-page">
      <div className="service-detail-header">
        <button className="back-button" onClick={onBackClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          عودة للفئات الفرعية
        </button>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="page-title">{subcategory.name}</h1>
          <p className="page-subtitle">{subcategory.description}</p>
        </motion.div>
      </div>

      <div className="service-detail-banner">
        <motion.img
          src={subcategory.image}
          alt={subcategory.name}
          className="banner-image"
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h2>{subcategory.name}</h2>
        </div>
      </div>

      {subcategory.services && subcategory.services.length > 0 ? (
        <div className="services-section">
          <h2 className="section-title">اختر الخدمة</h2>
          <motion.div
            className="services-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {subcategory.services.map((service) => (
              <motion.div
                key={service.id}
                className="service-card"
                variants={itemVariants}
                onClick={() => onServiceSelect(service)}
                whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)" }}
              >
                <div className="service-image-container">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="service-image"
                  />
                </div>
                <div className="service-content">
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-price-info">
                    <div className="service-price">
                      <span className="price-amount">{service.basePrice}</span>
                      <span className="price-currency">درهم</span>
                      <span className="price-unit">/ {service.unit}</span>
                    </div>
                  </div>
                  <motion.button
                    className="service-button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ابدأ الطلب
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="no-services">
          <p>لا توجد خدمات متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail; 