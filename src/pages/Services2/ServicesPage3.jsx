import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSpinner, 
  faLayerGroup, 
  faArrowLeft,
  faHeart,
  faPlus,
  faImage,
  faSearch,
  faTimes,
  faShoppingCart,
  faCalculator
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from "framer-motion";
import "./ServicesPage3.css";
import serviceBuilderService from '../../services/serviceBuilderService';

const ServicesPage3 = () => {
  // Data states
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sidebar states
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [activeService, setActiveService] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  
  // Service detail states
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [selectedProductCategory, setSelectedProductCategory] = useState('all');
  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  
  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const filtered = categories.filter((category) => {
      // Check if category name matches
      if (category.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }

      // Check if any direct service in category matches
      const hasMatchingDirectService = category.services && category.services.some((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (hasMatchingDirectService) {
        return true;
      }

      // Check if any subcategory matches
      const hasMatchingSubcategory = category.children && category.children.some(
        (subcategory) => {
          if (subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
          }

          // Check if any service in subcategory matches
          return subcategory.services && subcategory.services.some((service) =>
            service.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      );

      return hasMatchingSubcategory;
    });

    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [servicesResponse, categoriesResponse] = await Promise.all([
        serviceBuilderService.getAllServices(),
        serviceBuilderService.getAllCategories()
      ]);

      let services = [];
      if (servicesResponse.success) {
        services = servicesResponse.services || [];
        console.log('Raw services response:', servicesResponse);
      } else {
        console.error('Failed to fetch services:', servicesResponse.message);
      }

      let categories = [];
      if (categoriesResponse.success) {
        categories = categoriesResponse.categories || [];
        console.log('Raw categories response:', categoriesResponse);
        
        const organizedCategories = categories.map(category => {
          let categoryServices = services.filter(service => {
            const match = parseInt(service.category_id) === parseInt(category.id);
            console.log(`Service ${service.id} (${service.name}) category_id: ${service.category_id}, Category ${category.id}: ${match}`);
            return match;
          });
          
          // If no services are mapped by category_id, try to map by name similarity
          if (categoryServices.length === 0) {
            categoryServices = services.filter(service => {
              const serviceName = service.name.toLowerCase();
              const categoryName = category.name.toLowerCase();
              
              // More comprehensive name matching
              if (categoryName.includes('دهان') && (serviceName.includes('دهان') || serviceName.includes('طلاء'))) return true;
              if (categoryName.includes('أرضيات') && (serviceName.includes('بلاط') || serviceName.includes('أرضية') || serviceName.includes('سيراميك'))) return true;
              if (categoryName.includes('مكافحة') && (serviceName.includes('حشرات') || serviceName.includes('مكافحة'))) return true;
              if (categoryName.includes('تنظيف') && (serviceName.includes('تنظيف') || serviceName.includes('غسيل'))) return true;
              if (categoryName.includes('مكيفات') && (serviceName.includes('مكيف') || serviceName.includes('تكييف'))) return true;
              if (categoryName.includes('نوافذ') && (serviceName.includes('نافذة') || serviceName.includes('زجاج'))) return true;
              
              return false;
            });
          }
          
          console.log(`Category ${category.id} (${category.name}) has ${categoryServices.length} services:`, categoryServices);
          
          return {
            ...category,
            children: category.children || [],
            services: categoryServices
          };
        });
        
        console.log('Services from API:', services);
        console.log('Categories from API:', categories);
        console.log('Organized Categories:', organizedCategories);
        
        // Fallback mechanism
        const totalMappedServices = organizedCategories.reduce((total, cat) => total + cat.services.length, 0);
        if (totalMappedServices === 0 && services.length > 0) {
          console.log('No services mapped to categories, creating fallback...');
          const fallbackCategory = {
            id: 'fallback',
            name: 'جميع الخدمات',
            children: [],
            services: services
          };
          setCategories([fallbackCategory]);
          setFilteredCategories([fallbackCategory]);
        } else if (totalMappedServices < services.length) {
          // Some services are mapped, but not all - add unmapped services to fallback
          const mappedServiceIds = new Set();
          organizedCategories.forEach(cat => {
            cat.services.forEach(service => mappedServiceIds.add(service.id));
          });
          
          const unmappedServices = services.filter(service => !mappedServiceIds.has(service.id));
          if (unmappedServices.length > 0) {
            const fallbackCategory = {
              id: 'fallback',
              name: 'خدمات أخرى',
              children: [],
              services: unmappedServices
            };
            const finalCategories = [...organizedCategories, fallbackCategory];
            setCategories(finalCategories);
            setFilteredCategories(finalCategories);
          } else {
            setCategories(organizedCategories);
            setFilteredCategories(organizedCategories);
          }
        } else {
          setCategories(organizedCategories);
          setFilteredCategories(organizedCategories);
        }
      } else {
        console.error('Failed to fetch categories:', categoriesResponse.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setExpandedSubcategory(null);
  };

  const toggleSubcategory = (subcategoryId) => {
    setExpandedSubcategory(expandedSubcategory === subcategoryId ? null : subcategoryId);
  };

  const handleServiceClick = async (service) => {
    try {
      setActiveService(service.id);
      setSelectedService(service);
      setSelectedSubcategory(service.subcategory || null);
      
      const response = await serviceBuilderService.getServiceById(service.id);
      
      if (response.success) {
        const detailedService = response.service;
        console.log('Detailed service response:', detailedService);
        console.log('Service products structure:', {
          products: detailedService.products,
          productsByTag: detailedService.productsByTag,
          productsWithoutTags: detailedService.productsWithoutTags
        });
        setSelectedService(detailedService);
        
        const initialValues = {};
        if (detailedService.fields) {
          detailedService.fields.forEach(field => {
            if (field.type === 'number') {
              initialValues[field.id] = { value: '', type: field.type };
            } else if (field.options && field.options.length > 0) {
              initialValues[field.id] = { option_id: null, type: field.type };
            }
          });
        }
        setFieldValues(initialValues);
        setSelectedProducts([]);
        setCalculation(null);
        setCalculationError(null);
        setSelectedProductCategory('all');
      } else {
        console.error('Failed to fetch service details:', response.message);
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
    }
  };

  const resetServiceStates = () => {
    setSelectedProducts([]);
    setFieldValues({});
    setCalculation(null);
    setCalculationError(null);
    setSelectedProductCategory('all');
    setSelectedSubcategory(null);
  };

  const handleFieldValueChange = (fieldId, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: { value, type: 'number' }
    }));
  };

  const handleOptionSelect = (fieldId, optionId) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: { option_id: optionId, type: 'option' }
    }));
  };

  const handleProductSelect = (productId, quantity = 1) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.id === productId);
      if (existing) {
        return prev.map(p => 
          p.id === productId 
            ? { ...p, quantity: p.quantity + quantity }
            : p
        );
      } else {
        // Find product in different possible locations
        let product = null;
        
        // Check in productsByTag
        if (selectedService.productsByTag) {
          for (const tagGroup of selectedService.productsByTag) {
            product = tagGroup.products.find(p => p.id === productId);
            if (product) break;
          }
        }
        
        // Check in productsWithoutTags
        if (!product && selectedService.productsWithoutTags) {
          product = selectedService.productsWithoutTags.find(p => p.id === productId);
        }
        
        // Check in simple products array
        if (!product && selectedService.products) {
          product = selectedService.products.find(p => p.id === productId);
        }
        
        if (product) {
          return [...prev, { ...product, quantity }];
        }
        
        return prev;
      }
    });
  };

  const handleProductQuantityChange = (productId, quantity) => {
    if (quantity <= 0) {
      setSelectedProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      setSelectedProducts(prev => 
        prev.map(p => p.id === productId ? { ...p, quantity } : p)
      );
    }
  };

  const handleCalculatePrice = async () => {
    try {
      setCalculating(true);
      setCalculationError(null);

      const calculationData = {
        service_id: selectedService.id,
        field_values: fieldValues,
        selected_products: selectedProducts.map(p => ({
          product_id: p.id,
          quantity: p.quantity
        }))
      };

      const response = await serviceBuilderService.calculatePrice(calculationData);
      
      if (response.success) {
        setCalculation(response.calculation);
        setShowBookingModal(true);
      } else {
        setCalculationError(response.message || 'حدث خطأ أثناء حساب السعر');
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      setCalculationError('حدث خطأ أثناء حساب السعر');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      
      const orderData = {
        service_id: selectedService.id,
        field_values: fieldValues,
        selected_products: selectedProducts.map(p => ({
          product_id: p.id,
          quantity: p.quantity
        })),
        customer_info: orderFormData,
        calculation: calculation
      };

      const response = await serviceBuilderService.submitOrder(orderData);
      
      if (response.success) {
        setOrderSuccess(true);
        setShowBookingModal(false);
      } else {
        setCalculationError(response.message || 'حدث خطأ أثناء إرسال الطلب');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      setCalculationError('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const getProductsByCategory = () => {
    if (!selectedService) return {};
    
    const grouped = {};
    
    // Handle products with tags (like ServicesPage2)
    if (selectedService.productsByTag) {
      selectedService.productsByTag.forEach(tagGroup => {
        const category = tagGroup.tag.name;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(...tagGroup.products);
      });
    }
    
    // Handle products without tags
    if (selectedService.productsWithoutTags && selectedService.productsWithoutTags.length > 0) {
      const category = 'منتجات إضافية';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(...selectedService.productsWithoutTags);
    }
    
    // Handle simple products array (fallback)
    if (selectedService.products && selectedService.products.length > 0) {
      const category = 'منتجات الخدمة';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(...selectedService.products);
    }
    
    return grouped;
  };

  const getSelectedProduct = (productId) => {
    return selectedProducts.find(p => p.id === productId);
  };

  const getTotalPrice = () => {
    return selectedProducts.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  const getSelectedProductsCount = () => {
    return selectedProducts.reduce((total, product) => total + product.quantity, 0);
  };

  // Animation variants
  const categoryVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
  };

  if (loading) {
    return (
      <div className="services-page3">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" />
          <p>جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="services-page3">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchData} className="retry-button">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="services-page3">
        <div className="order-success">
          <div className="success-icon">
            <FontAwesomeIcon icon={faHeart} />
          </div>
          <h2>تم إرسال طلبك بنجاح!</h2>
          <p>سنقوم بالتواصل معك قريباً لتأكيد الطلب</p>
          <p>رقم الطلب: {Date.now()}</p>
          <div className="success-actions">
            <button 
              className="primary-button" 
              onClick={() => {
                setOrderSuccess(false);
                setSelectedService(null);
                setActiveService(null);
                resetServiceStates();
              }}
            >
              العودة للخدمات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="services-page3">
      <div className="services-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>حاسبة التكاليف</h2>
            <div className="search-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                placeholder="بحث في الخدمات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchTerm("")}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </div>

          <div className="categories-list">
            {filteredCategories.map((category) => (
              <div key={category.id} className="category">
                <motion.div
                  className={`category-header ${
                    expandedCategory === category.id ? "expanded" : ""
                  }`}
                  onClick={() => toggleCategory(category.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="category-icon-container">
                    {(category.preview_image_url || category.image_path) ? (
                      <img 
                        src={serviceBuilderService.getImageUrl(category.preview_image_url || category.image_path)} 
                        alt={category.name}
                        className="category-icon-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <span className="category-icon">
                        <FontAwesomeIcon icon={faLayerGroup} />
                      </span>
                    )}
                  </div>
                  <span className="category-name">{category.name}</span>
                  <motion.span
                    className="category-arrow"
                    animate={{ rotate: expandedCategory === category.id ? 90 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ❯
                  </motion.span>
                </motion.div>

                <AnimatePresence>
                  {expandedCategory === category.id && (
                    <motion.div
                      className="subcategories-list"
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={categoryVariants}
                    >
                      {category.children && category.children.map((subcategory) => (
                        <motion.div
                          key={subcategory.id}
                          className="subcategory"
                          variants={itemVariants}
                        >
                          <motion.div
                            className={`subcategory-header ${
                              expandedSubcategory === subcategory.id
                                ? "expanded"
                                : ""
                            }`}
                            onClick={() => toggleSubcategory(subcategory.id)}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="subcategory-name">
                              {subcategory.name}
                            </span>
                            <motion.span
                              className="subcategory-arrow"
                              animate={{
                                rotate: expandedSubcategory === subcategory.id ? 90 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              ❯
                            </motion.span>
                          </motion.div>

                          <AnimatePresence>
                            {expandedSubcategory === subcategory.id && (
                              <motion.div
                                className="services-list"
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={categoryVariants}
                              >
                                {subcategory.services && subcategory.services.length > 0 ? (
                                  subcategory.services.map((service) => (
                                    <motion.div
                                      key={service.id}
                                      className={`service-item ${
                                        activeService === service.id ? "active" : ""
                                      }`}
                                      onClick={() => handleServiceClick(service)}
                                      variants={itemVariants}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <div className="service-content">
                                        <div className="service-name">{service.name}</div>
                                        {service.description && (
                                          <div className="service-description">
                                            {service.description}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  ))
                                ) : (
                                  <div className="no-services">
                                    لا توجد خدمات متاحة في هذا التصنيف الفرعي
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}

                      {/* Direct services in category */}
                      {category.services && category.services.length > 0 && (
                        <motion.div
                          className="services-list"
                          variants={itemVariants}
                        >
                          {category.services.map((service) => (
                            <motion.div
                              key={service.id}
                              className={`service-item ${
                                activeService === service.id ? "active" : ""
                              }`}
                              onClick={() => handleServiceClick(service)}
                              variants={itemVariants}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="service-content">
                                <div className="service-name">{service.name}</div>
                                {service.description && (
                                  <div className="service-description">
                                    {service.description}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="no-results">
                <p>لا توجد نتائج مطابقة للبحث</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {selectedService ? (
            // Service Detail View
            <div className="service-detail-page">
              {/* Header */}
              <div className="service-header">
                <div className="header-content">
                  <div className="header-left">
                    <button className="back-button" onClick={() => {
                      setSelectedService(null);
                      setActiveService(null);
                      resetServiceStates();
                    }}>
                      <FontAwesomeIcon icon={faArrowLeft} />
                      رجوع
                    </button>
                    <div className="step-indicator">
                      <span className="step-text">الخطوة 1 من 3</span>
                    </div>
                    <h1>{selectedService?.name}</h1>
                    <p className="service-description">{selectedService?.description}</p>
                  </div>
                  <div className="header-right">
                    <button className="favorite-button">
                      <FontAwesomeIcon icon={faHeart} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="service-content">
                {/* Main Content */}
                <div className="service-main">
                  {/* Category Filters */}
                  <div className="category-filters">
                    <div className="filter-buttons">
                      <button 
                        className={`filter-btn ${selectedProductCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedProductCategory('all')}
                      >
                        جميع الخيارات
                      </button>
                      {Object.keys(getProductsByCategory()).map(category => (
                        <button 
                          key={category}
                          className={`filter-btn ${selectedProductCategory === category ? 'active' : ''}`}
                          onClick={() => setSelectedProductCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Layout for Fields and Products */}
                  <div className="main-content-wrapper">
                    {/* Fields Section - Always show */}
                    <div className="fields-section">
                      <h2>اختر الخيارات المناسبة</h2>
                      <div className="fields-container">
                        {selectedService?.fields && selectedService.fields.length > 0 ? (
                          selectedService.fields.map(field => (
                            <div key={field.id} className="field-item">
                              <h3>
                                {field.required && <span className="required">*</span>}
                                {field.label}
                              </h3>
                              {field.description && (
                                <p className="field-description">{field.description}</p>
                              )}
                              
                              {field.type === 'number' ? (
                                <div className="number-input-container">
                                  <input
                                    type="number"
                                    className="number-input"
                                    placeholder={`أدخل ${field.label}`}
                                    min={field.min_value}
                                    max={field.max_value}
                                    step={field.step}
                                    value={fieldValues[field.id]?.value || ''}
                                    onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                                  />
                                  {field.unit && <span className="unit-label">{field.unit}</span>}
                                </div>
                              ) : field.options && field.options.length > 0 ? (
                                <div className="field-options">
                                  {field.options.map(option => (
                                    <div
                                      key={option.id}
                                      className={`option-card ${fieldValues[field.id]?.option_id === option.id ? 'selected' : ''}`}
                                      onClick={() => handleOptionSelect(field.id, option.id)}
                                    >
                                      {option.image_path ? (
                                        <div className="option-image">
                                          <img 
                                            src={serviceBuilderService.getImageUrl(option.image_path)} 
                                            alt={option.label}
                                            onError={(e) => e.target.style.display = 'none'}
                                          />
                                        </div>
                                      ) : (
                                        <div className="option-placeholder">
                                          <FontAwesomeIcon icon={faImage} />
                                        </div>
                                      )}
                                      <div className="option-content">
                                        <h4>{option.label}</h4>
                                        {option.price_modifier && (
                                          <span className="price-adjustment">
                                            {option.price_modifier > 0 ? '+' : ''}{option.price_modifier} درهم
                                          </span>
                                        )}
                                      </div>
                                      {fieldValues[field.id]?.option_id === option.id && (
                                        <div className="selected-indicator">
                                          <FontAwesomeIcon icon={faPlus} />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="no-options">
                                  لا توجد خيارات متاحة لهذا الحقل
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="no-fields">
                            <p>لا توجد خيارات متاحة لهذه الخدمة</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Products Section - Always show */}
                    <div className="products-section">
                      <h2>اختر المنتجات</h2>
                      {(() => {
                        const productsByCategory = getProductsByCategory();
                        if (Object.keys(productsByCategory).length > 0) {
                          return Object.entries(productsByCategory).map(([category, products]) => (
                            <div key={category} className="products-by-category">
                              <h3 className="category-title">{category}</h3>
                              <div className="products-grid">
                                {products.map(product => {
                                  const selectedProduct = getSelectedProduct(product.id);
                                  return (
                                    <div
                                      key={product.id}
                                      className={`product-card ${selectedProduct ? 'selected' : ''}`}
                                      onClick={() => handleProductSelect(product.id, 1)}
                                    >
                                      <div className="product-image">
                                        {product.image_url ? (
                                          <img 
                                            src={product.image_url} 
                                            alt={product.name}
                                            onError={(e) => e.target.style.display = 'none'}
                                          />
                                        ) : (
                                          <div className="product-placeholder">
                                            <FontAwesomeIcon icon={faImage} />
                                          </div>
                                        )}
                                      </div>
                                      <div className="product-content">
                                        <h4>{product.name}</h4>
                                        <div className="product-price">{product.price} درهم</div>
                                        {product.description && (
                                          <div className="product-description">{product.description}</div>
                                        )}
                                      </div>
                                      <div className="product-actions">
                                        {selectedProduct ? (
                                          <div className="quantity-selector">
                                            <label>الكمية:</label>
                                            <input
                                              type="number"
                                              min="1"
                                              value={selectedProduct.quantity}
                                              onChange={(e) => handleProductQuantityChange(product.id, parseInt(e.target.value) || 0)}
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                          </div>
                                        ) : (
                                          <button className="add-product-btn">
                                            <FontAwesomeIcon icon={faPlus} />
                                            إضافة
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ));
                        } else {
                          return (
                            <div className="no-products">
                              <p>لا توجد منتجات متاحة لهذه الخدمة</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Calculate Section */}
                  <div className="calculate-section">
                    <button 
                      className="calculate-button"
                      onClick={handleCalculatePrice}
                      disabled={calculating || getSelectedProductsCount() === 0}
                    >
                      {calculating ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} spin />
                          جاري الحساب...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faCalculator} />
                          احسب السعر
                        </>
                      )}
                    </button>
                    
                    {calculationError && (
                      <div className="calculation-error">
                        <FontAwesomeIcon icon={faTimes} />
                        {calculationError}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Welcome State
            <div className="welcome-state">
              <div className="welcome-content">
                <div className="welcome-icon">
                  <FontAwesomeIcon icon={faCalculator} />
                </div>
                <h1>حاسبة التكاليف الذكية</h1>
                <p>اختر الخدمة المطلوبة من القائمة الجانبية واحصل على عرض سعر دقيق ومفصل</p>
                <div className="welcome-features">
                  <div className="feature">
                    <FontAwesomeIcon icon={faLayerGroup} />
                    <span>خدمات متنوعة ومتخصصة</span>
                  </div>
                  <div className="feature">
                    <FontAwesomeIcon icon={faCalculator} />
                    <span>حساب دقيق للأسعار</span>
                  </div>
                  <div className="feature">
                    <FontAwesomeIcon icon={faShoppingCart} />
                    <span>طلب سريع وسهل</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && calculation && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>تفاصيل الطلب</h2>
              <button 
                className="close-button"
                onClick={() => setShowBookingModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="calculation-summary">
                <h3>ملخص الحساب</h3>
                <div className="summary-item">
                  <span>سعر الخدمة:</span>
                  <span>{calculation.service_price} درهم</span>
                </div>
                <div className="summary-item">
                  <span>سعر المنتجات:</span>
                  <span>{calculation.products_price} درهم</span>
                </div>
                <div className="summary-item total">
                  <span>السعر الإجمالي:</span>
                  <span>{calculation.total_price} درهم</span>
                </div>
              </div>

              <div className="customer-form">
                <h3>معلومات العميل</h3>
                <div className="form-group">
                  <label>الاسم الكامل *</label>
                  <input
                    type="text"
                    value={orderFormData.name}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="أدخل اسمك الكامل"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>رقم الهاتف *</label>
                  <input
                    type="tel"
                    value={orderFormData.phone}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="أدخل رقم الهاتف"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={orderFormData.email}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
                <div className="form-group">
                  <label>ملاحظات إضافية</label>
                  <textarea
                    value={orderFormData.notes}
                    onChange={(e) => setOrderFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="أي ملاحظات إضافية..."
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-button"
                onClick={() => setShowBookingModal(false)}
              >
                إلغاء
              </button>
              <button 
                className="submit-button"
                onClick={handleSubmitOrder}
                disabled={submitting || !orderFormData.name || !orderFormData.phone}
              >
                {submitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    جاري الإرسال...
                  </>
                ) : (
                  'إرسال الطلب'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage3;