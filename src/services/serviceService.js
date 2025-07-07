import buildingzData from '../data/json/buildingzData.json';

// Get all services
export const getAllServices = async () => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Flatten all services from all categories
    const services = [];
    buildingzData.categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.services.forEach(service => {
          services.push({
            ...service,
            categoryId: category.id,
            categoryName: category.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name
          });
        });
      });
    });
    
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

// Get service by ID
export const getServiceById = async (serviceId) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let foundService = null;
    
    // Search through all categories and subcategories
    for (const category of buildingzData.categories) {
      for (const subcategory of category.subcategories) {
        const service = subcategory.services.find(s => s.id === parseInt(serviceId));
        if (service) {
          foundService = {
            ...service,
            categoryId: category.id,
            categoryName: category.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name
          };
          break;
        }
      }
      if (foundService) break;
    }
    
    if (!foundService) {
      throw new Error(`Service with ID ${serviceId} not found`);
    }
    
    return foundService;
  } catch (error) {
    console.error(`Error fetching service ${serviceId}:`, error);
    throw error;
  }
};

// Get services by category
export const getServicesByCategory = async (categoryId) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const category = buildingzData.categories.find(c => c.id === parseInt(categoryId));
    
    if (!category) {
      throw new Error(`Category with ID ${categoryId} not found`);
    }
    
    const services = [];
    
    category.subcategories.forEach(subcategory => {
      subcategory.services.forEach(service => {
        services.push({
          ...service,
          categoryId: category.id,
          categoryName: category.name,
          subcategoryId: subcategory.id,
          subcategoryName: subcategory.name
        });
      });
    });
    
    return services;
  } catch (error) {
    console.error(`Error fetching services for category ${categoryId}:`, error);
    throw error;
  }
};

// Search services
export const searchServices = async (query) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!query) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const services = await getAllServices();
    
    return services.filter(service => {
      return (
        service.name.toLowerCase().includes(normalizedQuery) ||
        service.description.toLowerCase().includes(normalizedQuery) ||
        service.categoryName.toLowerCase().includes(normalizedQuery) ||
        service.subcategoryName.toLowerCase().includes(normalizedQuery) ||
        service.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery))
      );
    });
  } catch (error) {
    console.error('Error searching services:', error);
    throw error;
  }
}; 