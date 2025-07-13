import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./CategorySelection.css";

const CategorySelection = ({ categories, onCategorySelect }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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
    <div className="category-selection-container">
      <motion.div
        className="category-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="page-title">اختر الخدمة التي تناسب احتياجاتك</h1>
        <p className="page-subtitle">
          مجموعة متكاملة من خدمات البناء والتشطيب بأعلى معايير الجودة وأفضل الأسعار
        </p>
      </motion.div>

      <motion.div
        className="categories-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            className="category-card"
            variants={itemVariants}
            onMouseEnter={() => !isMobile && setHoveredIndex(index)}
            onMouseLeave={() => !isMobile && setHoveredIndex(null)}
            onClick={() => onCategorySelect(category)}
          >
            <div className="category-image-container">
              <motion.img
                src={category.image}
                alt={category.name}
                className="category-image"
                animate={{
                  scale: hoveredIndex === index ? 1.05 : 1
                }}
                transition={{ duration: 0.3 }}
              />
              <div className="category-overlay"></div>
            </div>
            <div className="category-content">
              <h2>{category.name}</h2>
              <p>{category.description}</p>
              <motion.button
                className="category-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                استعرض الخدمات
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
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default CategorySelection; 