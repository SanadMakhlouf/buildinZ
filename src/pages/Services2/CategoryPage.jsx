import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faExclamationTriangle, 
  faChevronLeft, 
  faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import serviceBuilderService from '../../services/serviceBuilderService';
import './CategoryPage.css';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

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

  const handleBackClick = () => {
    navigate('/services');
  };

  if (loading) {
    return (
      <div className="category-page">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>جاري تحميل الفئات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <p>{error}</p>
          <button onClick={fetchCategories} className="retry-button">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="hero-section">
        <div className="hero-content">
          <button onClick={handleBackClick} className="back-button">
            <FontAwesomeIcon icon={faArrowRight} />
            العودة إلى الخدمات
          </button>
          <h1>الفئات</h1>
          <p>اختر من مجموعة متنوعة من الفئات والخدمات المتميزة</p>
        </div>
      </div>

      <div className="container">
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
                   
                  />
                  <div className="category-overlay">
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
                    
                    <div className="category-action">عرض الفئة</div>
                  </div>
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