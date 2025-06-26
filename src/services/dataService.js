import buildingzData from '../data/json/buildingzData.json';
import { v4 as uuidv4 } from 'uuid';

// In a real application, this would be a server API call
// Here we're simulating it with localStorage for demo purposes
const saveData = (data) => {
  localStorage.setItem('buildingzData', JSON.stringify(data));
  return true;
};

// Load data from localStorage if available, otherwise use the default data
const loadData = () => {
  const savedData = localStorage.getItem('buildingzData');
  if (savedData) {
    return JSON.parse(savedData);
  }
  // Initialize with default data
  saveData(buildingzData);
  return buildingzData;
};

// Get the next available ID for a collection
const getNextId = (collection) => {
  const data = loadData();
  const ids = data[collection].map(item => item.id);
  return Math.max(...ids, 0) + 1;
};

// CRUD operations for categories
export const getCategories = () => {
  const data = loadData();
  return data.categories;
};

export const getCategoryById = (id) => {
  const data = loadData();
  return data.categories.find(category => category.id === id);
};

export const createCategory = (category) => {
  const data = loadData();
  const newCategory = {
    ...category,
    id: getNextId('categories'),
    subcategories: []
  };
  data.categories.push(newCategory);
  saveData(data);
  return newCategory;
};

export const updateCategory = (id, updatedCategory) => {
  const data = loadData();
  const index = data.categories.findIndex(category => category.id === id);
  if (index !== -1) {
    data.categories[index] = {
      ...data.categories[index],
      ...updatedCategory,
      id: id // Ensure ID doesn't change
    };
    saveData(data);
    return data.categories[index];
  }
  return null;
};

export const deleteCategory = (id) => {
  const data = loadData();
  const index = data.categories.findIndex(category => category.id === id);
  if (index !== -1) {
    data.categories.splice(index, 1);
    saveData(data);
    return true;
  }
  return false;
};

// CRUD operations for subcategories
export const getSubcategories = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category ? category.subcategories : [];
};

export const getSubcategoryById = (categoryId, subcategoryId) => {
  const category = getCategoryById(categoryId);
  return category ? category.subcategories.find(sub => sub.id === subcategoryId) : null;
};

export const createSubcategory = (categoryId, subcategory) => {
  const data = loadData();
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  
  if (categoryIndex === -1) return null;
  
  const newSubcategory = {
    ...subcategory,
    id: Math.max(...data.categories[categoryIndex].subcategories.map(sub => sub.id), 0) + 1,
    services: []
  };
  
  data.categories[categoryIndex].subcategories.push(newSubcategory);
  saveData(data);
  return newSubcategory;
};

export const updateSubcategory = (categoryId, subcategoryId, updatedSubcategory) => {
  const data = loadData();
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  
  if (categoryIndex === -1) return null;
  
  const subcategoryIndex = data.categories[categoryIndex].subcategories.findIndex(sub => sub.id === subcategoryId);
  
  if (subcategoryIndex === -1) return null;
  
  data.categories[categoryIndex].subcategories[subcategoryIndex] = {
    ...data.categories[categoryIndex].subcategories[subcategoryIndex],
    ...updatedSubcategory,
    id: subcategoryId // Ensure ID doesn't change
  };
  
  saveData(data);
  return data.categories[categoryIndex].subcategories[subcategoryIndex];
};

export const deleteSubcategory = (categoryId, subcategoryId) => {
  const data = loadData();
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  
  if (categoryIndex === -1) return false;
  
  const subcategoryIndex = data.categories[categoryIndex].subcategories.findIndex(sub => sub.id === subcategoryId);
  
  if (subcategoryIndex === -1) return false;
  
  data.categories[categoryIndex].subcategories.splice(subcategoryIndex, 1);
  saveData(data);
  return true;
};

// CRUD operations for services
export const getServices = (categoryId, subcategoryId) => {
  const subcategory = getSubcategoryById(categoryId, subcategoryId);
  return subcategory ? subcategory.services : [];
};

export const getServiceById = (categoryId, subcategoryId, serviceId) => {
  const subcategory = getSubcategoryById(categoryId, subcategoryId);
  return subcategory ? subcategory.services.find(service => service.id === serviceId) : null;
};

export const createService = (categoryId, subcategoryId, service) => {
  const data = loadData();
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  if (categoryIndex === -1) return null;
  
  const subcategoryIndex = data.categories[categoryIndex].subcategories.findIndex(sub => sub.id === subcategoryId);
  if (subcategoryIndex === -1) return null;
  
  const newService = {
    ...service,
    id: Math.max(...data.categories[categoryIndex].subcategories[subcategoryIndex].services.map(svc => svc.id), 0) + 1
  };
  
  data.categories[categoryIndex].subcategories[subcategoryIndex].services.push(newService);
  saveData(data);
  return newService;
};

export const updateService = (categoryId, subcategoryId, serviceId, updatedService) => {
  const data = loadData();
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  if (categoryIndex === -1) return null;
  
  const subcategoryIndex = data.categories[categoryIndex].subcategories.findIndex(sub => sub.id === subcategoryId);
  if (subcategoryIndex === -1) return null;
  
  const serviceIndex = data.categories[categoryIndex].subcategories[subcategoryIndex].services.findIndex(svc => svc.id === serviceId);
  if (serviceIndex === -1) return null;
  
  data.categories[categoryIndex].subcategories[subcategoryIndex].services[serviceIndex] = {
    ...data.categories[categoryIndex].subcategories[subcategoryIndex].services[serviceIndex],
    ...updatedService,
    id: serviceId // Ensure ID doesn't change
  };
  
  saveData(data);
  return data.categories[categoryIndex].subcategories[subcategoryIndex].services[serviceIndex];
};

export const deleteService = (categoryId, subcategoryId, serviceId) => {
  const data = loadData();
  const categoryIndex = data.categories.findIndex(cat => cat.id === categoryId);
  if (categoryIndex === -1) return false;
  
  const subcategoryIndex = data.categories[categoryIndex].subcategories.findIndex(sub => sub.id === subcategoryId);
  if (subcategoryIndex === -1) return false;
  
  const serviceIndex = data.categories[categoryIndex].subcategories[subcategoryIndex].services.findIndex(svc => svc.id === serviceId);
  if (serviceIndex === -1) return false;
  
  data.categories[categoryIndex].subcategories[subcategoryIndex].services.splice(serviceIndex, 1);
  saveData(data);
  return true;
};

// CRUD operations for generators
export const getGenerators = () => {
  const data = loadData();
  return data.generators;
};

export const getGeneratorById = (id) => {
  const data = loadData();
  return data.generators.find(generator => generator.id === id);
};

export const createGenerator = (generator) => {
  const data = loadData();
  const newGenerator = {
    ...generator,
    id: getNextId('generators')
  };
  data.generators.push(newGenerator);
  saveData(data);
  return newGenerator;
};

export const updateGenerator = (id, updatedGenerator) => {
  const data = loadData();
  const index = data.generators.findIndex(generator => generator.id === id);
  if (index !== -1) {
    data.generators[index] = {
      ...data.generators[index],
      ...updatedGenerator,
      id: id // Ensure ID doesn't change
    };
    saveData(data);
    return data.generators[index];
  }
  return null;
};

export const deleteGenerator = (id) => {
  const data = loadData();
  const index = data.generators.findIndex(generator => generator.id === id);
  if (index !== -1) {
    data.generators.splice(index, 1);
    saveData(data);
    return true;
  }
  return false;
};

// CRUD operations for products
export const getProducts = () => {
  const data = loadData();
  return data.products;
};

export const getProductById = (id) => {
  const data = loadData();
  return data.products.find(product => product.id === id);
};

export const createProduct = (product) => {
  const data = loadData();
  const newProduct = {
    ...product,
    id: getNextId('products')
  };
  data.products.push(newProduct);
  saveData(data);
  return newProduct;
};

export const updateProduct = (id, updatedProduct) => {
  const data = loadData();
  const index = data.products.findIndex(product => product.id === id);
  if (index !== -1) {
    data.products[index] = {
      ...data.products[index],
      ...updatedProduct,
      id: id // Ensure ID doesn't change
    };
    saveData(data);
    return data.products[index];
  }
  return null;
};

export const deleteProduct = (id) => {
  const data = loadData();
  const index = data.products.findIndex(product => product.id === id);
  if (index !== -1) {
    data.products.splice(index, 1);
    saveData(data);
    return true;
  }
  return false;
};

// CRUD operations for conditions
export const getConditions = () => {
  const data = loadData();
  return data.conditions;
};

export const getConditionById = (id) => {
  const data = loadData();
  return data.conditions.find(condition => condition.id === id);
};

export const createCondition = (condition) => {
  const data = loadData();
  const newCondition = {
    ...condition,
    id: getNextId('conditions')
  };
  data.conditions.push(newCondition);
  saveData(data);
  return newCondition;
};

export const updateCondition = (id, updatedCondition) => {
  const data = loadData();
  const index = data.conditions.findIndex(condition => condition.id === id);
  if (index !== -1) {
    data.conditions[index] = {
      ...data.conditions[index],
      ...updatedCondition,
      id: id // Ensure ID doesn't change
    };
    saveData(data);
    return data.conditions[index];
  }
  return null;
};

export const deleteCondition = (id) => {
  const data = loadData();
  const index = data.conditions.findIndex(condition => condition.id === id);
  if (index !== -1) {
    data.conditions.splice(index, 1);
    saveData(data);
    return true;
  }
  return false;
};

// Get all service tiers
export const getServiceTiers = () => {
  const data = loadData();
  return data.serviceTiers;
};

// Get all input types
export const getInputTypes = () => {
  const data = loadData();
  return data.input_types;
};

// Get all option types
export const getOptionTypes = () => {
  const data = loadData();
  return data.option_types;
};

// Get all units
export const getUnits = () => {
  const data = loadData();
  return data.units;
};

// Export a function to reset data to defaults
export const resetToDefaults = () => {
  saveData(buildingzData);
  return buildingzData;
};

// Export the data service as a default object
const dataService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategories,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getGenerators,
  getGeneratorById,
  createGenerator,
  updateGenerator,
  deleteGenerator,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getConditions,
  getConditionById,
  createCondition,
  updateCondition,
  deleteCondition,
  getServiceTiers,
  getInputTypes,
  getOptionTypes,
  getUnits,
  resetToDefaults
};

export default dataService; 