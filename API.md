# BuildingZ API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [User & Profile Management](#user--profile-management)
5. [Address Management](#address-management)
6. [Products](#products)
7. [Services](#services)
8. [Service Builder](#service-builder)
9. [Orders](#orders)
10. [Bookings](#bookings)
11. [Search](#search)
12. [Notifications](#notifications)
13. [Payments](#payments)
14. [Error Handling](#error-handling)
15. [Rate Limiting](#rate-limiting)
16. [Security](#security)

---

## Overview

BuildingZ is a marketplace platform for services and products. This API provides comprehensive endpoints for managing users, products, services, orders, bookings, and more.

**Base URL**: `https://admin.buildingzuae.com/api`

**API Version**: v1

**Content-Type**: `application/json`

**Authentication**: Bearer Token (JWT via Laravel Sanctum)

---

## Base Configuration

### Environment Variables
```javascript
API_BASE_URL: "https://admin.buildingzuae.com/api"
BACKEND_URL: "https://admin.buildingzuae.com"
```

### Request Headers
All authenticated requests must include:
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Response Interceptors
- **401 Unauthorized**: Automatically clears token and redirects to login
- **Network Errors**: Returns user-friendly error messages
- **Validation Errors (422)**: Returns structured error object with field-specific errors

---

## Authentication

### POST /register
Register a new user account.

**Authentication**: Not required

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "StrongPassword123!",
  "password_confirmation": "StrongPassword123!",
  "role": "customer"
}
```

**Field Mapping** (Frontend → Backend):
- `fullName` → `name`
- `email` → `email`
- `password` → `password`
- `confirmPassword` → `password_confirmation`
- `role` → `role` (default: "customer")

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "created_at": "2024-01-15T10:30:45.000000Z"
  }
}
```

**Error Response (422 Validation Error)**:
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "The provided data is invalid.",
  "errors": {
    "email": [
      "The email has already been taken."
    ],
    "password": [
      "The password must be at least 8 characters."
    ]
  },
  "code": "VALIDATION_ERROR"
}
```

**Frontend Logic**:
- Auto-login after successful registration (optional)
- Stores token and user data in localStorage
- Handles field-specific validation errors
- Maps API field names to form field names

---

### POST /login
Authenticate user and generate access token.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "StrongPassword123!",
  "device_name": "Mozilla/5.0..."
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "verified": true,
      "profile_complete": false
    },
    "expires_at": "2024-01-15T11:30:45.000000Z"
  }
}
```

**Frontend Logic**:
- Stores token in `localStorage.setItem('token', token)`
- Stores user data in `localStorage.setItem('user', JSON.stringify(user))`
- Optional "Remember Me" functionality
- Sets `Authorization` header for subsequent requests

---

### POST /forgot-password
Request password reset email.

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

---

### POST /reset-password
Reset password using token from email.

**Authentication**: Not required

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "email": "john.doe@example.com",
  "password": "NewPassword123!",
  "password_confirmation": "NewPassword123!"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### Logout (Client-Side)
Clear authentication data.

**Frontend Implementation**:
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('rememberMe');
```

---

## User & Profile Management

### GET /user
Get authenticated user details.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "customer",
    "verified": true,
    "profile_complete": true,
    "created_at": "2024-01-15T10:30:45.000000Z"
  }
}
```

---

### PUT /profile
Update user profile information.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

**Field Mapping** (Frontend → Backend):
- `fullName` → `name`
- `email` → `email`
- `phone` → `phone`
- `address` → `address`

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.updated@example.com",
    "phone": "+1234567890"
  }
}
```

---

### PUT /notification-preferences
Update user notification preferences.

**Authentication**: Required

**Request Body**:
```json
{
  "email_notifications": true,
  "sms_notifications": false,
  "push_notifications": true,
  "order_updates": true,
  "marketing_emails": false
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true
  }
}
```

---

### DELETE /account
Delete user account permanently.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Frontend Logic**:
- Clears all localStorage data
- Redirects to home page

---

### GET /my-orders
Get current user's order history.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_number": "ORD-2024-001",
      "status": "completed",
      "total": 150.00,
      "created_at": "2024-01-15T10:30:45.000000Z"
    }
  ]
}
```

**Response Format Handling**:
- Handles both `response.data` (array) and `response.data.data` (array) formats
- Returns empty array on error to prevent crashes

---

### GET /my-service-requests
Get user's service request history.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "service_name": "Plumbing Repair",
      "status": "completed",
      "created_at": "2024-01-15T10:30:45.000000Z"
    }
  ]
}
```

---

### GET /my-service-orders
Get user's service builder orders.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "orders": [
    {
      "id": 1,
      "service_name": "Custom Service",
      "status": "pending",
      "total": 250.00
    }
  ]
}
```

---

### GET /my-service-orders/{orderId}
Get specific service builder order details.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "order": {
    "id": 1,
    "service_name": "Custom Service",
    "status": "pending",
    "total": 250.00,
    "details": {}
  }
}
```

---

## Address Management

### GET /addresses
Get all addresses for authenticated user.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Home",
      "address_line1": "123 Main Street",
      "address_line2": "Apt 4B",
      "city": "Dubai",
      "state": "Dubai",
      "postal_code": "12345",
      "country": "UAE",
      "latitude": 25.2048,
      "longitude": 55.2708,
      "is_default": true,
      "place_id": "ChIJRcbZaklDXz4RYlEphFBu5r0"
    }
  ]
}
```

**Error Handling**:
- Returns empty array if unauthenticated (prevents app crashes)
- Handles network errors gracefully

---

### GET /addresses/{id}
Get specific address by ID.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Home",
    "address_line1": "123 Main Street",
    "city": "Dubai",
    "is_default": true
  }
}
```

---

### POST /addresses
Create a new address.

**Authentication**: Required

**Request Body**:
```json
{
  "name": "Home",
  "address_line1": "123 Main Street",
  "address_line2": "Apt 4B",
  "city": "Dubai",
  "state": "Dubai",
  "postal_code": "12345",
  "country": "UAE",
  "latitude": 25.2048,
  "longitude": 55.2708,
  "is_default": false,
  "place_id": "ChIJRcbZaklDXz4RYlEphFBu5r0"
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Address created successfully",
  "data": {
    "id": 1,
    "name": "Home",
    "address_line1": "123 Main Street",
    "is_default": false
  }
}
```

---

### PUT /addresses/{id}
Update an existing address.

**Authentication**: Required

**Request Body**: Same as POST /addresses

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "id": 1,
    "name": "Updated Home",
    "address_line1": "456 New Street"
  }
}
```

---

### DELETE /addresses/{id}
Delete an address.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### PUT /addresses/{id}/default
Set an address as default.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Default address updated successfully",
  "data": {
    "id": 1,
    "is_default": true
  }
}
```

---

### POST /addresses/validate
Validate an address (optional, may use Google Maps API).

**Authentication**: Not required (optional)

**Request Body**:
```json
{
  "address": "123 Main Street, Dubai, UAE"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "formatted_address": "123 Main Street, Dubai, UAE",
    "place_id": "ChIJRcbZaklDXz4RYlEphFBu5r0",
    "latitude": 25.2048,
    "longitude": 55.2708
  }
}
```

**Frontend Utility Methods**:
- `getCurrentLocation()`: Uses browser geolocation API
- `createAddressFromCurrentLocation()`: Creates address from current location
- `getOrCreateDefaultAddress()`: Gets default or creates from location
- `getFallbackLocation()`: Returns Dubai coordinates as fallback

---

## Products

### GET /products
Get all products with optional filters.

**Authentication**: Not required

**Query Parameters**:
- `category` (string): Filter by category
- `brand` (string): Filter by brand
- `size` (string): Filter by size
- `min_price` (number): Minimum price
- `max_price` (number): Maximum price
- `search` (string): Search query
- `sort` (string): Sort order (price_asc, price_desc, name_asc, name_desc)
- `page` (number): Page number
- `limit` (number): Items per page

**Example Request**:
```
GET /products?category=electronics&min_price=100&max_price=500&sort=price_asc&page=1&limit=20
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "description": "Product description",
      "price": 99.99,
      "image": "products/product1.jpg",
      "category": {
        "id": 1,
        "name": "Electronics"
      },
      "in_stock": true,
      "stock_quantity": 50
    }
  ],
  "meta": {
    "total": 100,
    "per_page": 20,
    "current_page": 1,
    "last_page": 5
  }
}
```

---

### GET /products/{id}
Get specific product by ID.

**Authentication**: Not required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Product Name",
    "description": "Detailed product description",
    "price": 99.99,
    "images": [
      "products/product1.jpg",
      "products/product2.jpg"
    ],
    "category": {
      "id": 1,
      "name": "Electronics"
    },
    "specifications": {},
    "reviews": [],
    "in_stock": true
  }
}
```

---

### GET /categories
Get all product categories.

**Authentication**: Not required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Electronics",
      "description": "Electronic products",
      "icon": "electronics.svg",
      "total_products": 50
    }
  ]
}
```

---

### GET /search/products
Search products by query.

**Authentication**: Not required

**Query Parameters**:
- `q` (string, required): Search query

**Example Request**:
```
GET /search/products?q=laptop
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laptop Computer",
      "price": 999.99,
      "image": "products/laptop.jpg"
    }
  ]
}
```

---

## Services

### GET /services
Get all services.

**Authentication**: Not required

**Query Parameters**:
- `category` (string): Filter by category
- `subcategory` (string): Filter by subcategory
- `search` (string): Search query
- `page` (number): Page number
- `limit` (number): Items per page

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Plumbing Repair",
      "description": "Professional plumbing services",
      "category": {
        "id": 1,
        "name": "Home Repair"
      },
      "subcategory": {
        "id": 1,
        "name": "Plumbing"
      },
      "base_price": 150.00,
      "estimated_duration": "2-3 hours",
      "image": "services/plumbing.jpg"
    }
  ]
}
```

---

### GET /services/{id}
Get specific service by ID.

**Authentication**: Not required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Plumbing Repair",
    "description": "Detailed service description",
    "category": {
      "id": 1,
      "name": "Home Repair"
    },
    "pricing_options": [],
    "requirements": [],
    "estimated_duration": "2-3 hours"
  }
}
```

---

### GET /services/categories
Get service categories.

**Authentication**: Not required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Home Repair",
      "subcategories": [
        {
          "id": 1,
          "name": "Plumbing"
        }
      ]
    }
  ]
}
```

---

## Service Builder

**Base URL**: `/service-builder`

### GET /service-builder/categories
Get all categories with subcategories for service builder.

**Authentication**: Not required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Home Repair",
      "subcategories": [
        {
          "id": 1,
          "name": "Plumbing",
          "services": []
        }
      ]
    }
  ]
}
```

---

### GET /service-builder/categories/{id}
Get category details by ID or slug.

**Authentication**: Not required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Home Repair",
    "subcategories": [
      {
        "id": 1,
        "name": "Plumbing",
        "services": [
          {
            "id": 1,
            "name": "Plumbing Repair",
            "description": "Service description"
          }
        ]
      }
    ]
  }
}
```

---

### GET /service-builder/services
Get all services.

**Authentication**: Not required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Service Name",
      "description": "Service description"
    }
  ]
}
```

---

### GET /service-builder/services/{id}
Get service details by ID or slug.

**Authentication**: Not required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Service Name",
    "description": "Detailed service description",
    "pricing": {},
    "options": []
  }
}
```

---

### GET /service-builder/tags
Get all tags.

**Authentication**: Not required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "urgent",
      "slug": "urgent"
    }
  ]
}
```

---

### POST /service-builder/calculate
Calculate service price based on selected options.

**Authentication**: Not required (but recommended for personalized pricing)

**Request Body**:
```json
{
  "service_id": 1,
  "options": {
    "area": 100,
    "tier": "premium",
    "urgency": "normal"
  },
  "address": {
    "city": "Dubai",
    "latitude": 25.2048,
    "longitude": 55.2708
  }
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "base_price": 150.00,
    "options_price": 50.00,
    "location_surcharge": 25.00,
    "total": 225.00,
    "breakdown": {
      "base": 150.00,
      "tier_premium": 50.00,
      "location_dubai": 25.00
    }
  }
}
```

---

### POST /service-builder/orders
Submit a service order.

**Authentication**: Required

**Request Body** (JSON):
```json
{
  "service_id": 1,
  "options": {
    "area": 100,
    "tier": "premium"
  },
  "address_id": 1,
  "scheduled_date": "2024-01-20",
  "scheduled_time": "10:00",
  "notes": "Please call before arrival"
}
```

**Request Body** (FormData - for file uploads):
```javascript
FormData {
  service_id: 1,
  options: JSON.stringify({...}),
  address_id: 1,
  scheduled_date: "2024-01-20",
  files: [File, File]
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Service order created successfully",
  "data": {
    "order": {
      "id": 1,
      "order_number": "SVC-2024-001",
      "service_name": "Plumbing Repair",
      "status": "pending",
      "total": 225.00,
      "scheduled_date": "2024-01-20",
      "scheduled_time": "10:00"
    }
  }
}
```

**Frontend Logic**:
- Supports both JSON and FormData (for file uploads)
- Automatically sets `Content-Type: multipart/form-data` for FormData
- Handles file attachments

---

## Orders

### POST /orders
Create a new order.

**Authentication**: Required

**Request Body**:
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shipping_address_id": 1,
  "billing_address_id": 1,
  "payment_method": "credit_card",
  "notes": "Please deliver in the morning"
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-2024-001",
      "status": "pending",
      "total": 199.98,
      "items": [],
      "shipping_address": {},
      "created_at": "2024-01-15T10:30:45.000000Z"
    },
    "payment_url": "https://payment-gateway.com/checkout/..."
  }
}
```

**Error Handling**:
- Handles empty response body with 200 status
- Returns minimal success response if server returns no details

---

### GET /orders/{id}
Get specific order details.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-2024-001",
      "status": "pending",
      "total": 199.98,
      "items": [
        {
          "id": 1,
          "product": {
            "id": 1,
            "name": "Product Name",
            "price": 99.99
          },
          "quantity": 2,
          "subtotal": 199.98
        }
      ],
      "shipping_address": {},
      "billing_address": {},
      "payment_status": "pending",
      "created_at": "2024-01-15T10:30:45.000000Z"
    }
  }
}
```

---

### GET /my-orders
Get current user's orders.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_number": "ORD-2024-001",
      "status": "completed",
      "total": 199.98,
      "created_at": "2024-01-15T10:30:45.000000Z"
    }
  ]
}
```

**Response Format Handling**:
- Handles `response.data` (array)
- Handles `response.data.data` (array)
- Returns empty array on error

---

### PUT /orders/{id}/status
Update order status (admin/vendor only).

**Authentication**: Required (Admin/Vendor role)

**Request Body**:
```json
{
  "status": "shipped"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "id": 1,
    "status": "shipped"
  }
}
```

---

### PUT /orders/{id}/cancel
Cancel an order.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": 1,
    "status": "cancelled"
  }
}
```

---

### POST /orders/{id}/cancel
Alternative endpoint for canceling order (used in profile service).

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

## Bookings

### GET /bookings
Get all bookings for authenticated user.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "service_name": "Plumbing Repair",
      "status": "pending",
      "scheduled_date": "2024-01-20",
      "scheduled_time": "10:00",
      "created_at": "2024-01-15T10:30:45.000000Z"
    }
  ]
}
```

---

### GET /bookings/{id}
Get specific booking details.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": 1,
      "service_name": "Plumbing Repair",
      "status": "pending",
      "scheduled_date": "2024-01-20",
      "scheduled_time": "10:00",
      "address": {},
      "handyman": null
    }
  }
}
```

---

### POST /bookings
Create a new booking.

**Authentication**: Required

**Request Body**:
```json
{
  "service_id": 1,
  "address_id": 1,
  "scheduled_date": "2024-01-20",
  "scheduled_time": "10:00",
  "notes": "Please call before arrival"
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": 1,
      "service_name": "Plumbing Repair",
      "status": "pending"
    }
  }
}
```

---

### PUT /bookings/{id}/cancel
Cancel a booking.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": 1,
    "status": "cancelled"
  }
}
```

---

## Search

### GET /search
Global search across services, categories, and products.

**Authentication**: Not required

**Query Parameters**:
- `q` (string, required): Search query (supports Arabic and English)
- `type` (string): Result type - `all`, `services`, `categories`, `products` (default: `all`)
- `limit` (number): Maximum results per type (1-100, default: 10)

**Example Request**:
```
GET /search?q=plumbing&type=all&limit=10
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "results": {
    "services": [
      {
        "id": 1,
        "name": "Plumbing Repair",
        "description": "Professional plumbing services",
        "category": "Home Repair"
      }
    ],
    "categories": [
      {
        "id": 1,
        "name": "Home Repair",
        "description": "Home maintenance services"
      }
    ],
    "products": [
      {
        "id": 1,
        "name": "Plumbing Tools",
        "price": 49.99
      }
    ]
  },
  "total_results": 3
}
```

---

### GET /search/services
Search only services (convenience method).

**Query Parameters**:
- `q` (string, required): Search query
- `limit` (number): Maximum results (default: 10)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "services": [
    {
      "id": 1,
      "name": "Plumbing Repair",
      "description": "Professional plumbing services"
    }
  ],
  "total": 1
}
```

---

### GET /search/categories
Search only categories (convenience method).

**Query Parameters**:
- `q` (string, required): Search query
- `limit` (number): Maximum results (default: 10)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Home Repair",
      "description": "Home maintenance services"
    }
  ],
  "total": 1
}
```

---

### GET /search/products
Search only products (convenience method).

**Query Parameters**:
- `q` (string, required): Search query
- `limit` (number): Maximum results (default: 10)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Plumbing Tools",
      "price": 49.99
    }
  ],
  "total": 1
}
```

---

### GET /search (Suggestions)
Get search suggestions for autocomplete.

**Query Parameters**:
- `q` (string, required, minimum 2 characters): Partial search query
- `limit` (number): Maximum suggestions per type (default: 5)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "results": {
    "services": [],
    "categories": [],
    "products": []
  },
  "total_results": 0
}
```

**Frontend Logic**:
- Returns empty results if query is less than 2 characters
- Recommended to debounce API calls for autocomplete

---

## Notifications

### GET /notifications
Get all notifications for authenticated user.

**Authentication**: Required

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 15, max: 50)
- `type` (string): Filter type - `all`, `unread`, `read` (default: `all`)

**Example Request**:
```
GET /notifications?page=1&limit=15&type=unread
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "type": "order_confirmation",
      "title": "Order Confirmed",
      "message": "Your order ORD-2024-001 has been confirmed",
      "read": false,
      "created_at": "2024-01-15T10:30:45.000000Z",
      "data": {
        "order_id": 1,
        "order_number": "ORD-2024-001"
      }
    }
  ],
  "meta": {
    "total": 50,
    "per_page": 15,
    "current_page": 1,
    "last_page": 4,
    "unread_count": 5
  }
}
```

---

### GET /notifications/unread-count
Get unread notification count.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "unread_count": 5
  }
}
```

---

### POST /notifications/mark-read
Mark a specific notification as read.

**Authentication**: Required

**Request Body**:
```json
{
  "notification_id": "uuid-here"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### POST /notifications/mark-all-read
Mark all notifications as read.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "marked_count": 5
  }
}
```

---

### DELETE /notifications/delete
Delete a specific notification.

**Authentication**: Required

**Request Body**:
```json
{
  "notification_id": "uuid-here"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

### DELETE /notifications/clear-all
Clear all notifications.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "All notifications cleared successfully"
}
```

---

### GET /notifications/preferences
Get notification preferences.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "email_notifications": true,
    "sms_notifications": false,
    "push_notifications": true,
    "order_updates": true,
    "marketing_emails": false
  }
}
```

---

### PUT /notifications/preferences
Update notification preferences.

**Authentication**: Required

**Request Body**:
```json
{
  "email_notifications": true,
  "sms_notifications": false,
  "push_notifications": true,
  "order_updates": true,
  "marketing_emails": false
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification preferences updated successfully",
  "data": {
    "email_notifications": true,
    "sms_notifications": false
  }
}
```

---

### POST /notifications/test
Send test notification.

**Authentication**: Required

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Test notification sent successfully"
}
```

---

### Admin Notification Endpoints

#### GET /admin/notifications
Get all admin notifications.

**Authentication**: Required (Admin role)

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): Filter type
- `user_id` (number): Filter by user ID

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "type": "order_created",
      "title": "New Order",
      "message": "Order ORD-2024-001 has been created",
      "user_id": 1,
      "read": false,
      "created_at": "2024-01-15T10:30:45.000000Z"
    }
  ]
}
```

---

#### POST /admin/notifications
Create admin notification.

**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "type": "system_alert",
  "title": "System Maintenance",
  "message": "Scheduled maintenance tonight",
  "priority": "high"
}
```

**Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "id": 1,
    "type": "system_alert",
    "title": "System Maintenance"
  }
}
```

---

#### POST /admin/notifications/send-to-users
Send notifications to specific users.

**Authentication**: Required (Admin role)

**Request Body**:
```json
{
  "type": "marketing",
  "title": "Special Offer",
  "message": "20% off all services",
  "user_ids": [1, 2, 3],
  "send_to_all": false
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notifications sent successfully",
  "data": {
    "sent_count": 3
  }
}
```

---

#### PUT /admin/notifications/{id}/mark-read
Mark admin notification as read.

**Authentication**: Required (Admin role)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

#### POST /admin/notifications/mark-all-read
Mark all admin notifications as read.

**Authentication**: Required (Admin role)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

#### DELETE /admin/notifications/{id}
Delete admin notification.

**Authentication**: Required (Admin role)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

#### DELETE /admin/notifications/clear-all
Clear all admin notifications.

**Authentication**: Required (Admin role)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "All notifications cleared successfully"
}
```

---

#### GET /admin/notifications/statistics
Get notification statistics.

**Authentication**: Required (Admin role)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "total_notifications": 1000,
    "unread_count": 50,
    "read_count": 950,
    "by_type": {
      "order_confirmation": 300,
      "order_status": 200,
      "marketing": 500
    }
  }
}
```

---

## Payments

### POST /payments/verify
Verify payment status after payment gateway redirect.

**Authentication**: Required

**Request Body**:
```json
{
  "session_id": "payment_session_id_from_gateway",
  "order_id": 1
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-2024-001",
      "status": "paid",
      "payment_status": "completed",
      "total": 199.98
    },
    "payment": {
      "id": 1,
      "transaction_id": "txn_123456",
      "amount": 199.98,
      "status": "completed",
      "payment_method": "credit_card"
    }
  }
}
```

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Payment verification failed",
  "message": "Invalid session ID or order ID"
}
```

**Frontend Logic**:
- Called after payment gateway redirects to success/failure page
- Extracts `session_id` and `order_id` from URL parameters
- Updates order status based on verification result
- Stores order data in localStorage for fallback display

---

## Stripe Checkout Integration

### Overview

The system uses **Stripe Checkout Sessions** for secure credit card payments. The backend creates a Stripe Checkout Session and returns a payment link. Users are redirected to Stripe's hosted checkout page, complete payment, and are redirected back to the application.

**Payment Gateway**: Stripe  
**Integration Type**: Stripe Checkout (Hosted Payment Page)  
**Supported Payment Methods**: Credit/Debit Cards

---

### Complete Payment Flow

#### Step 1: User Selects Payment Method

On the checkout page, user selects "بطاقة ائتمان" (Credit Card):

**Frontend Implementation** (`CheckoutPage.jsx`):
```javascript
// Payment method selection
const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

// User selects credit card
<input 
  type="radio" 
  id="credit_card" 
  name="payment_method" 
  value="credit_card"
  checked={paymentMethod === 'credit_card'}
  onChange={() => handlePaymentMethodChange('credit_card')}
/>
```

**Available Payment Methods**:
- `cash_on_delivery` - Pay when order is delivered
- `credit_card` - Stripe Checkout (redirects to Stripe)
- `bank_transfer` - Manual bank transfer

---

#### Step 2: Order Submission

When user clicks "إتمام الطلب" (Complete Order), the order is created:

**Request to Backend**:
```javascript
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 99.99,
      "name": "Product Name"
    }
  ],
  "total_amount": 199.98,
  "shipping_address": {
    "street": "123 Main Street",
    "city": "Dubai",
    "state": "Dubai",
    "zip": "12345",
    "country": "AE",
    "name": "John Doe"
  },
  "payment_method": "credit_card",
  "notes": "Optional order notes"
}
```

**Frontend Code** (`CheckoutPage.jsx`):
```javascript
const handleSubmitOrder = async (e) => {
  e.preventDefault();
  
  const orderPayload = {
    items: cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    })),
    total_amount: cartTotal.price,
    shipping_address: shippingAddress,
    payment_method: paymentMethod, // 'credit_card'
    notes: notes.trim() || undefined
  };
  
  const response = await fetch(`${config.BACKEND_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(orderPayload)
  });
};
```

---

#### Step 3: Backend Creates Stripe Checkout Session

**Backend Process** (Laravel):
1. Validates order data
2. Creates order record in database with `status: pending` and `payment_status: pending`
3. If `payment_method === 'credit_card'`:
   - Creates Stripe Checkout Session using Stripe API
   - Configures success and cancel URLs
   - Associates session with order ID
   - Stores Stripe session ID in database
4. Returns order data with payment link

**Stripe Checkout Session Creation** (Backend):
```php
// Pseudo-code for backend
$checkoutSession = \Stripe\Checkout\Session::create([
    'payment_method_types' => ['card'],
    'line_items' => [[
        'price_data' => [
            'currency' => 'aed',
            'product_data' => [
                'name' => 'Order #' . $order->order_number,
            ],
            'unit_amount' => $order->total_amount * 100, // Convert to cents
        ],
        'quantity' => 1,
    ]],
    'mode' => 'payment',
    'success_url' => config('app.frontend_url') . '/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=' . $order->id,
    'cancel_url' => config('app.frontend_url') . '/payment/failure?session_id={CHECKOUT_SESSION_ID}&order_id=' . $order->id,
    'metadata' => [
        'order_id' => $order->id,
        'order_number' => $order->order_number,
    ],
]);

// Store session ID
$order->stripe_session_id = $checkoutSession->id;
$order->save();
```

**Success Response**:
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-2024-001",
      "status": "pending",
      "payment_status": "pending",
      "total": 199.98,
      "payment_method": "credit_card",
      "created_at": "2024-01-15T10:30:45.000000Z"
    },
    "payment_link": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6..."
  }
}
```

**Alternative Response Format**:
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD-2024-001",
      "payment_link": "https://checkout.stripe.com/pay/cs_test_..."
    },
    "payment_link": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

**Note**: Payment link may be in `data.payment_link` or `data.order.payment_link`

---

#### Step 4: Frontend Receives Payment Link

**Frontend Handling** (`CheckoutPage.jsx`):
```javascript
const data = await response.json();

if (!response.ok) {
  throw new Error(data.message || 'فشل في إنشاء الطلب');
}

// Set order data
setOrderData(data.data.order);
setOrderSuccess(true);

// Store order data in localStorage for fallback
localStorage.setItem('lastOrderData', JSON.stringify(data.data.order));

// Check if payment link is returned (for credit card payments)
if (paymentMethod === 'credit_card' && 
    (data.data.payment_link || data.data.order.payment_link)) {
  const paymentUrl = data.data.payment_link || data.data.order.payment_link;
  setPaymentLink(paymentUrl);
  
  // Show payment redirection message
  setRedirectingToPayment(true);
  
  // Clear cart after successful order creation
  clearCart();
  
  return; // Don't show success page yet
}

// For non-credit card payments, show success directly
clearCart();
```

---

#### Step 5: Redirect to Stripe Checkout

**Redirect Screen** (shown to user):
- Displays order number
- Shows countdown timer (3 seconds)
- Provides manual redirect button
- Auto-redirects after countdown

**Frontend Implementation**:
```javascript
// Countdown timer for auto-redirect
useEffect(() => {
  let timer;
  if (redirectingToPayment && secondsToRedirect > 0) {
    timer = setTimeout(() => {
      setSecondsToRedirect(seconds => seconds - 1);
    }, 1000);
  } else if (redirectingToPayment && secondsToRedirect === 0 && paymentLink) {
    // Auto-redirect to Stripe
    window.location.href = paymentLink;
  }
  
  return () => clearTimeout(timer);
}, [redirectingToPayment, secondsToRedirect, paymentLink]);

// Manual redirect handler
const handleManualRedirect = () => {
  if (paymentLink) {
    window.location.href = paymentLink;
  }
};
```

**UI Display**:
```javascript
if (redirectingToPayment && paymentLink) {
  return (
    <div className="payment-redirect">
      <h1>تم إنشاء الطلب بنجاح!</h1>
      <p>رقم الطلب: <strong>{orderData.order_number}</strong></p>
      <p>سيتم تحويلك إلى صفحة الدفع خلال <strong>{secondsToRedirect}</strong> ثواني...</p>
      
      <div className="redirect-spinner">
        <FontAwesomeIcon icon={faSpinner} spin />
      </div>
      
      <button onClick={handleManualRedirect}>
        <FontAwesomeIcon icon={faExternalLinkAlt} />
        الدفع الآن
      </button>
    </div>
  );
}
```

---

#### Step 6: User Completes Payment on Stripe

**Stripe Checkout Page**:
- User enters card details on Stripe's secure hosted page
- Stripe processes the payment
- Stripe validates card and processes transaction
- Stripe redirects back to your application

**Stripe Redirect URLs** (configured on backend):
- **Success**: `https://yoursite.com/payment/success?session_id=cs_test_...&order_id=1`
- **Failure/Cancel**: `https://yoursite.com/payment/failure?session_id=cs_test_...&order_id=1`

**URL Parameters**:
- `session_id` (required): Stripe Checkout Session ID
- `order_id` (optional): Order ID for reference

---

#### Step 7: Payment Verification

**On Success Page** (`PaymentSuccessPage.jsx`):

**Extract URL Parameters**:
```javascript
useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  
  if (sessionId) {
    verifyPayment(sessionId, orderId);
  } else {
    // Fallback: try to get order from localStorage
    tryGetOrderFromStorage();
  }
}, [location]);
```

**Verify Payment**:
```javascript
const verifyPayment = (sessionId, orderId) => {
  setIsLoading(true);
  
  fetch(`${config.BACKEND_URL}/api/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      session_id: sessionId,
      order_id: orderId
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      setPaymentVerified(true);
      setOrderData(data.data.order);
      setOrderNumber(data.data.order.order_number);
      
      // Update stored order data
      localStorage.setItem('lastOrderData', JSON.stringify(data.data.order));
    } else {
      setVerificationError(data.message || 'فشل في التحقق من حالة الدفع');
      tryGetOrderFromStorage(); // Fallback
    }
  })
  .catch(error => {
    console.error('Error verifying payment:', error);
    setVerificationError('حدث خطأ أثناء التحقق من حالة الدفع');
    tryGetOrderFromStorage(); // Fallback
  })
  .finally(() => {
    setIsLoading(false);
  });
};
```

**Backend Verification Process** (`POST /api/payments/verify`):

1. **Receives Request**:
   ```json
   {
     "session_id": "cs_test_a1b2c3d4e5f6",
     "order_id": 1
   }
   ```

2. **Retrieves Stripe Session**:
   ```php
   // Backend pseudo-code
   $session = \Stripe\Checkout\Session::retrieve($sessionId);
   ```

3. **Validates Session**:
   - Checks session exists
   - Verifies session belongs to order
   - Checks payment status

4. **Updates Order**:
   ```php
   if ($session->payment_status === 'paid') {
     $order->payment_status = 'completed';
     $order->status = 'confirmed'; // or 'processing'
     $order->paid_at = now();
     $order->save();
     
     // Create payment record
     Payment::create([
       'order_id' => $order->id,
       'transaction_id' => $session->payment_intent,
       'amount' => $session->amount_total / 100,
       'status' => 'completed',
       'payment_method' => 'credit_card',
       'stripe_session_id' => $sessionId,
     ]);
   }
   ```

5. **Returns Updated Order**:
   ```json
   {
     "success": true,
     "message": "Payment verified successfully",
     "data": {
       "order": {
         "id": 1,
         "order_number": "ORD-2024-001",
         "status": "confirmed",
         "payment_status": "completed",
         "total": 199.98,
         "paid_at": "2024-01-15T10:35:20.000000Z"
       },
       "payment": {
         "id": 1,
         "transaction_id": "pi_1234567890",
         "amount": 199.98,
         "status": "completed"
       }
     }
   }
   ```

---

#### Step 8: Success/Failure Handling

**Success Page** (`PaymentSuccessPage.jsx`):

**Display**:
- Success checkmark icon
- Order number
- Payment verified status
- Success message
- Action buttons (View Orders, Continue Shopping, Go Home)

**Code**:
```javascript
return (
  <div className="payment-page success-page">
    <div className="success-checkmark">
      <FontAwesomeIcon icon={faCircleCheck} />
    </div>
    
    <h1>شكراً لك!</h1>
    <h2>تم استلام طلبك بنجاح</h2>
    
    {orderNumber && (
      <div className="order-info">
        <p>رقم الطلب: <strong>{orderNumber}</strong></p>
        {paymentVerified && (
          <div className="payment-verified">
            <FontAwesomeIcon icon={faCheck} />
            تم تأكيد الدفع
          </div>
        )}
      </div>
    )}
    
    {verificationError && (
      <div className="verification-error">
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <p>{verificationError}</p>
        <p>سنقوم بالتحقق من حالة الدفع يدوياً وتحديث طلبك.</p>
      </div>
    )}
    
    <div className="payment-actions">
      <button onClick={() => navigate('/profile')}>
        عرض طلباتي
      </button>
      <button onClick={() => navigate('/products')}>
        مواصلة التسوق
      </button>
    </div>
  </div>
);
```

**Failure Page** (`PaymentFailurePage.jsx`):

**Display**:
- Failure icon
- Error message
- Order number (if available)
- Retry button
- Action buttons

**Code**:
```javascript
return (
  <div className="payment-page failure-page">
    <div className="failure-checkmark">
      <FontAwesomeIcon icon={faCircleXmark} />
    </div>
    
    <h1>فشل عملية الدفع</h1>
    <h2>{errorMessage}</h2>
    
    {orderNumber && (
      <div className="order-info">
        <p>رقم الطلب: <strong>{orderNumber}</strong></p>
      </div>
    )}
    
    <div className="payment-actions">
      <button onClick={handleRetryPayment}>
        <FontAwesomeIcon icon={faCreditCard} />
        إعادة المحاولة
      </button>
      <button onClick={() => navigate('/profile')}>
        عرض طلباتي
      </button>
    </div>
  </div>
);
```

**Retry Payment Handler**:
```javascript
const handleRetryPayment = () => {
  if (orderData && orderData.id) {
    // Redirect to checkout with existing order ID
    navigate(`/checkout?order_id=${orderData.id}`);
  } else {
    navigate('/checkout');
  }
};
```

---

### Retry Payment Flow

**Scenario**: User's payment fails or is cancelled, wants to retry

**Process**:

1. **User clicks "Retry Payment"** on failure page
2. **Redirects to checkout** with `order_id` parameter:
   ```
   /checkout?order_id=1
   ```

3. **Checkout page detects order_id**:
   ```javascript
   useEffect(() => {
     const searchParams = new URLSearchParams(location.search);
     const orderId = searchParams.get('order_id');
     
     if (orderId) {
       setExistingOrderId(orderId);
       fetchExistingOrder(orderId);
     }
   }, [location]);
   ```

4. **Fetches existing order**:
   ```javascript
   const fetchExistingOrder = async (orderId) => {
     const response = await fetch(`${config.BACKEND_URL}/api/orders/${orderId}`, {
       headers: {
         'Authorization': `Bearer ${localStorage.getItem('token')}`
       }
     });
     
     const data = await response.json();
     if (data.success) {
       setOrderData(data.data.order);
       // Pre-fill form with order data
       setPaymentMethod(data.data.order.payment_method);
       setNotes(data.data.order.notes);
     }
   };
   ```

5. **User resubmits order** with `order_id` in payload:
   ```javascript
   const orderPayload = {
     items: orderItems,
     total_amount: cartTotal.price,
     shipping_address: shippingAddress,
     payment_method: paymentMethod,
     notes: notes
   };
   
   // Include existing order ID
   if (existingOrderId) {
     orderPayload.order_id = existingOrderId;
   }
   ```

6. **Backend updates existing order** instead of creating new one:
   - Updates order items if changed
   - Creates new Stripe Checkout Session
   - Returns new payment link
   - User redirected to Stripe again

---

### Order Data Storage

**LocalStorage Usage**:

Order data is stored in localStorage as fallback:

```javascript
// After order creation
localStorage.setItem('lastOrderData', JSON.stringify(orderData));

// On success/failure page
const tryGetOrderFromStorage = () => {
  const storedOrderData = localStorage.getItem('lastOrderData');
  if (storedOrderData) {
    try {
      const orderData = JSON.parse(storedOrderData);
      setOrderData(orderData);
      setOrderNumber(orderData.order_number);
    } catch (e) {
      console.error('Error parsing order data:', e);
    }
  }
};
```

**Used When**:
- API verification fails
- Network connectivity issues
- User closes browser before verification completes
- Payment gateway redirects but API call fails

---

### Security Features

1. **Token-Based Authentication**:
   - All API calls require Bearer token
   - Token validated on backend
   - Unauthorized requests rejected

2. **Server-Side Verification**:
   - Payment status verified on backend, not frontend
   - Frontend cannot manipulate payment status
   - Backend calls Stripe API directly

3. **Session Validation**:
   - Backend validates Stripe session before updating order
   - Ensures session belongs to correct order
   - Prevents session ID manipulation

4. **Order Ownership**:
   - Backend ensures user owns the order
   - Prevents unauthorized order updates
   - Validates user ID matches order user ID

5. **HTTPS Only**:
   - All Stripe redirects use HTTPS
   - Secure transmission of payment data
   - PCI compliance maintained

---

### Error Handling

#### Network Errors

**Frontend Handling**:
```javascript
.catch(error => {
  console.error('Error verifying payment:', error);
  setIsLoading(false);
  setVerificationError('حدث خطأ أثناء التحقق من حالة الدفع');
  
  // Fallback to localStorage
  tryGetOrderFromStorage();
});
```

**User Experience**:
- Shows error message
- Falls back to localStorage order data
- Allows user to contact support
- Provides manual retry option

---

#### Payment Verification Errors

**Error Response**:
```json
{
  "success": false,
  "error": "Payment verification failed",
  "message": "Invalid session ID or order ID"
}
```

**Frontend Handling**:
```javascript
if (!data.success) {
  setVerificationError(data.message || 'فشل في التحقق من حالة الدفع');
  tryGetOrderFromStorage(); // Still show order info
}
```

**User Experience**:
- Shows verification error
- Still displays order information
- Informs user that manual verification will occur
- Provides support contact information

---

#### Stripe Redirect Issues

**Manual Redirect Button**:
- Always available on redirect screen
- Allows immediate redirect if auto-redirect fails
- Provides user control

**Countdown Timer**:
- 3-second countdown before auto-redirect
- Gives user time to read information
- Prevents accidental redirects

**Clear Instructions**:
- Arabic text explaining redirect
- Visual indicators (spinner, icons)
- User-friendly messaging

---

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User selects "Credit Card" payment method              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. User clicks "Complete Order"                           │
│    POST /api/orders                                        │
│    { payment_method: "credit_card", ... }                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend creates order & Stripe Checkout Session         │
│    - Creates order record (status: pending)                │
│    - Creates Stripe Checkout Session                       │
│    - Stores session_id in order                            │
│    - Returns payment_link                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Frontend receives payment_link                           │
│    - Stores order in localStorage                          │
│    - Shows redirect screen (3 second countdown)            │
│    - Clears cart                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Redirect to Stripe Checkout                             │
│    window.location.href = payment_link                     │
│    → https://checkout.stripe.com/pay/cs_test_...          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. User completes payment on Stripe                        │
│    - Enters card details                                   │
│    - Stripe processes payment                              │
│    - Stripe redirects back                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ Success Redirect │    │ Failure Redirect │
│ /payment/success │    │ /payment/failure │
│ ?session_id=...  │    │ ?session_id=...  │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Payment Verification                                     │
│    POST /api/payments/verify                                │
│    { session_id, order_id }                                │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ Backend verifies │    │ Backend verifies │
│ with Stripe API  │    │ with Stripe API  │
│ Status: paid     │    │ Status: failed   │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ Update order:    │    │ Order remains    │
│ - payment_status │    │ pending          │
│   = completed    │    │                  │
│ - status =       │    │                  │
│   confirmed      │    │                  │
└────────┬─────────┘    └────────┬─────────┘
         │                       │
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│ Success Page     │    │ Failure Page     │
│ - Order number   │    │ - Error message  │
│ - Verified       │    │ - Retry button   │
│ - Actions        │    │ - Actions        │
└──────────────────┘    └──────────────────┘
```

---

### API Endpoints Summary

#### POST /api/orders
**Purpose**: Create order and get Stripe payment link

**Request**:
```json
{
  "payment_method": "credit_card",
  "items": [...],
  "total_amount": 199.98,
  "shipping_address": {...}
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order": {...},
    "payment_link": "https://checkout.stripe.com/pay/..."
  }
}
```

---

#### POST /api/payments/verify
**Purpose**: Verify payment status after Stripe redirect

**Request**:
```json
{
  "session_id": "cs_test_...",
  "order_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "order": {
      "payment_status": "completed",
      "status": "confirmed"
    },
    "payment": {...}
  }
}
```

---

### Testing Stripe Integration

**Test Mode**:
- Use Stripe test API keys
- Test card numbers: `4242 4242 4242 4242`
- Test expiration: Any future date
- Test CVC: Any 3 digits

**Test Scenarios**:
1. Successful payment
2. Payment failure
3. Payment cancellation
4. Network errors during verification
5. Invalid session ID
6. Order not found

---

### Important Notes

1. **Payment Link Format**: Payment link is a Stripe Checkout Session URL
   - Format: `https://checkout.stripe.com/pay/cs_test_...` or `https://checkout.stripe.com/c/pay/cs_test_...`
   - Contains session ID in URL
   - Expires after 24 hours (Stripe default)

2. **Session ID**: Stripe Checkout Session ID
   - Format: `cs_test_...` (test mode) or `cs_live_...` (live mode)
   - Used for payment verification
   - Stored in order record on backend

3. **Order Status Flow**:
   - `pending` → Order created, payment pending
   - `confirmed` → Payment verified, order confirmed
   - `processing` → Order being prepared
   - `shipped` → Order shipped
   - `completed` → Order delivered
   - `cancelled` → Order cancelled

4. **Payment Status Flow**:
   - `pending` → Payment not yet completed
   - `completed` → Payment successful
   - `failed` → Payment failed
   - `refunded` → Payment refunded

5. **Cart Clearing**: Cart is cleared immediately after order creation, not after payment verification
   - Prevents duplicate orders
   - User can retry payment if needed
   - Order already exists in system

6. **LocalStorage Fallback**: Order data stored in localStorage
   - Key: `lastOrderData`
   - Used if API verification fails
   - Provides better user experience

7. **Retry Mechanism**: Failed payments can be retried
   - User redirected to checkout with `order_id`
   - Backend updates existing order
   - New Stripe session created
   - User redirected to Stripe again

---

## Error Handling

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error description",
  "code": "ERROR_CODE",
  "errors": {
    "field_name": [
      "Field-specific error message 1",
      "Field-specific error message 2"
    ]
  }
}
```

### HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request parameters
- **401 Unauthenticated**: No valid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation failed
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Error Types

#### Validation Error (422)
```json
{
  "success": false,
  "error": "Validation failed",
  "message": "The provided data is invalid.",
  "errors": {
    "email": [
      "The email has already been taken."
    ],
    "password": [
      "The password must be at least 8 characters.",
      "The password must contain at least one uppercase letter."
    ]
  },
  "code": "VALIDATION_ERROR"
}
```

**Frontend Handling**:
- Maps API field names to form field names
- Displays field-specific errors next to input fields
- Shows general error message at top of form

---

#### Authentication Error (401)
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "You must be authenticated to access this resource.",
  "code": "UNAUTHENTICATED"
}
```

**Frontend Handling**:
- Automatically clears token from localStorage
- Redirects to login page (if not already on login page)
- Prevents infinite redirect loops

---

#### Authorization Error (403)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "You do not have permission to perform this action.",
  "code": "UNAUTHORIZED"
}
```

---

#### Not Found Error (404)
```json
{
  "success": false,
  "error": "Not Found",
  "message": "The requested resource was not found.",
  "code": "NOT_FOUND"
}
```

---

#### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Too Many Requests",
  "message": "You have exceeded the rate limit. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**Response Headers**:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1642248000
```

---

#### Network Error
When no response is received from server:

**Frontend Handling**:
```javascript
{
  message: "لا يمكن الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.",
  originalError: error
}
```

---

### Frontend Error Handling Patterns

#### Request Interceptor
```javascript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

#### Response Interceptor
```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error message'
      });
    }
    
    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect logic
    }
    
    // Return standardized error format
    return Promise.reject(error.response?.data || error);
  }
);
```

---

## Rate Limiting

### Rate Limit Tiers

1. **Public Endpoints** (`/api/categories`, `/api/products`, `/api/services`)
   - Limit: 60 requests per minute
   - No authentication required

2. **Authentication Endpoints** (`/api/login`, `/api/register`)
   - Limit: 10 requests per minute
   - Prevents brute-force attacks

3. **Authenticated User Endpoints** (`/api/user`, `/api/orders`, `/api/addresses`)
   - Limit: 100 requests per minute per user
   - Requires valid authentication token

4. **Admin Endpoints** (`/api/admin/*`)
   - Limit: 30 requests per minute
   - Requires admin role

### Rate Limit Headers

All responses include rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1642248000
```

### Handling Rate Limits

When rate limit is exceeded:
1. Return 429 status code
2. Include retry-after information in headers
3. Frontend should display user-friendly message
4. Implement exponential backoff for retries

---

## Security

### Authentication

- **Token Storage**: JWT tokens stored in `localStorage`
- **Token Format**: `Bearer {token}` in Authorization header
- **Token Expiration**: Tokens expire based on server configuration
- **Auto-Logout**: Automatically clears token on 401 responses

### HTTPS

- All API requests must use HTTPS
- Base URL uses `https://` protocol

### CORS

- CORS configured on server
- Allows requests from frontend domain
- Credentials included in requests

### Input Validation

- All inputs validated on server
- Field-specific validation errors returned
- Frontend performs client-side validation before submission

### XSS Protection

- All user inputs sanitized
- JSON responses properly encoded
- No direct HTML injection

### CSRF Protection

- Token-based CSRF protection
- Sanctum handles CSRF tokens
- Same-site cookie attributes

---

## Image URLs

### Image URL Construction

Images are served from the backend storage:

**Base URL**: `https://admin.buildingzuae.com/storage/`

**Image Path Format**: `{BACKEND_URL}/storage/{image_path}`

**Example**:
```
https://admin.buildingzuae.com/storage/products/product1.jpg
```

**Frontend Utility**:
```javascript
getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${BACKEND_URL}/storage/${imagePath}`;
}
```

---

## Request Timeouts

- **Default Timeout**: 15 seconds (15000ms)
- **Service Builder Timeout**: 10 seconds (10000ms)
- **Search Timeout**: 10 seconds (10000ms)

---

## Pagination

### Standard Pagination Format

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 100,
    "per_page": 20,
    "current_page": 1,
    "last_page": 5,
    "from": 1,
    "to": 20
  }
}
```

### Pagination Parameters

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 15, max: 50)

---

## Date Formats

All dates are returned in ISO 8601 format:

```
2024-01-15T10:30:45.000000Z
```

**Frontend Parsing**:
```javascript
new Date("2024-01-15T10:30:45.000000Z")
```

---

## File Uploads

### Supported Formats

- Images: JPG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX
- Maximum file size: 10MB (configurable)

### Upload Endpoint

Service Builder orders support file uploads:

**Content-Type**: `multipart/form-data`

**Request Format**:
```javascript
const formData = new FormData();
formData.append('service_id', 1);
formData.append('options', JSON.stringify({...}));
formData.append('files', file1);
formData.append('files', file2);
```

---

## WebSocket / Real-time Updates

Currently not implemented. All updates require polling or manual refresh.

---

## API Versioning

Current version: **v1**

Future versions will use URL prefix:
- `/api/v1/...`
- `/api/v2/...`

---

## Support & Contact

- **API Documentation**: This file
- **Base URL**: `https://admin.buildingzuae.com/api`
- **Support Email**: api-support@buildingz.com

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Authentication endpoints
- User management
- Product and service endpoints
- Order management
- Service builder
- Search functionality
- Notifications system
- Payment verification

---

## Notes

1. **Field Name Mapping**: Frontend uses camelCase (`fullName`), backend uses snake_case (`name`). Mapping handled in service layer.

2. **Error Handling**: All services implement consistent error handling with fallback responses to prevent app crashes.

3. **Response Format Variations**: Some endpoints return `data` directly, others wrap in `data.data`. Frontend handles both formats.

4. **Authentication**: Token automatically added to all requests via axios interceptors.

5. **Image URLs**: All image paths are relative and must be prefixed with backend URL and `/storage/` path.

6. **Service Builder**: Uses separate base URL `/service-builder` but shares authentication.

7. **LocalStorage**: Used for token storage, user data, and temporary order data.

8. **Geolocation**: Address service supports browser geolocation API with Google Maps integration (optional).

---

**End of Documentation**
