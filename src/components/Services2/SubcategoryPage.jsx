import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import "./SubcategoryPage.css";

const SubcategoryPage = ({ category, onSubcategorySelect, onBackClick }) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (scrollContainerRef.current) {
        if (e.deltaY !== 0) {
          e.preventDefault();
          scrollContainerRef.current.scrollLeft += e.deltaY;
        }
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  if (!category) return null;

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
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="subcategory-page">
      <div className="subcategory-header">
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
          عودة للتصنيفات
        </button>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="page-title">{category.name}</h1>
          <p className="page-subtitle">{category.description}</p>
        </motion.div>
      </div>

      <div className="subcategory-banner">
        <motion.img
          src={category.image}
          alt={category.name}
          className="banner-image"
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="banner-overlay"></div>
        <div className="banner-content">
          <h2>{category.name}</h2>
        </div>
      </div>

      {category.subcategories && category.subcategories.length > 0 ? (
        <div className="subcategories-section">
          <h2 className="section-title">اختر الفئة الفرعية</h2>
          <div className="subcategories-scroll-container" ref={scrollContainerRef}>
            <motion.div
              className="subcategories-container"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {category.subcategories.map((subcategory) => (
                <motion.div
                  key={subcategory.id}
                  className="subcategory-card"
                  variants={itemVariants}
                  onClick={() => onSubcategorySelect(subcategory)}
                  whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)" }}
                >
                  <div className="subcategory-image-container">
                    <img
                      src={subcategory.image}
                      alt={subcategory.name}
                      className="subcategory-image"
                    />
                  </div>
                  <div className="subcategory-content">
                    <h3>{subcategory.name}</h3>
                    <p>{subcategory.description}</p>
                    <motion.button
                      className="subcategory-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      عرض الخدمات
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
          <div className="scroll-indicator">
            <div className="scroll-text">مرر للمزيد</div>
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
              className="scroll-icon"
            >
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </div>
        </div>
      ) : (
        <div className="no-subcategories">
          <p>لا توجد فئات فرعية متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};

export default SubcategoryPage; 