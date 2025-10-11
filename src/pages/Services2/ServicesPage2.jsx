import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import "./ServicesPage2.css";
import serviceBuilderService from '../../services/serviceBuilderService';
import placeholderImage from '../../assets/images/placeholder.png';

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
    
    if ((pathParts.includes('services') || pathParts.includes('services2')) && categories.length > 0) {
      const servicesIndex = pathParts.includes('services2') ? pathParts.indexOf('services2') : pathParts.indexOf('services');
      const categoryId = pathParts[servicesIndex + 1];
      const subcategoryId = pathParts[servicesIndex + 2];
      const serviceId = pathParts[servicesIndex + 3];
      
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
        const categories = categoriesResponse.categories || [];
        console.log('Categories API Response:', categoriesResponse);
        console.log('Categories Data:', categories);
        if (categories.length > 0) {
          console.log('First Category Sample:', categories[0]);
        }
        setCategories(categories);
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

  if (!categories || categories.length === 0) {
    return (
      <div className="services-page2">
        <div className="empty-state">
          <FontAwesomeIcon icon={faLayerGroup} size="3x" />
          <h2>اختر الخيارات المناسبة</h2>
          <p>لم يتم العثور على أي فئات. يرجى المحاولة مرة أخرى لاحقاً.</p>
          <button onClick={fetchData} className="retry-button">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page2">
      <div className="container">
        <div className="categories-section">
          <h2>اختر الخيارات المناسبة</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <div 
                key={category.id} 
                className="category-card"
                onClick={() => handleCategorySelect(category)}
              >
                <div className="category-image">
                  {(category.preview_image_path || category.preview_image_url || category.image_path) ? (
                    (() => {
                      const imagePath = category.preview_image_path || category.preview_image_url || category.image_path;
                      const fullImageUrl = serviceBuilderService.getImageUrl(imagePath);
                      console.log('Category Image Debug:', {
                        categoryName: category.name,
                        categoryId: category.id,
                        preview_image_path: category.preview_image_path,
                        preview_image_url: category.preview_image_url,
                        image_path: category.image_path,
                        selectedPath: imagePath,
                        fullImageUrl: fullImageUrl
                      });
                      return (
                        <img 
                          src={fullImageUrl} 
                          alt={category.name}
                          onError={(e) => {
                            console.log('Image failed to load:', fullImageUrl);
                            e.target.onerror = null;
                            e.target.src = placeholderImage;
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', fullImageUrl);
                          }}
                        />
                      );
                    })()
                  ) : (
                    <div className="category-placeholder">
                      <FontAwesomeIcon icon={faLayerGroup} />
                    </div>
                  )}
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
        </div>
      </div>
    </div>
  );
};

export default ServicesPage2; 