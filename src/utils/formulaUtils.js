/**
 * Formula Utilities for BuildingZ
 * These utilities help with formula validation and service creation
 */

/**
 * Validates a formula string to ensure it's safe to evaluate
 * @param {string} formula - The formula to validate
 * @returns {boolean} - Whether the formula is valid
 */
export const validateFormula = (formula) => {
  // Check for potentially dangerous code patterns
  const dangerousPatterns = [
    'eval', 'Function(', 'setTimeout', 'setInterval',
    'fetch', 'XMLHttpRequest', 'import', 'require',
    'process', 'window', 'document', 'localStorage'
  ];

  const containsDangerousPattern = dangerousPatterns.some(pattern => 
    formula.includes(pattern)
  );

  if (containsDangerousPattern) {
    return false;
  }

  // Try to parse the formula as a function
  try {
    // eslint-disable-next-line no-new-func
    new Function('return ' + formula);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Creates a new service generator object
 * @param {object} params - Service parameters
 * @returns {object} - The new service generator
 */
export const createServiceGenerator = ({
  id,
  name,
  description,
  inputs,
  pricingFormula,
  laborFormula,
  materialsFormula
}) => {
  // Validate required fields
  if (!id || !name || !inputs || !pricingFormula) {
    throw new Error('Missing required fields for service generator');
  }

  // Validate formulas
  if (!validateFormula(pricingFormula)) {
    throw new Error('Invalid pricing formula');
  }

  if (laborFormula && !validateFormula(laborFormula)) {
    throw new Error('Invalid labor formula');
  }

  if (materialsFormula && !validateFormula(materialsFormula)) {
    throw new Error('Invalid materials formula');
  }

  // Create and return the generator object
  return {
    id,
    name,
    description: description || '',
    inputs,
    pricing_formula: pricingFormula,
    labor_formula: laborFormula || null,
    materials_formula: materialsFormula || null
  };
};

/**
 * Creates a new input field for a service generator
 * @param {object} params - Input parameters
 * @returns {object} - The new input field
 */
export const createInput = ({
  name,
  label,
  type,
  unit = '',
  options = [],
  required = false,
  default: defaultValue = null
}) => {
  // Validate required fields
  if (!name || !label || !type) {
    throw new Error('Missing required fields for input');
  }

  // Validate input type
  const validTypes = ['number', 'select', 'boolean', 'text'];
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid input type: ${type}`);
  }

  // For select inputs, options are required
  if (type === 'select' && (!options || options.length === 0)) {
    throw new Error('Select inputs require options');
  }

  // Create and return the input object
  const input = {
    name,
    label,
    type,
    required
  };

  // Add optional fields if provided
  if (unit) input.unit = unit;
  if (options && options.length > 0) input.options = options;
  if (defaultValue !== null) input.default = defaultValue;

  return input;
};

/**
 * Evaluates a formula with the given variables
 * @param {string} formula - The formula to evaluate
 * @param {object} variables - The variables to use in the formula
 * @returns {number} - The result of the formula
 */
export const evaluateFormula = (formula, variables) => {
  if (!formula) {
    console.error("Empty formula provided");
    return 0;
  }

  if (!validateFormula(formula)) {
    console.error("Invalid or potentially unsafe formula:", formula);
    throw new Error('Invalid or potentially unsafe formula');
  }

  // Preprocess variables - ensure numeric values where possible
  const processedVariables = { ...variables };
  Object.keys(processedVariables).forEach(key => {
    // Convert string numbers to actual numbers
    if (typeof processedVariables[key] === 'string' && !isNaN(processedVariables[key]) && processedVariables[key] !== '') {
      processedVariables[key] = parseFloat(processedVariables[key]);
    }
    // Handle empty strings
    if (processedVariables[key] === '') {
      processedVariables[key] = 0;
    }
  });

  const paramNames = Object.keys(processedVariables);
  const paramValues = Object.values(processedVariables);
  
  // Debug information
  console.log(`Evaluating formula: "${formula}"`);
  console.log("With parameters:", paramNames);
  console.log("And values:", paramValues);
  
  try {
    // Create a function with the variable names as parameters
    // eslint-disable-next-line no-new-func
    const evalFunction = new Function(...paramNames, `
      console.log("Formula execution started");
      const result = ${formula};
      console.log("Formula execution completed with result:", result);
      return result;
    `);
    
    // Execute the function with the variable values
    const result = evalFunction(...paramValues);
    
    // Validate result
    if (isNaN(result)) {
      console.error("Formula returned NaN:", formula);
      return 0;
    }
    
    if (!isFinite(result)) {
      console.error("Formula returned Infinity:", formula);
      return 0;
    }
    
    return result;
  } catch (error) {
    console.error("Error evaluating formula:", error.message);
    console.error("Formula:", formula);
    console.error("Variables:", processedVariables);
    console.error("Stack trace:", error.stack);
    return 0;
  }
};

/**
 * Example usage:
 * 
 * // Create a new painting service
 * const paintingService = createServiceGenerator({
 *   id: 10,
 *   name: "Interior Wall Painting",
 *   description: "Interior wall painting service",
 *   inputs: [
 *     createInput({
 *       name: "area",
 *       label: "Area",
 *       type: "number",
 *       unit: "m²",
 *       required: true,
 *       default: 0
 *     }),
 *     createInput({
 *       name: "paint_product_id",
 *       label: "Paint Type",
 *       type: "select",
 *       options: [1, 2],
 *       required: true,
 *       default: 1
 *     })
 *   ],
 *   pricingFormula: "area * price_unit + (Math.ceil(area / 20) * 60)",
 *   laborFormula: "area * price_unit * 0.7",
 *   materialsFormula: "area * price_unit * 0.3 + (Math.ceil(area / 20) * 60)"
 * });
 */ 