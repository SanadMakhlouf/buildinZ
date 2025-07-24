import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import serviceBuilderService from '../../services/serviceBuilderService';
import './CategoryPage.css';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceBuilderService.getAllCategories();
      
      if (response.success) {
        setCategories(response.categories || []);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('حدث خطأ أثناء جلب الفئات. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/services2/categories/${category.id}`);
  };

  const handleSubcategoryClick = (subcategory, event) => {
    event.stopPropagation();
    navigate(`/services2/categories/${subcategory.id}`);
  };

  if (loading) {
    return (
      <div className="category-page">
        <div className="container">
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>جاري تحميل الفئات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="container">
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <p>{error}</p>
            <button onClick={fetchCategories} className="retry-button">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="container">
        <div className="category-header">
          <h1>الفئات</h1>
          <p>اختر من مجموعة متنوعة من الفئات والخدمات المتميزة</p>
        </div>

        {categories.length === 0 ? (
          <div className="no-categories">
            <p>لا توجد فئات متاحة</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-image">
                  <img 
                    src={serviceBuilderService.getImageUrl(category.image_path)} 
                    alt={category.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/assets/images/placeholder.jpg';
                    }}
                  />
                </div>
                <div className="category-content">
                  <h3>{category.name}</h3>
                  
                  {category.children && category.children.length > 0 && (
                    <div className="subcategories-list">
                      {category.children.slice(0, 3).map(subcategory => (
                        <span 
                          key={subcategory.id} 
                          className="subcategory-tag"
                          onClick={(e) => handleSubcategoryClick(subcategory, e)}
                        >
                          {subcategory.name}
                        </span>
                      ))}
                      {category.children.length > 3 && (
                        <span className="more-tag">+{category.children.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="category-arrow">
                  <FontAwesomeIcon icon={faChevronLeft} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 