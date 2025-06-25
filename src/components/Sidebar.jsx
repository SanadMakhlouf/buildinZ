import React, { useState } from "react";
import "../styles/Sidebar.css";
import { categories } from "../data/dummyData";

const Sidebar = ({ onServiceSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryClick = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleServiceClick = (service) => {
    onServiceSelect(service);
  };

  return (
    <div className="sidebar">
      <div className="categories-section">
        <h2>الخدمات</h2>
        <div className="categories-list">
          {categories.map((category) => (
            <div key={category.id} className="category-item">
              <div
                className={`category-header ${
                  selectedCategory?.id === category.id ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </div>
              {selectedCategory?.id === category.id && (
                <div className="subcategories-list">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="subcategory-item">
                      <div
                        className={`subcategory-header ${
                          selectedSubcategory?.id === subcategory.id
                            ? "active"
                            : ""
                        }`}
                        onClick={() => handleSubcategoryClick(subcategory)}
                      >
                        {subcategory.name}
                      </div>
                      {selectedSubcategory?.id === subcategory.id && (
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
    </div>
  );
};

export default Sidebar;
