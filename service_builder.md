# Service Builder API Documentation

This document provides comprehensive documentation for the Service Builder API. The API allows frontend applications to retrieve service information, calculate prices, and submit orders.

## Base URL

All API endpoints are prefixed with `/api/service-builder`.

## Authentication

Currently, the API endpoints are public and do not require authentication. If you need to implement authentication, consider using Laravel Sanctum or Passport.

## Response Format

All responses are returned in JSON format with the following structure:

```json
{
  "success": true|false,
  "message": "Optional message (usually for errors)",
  "errors": {}, // Validation errors (if any)
  "data": {} // Response data
}
```

## Endpoints

### 1. Get All Categories

Retrieves a list of all categories with their subcategories, regardless of active status.

- **URL**: `/categories`
- **Method**: `GET`
- **Response**:

```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Home Services",
      "slug": "home-services",
      "image_path": "service-builder/categories/home-services.jpg",
      "sort_order": 1,
      "is_active": true,
      "children": [
        {
          "id": 3,
          "name": "Cleaning",
          "slug": "cleaning",
          "parent_id": 1,
          "image_path": "service-builder/categories/cleaning.jpg",
          "sort_order": 1,
          "is_active": true
        },
        {
          "id": 4,
          "name": "Repairs",
          "slug": "repairs",
          "parent_id": 1,
          "image_path": "service-builder/categories/repairs.jpg",
          "sort_order": 2,
          "is_active": true
        }
      ]
    },
    {
      "id": 2,
      "name": "Business Services",
      "slug": "business-services",
      "image_path": "service-builder/categories/business-services.jpg",
      "sort_order": 2,
      "is_active": true,
      "children": []
    }
  ]
}
```

### 2. Get Category Details

Retrieves detailed information about a specific category, including its subcategories and services. All subcategories are returned regardless of active status, but only active services are included.

- **URL**: `/categories/{id}`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: The ID of the category
- **Response**:

```json
{
  "success": true,
  "category": {
    "id": 1,
    "name": "Home Services",
    "slug": "home-services",
    "image_path": "service-builder/categories/home-services.jpg",
    "sort_order": 1,
    "is_active": true,
    "children": [
      {
        "id": 3,
        "name": "Cleaning",
        "slug": "cleaning",
        "parent_id": 1,
        "image_path": "service-builder/categories/cleaning.jpg",
        "sort_order": 1,
        "is_active": true
      },
      {
        "id": 4,
        "name": "Repairs",
        "slug": "repairs",
        "parent_id": 1,
        "image_path": "service-builder/categories/repairs.jpg",
        "sort_order": 2,
        "is_active": true
      }
    ],
    "services": [
      {
        "id": 1,
        "name": "Home Cleaning",
        "description": "Professional home cleaning services",
        "slug": "home-cleaning",
        "category_id": 1,
        "sort_order": 1,
        "is_active": true
      },
      {
        "id": 2,
        "name": "Window Cleaning",
        "description": "Professional window cleaning",
        "slug": "window-cleaning",
        "category_id": 1,
        "sort_order": 2,
        "is_active": true
      }
    ]
  }
}
```

### 3. Get All Services

Retrieves a list of all active services.

- **URL**: `/services`
- **Method**: `GET`
- **Response**:

```json
{
  "success": true,
  "services": [
    {
      "id": 1,
      "name": "Home Cleaning",
      "description": "Professional home cleaning services",
      "slug": "home-cleaning",
      "preview_image": "service-builder/services/home-cleaning.jpg"
    },
    {
      "id": 2,
      "name": "Lawn Care",
      "description": "Complete lawn maintenance",
      "slug": "lawn-care",
      "preview_image": "service-builder/services/lawn-care.jpg"
    }
  ]
}
```

### 4. Get Service Details

Retrieves detailed information about a specific service, including its fields and products.

- **URL**: `/services/{id}`
- **Method**: `GET`
- **URL Parameters**:
  - `id`: The ID of the service
- **Response**:

```json
{
  "success": true,
  "service": {
    "id": 1,
    "name": "Home Cleaning",
    "description": "Professional home cleaning services",
    "slug": "home-cleaning",
    "preview_image": "service-builder/services/home-cleaning.jpg",
    "fields": [
      {
        "id": 1,
        "name": "Home Size",
        "type": "select",
        "description": "Size of your home",
        "is_required": true,
        "options": [
          {
            "id": 1,
            "name": "Small (up to 1000 sq ft)",
            "price_adjustment": 0
          },
          {
            "id": 2,
            "name": "Medium (1000-2000 sq ft)",
            "price_adjustment": 25
          },
          {
            "id": 3,
            "name": "Large (2000+ sq ft)",
            "price_adjustment": 50
          }
        ]
      }
    ],
    "tags": [
      {
        "id": 1,
        "name": "Basic",
        "color": "#3498db"
      },
      {
        "id": 2,
        "name": "Deep Clean",
        "color": "#e74c3c"
      }
    ],
    "productsByTag": [
      {
        "tag": {
          "id": 1,
          "name": "Basic",
          "color": "#3498db"
        },
        "products": [
          {
            "id": 1,
            "name": "Dusting",
            "description": "Dust all accessible surfaces",
            "unit_price": 20,
            "image_path": "service-builder/products/dusting.jpg",
            "quantity_toggle": false
          }
        ]
      }
    ],
    "productsWithoutTags": [
      {
        "id": 5,
        "name": "Window Cleaning",
        "description": "Clean all windows",
        "unit_price": 35,
        "image_path": "service-builder/products/window-cleaning.jpg",
        "quantity_toggle": true,
        "min_quantity": 1,
        "max_quantity": 20
      }
    ]
  }
}
```

### 5. Get All Tags

Retrieves a list of all product tags.

- **URL**: `/tags`
- **Method**: `GET`
- **Response**:

```json
{
  "success": true,
  "tags": [
    {
      "id": 1,
      "name": "Basic",
      "color": "#3498db"
    },
    {
      "id": 2,
      "name": "Deep Clean",
      "color": "#e74c3c"
    }
  ]
}
```

### 6. Calculate Price

Calculates the price of a service based on selected options and products.

- **URL**: `/calculate`
- **Method**: `POST`
- **Request Body**:

```json
{
  "service_id": 1,
  "field_values": [
    {
      "field_id": 1,
      "option_id": 2,
      "value": "Medium"
    }
  ],
  "products": [
    {
      "product_id": 1,
      "quantity": 1
    },
    {
      "product_id": 5,
      "quantity": 3
    }
  ]
}
```

- **Response**:

```json
{
  "success": true,
  "calculation": {
    "subtotal": 125,
    "field_adjustments": 25,
    "total": 150,
    "products": [
      {
        "id": 1,
        "name": "Dusting",
        "unit_price": 20,
        "quantity": 1,
        "total": 20
      },
      {
        "id": 5,
        "name": "Window Cleaning",
        "unit_price": 35,
        "quantity": 3,
        "total": 105
      }
    ],
    "fields": [
      {
        "id": 1,
        "name": "Home Size",
        "value": "Medium",
        "price_adjustment": 25,
        "option": {
          "id": 2,
          "name": "Medium (1000-2000 sq ft)",
          "price_adjustment": 25
        }
      }
    ]
  }
}
```

### Example Usage Flow

1. First, get the service details:
   ```
   GET /api/service-builder/services/1
   ```

2. From the response, you'll get the service fields and available products.

3. Let the user select options and products.

4. Send those selections to the calculate endpoint:
   ```
   POST /api/service-builder/calculate
   ```
   with the JSON body as shown above.

5. The response will contain the calculated price breakdown.

### 7. Submit Order

Submits a service order.

- **URL**: `/submit-order`
- **Method**: `POST`
- **Request Body**:

```json
{
  "service_id": 1,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "555-123-4567",
  "field_values": [
    {
      "field_id": 1,
      "option_id": 2,
      "value": "Medium"
    }
  ],
  "products": [
    {
      "product_id": 1,
      "quantity": 1
    },
    {
      "product_id": 5,
      "quantity": 3
    }
  ],
  "notes": "Please clean the windows thoroughly."
}
```

- **Response**:

```json
{
  "success": true,
  "message": "Order submitted successfully",
  "order_id": "ORD-60f1a5e3d4b8c",
  "estimated_delivery": "2023-08-01"
}
```

## Error Handling

When an error occurs, the API will return a response with `success: false` and an error message. For validation errors, the `errors` object will contain detailed information about which fields failed validation.

Example error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "customer_email": [
      "The customer email must be a valid email address."
    ],
    "products.0.quantity": [
      "The products.0.quantity must be at least 1."
    ]
  }
}
```

## Common HTTP Status Codes

- `200 OK`: Request was successful
- `400 Bad Request`: The request was malformed
- `404 Not Found`: The requested resource was not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

## Consuming the API in Frontend Applications

### Example with JavaScript Fetch API

```javascript
// Get all services
fetch('/api/service-builder/services')
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Process services
      console.log(data.services);
    }
  })
  .catch(error => console.error('Error:', error));

// Calculate price
const calculation = {
  service_id: 1,
  field_values: [
    {
      field_id: 1,
      option_id: 2
    }
  ],
  products: [
    {
      product_id: 1,
      quantity: 1
    }
  ]
};

fetch('/api/service-builder/calculate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(calculation)
})
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Process calculation
      console.log(data.calculation);
    }
  })
  .catch(error => console.error('Error:', error));
```

### Example with Axios

```javascript
import axios from 'axios';

// Get service details
axios.get(`/api/service-builder/services/home-cleaning`)
  .then(response => {
    if (response.data.success) {
      // Process service details
      console.log(response.data.service);
    }
  })
  .catch(error => console.error('Error:', error));

// Submit order
const order = {
  service_id: 1,
  customer_name: "John Doe",
  customer_email: "john@example.com",
  customer_phone: "555-123-4567",
  field_values: [
    {
      field_id: 1,
      option_id: 2
    }
  ],
  products: [
    {
      product_id: 1,
      quantity: 1
    }
  ]
};

axios.post('/api/service-builder/submit-order', order)
  .then(response => {
    if (response.data.success) {
      // Process order submission
      console.log(response.data.order_id);
    }
  })
  .catch(error => {
    if (error.response && error.response.data.errors) {
      // Handle validation errors
      console.error('Validation errors:', error.response.data.errors);
    } else {
      console.error('Error:', error);
    }
  });
```

## Notes for Implementation

1. All images are served from the `/storage` directory. To get the full URL, prepend your application URL and `/storage/` to the `image_path` values.

2. The API currently returns a simplified response for order submission. In a production environment, you would want to:
   - Create an actual order in your database
   - Send confirmation emails
   - Process payments
   - Generate invoices

3. For security, consider implementing:
   - Rate limiting
   - API authentication
   - CORS protection

4. The API is designed to be RESTful and follows Laravel's best practices for API development. 