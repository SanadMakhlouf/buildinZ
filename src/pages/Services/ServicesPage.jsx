import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import MainContent from './MainContent';
import dataService from '../../services/dataService';
import './ServicesPage.css';

const ServicesPage = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Load categories from the data service
    const loadedCategories = dataService.getCategories();
    setCategories(loadedCategories);
    
    // Check if there's a category in the URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('category');
    
    if (categoryId) {
      const category = loadedCategories.find(c => c.id === parseInt(categoryId));
      if (category) {
        setSelectedCategory(category);
        // If category has services, select the first one
        const services = dataService.getServicesByCategory(category.id);
        if (services.length > 0) {
          setSelectedService(services[0]);
        }
      }
    }
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Reset selected service when category changes
    setSelectedService(null);
  };

  return (
    <div className="services-page">
      <div className="services-container">
        <Sidebar 
          categories={categories} 
          onServiceSelect={handleServiceSelect}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
        <MainContent selectedService={selectedService} />
      </div>
    </div>
  );
};

export default ServicesPage; 