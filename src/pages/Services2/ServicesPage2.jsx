import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLayerGroup, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import "./ServicesPage2.css";
import serviceBuilderService from '../../services/serviceBuilderService';
import placeholderImage from '../../assets/images/placeholder.png';

// Skeleton Loader Component
const CategorySkeleton = memo(() => (
  <div className="category-card skeleton-card">
    <div className="category-image">
      <div className="skeleton-image"></div>
    </div>
    <div className="category-content">
      <div className="skeleton-text skeleton-title"></div>
      <div className="skeleton-text skeleton-badge"></div>
      <div className="skeleton-button"></div>
    </div>
  </div>
));

CategorySkeleton.displayName = 'CategorySkeleton';

// Category Card Component (Optimized with memo)
const CategoryCard = memo(({ category, index, onSelect }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const imagePath = category.preview_image_path || category.preview_image_url || category.image_path;
  const fullImageUrl = imagePath ? serviceBuilderService.getImageUrl(imagePath) : null;

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <div 
      className="category-card"
      onClick={() => onSelect(category)}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="category-image">
        {!imageLoaded && !imageError && fullImageUrl && (
          <div className="image-skeleton"></div>
        )}
        {fullImageUrl && !imageError ? (
          <img 
            src={fullImageUrl} 
            alt={category.name}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        ) : (
          <div className="category-placeholder">
            <FontAwesomeIcon icon={faLayerGroup} />
          </div>
        )}
      </div>
      <div className="category-content">
        <h3>{category.name}</h3>
        {category.children && category.children.length > 0 && (
          <div className="category-meta">
            <span className="subcategory-count">
              {category.children.length} فئة فرعية
            </span>
          </div>
        )}
        <button className="category-action-btn">
          <span>عرض الخدمات</span>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      </div>
    </div>
  );
});

CategoryCard.displayName = 'CategoryCard';

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch categories first (most important for initial render)
      const categoriesResponse = await serviceBuilderService.getAllCategories();
      
      if (categoriesResponse.success) {
        const categories = categoriesResponse.categories || [];
        setCategories(categories);
        setLoading(false); // Show categories immediately
      } else {
        console.error('Failed to fetch categories:', categoriesResponse.message);
        setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
        setLoading(false);
      }
      
      // Fetch services in background (less critical)
      try {
        const servicesResponse = await serviceBuilderService.getAllServices();
        if (servicesResponse.success) {
          setServices(servicesResponse.services || []);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
        // Don't show error for services, as they're not critical for initial render
      }
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات. يرجى المحاولة مرة أخرى.');
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    // Create SEO-friendly URL: id-slug format
    const slug = category.slug || (category.name ? category.name.toLowerCase().replace(/\s+/g, '-') : 'category');
    navigate(`/services2/categories/${category.id}-${slug}`);
  }, [navigate]);

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    // Create SEO-friendly URL: id-slug format
    const slug = subcategory.slug || (subcategory.name ? subcategory.name.toLowerCase().replace(/\s+/g, '-') : 'category');
    navigate(`/services2/categories/${subcategory.id}-${slug}`);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    // Create SEO-friendly URL: id-slug format
    const slug = service.slug || (service.name ? service.name.toLowerCase().replace(/\s+/g, '-') : 'service');
    navigate(`/services2/${service.id}-${slug}`);
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
    // Create SEO-friendly URL: id-slug format
    const slug = selectedCategory.slug || (selectedCategory.name ? selectedCategory.name.toLowerCase().replace(/\s+/g, '-') : 'category');
    navigate(`/services2/categories/${selectedCategory.id}-${slug}`);
  };

  const handleCategorySelectMemo = useCallback((category) => {
    handleCategorySelect(category);
  }, [handleCategorySelect]);

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

  if (!loading && (!categories || categories.length === 0)) {
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
            {loading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 6 }).map((_, index) => (
                <CategorySkeleton key={`skeleton-${index}`} />
              ))
            ) : (
              // Show actual category cards
              categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  onSelect={handleCategorySelectMemo}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage2; 