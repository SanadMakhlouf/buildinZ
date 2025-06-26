import React, { useState, useEffect } from "react";
import "../styles/MainContent.css";
import buildingzData from "../data/json/buildingzData.json";

const MainContent = ({ selectedService }) => {
  const [calculatorInputs, setCalculatorInputs] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedTier, setSelectedTier] = useState("silver");

  // Initialize calculator inputs when service changes
  useEffect(() => {
    if (selectedService) {
      const generator = buildingzData.type_de_generator.find(
        (g) => g.id === selectedService.foreign_key_generator
      );
      if (generator) {
        // Initialize inputs with default values based on type
        const initialInputs = {};
        generator.inputs.forEach((input) => {
          if (input.type === "number") {
            initialInputs[input.name] = 0;
          } else if (input.type === "select" && input.options.length > 0) {
            initialInputs[input.name] = input.options[0];
          } else if (input.type === "boolean") {
            initialInputs[input.name] = false;
          }
        });
        setCalculatorInputs(initialInputs);
        setCalculationResult(null); // Reset result when service changes
      }
    }
  }, [selectedService]);

  const handleInputChange = (name, value) => {
    setCalculatorInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculatePrice = () => {
    if (!selectedService) return;

    try {
      let totalPrice = 0;
      let laborCost = 0;
      let materialsCost = 0;

      // Find the generator for this service
      const generator = buildingzData.type_de_generator.find(
        (g) => g.id === selectedService.foreign_key_generator
      );

      if (!generator) {
        console.error("Generator not found for service:", selectedService);
        return;
      }

      const formula = generator.pricing_formula;
      const priceUnit = selectedService.price_unit;

      // Validate that all required inputs are present
      const missingInputs = generator.inputs.filter(
        (input) => calculatorInputs[input.name] === undefined
      );

      if (missingInputs.length > 0) {
        console.error(
          "Missing required inputs:",
          missingInputs.map((i) => i.name)
        );
        return;
      }

      // Create a context object with all variables needed for evaluation
      const context = {
        ...calculatorInputs,
        price_unit: priceUnit,
      };

      // Convert Arabic paint type to English for calculation if needed
      if (selectedService.id === 1 && calculatorInputs.paint_type) {
        context.paint_type =
          calculatorInputs.paint_type === "زيتي" ? "oil" : "water";
      }

      // Evaluate the formula using the context
      let evaluationString = formula;

      // Replace formula variables with actual values
      Object.entries(context).forEach(([key, value]) => {
        if (value !== undefined) {
          const replacementValue =
            typeof value === "string" ? `'${value}'` : value;
          evaluationString = evaluationString.replace(
            new RegExp(key, "g"),
            replacementValue
          );
        }
      });

      console.log("Evaluation string:", evaluationString);

      // Create a safe evaluation context
      const evalContext = {
        Math: Math,
      };

      // Evaluate the formula
      totalPrice = new Function("Math", `return ${evaluationString}`)(Math);
      console.log("Total price calculated:", totalPrice);

      // Calculate labor and materials costs separately
      if (selectedService.id === 1) {
        // Paint service
        laborCost = calculatorInputs.area * priceUnit;
        materialsCost = totalPrice - laborCost;
      } else if (selectedService.id === 2) {
        // Wallpaper service
        laborCost =
          calculatorInputs.wall_length *
          calculatorInputs.wall_height *
          priceUnit;
        materialsCost = totalPrice - laborCost;
      } else if (selectedService.id === 3) {
        // Ceiling service
        const complexity_multiplier =
          {
            بسيط: 1.0,
            متوسط: 1.5,
            معقد: 2.0,
          }[calculatorInputs.design_complexity] || 1.0;
        laborCost =
          calculatorInputs.room_area * complexity_multiplier * priceUnit;
        materialsCost = totalPrice - laborCost;
      }

      // Get associated products
      const serviceProducts = buildingzData.products.filter((p) =>
        selectedService.product_ids.includes(p.id)
      );

      // Find the selected tier
      const tierData = buildingzData.serviceTiers.find(
        (tier) => tier.id === selectedTier
      );

      // Apply tier pricing
      const tierMultiplier = tierData ? tierData.multiplier : 1.0;
      totalPrice = totalPrice * tierMultiplier;
      laborCost = laborCost * tierMultiplier;
      materialsCost = materialsCost * tierMultiplier;

      setCalculationResult({
        totalPrice,
        laborCost,
        materialsCost,
        currency: selectedService.currency,
        inputs: { ...calculatorInputs },
        products: serviceProducts,
        tier: selectedTier,
      });
    } catch (error) {
      console.error("Error calculating price:", error);
    }
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

  const currentGenerator = buildingzData.type_de_generator.find(
    (g) => g.id === selectedService.foreign_key_generator
  );

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

  // Get service tiers from JSON data
  const serviceTiers = buildingzData.serviceTiers;

  const renderSelectOptions = (input) => {
    // If the input name ends with 'product_id', it's a product selection
    if (input.name.endsWith("product_id")) {
      return input.options.map((productId) => {
        const product = buildingzData.products.find((p) => p.id === productId);
        return (
          <option key={productId} value={productId}>
            {product ? product.name : `Product ${productId}`}
          </option>
        );
      });
    }
    // For non-product selections (like patterns, conditions, etc.)
    return input.options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ));
  };

  return (
    <div className="main-content">
      <div className="calculator-result-container">
        {/* Project Details Section */}
        <div className="calculator-section">
          <h2 className="section-header">Project Details</h2>
          <div className="calculator-form">
            {currentGenerator.inputs.map((input) => (
              <div key={input.name} className="input-group">
                <label>{input.label}</label>
                {input.type === "number" && (
                  <div className="number-input">
                    <input
                      type="number"
                      value={calculatorInputs[input.name]}
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
                    value={calculatorInputs[input.name]}
                    onChange={(e) =>
                      handleInputChange(
                        input.name,
                        input.name.endsWith("product_id")
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
                      checked={calculatorInputs[input.name]}
                      onChange={(e) =>
                        handleInputChange(input.name, e.target.checked)
                      }
                    />
                    نعم
                  </label>
                )}
              </div>
            ))}

            {/* Service Tier Selection */}
            <div className="input-group">
              <label>Service Tier</label>
              <div className="service-tier-options">
                {serviceTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`tier-option ${
                      selectedTier === tier.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedTier(tier.id)}
                  >
                    <div className="tier-name">{tier.name}</div>
                    <div className="tier-price">
                      {tier.currency} {tier.pricePerMeter}/m²
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="calculate-btn" onClick={calculatePrice}>
              Calculate
            </button>
          </div>
        </div>

        {/* Cost Estimate Section */}
        <div className="result-section">
          <h2 className="section-header">Cost Estimate</h2>
          {calculationResult ? (
            <div className="result-card">
              <div className="result-details">
                <div className="detail-item">
                  <span className="detail-label">Total Area:</span>
                  <span className="detail-value">
                    {calculatorInputs.area ||
                      calculatorInputs.room_area ||
                      (calculatorInputs.wall_length &&
                      calculatorInputs.wall_height
                        ? calculatorInputs.wall_length *
                          calculatorInputs.wall_height
                        : 0)}{" "}
                    m²
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Paint Type:</span>
                  <span className="detail-value">
                    {calculatorInputs.paint_type === "زيتي"
                      ? "Premium Paint"
                      : "Standard Paint"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Service Tier:</span>
                  <span className="detail-value">
                    {serviceTiers.find(
                      (tier) => tier.id === calculationResult.tier
                    )?.name || "Standard"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Number of Coats:</span>
                  <span className="detail-value">2</span>
                </div>
                <hr />
                <div className="detail-item">
                  <span className="detail-label">Material Cost:</span>
                  <span className="detail-value">
                    AED {calculationResult.materialsCost.toFixed(0)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Labor Cost:</span>
                  <span className="detail-value">
                    AED {calculationResult.laborCost.toFixed(0)}
                  </span>
                </div>
                <hr />
                <div
                  className="detail-item"
                  style={{ fontWeight: "bold", fontSize: "1.2rem" }}
                >
                  <span className="detail-label">Total Cost:</span>
                  <span className="detail-value">
                    AED {calculationResult.totalPrice.toFixed(0)}
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
