import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import "./ServicesPage2.css";
import serviceBuilderService from '../../services/serviceBuilderService';

const ServicesPage2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Parse URL to set the selected items
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    if (pathParts.includes('services2') && categories.length > 0) {
      const categoryId = pathParts[pathParts.indexOf('services2') + 1];
      const subcategoryId = pathParts[pathParts.indexOf('services2') + 2];
      const serviceId = pathParts[pathParts.indexOf('services2') + 3];
      
      if (categoryId && !isNaN(parseInt(categoryId))) {
        const category = categories.find(cat => cat.id.toString() === categoryId);
        setSelectedCategory(category || null);
        
        if (subcategoryId && category && category.children) {
          const subcategory = category.children.find(sub => sub.id.toString() === subcategoryId);
          setSelectedSubcategory(subcategory || null);
          
          if (serviceId && subcategory && subcategory.services) {
            const service = subcategory.services.find(srv => srv.id.toString() === serviceId);
            setSelectedService(service || null);
          } else if (serviceId && services.length > 0) {
            const service = services.find(srv => srv.id.toString() === serviceId);
            setSelectedService(service || null);
          }
        }
      }
    }
  }, [location.pathname, categories, services]);

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

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate(`/services2/categories/${category.id}`);
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    navigate(`/services2/categories/${selectedCategory.id}/${subcategory.id}`);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    navigate(`/services2/${service.id}`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedService(null);
    navigate('/services2/categories');
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
    setSelectedService(null);
    navigate(`/services2/categories/${selectedCategory.id}`);
  };

  if (loading) {
    return (
      <div className="services-page2">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-page2">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchData} className="retry-button">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page2">
      <div className="hero-section">
        <div className="hero-content">
          <h1>الخدمات</h1>
          <p>اختر من مجموعة متنوعة من الخدمات المتميزة</p>
        </div>
      </div>

      <div className="container">
        <div className="services-content">
          {/* Categories Grid */}
          <div className="categories-grid">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="category-card"
                onClick={() => handleCategorySelect(category)}
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
                  <div className="category-overlay">
                    <h3>{category.name}</h3>
                    
                    {category.children && category.children.length > 0 && (
                      <div className="subcategories-preview">
                        <span className="subcategory-count">
                          {category.children.length} فئة فرعية
                        </span>
                      </div>
                    )}
                    
                    <div className="category-action">عرض الخدمات</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Featured Services */}
          <div className="featured-services">
            <h2>الخدمات المميزة</h2>
            <div className="services-grid">
              {services.slice(0, 6).map(service => (
                <div 
                  key={service.id} 
                  className="service-card"
                  onClick={() => handleServiceSelect(service)}
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
                    <div className="service-overlay">
                      <h3>{service.name}</h3>
                      <div className="service-action">عرض التفاصيل</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage2; 