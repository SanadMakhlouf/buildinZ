import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faExclamationTriangle, 
  faArrowRight, 
  faChevronLeft,
  faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import serviceBuilderService from '../../services/serviceBuilderService';
import './CategoryDetailPage.css';

const CategoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('subcategories'); // 'subcategories' or 'services'

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceBuilderService.getCategoryById(id);
      
      if (response.success) {
        setCategory(response.category);
        
        // If no subcategories but has services, switch to services tab
        if (
          (!response.category.children || response.category.children.length === 0) && 
          (response.category.services && response.category.services.length > 0)
        ) {
          setActiveTab('services');
        }
      } else {
        setError(response.message || 'Failed to fetch category details');
      }
    } catch (err) {
      setError('حدث خطأ أثناء جلب تفاصيل الفئة. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryClick = (subcategory) => {
    navigate(`/services2/categories/${subcategory.id}`);
  };

  const handleServiceClick = (service) => {
    navigate(`/services2/${service.id}`);
  };

  const handleBackClick = () => {
    navigate('/services2/categories');
  };

  if (loading) {
    return (
      <div className="category-detail-page">
        <div className="container">
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>جاري تحميل تفاصيل الفئة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-detail-page">
        <div className="container">
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <p>{error}</p>
            <button onClick={fetchCategoryDetails} className="retry-button">
              إعادة المحاولة
            </button>
            <button onClick={handleBackClick} className="back-button">
              <FontAwesomeIcon icon={faArrowRight} />
              العودة إلى الفئات
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-detail-page">
        <div className="container">
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <p>لم يتم العثور على الفئة</p>
            <button onClick={handleBackClick} className="back-button">
              <FontAwesomeIcon icon={faArrowRight} />
              العودة إلى الفئات
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasSubcategories = category.children && category.children.length > 0;
  const hasServices = category.services && category.services.length > 0;

  return (
    <div className="category-detail-page">
      <div className="container">
        <div className="category-header">
          <button onClick={handleBackClick} className="back-button">
            <FontAwesomeIcon icon={faArrowRight} />
            العودة إلى الفئات
          </button>
          
          <div className="category-info">
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
            <div className="category-text">
              <h1>{category.name}</h1>
              {category.description && <p className="category-description">{category.description}</p>}
            </div>
          </div>
        </div>

        {(hasSubcategories || hasServices) && (
          <div className="category-content">
            {/* Tabs - Only show if both subcategories and services exist */}
            {hasSubcategories && hasServices && (
              <div className="category-tabs">
                <button 
                  className={`tab-button ${activeTab === 'subcategories' ? 'active' : ''}`}
                  onClick={() => setActiveTab('subcategories')}
                >
                  الفئات الفرعية
                </button>
                <button 
                  className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
                  onClick={() => setActiveTab('services')}
                >
                  الخدمات
                </button>
              </div>
            )}

            {/* Subcategories Tab */}
            {activeTab === 'subcategories' && hasSubcategories && (
              <div className="subcategories-grid">
                {category.children.map(subcategory => (
                  <div 
                    key={subcategory.id} 
                    className="subcategory-card"
                    onClick={() => handleSubcategoryClick(subcategory)}
                  >
                    <div className="subcategory-image">
                      <img 
                        src={serviceBuilderService.getImageUrl(subcategory.image_path)} 
                        alt={subcategory.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="subcategory-content">
                      <h3>{subcategory.name}</h3>
                    </div>
                    <div className="subcategory-arrow">
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && hasServices && (
              <div className="services-grid">
                {category.services.map(service => (
                  <div 
                    key={service.id} 
                    className="service-card"
                    onClick={() => handleServiceClick(service)}
                  >
                    <div className="service-image">
                      {service.preview_image ? (
                        <img 
                          src={serviceBuilderService.getImageUrl(service.preview_image)} 
                          alt={service.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/images/placeholder.jpg';
                          }}
                        />
                      ) : (
                        <div className="service-placeholder">
                          <FontAwesomeIcon icon={faLayerGroup} />
                        </div>
                      )}
                    </div>
                    <div className="service-content">
                      <h3>{service.name}</h3>
                      {service.description && <p>{service.description}</p>}
                    </div>
                    <div className="service-arrow">
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No subcategories message */}
            {activeTab === 'subcategories' && !hasSubcategories && (
              <div className="no-items-message">
                <p>لا توجد فئات فرعية متاحة</p>
                {hasServices && (
                  <button 
                    className="switch-tab-button"
                    onClick={() => setActiveTab('services')}
                  >
                    عرض الخدمات
                  </button>
                )}
              </div>
            )}

            {/* No services message */}
            {activeTab === 'services' && !hasServices && (
              <div className="no-items-message">
                <p>لا توجد خدمات متاحة</p>
                {hasSubcategories && (
                  <button 
                    className="switch-tab-button"
                    onClick={() => setActiveTab('subcategories')}
                  >
                    عرض الفئات الفرعية
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* No content message */}
        {!hasSubcategories && !hasServices && (
          <div className="no-content">
            <p>لا توجد فئات فرعية أو خدمات متاحة في هذه الفئة</p>
            <button onClick={handleBackClick} className="back-button">
              <FontAwesomeIcon icon={faArrowRight} />
              العودة إلى الفئات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryDetailPage; 