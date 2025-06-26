import React, { useState, useEffect } from "react";
import "../styles/MainContent.css";
import buildingzData from "../data/json/buildingzData.json";

const MainContent = ({ selectedService }) => {
  const [calculatorInputs, setCalculatorInputs] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);
  const [selectedTier, setSelectedTier] = useState("silver");

  // Function to calculate total price based on inputs and selected products
  const calculateTotalPrice = ({
    inputValue,
    priceUnit,
    selectedOptions = [],
    allProducts = [],
  }) => {
    // Step 1: Base price calculation
    let totalPrice = inputValue * priceUnit;

    // Step 2: Add selected options (products) to the total
    selectedOptions.forEach((productId) => {
      const product = allProducts.find((p) => p.id === productId);
      if (product) {
        totalPrice += product.price;
      }
    });

    return totalPrice;
  };

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
          } else {
            // Ensure all other input types have a default value
            initialInputs[input.name] = "";
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

      const priceUnit = selectedService.price_unit;

      // Get all product IDs from inputs that end with "_id"
      const selectedProductIds = [];
      Object.entries(calculatorInputs).forEach(([key, value]) => {
        if (key.includes("_id") && typeof value === "number") {
          selectedProductIds.push(value);
        }
      });

      // Get primary input value based on service type
      let primaryInputValue = 0;
      if (calculatorInputs.area) {
        primaryInputValue = calculatorInputs.area;
      } else if (calculatorInputs.room_area) {
        primaryInputValue = calculatorInputs.room_area;
      } else if (calculatorInputs.wall_length && calculatorInputs.wall_height) {
        primaryInputValue =
          calculatorInputs.wall_length * calculatorInputs.wall_height;
      } else if (calculatorInputs.doors_count) {
        primaryInputValue = calculatorInputs.doors_count;
      } else {
        // Default to 1 if no primary input is found
        primaryInputValue = 1;
      }

      // Calculate total price using our new function
      totalPrice = calculateTotalPrice({
        inputValue: primaryInputValue,
        priceUnit: priceUnit,
        selectedOptions: selectedProductIds,
        allProducts: buildingzData.products,
      });

      // Add additional costs based on service type
      if (selectedService.id === 14 && calculatorInputs.includes_accessories) {
        // For door installation, add accessories cost if selected
        totalPrice += calculatorInputs.doors_count * 120;
      }

      // Calculate labor and materials costs
      laborCost = primaryInputValue * priceUnit;
      materialsCost = totalPrice - laborCost;

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
    // Si l'option est un ID de produit (qu'il se termine par 'product_id' ou '_id')
    if (input.name.includes("_id")) {
      return input.options.map((optionId) => {
        const product = buildingzData.products.find((p) => p.id === optionId);
        return (
          <option key={optionId} value={optionId}>
            {product
              ? `${product.name} - ${product.price} ${product.currency}`
              : `Option ${optionId}`}
          </option>
        );
      });
    }
    // Pour les autres types d'options (comme patterns, conditions, etc.)
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
                {/* Afficher dynamiquement les détails en fonction du service */}
                {Object.entries(calculatorInputs).map(([key, value]) => {
                  // Trouver l'input correspondant dans le générateur actuel
                  const input = currentGenerator.inputs.find(
                    (input) => input.name === key
                  );
                  if (!input) return null;

                  // Formater la valeur en fonction du type d'input
                  let displayValue = value;
                  if (
                    input.type === "select" &&
                    input.name.endsWith("product_id")
                  ) {
                    const product = buildingzData.products.find(
                      (p) => p.id === value
                    );
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

                <div className="detail-item">
                  <span className="detail-label">Service Tier:</span>
                  <span className="detail-value">
                    {serviceTiers.find(
                      (tier) => tier.id === calculationResult.tier
                    )?.name || "Standard"}
                  </span>
                </div>

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
