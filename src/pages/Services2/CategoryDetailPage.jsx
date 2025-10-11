import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faExclamationTriangle, 
  faArrowRight, 
  faLayerGroup,
  faList,
  faThLarge
} from '@fortawesome/free-solid-svg-icons';
import serviceBuilderService from '../../services/serviceBuilderService';
import placeholderImage from '../../assets/images/placeholder.png';
import './CategoryDetailPage.css';

const CategoryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('subcategories'); // 'subcategories' or 'services'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

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
    navigate('/services');
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  if (loading) {
    return (
      <div className="category-detail-page">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>جاري تحميل تفاصيل الفئة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-detail-page">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <p>{error}</p>
          <button onClick={fetchCategoryDetails} className="retry-button">
            إعادة المحاولة
          </button>
          <button onClick={handleBackClick} className="back-button secondary">
            <FontAwesomeIcon icon={faArrowRight} />
            العودة إلى الفئات
          </button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-detail-page">
        <div className="error-container">
          <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
          <p>لم يتم العثور على الفئة</p>
          <button onClick={handleBackClick} className="back-button secondary">
            <FontAwesomeIcon icon={faArrowRight} />
            العودة إلى الفئات
          </button>
        </div>
      </div>
    );
  }

  const hasSubcategories = category.children && category.children.length > 0;
  const hasServices = category.services && category.services.length > 0;

  return (
    <div className="category-detail-page">
      <div className="hero-banner" style={{
        backgroundImage: `linear-gradient(rgba(10, 50, 89, 0.7), rgba(10, 50, 89, 0.85)), url(${serviceBuilderService.getImageUrl(category.preview_image_url || category.image_path)})`
      }}>
        <div className="container">
          <button onClick={handleBackClick} className="back-button">
            <FontAwesomeIcon icon={faArrowRight} />
            العودة إلى الفئات
          </button>
          
          <h1>{category.name}</h1>
          {category.description && <p className="category-description">{category.description}</p>}
        </div>
      </div>

      <div className="container content-container">
        {(hasSubcategories || hasServices) && (
          <div className="category-content">
            {/* Tabs - Only show if both subcategories and services exist */}
            <div className="category-header">
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
              
              <div className="view-toggle">
                <button 
                  className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="عرض شبكي"
                >
                  <FontAwesomeIcon icon={faThLarge} />
                </button>
                <button 
                  className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="عرض قائمة"
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>
            </div>

            {/* Subcategories Tab */}
            {activeTab === 'subcategories' && hasSubcategories && (
              <div className={`subcategories-${viewMode}`}>
                {category.children.map(subcategory => (
                  <div 
                    key={subcategory.id} 
                    className={`subcategory-item ${viewMode === 'grid' ? 'card' : 'row'}`}
                    onClick={() => handleSubcategoryClick(subcategory)}
                  >
                    <div className="subcategory-image">
                      <img 
                        src={serviceBuilderService.getImageUrl(subcategory.preview_image_url || subcategory.image_path)} 
                        alt={subcategory.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = placeholderImage;
                        }}
                       
                      />
                      {viewMode === 'grid' && (
                        <div className="subcategory-overlay">
                          <h3>{subcategory.name}</h3>
                          <div className="subcategory-action">عرض الفئة</div>
                        </div>
                      )}
                    </div>
                    
                    {viewMode === 'list' && (
                      <div className="subcategory-details">
                        <h3>{subcategory.name}</h3>
                        {subcategory.description && <p>{subcategory.description}</p>}
                        <div className="subcategory-meta">
                          {subcategory.children && subcategory.children.length > 0 && (
                            <span className="subcategory-count">
                              {subcategory.children.length} فئة فرعية
                            </span>
                          )}
                          {subcategory.services && subcategory.services.length > 0 && (
                            <span className="service-count">
                              {subcategory.services.length} خدمة
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && hasServices && (
              <div className={`services-${viewMode}`}>
                {category.services.map(service => (
                  <div 
                    key={service.id} 
                    className={`service-item ${viewMode === 'grid' ? 'card' : 'row'}`}
                    onClick={() => handleServiceClick(service)}
                  >
                    <div className="service-image">
                      {service.main_image?.url ? (
                        <img 
                          src={service.main_image.url} 
                          alt={service.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = placeholderImage;
                          }}
                        />
                      ) : (
                        <div className="service-gradient-bg">
                          <div className="service-icon-container">
                            <FontAwesomeIcon icon={faLayerGroup} />
                          </div>
                          <div className="service-bg-pattern"></div>
                        </div>
                      )}
                      {viewMode === 'grid' && (
                        <div className="service-overlay">
                          <h3>{service.name}</h3>
                          {service.description && <p>{service.description}</p>}
                          <div className="service-action">عرض الخدمة</div>
                        </div>
                      )}
                    </div>
                    
                    {viewMode === 'list' && (
                      <div className="service-details">
                        <h3>{service.name}</h3>
                        {service.description && <p>{service.description}</p>}
                        <div className="service-meta">
                          <span className="service-price">
                            {service.base_price ? `${service.base_price} ر.س` : 'السعر عند الطلب'}
                          </span>
                          <button className="view-service-btn">عرض الخدمة</button>
                        </div>
                      </div>
                    )}
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
            <button onClick={handleBackClick} className="back-button secondary">
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