import React, { useState, useEffect } from "react";
import "../styles/Sidebar.css";
import dataService from "../services/dataService";

const Sidebar = ({ categories, onServiceSelect, selectedCategory, onCategorySelect }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);

  // Set expanded category if a selectedCategory prop is provided
  useEffect(() => {
    if (selectedCategory) {
      setExpandedCategory(selectedCategory.id);
    }
  }, [selectedCategory]);

  const toggleCategory = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    
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
    onServiceSelect(service);
  };

  return (
    <div className="sidebar">
      <h2>حاسبة التكاليف</h2>
      <div className="categories-list">
        {categories.map((category) => (
          <div key={category.id} className="category">
            <div
              className={`category-header ${
                expandedCategory === category.id ? "expanded" : ""
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </div>
            {expandedCategory === category.id && (
              <div className="subcategories-list">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="subcategory">
                    <div
                      className={`subcategory-header ${
                        expandedSubcategory === subcategory.id ? "expanded" : ""
                      }`}
                      onClick={() => toggleSubcategory(subcategory.id)}
                    >
                      <span className="subcategory-name">{subcategory.name}</span>
                    </div>
                    {expandedSubcategory === subcategory.id && (
                      <div className="services-list">
                        {subcategory.services.map((service) => (
                          <div
                            key={service.id}
                            className="service-item"
                            onClick={() => handleServiceClick(service)}
                          >
                            {service.name}
                          </div>
                        ))}
                        {subcategory.services.length === 0 && (
                          <div className="no-services">لا توجد خدمات متاحة</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
