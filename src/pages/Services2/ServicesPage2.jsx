import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faExclamationTriangle, 
  faSearch, 
  faLayerGroup, 
  faChevronLeft 
} from '@fortawesome/free-solid-svg-icons';
import serviceBuilderService from '../../services/serviceBuilderService';
import './ServicesPage2.css';

const ServicesPage2 = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both services and categories in parallel
      const [servicesResponse, categoriesResponse] = await Promise.all([
        serviceBuilderService.getAllServices(),
        serviceBuilderService.getAllCategories()
      ]);
      
      if (servicesResponse.success) {
        setServices(servicesResponse.services || []);
      } else {
        console.error('Failed to fetch services:', servicesResponse.message);
      }
      
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.categories || []);
      } else {
        console.error('Failed to fetch categories:', categoriesResponse.message);
      }
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (service) => {
    navigate(`/services2/${service.id}`);
  };

  const handleCategoriesClick = () => {
    navigate('/services2/categories');
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="services-page2">
        <div className="container">
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="3x" />
            <p>جاري تحميل الخدمات...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-page2">
        <div className="container">
          <div className="error-container">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
            <p>{error}</p>
            <button onClick={fetchData} className="retry-button">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page2">
      <div className="container">
        <div className="services-header">
          <h1>الخدمات</h1>
          <p>اختر من مجموعة متنوعة من الخدمات المتميزة</p>
          
          <div className="search-container">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input
              type="text"
              placeholder="ابحث عن خدمة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Categories Section */}
        {categories.length > 0 && (
          <div className="categories-section">
            <div className="section-header">
              <h2>الفئات</h2>
              <button 
                className="view-all-button"
                onClick={handleCategoriesClick}
              >
                عرض الكل
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            </div>
            
            <div className="categories-row">
              {categories.slice(0, 4).map(category => (
                <div 
                  key={category.id} 
                  className="category-item"
                  onClick={() => navigate(`/services2/categories/${category.id}`)}
                >
                  <div className="category-icon">
                    {category.image_path ? (
                      <img 
                        src={serviceBuilderService.getImageUrl(category.image_path)} 
                        alt={category.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <FontAwesomeIcon icon={faLayerGroup} />
                    )}
                  </div>
                  <h3>{category.name}</h3>
                  {category.children && category.children.length > 0 && (
                    <span className="subcategory-count">
                      {category.children.length} فئة فرعية
                    </span>
                  )}
                </div>
              ))}
              
              {categories.length > 4 && (
                <div 
                  className="category-item more-categories"
                  onClick={handleCategoriesClick}
                >
                  <div className="more-icon">
                    <span>+{categories.length - 4}</span>
                  </div>
                  <h3>المزيد من الفئات</h3>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Section */}
        <div className="services-section">
          <h2>جميع الخدمات</h2>
          
          {filteredServices.length === 0 ? (
            <div className="no-services">
              <p>لا توجد خدمات متطابقة مع بحثك</p>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServices.map(service => (
                <div 
                  key={service.id} 
                  className="service-card"
                  onClick={() => handleServiceClick(service)}
                >
                  <div className="service-image">
                    <img 
                      src={serviceBuilderService.getImageUrl(service.preview_image)} 
                      alt={service.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="service-content">
                    <h3>{service.name}</h3>
                    {service.description && <p>{service.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage2; 