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
  const [activeStep, setActiveStep] = useState(1);
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

  // Initialize calculator inputs when service changes
  useEffect(() => {
    const initializeInputs = async () => {
      if (selectedService) {
        console.log("Selected service:", selectedService);

        try {
          // Récupérer le générateur
          const generator = dataService.getGeneratorById(
            selectedService.foreign_key_generator
          );
          console.log("Generator found:", generator);

          if (generator) {
            setCurrentGenerator(generator);

            // Initialize inputs with default values from the generator
            const initialInputs = {};
            generator.inputs.forEach((input) => {
              initialInputs[input.name] = input.default || "";
              console.log(
                `Setting input ${input.name} to ${input.default || ""}`
              );
            });
            setInputs(initialInputs);

            // Log pour déboguer
            setDebugInfo({
              selectedService,
              generator,
              initialInputs,
            });
          } else {
            console.error(
              "Generator not found for ID:",
              selectedService.foreign_key_generator
            );
          }
        } catch (error) {
          console.error("Error initializing inputs:", error);
        }
      }
    };

    initializeInputs();
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

  // Handle next step
  const goToNextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    }
  };

  // Handle previous step
  const goToPrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  // Early return if no service is selected
  if (!selectedService) {
    return (
      <div className="empty-state">
        <div className="empty-state-animation">
          <div className="circle-animation"></div>
          <div className="icon-container">
            <TouchApp style={{ fontSize: 50, color: "#0066cc" }} />
          </div>
        </div>
        <h2>اختر خدمة للبدء</h2>
        <p>
          يمكنك اختيار إحدى الخدمات من القائمة على اليمين للبدء في حساب التكلفة
        </p>
        <div className="service-examples">
          <div className="example-service">
            <Brush />
            <span>الدهان والديكور</span>
          </div>
          <div className="example-service">
            <Construction />
            <span>الأرضيات</span>
          </div>
          <div className="example-service">
            <ElectricalServices />
            <span>الكهرباء</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="service-wizard">
        <div className="user-instructions">
          <Info style={{ fontSize: 20, marginLeft: 10 }} />
          <span>
            انقر على أي قسم للتركيز عليه أو مرر المؤشر فوقه لعرض المزيد من
            المعلومات
          </span>
          <TouchApp style={{ fontSize: 20, marginRight: 10 }} />
        </div>

        <div className="content-container">
          {/* First Column - Description */}
          <div
            className={`column ${activeStep === 1 ? "active" : ""}`}
            onClick={() => setActiveStep(1)}
            onMouseEnter={() => !isCalculating && !isMobile && setActiveStep(1)}
          >
            <div className="step-number">1</div>
            <div className="column-header">
              <div className="column-icon">
                <Description />
              </div>
              <h2>الوصف</h2>
            </div>
            <div className="column-content">
              <div className="cost-summary">
                <div className="total-cost">{formatCurrency(totalCost)}</div>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span className="cost-label">تكلفة العمالة</span>
                    <span className="cost-value">
                      {formatCurrency(derivedInputs.laborCost || 0)}
                    </span>
                  </div>
                  <div className="cost-item">
                    <span className="cost-label">تكلفة المواد</span>
                    <span className="cost-value">
                      {formatCurrency(derivedInputs.materialCost || 0)}
                    </span>
                  </div>
                </div>
                {!isMobile && (
                  <button
                    className={`booking-button ${
                      areAllInputsFilled() ? "active" : "disabled"
                    }`}
                    onClick={handleBooking}
                    disabled={!areAllInputsFilled()}
                  >
                    حجز الآن
                  </button>
                )}
              </div>
              <div className="input-groups-container">
                {inputGroups[0].map((input) => (
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
                        onChange={(e) => {
                          const value =
                            input.option_type === "product" ||
                            input.name.includes("_id")
                              ? parseInt(e.target.value)
                              : e.target.value;
                          handleInputChange(input.name, value);
                          setActiveStep(1);
                        }}
                      >
                        <option value="">اختر...</option>
                        {input.option_type === "product"
                          ? input.options.map((optionId) => {
                              const product =
                                dataService.getProductById(optionId);
                              return (
                                <option key={optionId} value={optionId}>
                                  {product ? product.name : `منتج ${optionId}`}
                                </option>
                              );
                            })
                          : input.option_type === "condition"
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
                          : input.options &&
                            input.options.map((option) => (
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
                              handleInputChange(input.name, e.target.checked)
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
                          setActiveStep(1);
                        }}
                        placeholder={input.placeholder || "0"}
                        onClick={() => setActiveStep(1)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second Column - Settings */}
          <div
            className={`column ${activeStep === 2 ? "active" : ""}`}
            onClick={() => setActiveStep(2)}
            onMouseEnter={() => !isCalculating && !isMobile && setActiveStep(2)}
          >
            <div className="step-number">2</div>
            <div className="column-header">
              <div className="column-icon">
                <Settings />
              </div>
              <h2>الإعدادات</h2>
            </div>
            <div className="column-content">
              <div className="input-groups-container">
                {inputGroups[1].map((input) => (
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
                        onChange={(e) => {
                          const value =
                            input.option_type === "product" ||
                            input.name.includes("_id")
                              ? parseInt(e.target.value)
                              : e.target.value;
                          handleInputChange(input.name, value);
                          setActiveStep(2);
                        }}
                      >
                        <option value="">اختر...</option>
                        {input.option_type === "product"
                          ? input.options.map((optionId) => {
                              const product =
                                dataService.getProductById(optionId);
                              return (
                                <option key={optionId} value={optionId}>
                                  {product ? product.name : `منتج ${optionId}`}
                                </option>
                              );
                            })
                          : input.option_type === "condition"
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
                          : input.options &&
                            input.options.map((option) => (
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
                              handleInputChange(input.name, e.target.checked)
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
                          setActiveStep(2);
                        }}
                        placeholder={input.placeholder || "0"}
                        onClick={() => setActiveStep(2)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Third Column - Results */}
          <div
            className={`column ${activeStep === 3 ? "active" : ""}`}
            onClick={() => setActiveStep(3)}
            onMouseEnter={() => !isCalculating && !isMobile && setActiveStep(3)}
          >
            <div className="step-number">3</div>
            <div className="column-header">
              <div className="column-icon">
                <Assessment />
              </div>
              <h2>النتائج</h2>
            </div>
            <div className="column-content">
              {isCalculating ? (
                <div className="calculating-indicator">
                  <div className="spinner"></div>
                  <p>جاري الحساب...</p>
                </div>
              ) : (
                <div className="calculated-values">
                  <h3>القيم المحسوبة</h3>
                  {currentGenerator &&
                    currentGenerator.formulas &&
                    currentGenerator.formulas.derived_inputs &&
                    currentGenerator.formulas.derived_inputs.map((item) => (
                      <div key={item.name} className="calculated-item">
                        <span className="calc-label">{item.label}:</span>
                        <span className="calc-value">
                          {derivedInputs[item.name] !== undefined
                            ? typeof derivedInputs[item.name] === "number"
                              ? `${derivedInputs[item.name].toLocaleString(
                                  "en-US"
                                )} ${item.unit || ""}`
                              : derivedInputs[item.name]
                            : "0"}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <div className="input-groups-container">
                {inputGroups[2].map((input) => (
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
                        onChange={(e) => {
                          const value =
                            input.option_type === "product" ||
                            input.name.includes("_id")
                              ? parseInt(e.target.value)
                              : e.target.value;
                          handleInputChange(input.name, value);
                          setActiveStep(3);
                        }}
                      >
                        <option value="">اختر...</option>
                        {input.option_type === "product"
                          ? input.options.map((optionId) => {
                              const product =
                                dataService.getProductById(optionId);
                              return (
                                <option key={optionId} value={optionId}>
                                  {product ? product.name : `منتج ${optionId}`}
                                </option>
                              );
                            })
                          : input.option_type === "condition"
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
                          : input.options &&
                            input.options.map((option) => (
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
                              handleInputChange(input.name, e.target.checked)
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
                          setActiveStep(3);
                        }}
                        placeholder={input.placeholder || "0"}
                        onClick={() => setActiveStep(3)}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Bouton pour revenir à l'étape de réservation (visible uniquement sur mobile) */}
              {isMobile && (
                <div className="back-to-booking">
                  <button
                    className="back-to-booking-btn"
                    onClick={() => {
                      setActiveStep(1);
                      handleBooking();
                    }}
                    disabled={!areAllInputsFilled()}
                  >
                    <BookOnline style={{ marginLeft: 8 }} />
                    حجز الآن
                  </button>
                  {!areAllInputsFilled() && (
                    <div className="booking-warning">
                      يرجى ملء جميع الحقول المطلوبة أولاً
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Step Navigation for Mobile */}
          {isMobile && (
            <div className="step-navigation">
              <button
                className="prev-step-btn"
                onClick={goToPrevStep}
                disabled={activeStep === 1}
              >
                <ArrowForward /> السابق
              </button>

              <div className="step-indicator">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`step-dot ${
                      activeStep === step ? "active" : ""
                    }`}
                    onClick={() => setActiveStep(step)}
                  ></div>
                ))}
              </div>

              <button
                className="next-step-btn"
                onClick={goToNextStep}
                disabled={activeStep === 3}
              >
                التالي <ArrowBack />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="booking-modal-overlay">
          <div className="booking-modal">
            <div className="booking-modal-header">
              <h2>نموذج الحجز</h2>
              <button
                className="close-button"
                onClick={() => setShowBookingModal(false)}
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
