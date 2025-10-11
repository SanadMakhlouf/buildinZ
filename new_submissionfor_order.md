# Service Builder Services API Documentation

## Overview
Complete API documentation for the Service Builder Services system. This API provides access to services with dynamic fields, multiple images, categories, and products.

**Base URL:** `/api/service-builder`  
**Version:** 2.0  
**Last Updated:** October 11, 2025

---

## Table of Contents
1. [Authentication](#authentication)
2. [Endpoints](#endpoints)
3. [Data Structures](#data-structures)
4. [Response Examples](#response-examples)
5. [Error Handling](#error-handling)

---

## Authentication

Most endpoints are public and don't require authentication. Endpoints that require authentication are marked with 🔒.

**Authentication Header:**
```
Authorization: Bearer YOUR_API_TOKEN
```

---

## Endpoints

### 1. Get All Services

Get a list of all active services with basic information.

**Endpoint:** `GET /api/service-builder/services`  
**Auth Required:** No

**Response:**
```json
{
  "success": true,
  "count": 25,
  "services": [
    {
      "id": 1,
      "name": "Interior Design",
      "slug": "interior-design",
      "description": "Complete interior design services",
      "base_price": 5000.00,
      "category": {
        "id": 1,
        "name": "Design Services",
        "slug": "design-services"
      },
      "main_image": {
        "id": 1,
        "url": "https://yourdomain.com/storage/service-builder/services/main-image.jpg",
        "path": "service-builder/services/main-image.jpg"
      },
      "images": [
        {
          "id": 1,
          "url": "https://yourdomain.com/storage/service-builder/services/image1.jpg",
          "path": "service-builder/services/image1.jpg",
          "is_main": true,
          "sort_order": 0
        },
        {
          "id": 2,
          "url": "https://yourdomain.com/storage/service-builder/services/image2.jpg",
          "path": "service-builder/services/image2.jpg",
          "is_main": false,
          "sort_order": 1
        }
      ],
      "is_active": true,
      "enable_products": true,
      "requires_pricing": true,
      "sort_order": 1
    }
  ]
}
```

---

### 2. Get Service Details

Get complete details of a specific service including fields, options, and products.

**Endpoint:** `GET /api/service-builder/services/{id}`  
**Auth Required:** No

**Parameters:**
- `id` (integer, required) - Service ID

**Response:**
```json
{
  "success": true,
  "service": {
    "id": 1,
    "name": "Interior Design",
    "slug": "interior-design",
    "description": "Complete interior design services with 3D visualization",
    "base_price": 5000.00,
    "sort_order": 1,
    "is_active": true,
    "enable_products": true,
    "enable_dynamic_inputs": true,
    "enable_custom_calculations": false,
    "requires_pricing": true,
    "pricing_formula": null,
    
    "category": {
      "id": 1,
      "name": "Design Services",
      "slug": "design-services",
      "description": "Professional design services"
    },
    
    "main_image": {
      "id": 1,
      "url": "https://yourdomain.com/storage/service-builder/services/main.jpg",
      "path": "service-builder/services/main.jpg"
    },
    
    "images": [
      {
        "id": 1,
        "url": "https://yourdomain.com/storage/service-builder/services/image1.jpg",
        "path": "service-builder/services/image1.jpg",
        "is_main": true,
        "sort_order": 0
      },
      {
        "id": 2,
        "url": "https://yourdomain.com/storage/service-builder/services/image2.jpg",
        "path": "service-builder/services/image2.jpg",
        "is_main": false,
        "sort_order": 1
      },
      {
        "id": 3,
        "url": "https://yourdomain.com/storage/service-builder/services/image3.jpg",
        "path": "service-builder/services/image3.jpg",
        "is_main": false,
        "sort_order": 2
      }
    ],
    
    "fields": [
      {
        "id": 1,
        "key": "room_type",
        "label": "Room Type",
        "variable_name": "room_type",
        "type": "select",
        "required": true,
        "show_image": true,
        "min_value": null,
        "max_value": null,
        "step": null,
        "unit": null,
        "sort_order": 0,
        "is_active": true,
        "options": [
          {
            "id": 1,
            "value": "living_room",
            "label": "Living Room",
            "price_modifier": 0.00,
            "is_default": true,
            "image_url": "https://yourdomain.com/storage/service-builder/options/living-room.jpg",
            "image_path": "service-builder/options/living-room.jpg",
            "sort_order": 0,
            "is_active": true
          },
          {
            "id": 2,
            "value": "bedroom",
            "label": "Bedroom",
            "price_modifier": 500.00,
            "is_default": false,
            "image_url": "https://yourdomain.com/storage/service-builder/options/bedroom.jpg",
            "image_path": "service-builder/options/bedroom.jpg",
            "sort_order": 1,
            "is_active": true
          }
        ]
      },
      {
        "id": 2,
        "key": "room_size",
        "label": "Room Size",
        "variable_name": "room_size",
        "type": "number",
        "required": true,
        "show_image": false,
        "min_value": 10,
        "max_value": 500,
        "step": 1,
        "unit": "m²",
        "sort_order": 1,
        "is_active": true,
        "options": []
      },
      {
        "id": 3,
        "key": "design_style",
        "label": "Design Style",
        "variable_name": "design_style",
        "type": "radio",
        "required": true,
        "show_image": true,
        "min_value": null,
        "max_value": null,
        "step": null,
        "unit": null,
        "sort_order": 2,
        "is_active": true,
        "options": [
          {
            "id": 3,
            "value": "modern",
            "label": "Modern",
            "price_modifier": 0.00,
            "is_default": true,
            "image_url": "https://yourdomain.com/storage/service-builder/options/modern.jpg",
            "image_path": "service-builder/options/modern.jpg",
            "sort_order": 0,
            "is_active": true
          },
          {
            "id": 4,
            "value": "classic",
            "label": "Classic",
            "price_modifier": 1000.00,
            "is_default": false,
            "image_url": "https://yourdomain.com/storage/service-builder/options/classic.jpg",
            "image_path": "service-builder/options/classic.jpg",
            "sort_order": 1,
            "is_active": true
          },
          {
            "id": 5,
            "value": "minimalist",
            "label": "Minimalist",
            "price_modifier": 500.00,
            "is_default": false,
            "image_url": "https://yourdomain.com/storage/service-builder/options/minimalist.jpg",
            "image_path": "service-builder/options/minimalist.jpg",
            "sort_order": 2,
            "is_active": true
          }
        ]
      },
      {
        "id": 4,
        "key": "special_requirements",
        "label": "Special Requirements",
        "variable_name": "special_requirements",
        "type": "textarea",
        "required": false,
        "show_image": false,
        "min_value": null,
        "max_value": null,
        "step": null,
        "unit": null,
        "sort_order": 3,
        "is_active": true,
        "options": []
      },
      {
        "id": 5,
        "key": "additional_features",
        "label": "Additional Features",
        "variable_name": "additional_features",
        "type": "checkbox",
        "required": false,
        "show_image": true,
        "min_value": null,
        "max_value": null,
        "step": null,
        "unit": null,
        "sort_order": 4,
        "is_active": true,
        "options": [
          {
            "id": 6,
            "value": "smart_lighting",
            "label": "Smart Lighting",
            "price_modifier": 1500.00,
            "is_default": false,
            "image_url": "https://yourdomain.com/storage/service-builder/options/smart-lighting.jpg",
            "image_path": "service-builder/options/smart-lighting.jpg",
            "sort_order": 0,
            "is_active": true
          },
          {
            "id": 7,
            "value": "custom_furniture",
            "label": "Custom Furniture",
            "price_modifier": 3000.00,
            "is_default": false,
            "image_url": "https://yourdomain.com/storage/service-builder/options/furniture.jpg",
            "image_path": "service-builder/options/furniture.jpg",
            "sort_order": 1,
            "is_active": true
          }
        ]
      },
      {
        "id": 6,
        "key": "project_start_date",
        "label": "Project Start Date",
        "variable_name": "project_start_date",
        "type": "date",
        "required": true,
        "show_image": false,
        "min_value": null,
        "max_value": null,
        "step": null,
        "unit": null,
        "sort_order": 5,
        "is_active": true,
        "options": []
      },
      {
        "id": 7,
        "key": "preferred_time",
        "label": "Preferred Meeting Time",
        "variable_name": "preferred_time",
        "type": "time",
        "required": false,
        "show_image": false,
        "min_value": null,
        "max_value": null,
        "step": null,
        "unit": null,
        "sort_order": 6,
        "is_active": true,
        "options": []
      },
      {
        "id": 8,
        "key": "floor_plan",
        "label": "Upload Floor Plan",
        "variable_name": "floor_plan",
        "type": "file",
        "required": false,
        "show_image": false,
        "min_value": null,
        "max_value": null,
        "step": null,
        "unit": null,
        "sort_order": 7,
        "is_active": true,
        "options": []
      }
    ],
    
    "products": [
      {
        "id": 1,
        "name": "Designer Sofa",
        "description": "Modern 3-seater sofa",
        "price": 2500.00,
        "quantity": 10,
        "unit": "piece",
        "image_url": "https://yourdomain.com/storage/products/sofa.jpg",
        "image_path": "products/sofa.jpg",
        "is_global": false,
        "quantity_toggle": true,
        "is_active": true,
        "tags": [
          {
            "id": 1,
            "name": "Furniture",
            "slug": "furniture"
          },
          {
            "id": 2,
            "name": "Living Room",
            "slug": "living-room"
          }
        ]
      }
    ]
  }
}
```

---

### 3. Submit Service Order

Submit an order for a service with field values and optional products.

**Endpoint:** `POST /api/service-builder/orders`  
**Auth Required:** Optional (orders can be submitted as guest or authenticated user)

**Request Body:**
```json
{
  "service_id": 1,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+971501234567",
  "field_values": [
    {
      "field_id": 1,
      "option_id": 2,
      "value": "bedroom"
    },
    {
      "field_id": 2,
      "value": "150"
    },
    {
      "field_id": 4,
      "value": "Need modern furniture and lighting fixtures"
    }
  ],
  "products": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "notes": "Please call before visiting",
  "payment_method": "cash_on_delivery",
  "shipping_address": {
    "name": "John Doe",
    "street": "Sheikh Zayed Road",
    "city": "Dubai",
    "state": "Dubai",
    "country": "UAE",
    "phone": "+971501234567"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order submitted successfully",
  "order_id": "ORD-2025-001234",
  "order_details": {
    "id": 123,
    "order_number": "ORD-2025-001234",
    "service": {
      "id": 1,
      "name": "Interior Design"
    },
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+971501234567",
    "total_amount": 8500.00,
    "currency": "AED",
    "status": "pending",
    "payment_status": "pending",
    "created_at": "2025-10-11T15:30:00.000000Z"
  }
}
```

**Validation Rules:**
- `service_id`: Required, must exist in services
- `customer_name`: Required, max 255 characters
- `customer_email`: Required, valid email
- `customer_phone`: Required, max 20 characters
- `field_values`: Optional array
  - `field_id`: Required, must exist
  - `option_id`: Optional, must exist if provided
  - `value`: Optional string value
- `products`: Optional array
  - `product_id`: Required, must exist
  - `quantity`: Required, min 1
- `payment_method`: Optional, one of: cash_on_delivery, credit_card, bank_transfer
- `notes`: Optional string

---

## Data Structures

### Service Object (List)
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique service identifier |
| name | string | Service name |
| slug | string | URL-friendly service identifier |
| description | string | Service description |
| base_price | float | Base price in AED |
| category | object | Category information |
| main_image | object | Main service image |
| images | array | All service images |
| is_active | boolean | Service active status |
| enable_products | boolean | Whether products are enabled |
| requires_pricing | boolean | Whether service requires pricing calculation |
| sort_order | integer | Display order |

### Service Object (Detailed)
Includes all fields from list view plus:

| Field | Type | Description |
|-------|------|-------------|
| enable_dynamic_inputs | boolean | Dynamic input fields enabled |
| enable_custom_calculations | boolean | Custom pricing calculations enabled |
| requires_pricing | boolean | Whether service requires pricing calculation |
| pricing_formula | string\|null | Custom pricing formula |
| fields | array | Service dynamic fields |
| products | array | Associated products |

### Field Object
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique field identifier |
| key | string | Field key for backend |
| label | string | Display label |
| variable_name | string | Variable name for calculations |
| type | string | Field type (text, number, select, radio, checkbox, textarea, date, time, file) |
| required | boolean | Whether field is required |
| show_image | boolean | Whether to show images for options |
| min_value | number\|null | Minimum value (for number fields) |
| max_value | number\|null | Maximum value (for number fields) |
| step | number\|null | Step value (for number fields) |
| unit | string\|null | Unit of measurement |
| sort_order | integer | Display order |
| is_active | boolean | Field active status |
| options | array | Field options (for select, radio, checkbox) |

### Field Option Object
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique option identifier |
| value | string | Option value |
| label | string | Display label |
| price_modifier | float | Price adjustment (+ or -) |
| is_default | boolean | Whether this is the default option |
| image_url | string\|null | Full URL to option image |
| image_path | string\|null | Storage path to image |
| sort_order | integer | Display order |
| is_active | boolean | Option active status |

### Image Object
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique image identifier |
| url | string | Full URL to image |
| path | string | Storage path |
| is_main | boolean | Whether this is the main image |
| sort_order | integer | Display order |

### Category Object
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique category identifier |
| name | string | Category name |
| slug | string | URL-friendly identifier |
| description | string\|null | Category description |

### Product Object
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Unique product identifier |
| name | string | Product name |
| description | string | Product description |
| price | float | Product price |
| quantity | integer | Available quantity |
| unit | string | Unit of measurement |
| image_url | string\|null | Full URL to product image |
| image_path | string\|null | Storage path to image |
| is_global | boolean | Available for all services |
| quantity_toggle | boolean | Quantity can be adjusted |
| is_active | boolean | Product active status |
| tags | array | Product tags |

---

## Field Types

### Supported Field Types:
1. **text** - Single line text input
2. **number** - Numeric input with optional min/max/step
3. **textarea** - Multi-line text input
4. **select** - Dropdown selection
5. **radio** - Single choice from options
6. **checkbox** - Multiple choices from options
7. **date** - Date picker
8. **time** - Time picker
9. **file** - File upload

---

## Error Handling

### Error Response Format:
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes:
- `200` - Success
- `404` - Resource not found
- `422` - Validation error
- `500` - Server error

### Common Errors:

**Service Not Found (404):**
```json
{
  "success": false,
  "message": "Service not found"
}
```

---

## Usage Examples

### Example 1: Fetching All Services
```javascript
const response = await fetch('https://yourdomain.com/api/service-builder/services');
const data = await response.json();

if (data.success) {
  console.log(`Found ${data.count} services`);
  data.services.forEach(service => {
    console.log(`${service.name} - AED ${service.base_price}`);
    console.log(`Main Image: ${service.main_image.url}`);
    console.log(`Total Images: ${service.images.length}`);
  });
}
```

### Example 2: Fetching Service Details
```javascript
const serviceId = 1;
const response = await fetch(`https://yourdomain.com/api/service-builder/services/${serviceId}`);
const data = await response.json();

if (data.success) {
  const service = data.service;
  console.log(`Service: ${service.name}`);
  console.log(`Category: ${service.category.name}`);
  console.log(`Base Price: AED ${service.base_price}`);
  
  // Display all images
  service.images.forEach(img => {
    console.log(`Image: ${img.url} ${img.is_main ? '(Main)' : ''}`);
  });
  
  // Display fields
  service.fields.forEach(field => {
    console.log(`Field: ${field.label} (${field.type})`);
    if (field.options.length > 0) {
      field.options.forEach(option => {
        console.log(`  - ${option.label}: +AED ${option.price_modifier}`);
        if (option.image_url) {
          console.log(`    Image: ${option.image_url}`);
        }
      });
    }
  });
}
```

### Example 3: React Component Integration
```jsx
import React, { useState, useEffect } from 'react';

function ServiceDisplay() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://yourdomain.com/api/service-builder/services')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setServices(data.services);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="services-grid">
      {services.map(service => (
        <div key={service.id} className="service-card">
          <img src={service.main_image?.url} alt={service.name} />
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <p className="price">AED {service.base_price}</p>
          <div className="category">{service.category?.name}</div>
          <div className="image-gallery">
            {service.images.map(img => (
              <img 
                key={img.id} 
                src={img.url} 
                className={img.is_main ? 'main' : ''} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Notes

1. **Images**: All image URLs are fully qualified. Use the `url` field for display, not the `path` field.
2. **Price Modifiers**: Options can have positive or negative price modifiers that affect the total service price.
3. **Required Fields**: Check the `required` field to determine if user input is mandatory.
4. **Field Types**: Different field types require different UI components in your frontend.
5. **Option Images**: Check `show_image` field to determine if option images should be displayed.
6. **Multiple Images**: Services can have unlimited images. The `main_image` is also included in the `images` array with `is_main: true`.
7. **Categories**: Categories are included for filtering and navigation purposes.
8. **Products**: Only services with `enable_products: true` will have associated products.
9. **Pricing Requirement**: Check `requires_pricing` field. If `false`, the service doesn't require price calculation in the order form (e.g., consultation services).

---

## Changelog

### Version 2.1 (October 11, 2025)
- ✨ Added `requires_pricing` field to control pricing visibility
- ✨ Added order submission endpoint: `POST /api/service-builder/orders`
- 📝 Added order submission documentation
- 🔧 Improved order handling with new API structure

### Version 2.0 (October 11, 2025)
- ✨ Added multiple images support
- ✨ Added `main_image` field
- ✨ Added `images` array with unlimited images
- ✨ Added option image support
- ✨ Added category information in list view
- ✨ Enhanced field options with image URLs
- 🔧 Improved data structure
- 🔧 Better boolean casting
- 📝 Complete documentation rewrite

### Version 1.0 (July 23, 2025)
- Initial API release
- Basic service listing
- Single image support
- Field and options support

---

## Support

For API support or questions, please contact:
- **Email:** api@yourdomain.com
- **Documentation:** https://yourdomain.com/api/docs

---

**End of Documentation**

