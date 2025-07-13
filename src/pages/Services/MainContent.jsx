import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainContent.css";
import * as dataService from "../../services/dataService";
import * as bookingService from "../../services/bookingService";
import { evaluateFormula } from "../../utils/formulaUtils";
import {
  Description,
  Settings,
  Assessment,
  Calculate,
  TouchApp,
  Info,
  Brush,
  Construction,
  ElectricalServices,
  Close,
  CheckCircle,
  List,
  ArrowBack,
  ArrowForward,
  BookOnline,
} from "@mui/icons-material";

const MainContent = ({ selectedService }) => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({});
  const [currentGenerator, setCurrentGenerator] = useState(null);
  const [derivedInputs, setDerivedInputs] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    emirate: "",
    area: "",
    street: "",
    building: "",
    apartment: "",
    additionalNotes: "",
  });
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Load products and generator when service changes
  useEffect(() => {
    const initializeService = async () => {
      if (selectedService) {
        console.log("Selected service:", selectedService);

        try {
          // Load generator
          const generator = dataService.getGeneratorById(
            selectedService.foreign_key_generator
          );
          console.log("Generator found:", generator);
          setCurrentGenerator(generator);

          // Load products
          const allProducts = dataService.getProducts();
          const serviceProducts = allProducts.filter((product) =>
            generator.inputs.some(
              (input) =>
                input.option_type === "product" &&
                input.options.includes(product.id)
            )
          );
          setProducts(serviceProducts);
          console.log("Service products:", serviceProducts);
        } catch (error) {
          console.error("Error initializing service:", error);
        }
      }
    };

    initializeService();
  }, [selectedService]);

  // Handle input changes
  const handleInputChange = async (inputName, value) => {
    console.log(`Changing input ${inputName} to:`, value);

    const newInputs = { ...inputs, [inputName]: value };
    setInputs(newInputs);

    // Calculate derived values
    if (
      currentGenerator &&
      currentGenerator.formulas &&
      currentGenerator.formulas.derived_inputs
    ) {
      setIsCalculating(true);
      try {
        const newDerivedInputs = {};

        // Ajouter les variables pour les calculs
        const variables = {
          ...newInputs,
          price_unit: selectedService.price_unit,
        };

        // Ajouter les prix des produits si nécessaire
        if (currentGenerator.inputs) {
          for (const input of currentGenerator.inputs) {
            if (input.option_type === "product" && newInputs[input.name]) {
              const productId = newInputs[input.name];
              const product = dataService.getProductById(productId);
              if (product) {
                variables[`${input.name}_price`] = product.price;
                variables[`${input.name}_coverage`] = product.coverage || 1;
              }
            }
          }
        }

        console.log("Calculation variables:", variables);

        // Calculer les valeurs dérivées
        for (const derivedInput of currentGenerator.formulas.derived_inputs) {
          try {
            const result = evaluateFormula(derivedInput.formula, variables);
            newDerivedInputs[derivedInput.name] = result;
            console.log(`Calculated ${derivedInput.name}:`, result);
          } catch (error) {
            console.error(`Error calculating ${derivedInput.name}:`, error);
          }
        }

        // Calculer les coûts
        if (currentGenerator.formulas.pricing) {
          newDerivedInputs.totalCost = evaluateFormula(
            currentGenerator.formulas.pricing.formula,
            variables
          );
        }

        if (currentGenerator.formulas.labor) {
          newDerivedInputs.laborCost = evaluateFormula(
            currentGenerator.formulas.labor.formula,
            variables
          );
        }

        if (currentGenerator.formulas.materials) {
          newDerivedInputs.materialCost = evaluateFormula(
            currentGenerator.formulas.materials.formula,
            variables
          );
        }

        setDerivedInputs(newDerivedInputs);
      } catch (error) {
        console.error("Error calculating derived values:", error);
      }
      setIsCalculating(false);
    }
  };

  // Handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setShowCalculator(true);

    // Initialize inputs with the selected product
    if (currentGenerator?.inputs) {
      const initialInputs = {};
      currentGenerator.inputs.forEach((input) => {
        if (input.option_type === "product") {
          initialInputs[input.name] = product.id;
        } else {
          initialInputs[input.name] = input.default || "";
        }
      });
      setInputs(initialInputs);
    }
  };

  // Check if all required inputs are filled
  const areAllInputsFilled = () => {
    if (!currentGenerator || !currentGenerator.inputs) return false;

    return currentGenerator.inputs.every((input) => {
      // Skip optional inputs
      if (input.optional) return true;

      const value = inputs[input.name];
      if (value === undefined || value === "") return false;
      if (input.type === "number" && isNaN(value)) return false;
      return true;
    });
  };

  // Handle booking form input changes
  const handleBookingFormChange = (field, value) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    // Créer l'objet de réservation
    const bookingData = {
      customerDetails: bookingForm,
      serviceDetails: {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        inputs: inputs,
        calculations: {
          derivedInputs,
          totalCost: derivedInputs.totalCost || 0,
          laborCost: derivedInputs.laborCost || 0,
          materialCost: derivedInputs.materialCost || 0,
        },
      },
    };

    // Sauvegarder la réservation
    const result = await bookingService.saveBooking(bookingData);

    if (result.success) {
      // Réinitialiser le formulaire
      setBookingForm({
        fullName: "",
        email: "",
        phone: "",
        emirate: "",
        area: "",
        street: "",
        building: "",
        apartment: "",
        additionalNotes: "",
      });

      // Afficher le message de succès
      setShowSuccessMessage(true);

      // Attendre 2 secondes avant de rediriger
      setTimeout(() => {
        setShowBookingModal(false);
        setShowSuccessMessage(false);
        // Rediriger vers la page d'accueil
        navigate("/");
      }, 2000);
    } else {
      // Gérer l'erreur (vous pouvez ajouter un état pour afficher les erreurs)
      console.error("Error saving booking:", result.error);
    }
  };

  // Handle booking button click
  const handleBooking = () => {
    setShowBookingModal(true);
  };

  // Group inputs into three parts
  const inputGroups = (() => {
    if (!currentGenerator || !currentGenerator.inputs) return [[], [], []];
    const total = currentGenerator.inputs.length;
    const perGroup = Math.ceil(total / 3);
    return [
      currentGenerator.inputs.slice(0, perGroup),
      currentGenerator.inputs.slice(perGroup, perGroup * 2),
      currentGenerator.inputs.slice(perGroup * 2),
    ];
  })();

  // Calculate total cost
  const totalCost = derivedInputs.totalCost || 0;

  // Format currency
  const formatCurrency = (amount) => {
    return `${amount.toLocaleString("en-US")} درهم إماراتي`;
  };

  // Render when no service is selected
  const renderNoServiceSelected = () => {
    return (
      <div className="no-service-selected">
        <div className="empty-state-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M70 20H10C6.68629 20 4 22.6863 4 26V64C4 67.3137 6.68629 70 10 70H70C73.3137 70 76 67.3137 76 64V26C76 22.6863 73.3137 20 70 20Z" stroke="#0A3259" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M25 20V13.3333C25 11.5652 25.7024 9.86953 26.9526 8.61929C28.2029 7.36905 29.8986 6.66666 31.6667 6.66666H48.3333C50.1014 6.66666 51.7971 7.36905 53.0474 8.61929C54.2976 9.86953 55 11.5652 55 13.3333V20" stroke="#0A3259" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M40 36.6667V53.3334" stroke="#0A3259" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M31.6667 45H48.3334" stroke="#0A3259" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <h2>اختر خدمة للبدء</h2>
        <p>يرجى اختيار خدمة من القائمة الجانبية لعرض التفاصيل وحساب التكلفة</p>
        
        <div className="sidebar-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke="#0A3259" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 5L19 12L12 19" stroke="#0A3259" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    );
  };

  // If no service is selected, show the placeholder
  if (!selectedService) {
    return (
      <div className="main-content">
        {renderNoServiceSelected()}
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Products Grid */}
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.image || "https://via.placeholder.com/200"}
              alt={product.name}
              className="product-image"
            />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">
                {formatCurrency(product.price)}
                {product.coverage && (
                  <span className="coverage-info">
                    {" "}
                    • تغطية {product.coverage} م²/علبة
                  </span>
                )}
              </p>
              <button
                className="calculate-button"
                onClick={() => handleProductSelect(product)}
              >
                <Calculate /> حساب التكلفة
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Calculator Modal */}
      {showCalculator && selectedProduct && currentGenerator && (
        <div className="calculator-modal-overlay">
          <div className="calculator-modal">
            <div className="calculator-header">
              <h2>حاسبة التكلفة - {selectedProduct.name}</h2>
              <button
                className="close-button"
                onClick={() => {
                  setShowCalculator(false);
                  setSelectedProduct(null);
                  setInputs({});
                  setDerivedInputs({});
                }}
              >
                <Close />
              </button>
            </div>

            <div className="calculator-content">
              {/* Product Summary */}
              <div className="product-summary">
                <img
                  src={
                    selectedProduct.image || "https://via.placeholder.com/100"
                  }
                  alt={selectedProduct.name}
                  className="product-thumbnail"
                />
                <div className="product-details">
                  <h3>{selectedProduct.name}</h3>
                  <p className="product-base-price">
                    السعر الأساسي: {formatCurrency(selectedProduct.price)}
                    {selectedProduct.coverage && (
                      <span className="coverage-info">
                        {" "}
                        • تغطية {selectedProduct.coverage} م²/علبة
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Calculator Form */}
              <div className="calculator-form">
                {currentGenerator.inputs.map(
                  (input) =>
                    input.option_type !== "product" && (
                      <div key={input.id} className="input-group">
                        <label className="input-label">
                          {input.label}
                          {input.unit && (
                            <span className="unit-badge">{input.unit}</span>
                          )}
                        </label>
                        {input.type === "select" ? (
                          <select
                            className="input-field"
                            value={inputs[input.name] || ""}
                            onChange={(e) =>
                              handleInputChange(input.name, e.target.value)
                            }
                          >
                            <option value="">اختر...</option>
                            {input.option_type === "condition"
                              ? input.options.map((optionId) => {
                                  const condition =
                                    dataService.getConditionById(optionId);
                                  return (
                                    <option key={optionId} value={optionId}>
                                      {condition
                                        ? condition.name
                                        : `حالة ${optionId}`}
                                    </option>
                                  );
                                })
                              : input.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                          </select>
                        ) : input.type === "boolean" ? (
                          <div className="switch-wrapper">
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={!!inputs[input.name]}
                                onChange={(e) =>
                                  handleInputChange(
                                    input.name,
                                    e.target.checked
                                  )
                                }
                              />
                              <span className="slider"></span>
                              <span className="switch-text">
                                {!!inputs[input.name] ? "نعم" : "لا"}
                              </span>
                            </label>
                          </div>
                        ) : (
                          <input
                            type={input.type || "text"}
                            className="input-field"
                            value={inputs[input.name] || ""}
                            onChange={(e) => {
                              const value =
                                input.type === "number"
                                  ? parseFloat(e.target.value) || 0
                                  : e.target.value;
                              handleInputChange(input.name, value);
                            }}
                            placeholder={input.placeholder || "0"}
                          />
                        )}
                      </div>
                    )
                )}
              </div>

              {/* Calculation Results */}
              <div className="calculation-results">
                {isCalculating ? (
                  <div className="calculating-indicator">
                    <div className="spinner"></div>
                    <p>جاري الحساب...</p>
                  </div>
                ) : (
                  <>
                    <div className="total-cost">
                      <h3>التكلفة الإجمالية</h3>
                      <p>{formatCurrency(derivedInputs.totalCost || 0)}</p>
                    </div>
                    <div className="cost-breakdown">
                      <div className="cost-item">
                        <span>تكلفة العمالة:</span>
                        <span>
                          {formatCurrency(derivedInputs.laborCost || 0)}
                        </span>
                      </div>
                      <div className="cost-item">
                        <span>تكلفة المواد:</span>
                        <span>
                          {formatCurrency(derivedInputs.materialCost || 0)}
                        </span>
                      </div>
                    </div>
                    {currentGenerator.formulas.derived_inputs.map((item) => (
                      <div key={item.name} className="derived-value">
                        <span>{item.label}:</span>
                        <span>
                          {derivedInputs[item.name] !== undefined
                            ? `${derivedInputs[item.name].toLocaleString(
                                "en-US"
                              )} ${item.unit || ""}`
                            : "0"}
                        </span>
                      </div>
                    ))}
                    <button
                      className="booking-button"
                      onClick={() => {
                        setShowCalculator(false);
                        setShowBookingModal(true);
                      }}
                      disabled={!areAllInputsFilled()}
                    >
                      <BookOnline /> حجز الخدمة
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="booking-modal-header">
              <h2>نموذج الحجز</h2>
              <button
                className="close-button"
                onClick={() => {
                  setShowBookingModal(false);
                  if (selectedProduct) {
                    setShowCalculator(true);
                  }
                }}
              >
                <Close />
              </button>
            </div>

            {showSuccessMessage ? (
              <div className="success-message">
                <CheckCircle className="success-icon" />
                <h3>تم تأكيد الحجز بنجاح!</h3>
                <p>سنتواصل معك قريباً</p>
                <p className="redirect-message">
                  جاري التحويل إلى الصفحة الرئيسية...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="form-group">
                  <label>الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.fullName}
                    onChange={(e) =>
                      handleBookingFormChange("fullName", e.target.value)
                    }
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>

                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={bookingForm.email}
                    onChange={(e) =>
                      handleBookingFormChange("email", e.target.value)
                    }
                    placeholder="example@domain.com"
                    dir="ltr"
                  />
                </div>

                <div className="form-group">
                  <label>رقم الهاتف</label>
                  <input
                    type="tel"
                    required
                    value={bookingForm.phone}
                    onChange={(e) =>
                      handleBookingFormChange("phone", e.target.value)
                    }
                    placeholder="971XX XXXXXXX"
                    dir="ltr"
                  />
                </div>

                <div className="form-group">
                  <label>الإمارة</label>
                  <select
                    required
                    value={bookingForm.emirate}
                    onChange={(e) =>
                      handleBookingFormChange("emirate", e.target.value)
                    }
                  >
                    <option value="">اختر الإمارة</option>
                    <option value="دبي">دبي</option>
                    <option value="أبوظبي">أبوظبي</option>
                    <option value="الشارقة">الشارقة</option>
                    <option value="عجمان">عجمان</option>
                    <option value="رأس الخيمة">رأس الخيمة</option>
                    <option value="أم القيوين">أم القيوين</option>
                    <option value="الفجيرة">الفجيرة</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>المنطقة</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.area}
                    onChange={(e) =>
                      handleBookingFormChange("area", e.target.value)
                    }
                    placeholder="اسم المنطقة"
                  />
                </div>

                <div className="form-group">
                  <label>الشارع</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.street}
                    onChange={(e) =>
                      handleBookingFormChange("street", e.target.value)
                    }
                    placeholder="اسم/رقم الشارع"
                  />
                </div>

                <div className="form-group">
                  <label>المبنى</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.building}
                    onChange={(e) =>
                      handleBookingFormChange("building", e.target.value)
                    }
                    placeholder="اسم/رقم المبنى"
                  />
                </div>

                <div className="form-group">
                  <label>رقم الشقة</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.apartment}
                    onChange={(e) =>
                      handleBookingFormChange("apartment", e.target.value)
                    }
                    placeholder="رقم الشقة/الوحدة"
                  />
                </div>

                <div className="form-group">
                  <label>ملاحظات إضافية</label>
                  <textarea
                    value={bookingForm.additionalNotes}
                    onChange={(e) =>
                      handleBookingFormChange("additionalNotes", e.target.value)
                    }
                    placeholder="أي معلومات إضافية تود إضافتها"
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-button">
                    تأكيد الحجز
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowBookingModal(false)}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
