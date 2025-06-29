import React, { useState, useEffect } from "react";
import "./MainContent.css";
import dataService from "../../services/dataService";
import { evaluateFormula } from "../../utils/formulaUtils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Build,
  Brush,
  Construction,
  Engineering,
  Architecture,
  Straighten,
  Square,
  Calculate,
} from "@mui/icons-material";

// Icon components mapping
const iconComponents = {
  home: Home,
  build: Build,
  brush: Brush,
  construction: Construction,
  engineering: Engineering,
  architecture: Architecture,
  measure: Straighten,
  area: Square,
  calculate: Calculate,
};

const MainContent = ({ selectedService }) => {
  const [calculatorInputs, setCalculatorInputs] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);
  const [autoCalculate] = useState(true);
  const [currentGenerator, setCurrentGenerator] = useState(null);
  const [derivedInputs, setDerivedInputs] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showTips, setShowTips] = useState(true);

  // Initialize calculator inputs when service changes
  useEffect(() => {
    if (selectedService) {
      const generator = dataService.getGeneratorById(
        selectedService.foreign_key_generator
      );

      if (generator) {
        setCurrentGenerator(generator);
        setCurrentStep(1); // Reset to step 1 when service changes

        // Initialize inputs with default values from the generator
        const initialInputs = {};
        generator.inputs.forEach((input) => {
          // Use the default value from the JSON if available
          if (input.hasOwnProperty("default")) {
            initialInputs[input.name] = input.default;
          } else {
            // Fallback to type-based defaults if no default is specified
            if (input.type === "number") {
              initialInputs[input.name] = 0;
            } else if (input.type === "select" && input.options.length > 0) {
              initialInputs[input.name] = input.options[0];
            } else if (input.type === "boolean") {
              initialInputs[input.name] = false;
            } else {
              initialInputs[input.name] = "";
            }
          }
        });

        setCalculatorInputs(initialInputs);

        // If auto-calculate is enabled, calculate with initial values
        if (autoCalculate) {
          setTimeout(() => calculatePrice(initialInputs), 0);
        } else {
          setCalculationResult(null); // Reset result when service changes
        }
      }
    } else {
      setCurrentGenerator(null);
    }
  }, [selectedService]);

  // Auto-recalculate when inputs change
  useEffect(() => {
    if (
      autoCalculate &&
      selectedService &&
      Object.keys(calculatorInputs).length > 0
    ) {
      setIsCalculating(true);
      calculatePrice(calculatorInputs);
      setTimeout(() => setIsCalculating(false), 500); // Add a small delay for visual feedback
    }
  }, [calculatorInputs, autoCalculate, selectedService, currentGenerator]);

  // Calculate derived inputs whenever regular inputs change
  useEffect(() => {
    if (currentGenerator && Object.keys(calculatorInputs).length > 0) {
      calculateDerivedInputs();
    }
  }, [calculatorInputs, currentGenerator, selectedService]);

  const handleInputChange = (name, value) => {
    setCalculatorInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateDerivedInputs = () => {
    if (!currentGenerator || !currentGenerator.formulas.derived_inputs) return;

    const variables = {
      ...calculatorInputs,
      price_unit: selectedService.price_unit,
    };

    const newDerivedInputs = {};
    currentGenerator.formulas.derived_inputs.forEach((derivedInput) => {
      try {
        newDerivedInputs[derivedInput.name] = evaluateFormula(
          derivedInput.formula,
          variables
        );
      } catch (error) {
        console.error(
          `Error calculating derived input ${derivedInput.name}:`,
          error
        );
        newDerivedInputs[derivedInput.name] = 0;
      }
    });

    setDerivedInputs(newDerivedInputs);
  };

  const calculatePrice = (inputs = calculatorInputs) => {
    if (!selectedService || !currentGenerator) return;

    try {
      console.log("========== CALCULATION DEBUG ==========");
      console.log("Selected Service:", selectedService);
      console.log("Current Generator:", currentGenerator);
      console.log("Input Values:", inputs);

      // Get the pricing formulas and price unit
      const priceFormula = currentGenerator.formulas.pricing.formula;
      const laborFormula = currentGenerator.formulas.labor.formula;
      const materialsFormula = currentGenerator.formulas.materials.formula;
      const priceUnit = selectedService.price_unit;

      console.log("Price Formula:", priceFormula);
      console.log("Labor Formula:", laborFormula);
      console.log("Materials Formula:", materialsFormula);
      console.log("Price Unit:", priceUnit);

      // Create variables object with all inputs and price_unit
      const variables = {
        ...inputs,
        price_unit: priceUnit,
      };

      // Convert string inputs to numbers where possible for calculations
      Object.keys(variables).forEach((key) => {
        // If the input is a string that represents a number, convert it
        if (
          typeof variables[key] === "string" &&
          !isNaN(variables[key]) &&
          variables[key] !== ""
        ) {
          variables[key] = parseFloat(variables[key]);
        }
        // If the input is an empty string, set to 0 for calculations
        if (variables[key] === "") {
          variables[key] = 0;
        }
        // Convert boolean values to numbers
        if (typeof variables[key] === "boolean") {
          variables[key] = variables[key] ? 1 : 0;
        }
      });

      console.log("Variables after type conversion:", variables);

      // Add product prices to variables for dynamic access in formulas
      const allProducts = dataService.getProducts();
      console.log("All Products:", allProducts);

      // Track selected products
      const selectedProducts = [];

      // For each input that references a product ID, add its price as a variable
      currentGenerator.inputs.forEach((input) => {
        if (
          input.type === "select" &&
          (input.option_type === "product" ||
            input.name.includes("product_id")) &&
          inputs[input.name]
        ) {
          const productId = inputs[input.name];
          const product = allProducts.find((p) => p.id === productId);
          console.log(`Looking for product ${productId}:`, product);
          if (product) {
            // Add product price with variable name pattern: {input_name}_price
            variables[`${input.name}_price`] = product.price;
            // Add product coverage with variable name pattern: {input_name}_coverage
            variables[`${input.name}_coverage`] = product.coverage || 1;
            console.log(`Added product variables for ${input.name}:`, {
              [`${input.name}_price`]: product.price,
              [`${input.name}_coverage`]: product.coverage || 1,
            });

            // Add to selected products
            selectedProducts.push(product);
          }
        }
      });

      console.log("Final variables for formula:", variables);

      // Calculate prices using the formulas
      console.log("Evaluating formulas with variables:", variables);
      const totalPrice = evaluateFormula(priceFormula, variables);
      console.log("Total Price:", totalPrice);

      const laborCost = laborFormula
        ? evaluateFormula(laborFormula, variables)
        : totalPrice * 0.6;
      console.log("Labor Cost:", laborCost);

      const materialsCost = materialsFormula
        ? evaluateFormula(materialsFormula, variables)
        : totalPrice * 0.4;
      console.log("Materials Cost:", materialsCost);

      // Get service products (only used if no products were selected by the client)
      const serviceProducts =
        selectedProducts.length > 0
          ? selectedProducts
          : dataService
              .getProducts()
              .filter((p) => selectedService.product_ids.includes(p.id));

      console.log("Selected Products:", selectedProducts);
      console.log("Service Products:", serviceProducts);

      console.log("Setting calculation result:", {
        totalPrice,
        laborCost,
        materialsCost,
        currency: selectedService.currency,
      });

      setCalculationResult({
        totalPrice: totalPrice,
        laborCost: laborCost,
        materialsCost: materialsCost,
        currency: selectedService.currency,
        inputs: { ...inputs },
        products:
          selectedProducts.length > 0 ? selectedProducts : serviceProducts,
      });
    } catch (error) {
      console.error("Error calculating price:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
    }
  };

  const renderSelectOptions = (input) => {
    // For product IDs - check both name.includes and option_type
    if (input.name.includes("product_id") || input.option_type === "product") {
      return input.options.map((optionId) => {
        const product = dataService.getProductById(optionId);
        return (
          <option key={optionId} value={optionId}>
            {product
              ? `${product.name} - ${product.price} ${product.currency}`
              : `Product ${optionId}`}
          </option>
        );
      });
    }
    // For condition IDs - check both name.includes and option_type
    else if (
      input.name.includes("condition_id") ||
      input.option_type === "condition"
    ) {
      return input.options.map((optionId) => {
        const condition = dataService.getConditionById(optionId);
        return (
          <option key={optionId} value={optionId}>
            {condition ? condition.name : `Condition ${optionId}`}
          </option>
        );
      });
    }
    // For other types of options (like patterns, etc.)
    return input.options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ));
  };

  // Next step handler
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step handler
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  // Early return if no service is selected
  if (!selectedService) {
    return (
      <div className="main-content">
        <div className="welcome-message">
          <h1>مرحباً بك في Buildingz</h1>
          <p>اختر خدمة من القائمة الجانبية للبدء</p>
        </div>
      </div>
    );
  }

  if (!currentGenerator) {
    return (
      <div className="main-content">
        <div className="error-message">
          <h2>خطأ في تحميل الخدمة</h2>
          <p>لم يتم العثور على معلومات الحاسبة لهذه الخدمة</p>
        </div>
      </div>
    );
  }

  // Group inputs for step-based approach
  const groupInputs = () => {
    if (!currentGenerator || !currentGenerator.inputs) return [];

    // If there are 3 or fewer inputs, put each in its own step
    if (currentGenerator.inputs.length <= 3) {
      return currentGenerator.inputs.map((input) => [input]);
    }

    // Otherwise, distribute inputs evenly across 2 steps
    const midpoint = Math.ceil(currentGenerator.inputs.length / 2);
    return [
      currentGenerator.inputs.slice(0, midpoint),
      currentGenerator.inputs.slice(midpoint),
    ];
  };

  const inputGroups = groupInputs();

  return (
    <div className="main-content">
      <div className="service-wizard">
        {/* Service Header */}
        <div className="service-header">
          <h1>{selectedService.name}</h1>
          <p>{selectedService.description}</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div
            className={`step ${currentStep >= 1 ? "active" : ""} ${
              currentStep > 1 ? "completed" : ""
            }`}
            onClick={() => setCurrentStep(1)}
          >
            <div className="step-number">1</div>
            <div className="step-label">تفاصيل المشروع</div>
          </div>
          <div className="step-connector"></div>
          <div
            className={`step ${currentStep >= 2 ? "active" : ""} ${
              currentStep > 2 ? "completed" : ""
            }`}
            onClick={() => (currentStep > 1 ? setCurrentStep(2) : null)}
          >
            <div className="step-number">2</div>
            <div className="step-label">خيارات إضافية</div>
          </div>
          <div className="step-connector"></div>
          <div
            className={`step ${currentStep === 3 ? "active" : ""}`}
            onClick={() => (currentStep > 2 ? setCurrentStep(3) : null)}
          >
            <div className="step-number">3</div>
            <div className="step-label">النتائج والتكلفة</div>
          </div>
        </div>

        {/* Tips toggle */}
        <div className="tips-toggle">
          <button
            className={`tips-button ${showTips ? "active" : ""}`}
            onClick={() => setShowTips(!showTips)}
          >
            {showTips ? "إخفاء النصائح" : "إظهار النصائح"}
          </button>
        </div>

        {/* Step Content */}
        <div className="step-content-container">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Project Details */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                className="step-content"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <div className="step-content-header">
                  <h2>تفاصيل المشروع الأساسية</h2>
                  {showTips && (
                    <div className="tip-box">
                      <div className="tip-icon">💡</div>
                      <div className="tip-text">
                        أدخل المعلومات الأساسية لمشروعك مثل المساحة والمواد
                        المستخدمة للحصول على تقدير دقيق للتكلفة.
                      </div>
                    </div>
                  )}
                </div>

                <div className="inputs-grid">
                  {inputGroups[0]?.map((input) => (
                    <div key={input.id} className="input-card">
                      <div className="input-card-header">
                        <div className="input-label-group">
                          <div className="input-label">
                            {input.label}{" "}
                            {input.icon && iconComponents[input.icon] && (
                              <div className="input-icon">
                                {React.createElement(
                                  iconComponents[input.icon]
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        {input.unit && (
                          <div className="unit-badge">{input.unit}</div>
                        )}
                      </div>

                      {input.type === "number" && (
                        <div className="number-input-wrapper">
                          <input
                            type="number"
                            value={calculatorInputs[input.name] || 0}
                            onChange={(e) =>
                              handleInputChange(
                                input.name,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                          />
                        </div>
                      )}

                      {input.type === "select" && (
                        <div className="select-wrapper">
                          <select
                            value={
                              calculatorInputs[input.name] || input.options[0]
                            }
                            onChange={(e) =>
                              handleInputChange(
                                input.name,
                                input.name.includes("_id")
                                  ? parseInt(e.target.value)
                                  : e.target.value
                              )
                            }
                          >
                            {renderSelectOptions(input)}
                          </select>
                        </div>
                      )}

                      {input.type === "boolean" && (
                        <div className="switch-wrapper">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={!!calculatorInputs[input.name]}
                              onChange={(e) =>
                                handleInputChange(input.name, e.target.checked)
                              }
                            />
                            <span className="slider"></span>
                            <span className="switch-text">
                              {!!calculatorInputs[input.name] ? "نعم" : "لا"}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="step-navigation">
                  <button className="next-button" onClick={handleNextStep}>
                    التالي <span className="button-icon">←</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Additional Options */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                className="step-content"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <div className="step-content-header">
                  <h2>خيارات إضافية</h2>
                  {showTips && (
                    <div className="tip-box">
                      <div className="tip-icon">💡</div>
                      <div className="tip-text">
                        حدد الخيارات الإضافية لتخصيص مشروعك بشكل أفضل. هذه
                        الخيارات قد تؤثر على التكلفة النهائية.
                      </div>
                    </div>
                  )}
                </div>

                <div className="inputs-grid">
                  {inputGroups[1]?.map((input) => (
                    <div key={input.id} className="input-card">
                      <div className="input-card-header">
                        <div className="input-label-group">
                          {input.icon && iconComponents[input.icon] && (
                            <div className="input-icon">
                              {React.createElement(iconComponents[input.icon])}
                            </div>
                          )}
                          <div className="input-label">{input.label}</div>
                        </div>
                        {input.unit && (
                          <div className="unit-badge">{input.unit}</div>
                        )}
                      </div>

                      {input.type === "number" && (
                        <div className="number-input-wrapper">
                          <input
                            type="number"
                            value={calculatorInputs[input.name] || 0}
                            onChange={(e) =>
                              handleInputChange(
                                input.name,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                          />
                        </div>
                      )}

                      {input.type === "select" && (
                        <div className="select-wrapper">
                          <select
                            value={
                              calculatorInputs[input.name] || input.options[0]
                            }
                            onChange={(e) =>
                              handleInputChange(
                                input.name,
                                input.name.includes("_id")
                                  ? parseInt(e.target.value)
                                  : e.target.value
                              )
                            }
                          >
                            {renderSelectOptions(input)}
                          </select>
                        </div>
                      )}

                      {input.type === "boolean" && (
                        <div className="switch-wrapper">
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={!!calculatorInputs[input.name]}
                              onChange={(e) =>
                                handleInputChange(input.name, e.target.checked)
                              }
                            />
                            <span className="slider"></span>
                            <span className="switch-text">
                              {!!calculatorInputs[input.name] ? "نعم" : "لا"}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Derived Inputs Display */}
                  {currentGenerator.formulas.derived_inputs &&
                    currentGenerator.formulas.derived_inputs.length > 0 && (
                      <div className="derived-values-section">
                        <h3>القيم المحسوبة</h3>
                        <div className="derived-values-grid">
                          {currentGenerator.formulas.derived_inputs.map(
                            (input) => (
                              <div
                                key={input.name}
                                className="derived-value-item"
                              >
                                <span className="derived-label">
                                  {input.label}:
                                </span>
                                <span className="derived-number">
                                  {derivedInputs[input.name] !== undefined
                                    ? `${derivedInputs[input.name]} ${
                                        input.unit || ""
                                      }`
                                    : "جاري الحساب..."}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>

                <div className="step-navigation">
                  <button className="prev-button" onClick={handlePrevStep}>
                    <span className="button-icon">→</span> السابق
                  </button>
                  <button className="next-button" onClick={handleNextStep}>
                    النتائج <span className="button-icon">←</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Results and Cost */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                className="step-content"
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <div className="step-content-header">
                  <h2>النتائج والتكلفة</h2>
                  {showTips && (
                    <div className="tip-box">
                      <div className="tip-icon">💡</div>
                      <div className="tip-text">
                        هذه هي التكلفة التقديرية لمشروعك بناءً على المعلومات
                        التي أدخلتها. يمكنك العودة وتعديل المدخلات لرؤية كيف
                        تؤثر على التكلفة.
                      </div>
                    </div>
                  )}
                </div>

                {isCalculating ? (
                  <div className="calculating-indicator">
                    <div className="spinner"></div>
                    <p>جاري حساب التكلفة...</p>
                  </div>
                ) : calculationResult ? (
                  <div className="results-content">
                    <div className="cost-summary-card">
                      <div className="cost-header">
                        <h3>التكلفة الإجمالية</h3>
                        <div className="total-cost">
                          {calculationResult.totalPrice.toLocaleString()}{" "}
                          {calculationResult.currency}
                        </div>
                      </div>

                      <div className="cost-breakdown">
                        <div className="cost-pie-chart">
                          <div
                            className="pie-segment labor"
                            style={{
                              "--percentage": `${
                                (calculationResult.laborCost /
                                  calculationResult.totalPrice) *
                                100
                              }%`,
                            }}
                          ></div>
                          <div
                            className="pie-segment materials"
                            style={{
                              "--percentage": `${
                                (calculationResult.materialsCost /
                                  calculationResult.totalPrice) *
                                100
                              }%`,
                            }}
                          ></div>
                          <div className="pie-center"></div>
                        </div>

                        <div className="cost-legend">
                          <div className="legend-item">
                            <div className="legend-color labor"></div>
                            <div className="legend-label">العمالة:</div>
                            <div className="legend-value">
                              {calculationResult.laborCost.toLocaleString()}{" "}
                              {calculationResult.currency}
                              <span className="percentage">
                                (
                                {Math.round(
                                  (calculationResult.laborCost /
                                    calculationResult.totalPrice) *
                                    100
                                )}
                                %)
                              </span>
                            </div>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color materials"></div>
                            <div className="legend-label">المواد:</div>
                            <div className="legend-value">
                              {calculationResult.materialsCost.toLocaleString()}{" "}
                              {calculationResult.currency}
                              <span className="percentage">
                                (
                                {Math.round(
                                  (calculationResult.materialsCost /
                                    calculationResult.totalPrice) *
                                    100
                                )}
                                %)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="specs-summary">
                      <h3>ملخص المشروع</h3>
                      <div className="specs-grid">
                        {Object.entries(calculatorInputs).map(
                          ([key, value]) => {
                            const input = currentGenerator.inputs.find(
                              (input) => input.name === key
                            );
                            if (!input) return null;

                            // Format the value based on input type
                            let displayValue = value;
                            if (
                              input.type === "select" &&
                              (input.name.endsWith("product_id") ||
                                input.option_type === "product")
                            ) {
                              const product = dataService.getProductById(value);
                              displayValue = product
                                ? `${product.name}`
                                : value;
                            } else if (input.type === "boolean") {
                              displayValue = value ? "نعم" : "لا";
                            } else if (input.unit) {
                              displayValue = `${value} ${input.unit}`;
                            }

                            return (
                              <div key={key} className="spec-item">
                                <span className="spec-label">
                                  {input.label}:
                                </span>
                                <span className="spec-value">
                                  {displayValue}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>

                    <div className="products-summary">
                      <h3>المنتجات المستخدمة</h3>
                      <div className="products-grid">
                        {calculationResult.products.map((product) => (
                          <div key={product.id} className="product-card">
                            <div className="product-image-placeholder"></div>
                            <div className="product-info">
                              <div className="product-name">{product.name}</div>
                              <div className="product-price">
                                {product.price} {product.currency}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="action-buttons">
                      <button className="primary-button">متابعة للحجز</button>
                      <button className="secondary-button">
                        الحصول على عرض سعر مفصل
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="empty-result">
                    <p>أدخل تفاصيل المشروع لرؤية تقدير التكلفة</p>
                  </div>
                )}

                <div className="step-navigation">
                  <button className="prev-button" onClick={handlePrevStep}>
                    <span className="button-icon">→</span> السابق
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
