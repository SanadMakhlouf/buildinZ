import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { calculatePrice } from "../../data/services2Data";
import "./DynamicForm.css";

const DynamicForm = ({ service, onBackClick }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (service) {
      // Initialize form data with default values
      const initialData = {};
      service.formSchema.steps.forEach(step => {
        if (step.type === 'toggle') {
          initialData[step.field] = false;
        } else if (step.type === 'select' && step.options && step.options.length > 0) {
          initialData[step.field] = step.options[0].value || step.options[0].label;
        } else if (step.type === 'color-picker') {
          initialData[step.field] = step.defaultColor || '#FFFFFF';
        }
      });
      setFormData(initialData);
    }
  }, [service]);

  useEffect(() => {
    if (service) {
      const price = calculatePrice(service, formData);
      setTotalPrice(price);
    }
  }, [service, formData]);

  if (!service) return null;

  const steps = service.formSchema.steps;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock submission to API
      console.log('Submitting form data:', {
        serviceId: service.id,
        serviceName: service.name,
        formData,
        totalPrice
      });
      
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFormField = (step) => {
    const { type, field, label, options, min, placeholder, defaultColor } = step;
    
    switch (type) {
      case 'image-select':
        return (
          <div className="image-select-field">
            <label>{label}</label>
            <div className="image-options">
              {options.map((option) => (
                <div
                  key={option.label}
                  className={`image-option ${formData[field] === option.label ? 'selected' : ''}`}
                  onClick={() => handleInputChange(field, option.label)}
                >
                  <div className="image-container">
                    <img src={option.image} alt={option.label} />
                  </div>
                  <div className="option-label">
                    <span>{option.label}</span>
                    <span className="option-price">
                      {option.pricePerM2 ? `${option.pricePerM2} درهم / م²` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'number':
        return (
          <div className="number-field">
            <label>{label}</label>
            <div className="number-input-container">
              <input
                type="number"
                min={min || 0}
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, parseFloat(e.target.value) || 0)}
                placeholder={placeholder || ''}
              />
              {step.unit && <span className="input-unit">{step.unit}</span>}
            </div>
          </div>
        );
        
      case 'toggle':
        return (
          <div className="toggle-field">
            <label>{label}</label>
            <div className="toggle-options">
              <button
                type="button"
                className={`toggle-option ${formData[field] === true ? 'selected' : ''}`}
                onClick={() => handleInputChange(field, true)}
              >
                {step.yesLabel || 'نعم'}
              </button>
              <button
                type="button"
                className={`toggle-option ${formData[field] === false ? 'selected' : ''}`}
                onClick={() => handleInputChange(field, false)}
              >
                {step.noLabel || 'لا'}
              </button>
            </div>
          </div>
        );
        
      case 'select':
        return (
          <div className="select-field">
            <label>{label}</label>
            <select
              value={formData[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
            >
              {options.map((option) => (
                <option key={option.value || option.label} value={option.value || option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
        
      case 'color-picker':
        return (
          <div className="color-field">
            <label>{label}</label>
            <div className="color-picker-container">
              <input
                type="color"
                value={formData[field] || defaultColor || '#FFFFFF'}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
              <span className="color-value">{formData[field] || defaultColor || '#FFFFFF'}</span>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const isCurrentStepValid = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return true;
    
    const value = formData[currentStepData.field];
    
    if (currentStepData.type === 'number' && currentStepData.required !== false) {
      return value !== undefined && value !== null && !isNaN(value);
    }
    
    if (currentStepData.required !== false) {
      return value !== undefined && value !== null && value !== '';
    }
    
    return true;
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="dynamic-form-page">
      <div className="dynamic-form-header">
        <button className="back-button" onClick={onBackClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          عودة للخدمات
        </button>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="page-title">{service.formSchema.title}</h1>
        </motion.div>
      </div>

      <div className="form-container">
        {showSuccess ? (
          <motion.div
            className="success-message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="success-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>تم إرسال طلبك بنجاح!</h2>
            <p>سيقوم فريقنا بالتواصل معك قريباً لتأكيد التفاصيل.</p>
            <motion.button
              className="back-to-services"
              onClick={onBackClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              العودة للخدمات
            </motion.button>
          </motion.div>
        ) : (
          <>
            <div className="form-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="progress-steps">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`progress-step ${
                      index === currentStep
                        ? 'active'
                        : index < currentStep
                        ? 'completed'
                        : ''
                    }`}
                  >
                    {index < currentStep ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-content">
              <div className="form-step-container">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="form-step"
                  >
                    {renderFormField(steps[currentStep])}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="price-summary">
                <div className="price-card">
                  <div className="price-header">
                    <h3>ملخص الطلب</h3>
                  </div>
                  <div className="price-details">
                    <div className="service-name-summary">
                      <span>الخدمة:</span>
                      <span>{service.name}</span>
                    </div>
                    
                    {Object.entries(formData).map(([key, value]) => {
                      const step = steps.find(s => s.field === key);
                      if (!step) return null;
                      
                      let displayValue = value;
                      
                      if (step.type === 'toggle') {
                        displayValue = value ? (step.yesLabel || 'نعم') : (step.noLabel || 'لا');
                      } else if (step.type === 'select') {
                        const option = step.options.find(o => (o.value || o.label) === value);
                        if (option) displayValue = option.label;
                      } else if (step.type === 'image-select') {
                        displayValue = value;
                      }
                      
                      return (
                        <div key={key} className="form-data-summary">
                          <span>{step.label}:</span>
                          <span>{displayValue}</span>
                        </div>
                      );
                    })}
                    
                    <div className="total-price">
                      <span>التكلفة الإجمالية:</span>
                      <span>{totalPrice} درهم</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="form-actions">
              {currentStep > 0 && (
                <motion.button
                  type="button"
                  className="prev-button"
                  onClick={handlePrev}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  السابق
                </motion.button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <motion.button
                  type="button"
                  className="next-button"
                  onClick={handleNext}
                  disabled={!isCurrentStepValid()}
                  whileHover={{ scale: isCurrentStepValid() ? 1.05 : 1 }}
                  whileTap={{ scale: isCurrentStepValid() ? 0.95 : 1 }}
                >
                  التالي
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  className="submit-button"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isCurrentStepValid()}
                  whileHover={{ scale: !isSubmitting && isCurrentStepValid() ? 1.05 : 1 }}
                  whileTap={{ scale: !isSubmitting && isCurrentStepValid() ? 0.95 : 1 }}
                >
                  {isSubmitting ? (
                    <div className="spinner"></div>
                  ) : (
                    "إرسال الطلب"
                  )}
                </motion.button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DynamicForm; 