import React, { useState, useEffect } from "react";
import "../styles/MainContent.css";
import { type_de_generator, products } from "../data/dummyData";

const MainContent = ({ selectedService }) => {
  const [calculatorInputs, setCalculatorInputs] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);

  // Initialize calculator inputs when service changes
  useEffect(() => {
    if (selectedService) {
      const generator = type_de_generator.find(
        (g) => g.id === selectedService.foreign_key_generator
      );
      if (generator) {
        const initialInputs = {};
        generator.inputs.forEach((input) => {
          initialInputs[input.name] =
            input.type === "number"
              ? 0
              : input.type === "select"
              ? input.options[0]
              : input.type === "boolean"
              ? false
              : "";
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
      const generator = type_de_generator.find(
        (g) => g.id === selectedService.foreign_key_generator
      );

      if (!generator) {
        console.error("Generator not found for service:", selectedService);
        return;
      }

      const formula = generator.pricing_formula;
      const priceUnit = selectedService.price_unit;

      // Create a context object with all variables needed for evaluation
      const context = {
        ...calculatorInputs,
        price_unit: priceUnit,
        Math: Math,
      };

      // Convert Arabic paint type to English for calculation if needed
      if (selectedService.id === 1 && calculatorInputs.paint_type) {
        context.paint_type =
          calculatorInputs.paint_type === "زيتي" ? "oil" : "water";
      }

      // Evaluate the formula using the context
      // Replace formula variables with actual values
      let evaluationString = formula;

      // Make sure we're only processing defined values
      Object.keys(context).forEach((key) => {
        if (key !== "Math" && context[key] !== undefined) {
          const value =
            typeof context[key] === "string"
              ? `'${context[key]}'` // Wrap strings in quotes
              : context[key];

          // Only replace if both key and value are defined
          if (key && value !== undefined) {
            evaluationString = evaluationString.replace(
              new RegExp(key, "g"),
              value
            );
          }
        }
      });

      console.log("Evaluation string:", evaluationString);

      // Evaluate the formula
      totalPrice = eval(evaluationString);
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
      const serviceProducts = products.filter((p) =>
        selectedService.product_ids.includes(p.id)
      );

      setCalculationResult({
        totalPrice,
        laborCost,
        materialsCost,
        currency: selectedService.currency,
        inputs: { ...calculatorInputs },
        products: serviceProducts,
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

  const currentGenerator = type_de_generator.find(
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

  return (
    <div className="main-content">
      <div className="calculator-section">
        <h2>حاسبة التكلفة - {selectedService.name}</h2>
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
                    handleInputChange(input.name, e.target.value)
                  }
                >
                  {input.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
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
          <button className="calculate-btn" onClick={calculatePrice}>
            احسب التكلفة
          </button>
        </div>
      </div>

      {calculationResult && (
        <div className="result-section">
          <h2>نتيجة الحساب</h2>
          <div className="result-card">
            <div className="result-header">
              <h3>التكلفة الإجمالية</h3>
              <div className="total-price">
                <span className="price">
                  {calculationResult.totalPrice.toFixed(2)}
                </span>
                <span className="currency">{calculationResult.currency}</span>
              </div>
            </div>
            <div className="result-details">
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span className="cost-label">تكلفة العمالة:</span>
                  <span className="cost-value">
                    {calculationResult.laborCost.toFixed(2)}{" "}
                    {calculationResult.currency}
                  </span>
                </div>
                <div className="cost-item">
                  <span className="cost-label">تكلفة المواد:</span>
                  <span className="cost-value">
                    {calculationResult.materialsCost.toFixed(2)}{" "}
                    {calculationResult.currency}
                  </span>
                </div>
              </div>
              <h4>المدخلات:</h4>
              {Object.entries(calculationResult.inputs).map(([key, value]) => {
                const inputDef = currentGenerator.inputs.find(
                  (i) => i.name === key
                );
                if (!inputDef) return null;
                return (
                  <div key={key} className="detail-item">
                    <span className="detail-label">{inputDef.label}:</span>
                    <span className="detail-value">
                      {typeof value === "boolean"
                        ? value
                          ? "نعم"
                          : "لا"
                        : value}
                      {inputDef.unit && ` ${inputDef.unit}`}
                    </span>
                  </div>
                );
              })}
              <h4>المواد المستخدمة:</h4>
              {calculationResult.products.map((product) => (
                <div key={product.id} className="product-item">
                  <span className="product-name">{product.name}</span>
                  <span className="product-price">
                    {product.price} {product.currency}
                  </span>
                  <span className="product-description">
                    {product.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainContent;
