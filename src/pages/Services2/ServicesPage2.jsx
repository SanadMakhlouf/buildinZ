import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./ServicesPage2.css";
import CategorySelection from "../../components/Services2/CategorySelection";
import SubcategoryPage from "../../components/Services2/SubcategoryPage";
import ServiceDetail from "../../components/Services2/ServiceDetail";
import DynamicForm from "../../components/Services2/DynamicForm";

// Mock data - would be fetched from API in production
import { categoriesData } from "../../data/services2Data";

const ServicesPage2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulating data loading
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    // Parse URL to set the selected items
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    if (pathParts.includes('services2')) {
      const categorySlug = pathParts[pathParts.indexOf('services2') + 1];
      const subcategorySlug = pathParts[pathParts.indexOf('services2') + 2];
      const serviceSlug = pathParts[pathParts.indexOf('services2') + 3];
      
      if (categorySlug && categoriesData) {
        const category = categoriesData.find(cat => cat.slug === categorySlug);
        setSelectedCategory(category || null);
        
        if (subcategorySlug && category) {
          const subcategory = category.subcategories.find(sub => sub.slug === subcategorySlug);
          setSelectedSubcategory(subcategory || null);
          
          if (serviceSlug && subcategory) {
            const service = subcategory.services.find(srv => srv.slug === serviceSlug);
            setSelectedService(service || null);
          }
        }
      }
    }
  }, [location.pathname]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    navigate(`/services2/${category.slug}`);
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    navigate(`/services2/${selectedCategory.slug}/${subcategory.slug}`);
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    navigate(`/services2/${selectedCategory.slug}/${selectedSubcategory.slug}/${service.slug}`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedService(null);
    navigate('/services2');
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
    setSelectedService(null);
    navigate(`/services2/${selectedCategory.slug}`);
  };

  if (isLoading) {
    return (
      <div className="services2-loading">
        <div className="loader"></div>
        <p>جاري تحميل الخدمات...</p>
      </div>
    );
  }

  return (
    <div className="services2-container" dir="rtl">
      <Routes>
        <Route 
          path="/" 
          element={
            <CategorySelection 
              categories={categoriesData} 
              onCategorySelect={handleCategorySelect} 
            />
          } 
        />
        <Route 
          path="/:categorySlug" 
          element={
            <SubcategoryPage 
              category={selectedCategory} 
              onSubcategorySelect={handleSubcategorySelect}
              onBackClick={handleBackToCategories}
            />
          } 
        />
        <Route 
          path="/:categorySlug/:subcategorySlug" 
          element={
            <ServiceDetail 
              subcategory={selectedSubcategory}
              onServiceSelect={handleServiceSelect}
              onBackClick={handleBackToSubcategories}
            />
          } 
        />
        <Route 
          path="/:categorySlug/:subcategorySlug/:serviceSlug" 
          element={
            <DynamicForm 
              service={selectedService}
              onBackClick={() => navigate(`/services2/${selectedCategory?.slug}/${selectedSubcategory?.slug}`)}
            />
          } 
        />
      </Routes>
    </div>
  );
};

export default ServicesPage2; 