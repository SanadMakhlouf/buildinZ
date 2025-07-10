import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainContent.css";
import * as dataService from "../../services/dataService";
import * as bookingService from "../../services/bookingService";
import { evaluateFormula } from "../../utils/formulaUtils";
import { Close, Calculate, Info, BookOnline } from "@mui/icons-material";

const MainContent = ({ selectedService }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [inputs, setInputs] = useState({});
  const [currentGenerator, setCurrentGenerator] = useState(null);
  const [derivedInputs, setDerivedInputs] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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

  // Load products when service changes
  useEffect(() => {
    if (selectedService) {
      // Mock products data based on service type
      const mockProducts = [
        {
          id: 1,
          name: "دهان جوتن مميز",
          description: "دهان داخلي عالي الجودة من جوتن",
          price: 120,
          currency: "درهم",
          image:
            "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format",
          serviceId: 1, // Paint service
        },
        {
          id: 2,
          name: "دهان سايبس الترا",
          description: "دهان اقتصادي للجدران الداخلية",
          price: 60,
          currency: "درهم",
          image:
            "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&auto=format",
          serviceId: 1,
        },
        {
          id: 3,
          name: "دهان جوتن فاخر",
          description: "دهان داخلي فاخر مع لمسة حريرية",
          price: 150,
          currency: "درهم",
          image:
            "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format",
          serviceId: 1,
        },
        {
          id: 4,
          name: "سيراميك إيطالي",
          description: "سيراميك فاخر مستورد من إيطاليا",
          price: 90,
          currency: "درهم",
          image:
            "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=500&auto=format",
          serviceId: 2, // Flooring service
        },
        {
          id: 5,
          name: "باركيه خشبي",
          description: "باركيه خشبي طبيعي عالي الجودة",
          price: 180,
          currency: "درهم",
          image:
            "https://images.unsplash.com/photo-1584467541268-b040f83be3f9?w=500&auto=format",
          serviceId: 2,
        },
        {
          id: 6,
          name: "رخام طبيعي",
          description: "رخام طبيعي فاخر",
          price: 250,
          currency: "درهم",
          image:
            "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=500&auto=format",
          serviceId: 2,
        },
      ];

      // Filter products based on selected service
      const filteredProducts = mockProducts.filter(
        (product) => product.serviceId === selectedService.id
      );
      setProducts(filteredProducts);

      // Mock generator data
      const mockGenerator = {
        id: 1,
        name: "حاسبة التكلفة",
        description: "حاسبة لتقدير تكلفة الخدمة",
        inputs: [
          {
            id: "area",
            name: "area",
            label: "المساحة",
            type: "number",
            unit: "m²",
            required: true,
            default: 0,
          },
          {
            id: "condition",
            name: "condition",
            label: "الحالة",
            type: "select",
            options: ["ممتازة", "جيدة", "سيئة"],
            required: true,
            default: "جيدة",
          },
        ],
        formulas: {
          pricing: {
            formula: "(area * 25) + (product_price * Math.ceil(area / 20))",
          },
          labor: {
            formula: "area * 25",
          },
          materials: {
            formula: "product_price * Math.ceil(area / 20)",
          },
          derived_inputs: [
            {
              name: "estimated_time",
              label: "الوقت المقدر",
              formula: "Math.ceil(area / 10)",
              unit: "ساعة",
            },
          ],
        },
      };

      setCurrentGenerator(mockGenerator);
    } else {
      setProducts([]);
    }
  }, [selectedService]);

  // Handle input changes in calculator
  const handleInputChange = async (inputName, value) => {
    const newInputs = { ...inputs, [inputName]: value };
    setInputs(newInputs);

    if (currentGenerator?.formulas?.derived_inputs) {
      setIsCalculating(true);
      try {
        const newDerivedInputs = {};
        const variables = {
          ...newInputs,
          product_price: selectedProduct.price,
        };

        // Calculate derived values
        for (const derivedInput of currentGenerator.formulas.derived_inputs) {
          try {
            const result = evaluateFormula(derivedInput.formula, variables);
            newDerivedInputs[derivedInput.name] = result;
          } catch (error) {
            console.error(`Error calculating ${derivedInput.name}:`, error);
          }
        }

        // Calculate costs
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

  // Handle booking form changes
  const handleBookingFormChange = (field, value) => {
    setBookingForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle booking submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setShowSuccessMessage(false);
      navigate("/");
    }, 2000);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `${amount.toLocaleString("en-US")} درهم`;
  };

  // Early return if no service is selected
  if (!selectedService) {
    return (
      <div className="empty-state">
        <div className="empty-state-animation">
          <div className="circle-animation"></div>
          <div className="icon-container">
            <Info style={{ fontSize: 50, color: "#0066cc" }} />
          </div>
        </div>
        <h2>اختر خدمة للبدء</h2>
        <p>
          يمكنك اختيار إحدى الخدمات من القائمة على اليمين لعرض المنتجات المتوفرة
        </p>
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
              <p className="product-price">{formatCurrency(product.price)}</p>
              <button
                className="calculate-button"
                onClick={() => {
                  setSelectedProduct(product);
                  setShowCalculator(true);
                }}
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
                  </p>
                </div>
              </div>

              {/* Calculator Inputs */}
              <div className="calculator-inputs">
                {currentGenerator.inputs.map((input) => (
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
                        {input.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
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
                ))}
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
                      onClick={() => setShowBookingModal(true)}
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
                onClick={() => setShowBookingModal(false)}
              >
                <Close />
              </button>
            </div>

            {showSuccessMessage ? (
              <div className="success-message">
                <h3>تم تأكيد الحجز بنجاح!</h3>
                <p>سنتواصل معك قريباً</p>
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
                  />
                </div>

                <div className="form-group">
                  <label>العنوان</label>
                  <textarea
                    required
                    value={bookingForm.address}
                    onChange={(e) =>
                      handleBookingFormChange("address", e.target.value)
                    }
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
