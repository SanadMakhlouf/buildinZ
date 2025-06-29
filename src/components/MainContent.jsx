import React, { useState, useEffect } from "react";
import "../styles/MainContent.css";
import dataService from "../services/dataService";
import { evaluateFormula } from "../utils/formulaUtils";

const MainContent = ({ selectedService }) => {
  const [calculatorInputs, setCalculatorInputs] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [currentGenerator, setCurrentGenerator] = useState(null);
  const [derivedInputs, setDerivedInputs] = useState({});

  // Initialize calculator inputs when service changes
  useEffect(() => {
    // Clean up function to reset all state
    const cleanupState = () => {
      setCurrentGenerator(null);
      setCalculatorInputs({});
      setCalculationResult(null);
      setDerivedInputs({});
    };

    // If no service is selected, clean up and exit
    if (!selectedService) {
      cleanupState();
      return;
    }

    try {
      // Check if the service has a valid generator reference
      if (!selectedService.foreign_key_generator) {
        console.warn("Service has no generator reference");
        cleanupState();
        return;
      }

      const generator = dataService.getGeneratorById(
        selectedService.foreign_key_generator
      );

      if (!generator) {
        console.warn("Generator not found for service:", selectedService.name);
        cleanupState();
        return;
      }

      setCurrentGenerator(generator);

      // Initialize inputs with default values from the generator
      const initialInputs = {};
      generator.inputs.forEach((input) => {
        if (input.hasOwnProperty("default")) {
          initialInputs[input.name] = input.default;
        } else {
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
      }
    } catch (error) {
      console.error("Error initializing calculator:", error);
      cleanupState();
    }
  }, [selectedService, autoCalculate]);

  // Auto-recalculate when inputs change
  useEffect(() => {
    if (
      autoCalculate &&
      selectedService &&
      Object.keys(calculatorInputs).length > 0
    ) {
      calculatePrice(calculatorInputs);
    }
  }, [calculatorInputs, autoCalculate, selectedService]);

  // Calculate derived inputs whenever regular inputs change
  useEffect(() => {
    // Only calculate if we have all the required data
    if (
      currentGenerator &&
      selectedService &&
      selectedService.price_unit !== undefined &&
      Object.keys(calculatorInputs).length > 0
    ) {
      calculateDerivedInputs();
    } else {
      // Reset derived inputs if any required data is missing
      setDerivedInputs({});
    }
  }, [calculatorInputs, currentGenerator, selectedService]);

  const handleInputChange = (name, value) => {
    setCalculatorInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateDerivedInputs = () => {
    // Triple-check that we have everything we need
    if (!currentGenerator) return;
    if (!currentGenerator.formulas || !currentGenerator.formulas.derived_inputs)
      return;
    if (!selectedService) return;

    // Safely access price_unit with a default value if it doesn't exist
    const priceUnit =
      selectedService && selectedService.price_unit
        ? selectedService.price_unit
        : 0;

    const variables = {
      ...calculatorInputs,
      price_unit: priceUnit,
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
    // Make sure we have all required data
    if (!selectedService) {
      console.warn("Cannot calculate price: No service selected");
      return;
    }

    if (!currentGenerator) {
      console.warn("Cannot calculate price: No generator available");
      return;
    }

    if (!currentGenerator.formulas) {
      console.warn("Cannot calculate price: Generator has no formulas");
      return;
    }

    try {
      console.log("========== CALCULATION DEBUG ==========");
      console.log("Selected Service:", selectedService);
      console.log("Current Generator:", currentGenerator);

      // Debug: Log localStorage data
      console.log(
        "LocalStorage Data:",
        JSON.parse(localStorage.getItem("buildingzData"))
      );

      // Get the pricing formulas and price unit
      const priceFormula = currentGenerator.formulas.pricing?.formula || "";
      const laborFormula = currentGenerator.formulas.labor?.formula || "";
      const materialsFormula =
        currentGenerator.formulas.materials?.formula || "";

      // Safely access price_unit with a default value
      let priceUnit = 0;
      try {
        priceUnit =
          selectedService && selectedService.price_unit !== undefined
            ? selectedService.price_unit
            : 0;
      } catch (error) {
        console.error("Error accessing price_unit:", error);
      }

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
      });

      // Extract variable names from the formula to ensure all needed variables exist
      const extractVariables = (formula) => {
        if (!formula) return [];
        // This regex finds identifiers that might be variable names
        const matches = formula.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
        return [...new Set(matches)]; // Remove duplicates
      };

      // Get all variables mentioned in formulas
      const formulaVars = [
        ...extractVariables(priceFormula),
        ...extractVariables(laborFormula),
        ...extractVariables(materialsFormula),
      ];

      console.log("Variables extracted from formulas:", formulaVars);

      // Add product prices to variables for dynamic access in formulas
      const allProducts = dataService.getProducts();

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
          if (product) {
            // Add product price with variable name pattern: {input_name}_price
            variables[`${input.name}_price`] = product.price;
            // Add product coverage with variable name pattern: {input_name}_coverage
            variables[`${input.name}_coverage`] = product.coverage || 1;
          }
        }
      });

      // Check for any variable ending with _price that might be needed in the formula
      formulaVars.forEach((varName) => {
        if (varName.endsWith("_price")) {
          // If this price variable is not yet defined
          if (variables[varName] === undefined) {
            // Extract base name (remove _price suffix)
            const baseName = varName.substring(0, varName.length - 6);

            // Check if we have this base variable in our inputs
            if (variables[baseName] !== undefined) {
              // Try to find the product by ID
              const productId = variables[baseName];
              const product = allProducts.find((p) => p.id === productId);

              if (product) {
                // Add the price and coverage variables
                variables[varName] = product.price;
                variables[`${baseName}_coverage`] = product.coverage || 1;
              } else {
                // Default values if product not found
                variables[varName] = 0;
                variables[`${baseName}_coverage`] = 1;
              }
            }
          }
        }
      });

      // Final check: ensure all variables mentioned in formulas exist
      // This prevents "X is not defined" errors
      formulaVars.forEach((varName) => {
        if (variables[varName] === undefined) {
          console.warn(
            `Formula references undefined variable: ${varName}, setting to 0`
          );
          variables[varName] = 0;
        }
      });

      console.log("Input Variables with Product Prices:", variables);

      // Log each variable evaluation separately for debugging
      console.log("Individual Variable Values:");
      Object.entries(variables).forEach(([key, value]) => {
        console.log(`  ${key}: ${value} (${typeof value})`);
      });

      // Calculate prices using the formulas
      console.log("Evaluating Price Formula...");
      const totalPrice = evaluateFormula(priceFormula, variables);
      console.log("Total Price Result:", totalPrice);

      console.log("Evaluating Labor Formula...");
      const laborCost = laborFormula
        ? evaluateFormula(laborFormula, variables)
        : totalPrice * 0.6;
      console.log("Labor Cost Result:", laborCost);

      console.log("Evaluating Materials Formula...");
      const materialsCost = materialsFormula
        ? evaluateFormula(materialsFormula, variables)
        : totalPrice * 0.4;
      console.log("Materials Cost Result:", materialsCost);

      // Get associated products
      const serviceProducts = dataService
        .getProducts()
        .filter((p) => selectedService.product_ids.includes(p.id));

      console.log("Associated Products:", serviceProducts);
      console.log("Final Results:");
      console.log("  Total Price:", totalPrice);
      console.log("  Labor Cost:", laborCost);
      console.log("  Materials Cost:", materialsCost);
      console.log("  Total Sum Check:", laborCost + materialsCost);
      console.log(
        "  Difference from Total:",
        totalPrice - (laborCost + materialsCost)
      );
      console.log("======================================");

      setCalculationResult({
        totalPrice: totalPrice,
        laborCost: laborCost,
        materialsCost: materialsCost,
        currency: selectedService.currency,
        inputs: { ...inputs },
        products: serviceProducts,
      });
    } catch (error) {
      console.error("Error calculating price:", error);
      console.log("Error details:", error.message);
      console.log("Error stack:", error.stack);
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

  return (
    <div className="main-content">
      <div className="compact-calculator-container">
        <div className="service-header">
          <h1>{selectedService.name}</h1>
          <p>{selectedService.description}</p>
        </div>

        <div className="calculator-result-grid">
          {/* Left panel: Calculator inputs */}
          <div className="calculator-panel">
            <div className="panel-header">
              <h2>تفاصيل المشروع</h2>
              <div className="auto-calculate-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={autoCalculate}
                    onChange={(e) => setAutoCalculate(e.target.checked)}
                  />
                  <span className="toggle-text">حساب تلقائي</span>
                </label>
              </div>
            </div>

            <div className="input-fields-container">
              {currentGenerator.inputs.map((input) => (
                <div key={input.id} className="compact-input-group">
                  <label>{input.label}</label>

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
                      {input.unit && (
                        <span className="unit-badge">{input.unit}</span>
                      )}
                    </div>
                  )}

                  {input.type === "select" && (
                    <div className="select-wrapper">
                      <select
                        value={calculatorInputs[input.name] || input.options[0]}
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

              {/* Derived Inputs Display - Compact version */}
              {currentGenerator.formulas.derived_inputs &&
                currentGenerator.formulas.derived_inputs.length > 0 && (
                  <div className="derived-values-section">
                    <h3>القيم المحسوبة</h3>
                    <div className="derived-values-grid">
                      {currentGenerator.formulas.derived_inputs.map((input) => (
                        <div key={input.name} className="derived-value-item">
                          <span className="derived-label">{input.label}:</span>
                          <span className="derived-number">
                            {derivedInputs[input.name] !== undefined
                              ? `${derivedInputs[input.name]} ${
                                  input.unit || ""
                                }`
                              : "جاري الحساب..."}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {!autoCalculate && (
                <button
                  className="calculate-button"
                  onClick={() => calculatePrice()}
                >
                  حساب التكلفة
                </button>
              )}
            </div>
          </div>

          {/* Right panel: Results */}
          <div className="results-panel">
            <div className="panel-header">
              <h2>تقدير التكلفة</h2>
            </div>

            {calculationResult ? (
              <div className="results-content">
                <div className="price-summary">
                  <div className="total-price-display">
                    <span className="price-label">التكلفة الإجمالية:</span>
                    <span className="price-value">
                      {calculationResult.totalPrice.toLocaleString()}{" "}
                      {calculationResult.currency}
                    </span>
                  </div>

                  <div className="cost-breakdown">
                    <div className="cost-item">
                      <span>تكلفة العمالة:</span>
                      <span>
                        {calculationResult.laborCost.toLocaleString()}{" "}
                        {calculationResult.currency}
                      </span>
                    </div>
                    <div className="cost-item">
                      <span>تكلفة المواد:</span>
                      <span>
                        {calculationResult.materialsCost.toLocaleString()}{" "}
                        {calculationResult.currency}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="input-summary">
                  <h3>مواصفات المشروع</h3>
                  <div className="specs-grid">
                    {Object.entries(calculatorInputs).map(([key, value]) => {
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
                        displayValue = product ? `${product.name}` : value;
                      } else if (input.type === "boolean") {
                        displayValue = value ? "نعم" : "لا";
                      } else if (input.unit) {
                        displayValue = `${value} ${input.unit}`;
                      }

                      return (
                        <div key={key} className="spec-item">
                          <span className="spec-label">{input.label}:</span>
                          <span className="spec-value">{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {calculationResult.products &&
                  calculationResult.products.length > 0 && (
                    <div className="products-summary">
                      <h3>المنتجات المستخدمة</h3>
                      <div className="products-list">
                        {calculationResult.products.map((product) => (
                          <div key={product.id} className="product-item">
                            <span className="product-name">{product.name}</span>
                            <span className="product-price">
                              {product.price} {product.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
