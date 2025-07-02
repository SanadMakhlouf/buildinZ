import React, { useState, useEffect } from "react";
import "./MainContent.css";
import * as dataService from "../../services/dataService";
import { evaluateFormula } from "../../utils/formulaUtils";
import {
  Description,
  Settings,
  Assessment,
  Calculate,
  TouchApp,
  Info,
} from "@mui/icons-material";

const MainContent = ({ selectedService }) => {
  const [inputs, setInputs] = useState({});
  const [currentGenerator, setCurrentGenerator] = useState(null);
  const [derivedInputs, setDerivedInputs] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const [activeStep, setActiveStep] = useState(1);

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

  // Early return if no service is selected
  if (!selectedService) {
    return (
      <div className="empty-result">
        <p>يرجى اختيار خدمة للبدء</p>
      </div>
    );
  }

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
            onMouseEnter={() => !isCalculating && setActiveStep(1)}
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
            onMouseEnter={() => !isCalculating && setActiveStep(2)}
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

          {/* Third Column - Assessment */}
          <div
            className={`column ${activeStep === 3 ? "active" : ""}`}
            onClick={() => setActiveStep(3)}
            onMouseEnter={() => !isCalculating && setActiveStep(3)}
          >
            <div className="step-number">3</div>
            <div className="column-header">
              <div className="column-icon">
                <Assessment />
              </div>
              <h2>التقييم</h2>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;
