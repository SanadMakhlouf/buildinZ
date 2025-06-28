import React, { useState, useEffect } from "react";
import "../styles/Sidebar.css";
import dataService from "../services/dataService";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({
  categories,
  onServiceSelect,
  selectedCategory,
  onCategorySelect,
}) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState(categories);

  // Set expanded category if a selectedCategory prop is provided
  useEffect(() => {
    if (selectedCategory) {
      setExpandedCategory(selectedCategory.id);
    }
  }, [selectedCategory]);

  // Filter categories based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter((category) => {
      // Check if category name matches
      if (category.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }

      // Check if any subcategory matches
      const hasMatchingSubcategory = category.subcategories.some(
        (subcategory) => {
          if (
            subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            return true;
          }

          // Check if any service matches
          return subcategory.services.some((service) =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      );

      return hasMatchingSubcategory;
    });

    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const toggleCategory = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);

    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      setExpandedSubcategory(null);
      if (onCategorySelect) onCategorySelect(null);
    } else {
      setExpandedCategory(categoryId);
      setExpandedSubcategory(null);
      if (onCategorySelect) onCategorySelect(category);
    }
  };

  const toggleSubcategory = (subcategoryId) => {
    setExpandedSubcategory(
      expandedSubcategory === subcategoryId ? null : subcategoryId
    );
  };

  const handleServiceClick = (service) => {
    setActiveService(service.id);
    onServiceSelect(service);
  };

  // Animation variants
  const categoryVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>حاسبة التكاليف</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchTerm("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="categories-list">
        {filteredCategories.map((category) => (
          <div key={category.id} className="category">
            <motion.div
              className={`category-header ${
                expandedCategory === category.id ? "expanded" : ""
              }`}
              onClick={() => toggleCategory(category.id)}
              whileTap={{ scale: 0.98 }}
            >
              <div className="category-icon-container">
                <span className="category-icon">{category.icon}</span>
              </div>
              <span className="category-name">{category.name}</span>
              <motion.span
                className="category-arrow"
                animate={{ rotate: expandedCategory === category.id ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ❯
              </motion.span>
            </motion.div>

            <AnimatePresence>
              {expandedCategory === category.id && (
                <motion.div
                  className="subcategories-list"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={categoryVariants}
                >
                  {category.subcategories.map((subcategory) => (
                    <motion.div
                      key={subcategory.id}
                      className="subcategory"
                      variants={itemVariants}
                    >
                      <motion.div
                        className={`subcategory-header ${
                          expandedSubcategory === subcategory.id
                            ? "expanded"
                            : ""
                        }`}
                        onClick={() => toggleSubcategory(subcategory.id)}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="subcategory-name">
                          {subcategory.name}
                        </span>
                        <motion.span
                          className="subcategory-arrow"
                          animate={{
                            rotate:
                              expandedSubcategory === subcategory.id ? 90 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          ❯
                        </motion.span>
                      </motion.div>

                      <AnimatePresence>
                        {expandedSubcategory === subcategory.id && (
                          <motion.div
                            className="services-list"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={categoryVariants}
                          >
                            {subcategory.services.map((service) => (
                              <motion.div
                                key={service.id}
                                className={`service-item ${
                                  activeService === service.id ? "active" : ""
                                }`}
                                onClick={() => handleServiceClick(service)}
                                whileHover={{ x: -5 }}
                                whileTap={{ scale: 0.98 }}
                                variants={itemVariants}
                              >
                                <div className="service-content">
                                  <span className="service-name">
                                    {service.name}
                                  </span>
                                  {service.price_unit && (
                                    <span className="service-price">
                                      {service.price_unit}{" "}
                                      {service.currency || "SAR"}/م²
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                            {subcategory.services.length === 0 && (
                              <motion.div
                                className="no-services"
                                variants={itemVariants}
                              >
                                لا توجد خدمات متاحة
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="no-results">
            <p>لا توجد نتائج مطابقة للبحث</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
