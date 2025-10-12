import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faExclamationTriangle, 
  faChevronLeft, 
  faArrowRight 
} from '@fortawesome/free-solid-svg-icons';
import serviceBuilderService from '../../services/serviceBuilderService';
import placeholderImage from '../../assets/images/placeholder.png';
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
    // Create SEO-friendly URL: id-slug format
    const slug = category.slug || (category.name ? category.name.toLowerCase().replace(/\s+/g, '-') : 'category');
    navigate(`/services2/categories/${category.id}-${slug}`);
  };

  const handleSubcategoryClick = (subcategory, event) => {
    event.stopPropagation();
    // Create SEO-friendly URL: id-slug format
    const slug = subcategory.slug || (subcategory.name ? subcategory.name.toLowerCase().replace(/\s+/g, '-') : 'category');
    navigate(`/services2/categories/${subcategory.id}-${slug}`);
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

  // Prepare SEO data
  const pageTitle = 'فئات الخدمات - BuildingZ';
  const pageDescription = 'تصفح جميع فئات الخدمات الهندسية والإنشائية المتاحة على منصة BuildingZ';
  const pageUrl = `${window.location.origin}/services2/categories`;
  const firstCategoryImage = categories.length > 0 
    ? serviceBuilderService.getImageUrl(categories[0].preview_image_path || categories[0].preview_image_url || categories[0].image_path)
    : `${window.location.origin}/logo.png`;

  return (
    <div className="category-page">
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="خدمات هندسية, خدمات إنشائية, فئات الخدمات, BuildingZ, بناء, تشييد, استشارات هندسية" />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={firstCategoryImage} />
        <meta property="og:site_name" content="BuildingZ" />
        <meta property="og:locale" content="ar_AE" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={firstCategoryImage} />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Arabic" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="BuildingZ" />
        
        {/* Structured Data for Categories */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": pageTitle,
            "description": pageDescription,
            "url": pageUrl,
            "provider": {
              "@type": "Organization",
              "name": "BuildingZ",
              "url": window.location.origin
            },
            "numberOfItems": categories.length,
            "itemListElement": categories.map((category, index) => {
              const slug = category.slug || (category.name ? category.name.toLowerCase().replace(/\s+/g, '-') : 'category');
              return {
                "@type": "ListItem",
                "position": index + 1,
                "name": category.name || 'فئة',
                "url": `${window.location.origin}/services2/categories/${category.id}-${slug}`,
                "description": category.description || category.name || 'فئة'
              };
            })
          })}
        </script>
      </Helmet>

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
            {categories.map((category, index) => (
              <div 
                key={category.id} 
                className="category-card"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-image">
                  <img 
                    src={serviceBuilderService.getImageUrl(category.preview_image_path || category.preview_image_url || category.image_path)} 
                    alt={category.name}
                    loading={index < 6 ? "eager" : "lazy"}
                    decoding="async"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderImage;
                    }}
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