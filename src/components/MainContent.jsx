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
    if (selectedService) {
      const generator = dataService.getGeneratorById(selectedService.foreign_key_generator);
      
      if (generator) {
        setCurrentGenerator(generator);
        
        // Initialize inputs with default values from the generator
        const initialInputs = {};
        generator.inputs.forEach((input) => {
          // Use the default value from the JSON if available
          if (input.hasOwnProperty('default')) {
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
  }, [selectedService, autoCalculate]);

  // Auto-recalculate when inputs change
  useEffect(() => {
    if (autoCalculate && selectedService && Object.keys(calculatorInputs).length > 0) {
      calculatePrice(calculatorInputs);
    }
  }, [calculatorInputs, autoCalculate]);

  // Calculate derived inputs whenever regular inputs change
  useEffect(() => {
    if (currentGenerator && Object.keys(calculatorInputs).length > 0) {
      calculateDerivedInputs();
    }
  }, [calculatorInputs, currentGenerator]);

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
      price_unit: selectedService.price_unit
    };

    const newDerivedInputs = {};
    currentGenerator.formulas.derived_inputs.forEach(derivedInput => {
      try {
        newDerivedInputs[derivedInput.name] = evaluateFormula(derivedInput.formula, variables);
      } catch (error) {
        console.error(`Error calculating derived input ${derivedInput.name}:`, error);
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
      
      // Debug: Log localStorage data
      console.log("LocalStorage Data:", JSON.parse(localStorage.getItem('buildingzData')));
      
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
        price_unit: priceUnit
      };
      
      // Convert string inputs to numbers where possible for calculations
      Object.keys(variables).forEach(key => {
        // If the input is a string that represents a number, convert it
        if (typeof variables[key] === 'string' && !isNaN(variables[key]) && variables[key] !== '') {
          variables[key] = parseFloat(variables[key]);
        }
        // If the input is an empty string, set to 0 for calculations
        if (variables[key] === '') {
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
        ...extractVariables(materialsFormula)
      ];
      
      console.log("Variables extracted from formulas:", formulaVars);
      
      // Add product prices to variables for dynamic access in formulas
      const allProducts = dataService.getProducts();
      
      // For each input that references a product ID, add its price as a variable
      currentGenerator.inputs.forEach(input => {
        if (input.type === 'select' && 
            (input.option_type === 'product' || input.name.includes('product_id')) && 
            inputs[input.name]) {
          const productId = inputs[input.name];
          const product = allProducts.find(p => p.id === productId);
          if (product) {
            // Add product price with variable name pattern: {input_name}_price
            variables[`${input.name}_price`] = product.price;
            // Add product coverage with variable name pattern: {input_name}_coverage
            variables[`${input.name}_coverage`] = product.coverage || 1;
          }
        }
      });
      
      // Check for any variable ending with _price that might be needed in the formula
      formulaVars.forEach(varName => {
        if (varName.endsWith('_price')) {
          // If this price variable is not yet defined
          if (variables[varName] === undefined) {
            // Extract base name (remove _price suffix)
            const baseName = varName.substring(0, varName.length - 6);
            
            // Check if we have this base variable in our inputs
            if (variables[baseName] !== undefined) {
              // Try to find the product by ID
              const productId = variables[baseName];
              const product = allProducts.find(p => p.id === productId);
              
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
      formulaVars.forEach(varName => {
        if (variables[varName] === undefined) {
          console.warn(`Formula references undefined variable: ${varName}, setting to 0`);
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
      const laborCost = laborFormula ? evaluateFormula(laborFormula, variables) : totalPrice * 0.6;
      console.log("Labor Cost Result:", laborCost);
      
      console.log("Evaluating Materials Formula...");
      const materialsCost = materialsFormula ? evaluateFormula(materialsFormula, variables) : totalPrice * 0.4;
      console.log("Materials Cost Result:", materialsCost);
      
      // Get associated products
      const serviceProducts = dataService.getProducts().filter((p) =>
        selectedService.product_ids.includes(p.id)
      );
      
      console.log("Associated Products:", serviceProducts);
      console.log("Final Results:");
      console.log("  Total Price:", totalPrice);
      console.log("  Labor Cost:", laborCost);
      console.log("  Materials Cost:", materialsCost);
      console.log("  Total Sum Check:", laborCost + materialsCost);
      console.log("  Difference from Total:", totalPrice - (laborCost + materialsCost));
      console.log("======================================");

      setCalculationResult({
        totalPrice: totalPrice,
        laborCost: laborCost,
        materialsCost: materialsCost,
        currency: selectedService.currency,
        inputs: { ...inputs },
        products: serviceProducts
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
    else if (input.name.includes("condition_id") || input.option_type === "condition") {
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
      <div className="calculator-result-container">
        {/* Project Details Section */}
        <div className="calculator-section">
          <h2 className="section-header">Project Details</h2>
          <div className="calculator-form">
            {currentGenerator.inputs.map((input) => (
              <div key={input.id} className="input-group">
                <label>{input.label}</label>
                {input.type === "number" && (
                  <div className="number-input">
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
                    {input.unit && <span className="unit">{input.unit}</span>}
                  </div>
                )}
                {input.type === "select" && (
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
                )}
                {input.type === "boolean" && (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={!!calculatorInputs[input.name]}
                      onChange={(e) =>
                        handleInputChange(input.name, e.target.checked)
                      }
                    />
                    نعم
                  </label>
                )}
              </div>
            ))}

            {/* Derived Inputs Display */}
            {currentGenerator.formulas.derived_inputs && 
             currentGenerator.formulas.derived_inputs.length > 0 && (
              <div className="derived-inputs">
                <h3>Calculated Values</h3>
                {currentGenerator.formulas.derived_inputs.map((input) => (
                  <div key={input.name} className="input-group">
                    <label>{input.label}</label>
                    <div className="derived-value">
                      {derivedInputs[input.name] !== undefined 
                        ? `${derivedInputs[input.name]} ${input.unit || ''}`
                        : 'Calculating...'}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="input-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={autoCalculate}
                  onChange={(e) => setAutoCalculate(e.target.checked)}
                />
                Auto-calculate
              </label>
            </div>

            {!autoCalculate && (
              <button className="calculate-btn" onClick={() => calculatePrice()}>
                Calculate
              </button>
            )}
          </div>
        </div>

        {/* Cost Estimate Section */}
        <div className="result-section">
          <h2 className="section-header">Cost Estimate</h2>
          {calculationResult ? (
            <div className="result-card">
              <div className="result-details">
                {/* Display input values */}
                {Object.entries(calculatorInputs).map(([key, value]) => {
                  // Find the input definition
                  const input = currentGenerator.inputs.find(
                    (input) => input.name === key
                  );
                  if (!input) return null;

                  // Format the value based on input type
                  let displayValue = value;
                  if (
                    input.type === "select" &&
                    input.name.endsWith("product_id")
                  ) {
                    const product = dataService.getProductById(value);
                    displayValue = product
                      ? `${product.name} - ${product.price} ${product.currency}`
                      : value;
                  } else if (input.type === "boolean") {
                    displayValue = value ? "نعم" : "لا";
                  } else if (input.unit) {
                    displayValue = `${value} ${input.unit}`;
                  }

                  return (
                    <div key={key} className="detail-item">
                      <span className="detail-label">{input.label}:</span>
                      <span className="detail-value">{displayValue}</span>
                    </div>
                  );
                })}

                {/* Display derived input values */}
                {currentGenerator.formulas.derived_inputs && 
                 currentGenerator.formulas.derived_inputs.length > 0 && 
                 Object.entries(derivedInputs).map(([key, value]) => {
                  const derivedInput = currentGenerator.formulas.derived_inputs.find(
                    (input) => input.name === key
                  );
                  if (!derivedInput) return null;

                  return (
                    <div key={key} className="detail-item">
                      <span className="detail-label">{derivedInput.label}:</span>
                      <span className="detail-value">
                        {value} {derivedInput.unit || ''}
                      </span>
                    </div>
                  );
                })}

                <hr />
                <div className="detail-item">
                  <span className="detail-label">Material Cost:</span>
                  <span className="detail-value">
                    {calculationResult.currency}{" "}
                    {calculationResult.materialsCost.toFixed(2)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Labor Cost:</span>
                  <span className="detail-value">
                    {calculationResult.currency}{" "}
                    {calculationResult.laborCost.toFixed(2)}
                  </span>
                </div>
                <hr />
                <div
                  className="detail-item"
                  style={{ fontWeight: "bold", fontSize: "1.2rem" }}
                >
                  <span className="detail-label">Total Cost:</span>
                  <span className="detail-value">
                    {calculationResult.currency}{" "}
                    {calculationResult.totalPrice.toFixed(2)}
                  </span>
                </div>
                <button className="booking-btn">Continue to Booking</button>
                <button className="quote-detail-btn">Get Detailed Quote</button>
              </div>
            </div>
          ) : (
            <div className="empty-result">
              <p>
                Fill in the project details and click calculate to see the cost
                estimate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainContent;
