# BuildingZ Marketplace API Documentation (Detailed Specification)

## Overview
This documentation provides a comprehensive guide to the BuildingZ Marketplace API, covering authentication, endpoints, and usage details.

## Base URL
All API endpoints are prefixed with `/api`

## Authentication

### Authentication Endpoints
- `POST /api/register`: User registration
- `POST /api/login`: User login
- `POST /api/logout`: User logout
- `POST /api/logout-all`: Logout from all devices
- `GET /api/user`: Get authenticated user details

### Authentication Strategies
- JWT (JSON Web Token) authentication using Laravel Sanctum
- Role-based access control
- Rate limiting applied to different endpoint groups

## Rate Limiting
- Public routes: Throttled at `api` rate limit
- Authentication routes: Throttled at `auth` rate limit
- Authenticated routes: Throttled at `authenticated` rate limit

## Endpoint Categories

### Public Endpoints
These endpoints are accessible without authentication:

#### Categories
- `GET /api/categories`
  - Description: Retrieve all categories
  - Response: List of categories with id, name, description
  - Authentication: None required

- `GET /api/categories/{category_id}`
  - Description: Retrieve a specific category
  - Response: Detailed category information
  - Authentication: None required

#### Products
- `GET /api/products`
  - Description: Retrieve all products
  - Response: List of products
  - Authentication: None required

- `GET /api/products/{product_id}`
  - Description: Retrieve a specific product
  - Response: Detailed product information
  - Authentication: None required

### Authenticated User Endpoints
Requires authentication with a valid Sanctum token:

#### User Profile
- `GET /api/user`
  - Description: Get authenticated user details
  - Authentication: Required

- `PUT /api/profile`
  - Description: Update user profile
  - Authentication: Required

- `PUT /api/notification-preferences`
  - Description: Update user notification preferences
  - Authentication: Required

- `DELETE /api/account`
  - Description: Delete user account
  - Authentication: Required

#### Orders
- `POST /api/orders`
  - Description: Create a new order
  - Authentication: Required

- `GET /api/orders/{order_id}`
  - Description: Get specific order details
  - Authentication: Required

- `GET /api/my-orders`
  - Description: Get user's order history
  - Authentication: Required

#### Service Requests
- `POST /api/service-requests`
  - Description: Create a new service request
  - Authentication: Required

- `GET /api/service-requests/{request_id}`
  - Description: Get specific service request details
  - Authentication: Required

- `GET /api/my-service-requests`
  - Description: Get user's service request history
  - Authentication: Required

#### Reviews
- `POST /api/products/{product_id}/reviews`
  - Description: Add a review for a product
  - Authentication: Required

- `POST /api/service-requests/{request_id}/reviews`
  - Description: Add a review for a service request
  - Authentication: Required

### Admin Endpoints
Requires authentication with an admin role:

#### Category Management
- `POST /api/admin/categories`
  - Description: Create a new category
  - Authentication: Admin role required
  - Request Body:
    ```json
    {
      "name": "Category Name",
      "description": "Optional category description"
    }
    ```

#### User Management
- `GET /api/admin/dashboard`
  - Description: Admin dashboard overview
  - Authentication: Admin role required

- `GET /api/admin/users`
  - Description: List all users
  - Authentication: Admin role required

- `POST /api/admin/create-admin`
  - Description: Create a new admin user
  - Authentication: Admin role required

#### Vendor Management
- `PUT /api/admin/vendors/{vendor_id}/verify`
  - Description: Verify a vendor profile
  - Authentication: Admin role required

#### Handyman Management
- `PUT /api/admin/handymen/{handyman_id}/verify`
  - Description: Verify a handyman profile
  - Authentication: Admin role required

#### Order and Service Request Management
- `GET /api/admin/orders`
  - Description: List all orders
  - Authentication: Admin role required

- `GET /api/admin/service-requests`
  - Description: List all service requests
  - Authentication: Admin role required

### Vendor Endpoints
Requires authentication with a verified vendor role:

#### Product Management
- `POST /api/vendor/products`
  - Description: Create a new product
  - Authentication: Verified vendor role required

- `PUT /api/vendor/products/{product_id}`
  - Description: Update an existing product
  - Authentication: Verified vendor role required

#### Vendor Dashboard
- `GET /api/vendor/dashboard`
  - Description: Vendor dashboard overview
  - Authentication: Verified vendor role required

- `GET /api/vendor/orders`
  - Description: List vendor's orders
  - Authentication: Verified vendor role required

- `GET /api/vendor/service-requests`
  - Description: List vendor's service requests
  - Authentication: Verified vendor role required

### Handyman Endpoints
Requires authentication with a verified handyman role:

#### Service Request Management
- `GET /api/handyman/service-requests`
  - Description: List assigned service requests
  - Authentication: Verified handyman role required

- `PUT /api/handyman/service-requests/{request_id}/update-status`
  - Description: Update service request status
  - Authentication: Verified handyman role required

- `POST /api/handyman/service-requests/{request_id}/complete`
  - Description: Mark service request as completed
  - Authentication: Verified handyman role required

## Error Handling
All error responses follow a consistent JSON structure:
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error description",
  "code": 400
}
```

## Authentication Errors
- 401 Unauthenticated: No valid authentication token
- 403 Unauthorized: Insufficient permissions

## Validation Errors
- 422 Unprocessable Entity: Validation failed for input data

## Rate Limit Errors
- 429 Too Many Requests: Exceeded rate limit

## Security Considerations
- All sensitive endpoints require authentication
- Role-based access control
- Rate limiting to prevent abuse
- HTTPS encryption
- Token-based authentication

## Versioning
Current API Version: v1
Prefix: `/api/v1/`

## Support
For any questions or support, please contact our support team at support@buildingz.com

## Authentication Endpoints

### User Registration
- **Endpoint**: `POST /api/register`
- **Description**: Create a new user account

#### Request Body
```json
{
  "name": "John Doe",                  // Required, string, max:255
  "email": "john.doe@example.com",     // Required, valid email, unique:users
  "password": "StrongPassword123!",    // Required, min:8, confirmed
  "password_confirmation": "StrongPassword123!", // Must match password
  "phone": "+1234567890",              // Optional, string, valid phone number
  "role": "customer"                   // Optional, default: customer
}
```

#### Validation Rules
- `name`: Required, string, max 255 characters
- `email`: Required, valid email format, unique in users table
- `password`: Required, minimum 8 characters, must include:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- `phone`: Optional, must be a valid phone number format

#### Successful Response (201 Created)
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

#### Error Responses
1. Validation Error (422 Unprocessable Entity)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### User Login
- **Endpoint**: `POST /api/login`
- **Description**: Authenticate user and generate access token

#### Request Body
```json
{
  "email": "john.doe@example.com",     // Required, must exist in users table
  "password": "StrongPassword123!",    // Required, must match stored password
  "device_name": "iPhone 13 Pro"       // Optional, helps track device
}
```

#### Successful Response (200 OK)
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

### Categories Endpoint

#### List Categories
- **Endpoint**: `GET /api/categories`
- **Description**: Retrieve all active categories
- **Authentication**: Not required

#### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Home Repair",
      "description": "Services for home maintenance and repair",
      "icon": "home-repair.svg",
      "total_services": 24,
      "active_services": 18
    },
    {
      "id": 2,
      "name": "Cleaning Services",
      "description": "Professional cleaning for homes and offices",
      "icon": "cleaning.svg", 
      "total_services": 15,
      "active_services": 12
    }
  ],
  "meta": {
    "total_categories": 2,
    "active_categories": 2
  }
}
```

#### Get Single Category
- **Endpoint**: `GET /api/categories/{category_id}`
- **Description**: Retrieve detailed information about a specific category
- **Authentication**: Not required

#### Successful Response (200 OK)
```json
{
  "success": true,
  "message": "Category retrieved successfully", 
  "data": {
    "id": 1,
    "name": "Home Repair",
    "description": "Comprehensive home maintenance services",
    "icon": "home-repair.svg",
    "services": [
      {
        "id": 101,
        "name": "Plumbing Repair",
        "description": "Professional plumbing services",
        "average_price": 150.00,
        "estimated_duration": "2-3 hours"
      },
      {
        "id": 102,
        "name": "Electrical Maintenance",
        "description": "Electrical system checkup and repairs",
        "average_price": 200.00,
        "estimated_duration": "1-2 hours"
      }
    ],
    "meta": {
      "total_services": 2,
      "active_services": 2
    }
  }
}
```

#### Create Category (Admin Only)
- **Endpoint**: `POST /api/admin/categories`
- **Description**: Create a new category
- **Authentication**: Admin token required

#### Request Body
```json
{
  "name": "Landscaping",                // Required, unique, max:255
  "description": "Garden and outdoor maintenance", // Optional
  "icon": "landscaping.svg",            // Optional
  "is_active": true                     // Optional, default: true
}
```

#### Validation Rules
- `name`: Required, unique in categories table, max 255 characters
- `description`: Optional, string
- `icon`: Optional, must be a valid SVG file path
- `is_active`: Optional, boolean

#### Successful Response (201 Created)
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 3,
    "name": "Landscaping",
    "description": "Garden and outdoor maintenance",
    "icon": "landscaping.svg",
    "is_active": true,
    "created_at": "2024-01-15T12:45:30.000000Z"
  }
}
```

#### Error Responses
1. Unauthorized (403 Forbidden)
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Only administrators can create categories",
  "code": 403
}
```

2. Validation Error (422 Unprocessable Entity)
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "The given data was invalid.",
  "errors": {
    "name": ["The category name has already been taken."]
  }
}
```

## Advanced Error Handling

### Common Error Codes
- `200`: Successful request
- `201`: Resource created successfully
- `400`: Bad request
- `401`: Unauthenticated
- `403`: Unauthorized (insufficient permissions)
- `404`: Resource not found
- `422`: Validation error
- `500`: Internal server error

### Error Response Structure
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed human-readable error description",
  "code": 400,
  "errors": {
    "field_name": ["Specific error details"]
  }
}
```

## Rate Limiting Details

### Rate Limit Tiers
1. **Public Endpoints**: 
   - 60 requests per minute
   - No authentication required

2. **Authentication Endpoints**:
   - 10 requests per minute
   - Prevents brute-force attacks

3. **Authenticated User Endpoints**:
   - 100 requests per minute
   - Per-user rate limiting

4. **Admin Endpoints**:
   - 30 requests per minute
   - Strict rate limiting for sensitive operations

### Rate Limit Headers
- `X-RateLimit-Limit`: Total allowed requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time until rate limit resets

## Security Recommendations

1. Always use HTTPS
2. Store tokens securely
3. Implement token rotation
4. Use strong, unique passwords
5. Enable two-factor authentication
6. Regularly audit and rotate API credentials

## Changelog
- `v1.0.0`: Initial API release
- `v1.1.0`: Added detailed category endpoints
- `v1.2.0`: Enhanced error reporting

## Support
- Email: api-support@buildingz.com
- Documentation Version: 1.2.0
- Last Updated: 2024-01-15 